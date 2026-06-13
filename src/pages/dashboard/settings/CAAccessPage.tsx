import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

const RED = "#A93838"; const BORDER = "#E0D9C8";

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card border rounded-lg p-6 mb-6 animate-fade-in" style={{ borderColor: BORDER }}>
    <h3 className="font-semibold text-[15px]" style={{ color: "#1A1008" }}>{title}</h3>
    <div className="mt-4 space-y-4">{children}</div>
  </div>
);

const inpCls = "w-full h-10 px-3 rounded-md border bg-card text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A93838]/30";

const auditLog = [
  { action: "Viewed GST Summary", module: "GST & Tax", ca: "CA Sharma", dt: "10 Jun 2026 3:42 PM" },
  { action: "Exported P&L Report", module: "Reports", ca: "CA Sharma", dt: "09 Jun 2026 11:20 AM" },
  { action: "Viewed ITC Reconciliation", module: "GST & Tax", ca: "CA Sharma", dt: "08 Jun 2026 2:15 PM" },
];

const moduleOpts = ["Liquidity", "Revenue", "Cost", "GST & Tax", "Governance"];

const CAAccessPage = () => {
  const [showAdd, setShowAdd] = useState(false);
  const [cas, setCas] = useState<{ name: string; firm: string; email: string; level: string; expiry: string; status: string }[]>([]);
  const [name, setName] = useState(""); const [firm, setFirm] = useState(""); const [email, setEmail] = useState("");
  const [level, setLevel] = useState<"full" | "limited">("full");
  const [limited, setLimited] = useState<string[]>([]);
  const [hasExpiry, setHasExpiry] = useState(false);
  const [expiry, setExpiry] = useState("");
  const [canExport, setCanExport] = useState(true);
  const [canViewHr, setCanViewHr] = useState(false);

  const send = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return toast.error("Invalid CA email");
    setCas((p) => [...p, { name, firm, email, level: level === "full" ? "Full" : `Limited (${limited.join(", ")})`, expiry: hasExpiry ? expiry : "No expiry", status: "Invited" }]);
    toast.success(`CA invite sent to ${email}`);
    setName(""); setFirm(""); setEmail(""); setLevel("full"); setLimited([]); setHasExpiry(false); setExpiry("");
  };

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "#1A1008" }}>CA Access</h2>
      <p className="text-[13px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>Grant your Chartered Accountant scoped, auditable access.</p>

      <Card title="Current CA Access">
        {cas.length === 0 ? (
          <div className="text-center py-8 text-[13px]" style={{ color: "rgba(26,16,8,0.5)" }}>
            No CA connected
            <div className="mt-3"><button onClick={() => setShowAdd(true)} className="px-4 py-2 rounded-md text-sm font-semibold text-white" style={{ background: RED }}>Add CA</button></div>
          </div>
        ) : (
          <table className="w-full text-[13px]">
            <thead><tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: "rgba(26,16,8,0.5)" }}>
              <th className="py-2">CA</th><th>Firm</th><th>Email</th><th>Access</th><th>Expiry</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {cas.map((c, i) => (
                <tr key={i} className="border-t" style={{ borderColor: BORDER }}>
                  <td className="py-3 font-medium">{c.name}</td><td>{c.firm}</td><td>{c.email}</td>
                  <td>{c.level}</td><td>{c.expiry}</td>
                  <td><span className="text-[11px] px-2 py-1 rounded" style={{ background: "rgba(139,105,20,0.15)", color: "#8B6914" }}>{c.status}</span></td>
                  <td><button onClick={() => setCas((p) => p.filter((_, j) => j !== i))} className="text-[12px] px-3 py-1 rounded border font-medium" style={{ color: RED, borderColor: RED }}>Revoke</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card title="Add CA Access">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-[13px] font-medium mb-1.5">CA name</label><input value={name} onChange={(e) => setName(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></div>
          <div><label className="block text-[13px] font-medium mb-1.5">CA firm name</label><input value={firm} onChange={(e) => setFirm(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></div>
        </div>
        <div><label className="block text-[13px] font-medium mb-1.5">CA email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inpCls} style={{ borderColor: BORDER }} /></div>

        <div>
          <p className="text-[13px] font-medium mb-2">Access level</p>
          <label className="flex items-center gap-2 mb-2 text-[13px]">
            <input type="radio" checked={level === "full"} onChange={() => setLevel("full")} /> Full Read Access (all modules)
          </label>
          <label className="flex items-center gap-2 text-[13px]">
            <input type="radio" checked={level === "limited"} onChange={() => setLevel("limited")} /> Limited Access (select modules)
          </label>
          {level === "limited" && (
            <div className="mt-2 ml-6 flex flex-wrap gap-3">
              {moduleOpts.map((m) => (
                <label key={m} className="flex items-center gap-1.5 text-[12px]">
                  <input type="checkbox" checked={limited.includes(m)} onChange={(e) =>
                    setLimited((p) => e.target.checked ? [...p, m] : p.filter((x) => x !== m))} /> {m}
                </label>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-[13px] font-medium mb-2">Access expiry</p>
          <div className="flex items-center gap-3">
            <Switch checked={hasExpiry} onCheckedChange={setHasExpiry} />
            <span className="text-[13px]">{hasExpiry ? "Set expiry date" : "No expiry"}</span>
            {hasExpiry && <input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} className="h-9 px-3 border rounded-md text-[13px]" style={{ borderColor: BORDER }} />}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[13px]">Can export reports</span>
          <Switch checked={canExport} onCheckedChange={setCanExport} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px]">Can view employee data</span>
          <Switch checked={canViewHr} onCheckedChange={setCanViewHr} />
        </div>

        <button onClick={send} className="px-5 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: RED }}>Send CA Invite</button>
      </Card>

      <Card title="Audit Log">
        <p className="text-[12px] mb-2" style={{ color: "rgba(26,16,8,0.55)" }}>Shows what your CA has been accessing</p>
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: "rgba(26,16,8,0.5)" }}>
            <th className="py-2">Action</th><th>Module</th><th>CA Name</th><th>Date & Time</th></tr></thead>
          <tbody>
            {auditLog.map((a, i) => (
              <tr key={i} className="border-t" style={{ borderColor: BORDER }}>
                <td className="py-3">{a.action}</td><td>{a.module}</td><td>{a.ca}</td><td className="font-mono text-[12px]">{a.dt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default CAAccessPage;
