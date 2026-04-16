import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR, getDaysOverdueColor } from "@/lib/indian-format";

const mockReceivables = [
  { id: "1", customer: "ABC Electronics", invoice: "INV-2025-0342", invDate: "2025-02-05", due: "2025-02-10", amount: 840000, received: 0, outstanding: 840000, risk: 85, lastChase: "Mar 28", phone: "+919876543210" },
  { id: "2", customer: "Sharma & Sons", invoice: "INV-2025-0298", invDate: "2025-02-20", due: "2025-03-05", amount: 310000, received: 0, outstanding: 310000, risk: 62, lastChase: "Apr 2", phone: "+919876543211" },
  { id: "3", customer: "Delhi Distributors", invoice: "INV-2025-0401", invDate: "2025-03-18", due: "2025-04-01", amount: 570000, received: 0, outstanding: 570000, risk: 35, lastChase: "Never", phone: "+919876543212" },
  { id: "4", customer: "Kumar Fabrics", invoice: "INV-2025-0412", invDate: "2025-04-01", due: "2025-04-15", amount: 220000, received: 55000, outstanding: 165000, risk: 15, lastChase: "—", phone: "+919876543213" },
  { id: "5", customer: "Chennai Trading Co", invoice: "INV-2025-0389", invDate: "2025-03-10", due: "2025-03-25", amount: 190000, received: 0, outstanding: 190000, risk: 48, lastChase: "Apr 5", phone: "+919876543214" },
];

const daysOverdue = (due: string) => Math.max(0, Math.floor((Date.now() - new Date(due).getTime()) / 86400000));

const agingBuckets = [
  { label: "Current", amount: 770000, color: "#1A6B3C", count: 3 },
  { label: "0-30d", amount: 420000, color: "#D4A017", count: 2 },
  { label: "31-60d", amount: 610000, color: "#D97706", count: 1 },
  { label: "61-90d", amount: 380000, color: "#C41E1E", count: 1 },
  { label: "90d+", amount: 30000, color: "#7F1D1D", count: 0 },
];
const totalAging = agingBuckets.reduce((s, b) => s + b.amount, 0);

