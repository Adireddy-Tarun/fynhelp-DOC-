import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Check } from "lucide-react";
import { COLORS, PrimaryBtn } from "@/components/ca/ui";

const STATES = ["andhra pradesh","arunachal pradesh","assam","bihar","chhattisgarh","goa","gujarat","haryana","himachal pradesh","jharkhand","karnataka","kerala","madhya pradesh","maharashtra","manipur","meghalaya","mizoram","nagaland","odisha","punjab","rajasthan","sikkim","tamil nadu","telangana","tripura","uttar pradesh","uttarakhand","west bengal","delhi","chandigarh"];

export default function CARegisterPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullName: "", firmName: "", membership: "", email: "", mobile: "",
    city: "", state: "karnataka", password: "", confirm: "", agree: false,
  });
  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    if (!form.agree) { setError("Please confirm the partner terms"); return; }
    setLoading(true);

    const { data, error: err } = await supabase.auth.signUp({
      email: form.email, password: form.password,
      options: { emailRedirectTo: `${window.location.origin}/ca/dashboard`, data: { full_name: form.fullName } },
    });
    if (err) { setError(err.message); setLoading(false); return; }

    if (data.user) {
      // BACKEND: insert ca_firms row, is_verified = false
      const { error: insErr } = await supabase.from("ca_firms").insert({
        user_id: data.user.id,
        firm_name: form.firmName,
        membership_number: form.membership,
        email: form.email,
        phone: form.mobile,
        city: form.city,
        state: form.state,
        is_verified: false,
      });
      if (insErr) { setError(insErr.message); setLoading(false); return; }
      // BACKEND: send verification email via Resend
    }
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans" style={{ background: COLORS.caSurface, color: COLORS.ink }}>
        <div className="bg-white rounded-[10px] p-12 max-w-md text-center" style={{ border: `1px solid ${COLORS.caBorder}` }}>
          <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: "#DCFCE7" }}>
            <Check size={32} style={{ color: COLORS.green }} strokeWidth={3} />
          </div>
          <h2 className="text-[24px] font-bold mb-3">Application submitted</h2>
          <p className="text-[14px] mb-8" style={{ color: "rgba(26,16,8,0.60)" }}>
            We'll email you within 24 hours once your ICAI membership is verified.
          </p>
          <Link to="/ca/login" className="text-sm font-medium" style={{ color: COLORS.red }}>Return to login →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans" style={{ color: COLORS.ink }}>
      <div className="hidden md:flex w-1/2 flex-col p-12" style={{ background: COLORS.ink }}>
        <div>
          <div className="text-white font-bold text-2xl tracking-tight">FynHelp</div>
          <div className="text-[12px] font-medium uppercase tracking-[0.10em] mt-0.5" style={{ color: COLORS.gold }}>CA Partner Portal</div>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <h1 className="text-[32px] font-bold leading-tight text-white">Built for CAs who manage more than one client.</h1>
          <p className="text-[15px] mt-4" style={{ color: "rgba(255,255,255,0.65)" }}>
            One portal for your entire client portfolio.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 py-10 overflow-y-auto" style={{ background: COLORS.caSurface }}>
        <div className="w-full max-w-[440px]">
          <div className="bg-white rounded-[10px] p-8" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            <h2 className="text-[22px] font-bold mb-1.5">Apply for CA Partner Access</h2>
            <p className="text-[13px] mb-7" style={{ color: "rgba(26,16,8,0.50)" }}>
              We verify all CA registrations. Access granted within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {[
                { k: "fullName", l: "Full Name", t: "text" },
                { k: "firmName", l: "CA Firm Name", t: "text" },
                { k: "membership", l: "ICAI Membership Number", t: "text", ph: "XXXXXX" },
                { k: "email", l: "Email Address", t: "email" },
                { k: "mobile", l: "Mobile Number", t: "tel", ph: "+91 98XXX XXXXX" },
                { k: "city", l: "City", t: "text" },
              ].map((f) => (
                <div key={f.k}>
                  <label className="block text-xs font-medium mb-1">{f.l}*</label>
                  <input
                    type={f.t} required placeholder={f.ph} value={(form as any)[f.k]}
                    onChange={(e) => set(f.k, e.target.value)}
                    className="w-full h-10 px-3 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#C41E1E]/20"
                    style={{ border: `1px solid ${COLORS.caBorder}` }}
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium mb-1">State*</label>
                <select required value={form.state} onChange={(e) => set("state", e.target.value)}
                  className="w-full h-10 px-3 rounded text-sm bg-white focus:outline-none"
                  style={{ border: `1px solid ${COLORS.caBorder}` }}>
                  {STATES.map((s) => <option key={s} value={s} className="capitalize">{s.replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Password*</label>
                <input type="password" required minLength={8} value={form.password} onChange={(e) => set("password", e.target.value)}
                  className="w-full h-10 px-3 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}` }} />
                <div className="text-[10px] mt-1" style={{ color: "rgba(26,16,8,0.50)" }}>Min 8 characters</div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Confirm Password*</label>
                <input type="password" required value={form.confirm} onChange={(e) => set("confirm", e.target.value)}
                  className="w-full h-10 px-3 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}` }} />
              </div>

              <label className="flex items-start gap-2 text-[12px]" style={{ color: "rgba(26,16,8,0.70)" }}>
                <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-0.5" />
                <span>I confirm I am a registered CA with ICAI and agree to FynHelp's partner terms.</span>
              </label>

              {error && <div className="text-xs" style={{ color: COLORS.red }}>{error}</div>}

              <PrimaryBtn type="submit" full size="lg" disabled={loading}>{loading ? "Submitting…" : "Submit Application"}</PrimaryBtn>
            </form>
          </div>

          <p className="text-[13px] text-center mt-4" style={{ color: "rgba(26,16,8,0.50)" }}>
            Already have an account? <Link to="/ca/login" className="font-medium" style={{ color: COLORS.red }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
