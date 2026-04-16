import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

const installments = [
  { date: "Jun 15", pct: "15%", amount: 240000, status: "future" },
  { date: "Sep 15", pct: "45%", amount: 480000, status: "future" },
  { date: "Dec 15", pct: "75%", amount: 360000, status: "future" },
  { date: "Mar 15", pct: "100%", amount: 520000, status: "future" },
];

const tdsObligations = [
  { vendor: "Raj Textiles", payment: 340000, section: "194C", rate: "2%", tdsDue: 6800, status: "Deducted" },
  { vendor: "Office Rent", payment: 45000, section: "194I", rate: "10%", tdsDue: 4500, status: "Deducted" },
  { vendor: "CA Fees", payment: 50000, section: "194J", rate: "10%", tdsDue: 5000, status: "Not deducted" },
  { vendor: "Marketing Agency", payment: 120000, section: "194J", rate: "10%", tdsDue: 12000, status: "Deducted" },
  { vendor: "Courier Services", payment: 18000, section: "194C", rate: "1%", tdsDue: 180, status: "Below threshold" },
];

const TDSTaxPage = () => (
  <DashboardLayout>
    {/* TOP METRICS */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">ADVANCE TAX PAID YTD</p>
        <p className="text-white text-[28px] font-bold mt-1 font-sans">₹2.4L</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">NEXT INSTALLMENT</p>
        <p className="text-[#C41E1E] text-[28px] font-bold mt-1 font-sans">₹1.8L</p>
        <p className="text-[#C41E1E] mt-1 text-sm font-sans">Due Jun 15</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">TDS DEDUCTED MTD</p>
        <p className="text-white text-[28px] font-bold mt-1 font-sans">₹86K</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">TDS TO DEPOSIT</p>
        <p className="text-[#8B5A00] text-[28px] font-bold mt-1 font-sans">₹86K</p>
        <p className="mt-1 text-accent font-sans text-sm">Due Apr 30</p>
      </div>
    </div>

    {/* ADVANCE TAX INSTALLMENT TRACKER */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
      <h3 className="text-fyn-ink text-lg mb-6 font-sans">Advance Tax Installments — FY 2025-26</h3>
      <div className="flex items-center justify-between mb-6">
        {installments.map((inst, i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-semibold ${
              inst.status === "paid" ? "bg-[#1A6B3C] border-[#1A6B3C] text-white" : inst.status === "missed" ? "bg-[#C41E1E] border-[#C41E1E] text-white" : "bg-white border-fyn-ink/20 text-fyn-ink/40"
            }`}>
              {inst.pct}
            </div>
            <p className="text-fyn-ink text-sm font-medium mt-2">{inst.date}</p>
            <p className="text-fyn-ink/50 text-xs">{formatINR(inst.amount)}</p>
            {i < installments.length - 1 && <div className="absolute h-0.5 bg-fyn-ink/10 w-full" />}
          </div>
        ))}
      </div>

      {/* Live P&L projection */}
      <div className="bg-fyn-beige rounded-lg p-4 space-y-2 text-sm">
        <h4 className="text-fyn-ink font-semibold mb-2">Live P&L Projection</h4>
        <div className="flex justify-between"><span className="text-fyn-ink/60">Revenue YTD:</span><span className="fyn-metric">₹18.4L</span></div>
        <div className="flex justify-between"><span className="text-fyn-ink/60">Projected annual:</span><span className="fyn-metric">₹55.2L</span></div>
        <div className="flex justify-between"><span className="text-fyn-ink/60">Less expenses:</span><span className="fyn-metric">−₹36.4L</span></div>
        <div className="flex justify-between border-t border-fyn-ink-10 pt-2"><span className="text-fyn-ink font-medium">Taxable income estimate:</span><span className="fyn-metric font-semibold">₹18.8L</span></div>
        <div className="flex justify-between"><span className="text-fyn-ink/60">Tax liability (new regime):</span><span className="fyn-metric font-semibold text-[#C41E1E]">₹1.6L</span></div>
        <div className="flex justify-between"><span className="text-fyn-ink/60">TDS already paid:</span><span className="fyn-metric text-[#1A6B3C]">₹2.4L</span></div>
        <div className="flex justify-between bg-[#f0faf4] p-2 rounded"><span className="text-[#1A6B3C] font-medium">Net advance tax needed:</span><span className="fyn-metric font-semibold text-[#1A6B3C]">₹0 (excess paid)</span></div>
      </div>
    </div>

    {/* TDS OBLIGATIONS TABLE */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">TDS Obligations — This Quarter</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
              <th className="text-left py-2">Vendor</th>
              <th className="text-right py-2">Payment</th>
              <th className="text-center py-2">Section</th>
              <th className="text-center py-2">Rate</th>
              <th className="text-right py-2">TDS Due</th>
              <th className="text-center py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {tdsObligations.map((t, i) => (
              <tr key={i} className={`border-b border-fyn-ink-10 last:border-0 hover:bg-fyn-beige-deep transition-colors ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                <td className="py-3 text-fyn-ink font-medium">{t.vendor}</td>
                <td className="py-3 text-right fyn-metric">{formatINR(t.payment)}</td>
                <td className="py-3 text-center text-xs text-fyn-ink/60">{t.section}</td>
                <td className="py-3 text-center text-xs">{t.rate}</td>
                <td className="py-3 text-right fyn-metric font-semibold">{formatINR(t.tdsDue)}</td>
                <td className="py-3 text-center">
                  <span className={`text-[11px] px-2 py-0.5 rounded ${
                    t.status === "Deducted" ? "bg-[#1A6B3C]/10 text-[#1A6B3C]" : t.status === "Not deducted" ? "bg-[#C41E1E]/10 text-[#C41E1E]" : "bg-gray-100 text-gray-500"
                  }`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* TDS DEPOSIT CALENDAR */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <h3 className="text-fyn-ink font-serif text-lg mb-3">TDS Deposit Deadlines</h3>
      <div className="space-y-2">
        {[
          { name: "TDS deposit — April deductions", due: "May 7", days: 22, status: "pending" },
          { name: "TDS Return Q4 (24Q/26Q)", due: "May 31", days: 46, status: "pending" },
          { name: "TDS deposit — May deductions", due: "Jun 7", days: 53, status: "future" },
        ].map((f) => (
          <div key={f.name} className="flex items-center gap-3 p-3 bg-fyn-beige rounded-lg hover:bg-fyn-beige-deep transition-colors">
            <span className={`w-2 h-2 rounded-full ${f.days <= 7 ? "bg-[#C41E1E]" : f.days <= 14 ? "bg-[#8B5A00]" : "bg-fyn-ink/20"}`} />
            <span className="flex-1 text-fyn-ink text-sm font-medium">{f.name}</span>
            <span className="text-fyn-ink/50 text-xs fyn-metric">{f.due}</span>
            <span className={`text-xs ${f.days <= 7 ? "text-[#C41E1E] font-semibold" : "text-fyn-ink/40"}`}>{f.days}d</span>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default TDSTaxPage;
