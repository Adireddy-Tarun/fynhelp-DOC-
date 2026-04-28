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
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

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

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirm && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!passwordValid) {
      const msg = "Password must be at least 8 characters.";
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
        <p className="text-white/60">Choose something strong — at least 8 characters.</p>
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
            <div>
              <label className="text-sm mb-1 block text-secondary-foreground">New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full h-[42px] px-4 bg-fyn-beige border border-fyn-ink-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-secondary-foreground"
              />
            </div>
            <div>
              <label className="text-sm mb-1 block text-secondary-foreground">Confirm new password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="w-full h-[42px] px-4 bg-fyn-beige border border-fyn-ink-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red text-secondary-foreground"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-md p-3 text-sm bg-fyn-red/10 text-fyn-red border border-fyn-red/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-fyn-red text-white py-3 rounded-lg font-medium text-base hover:opacity-90 transition-opacity disabled:opacity-60"
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
