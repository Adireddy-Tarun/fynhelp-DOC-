import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

const payables = [
  { id: "1", vendor: "Raj Textiles", bill: "BILL-2025-089", billDate: "2025-03-25", due: "2025-04-10", outstanding: 340000, priority: "Critical", tds: true, tdsAmt: 6800 },
  { id: "2", vendor: "Mumbai Mills", bill: "BILL-2025-092", billDate: "2025-03-28", due: "2025-04-15", outstanding: 180000, priority: "High", tds: false, tdsAmt: 0 },
  { id: "3", vendor: "Gujarat Fibers", bill: "BILL-2025-095", billDate: "2025-04-01", due: "2025-04-20", outstanding: 120000, priority: "Normal", tds: true, tdsAmt: 2400 },
  { id: "4", vendor: "Delhi Dyes", bill: "BILL-2025-098", billDate: "2025-04-05", due: "2025-04-30", outstanding: 95000, priority: "Normal", tds: false, tdsAmt: 0 },
  { id: "5", vendor: "Office Rent - Landlord", bill: "RENT-APR-2025", billDate: "2025-04-01", due: "2025-04-05", outstanding: 45000, priority: "Critical", tds: true, tdsAmt: 4500 },
  { id: "6", vendor: "Ludhiana Looms", bill: "BILL-2025-101", billDate: "2025-04-08", due: "2025-05-15", outstanding: 78000, priority: "Deferrable", tds: false, tdsAmt: 0 },
];

const priorityStyles: Record<string, string> = {
  Critical: "bg-[#C41E1E]/10 text-[#C41E1E]",
  High: "bg-amber-100 text-[#8B5A00]",
  Normal: "bg-blue-50 text-[#1A4A8B]",
  Deferrable: "bg-gray-100 text-gray-500",
};

const PayablesPage = () => {
  const [payModal, setPayModal] = useState<string | null>(null);

  return (
    <DashboardLayout>
      {/* TOP METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-white/40 text-[13px] fyn-label">TOTAL OUTSTANDING</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">₹8.7L</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-white/40 text-[13px] fyn-label">DUE THIS WEEK</p>
          <p className="text-[28px] font-bold mt-1 font-sans text-[#ffa600]">₹3.4L</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-white/40 text-[13px] fyn-label">OVERDUE</p>
          <p className="text-[#1A6B3C] text-[28px] font-bold mt-1 font-sans">₹0</p>
          <p className="text-[#1A6B3C] text-xs mt-1">✓ All clear!</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-white/40 text-[13px] fyn-label">DPO</p>
          <p className="text-white text-[28px] font-bold mt-1 font-sans">28 days</p>
          <p className="text-xs mt-1 text-[#fff1d6]">Industry avg 35 — you pay 7 days fast</p>
        </div>
      </div>

      {/* CASH IMPACT ALERT */}
      <div className="bg-fyn-warning-bg border border-[#8B5A00]/30 rounded-lg p-4 mb-6">
        <p className="text-sm font-sans text-[#663f00]">Paying all due-this-week vendors (₹3.4L) will bring your cash to ₹9.0L — runway remains 38 days.</p>
      </div>

      {/* PAYABLES TABLE */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink text-lg font-sans">All Payables</h3>
          <button className="text-xs border border-fyn-ink-10 px-3 py-1.5 rounded hover:bg-fyn-ink/5 text-secondary-foreground">Export</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                <th className="text-left py-2"><input type="checkbox" /></th>
                <th className="text-left py-2">Vendor</th>
                <th className="text-left py-2 font-sans">Bill #</th>
                <th className="text-left py-2">Due Date</th>
                <th className="text-right py-2">Outstanding</th>
                <th className="text-center py-2">Priority</th>
                <th className="text-right py-2">TDS</th>
                <th className="text-right py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payables.map((p, i) => (
                <tr key={p.id} className={`border-b border-fyn-ink-10 last:border-0 hover:bg-fyn-beige-deep transition-colors ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                  <td className="py-3"><input type="checkbox" /></td>
                  <td className="py-3 text-fyn-ink font-semibold">{p.vendor}</td>
                  <td className="py-3 text-fyn-ink/60 fyn-mono text-xs">{p.bill}</td>
                  <td className="py-3 text-xs font-sans text-secondary-foreground">{p.due}</td>
                  <td className="py-3 text-right fyn-metric font-semibold">{formatINR(p.outstanding)}</td>
                  <td className="py-3 text-center">
                    <span className={`text-[11px] px-2 py-0.5 rounded ${priorityStyles[p.priority]}`}>{p.priority}</span>
                  </td>
                  <td className="py-3 text-right text-xs">{p.tds ? <span className="text-[#8B5A00]">Yes {formatINR(p.tdsAmt)}</span> : "—"}</td>
                  <td className="py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setPayModal(p.id)} className="text-[#1A6B3C] text-xs font-medium hover:underline">Pay</button>
                      <button className="text-xs hover:underline ml-2 opacity-100 text-secondary-foreground">Defer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {payModal && (() => {
        const p = payables.find((p) => p.id === payModal);
        if (!p) return null;
        const net = p.outstanding - p.tdsAmt;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setPayModal(null)}>
            <div className="bg-white rounded-xl p-6 w-[400px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-fyn-ink font-serif text-lg mb-4">Pay {p.vendor}</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm"><span className="text-fyn-ink/60">Amount:</span><span className="fyn-metric font-semibold">{formatINR(p.outstanding)}</span></div>
                {p.tds && (
                  <>
                    <div className="flex justify-between text-sm"><span className="text-fyn-ink/60">TDS deduction:</span><span className="text-[#8B5A00]">−{formatINR(p.tdsAmt)}</span></div>
                    <div className="flex justify-between text-sm font-semibold border-t border-fyn-ink-10 pt-2"><span>Net payment:</span><span className="fyn-metric">{formatINR(net)}</span></div>
                  </>
                )}
                <div>
                  <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">Payment method</label>
                  <select className="w-full h-9 px-3 border border-fyn-ink-10 rounded text-sm">
                    <option>Bank transfer</option><option>Cheque</option><option>Online</option>
                  </select>
                </div>
                <div>
                  <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">Reference (UTR/Cheque #)</label>
                  <input className="w-full h-9 px-3 border border-fyn-ink-10 rounded text-sm" placeholder="Enter reference" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button className="flex-1 bg-[#1A6B3C] text-white py-2.5 rounded-lg font-medium hover:opacity-90">Mark as Paid</button>
                  <button onClick={() => setPayModal(null)} className="px-4 text-fyn-ink/50 text-sm">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </DashboardLayout>
  );
};

export default PayablesPage;
