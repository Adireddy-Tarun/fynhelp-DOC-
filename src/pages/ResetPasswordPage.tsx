import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FynLogo from "@/components/FynLogo";
import { toast } from "sonner";
import { Check, X, Eye, EyeOff } from "lucide-react";

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
  if (!pw) return { score: 0, label: "", color: "bg-fyn-ink/10" };
  if (COMMON_WEAK.has(pw.toLowerCase())) {
    return { score: 1, label: "Too common", color: "bg-fyn-red" };
  }
  // Score = passed rules + a length bonus
  let score = passedCount;
  if (pw.length >= 14) score += 1;
  if (pw.length >= 18) score += 1;
  if (score <= 2) return { score: 1, label: "Weak", color: "bg-fyn-red" };
  if (score <= 4) return { score: 2, label: "Fair", color: "bg-fyn-gold" };
  if (score <= 6) return { score: 3, label: "Strong", color: "bg-emerald-600" };
  return { score: 4, label: "Excellent", color: "bg-emerald-600" };
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
    toast.loading("Verifying your reset link…", { id: verifyToastId });
    let resolved = false;

    const resolve = (ok: boolean) => {
      if (resolved) return;
      resolved = true;
      setReady(true);
      if (ok) {
        toast.success("Reset link verified. Choose a new password.", { id: verifyToastId });
      } else {
        toast.error("This reset link is invalid or has expired.", { id: verifyToastId });
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

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="bg-fyn-ink p-12 flex flex-col justify-center">
        <FynLogo variant="light" />
        <h2 className="text-white font-serif text-3xl mt-8 mb-4">Set a new password.</h2>
        <p className="text-white/60">
          Use at least 10 characters with a mix of upper- and lowercase letters, a number, and a symbol.
        </p>
      </div>

      <div className="bg-fyn-beige p-12 flex flex-col justify-center">
        <h2 className="text-fyn-ink font-serif text-2xl mb-6">Reset your password</h2>

        {!ready ? (
          <p className="text-secondary-foreground text-sm">Verifying reset link…</p>
        ) : !validSession ? (
          <div className="max-w-md space-y-4">
            <div className="rounded-md p-3 text-sm bg-fyn-red/10 text-fyn-red border border-fyn-red/20">
              This reset link is invalid or has expired. Please request a new one from the sign-in page.
            </div>
            <button
              onClick={() => navigate("/signin")}
              className="bg-fyn-red text-white py-3 px-5 rounded-lg font-medium text-base hover:opacity-90 transition-opacity"
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <form className="space-y-4 max-w-md" onSubmit={handleSubmit} noValidate>
            {/* New password */}
            <div>
              <label htmlFor="reset-pw" className="text-sm mb-1 block text-secondary-foreground">
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
                  className="w-full h-[42px] px-4 pr-11 bg-fyn-beige border border-fyn-ink-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-secondary-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-secondary-foreground hover:text-fyn-ink"
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
                          i <= strength.score ? strength.color : "bg-fyn-ink/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-secondary-foreground">
                    Strength:{" "}
                    <span
                      className={`font-medium ${
                        strength.score >= 3
                          ? "text-emerald-700"
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
                    className={`flex items-center gap-2 text-xs ${
                      r.passed
                        ? "text-emerald-700"
                        : pwTouched
                        ? "text-fyn-red"
                        : "text-secondary-foreground"
                    }`}
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
              <label htmlFor="reset-confirm" className="text-sm mb-1 block text-secondary-foreground">
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
                  className="w-full h-[42px] px-4 pr-11 bg-fyn-beige border border-fyn-ink-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-secondary-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-secondary-foreground hover:text-fyn-ink"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmTouched && confirm.length > 0 && !passwordsMatch && (
                <p id="reset-confirm-hint" className="mt-1 text-xs text-fyn-red">
                  Passwords do not match.
                </p>
              )}
              {confirm.length > 0 && passwordsMatch && (
                <p id="reset-confirm-hint" className="mt-1 text-xs text-emerald-700 inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Passwords match
                </p>
              )}
            </div>

            {error && (
              <div role="alert" className="rounded-md p-3 text-sm bg-fyn-red/10 text-fyn-red border border-fyn-red/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="w-full bg-fyn-red text-white py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
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
