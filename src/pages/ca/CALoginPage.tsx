import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { COLORS, PrimaryBtn } from "@/components/ca/ui";

export default function CALoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // BACKEND: SELECT id FROM ca_firms WHERE user_id = auth.uid()
    const { data: firm } = await supabase.from("ca_firms").select("id").eq("user_id", data.user!.id).maybeSingle();
    setLoading(false);
    if (firm) navigate("/ca/dashboard");
    else navigate("/ca/register");
  };

  const handleGoogle = async () => {
    // BACKEND: Supabase Google OAuth — onboarding flow checks ca_firms after callback
    toast.info("Google sign-in not yet configured for CA portal");
  };

  return (
    <div className="min-h-screen flex font-sans" style={{ color: COLORS.ink }}>
      {/* Left half */}
      <div className="hidden md:flex w-1/2 flex-col p-12" style={{ background: COLORS.ink }}>
        <div>
          <div className="text-white font-bold text-2xl tracking-tight">FynHelp</div>
          <div className="text-[12px] font-medium uppercase tracking-[0.10em] mt-0.5" style={{ color: COLORS.gold }}>
            CA Partner Portal
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-[32px] font-bold leading-tight text-white">
            Built for CAs who manage more than one client.
          </h1>
          <p className="text-[15px] mt-4" style={{ color: "rgba(255,255,255,0.65)" }}>
            One portal for your entire client portfolio. Automated reporting. Filing alerts. ITC intelligence — all in one place.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Manage up to 200 clients from one screen",
              "Automated monthly reports for every client",
              "Portfolio-wide filing deadline tracker",
            ].map((t) => (
              <div key={t} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.greenSoft }} />
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <Link to="/signin" className="text-[13px] hover:text-white/70 transition-colors" style={{ color: "rgba(255,255,255,0.40)" }}>
          Not a CA? →
        </Link>
      </div>

      {/* Right half */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: COLORS.caSurface }}>
        <div className="w-full max-w-[400px]">
          <div className="bg-white rounded-[10px] p-10" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            <h2 className="text-[22px] font-bold mb-1.5">Sign in to CA Partner Portal</h2>
            <p className="text-[13px] mb-7" style={{ color: "rgba(26,16,8,0.50)" }}>Registered CA firms only</p>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-[42px] px-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E1E]/20"
                  style={{ border: `1px solid ${COLORS.caBorder}` }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-[42px] px-3 pr-10 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E1E]/20"
                    style={{ border: `1px solid ${COLORS.caBorder}` }}
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,16,8,0.50)" }}>
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && <div className="text-xs" style={{ color: COLORS.red }}>{error}</div>}

              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2"><input type="checkbox" /> Remember me</label>
                <button type="button" className="font-medium" style={{ color: COLORS.red }}>Forgot password →</button>
              </div>

              <div className="pt-2">
                <PrimaryBtn type="submit" full size="lg" disabled={loading}>{loading ? "Signing in…" : "Sign In"}</PrimaryBtn>
              </div>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: COLORS.caBorder }} />
                <span className="text-xs" style={{ color: "rgba(26,16,8,0.40)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: COLORS.caBorder }} />
              </div>

              <button type="button" onClick={handleGoogle} className="w-full h-[42px] rounded text-sm font-medium bg-white flex items-center justify-center gap-2" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/><path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/><path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/><path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/></svg>
                Continue with Google
              </button>
            </form>
          </div>

          <p className="text-[13px] text-center mt-5" style={{ color: "rgba(26,16,8,0.50)" }}>
            New CA firm?{" "}
            <Link to="/ca/register" className="font-medium" style={{ color: COLORS.red }}>Apply for partner access →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
