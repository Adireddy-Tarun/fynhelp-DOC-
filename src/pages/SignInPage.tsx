import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FynLogo from "@/components/FynLogo";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [authError, setAuthError] = useState<{ field?: "email" | "password" | "form"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    setAuthError(null);

    if (!emailValid || !passwordValid) return;

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
        setAuthError({ field: "password", message: "Incorrect email or password. Please try again." });
      } else if (msg.includes("email not confirmed")) {
        setAuthError({ field: "email", message: "Please confirm your email address before signing in." });
      } else if (msg.includes("user not found")) {
        setAuthError({ field: "email", message: "No account found with this email address." });
      } else {
        setAuthError({ field: "form", message: error.message });
      }
    }
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
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (authError?.field === "email" || authError?.field === "password") setAuthError(null);
              }}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="rajesh@example.com"
              aria-invalid={showEmailError || authError?.field === "email"}
              aria-describedby="signin-email-error"
              className={`${inputBase} ${showEmailError || authError?.field === "email" ? inputErr : inputOk}`}
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
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (authError?.field === "password") setAuthError(null);
              }}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              placeholder="Enter your password"
              aria-invalid={showPasswordError || authError?.field === "password"}
              aria-describedby="signin-password-error"
              className={`${inputBase} ${showPasswordError || authError?.field === "password" ? inputErr : inputOk}`}
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
            <label className="flex items-center gap-2 text-sm cursor-pointer text-secondary-foreground">
              <input type="checkbox" className="accent-[#C41E1E]" />
              Remember me
            </label>
            <a href="#" className="text-fyn-red text-sm hover:underline">Forgot password?</a>
          </div>

          {authError?.field === "form" && (
            <div
              role="alert"
              className="rounded-md p-3 text-sm bg-fyn-red/10 text-fyn-red border border-fyn-red/20"
            >
              {authError.message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-fyn-red text-white py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
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
