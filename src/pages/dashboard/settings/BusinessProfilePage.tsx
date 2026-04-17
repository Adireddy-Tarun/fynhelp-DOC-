import { useState } from "react";
import { ChevronDown } from "lucide-react";

/* ============================================================
   FynHelp — Business Profile
   Inter only · static UI · backend stubbed
   ============================================================ */

const PAGE_WRAP: React.CSSProperties = {
  maxWidth: 900, margin: "0 auto", padding: "40px 48px", fontFamily: "'Inter', sans-serif",
};

const CARD: React.CSSProperties = {
  background: "#FFFFFF", border: "1px solid #D4C9A8", borderRadius: 10, padding: 28, marginBottom: 24,
};

const LABEL: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#1A1008",
  marginBottom: 6, display: "block",
};

const HELPER: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12,
  color: "rgba(26,16,8,0.50)", marginTop: 6,
};

const inputStyle = (focused: boolean): React.CSSProperties => ({
  width: "100%", height: 42, padding: "0 12px",
  background: "#FFFFFF",
  border: focused ? "1.5px solid #C41E1E" : "1px solid #D4C9A8",
  borderRadius: 6, outline: "none",
  boxShadow: focused ? "0 0 0 3px rgba(196,30,30,0.08)" : "none",
  fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: "#1A1008",
  transition: "border-color 150ms, box-shadow 150ms",
});

const Section = ({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) => (
  <div style={CARD}>
    <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1008", marginBottom: 4 }}>{title}</h2>
    {sub && <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.55)", marginBottom: 24 }}>{sub}</p>}
    {children}
  </div>
);

const Field = ({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={LABEL}>{label}</label>
    {children}
    {helper && <p style={HELPER}>{helper}</p>}
  </div>
);

const TextInput = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
      style={inputStyle(focused)}
    />
  );
};

const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ ...inputStyle(focused), appearance: "none", paddingRight: 36, cursor: "pointer" }}
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={16} style={{ position: "absolute", right: 12, top: 13, color: "rgba(26,16,8,0.40)", pointerEvents: "none" }} />
    </div>
  );
};

const PillGroup = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
    {options.map((opt) => {
      const active = value === opt;
      return (
        <button
          key={opt} onClick={() => onChange(opt)}
          style={{
            padding: "9px 16px", borderRadius: 6,
            background: active ? "#C41E1E" : "rgba(26,16,8,0.05)",
            color: active ? "#FFFFFF" : "#1A1008",
            border: active ? "1px solid #C41E1E" : "1px solid transparent",
            fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 500, fontSize: 13,
            cursor: "pointer", transition: "all 150ms",
          }}
          onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "#FDF2F1"; e.currentTarget.style.border = "1px solid #C41E1E"; } }}
          onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "rgba(26,16,8,0.05)"; e.currentTarget.style.border = "1px solid transparent"; } }}
        >
          {opt}
        </button>
      );
    })}
  </div>
);

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Dadra and Nagar Haveli and Daman and Diu","Delhi",
  "Jammu and Kashmir","Ladakh","Lakshadweep","Puducherry",
];

