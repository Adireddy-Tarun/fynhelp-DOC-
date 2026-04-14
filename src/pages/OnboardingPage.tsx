import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Landmark, BookOpen, Rocket, ChevronLeft, Check } from "lucide-react";
import StepConnectBanks from "@/components/onboarding/StepConnectBanks";
import StepSyncBooks from "@/components/onboarding/StepSyncBooks";

const steps = [
  { label: "Business Profile", icon: Building2 },
  { label: "Connect Banks", icon: Landmark },
  { label: "Sync Books", icon: BookOpen },
  { label: "Review & Launch", icon: Rocket },
];

const industries = [
  "Textile & Apparel", "Manufacturing", "IT & Software", "Healthcare", "Real Estate",
  "Retail & FMCG", "Construction", "Agriculture", "Education", "Hospitality",
  "Transport & Logistics", "Pharma", "Automotive", "Food & Beverage", "Export/Import",
  "Media & Entertainment", "Professional Services", "E-Commerce", "Energy", "Other",
];

const states = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    business_type: "", industry: "", turnover_range: "", state: "",
    msme_udyam: "", employee_count: "",
  });
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const updateField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleLaunch = async () => {
    if (!user) return;
    setSaving(true);
    const { data: biz } = await supabase.from("businesses").insert({
      business_name: form.industry ? `My ${form.industry} Business` : "My Business",
      business_type: form.business_type,
      industry: form.industry,
      turnover_range: form.turnover_range,
      state: form.state,
      msme_udyam: form.msme_udyam || null,
      employee_count: form.employee_count,
    }).select("id").single();

    if (biz) {
      await supabase.from("profiles").update({ business_id: biz.id }).eq("user_id", user.id);
      for (const bankName of selectedBanks) {
        await supabase.from("bank_accounts").insert({ business_id: biz.id, bank_name: bankName });
      }
    }
    setSaving(false);
    navigate("/dashboard/cockpit");
  };

  const inputClass = "w-full h-[42px] px-4 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--fyn-red))]";
  const selectClass = inputClass + " appearance-none";

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--fyn-beige))" }}>
      {/* Progress bar */}
      <div className="py-4" style={{ background: "hsl(var(--fyn-ink))" }}>
        <div className="fyn-container flex items-center justify-center gap-4">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < step ? "text-white" : i === step ? "text-white" : "text-white/40"
              }`} style={{
                background: i < step ? "hsl(var(--fyn-success))" : i === step ? "hsl(var(--fyn-red))" : "rgba(255,255,255,0.10)",
              }}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`hidden md:inline text-sm ${i === step ? "text-white" : "text-white/40"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-8 h-0.5 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>

      <div className="fyn-container max-w-4xl py-12">
        {step === 0 && (
          <div className="max-w-2xl">
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm mb-6 hover:underline" style={{ color: "hsl(var(--fyn-gold))" }}>
                <ChevronLeft size={16} /> Back
              </button>
            )}
            <h1 className="text-3xl font-serif mb-2" style={{ color: "hsl(var(--fyn-ink))" }}>Tell us about your business</h1>
            <p className="mb-8" style={{ color: "hsl(var(--fyn-ink) / 0.60)" }}>This helps Nidhi personalize your financial intelligence.</p>
            <div className="space-y-4">
              {[
                { key: "business_type", label: "Business type", options: ["Pvt Ltd", "LLP", "Proprietorship", "Partnership"] },
                { key: "industry", label: "Industry vertical", options: industries },
                { key: "turnover_range", label: "Annual turnover range", options: ["< ₹1 Cr", "₹1–5 Cr", "₹5–25 Cr", "₹25–100 Cr", "₹100 Cr+"] },
                { key: "state", label: "State of registration", options: states },
                { key: "employee_count", label: "Number of employees", options: ["1-5", "6-10", "11-25", "26-50", "51-100", "100+"] },
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label className="text-sm mb-1 block" style={{ color: "hsl(var(--fyn-ink) / 0.70)" }}>{label}</label>
                  <select
                    value={(form as any)[key]}
                    onChange={(e) => updateField(key, e.target.value)}
                    className={selectClass}
                    style={{ background: "hsl(var(--fyn-beige))", borderColor: "hsl(var(--fyn-ink) / 0.10)", color: "hsl(var(--fyn-ink))" }}
                  >
                    <option value="">Select {label.toLowerCase()}</option>
                    {options.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-sm mb-1 block" style={{ color: "hsl(var(--fyn-ink) / 0.70)" }}>MSME Udyam number (optional)</label>
                <input
                  value={form.msme_udyam}
                  onChange={(e) => updateField("msme_udyam", e.target.value)}
                  className={inputClass}
                  style={{ background: "hsl(var(--fyn-beige))", borderColor: "hsl(var(--fyn-ink) / 0.10)", color: "hsl(var(--fyn-ink))" }}
                  placeholder="UDYAM-XX-00-0000000"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-8 px-8 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              style={{ background: "hsl(var(--fyn-red))" }}
            >
              Continue →
            </button>
          </div>
        )}

        {step === 1 && (
          <StepConnectBanks
            selectedBanks={selectedBanks}
            setSelectedBanks={setSelectedBanks}
            onContinue={() => setStep(2)}
            onSkip={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepSyncBooks
            selectedSoftware={selectedSoftware}
            setSelectedSoftware={setSelectedSoftware}
            onContinue={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <div className="max-w-2xl">
            <h1 className="text-3xl font-serif mb-2" style={{ color: "hsl(var(--fyn-ink))" }}>Nidhi is ready. Here's what she's found.</h1>
            <p className="mb-8" style={{ color: "hsl(var(--fyn-ink) / 0.60)" }}>
              {selectedBanks.length > 0
                ? `We've connected ${selectedBanks.length} bank${selectedBanks.length > 1 ? "s" : ""} and are ready to start monitoring.`
                : "Connect a bank account anytime to unlock full cash intelligence."}
            </p>

            <div className="rounded-xl p-6 mb-8" style={{ background: "hsl(var(--fyn-ink))" }}>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: "Cash Runway", value: "— days", sub: "Awaiting bank data" },
                  { label: "Bank Balance", value: "—", sub: "Connect to see" },
                  { label: "GST Notice Risk", value: "—", sub: "Enter GSTIN to score" },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <p className="text-xs text-white/40 fyn-label">{m.label}</p>
                    <p className="text-2xl text-white fyn-metric mt-1">{m.value}</p>
                    <p className="text-xs text-white/30">{m.sub}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg p-4 flex gap-3 items-start" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: "hsl(var(--fyn-red))" }}>N</div>
                <p className="text-sm text-white/70">Welcome! I'm Nidhi, your AI CFO. Once your data starts flowing, I'll give you your first morning brief within 24 hours.</p>
              </div>
            </div>

            <div className="rounded-lg p-4 mb-8 border" style={{ background: "hsl(var(--fyn-beige-dark))", borderColor: "hsl(var(--fyn-ink) / 0.10)" }}>
              <h3 className="font-serif text-lg mb-2" style={{ color: "hsl(var(--fyn-ink))" }}>Setup summary</h3>
              <ul className="space-y-1 text-sm" style={{ color: "hsl(var(--fyn-ink) / 0.70)" }}>
                <li>Business type: {form.business_type || "Not set"}</li>
                <li>Industry: {form.industry || "Not set"}</li>
                <li>Turnover: {form.turnover_range || "Not set"}</li>
                <li>Banks: {selectedBanks.length > 0 ? selectedBanks.join(", ") : "Not connected"}</li>
                <li>Accounting: {selectedSoftware.length > 0 ? selectedSoftware.join(", ") : "Not connected"}</li>
              </ul>
            </div>

            <button
              onClick={handleLaunch}
              disabled={saving}
              className="px-10 py-4 rounded-lg text-lg font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "hsl(var(--fyn-red))" }}
            >
              {saving ? "Setting up..." : "Open My Dashboard →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingPage;
