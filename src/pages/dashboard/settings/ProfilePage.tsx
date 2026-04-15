import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect as useEffectExtra } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const roles = ["CEO / Founder", "CFO / Finance Head", "HR Manager", "Accountant", "Operations Manager", "Other"];
const languages = [
  { code: "en", label: "EN" },
  { code: "hi", label: "HI" },
  { code: "gu", label: "GU" },
  { code: "ta", label: "TA" },
  { code: "mr", label: "MR" },
];

const ProfilePage = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    display_name: "",
    mobile: "",
    whatsapp_phone: "",
    whatsapp_same: true,
    role: "CEO / Founder",
    language_preference: "en",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        display_name: (profile as any).display_name || "",
        mobile: profile.mobile || "",
        whatsapp_phone: (profile as any).whatsapp_phone || "",
        whatsapp_same: !(profile as any).whatsapp_phone || (profile as any).whatsapp_phone === profile.mobile,
        role: profile.role || "CEO / Founder",
        language_preference: profile.language_preference || "en",
      });
    }
  }, [profile]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.full_name || form.full_name.length < 2) errs.full_name = "Name must be at least 2 characters";
    if (form.full_name.length > 60) errs.full_name = "Name must be under 60 characters";
    if (form.mobile && !/^\d{10}$/.test(form.mobile)) errs.mobile = "Enter a valid 10-digit number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: form.full_name,
      display_name: form.display_name,
      mobile: form.mobile,
      whatsapp_phone: form.whatsapp_same ? form.mobile : form.whatsapp_phone,
      role: form.role,
      language_preference: form.language_preference,
    } as any).eq("user_id", user?.id || "");
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated successfully" });
    }
  };

  const completionItems = [
    { done: !!form.full_name, label: "Add full name" },
    { done: !!form.mobile, label: "Add mobile number" },
    { done: true, label: "Verify email" },
    { done: !!form.role, label: "Set your role" },
  ];
  const completion = Math.round((completionItems.filter(i => i.done).length / completionItems.length) * 100);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Form */}
      <div className="flex-1 max-w-2xl">
        <h2 className="font-serif text-2xl font-bold mb-6" style={{ color: "#1A1008" }}>Personal Information</h2>

        {/* Avatar row */}
        <div className="flex items-center gap-4 mb-7">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white font-bold text-[28px]"
            style={{ background: "#C41E1E" }}>
            {form.full_name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-[16px]" style={{ color: "#1A1008" }}>{form.full_name || "Your Name"}</p>
            <p className="text-[13px]" style={{ color: "rgba(26,16,8,0.60)" }}>{user?.email}</p>
            <button className="mt-1 text-[13px] px-3 py-1 border rounded" style={{ borderColor: "#E0D9C8", color: "#1A1008" }}>
              Change photo
            </button>
            {/* // BACKEND NEEDED: Upload to profile-photos bucket */}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          <Field label="Full Name *" error={errors.full_name}>
            <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
              placeholder="Enter your full name"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
              style={{ borderColor: errors.full_name ? "#C41E1E" : "#E0D9C8", color: "#1A1008" }}
              onBlur={validate} />
          </Field>

          <Field label="Display Name" helper="Nidhi will call you by this name in briefs">
            <input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
              placeholder="e.g. Tarun"
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
              style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
          </Field>

          <Field label="Email Address *" helper="To change email, use Security settings">
            <div className="relative">
              <input value={user?.email || ""} disabled
                className="w-full px-3 py-2.5 border rounded-lg text-sm"
                style={{ borderColor: "#E0D9C8", color: "#1A1008", background: "#FAF7F0" }} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium" style={{ color: "#16A34A" }}>Verified ✓</span>
            </div>
          </Field>

          <Field label="Mobile Number *" helper="Used for WhatsApp alerts from Nidhi" error={errors.mobile}>
            <div className="flex gap-2">
              <span className="px-3 py-2.5 border rounded-lg text-sm" style={{ borderColor: "#E0D9C8", color: "#1A1008", background: "#FAF7F0" }}>+91</span>
              <input value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                placeholder="10-digit number"
                className="flex-1 px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                style={{ borderColor: errors.mobile ? "#C41E1E" : "#E0D9C8", color: "#1A1008" }}
                onBlur={validate} />
            </div>
          </Field>

          <Field label="WhatsApp Number" helper="Nidhi sends daily briefs to this number">
            <label className="flex items-center gap-2 mb-2 cursor-pointer">
              <input type="checkbox" checked={form.whatsapp_same}
                onChange={e => setForm(f => ({ ...f, whatsapp_same: e.target.checked }))}
                className="accent-[#C41E1E]" />
              <span className="text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>Same as mobile</span>
            </label>
            {!form.whatsapp_same && (
              <input value={form.whatsapp_phone} onChange={e => setForm(f => ({ ...f, whatsapp_phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                placeholder="10-digit WhatsApp number"
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
                style={{ borderColor: "#E0D9C8", color: "#1A1008" }} />
            )}
          </Field>

          <Field label="Your role in the business" helper="We personalise your dashboard view by role">
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-[#C41E1E]"
              style={{ borderColor: "#E0D9C8", color: "#1A1008" }}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </Field>

          <Field label="Language preference" helper="Nidhi speaks to you in this language">
            <div className="flex gap-2">
              {languages.map(l => (
                <button key={l.code}
                  onClick={() => setForm(f => ({ ...f, language_preference: l.code }))}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: form.language_preference === l.code ? "#C41E1E" : "#FFFFFF",
                    color: form.language_preference === l.code ? "#FFFFFF" : "#1A1008",
                    border: `1.5px solid ${form.language_preference === l.code ? "#C41E1E" : "#E0D9C8"}`,
                  }}>
                  {l.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        {/* Divider */}
        <div className="my-7 border-t" style={{ borderColor: "#E0D9C8" }} />

        <div className="mb-4">
          <p className="text-[14px] font-semibold" style={{ color: "#1A1008" }}>Password & Security</p>
          <a href="/dashboard/settings/security" className="text-[13px] block mt-1" style={{ color: "rgba(26,16,8,0.50)" }}>Change your password →</a>
          <a href="/dashboard/settings/security" className="text-[13px] block mt-1" style={{ color: "rgba(26,16,8,0.50)" }}>Two-factor authentication →</a>
        </div>

        {/* Save */}
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving}
            className="px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-[2px]"
            style={{ background: saving ? "#E0D9C8" : "#C41E1E" }}>
            {saving ? "Saving..." : "Save changes"}
          </button>
          <button className="px-6 py-3 rounded-lg text-sm font-medium border" style={{ borderColor: "#E0D9C8", color: "rgba(26,16,8,0.60)" }}>
            Cancel
          </button>
        </div>
      </div>

      {/* Live preview card */}
      <div className="w-full lg:w-[320px] lg:sticky lg:top-[120px] lg:self-start">
        <p className="text-[10px] font-semibold tracking-[0.10em] mb-3" style={{ color: "#8B6914" }}>HOW NIDHI SEES YOU</p>
        <div className="rounded-lg p-5" style={{ background: "#1A1008" }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: "#C41E1E" }}>N</div>
            <span className="text-[13px] font-medium text-white">Nidhi</span>
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.80)" }}>
            Good morning, {form.display_name || form.full_name || "there"}! Here's your business update for today...
          </p>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-medium" style={{ color: "#1A1008" }}>Profile {completion}% complete</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#E0D9C8" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completion}%`, background: "#C41E1E" }} />
          </div>
          <div className="mt-3 space-y-1">
            {completionItems.filter(i => !i.done).map(i => (
              <p key={i.label} className="text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>● {i.label}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, helper, error, children }: { label: string; helper?: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>{label}</label>
    {children}
    {error && <p className="text-[12px] mt-1" style={{ color: "#C41E1E" }}>{error}</p>}
    {helper && !error && <p className="text-[11px] mt-1" style={{ color: "rgba(26,16,8,0.45)" }}>{helper}</p>}
  </div>
);

export default ProfilePage;
