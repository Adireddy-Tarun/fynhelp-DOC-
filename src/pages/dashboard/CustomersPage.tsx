import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const revenueConc = [
  { name: "ABC Electronics", value: 18, color: "#C41E1E" },
  { name: "Sharma & Sons", value: 14, color: "#8B5A00" },
  { name: "Delhi Distributors", value: 12, color: "#1A4A8B" },
  { name: "Kumar Fabrics", value: 10, color: "#1A6B3C" },
  { name: "Chennai Trading", value: 8, color: "#6B21A8" },
  { name: "Others", value: 38, color: "#9CA3AF" },
];

const customers = [
  { name: "ABC Electronics", industry: "Electronics", rev3m: 980000, invoices: 8, outstanding: 840000, dso: 62, risk: 85, lastOrder: "Feb 10", behavior: "Consistently 30+ days" },
  { name: "Sharma & Sons", industry: "Textiles", rev3m: 520000, invoices: 5, outstanding: 310000, dso: 38, risk: 62, lastOrder: "Mar 5", behavior: "Avg 8 days late" },
  { name: "Delhi Distributors", industry: "Distribution", rev3m: 440000, invoices: 6, outstanding: 570000, dso: 22, risk: 35, lastOrder: "Apr 1", behavior: "Always on time" },
  { name: "Kumar Fabrics", industry: "Textiles", rev3m: 380000, invoices: 4, outstanding: 165000, dso: 15, risk: 15, lastOrder: "Apr 10", behavior: "Always on time" },
  { name: "Chennai Trading Co", industry: "Trading", rev3m: 320000, invoices: 3, outstanding: 190000, dso: 28, risk: 48, lastOrder: "Mar 25", behavior: "Irregular" },
];

const behaviorStyles: Record<string, string> = {
  "Always on time": "bg-[#1A6B3C]/10 text-[#1A6B3C]",
  "Avg 8 days late": "bg-amber-100 text-[#8B5A00]",
  "Consistently 30+ days": "bg-[#C41E1E]/10 text-[#C41E1E]",
  "Irregular": "bg-gray-100 text-gray-500",
};

const CustomersPage = () => (
  <DashboardLayout>
    {/* TOP KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">ACTIVE CUSTOMERS</p>
        <p className="text-white text-[28px] font-serif font-bold mt-1">47</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">TOTAL RECEIVABLES</p>
        <p className="text-white text-[28px] font-serif font-bold mt-1">₹22.1L</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">AVG CUSTOMER VALUE (3M)</p>
        <p className="text-white text-[28px] font-serif font-bold mt-1">₹1.8L</p>
      </div>
      <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
        <p className="text-white/40 text-[13px] fyn-label">AT-RISK CUSTOMERS</p>
        <p className="text-[#C41E1E] text-[28px] font-serif font-bold mt-1">4</p>
        <p className="text-[#C41E1E] text-xs mt-1">Default or churn risk</p>
      </div>
    </div>

    {/* REVENUE CONCENTRATION */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <h3 className="text-fyn-ink font-serif text-lg mb-4">Revenue Concentration</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width={220} height={220}>
            <PieChart>
              <Pie data={revenueConc} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {revenueConc.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 space-y-1">
          {revenueConc.map((c) => (
            <div key={c.name} className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
              <span className="flex-1 text-fyn-ink">{c.name}</span>
              <span className="fyn-metric font-medium">{c.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-fyn-warning-bg border border-[#8B5A00]/30 rounded-lg p-5 flex flex-col justify-center">
        <h3 className="text-[#8B5A00] font-serif text-lg mb-3">⚠ Concentration Risk</h3>
        <p className="text-fyn-ink/70 text-sm leading-relaxed">
          ABC Electronics is 18% of your revenue. If they stop ordering, runway drops from 52 to 38 days.
        </p>
        <p className="text-fyn-ink/70 text-sm leading-relaxed mt-2">
          Top 3 customers = 44% of revenue. Consider diversifying your customer base.
        </p>
      </div>
    </div>

    {/* CUSTOMER TABLE */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">All Customers</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
              <th className="text-left py-2">Customer</th>
              <th className="text-left py-2">Industry</th>
              <th className="text-right py-2">Revenue (3m)</th>
              <th className="text-right py-2">Outstanding</th>
              <th className="text-right py-2">DSO</th>
              <th className="text-center py-2">Risk</th>
              <th className="text-left py-2">Last Order</th>
              <th className="text-center py-2">Payment Behavior</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, i) => (
              <tr key={c.name} className={`border-b border-fyn-ink-10 last:border-0 hover:bg-fyn-beige-deep transition-colors cursor-pointer ${i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"}`}>
                <td className="py-3 text-fyn-ink font-semibold">{c.name}</td>
                <td className="py-3 text-fyn-ink/60">{c.industry}</td>
                <td className="py-3 text-right fyn-metric">{formatINR(c.rev3m)}</td>
                <td className="py-3 text-right fyn-metric font-semibold">{formatINR(c.outstanding)}</td>
                <td className="py-3 text-right fyn-metric">{c.dso}d</td>
                <td className="py-3 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold ${c.risk > 70 ? "bg-[#C41E1E]/10 text-[#C41E1E]" : c.risk > 40 ? "bg-amber-100 text-[#8B5A00]" : "bg-green-50 text-[#1A6B3C]"}`}>
                    {c.risk}
                  </span>
                </td>
                <td className="py-3 text-fyn-ink/60 text-xs">{c.lastOrder}</td>
                <td className="py-3 text-center">
                  <span className={`text-[11px] px-2 py-0.5 rounded ${behaviorStyles[c.behavior]}`}>{c.behavior}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default CustomersPage;
