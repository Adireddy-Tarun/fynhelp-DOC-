import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { authErrorMessage } from "@/lib/authErrors";
import { CA, CACard, CAHeading, CAButton, CAField, caInputStyle } from "@/components/ca/portalUi";

export default function CALoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address");
    if (!password) return setError("Enter your password");
    setLoading(true);
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInErr) {
      setError(authErrorMessage(signInErr.message, "signin"));
      return;
    }
    toast.success("Signed in");
    navigate("/ca/dashboard", { replace: true });
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: CA.bg }}>
      <CACard style={{ width: "100%", maxWidth: 420, padding: 36 }}>
        <div style={{ fontFamily: CA.serif, fontSize: 20, fontWeight: 700 }}>
          Fyn<span style={{ color: CA.teal }}>Help</span>
        </div>
        <div style={{ fontFamily: CA.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: CA.teal, marginTop: 2 }}>
          CA Portal
        </div>
        <CAHeading size={26} style={{ marginTop: 18 }}>Sign in</CAHeading>
        <p style={{ fontFamily: CA.sans, fontSize: 13.5, color: CA.muted, marginTop: 6 }}>
          Access your firm's client portfolio.
        </p>

        <form onSubmit={handleSubmit} style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <CAField label="Email">
            <input style={caInputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@cafirm.com" />
          </CAField>
          <CAField label="Password">
            <input style={caInputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
          </CAField>
          {error && <div style={{ fontFamily: CA.sans, fontSize: 13, color: CA.red }}>{error}</div>}
          <CAButton type="submit" disabled={loading} style={{ height: 46, fontSize: 14 }}>
            {loading ? "Signing in…" : "Sign in"}
          </CAButton>
        </form>

        <p style={{ fontFamily: CA.sans, fontSize: 13, color: CA.muted, marginTop: 18, textAlign: "center" }}>
          New CA firm?{" "}
          <Link to="/ca/register" style={{ color: CA.teal, fontWeight: 600 }}>Register</Link>
        </p>
      </CACard>
    </div>
  );
}
