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
        <p className="text-white text-[28px] font-bold mt-1 font-sans">₹14.2L</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">GROSS MARGIN</p>
        <p className="text-[#1A6B3C] text-[28px] font-bold mt-1 font-sans">34%</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">COGS</p>
        <p className="text-white text-[28px] font-bold mt-1 font-sans">₹12.1L</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">COST PER UNIT</p>
        <p className="text-white text-[28px] font-bold mt-1 font-sans">₹842</p>
      </div>
    </div>

    {/* SPEND BREAKDOWN */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <h3 className="text-fyn-ink text-lg mb-4 font-sans">Spend Breakdown</h3>
...
      {/* MARGIN BY SEGMENT */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <h3 className="text-fyn-ink text-lg mb-4 font-sans">Gross Margin by Segment</h3>
...
    {/* COST ANOMALY DETECTION */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 font-sans">
      <h3 className="text-fyn-ink text-lg mb-4 font-sans">Unusual Spending Detected</h3>
      <div className="space-y-3">
        {anomalies.map((a, i) => (
          <div key={i} className="border-l-4 border-l-[#8B5A00] bg-fyn-beige rounded-lg p-4 hover:-translate-y-0.5 hover:shadow-md transition-all">
            <p className="text-fyn-ink font-medium font-sans text-base">{a.desc}</p>
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
