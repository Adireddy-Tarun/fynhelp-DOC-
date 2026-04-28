import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FynLogo from "@/components/FynLogo";
import { Loader2, ShieldCheck } from "lucide-react";
import HCaptcha from "@hcaptcha/react-hcaptcha";

// hCaptcha site key. Provide via VITE_HCAPTCHA_SITE_KEY in env. The fallback is
// hCaptcha's public test key — it always passes verification and is meant for
// local/preview environments only. Replace in production.
const HCAPTCHA_SITE_KEY =
  (import.meta.env.VITE_HCAPTCHA_SITE_KEY as string | undefined) ||
  "10000000-ffff-ffff-ffff-000000000001";
const HCAPTCHA_IS_TEST_KEY = HCAPTCHA_SITE_KEY === "10000000-ffff-ffff-ffff-000000000001";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [authError, setAuthError] = useState<{ field?: "email" | "password" | "form"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [slowAuth, setSlowAuth] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("fyn.rememberMe") !== "0");

  // Refs for auto-focusing the first invalid field on submit.
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // hCaptcha — required once the form enters cooldown (locked state). Solving
  // the challenge clears the local cooldown and the token is also forwarded to
  // Supabase, which validates it server-side when captcha is enabled in auth
  // settings (so attackers can't bypass by patching the client).
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaSolved, setCaptchaSolved] = useState<boolean>(false);

  const focusField = (field: "email" | "password") => {
    const el = field === "email" ? emailRef.current : passwordRef.current;
    if (!el) return;
    // Wait a tick so any error UI renders before scrolling.
    requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  useEffect(() => {
    if (!loading) {
      setSlowAuth(false);
      return;
    }
    const id = setTimeout(() => setSlowAuth(true), 2500);
    return () => clearTimeout(id);
  }, [loading]);

  // Client-side rate limiting after repeated failed sign-in attempts.
  // After FAIL_THRESHOLD consecutive failures, the form is locked for a
  // cooldown that grows with each additional failure. State is persisted
  // so it survives page refreshes within the same browser.
  const FAIL_THRESHOLD = 3;
  const COOLDOWN_STEPS_SECONDS = [30, 60, 120, 300]; // after 3rd, 4th, 5th, 6th+ fail
  const ATTEMPTS_KEY = "fyn.signinFails";
  const COOLDOWN_KEY = "fyn.signinCooldownUntil";

  const readNumber = (key: string) => {
    const raw = localStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  };

  const [failCount, setFailCount] = useState<number>(() => readNumber(ATTEMPTS_KEY));
  const [cooldownUntil, setCooldownUntil] = useState<number>(() => readNumber(COOLDOWN_KEY));
  const [now, setNow] = useState<number>(() => Date.now());

  const cooldownRemaining = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const isLocked = cooldownRemaining > 0;

  // True for one render cycle right after the cooldown timer hits 0, so we
  // can show an explicit "Try again" panel instead of silently re-enabling
  // the form. Cleared by the user clicking "Try again" or by typing.
  const [cooldownJustExpired, setCooldownJustExpired] = useState(false);
  const wasLockedRef = useRef(isLocked);

  useEffect(() => {
    if (!isLocked) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isLocked]);

  // Detect the lock → unlocked transition so we can prompt "Try again" without
  // requiring a page refresh. Guarded by a ref so we only fire once per
  // expiry, not on every render where isLocked is already false.
  useEffect(() => {
    if (wasLockedRef.current && !isLocked && cooldownUntil > 0) {
      setCooldownJustExpired(true);
    }
    wasLockedRef.current = isLocked;
  }, [isLocked, cooldownUntil]);

  const formatRemaining = (s: number) => {
    if (s >= 60) {
      const m = Math.floor(s / 60);
      const r = s % 60;
      return r ? `${m}m ${r}s` : `${m}m`;
    }
    return `${s}s`;
  };

  const recordFailure = () => {
    const next = failCount + 1;
    setFailCount(next);
    localStorage.setItem(ATTEMPTS_KEY, String(next));
    if (next >= FAIL_THRESHOLD) {
      const stepIndex = Math.min(next - FAIL_THRESHOLD, COOLDOWN_STEPS_SECONDS.length - 1);
      const seconds = COOLDOWN_STEPS_SECONDS[stepIndex];
      const until = Date.now() + seconds * 1000;
      setCooldownUntil(until);
      setNow(Date.now());
      localStorage.setItem(COOLDOWN_KEY, String(until));
      setCooldownJustExpired(false);
    }
  };

  const clearFailures = () => {
    setFailCount(0);
    setCooldownUntil(0);
    setCooldownJustExpired(false);
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(COOLDOWN_KEY);
  };

  // Forgot password state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const forgotEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail);

  const openForgot = () => {
    setForgotEmail(email);
    setForgotMsg(null);
    setShowForgot(true);
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    if (!forgotEmailValid) {
      setForgotMsg({ type: "error", text: "Please enter a valid email address." });
      return;
    }
    setForgotSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setForgotSending(false);
    if (error) {
      setForgotMsg({ type: "error", text: error.message });
      return;
    }
    setForgotMsg({
      type: "success",
      text: `If an account exists for ${forgotEmail}, a password reset link is on its way. Check your inbox (and spam).`,
    });
  };

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;

  const showEmailError = (touched.email || submitAttempted) && !emailValid;
  const showPasswordError = (touched.password || submitAttempted) && !passwordValid;

  const emailErrorMsg = !email
    ? "Email address is required"
    : "Please enter a valid email address (e.g. name@example.com)";
  const passwordErrorMsg = !password
    ? "Password is required"
    : "Password must be at least 6 characters";

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaSolved(false);
    try {
      captchaRef.current?.resetCaptcha();
    } catch {
      /* widget may not be mounted yet */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setAuthError(null);

    if (isLocked) {
      setAuthError({
        field: "form",
        message: `Too many failed attempts. Please complete the security check below to continue, or wait ${formatRemaining(cooldownRemaining)}.`,
      });
      return;
    }

    if (!emailValid || !passwordValid) {
      focusField(!emailValid ? "email" : "password");
      return;
    }

    setLoading(true);
    const tokenForRequest = captchaToken ?? undefined;
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: tokenForRequest ? { captchaToken: tokenForRequest } : undefined,
    });
    setLoading(false);

    // hCaptcha tokens are single-use — reset the widget after every submit.
    resetCaptcha();

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      const isCredentialError =
        msg.includes("invalid login") ||
        msg.includes("invalid credentials") ||
        msg.includes("user not found");

      // Only count credential failures toward the cooldown — not e.g. unconfirmed email or network errors.
      if (isCredentialError) {
        recordFailure();
      }

      let errorField: "email" | "password" | "form" = "form";
      if (msg.includes("captcha")) {
        errorField = "form";
        setAuthError({
          field: "form",
          message: "Captcha verification failed. Please try the security check again.",
        });
      } else if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        errorField = "password";
        setAuthError({ field: "password", message: "Incorrect email or password. Please try again." });
      } else if (msg.includes("email not confirmed")) {
        errorField = "email";
        setAuthError({ field: "email", message: "Please confirm your email address before signing in." });
      } else if (msg.includes("user not found")) {
        errorField = "email";
        setAuthError({ field: "email", message: "No account found with this email address." });
      } else {
        setAuthError({ field: "form", message: error.message });
      }
      if (errorField === "email" || errorField === "password") {
        focusField(errorField);
      }
      return;
    }

    // Successful sign-in — reset failure tracking.
    clearFailures();

    // Persist Remember me preference and enforce session-only mode if unchecked.
    localStorage.setItem("fyn.rememberMe", rememberMe ? "1" : "0");
    if (rememberMe) {
      localStorage.removeItem("fyn.sessionOnly");
    } else {
      localStorage.setItem("fyn.sessionOnly", "1");
    }
    sessionStorage.setItem("fyn.tabAlive", "1");
  };

  const inputBase =
    "w-full h-[42px] px-4 bg-fyn-beige border rounded text-sm focus:outline-none focus:ring-2 text-secondary-foreground transition-colors";
  const inputOk = "border-fyn-ink-10 focus:ring-fyn-red";
  const inputErr = "border-fyn-red focus:ring-fyn-red";

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left */}
      <div className="bg-fyn-ink p-12 flex flex-col justify-center">
        <FynLogo variant="light" />
        <h2 className="text-white font-serif text-3xl mt-8 mb-4">Welcome back.</h2>
        <p className="text-white/60">AI CFO Nidhi has been watching your numbers.</p>
      </div>

      {/* Right */}
      <div className="bg-fyn-beige p-12 flex flex-col justify-center">
        <h2 className="text-fyn-ink font-serif text-2xl mb-6">Sign in to your account</h2>
        <form className="space-y-4 max-w-md" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="signin-email" className="text-sm mb-1 block text-secondary-foreground">
              Email address
            </label>
            <input
              id="signin-email"
              ref={emailRef}
              type="email"
              value={email}
              disabled={loading}
              onChange={(e) => {
                setEmail(e.target.value);
                if (authError?.field === "email" || authError?.field === "password") setAuthError(null);
              }}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="rajesh@example.com"
              aria-invalid={showEmailError || authError?.field === "email"}
              aria-describedby="signin-email-error"
              className={`${inputBase} ${showEmailError || authError?.field === "email" ? inputErr : inputOk} disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            {showEmailError && (
              <p id="signin-email-error" className="mt-1 text-xs text-fyn-red">
                {emailErrorMsg}
              </p>
            )}
            {!showEmailError && authError?.field === "email" && (
              <p id="signin-email-error" className="mt-1 text-xs text-fyn-red">
                {authError.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="signin-password" className="text-sm mb-1 block text-secondary-foreground">
              Password
            </label>
            <input
              id="signin-password"
              ref={passwordRef}
              type="password"
              value={password}
              disabled={loading}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError?.field === "password") setAuthError(null);
              }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="Enter your password"
              aria-invalid={showPasswordError || authError?.field === "password"}
              aria-describedby="signin-password-error"
              className={`${inputBase} ${showPasswordError || authError?.field === "password" ? inputErr : inputOk} disabled:opacity-60 disabled:cursor-not-allowed`}
            />
            {showPasswordError && (
              <p id="signin-password-error" className="mt-1 text-xs text-fyn-red">
                {passwordErrorMsg}
              </p>
            )}
            {!showPasswordError && authError?.field === "password" && (
              <p id="signin-password-error" className="mt-1 text-xs text-fyn-red">
                {authError.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <label className={`flex items-center gap-2 text-sm cursor-pointer text-secondary-foreground ${loading ? "opacity-60 cursor-not-allowed" : ""}`}>
              <input
                type="checkbox"
                className="accent-[#C41E1E]"
                checked={rememberMe}
                disabled={loading}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={openForgot}
              disabled={loading}
              className="text-fyn-red text-sm hover:underline disabled:opacity-60 disabled:cursor-not-allowed disabled:no-underline"
            >
              Forgot password?
            </button>
          </div>

          {showForgot && (
            <div className="rounded-lg border border-fyn-ink-10 bg-fyn-beige-card p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-fyn-ink" style={{ fontSize: "var(--fyn-type-h3)" }}>
                    Reset your password
                  </h3>
                  <p className="text-fyn-ink-60 mt-1" style={{ fontSize: "var(--fyn-type-small)" }}>
                    Enter your account email and we'll send you a reset link.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="text-fyn-ink-60 hover:text-fyn-ink transition-colors"
                  style={{ fontSize: "var(--fyn-type-small)" }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="forgot-email"
                  className="block text-fyn-ink-80"
                  style={{ fontSize: "var(--fyn-type-tiny)" }}
                >
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputBase} ${forgotEmail && !forgotEmailValid ? inputErr : inputOk}`}
                />
              </div>

              {forgotMsg && (
                <div
                  role="alert"
                  className={`rounded border p-3 ${
                    forgotMsg.type === "success"
                      ? "bg-fyn-success-bg text-fyn-success border-fyn-success/20"
                      : "bg-fyn-danger-bg text-fyn-red border-fyn-red/20"
                  }`}
                  style={{ fontSize: "var(--fyn-type-tiny)" }}
                >
                  {forgotMsg.text}
                </div>
              )}

              <button
                type="button"
                onClick={handleForgotSubmit}
                disabled={forgotSending || !forgotEmailValid}
                className="w-full bg-fyn-ink text-fyn-beige h-[42px] rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ fontSize: "var(--fyn-type-body)" }}
              >
                {forgotSending ? "Sending reset link…" : "Send reset link"}
              </button>
            </div>
          )}

          {authError?.field === "form" && (
            <div
              role="alert"
              className="rounded-md p-3 text-sm bg-fyn-red/10 text-fyn-red border border-fyn-red/20"
            >
              {authError.message}
            </div>
          )}

          {isLocked && (
            <div
              role="alert"
              aria-live="polite"
              className="rounded-lg p-4 bg-fyn-gold/10 text-fyn-ink border border-fyn-gold/30 space-y-3"
            >
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-fyn-gold mt-0.5 flex-shrink-0" aria-hidden="true" />
                <div className="flex-1">
                  <div className="font-medium" style={{ fontSize: "var(--fyn-type-body)" }}>
                    Security check required
                  </div>
                  <div className="mt-1 text-fyn-ink-60" style={{ fontSize: "var(--fyn-type-tiny)" }}>
                    After {failCount} failed attempts we've paused sign-in for{" "}
                    <span className="font-mono font-semibold text-fyn-ink">
                      {formatRemaining(cooldownRemaining)}
                    </span>
                    . Solve the challenge below to retry immediately, or use{" "}
                    <button
                      type="button"
                      onClick={openForgot}
                      className="text-fyn-red hover:underline"
                    >
                      Reset your password
                    </button>{" "}
                    if you've forgotten it.
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_SITE_KEY}
                  theme="light"
                  size="normal"
                  onVerify={(token) => {
                    setCaptchaToken(token);
                    setCaptchaSolved(true);
                    // Solving the challenge clears the local cooldown so the
                    // user can retry immediately. Server-side captcha
                    // verification (when enabled in Supabase auth) still
                    // protects against scripted abuse.
                    clearFailures();
                    setAuthError(null);
                  }}
                  onExpire={resetCaptcha}
                  onError={resetCaptcha}
                />
              </div>

              {HCAPTCHA_IS_TEST_KEY && (
                <p className="text-fyn-ink-45" style={{ fontSize: "var(--fyn-type-tiny)" }}>
                  Dev mode: using hCaptcha's public test key. Set{" "}
                  <code className="font-mono">VITE_HCAPTCHA_SITE_KEY</code> for production.
                </p>
              )}
            </div>
          )}
          {!isLocked && failCount >= FAIL_THRESHOLD - 1 && failCount > 0 && (
            <p className="text-xs text-fyn-red">
              {FAIL_THRESHOLD - failCount === 1
                ? "1 more failed attempt will temporarily lock sign-in."
                : `${FAIL_THRESHOLD - failCount} more failed attempts will temporarily lock sign-in.`}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || (isLocked && !captchaSolved)}
            aria-busy={loading}
            className="w-full bg-fyn-red text-white py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            {isLocked && !captchaSolved
              ? "Complete the security check to continue"
              : loading
              ? "Signing in…"
              : "Sign In"}
          </button>

          {loading && (
            <p
              role="status"
              aria-live="polite"
              className="text-xs text-center text-secondary-foreground inline-flex items-center justify-center gap-1.5 w-full"
            >
              <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
              {slowAuth
                ? "Still working — secure servers can take a moment…"
                : "Contacting secure server…"}
            </p>
          )}
          <p className="text-sm text-center text-secondary-foreground">
            Don't have an account? <Link to="/signup" className="text-fyn-red hover:underline">Start free trial →</Link>
          </p>
          <p className="text-xs text-center mt-4 text-secondary-foreground">
            Logging in as a CA partner? <a href="#" className="text-fyn-gold hover:underline">Use your partner portal →</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
