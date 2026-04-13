import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, Landmark, BookOpen, Rocket, ChevronLeft, Check } from "lucide-react";

const steps = [
  { label: "Business Profile", icon: Building2 },
  { label: "Connect Bank", icon: Landmark },
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

const banks = [
  "HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra", "Yes Bank",
  "IndusInd Bank", "PNB", "Bank of Baroda", "Canara Bank", "Union Bank",
  "UCO Bank", "IDBI Bank", "Federal Bank", "RBL Bank", "South Indian Bank",
  "Bandhan Bank", "IDFC First", "AU Small Finance", "Karnataka Bank",
];

const OnboardingPage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    business_type: "", industry: "", turnover_range: "", state: "",
    msme_udyam: "", employee_count: "", selectedBank: "", accountingSoftware: "",
  });
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const updateField = (key: string, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleLaunch = async () => {
    if (!user) return;
    setSaving(true);
    // Create business
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
      // Link profile to business
      await supabase.from("profiles").update({ business_id: biz.id }).eq("user_id", user.id);

      // Create bank account if selected
      if (form.selectedBank) {
        await supabase.from("bank_accounts").insert({
          business_id: biz.id,
          bank_name: form.selectedBank,
        });
      }
    }
    setSaving(false);
    navigate("/dashboard/cockpit");
  };

  const inputClass = "w-full h-[42px] px-4 bg-fyn-beige border border-fyn-ink-10 rounded text-fyn-ink text-sm focus:outline-none focus:ring-2 focus:ring-fyn-red";
  const selectClass = inputClass + " appearance-none";

  return (
    <div className="min-h-screen bg-fyn-beige">
      {/* Progress bar */}
      <div className="bg-fyn-ink py-4">
        <div className="fyn-container flex items-center justify-center gap-4">
          {steps.map((s, i) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i < step ? "bg-fyn-success text-white" : i === step ? "bg-fyn-red text-white" : "bg-white/10 text-white/40"
              }`}>
                {i < step ? <Check size={16} /> : i + 1}
              </div>
              <span className={`hidden md:inline text-sm ${i === step ? "text-white" : "text-white/40"}`}>{s.label}</span>
              {i < steps.length - 1 && <div className="w-8 h-0.5 bg-white/10" />}
            </div>
          ))}
        </div>
      </div>

      <div className="fyn-container max-w-2xl py-12">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-fyn-gold text-sm mb-6 hover:underline">
            <ChevronLeft size={16} /> Back
          </button>
        )}

        {/* Step 1: Business Profile */}
        {step === 0 && (
          <div>
            <h1 className="text-3xl text-fyn-ink font-serif mb-2">Tell us about your business</h1>
            <p className="text-fyn-ink/60 mb-8">This helps Nidhi personalize your financial intelligence.</p>
            <div className="space-y-4">
              <div>
                <label className="text-fyn-ink/70 text-sm mb-1 block">Business type</label>
                <select value={form.business_type} onChange={(e) => updateField("business_type", e.target.value)} className={selectClass} aria-label="Business type">
                  <option value="">Select type</option>
                  {["Pvt Ltd", "LLP", "Proprietorship", "Partnership"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-fyn-ink/70 text-sm mb-1 block">Industry vertical</label>
                <select value={form.industry} onChange={(e) => updateField("industry", e.target.value)} className={selectClass} aria-label="Industry">
                  <option value="">Select industry</option>
                  {industries.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="text-fyn-ink/70 text-sm mb-1 block">Annual turnover range</label>
                <select value={form.turnover_range} onChange={(e) => updateField("turnover_range", e.target.value)} className={selectClass} aria-label="Turnover range">
                  <option value="">Select range</option>
                  {["< ₹1 Cr", "₹1–5 Cr", "₹5–25 Cr", "₹25–100 Cr", "₹100 Cr+"].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-fyn-ink/70 text-sm mb-1 block">State of registration</label>
                <select value={form.state} onChange={(e) => updateField("state", e.target.value)} className={selectClass} aria-label="State">
                  <option value="">Select state</option>
                  {states.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-fyn-ink/70 text-sm mb-1 block">MSME Udyam number (optional)</label>
                <input value={form.msme_udyam} onChange={(e) => updateField("msme_udyam", e.target.value)} className={inputClass} placeholder="UDYAM-XX-00-0000000" aria-label="MSME Udyam number" />
              </div>
              <div>
                <label className="text-fyn-ink/70 text-sm mb-1 block">Number of employees</label>
                <select value={form.employee_count} onChange={(e) => updateField("employee_count", e.target.value)} className={selectClass} aria-label="Employee count">
                  <option value="">Select range</option>
                  {["1-5", "6-10", "11-25", "26-50", "51-100", "100+"].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setStep(1)} className="mt-8 bg-fyn-red text-white font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
              Continue →
            </button>
          </div>
        )}

        {/* Step 2: Connect Bank */}
        {step === 1 && (
          <div>
            <h1 className="text-3xl text-fyn-ink font-serif mb-2">Connect your bank — no passwords needed</h1>
            <p className="text-fyn-ink/60 mb-8">We use RBI's Account Aggregator — the same technology used by India's largest banks. You share only what you consent to, and you can revoke access anytime.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {banks.map((b) => (
                <button
                  key={b}
                  onClick={() => updateField("selectedBank", b)}
                  className={`p-3 rounded-lg border text-sm text-center transition-colors ${
                    form.selectedBank === b ? "border-fyn-red bg-fyn-red-light text-fyn-ink" : "border-fyn-ink-10 bg-fyn-beige-dark text-fyn-ink/70 hover:border-fyn-ink/30"
                  }`}
                  aria-label={`Select ${b}`}
                >
                  {b}
                </button>
              ))}
            </div>
            <p className="text-fyn-ink/40 text-sm mb-6">
              <button className="text-fyn-gold hover:underline">Upload PDF bank statement instead →</button>
            </p>
            <p className="text-fyn-ink/40 text-xs italic mb-8">
              Why are we asking this? Nidhi needs your transaction data to compute your cash position, burn rate, and runway. This is the most important connection you'll make.
            </p>
            <button onClick={() => setStep(2)} className="bg-fyn-red text-white font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
              Continue →
            </button>
            <button onClick={() => setStep(2)} className="ml-4 text-fyn-ink/50 text-sm hover:underline">
              Skip for now
            </button>
          </div>
        )}

        {/* Step 3: Sync Books */}
        {step === 2 && (
          <div>
            <h1 className="text-3xl text-fyn-ink font-serif mb-2">Sync your accounting software</h1>
            <p className="text-fyn-ink/60 mb-8">Connect your books so Nidhi can read your ledger data.</p>
            <div className="space-y-3">
              {[
                { name: "Tally Prime", desc: "ODBC agent — installs in 5 minutes", value: "tally" },
                { name: "Zoho Books", desc: "OAuth connect — instant", value: "zoho" },
                { name: "QuickBooks India", desc: "OAuth connect — instant", value: "quickbooks" },
                { name: "Busy Accounting", desc: "CSV upload", value: "busy" },
                { name: "Manual entry / CSV upload", desc: "Upload your data manually", value: "csv" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateField("accountingSoftware", opt.value)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    form.accountingSoftware === opt.value ? "border-fyn-red bg-fyn-red-light" : "border-fyn-ink-10 bg-fyn-beige-dark hover:border-fyn-ink/30"
                  }`}
                  aria-label={`Select ${opt.name}`}
                >
                  <span className="text-fyn-ink font-medium text-sm">{opt.name}</span>
                  <span className="text-fyn-ink/50 text-xs ml-2">{opt.desc}</span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setStep(3)} className="bg-fyn-red text-white font-medium px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">
                Continue →
              </button>
              <button onClick={() => setStep(3)} className="text-fyn-ink/50 text-sm hover:underline">
                Skip — I'll set this up later
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Launch */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl text-fyn-ink font-serif mb-2">Nidhi is ready. Here's what she's found.</h1>
            <p className="text-fyn-ink/60 mb-8">
              {form.selectedBank
                ? `We've connected ${form.selectedBank} and are ready to start monitoring.`
                : "Connect a bank account anytime to unlock full cash intelligence."
              }
            </p>

            {/* Preview dashboard mockup */}
            <div className="bg-fyn-ink rounded-xl p-6 mb-8">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/40 text-xs fyn-label">Cash Runway</p>
                  <p className="text-white text-2xl fyn-metric mt-1">— days</p>
                  <p className="text-white/30 text-xs">Awaiting bank data</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/40 text-xs fyn-label">Bank Balance</p>
                  <p className="text-white text-2xl fyn-metric mt-1">—</p>
                  <p className="text-white/30 text-xs">Connect to see</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/40 text-xs fyn-label">GST Notice Risk</p>
                  <p className="text-white text-2xl fyn-metric mt-1">—</p>
                  <p className="text-white/30 text-xs">Enter GSTIN to score</p>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-fyn-red flex items-center justify-center text-white text-sm font-bold shrink-0">N</div>
                <p className="text-white/70 text-sm">Welcome! I'm Nidhi, your AI CFO. Once your data starts flowing, I'll give you your first morning brief within 24 hours.</p>
              </div>
            </div>

            <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-4 mb-8">
              <h3 className="text-fyn-ink font-serif text-lg mb-2">Setup summary</h3>
              <ul className="space-y-1 text-sm text-fyn-ink/70">
                <li>Business type: {form.business_type || "Not set"}</li>
                <li>Industry: {form.industry || "Not set"}</li>
                <li>Turnover: {form.turnover_range || "Not set"}</li>
                <li>Bank: {form.selectedBank || "Not connected"}</li>
                <li>Accounting: {form.accountingSoftware || "Not connected"}</li>
              </ul>
            </div>

            <button
              onClick={handleLaunch}
              disabled={saving}
              className="bg-fyn-red text-white font-medium px-10 py-4 rounded-lg text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
