import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const spendBreakdown = [
  { name: "Raw Materials", value: 680000, pct: 48, color: "#C41E1E" },
  { name: "Payroll", value: 420000, pct: 30, color: "#1A4A8B" },
  { name: "Overhead", value: 140000, pct: 10, color: "#6B21A8" },
  { name: "GST/TDS", value: 86000, pct: 6, color: "#8B5A00" },
  { name: "Loan EMI", value: 45000, pct: 3, color: "#374151" },
  { name: "Other", value: 49000, pct: 3, color: "#9CA3AF" },
];

const marginBySegment = [
  { segment: "Large buyers", revenue: "₹9.8L", cogs: "62%", margin: "38%" },
  { segment: "SME buyers", revenue: "₹5.2L", cogs: "72%", margin: "28%" },
  { segment: "Export", revenue: "₹3.4L", cogs: "55%", margin: "45%" },
];

const anomalies = [
  { desc: "Office expenses up 340% in March vs 12-month average", amount: 48000, severity: "high" },
  { desc: "New vendor 'XYZ Traders' paid ₹2.4L — not in approved list", amount: 240000, severity: "high" },
  { desc: "Petrol expenses claimed 4x in one week", amount: 12000, severity: "medium" },
];

const CostPage = () => (
  <DashboardLayout>
    {/* TOP KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">TOTAL SPEND MTD</p>
        <p className="text-white text-[28px] font-serif font-bold mt-1">₹14.2L</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">GROSS MARGIN</p>
        <p className="text-[#1A6B3C] text-[28px] font-serif font-bold mt-1">34%</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">COGS</p>
        <p className="text-white text-[28px] font-serif font-bold mt-1">₹12.1L</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">COST PER UNIT</p>
        <p className="text-white text-[28px] font-serif font-bold mt-1">₹842</p>
      </div>
    </div>

    {/* SPEND BREAKDOWN */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <h3 className="text-fyn-ink font-serif text-lg mb-4">Spend Breakdown</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie data={spendBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {spendBreakdown.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [formatINR(v)]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 space-y-1">
          {spendBreakdown.map((c) => (
            <div key={c.name} className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
              <span className="flex-1 text-fyn-ink">{c.name}</span>
              <span className="text-fyn-ink/50">{c.pct}%</span>
              <span className="fyn-metric font-medium">{formatINR(c.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MARGIN BY SEGMENT */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <h3 className="text-fyn-ink font-serif text-lg mb-4">Gross Margin by Segment</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                <th className="text-left py-2">Segment</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-right py-2">COGS %</th>
                <th className="text-right py-2">Margin</th>
              </tr>
            </thead>
            <tbody>
              {marginBySegment.map((m) => (
                <tr key={m.segment} className="border-b border-fyn-ink-10 last:border-0">
                  <td className="py-3 text-fyn-ink font-medium">{m.segment}</td>
                  <td className="py-3 text-right fyn-metric">{m.revenue}</td>
                  <td className="py-3 text-right text-fyn-ink/60">{m.cogs}</td>
                  <td className="py-3 text-right fyn-metric font-semibold text-[#1A6B3C]">{m.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-fyn-gold-light border border-fyn-gold/20 rounded-lg p-3 mt-4">
          <p className="text-fyn-gold text-sm">💡 You make 17pp more margin on exports than domestic SME sales</p>
        </div>
      </div>
    </div>

    {/* COST ANOMALY DETECTION */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">Unusual Spending Detected</h3>
      <div className="space-y-3">
        {anomalies.map((a, i) => (
          <div key={i} className="border-l-4 border-l-[#8B5A00] bg-fyn-beige rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-fyn-ink text-sm font-medium">{a.desc}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="fyn-metric text-sm font-semibold text-[#C41E1E]">{formatINR(a.amount)}</span>
              <button className="text-fyn-red text-xs font-medium hover:underline">Review transaction →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default CostPage;
