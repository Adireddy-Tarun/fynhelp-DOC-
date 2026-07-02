import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Check, Users, FileText, ShieldCheck, Bell, Settings as SettingsIcon, UserCircle2, ArrowRight } from "lucide-react";
import FynLogo from "@/components/FynLogo";
import HCaptcha from "@/components/HCaptcha";
import { checkAuthSecurity } from "@/hooks/useAuthSecurity";

const FEATURES = [
  { icon: Users, text: "Portfolio dashboard, 50+ clients at a glance" },
  { icon: FileText, text: "Bulk GST filing across every client" },
  { icon: ShieldCheck, text: "Automated ITC reconciliation engine" },
  { icon: Bell, text: "Proactive client alerts, never miss a deadline" },
  { icon: SettingsIcon, text: "Automated compliance tracking, every filing" },
];

export default function CALoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValid = password.length >= 6;
  const formValid = emailValid && passwordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setCaptchaError(null);
    if (!formValid) return;
    if (!captchaToken) { setCaptchaError("Please complete the CAPTCHA verification."); return; }
    setLoading(true);
    const security = await checkAuthSecurity(email, "ca_login", captchaToken);
    if (!security.allowed) {
      setError(security.error ?? "Too many attempts. Please try again later.");
      setLoading(false);
      return;
    }
    const { data, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
    if (signInErr) {
      setError(signInErr.message);
      setLoading(false);
      return;
    }
    const { data: caFirm } = await supabase
      .from("ca_firms").select("id, is_active, is_verified")
      .eq("user_id", data.user!.id).maybeSingle();
    setLoading(false);
    if (!caFirm) {
      await supabase.auth.signOut();
      setError("Not a CA partner account. Please register for partner access.");
      return;
    }
    navigate("/ca/dashboard");
  };

  const fieldBorder = (valid: boolean, isTouched?: boolean) => {
    if (!isTouched) return "1.5px solid #E2D5BC";
    return valid ? "1.5px solid #1A6B3C" : "1.5px solid #C41E1E";
  };

  const fieldBg = (valid: boolean, isTouched?: boolean) => {
    if (!isTouched) return "#FCFAF4";
    return valid ? "#FAFEFB" : "#FFF9F9";
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "#F4EDDA" }}>
      {/* LEFT — editorial brand panel */}
      <div
        className="md:w-[48%] w-full md:min-h-screen flex flex-col p-8 md:p-14 relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 900px 700px at 15% 0%, #2A180D 0%, #1A1008 55%), #1A1008",
          color: "#fff",
          minHeight: "320px",
        }}
      >
        {/* Ledger-line texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(255,255,255,0.025) 27px, rgba(255,255,255,0.025) 28px)",
          }}
        />
        {/* Glows */}
        <div
          className="absolute pointer-events-none"
          style={{ top: -180, right: -160, width: 480, height: 480, background: "radial-gradient(circle, rgba(196,30,30,0.22), transparent 70%)" }}
        />
        <div
          className="absolute pointer-events-none"
          style={{ bottom: -200, left: -140, width: 420, height: 420, background: "radial-gradient(circle, rgba(139,105,20,0.16), transparent 70%)" }}
        />

        <div className="relative z-10" style={{ marginBottom: 28 }}>
          <FynLogo variant="light" showTagline={false} className="bg-muted" />
          <div
            style={{
              fontSize: 10,
              color: "rgba(244,237,218,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            CA Workbench
          </div>
        </div>

        <div className="relative z-10 my-6 md:my-0 max-w-md">
          <div
            className="inline-flex items-center gap-2"
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#FF8A7A",
              background: "rgba(196,30,30,0.15)",
              border: "1px solid rgba(196,30,30,0.3)",
              padding: "6px 13px",
              borderRadius: 20,
              marginBottom: 22,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF8A7A", boxShadow: "0 0 8px #FF8A7A" }} />
            CA Partner Portal
          </div>

          <h1
            className="text-white"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "44px", lineHeight: 1.08, letterSpacing: "-0.015em" }}
          >
            Run your practice<br />like it's <span style={{ color: "#FF8A7A", fontStyle: "italic", fontWeight: 600 }}>2026.</span>
          </h1>
          <p
            className="mt-4"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", color: "rgba(244,237,218,0.68)", lineHeight: 1.65 }}
          >
            Manage multiple client portfolios, file GST returns in bulk, and run ITC reconciliations — all from one dashboard built for working CAs.
          </p>

          <div className="mt-8 flex flex-col">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.text}
                  className="flex items-center gap-3"
                  style={{
                    padding: "11px 4px",
                    borderBottom: i < FEATURES.length - 1 ? "1px solid rgba(244,237,218,0.07)" : "none",
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: "rgba(196,30,30,0.14)",
                      border: "1px solid rgba(196,30,30,0.25)",
                    }}
                  >
                    <Icon size={13} style={{ color: "#FF8A7A" }} strokeWidth={2.25} />
                  </div>
                  <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "14.5px", color: "rgba(244,237,218,0.82)" }}>
                    {f.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10" style={{ marginTop: 24 }} />
      </div>

      {/* RIGHT — sign-in form */}
      <div
        className="flex-1 flex items-center justify-center p-5 md:p-10"
        style={{ background: "radial-gradient(circle 600px at 85% 15%, rgba(196,30,30,0.05), transparent), #F4EDDA" }}
      >
        <div className="w-full" style={{ maxWidth: "432px" }}>
          <div
            className="bg-white rounded-2xl p-10"
            style={{
              boxShadow: "0 1px 2px rgba(26,16,8,0.04), 0 24px 60px -12px rgba(26,16,8,0.18)",
              border: "1px solid rgba(26,16,8,0.05)",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: "linear-gradient(145deg, #1A1008, #2A180D)",
                boxShadow: "0 4px 12px rgba(26,16,8,0.18)",
                marginBottom: 20,
              }}
            >
              <UserCircle2 size={21} style={{ color: "#FF8A7A" }} />
            </div>

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "29px", color: "#1A1008", letterSpacing: "-0.01em" }}>
              Welcome back
            </h2>
            <p className="mt-1.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13.5px", color: "rgba(26,16,8,0.5)" }}>
              Sign in to your CA firm account
            </p>

            <form onSubmit={handleSubmit} className="mt-7 space-y-[18px]">
              <div>
                <label
                  className="block mb-[7px]"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "12.5px", color: "#1A1008", textTransform: "uppercase", letterSpacing: "0.03em" }}
                >
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email" required value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    placeholder="you@cafirm.com"
                    className="w-full h-[46px] px-[15px] rounded-[10px] text-[14.5px] focus:outline-none transition-colors"
                    style={{
                      border: fieldBorder(emailValid, touched.email),
                      background: fieldBg(emailValid, touched.email),
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = "1.5px solid #C41E1E")}
                  />
                  {touched.email && emailValid && (
                    <Check size={16} className="absolute right-[14px] top-1/2 -translate-y-1/2" style={{ color: "#1A6B3C" }} strokeWidth={2.5} />
                  )}
                </div>
                {touched.email && !emailValid && (
                  <p className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "#C41E1E" }}>
                    Enter a valid email address
                  </p>
                )}
              </div>

              <div>
                <label
                  className="block mb-[7px]"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "12.5px", color: "#1A1008", textTransform: "uppercase", letterSpacing: "0.03em" }}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"} required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                    placeholder="Enter your password"
                    className="w-full h-[46px] px-[15px] pr-10 rounded-[10px] text-[14.5px] focus:outline-none transition-colors"
                    style={{
                      border: fieldBorder(passwordValid, touched.password),
                      background: fieldBg(passwordValid, touched.password),
                      fontFamily: "Inter, sans-serif",
                    }}
                    onFocus={(e) => (e.currentTarget.style.border = "1.5px solid #C41E1E")}
                  />
                  <button type="button" onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(26,16,8,0.45)" }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {touched.password && !passwordValid && (
                  <p className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "#C41E1E" }}>
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              <div className="flex justify-end" style={{ marginTop: -8 }}>
                <button type="button"
                  className="hover:underline"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13px", color: "#C41E1E" }}>
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="rounded-md p-3" style={{ background: "#F9EDED", color: "#C41E1E", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
                  {error}
                </div>
              )}

              <HCaptcha onVerify={(token) => { setCaptchaToken(token); setCaptchaError(null); }} onExpire={() => setCaptchaToken(null)} />
              {captchaError && <p style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#C41E1E", textAlign: "center" }}>{captchaError}</p>}



              <button
                type="submit" disabled={!formValid || loading}
                className="w-full rounded-[10px] transition-opacity disabled:opacity-50 flex items-center justify-center gap-[7px]"
                style={{
                  height: "50px",
                  background: "linear-gradient(135deg, #D8362F 0%, #B91E1E 100%)",
                  boxShadow: "0 8px 20px -4px rgba(196,30,30,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "15px", letterSpacing: "0.01em",
                  border: "none",
                }}
              >
                {loading ? "Signing in…" : (<>Sign in to portal <ArrowRight size={15} /></>)}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: "#E2D5BC" }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "10.5px", fontWeight: 700, color: "rgba(26,16,8,0.35)", letterSpacing: "0.12em" }}>OR</span>
                <div className="flex-1 h-px" style={{ background: "#E2D5BC" }} />
              </div>

              <Link to="/ca/register"
                className="flex items-center justify-center gap-[6px] text-center hover:bg-[#FAF8F3] transition-colors"
                style={{
                  fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "13.5px", color: "#1A1008",
                  padding: "12px", borderRadius: 9, border: "1.5px solid rgba(26,16,8,0.1)",
                }}>
                New CA firm? Register for partner access <ArrowRight size={13} />
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
