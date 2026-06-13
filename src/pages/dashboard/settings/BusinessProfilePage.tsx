import { useState } from "react";
import { toast } from "sonner";

const RED = "#A93838"; const BORDER = "#E0D9C8";

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card border rounded-lg p-6 mb-6 animate-fade-in" style={{ borderColor: BORDER }}>
    <h3 className="font-semibold text-[15px]" style={{ color: "#1A1008" }}>{title}</h3>
    <div className="mt-4 space-y-4">{children}</div>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-[13px] font-medium mb-1.5" style={{ color: "#1A1008" }}>{label}</label>
    {children}
  </div>
);

const inpCls = "w-full h-10 px-3 rounded-md border bg-card text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A93838]/30";
const selCls = inpCls;

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi"];
const INDUSTRIES = ["Technology","D2C","Manufacturing","Retail","Healthcare","Education","Logistics","F&B","Real Estate","Services","Other"];

const Save = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="px-5 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: RED }}>Save</button>
);

const BusinessProfilePage = () => {
  const [name, setName] = useState("FynHelp Demo Pvt Ltd");
  const [industry, setIndustry] = useState("Technology");
  const [desc, setDesc] = useState("");
  const [legalName, setLegalName] = useState("");
  const [pan, setPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [cin, setCin] = useState("");
  const [msme, setMsme] = useState("");
  const [addr, setAddr] = useState({ street: "", city: "", state: "Karnataka", pincode: "" });
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [fyStart, setFyStart] = useState("April");
  const [gstType, setGstType] = useState("regular");
  const [bank, setBank] = useState({ name: "", account: "", ifsc: "" });

  const savePan = () => {
    if (pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) return toast.error("Invalid PAN format");
    if (gstin && gstin.length !== 15) return toast.error("GSTIN must be 15 characters");
    toast.success("Legal details saved");
  };

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "#1A1008" }}>Business Profile</h2>
      <p className="text-[13px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>Company identity, legal, address and financial settings.</p>

      <Card title="Company Identity">
        <div className="border-2 border-dashed rounded-md p-6 text-center text-[12px]" style={{ borderColor: BORDER, color: "rgba(26,16,8,0.5)" }}>
          Drag & drop logo here, or click to upload
        </div>
        <Field label="Company name"><input value={name} onChange={(e) => setName(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></Field>
        <Field label="Industry type">
          <select value={industry} onChange={(e) => setIndustry(e.target.value)} className={selCls} style={{ borderColor: BORDER }}>
            {INDUSTRIES.map((i) => <option key={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Company description"><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className={inpCls + " h-auto py-2"} style={{ borderColor: BORDER }} /></Field>
        <Save onClick={() => toast.success("Company identity saved")} />
      </Card>

      <Card title="Legal & Registration">
        <Field label="Legal name (full registered name)"><input value={legalName} onChange={(e) => setLegalName(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></Field>
        <Field label="PAN number"><input value={pan} onChange={(e) => setPan(e.target.value.toUpperCase())} maxLength={10} className={inpCls + " font-mono"} style={{ borderColor: BORDER }} /></Field>
        <Field label="GSTIN">
          <div className="flex gap-2">
            <input value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} maxLength={15} className={inpCls + " font-mono"} style={{ borderColor: BORDER }} />
            <button onClick={() => toast.success("GSTIN verified")} className="px-4 rounded-md border text-[13px] font-medium" style={{ color: RED, borderColor: RED }}>Verify</button>
          </div>
        </Field>
        <Field label="CIN (optional)"><input value={cin} onChange={(e) => setCin(e.target.value.toUpperCase())} className={inpCls + " font-mono"} style={{ borderColor: BORDER }} /></Field>
        <Field label="MSME registration number (optional)"><input value={msme} onChange={(e) => setMsme(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></Field>
        <Save onClick={savePan} />
      </Card>

      <Card title="Address & Contact">
        <Field label="Street"><input value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} className={inpCls} style={{ borderColor: BORDER }} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="City"><input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} className={inpCls} style={{ borderColor: BORDER }} /></Field>
          <Field label="State">
            <select value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} className={selCls} style={{ borderColor: BORDER }}>
              {STATES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Pincode"><input value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} maxLength={6} className={inpCls} style={{ borderColor: BORDER }} /></Field>
          <Field label="Business email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></Field>
          <Field label="Business phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></Field>
          <Field label="Website URL"><input value={website} onChange={(e) => setWebsite(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></Field>
        </div>
        <Save onClick={() => toast.success("Address saved")} />
      </Card>

      <Card title="Financial Settings">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Financial year start">
            <select value={fyStart} onChange={(e) => setFyStart(e.target.value)} className={selCls} style={{ borderColor: BORDER }}>
              <option>April</option><option>January</option><option>July</option>
            </select>
          </Field>
          <Field label="Base currency"><input disabled value="INR ₹" className={inpCls} style={{ borderColor: BORDER, background: "#FAF7F0" }} /></Field>
          <Field label="GST registration type">
            <select value={gstType} onChange={(e) => setGstType(e.target.value)} className={selCls} style={{ borderColor: BORDER }}>
              <option value="regular">Regular</option><option value="composition">Composition</option><option value="unregistered">Unregistered</option>
            </select>
          </Field>
        </div>
        <p className="text-[12px] font-semibold mt-2" style={{ color: "rgba(26,16,8,0.6)" }}>Business bank account</p>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Bank name"><input value={bank.name} onChange={(e) => setBank({ ...bank, name: e.target.value })} className={inpCls} style={{ borderColor: BORDER }} /></Field>
          <Field label="Account number"><input value={bank.account} onChange={(e) => setBank({ ...bank, account: e.target.value })} className={inpCls + " font-mono"} style={{ borderColor: BORDER }} /></Field>
          <Field label="IFSC"><input value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value.toUpperCase() })} className={inpCls + " font-mono"} style={{ borderColor: BORDER }} /></Field>
        </div>
        <Save onClick={() => toast.success("Financial settings saved")} />
      </Card>
    </div>
  );
};

export default BusinessProfilePage;
