import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FynLogo from "@/components/FynLogo";
import { toast } from "sonner";
import { Check, X, Eye, EyeOff, MailWarning, Mail } from "lucide-react";

// Parse Supabase auth error info from the URL hash/query (set when a recovery
// link is invalid or expired). Returns a normalized reason we can map to copy.
type LinkFailureReason = "expired" | "invalid" | "used" | "unknown";

const parseLinkFailure = (): { reason: LinkFailureReason; description?: string } | null => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const hashParams = new URLSearchParams(hash);
  const queryParams = new URLSearchParams(window.location.search);
  const get = (k: string) => hashParams.get(k) ?? queryParams.get(k);

  const error = get("error");
  const errorCode = get("error_code");
  const description = get("error_description")?.replace(/\+/g, " ") ?? undefined;
  if (!error && !errorCode) return null;

  if (errorCode === "otp_expired" || /expired/i.test(description ?? "")) {
    return { reason: "expired", description };
  }
  if (errorCode === "access_denied") {
    return { reason: "invalid", description };
  }
  if (/used/i.test(description ?? "")) {
    return { reason: "used", description };
  }
  return { reason: "unknown", description };
};

// Password policy ----------------------------------------------------------
type RuleKey = "length" | "upper" | "lower" | "digit" | "symbol" | "noSpaces";

interface Rule {
  key: RuleKey;
  label: string;
  test: (pw: string) => boolean;
}

