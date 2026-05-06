import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { logAdminAction } from "@/lib/adminAudit";

export default function AdminLoginPage() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading, refresh } = useAdminAuth();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { denied?: boolean } };
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(loc.state?.denied
    ? "Access denied. This account is not authorized for the admin portal."
    : null);
  const [needsVerify, setNeedsVerify] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetBusy, setResetBusy] = useState(false);

  useEffect(() => {
    if (!adminLoading && user && isAdmin) nav("/admin/dashboard", { replace: true });
  }, [adminLoading, user, isAdmin, nav]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null); setNeedsVerify(false); setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(), password: pw,
    });
    if (error || !data.user) {
      setBusy(false);
      const msg = error?.message ?? "Sign in failed";
      if (/email not confirmed|not confirmed|email_not_confirmed/i.test(msg)) {
        setNeedsVerify(true);
        setErr("Please verify your email. Check your inbox for the verification link.");
      } else {
        setErr(msg);
      }
      return;
    }
    // Verify admin role
    const { data: roles } = await supabase
      .from("user_roles").select("role").eq("user_id", data.user.id);
    const isAdminRole = (roles ?? []).some((r) =>
      ["admin","super_admin","ops_admin","support_agent","analyst"].includes(r.role as string));
    if (!isAdminRole) {
      await supabase.auth.signOut();
      setBusy(false);
      setErr("Access denied. This account is not authorized for the admin portal.");
      return;
    }
    await logAdminAction({ action: "admin_login", target_type: "auth", target_id: data.user.id });
    await refresh();
    nav("/admin/dashboard", { replace: true });
  };

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(var(--fyn-ink))" }}>
      {/* Branding side */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ width: "40%", background: "linear-gradient(160deg, #1A1008 0%, #2A1A0F 100%)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(139,105,20,0.18), transparent 55%)," +
              "radial-gradient(circle at 20% 80%, rgba(196,30,30,0.15), transparent 50%)",
          }}
        />
        <div className="relative">
          <Link
            to="/"
            style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 28, color: "#fff" }}
          >FYNHelp</Link>
        </div>
        <div className="relative">
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 48, color: "#fff", lineHeight: 1.05 }}>
            Admin Portal
          </h1>
          <p
            className="mt-4 max-w-md"
            style={{ fontFamily: "Raleway, sans-serif", fontSize: 18, color: "hsl(var(--fyn-beige))" }}
          >Secure access for FYNHelp team members.</p>
        </div>
        <div
          className="relative"
          style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "rgba(244,237,218,0.5)" }}
        >© FYNHelp · Internal use only</div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div
          className="w-full"
          style={{
            maxWidth: 480,
            background: "rgba(255,255,255,0.97)",
            backdropFilter: "blur(20px) saturate(110%)",
            borderRadius: 20,
            border: "1px solid rgba(139,105,20,0.18)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.35)",
            padding: 40,
          }}
        >
          <h2 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 32, color: "hsl(var(--fyn-ink))" }}>
            Sign in to Admin Portal
          </h2>
          <p
            className="mt-2 mb-7"
            style={{ fontFamily: "Raleway, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.6)" }}
          >Use your FYNHelp team credentials.</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <Field label="Email address">
              <input
                type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fynhelp.com" autoComplete="email"
                style={inputStyle}
              />
            </Field>
            <Field label="Password">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required value={pw}
                  onChange={(e) => setPw(e.target.value)} autoComplete="current-password"
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button
                  type="button" onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>
            {err && (
              <div
                role="alert"
                style={{
                  background: "rgba(220,38,38,0.08)",
                  border: "1px solid rgba(220,38,38,0.25)",
                  color: "#991B1B",
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontFamily: "Roboto, sans-serif", fontSize: 14,
                }}
              >{err}</div>
            )}
            <button
              type="submit" disabled={busy}
              style={{
                width: "100%", height: 52, borderRadius: 12, color: "#fff",
                background: busy
                  ? "rgba(196,30,30,0.7)"
                  : "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
                fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 16,
                boxShadow: "0 4px 14px rgba(196,30,30,0.3)",
              }}
            >{busy ? "Signing in…" : "Sign in"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", height: 52, padding: "0 16px", borderRadius: 12,
  border: "1px solid rgba(26,16,8,0.15)", background: "#fff",
  fontFamily: "Roboto, sans-serif", fontSize: 16, color: "hsl(var(--fyn-ink))",
  outline: "none",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block mb-1.5"
        style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, color: "hsl(var(--fyn-ink))" }}
      >{label}</span>
      {children}
    </label>
  );
}
