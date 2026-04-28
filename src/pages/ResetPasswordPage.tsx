import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import FynLogo from "@/components/FynLogo";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Supabase v2 will pick up the recovery session from the URL hash automatically.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setValidSession(true);
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setValidSession(true);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const passwordValid = password.length >= 8;
  const passwordsMatch = password === confirm && confirm.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!passwordValid) return setError("Password must be at least 8 characters.");
    if (!passwordsMatch) return setError("Passwords do not match.");

    setSubmitting(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (updateErr) {
      setError(updateErr.message);
      return;
    }
    toast.success("Password updated. You're signed in.");
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
