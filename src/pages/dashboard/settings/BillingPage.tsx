import { useState } from "react";
import { toast } from "sonner";

const RED = "#A93838"; const BORDER = "#E0D9C8"; const GOLD = "#8B6914";

const Card = ({ title, danger, children }: { title: string; danger?: boolean; children: React.ReactNode }) => (
  <div className="bg-card border rounded-lg p-6 mb-6 animate-fade-in"
    style={{ borderColor: danger ? RED : BORDER }}>
    <h3 className="font-semibold text-[15px]" style={{ color: danger ? RED : "#1A1008" }}>{title}</h3>
    <div className="mt-4 space-y-4">{children}</div>
  </div>
);

const inpCls = "w-full h-10 px-3 rounded-md border bg-card text-[14px] focus:outline-none";

const invoices = [
  { num: "INV-2026-001", date: "Nov 2025", amount: "₹0 (Free)" },
  { num: "INV-2026-002", date: "Dec 2025", amount: "₹0 (Free)" },
  { num: "INV-2026-003", date: "Jan 2026", amount: "₹0 (Free)" },
];

const Metric = ({ label, used, total, pct }: { label: string; used: string; total: string; pct: number }) => (
  <div className="p-4 rounded-md border" style={{ borderColor: BORDER }}>
    <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: "rgba(26,16,8,0.55)" }}>{label}</p>
    <p className="text-[16px] font-bold mt-1 font-mono" style={{ color: "#1A1008" }}>{used} <span className="text-[12px] font-normal" style={{ color: "rgba(26,16,8,0.5)" }}>/ {total}</span></p>
    <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "#F3EBD9" }}>
      <div className="h-full" style={{ width: `${pct}%`, background: RED }} />
    </div>
  </div>
);

const BillingPage = () => {
  const [promo, setPromo] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl font-bold mb-1" style={{ color: "#1A1008" }}>Billing</h2>
      <p className="text-[13px] mb-6" style={{ color: "rgba(26,16,8,0.60)" }}>Manage plan, usage, invoices and payment methods.</p>

      <Card title="Current Plan">
        <div className="flex items-start justify-between">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide"
              style={{ background: "rgba(139,105,20,0.18)", border: `1px solid ${GOLD}55`, color: GOLD }}>★ EARLY ACCESS — FREE</span>
            <p className="text-[13px] mt-3" style={{ color: "rgba(26,16,8,0.7)" }}>You're on the FynHelp Early Access plan. Free for 30 days.</p>
            <ul className="mt-3 space-y-1 text-[13px]">
              {["All 8 intelligence modules", "Unlimited Fynny AI queries", "Up to 3 team members", "CSV/PDF exports", "Email + WhatsApp alerts"].map((f) => (
                <li key={f}><span style={{ color: "#16A34A" }}>✓</span> {f}</li>
              ))}
            </ul>
            <p className="text-[12px] mt-3" style={{ color: "rgba(26,16,8,0.55)" }}>Early access ends: November 2026</p>
          </div>
        </div>
        <button onClick={() => toast("Coming Soon")} className="px-5 py-2.5 rounded-md text-sm font-semibold text-white" style={{ background: RED }}>Upgrade to Paid Plan</button>
      </Card>

      <Card title="Usage This Month">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Fynny queries" used="142" total="∞" pct={20} />
          <Metric label="Reports generated" used="5" total="∞" pct={10} />
          <Metric label="Team members" used="2" total="3" pct={66} />
          <Metric label="Data storage" used="12 MB" total="1 GB" pct={1.2} />
        </div>
      </Card>

      <Card title="Invoice History">
        <table className="w-full text-[13px]">
          <thead><tr className="text-left text-[11px] uppercase tracking-wide" style={{ color: "rgba(26,16,8,0.5)" }}>
            <th className="py-2">Invoice #</th><th>Date</th><th>Amount</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {invoices.map((iv) => (
              <tr key={iv.num} className="border-t" style={{ borderColor: BORDER }}>
                <td className="py-3 font-mono">{iv.num}</td><td>{iv.date}</td><td>{iv.amount}</td>
                <td><span className="text-[11px] px-2 py-1 rounded font-medium" style={{ background: "rgba(22,163,74,0.15)", color: "#16A34A" }}>Paid</span></td>
                <td className="text-right"><button onClick={() => toast("Downloading invoice...")} className="text-[12px] px-3 py-1 rounded border" style={{ color: RED, borderColor: RED }}>Download</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Payment Method">
        <p className="text-[13px]" style={{ color: "#1A1008" }}>No payment method added yet</p>
        <p className="text-[12px]" style={{ color: "rgba(26,16,8,0.55)" }}>Add a payment method before your free trial ends</p>
        <div className="flex gap-3">
          <button onClick={() => toast("Coming Soon")} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ color: RED, borderColor: RED }}>Add Credit/Debit Card</button>
          <button onClick={() => toast("Coming Soon")} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ color: RED, borderColor: RED }}>Add UPI</button>
        </div>
      </Card>

      <Card title="Promo Code">
        <div className="flex gap-2">
          <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Enter promo code" className={inpCls + " max-w-xs"} style={{ borderColor: BORDER }} />
          <button onClick={() => toast.error("Invalid promo code")} className="px-4 rounded-md text-sm font-semibold text-white" style={{ background: RED }}>Apply</button>
        </div>
        <p className="text-[12px]" style={{ color: "rgba(26,16,8,0.55)" }}>Have a referral code? Enter it here for extended free access</p>
      </Card>

      <Card title="Cancel Plan" danger>
        <p className="text-[13px]" style={{ color: "rgba(26,16,8,0.7)" }}>Your data will be retained for 30 days after cancellation.</p>
        {!showCancel ? (
          <button onClick={() => setShowCancel(true)} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ color: RED, borderColor: RED }}>Cancel Plan</button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { toast.error("Plan cancellation requested"); setShowCancel(false); }} className="px-4 py-2 rounded-md text-sm font-semibold text-white" style={{ background: RED }}>Confirm Cancellation</button>
            <button onClick={() => setShowCancel(false)} className="px-4 py-2 rounded-md text-sm font-medium border" style={{ borderColor: BORDER }}>Keep Plan</button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BillingPage;