const RULES: Rule[] = [
  { key: "length", label: "At least 10 characters", test: (p) => p.length >= 10 },
  { key: "upper", label: "An uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "A lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { key: "digit", label: "A number (0–9)", test: (p) => /\d/.test(p) },
  { key: "symbol", label: "A symbol (e.g. ! @ # $ %)", test: (p) => /[^A-Za-z0-9]/.test(p) },
  { key: "noSpaces", label: "No leading or trailing spaces", test: (p) => p.length === 0 || p === p.trim() },
];

const COMMON_WEAK = new Set([
  "password", "password1", "password123", "qwerty", "qwerty123",
  "12345678", "123456789", "1234567890", "letmein", "welcome",
  "admin", "iloveyou", "abc12345", "monkey", "dragon",
]);

const evaluateStrength = (pw: string, passedCount: number) => {
  if (!pw) return { score: 0, label: "", color: "bg-fyn-ink-10" };
  if (COMMON_WEAK.has(pw.toLowerCase())) {
    return { score: 1, label: "Too common", color: "bg-fyn-red" };
  }
  // Score = passed rules + a length bonus
  let score = passedCount;
  if (pw.length >= 14) score += 1;
  if (pw.length >= 18) score += 1;
  if (score <= 2) return { score: 1, label: "Weak", color: "bg-fyn-red" };
  if (score <= 4) return { score: 2, label: "Fair", color: "bg-fyn-gold" };
  if (score <= 6) return { score: 3, label: "Strong", color: "bg-fyn-success" };
  return { score: 4, label: "Excellent", color: "bg-fyn-success" };
};
// --------------------------------------------------------------------------

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resentTo, setResentTo] = useState<string | null>(null);
  const [linkFailure, setLinkFailure] = useState<LinkFailureReason | null>(null);
  const resendInputRef = useRef<HTMLInputElement>(null);

  const focusResendInput = () => {
    // Defer to ensure the field is mounted in the DOM
    setTimeout(() => {
      resendInputRef.current?.focus();
      resendInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = resendEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    const toastId = "reset-resend";
    toast.loading("Sending a new reset link…", { id: toastId });
    setResending(true);
    const { error: resendErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResending(false);
    if (resendErr) {
      toast.error(resendErr.message || "Could not send reset link.", { id: toastId });
      return;
    }
    setResentTo(email);
    toast.success("If that email exists, a new reset link is on its way.", { id: toastId });
  };

  useEffect(() => {
    const verifyToastId = "reset-verify";
    let resolved = false;

    // 1) Detect explicit failure info in the URL first (Supabase appends
    //    error_code=otp_expired etc. when the recovery link is bad).
    const urlFailure = parseLinkFailure();
    if (urlFailure) {
      setLinkFailure(urlFailure.reason);
      setReady(true);
      resolved = true;
      toast.error(
        urlFailure.reason === "expired"
          ? "This reset link has expired."
          : "This reset link is invalid.",
        { id: verifyToastId }
      );
      // Clear the noisy hash/query so a refresh doesn't re-trigger the same toast.
      try {
        window.history.replaceState(null, "", window.location.pathname);
      } catch {
        /* no-op */
      }
      return;
    }

    toast.loading("Verifying your reset link…", { id: verifyToastId });

    const resolve = (ok: boolean, reason: LinkFailureReason = "invalid") => {
      if (resolved) return;
      resolved = true;
      setReady(true);
      if (ok) {
        toast.success("Reset link verified. Choose a new password.", { id: verifyToastId });
      } else {
        setLinkFailure(reason);
        toast.error(
          reason === "expired"
            ? "This reset link has expired."
            : "This reset link is invalid or has expired.",
          { id: verifyToastId }
        );
      }
    };

    // Supabase v2 will pick up the recovery session from the URL hash automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setValidSession(true);
        resolve(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setValidSession(true);
        resolve(true);
      } else {
        // Give the auth state listener a brief window to fire from the URL hash.
        setTimeout(() => resolve(false), 1200);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const ruleResults = useMemo(
    () => RULES.map((r) => ({ ...r, passed: r.test(password) })),
    [password]
  );
  const passedCount = ruleResults.filter((r) => r.passed).length;
  const allRulesPassed = passedCount === RULES.length;
  const isCommonWeak = !!password && COMMON_WEAK.has(password.toLowerCase());
  const passwordsMatch = password === confirm && confirm.length > 0;
  const strength = useMemo(
    () => evaluateStrength(password, passedCount),
    [password, passedCount]
  );
  const canSubmit = allRulesPassed && !isCommonWeak && passwordsMatch && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setPwTouched(true);
    setConfirmTouched(true);

    if (isCommonWeak) {
      const msg = "This password is too common. Please choose a less guessable one.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!allRulesPassed) {
      const failed = ruleResults.find((r) => !r.passed);
      const msg = failed
        ? `Password doesn't meet all requirements (missing: ${failed.label.toLowerCase()}).`
        : "Password doesn't meet all requirements.";
      setError(msg);
      toast.error(msg);
      return;
    }
    if (!passwordsMatch) {
      const msg = "Passwords do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const updateToastId = "reset-update";
    toast.loading("Updating your password…", { id: updateToastId });
    setSubmitting(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateErr) {
      setError(updateErr.message);
      toast.error(updateErr.message || "Could not update password.", { id: updateToastId });
      return;
    }
    toast.success("Password updated. You're signed in.", { id: updateToastId });
    navigate("/dashboard/cockpit", { replace: true });
  };

  const inputClass =
    "w-full h-[42px] px-4 pr-11 bg-fyn-beige-card border border-fyn-ink-10 rounded text-fyn-ink placeholder:text-fyn-ink-40 focus:outline-none focus:ring-2 focus:ring-fyn-red focus:border-fyn-red transition-colors disabled:opacity-60";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-fyn-beige">
      <div className="bg-fyn-ink p-12 flex flex-col justify-center">
        <FynLogo variant="light" />
        <h2
          className="font-serif text-fyn-beige mt-8 mb-4"
          style={{ fontSize: "var(--fyn-type-h1)", lineHeight: 1.15 }}
        >
          Set a new password.
        </h2>
        <p className="text-fyn-beige/60" style={{ fontSize: "var(--fyn-type-body)" }}>
          Use at least 10 characters with a mix of upper- and lowercase letters, a number, and a symbol.
        </p>
      </div>

      <div className="bg-fyn-beige p-12 flex flex-col justify-center">
        <h2
          className="font-serif text-fyn-ink mb-6"
          style={{ fontSize: "var(--fyn-type-h2)", lineHeight: 1.2 }}
        >
          Reset your password
        </h2>

        {!ready ? (
          <p className="text-fyn-ink-60" style={{ fontSize: "var(--fyn-type-body)" }}>
            Verifying reset link…
          </p>
        ) : !validSession ? (
          (() => {
            const isExpired = linkFailure === "expired";
            const isUsed = linkFailure === "used";
            const heading = isExpired
              ? "This reset link has expired"
              : isUsed
              ? "This reset link has already been used"
              : "This reset link is invalid";
            const explainer = isExpired
              ? "For your security, password reset links are valid for a short time. Request a new one below and we'll email it to you right away."
              : isUsed
              ? "Each reset link can only be used once. Request a new link below to set your password."
              : "We couldn't verify this reset link. It may be malformed, already used, or sent from an old email. Request a fresh link below.";
            return (
              <div className="max-w-md space-y-5">
                <div className="rounded-lg border border-fyn-red/20 bg-fyn-danger-bg p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-fyn-red/10 text-fyn-red">
                      <MailWarning className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-serif text-fyn-ink"
                        style={{ fontSize: "var(--fyn-type-h3)", lineHeight: 1.25 }}
                      >
                        {heading}
                      </h3>
                      <p
                        className="mt-1 text-fyn-ink-80"
                        style={{ fontSize: "var(--fyn-type-small)", lineHeight: 1.5 }}
                      >
                        {explainer}
                      </p>
                      <button
                        type="button"
                        onClick={focusResendInput}
                        className="mt-3 inline-flex items-center gap-2 rounded-md bg-fyn-red px-3 py-2 text-fyn-beige hover:opacity-90 transition-opacity"
                        style={{ fontSize: "var(--fyn-type-small)" }}
                      >
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        Request a new reset link
                      </button>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleResend} className="space-y-3" noValidate>
                  <div>
                    <label
                      htmlFor="resend-email"
                      className="block mb-1 text-fyn-ink-80"
                      style={{ fontSize: "var(--fyn-type-small)" }}
                    >
                      Email address
                    </label>
                    <input
                      id="resend-email"
                      ref={resendInputRef}
                      type="email"
                      autoComplete="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      placeholder="you@company.com"
                      disabled={resending}
                      className={inputClass}
                      style={{ fontSize: "var(--fyn-type-body)" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={resending || !resendEmail.trim()}
                    className="w-full bg-fyn-ink text-fyn-beige h-[42px] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ fontSize: "var(--fyn-type-body)" }}
                  >
                    {resending ? "Sending…" : "Email me a new reset link"}
                  </button>
                </form>

            {resentTo && (
              <p className="text-fyn-ink-60" style={{ fontSize: "var(--fyn-type-tiny)" }}>
                If an account exists for{" "}
                <span className="font-medium text-fyn-ink">{resentTo}</span>, a new reset link has been sent. Check your inbox and spam folder.
              </p>
            )}

            <button
              onClick={() => navigate("/signin")}
              className="text-fyn-ink-60 hover:text-fyn-ink underline underline-offset-2 transition-colors"
              style={{ fontSize: "var(--fyn-type-small)" }}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form className="space-y-4 max-w-md" onSubmit={handleSubmit} noValidate>
            {/* New password */}
            <div>
              <label
                htmlFor="reset-pw"
                className="block mb-1 text-fyn-ink-80"
                style={{ fontSize: "var(--fyn-type-small)" }}
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="reset-pw"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setPwTouched(true)}
                  placeholder="At least 10 characters"
                  aria-describedby="reset-pw-rules reset-pw-strength"
                  aria-invalid={pwTouched && (!allRulesPassed || isCommonWeak)}
                  className={inputClass}
                  style={{ fontSize: "var(--fyn-type-body)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-fyn-ink-60 hover:text-fyn-ink transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Strength meter */}
              {password && (
                <div id="reset-pw-strength" className="mt-2" aria-live="polite">
                  <div className="flex gap-1" aria-hidden="true">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= strength.score ? strength.color : "bg-fyn-ink-10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-fyn-ink-60" style={{ fontSize: "var(--fyn-type-tiny)" }}>
                    Strength:{" "}
                    <span
                      className={`font-medium ${
                        strength.score >= 3
                          ? "text-fyn-success"
                          : strength.score === 2
                          ? "text-fyn-gold"
                          : "text-fyn-red"
                      }`}
                    >
                      {strength.label}
                    </span>
                    {isCommonWeak && (
                      <span className="text-fyn-red"> — this is a commonly used password.</span>
                    )}
                  </p>
                </div>
              )}

              {/* Live checklist */}
              <ul id="reset-pw-rules" className="mt-3 space-y-1">
                {ruleResults.map((r) => (
                  <li
                    key={r.key}
                    className={`flex items-center gap-2 ${
                      r.passed
                        ? "text-fyn-success"
                        : pwTouched
                        ? "text-fyn-red"
                        : "text-fyn-ink-60"
                    }`}
                    style={{ fontSize: "var(--fyn-type-tiny)" }}
                  >
                    {r.passed ? (
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : (
                      <X className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
                    )}
                    <span>{r.label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="reset-confirm"
                className="block mb-1 text-fyn-ink-80"
                style={{ fontSize: "var(--fyn-type-small)" }}
              >
                Confirm new password
              </label>
              <div className="relative">
                <input
                  id="reset-confirm"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  onBlur={() => setConfirmTouched(true)}
                  placeholder="Re-enter password"
                  aria-invalid={confirmTouched && confirm.length > 0 && !passwordsMatch}
                  aria-describedby="reset-confirm-hint"
                  className={inputClass}
                  style={{ fontSize: "var(--fyn-type-body)" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-fyn-ink-60 hover:text-fyn-ink transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmTouched && confirm.length > 0 && !passwordsMatch && (
                <p
                  id="reset-confirm-hint"
                  className="mt-1 text-fyn-red"
                  style={{ fontSize: "var(--fyn-type-tiny)" }}
                >
                  Passwords do not match.
                </p>
              )}
              {confirm.length > 0 && passwordsMatch && (
                <p
                  id="reset-confirm-hint"
                  className="mt-1 text-fyn-success inline-flex items-center gap-1"
                  style={{ fontSize: "var(--fyn-type-tiny)" }}
                >
                  <Check className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="rounded border border-fyn-red/20 bg-fyn-danger-bg text-fyn-red p-3"
                style={{ fontSize: "var(--fyn-type-small)" }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-fyn-red text-fyn-beige h-[42px] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ fontSize: "var(--fyn-type-body)" }}
            >
              {submitting ? "Updating…" : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
