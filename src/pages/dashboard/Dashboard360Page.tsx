import DashboardLayout from "@/components/DashboardLayout";
import { formatINR, getRunwayColor } from "@/lib/indian-format";

const sections = [
  {
    title: "LIQUIDITY METRICS",
    metrics: [
      { label: "Cash Balance", value: "₹12.4L", change: "↑ ₹40K", positive: true },
      { label: "Daily Burn Rate", value: "₹23,846", change: "↓ 3%", positive: true },
      { label: "Runway Days", value: "52 days", change: "↓ 8 days", positive: false },
      { label: "Working Capital", value: "₹18.2L", change: "↑ ₹1.1L", positive: true },
      { label: "Total Receivables", value: "₹22.1L", change: "4 overdue", positive: false },
      { label: "Total Payables", value: "₹8.7L", change: "3 due this week", positive: false },
      { label: "DSO", value: "42 days", change: "↓ 3 days", positive: true },
      { label: "DPO", value: "28 days", change: "Stable", positive: true },
      { label: "Net Cash Last 30d", value: "₹2.8L", change: "Positive", positive: true },
    ],
  },
  {
    title: "REVENUE METRICS",
    metrics: [
      { label: "Revenue MTD", value: "₹18.4L", change: "↑ 12%", positive: true },
      { label: "Gross Margin", value: "34%", change: "↑ 2%", positive: true },
      { label: "Revenue vs Last Month", value: "↑ 8%", change: "Growth", positive: true },
      { label: "Overdue Receivables", value: "₹22.1L", change: "4 customers", positive: false },
      { label: "Collection Efficiency", value: "78%", change: "↑ 5%", positive: true },
      { label: "Active Customers", value: "47", change: "+3 this month", positive: true },
      { label: "Avg Invoice Value", value: "₹1.8L", change: "Stable", positive: true },
      { label: "Largest Customer %", value: "18%", change: "ABC Electronics", positive: true },
      { label: "Revenue Concentration", value: "Low Risk", change: "Top 3 = 38%", positive: true },
    ],
  },
  {
    title: "COST METRICS",
    metrics: [
      { label: "Total Spend MTD", value: "₹14.2L", change: "↓ 4%", positive: true },
      { label: "Payroll % of Revenue", value: "46%", change: "↑ 2%", positive: false },
      { label: "Top Cost Category", value: "Raw Materials", change: "₹6.8L", positive: true },
      { label: "Fixed Costs", value: "₹4.2L", change: "Stable", positive: true },
      { label: "Variable Costs", value: "₹10L", change: "↓ 3%", positive: true },
      { label: "COGS", value: "₹12.1L", change: "66% of revenue", positive: true },
    ],
  },
  {
    title: "GST METRICS",
    metrics: [
      { label: "ITC Safe", value: "₹3.6L", change: "Claimable", positive: true },
      { label: "ITC at Risk", value: "₹3.2L", change: "4 mismatches", positive: false },
      { label: "Mismatch Count", value: "4", change: "↑ 1", positive: false },
      { label: "Notice Risk Score", value: "34/100", change: "Medium", positive: true },
      { label: "Next Filing", value: "GSTR-3B", change: "8 days", positive: true },
      { label: "Last 2B Pull", value: "Apr 14", change: "Auto-pulled", positive: true },
      { label: "Advance Tax YTD", value: "₹2.4L", change: "On track", positive: true },
      { label: "TDS Deducted", value: "₹86K", change: "This quarter", positive: true },
      { label: "Vendor Compliance", value: "82%", change: "3 non-compliant", positive: false },
    ],
  },
  {
    title: "HR METRICS",
    metrics: [
      { label: "Headcount", value: "12", change: "No change", positive: true },
      { label: "Total Payroll", value: "₹8.4L/mo", change: "Next: 1st", positive: true },
      { label: "Payroll Proximity", value: "18 days", change: "Safe", positive: true },
      { label: "Attrition Risk", value: "2 at risk", change: "Below market", positive: false },
      { label: "PF Due", value: "₹1.01L", change: "15th Apr", positive: true },
      { label: "ESIC Due", value: "₹27K", change: "15th Apr", positive: true },
    ],
  },
];

const Dashboard360Page = () => (
  <DashboardLayout>
    <div className="mb-6">
      <h2 className="text-fyn-ink font-serif text-2xl mb-1">360 Dashboard — Complete Business Health View</h2>
      <p className="text-fyn-ink/50 text-sm">Every metric. Every module. One view. Last updated 12 min ago.</p>
      <div className="flex gap-4 mt-3 text-xs">
        {[
          { src: "Bank AA", status: "Fresh", color: "text-fyn-success" },
          { src: "Tally", status: "2h ago", color: "text-fyn-warning" },
          { src: "GST Portal", status: "Yesterday", color: "text-fyn-ink/40" },
          { src: "Payroll", status: "This month", color: "text-fyn-ink/40" },
        ].map((d) => (
          <span key={d.src} className="text-fyn-ink/60">{d.src} <span className={d.color}>● {d.status}</span></span>
        ))}
      </div>
    </div>

    {/* Health Score */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-8 text-center mb-8">
      <p className="fyn-label text-fyn-gold text-xs mb-2">BUSINESS HEALTH SCORE</p>
      <p className="text-fyn-warning text-6xl fyn-metric font-serif font-bold">74<span className="text-2xl text-fyn-ink/30">/100</span></p>
      <div className="grid grid-cols-4 gap-4 max-w-xl mx-auto mt-6">
        {[
          { label: "Liquidity", score: 68, color: "bg-amber-500" },
          { label: "Revenue Quality", score: 81, color: "bg-fyn-success" },
          { label: "Compliance", score: 72, color: "bg-amber-500" },
          { label: "Governance", score: 71, color: "bg-amber-500" },
        ].map((c) => (
          <div key={c.label}>
            <p className="text-fyn-ink text-sm mb-1">{c.label}</p>
            <div className="h-2 bg-fyn-ink/5 rounded-full"><div className={`h-2 ${c.color} rounded-full`} style={{ width: `${c.score}%` }} /></div>
            <p className="text-fyn-ink/60 text-xs mt-1 fyn-metric">{c.score}/100</p>
          </div>
        ))}
      </div>
    </div>

    {/* Metric sections */}
    {sections.map((section) => (
      <div key={section.title} className="mb-8">
        <h3 className="fyn-label text-fyn-gold text-xs mb-4">{section.title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {section.metrics.map((m) => (
            <div key={m.label} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-4">
              <p className="text-fyn-ink/50 text-xs fyn-label mb-1">{m.label}</p>
              <p className="text-fyn-ink text-xl fyn-metric font-bold">{m.value}</p>
              <p className={`text-xs mt-1 ${m.positive ? "text-fyn-success" : "text-fyn-red"}`}>{m.change}</p>
            </div>
          ))}
        </div>
      </div>
    ))}
  </DashboardLayout>
);

export default Dashboard360Page;