const ReceivablesPage = () => {
  const [chaseModal, setChaseModal] = useState<string | null>(null);
  const [chaseTone, setChaseTone] = useState<"gentle" | "firm" | "final">("gentle");
  const [agingFilter, setAgingFilter] = useState<string | null>(null);

  const toneMessages: Record<string, string> = {
    gentle: "Dear Sir/Madam, this is a friendly reminder that your invoice is pending. Please let us know your expected payment date. Thank you.",
    firm: "Dear Sir/Madam, your invoice is now significantly overdue. Please arrange payment at the earliest. For any queries, reply to this message.",
    final: "Dear Sir/Madam, despite previous reminders, your invoice remains unpaid. We request immediate payment to avoid further action.",
  };

  return (
    <DashboardLayout>
      {/* TOP METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-[13px] fyn-label text-primary-foreground">TOTAL OUTSTANDING</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">₹22.1L</p>
        </div>
        <div className="bg-[#C41E1E] rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-[13px] fyn-label text-primary-foreground">OVERDUE TODAY</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">₹14.4L</p>
        </div>
        <div className="bg-[#1A6B3C] rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-[13px] fyn-label text-primary-foreground">COLLECTED MTD</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">₹11.2L</p>
        </div>
        <div className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-[13px] fyn-label text-secondary-foreground">DSO</p>
          <p className="text-fyn-ink text-[28px] font-bold mt-1 font-sans">42 days</p>
          <p className="text-[#8B5A00] text-xs mt-1">Industry avg 30 days — you are 12 days slower</p>
        </div>
      </div>

      {/* AGING FUNNEL */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
        <h3 className="font-serif text-lg mb-3 text-secondary-foreground">Aging Breakdown</h3>
        <div className="flex h-8 rounded-lg overflow-hidden mb-3 cursor-pointer">
          {agingBuckets.map((b) => (
            <div
              key={b.label}
              onClick={() => setAgingFilter(agingFilter === b.label ? null : b.label)}
              className={`transition-all hover:opacity-80 relative group ${agingFilter && agingFilter !== b.label ? "opacity-40" : ""}`}
              style={{ width: `${totalAging > 0 ? (b.amount / totalAging) * 100 : 0}%`, background: b.color }}
              title={`${b.label}: ${formatINR(b.amount)} (${b.count} invoices)`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-fyn-ink text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {b.label}: {formatINR(b.amount)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          {agingBuckets.map((b) => (
            <button key={b.label} onClick={() => setAgingFilter(agingFilter === b.label ? null : b.label)} className={`flex items-center gap-1 ${agingFilter === b.label ? "font-semibold" : ""}`}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: b.color }} />
              <span className="text-fyn-ink/60">{b.label}: {formatINR(b.amount)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CHASE ALL BUTTON ROW */}
      <div className="flex items-center justify-between mb-4 p-3 bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg">
        <p className="text-fyn-ink text-sm">4 customers overdue → Total ₹14.4L</p>
        <div className="flex gap-2">
          <button className="text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:opacity-90 bg-secondary-foreground">📱WhatsApp all overdue</button>
          <button className="bg-[#1A4A8B] text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 hover:opacity-90">✉ Email all overdue</button>
        </div>
      </div>

      {/* MSME RIGHTS BANNER */}
      <div className="bg-[#FEF3E2] border border-[#8B5A00] rounded-lg p-4 mb-6">
        <p className="text-fyn-ink text-sm font-medium">⚖ Section 43B(h) Rights: Large corporate buyers must pay within 45 days.</p>
        <p className="text-xs mt-1 text-secondary-foreground">2 of your invoices may qualify for legal protection. <button className="text-[#8B5A00] font-medium hover:underline">Send legal notice →</button></p>
      </div>

      {/* RECEIVABLES TABLE */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink font-serif text-lg">All Receivables</h3>
          <button className="text-xs border border-fyn-ink-10 px-3 py-1.5 rounded hover:bg-fyn-ink/5 transition-colors text-secondary-foreground">Export to Excel</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                <th className="text-left py-2"><input type="checkbox" aria-label="Select all" /></th>
                <th className="text-left py-2 text-secondary-foreground">Customer</th>
                <th className="text-left py-2 text-secondary-foreground">Invoice</th>
                <th className="text-left py-2 text-secondary-foreground">Due Date</th>
                <th className="text-right py-2 text-secondary-foreground">Amount</th>
                <th className="text-right py-2 text-secondary-foreground">Outstanding</th>
                <th className="text-right py-2 text-secondary-foreground">Days Overdue</th>
                <th className="text-right py-2 text-secondary-foreground">Risk</th>
                <th className="text-right py-2 text-secondary-foreground">Last Chase</th>
                <th className="text-right py-2 text-secondary-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockReceivables.map((r, i) => {
                const days = daysOverdue(r.due);
                return (
                  <tr key={r.id} className={`border-b border-fyn-ink-10 last:border-0 hover:bg-fyn-beige-deep transition-colors ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                    <td className="py-3"><input type="checkbox" aria-label={`Select ${r.customer}`} /></td>
                    <td className="py-3 text-fyn-ink font-semibold">{r.customer}</td>
                    <td className="py-3 text-fyn-ink/60 fyn-mono text-xs">{r.invoice}</td>
                    <td className="py-3 text-fyn-ink/60 text-xs">{r.due}</td>
                    <td className="py-3 text-right fyn-metric">{formatINR(r.amount)}</td>
                    <td className="py-3 text-right fyn-metric font-semibold">{formatINR(r.outstanding)}</td>
                    <td className={`py-3 text-right fyn-metric font-semibold ${getDaysOverdueColor(days)}`}>
                      {days > 0 ? <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: days > 60 ? "#C41E1E20" : days > 30 ? "#D9770620" : "#1A6B3C20" }}>{days}d</span> : "Current"}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${r.risk > 70 ? "bg-[#C41E1E]/10 text-[#C41E1E]" : r.risk > 40 ? "bg-amber-100 text-[#8B5A00]" : "bg-green-50 text-[#1A6B3C]"}`}>
                        {r.risk}
                      </span>
                    </td>
                    <td className={`py-3 text-right text-xs ${r.lastChase === "Never" ? "text-[#C41E1E]" : "text-fyn-ink/40"}`}>{r.lastChase}</td>
                    <td className="py-3 text-right">
                      <div className="flex gap-1 justify-end opacity-60 hover:opacity-100 transition-opacity">
                        <button onClick={() => setChaseModal(r.id)} className="text-[#25D366] hover:bg-[#25D366]/10 p-1.5 rounded" title="WhatsApp">📱</button>
                        <button className="text-[#1A4A8B] hover:bg-[#1A4A8B]/10 p-1.5 rounded" title="Email">✉</button>
                        <button className="text-fyn-ink/40 hover:bg-fyn-ink/5 p-1.5 rounded" title="View">👁</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WHATSAPP CHASE MODAL */}
      {chaseModal && (() => {
        const r = mockReceivables.find((r) => r.id === chaseModal);
        if (!r) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setChaseModal(null)}>
            <div className="bg-white rounded-xl p-6 w-[420px] max-h-[80vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-fyn-ink font-serif text-lg mb-4">Send payment reminder via WhatsApp</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">To:</label>
                  <input defaultValue={r.phone} className="w-full h-9 px-3 border border-fyn-ink-10 rounded text-sm" />
                </div>
                <div>
                  <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Tone:</label>
                  <div className="flex gap-2">
                    {(["gentle", "firm", "final"] as const).map((t) => (
                      <button key={t} onClick={() => setChaseTone(t)} className={`flex-1 py-2 rounded text-sm capitalize ${chaseTone === t ? "bg-fyn-ink text-white" : "bg-fyn-beige border border-fyn-ink-10 text-fyn-ink/60"}`}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">Message:</label>
                  <textarea defaultValue={toneMessages[chaseTone]} className="w-full h-28 px-3 py-2 border border-fyn-ink-10 rounded text-sm resize-none" />
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 bg-[#25D366] text-white py-2.5 rounded-lg font-medium hover:opacity-90">Send on WhatsApp →</button>
                  <button onClick={() => setChaseModal(null)} className="px-4 py-2.5 text-fyn-ink/50 hover:text-fyn-ink text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
};

export default ReceivablesPage;
