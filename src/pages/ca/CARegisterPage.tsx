import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";
import FynLogo from "@/components/FynLogo";

const FEATURES = [
  "Portfolio dashboard — 50+ clients at a glance",
  "Bulk GST filing across clients",
  "ITC reconciliation engine",
  "Client alerts & notifications",
  "Automated compliance tracking",
];

type FormState = {
  firmName: string;
  icaiNumber: string;
  contactName: string;
  email: string;
  phone: string;
  password: string;
  confirm: string;
  agree: boolean;
};

const passwordStrength = (pw: string): { label: string; color: string; level: 0 | 1 | 2 | 3 } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length === 0) return { label: "", color: "transparent", level: 0 };
  if (score <= 1) return { label: "Weak", color: "#C41E1E", level: 1 };
  if (score === 2 || score === 3) return { label: "Medium", color: "#8B5A00", level: 2 };
  return { label: "Strong", color: "#1A6B3C", level: 3 };
};

export default function CARegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    firmName: "", icaiNumber: "", contactName: "",
    email: "", phone: "", password: "", confirm: "", agree: false,
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k: string) => setTouched((t) => ({ ...t, [k]: true }));

  const v = {
    firmName: form.firmName.trim().length >= 2,
    icaiNumber: /^[0-9]{4,7}[A-Za-z]?$/.test(form.icaiNumber.trim()),
    contactName: form.contactName.trim().length >= 2,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
    phone: /^[+0-9\s-]{10,16}$/.test(form.phone),
    password: form.password.length >= 8,
    confirm: form.confirm.length > 0 && form.confirm === form.password,
    agree: form.agree,
  };
  const allValid = Object.values(v).every(Boolean);
  const strength = passwordStrength(form.password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!allValid) {
      setTouched(Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      return;
    }
    setLoading(true);

    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/ca/dashboard`,
        data: { full_name: form.contactName },
      },
    });
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return; }

    if (authData.user) {
      const { error: firmErr } = await supabase.from("ca_firms").insert({
        user_id: authData.user.id,
        firm_name: form.firmName,
        membership_number: form.icaiNumber,
        email: form.email,
        phone: form.phone,
        is_active: false,
        is_verified: false,
      });
      if (firmErr) { setError(firmErr.message); setLoading(false); return; }
    }
    setLoading(false);
    setSuccess(true);
  };

  const fieldBorder = (key: keyof typeof v) => {
    if (!touched[key]) return "1.5px solid #D4C9A8";
    return v[key] ? "1.5px solid #1A6B3C" : "1.5px solid #C41E1E";
  };

  const inputStyle = (key: keyof typeof v): React.CSSProperties => ({
    border: fieldBorder(key),
    fontFamily: "Inter, sans-serif",
    background: "#fff",
  });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#EDE4CB" }}>
        <div className="bg-white rounded-xl p-10 shadow-lg text-center" style={{ maxWidth: "440px" }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center" style={{ background: "#DCFCE7" }}>
            <Check size={32} style={{ color: "#1A6B3C" }} strokeWidth={3} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "26px", color: "#1A1008" }}>
            Registration submitted
          </h2>
          <p className="mt-3" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(26,16,8,0.6)", lineHeight: 1.55 }}>
            We'll verify and activate your account within 24 hours. You'll receive an email confirmation shortly.
          </p>
          <button onClick={() => navigate("/ca/login")}
            className="mt-7 w-full rounded-lg hover:brightness-90"
            style={{ height: "48px", background: "#C41E1E", color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px" }}>
            Return to sign in →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: "#EDE4CB" }}>
      {/* LEFT */}
      <div
        className="md:w-[45%] w-full md:min-h-screen flex flex-col justify-between p-8 md:p-12"
        style={{ background: "#1A1008", color: "#fff", minHeight: "280px" }}
      >
        <div><FynLogo variant="light" showTagline={false} className="bg-muted" /></div>
        <div className="my-8 md:my-0 max-w-md">
          <h1 className="text-white" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "36px", lineHeight: 1.15 }}>
            CA Partner Portal
          </h1>
          <p className="mt-4" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", color: "rgba(255,255,255,0.75)", lineHeight: 1.55 }}>
            Manage multiple client portfolios. File GST returns. Run ITC reconciliations. All from one dashboard.
          </p>
          <ul className="mt-8 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(255,255,255,0.65)" }}>
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
      <div className="flex-1 flex items-start md:items-center justify-center p-5 md:p-10 py-10" style={{ background: "#F4EDDA" }}>
        <div className="w-full" style={{ maxWidth: "440px" }}>
          <div className="bg-white rounded-xl p-10 shadow-lg">
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "28px", color: "#1A1008" }}>
              Join as a CA Partner
            </h2>
            <p className="mt-1.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", color: "rgba(26,16,8,0.55)" }}>
              Manage unlimited client portfolios from one dashboard
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Firm Name */}
              <Field label="CA Firm Name" error={touched.firmName && !v.firmName ? "Required" : ""}>
                <input type="text" required placeholder="ABC & Associates"
                  value={form.firmName} onChange={(e) => set("firmName", e.target.value)}
                  onBlur={() => blur("firmName")}
                  className="w-full h-11 px-3.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle("firmName")} />
              </Field>

              {/* ICAI */}
              <Field
                label="ICAI Firm Registration Number"
                helper="Your firm's ICAI registration number"
                error={touched.icaiNumber && !v.icaiNumber ? "Enter a valid ICAI registration number" : ""}
              >
                <input type="text" required placeholder="123456W"
                  value={form.icaiNumber} onChange={(e) => set("icaiNumber", e.target.value)}
                  onBlur={() => blur("icaiNumber")}
                  className="w-full h-11 px-3.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle("icaiNumber")} />
              </Field>

              {/* Contact Name */}
              <Field label="Primary Contact Name (Partner)" error={touched.contactName && !v.contactName ? "Required" : ""}>
                <input type="text" required placeholder="CA Rajesh Mehta"
                  value={form.contactName} onChange={(e) => set("contactName", e.target.value)}
                  onBlur={() => blur("contactName")}
                  className="w-full h-11 px-3.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle("contactName")} />
              </Field>

              {/* Email */}
              <Field label="Firm Email Address" error={touched.email && !v.email ? "Enter a valid email" : ""}>
                <input type="email" required placeholder="contact@cafirm.com"
                  value={form.email} onChange={(e) => set("email", e.target.value)}
                  onBlur={() => blur("email")}
                  className="w-full h-11 px-3.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle("email")} />
              </Field>

              {/* Phone */}
              <Field label="Phone Number" error={touched.phone && !v.phone ? "Enter a valid phone number" : ""}>
                <input type="tel" required placeholder="+91 98765 43210"
                  value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  onBlur={() => blur("phone")}
                  className="w-full h-11 px-3.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle("phone")} />
              </Field>

              {/* Password */}
              <Field label="Create Password" error={touched.password && !v.password ? "Min 8 characters" : ""}>
                <input type="password" required
                  value={form.password} onChange={(e) => set("password", e.target.value)}
                  onBlur={() => blur("password")}
                  className="w-full h-11 px-3.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle("password")} />
                {form.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#F0EBD8" }}>
                      <div className="h-full transition-all"
                        style={{ width: `${(strength.level / 3) * 100}%`, background: strength.color }} />
                    </div>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </Field>

              {/* Confirm */}
              <Field label="Confirm Password" error={touched.confirm && !v.confirm ? "Passwords don't match" : ""}>
                <input type="password" required
                  value={form.confirm} onChange={(e) => set("confirm", e.target.value)}
                  onBlur={() => blur("confirm")}
                  className="w-full h-11 px-3.5 rounded-lg text-sm focus:outline-none"
                  style={inputStyle("confirm")} />
              </Field>

              {/* Agree */}
              <label className="flex items-start gap-2.5 pt-1 cursor-pointer">
                <input type="checkbox" checked={form.agree}
                  onChange={(e) => { set("agree", e.target.checked); blur("agree"); }}
                  className="mt-0.5 w-4 h-4 cursor-pointer accent-[#C41E1E]" />
                <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "13px", color: "rgba(26,16,8,0.75)", lineHeight: 1.5 }}>
                  I agree to FynHelp's{" "}
                  <a href="#" className="hover:underline" style={{ color: "#C41E1E" }}>CA Partner Terms</a>
                  {" "}and{" "}
                  <a href="#" className="hover:underline" style={{ color: "#C41E1E" }}>Privacy Policy</a>
                </span>
              </label>
              {touched.agree && !v.agree && (
                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "12px", color: "#C41E1E" }}>
                  You must accept the terms to continue
                </p>
              )}

              {error && (
                <div className="rounded-md p-3" style={{ background: "#F9EDED", color: "#C41E1E", fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={!allValid || loading}
                className="w-full rounded-lg transition-opacity disabled:opacity-50 hover:brightness-90"
                style={{ height: "48px", background: "#C41E1E", color: "#fff", fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "15px" }}>
                {loading ? "Creating account…" : "Create partner account →"}
              </button>

              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px" style={{ background: "#D4C9A8" }} />
                <span style={{ fontFamily: "Inter, sans-serif", fontSize: "11px", fontWeight: 600, color: "rgba(26,16,8,0.4)", letterSpacing: "0.1em" }}>OR</span>
                <div className="flex-1 h-px" style={{ background: "#D4C9A8" }} />
              </div>

              <Link to="/ca/login"
                className="block text-center hover:underline"
                style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "14px", color: "#1A1008" }}>
                Already have an account? Sign in →
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, helper, error, children }: { label: string; helper?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block mb-1.5" style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: "13px", color: "#1A1008" }}>
        {label}
      </label>
      {children}
      {helper && !error && (
        <p className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "rgba(26,16,8,0.45)" }}>
          {helper}
        </p>
      )}
      {error && (
        <p className="mt-1" style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "12px", color: "#C41E1E" }}>
          {error}
        </p>
      )}
    </div>
  );
}
