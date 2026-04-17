import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Check } from "lucide-react";
import FynLogo from "@/components/FynLogo";

const FEATURES = [
  "Portfolio dashboard — 50+ clients at a glance",
  "Bulk GST filing across clients",
  "ITC reconciliation engine",
  "Client alerts & notifications",
  "Automated compliance tracking",
];

export default function CALoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;
  const formValid = emailValid && passwordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formValid) return;
    setLoading(true);

    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      setError(signInErr.message);
      setLoading(false);
      return;
    }

    const { data: caFirm } = await supabase
      .from("ca_firms")
      .select("id, is_active, is_verified")
      .eq("user_id", data.user!.id)
      .maybeSingle();

    setLoading(false);

    if (!caFirm) {
      await supabase.auth.signOut();
      setError("Not a CA partner account. Please register for partner access.");
      return;
    }
    navigate("/ca/dashboard");
  };

  const fieldBorder = (valid: boolean, isTouched?: boolean) => {
    if (!isTouched) return "1.5px solid #D4C9A8";
    return valid ? "1.5px solid #1A6B3C" : "1.5px solid #C41E1E";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "#EDE4CB" }}>
      {/* LEFT */}
      <div
        className="md:w-[45%] w-full md:min-h-screen flex flex-col justify-between p-8 md:p-12"
        style={{ background: "#1A1008", color: "#fff", minHeight: "280px" }}
      >
        <div>
          <FynLogo theme="dark" />
        </div>

        <div className="my-8 md:my-0 max-w-md">
          <h1
            className="text-white"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "36px", lineHeight: 1.15 }}
          >
            CA Partner Portal
          </h1>
          <p
            className="mt-4"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", color: "rgba(255,255,255,0.75)", lineHeight: 1.55 }}
          >
            Manage multiple client portfolios. File GST returns. Run ITC reconciliations. All from one dashboard.
          </p>

          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li
                key={f}
                className="flex items-start gap-3"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(255,255,255,0.65)" }}
              >
                <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#C41E1E" }} strokeWidth={2.5} />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13px", color: "rgba(255,255,255,0.45)" }}>
          800,000 CAs trust FynHelp
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-5 md:p-10" style={{ background: "#F4EDDA" }}>
        <div className="w-full" style={{ maxWidth: "420px" }}>
          <div className="bg-white rounded-xl p-10 shadow-lg">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "28px", color: "#1A1008" }}>
              Welcome back
            </h2>
            <p className="mt-1.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(26,16,8,0.55)" }}>
              Sign in to your CA firm account
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="block mb-1.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "#1A1008" }}>
                  Email address
                </label>
                <input
                  type="email" required value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  placeholder="you@cafirm.com"
                  className="w-full h-11 px-3.5 rounded-lg text-sm focus:outline-none transition-colors"
                  style={{
                    border: fieldBorder(emailValid, touched.email),
                    fontFamily: "Inter, sans-serif",
                    background: "#fff",
                  }}
                  onFocus={(e) => (e.currentTarget.style.border = "1.5px solid #C41E1E")}
                />
                {touched.email && !emailValid && (
                  <p className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "#C41E1E" }}>
                    Enter a valid email address
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-1.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "#1A1008" }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="Enter your password"
                    className="w-full h-11 px-3.5 pr-10 rounded-lg text-sm focus:outline-none transition-colors"
                    style={{
                      border: fieldBorder(passwordValid, touched.password),
                      fontFamily: "Inter, sans-serif",
                      background: "#fff",
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = "1.5px solid #C41E1E")}
                  />
                  <button type="button" onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(26,16,8,0.5)" }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {touched.password && !passwordValid && (
                  <p className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "#C41E1E" }}>
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <div className="flex justify-end">
                <button type="button"
                  className="hover:underline"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px", color: "#C41E1E" }}>
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="rounded-md p-3" style={{ background: "#F9EDED", color: "#C41E1E", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
                  {error}
                </div>
              )}

              <button
                type="submit" disabled={!formValid || loading}
                className="w-full rounded-lg transition-opacity disabled:opacity-50 hover:brightness-90"
                style={{
                  height: "48px", background: "#C41E1E", color: "#fff",
                  fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px",
                }}
              >
                {loading ? "Signing in…" : "Sign in to portal →"}
              </button>

              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px" style={{ background: "#D4C9A8" }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(26,16,8,0.4)", letterSpacing: "0.1em" }}>OR</span>
                <div className="flex-1 h-px" style={{ background: "#D4C9A8" }} />
              </div>

              <Link to="/ca/register"
                className="block text-center hover:underline"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", color: "#1A1008" }}>
                New CA firm? Register for partner access →
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