const BusinessProfilePage = () => {
  // BACKEND: load from `businesses` row by get_user_business_id()
  const [businessName, setBusinessName] = useState("Mehta Textile Traders");
  const [entityType, setEntityType] = useState("Private Limited Company");
  const [gstin, setGstin] = useState("27AABCM1234F1Z5");
  const [pan, setPan] = useState("AABCM1234F");
  const [industry, setIndustry] = useState("Textile & Apparel");
  const [turnover, setTurnover] = useState("₹5-25 Cr");
  const [stateReg, setStateReg] = useState("Maharashtra");
  const [employees, setEmployees] = useState("16-50");
  const [fyStart, setFyStart] = useState("April (Indian FY)");
  const [msme, setMsme] = useState("");
  const [cin, setCin] = useState("");
  const [iec, setIec] = useState("");
  const [addr1, setAddr1] = useState("Plot 12, MIDC Industrial Area");
  const [addr2, setAddr2] = useState("Phase II");
  const [city, setCity] = useState("Mumbai");
  const [addrState, setAddrState] = useState("Maharashtra");
  const [pin, setPin] = useState("400093");

  const showCin = ["Private Limited Company", "Limited Liability Partnership", "One Person Company", "Public Limited Company"].includes(entityType);
  const showIec = industry === "Export & Import";

  // BACKEND: compute from non-null fields in businesses table
  const completion = 80;

  const entityNote =
    entityType === "Private Limited Company" || entityType === "Public Limited Company" || entityType === "One Person Company"
      ? "ROC, MCA, and board meeting compliance will be tracked"
      : entityType === "Sole Proprietorship"
      ? "No ROC obligations. GST and IT only."
      : "Filing obligations vary by entity type";

  return (
    <div style={PAGE_WRAP}>
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Business Profile</h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "rgba(26,16,8,0.60)", marginTop: 6 }}>
        Your business details are used by AI CFO Nidhi to personalise every insight, compliance calendar, and alert.
      </p>

      {/* Completion banner */}
      {completion < 100 && (
        <div style={{
          background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: 8,
          padding: "14px 20px", margin: "24px 0 32px",
        }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 14, color: "#92400E", marginBottom: 8 }}>
            Profile {completion}% complete — add your MSME number and registered address to unlock all features
          </p>
          <div style={{ height: 6, background: "#FEF3C7", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ width: `${completion}%`, height: "100%", background: "#F59E0B" }} />
          </div>
        </div>
      )}

      {/* SECTION 1: Identity */}
      <Section title="Business Identity" sub="Your legal name and registration details.">
        <Field label="Business Name *">
          {/* BACKEND: businesses.business_name */}
          <TextInput value={businessName} onChange={setBusinessName} />
        </Field>

        <Field label="Legal Entity Type *" helper={entityNote}>
          {/* BACKEND: businesses.business_type */}
          <Select value={entityType} onChange={setEntityType}
            options={["Sole Proprietorship", "Partnership Firm", "Private Limited Company", "Limited Liability Partnership", "One Person Company", "Public Limited Company"]} />
        </Field>

        <Field label="GSTIN" helper="Your GSTIN unlocks automatic filing calendars, ITC reconciliation, and vendor compliance checks.">
          <div style={{ position: "relative" }}>
            {/* BACKEND: businesses.gstin · GET /api/gstn/verify?gstin=X */}
            <TextInput value={gstin} onChange={(v) => setGstin(v.toUpperCase().slice(0, 15))} placeholder="22AAAAA0000A1Z5" />
            {gstin.length === 15 && (
              <span style={{
                position: "absolute", right: 10, top: 10,
                background: "#F0FDF4", color: "#166534", border: "1px solid #A7F3D0",
                borderRadius: 100, padding: "3px 10px",
                fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11,
              }}>Verified ✓</span>
            )}
          </div>
        </Field>

        <Field label="PAN Number" helper="Required for advance tax computation">
          {/* BACKEND: businesses.pan (column not yet present) */}
          <TextInput value={pan} onChange={(v) => setPan(v.toUpperCase().slice(0, 10))} placeholder="ABCDE1234F" />
        </Field>
      </Section>

      {/* SECTION 2: Business Details */}
      <Section title="Business Details">
        <Field label="Industry Vertical *" helper={industry ? `AI CFO Nidhi will use ${industry} benchmarks for your gross margin, DSO, and working capital analysis.` : undefined}>
          {/* BACKEND: businesses.industry */}
          <Select value={industry} onChange={setIndustry}
            options={["Textile & Apparel", "Manufacturing", "IT & Services", "Healthcare & Clinics", "Real Estate & Construction", "Trading & Distribution", "Export & Import", "Food & Beverage", "Retail", "Agriculture", "Education", "Logistics", "Pharma", "Other"]} />
        </Field>

        <Field label="Annual Turnover Range *">
          {/* BACKEND: businesses.turnover_range */}
          <PillGroup value={turnover} onChange={setTurnover}
            options={["Under ₹1 Cr", "₹1-5 Cr", "₹5-25 Cr", "₹25-100 Cr", "₹100-200 Cr", "Above ₹200 Cr"]} />
        </Field>

        <Field label="State of GST Registration *">
          {/* BACKEND: businesses.state */}
          <Select value={stateReg} onChange={setStateReg} options={STATES} />
        </Field>

        <Field label="Number of Employees" helper="Used for PF, ESIC, and labour law compliance alerts">
          {/* BACKEND: businesses.employee_count */}
          <Select value={employees} onChange={setEmployees} options={["1-5", "6-15", "16-50", "51-200", "201-500", "500+"]} />
        </Field>

        <Field label="Financial Year Start">
          {/* BACKEND: businesses.financial_year_start (column not yet present) */}
          <PillGroup value={fyStart} onChange={setFyStart} options={["April (Indian FY)", "January (Calendar Year)"]} />
        </Field>
      </Section>

      {/* SECTION 3: Registrations */}
      <Section title="Registrations & Certifications">
        <Field label="MSME Udyam Registration" helper="Enables MSME payment rights enforcement (Section 43B(h)) and unlocks CGTMSE loan benefits">
          {/* BACKEND: businesses.msme_udyam */}
          <TextInput value={msme} onChange={setMsme} placeholder="UDYAM-XX-00-0000000" />
          {!msme && (
            <div style={{
              marginTop: 10, background: "#FFFBEB", border: "1px solid #FCD34D",
              borderRadius: 6, padding: "10px 14px",
              fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "#92400E",
            }}>
              No MSME number? Register free at udyamregistration.gov.in →
            </div>
          )}
        </Field>

        {showCin && (
          <Field label="CIN (Company Identification Number)" helper="Required for ROC filing alerts and MCA compliance tracking">
            {/* BACKEND: businesses.cin (column not yet present) */}
            <TextInput value={cin} onChange={(v) => setCin(v.toUpperCase().slice(0, 21))} placeholder="U17110MH2015PTC123456" />
          </Field>
        )}

        {showIec && (
          <Field label="Import Export Code (IEC)">
            {/* BACKEND: businesses.iec (column not yet present) */}
            <TextInput value={iec} onChange={(v) => setIec(v.slice(0, 10))} placeholder="0123456789" />
          </Field>
        )}
      </Section>

      {/* SECTION 4: Address */}
      <Section title="Registered Address" sub="Used for compliance correspondence and state-specific regulations.">
        {/* BACKEND: businesses.address_json (column not yet present) */}
        <Field label="Registered Address Line 1"><TextInput value={addr1} onChange={setAddr1} /></Field>
        <Field label="Address Line 2"><TextInput value={addr2} onChange={setAddr2} /></Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <Field label="City"><TextInput value={city} onChange={setCity} /></Field>
          <Field label="State"><Select value={addrState} onChange={setAddrState} options={STATES} /></Field>
          <Field label="PIN Code"><TextInput value={pin} onChange={(v) => setPin(v.replace(/\D/g, "").slice(0, 6))} /></Field>
        </div>
      </Section>

      {/* SAVE ROW */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
        <button style={{
          height: 42, padding: "0 20px", borderRadius: 6,
          background: "transparent", border: "1px solid #D4C9A8", color: "#1A1008",
          fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>Discard</button>
        {/* BACKEND: PATCH /api/businesses {all form fields} */}
        <button style={{
          height: 42, padding: "0 20px", borderRadius: 6,
          background: "#C41E1E", border: "none", color: "#FFFFFF",
          fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "pointer",
        }}>Save changes</button>
      </div>
    </div>
  );
};

export default BusinessProfilePage;
