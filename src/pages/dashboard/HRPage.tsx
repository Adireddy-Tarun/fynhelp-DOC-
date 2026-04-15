import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const deptBreakdown = [
  { name: "Operations", value: 4, color: "#1A4A8B" },
  { name: "Sales", value: 3, color: "#1A6B3C" },
  { name: "Admin", value: 2, color: "#8B5A00" },
  { name: "Finance", value: 2, color: "#6B21A8" },
  { name: "Tech", value: 1, color: "#C41E1E" },
];

const headcountTrend = [
  { month: "May", count: 10 }, { month: "Jun", count: 10 }, { month: "Jul", count: 11 },
  { month: "Aug", count: 11 }, { month: "Sep", count: 11 }, { month: "Oct", count: 12 },
  { month: "Nov", count: 12 }, { month: "Dec", count: 12 }, { month: "Jan", count: 12 },
  { month: "Feb", count: 12 }, { month: "Mar", count: 12 }, { month: "Apr", count: 12 },
];

const payrollBreakdown = [
  { component: "Basic Salary", amount: 510000, pct: 61 },
  { component: "HRA", amount: 120000, pct: 14 },
  { component: "PF Employer", amount: 61000, pct: 7 },
  { component: "ESIC Employer", amount: 27000, pct: 3 },
  { component: "Bonus Provision", amount: 70000, pct: 8 },
  { component: "Other Allowances", amount: 58000, pct: 7 },
];

const attritionRisks = [
  { role: "Senior Developer", count: 3, gap: "23% below market median", risk: "High" },
  { role: "Sales Executive", count: 2, gap: "12% below market median", risk: "Medium" },
  { role: "Accountant", count: 1, gap: "5% below market median", risk: "Low" },
];

const HRPage = () => {
  const [view, setView] = useState<"executive" | "hr">("executive");
  const [hireCTC, setHireCTC] = useState(600000);
  const hireCount = 1;
  const trueCost = Math.round(hireCTC * 1.343);
  const hireRunway = Math.max(15, 52 - Math.round(trueCost / 12 / 23846 * 30));

  return (
    <DashboardLayout>
      {/* ROLE TOGGLE */}
      <div className="flex justify-end mb-4">
        <div className="flex bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-0.5">
          {(["executive", "hr"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`px-4 py-1.5 rounded text-sm transition-colors ${view === v ? "bg-fyn-ink text-white" : "text-fyn-ink/50"}`}>
              {v === "executive" ? "Executive View" : "HR Manager View"}
            </button>
          ))}
        </div>
      </div>

      {/* TOP METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {view === "executive" ? (
          <>
            <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <p className="text-white/40 text-[13px] fyn-label">HEADCOUNT</p>
              <p className="text-white text-[28px] font-serif font-bold mt-1">12</p>
            </div>
            <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <p className="text-white/40 text-[13px] fyn-label">MONTHLY PAYROLL</p>
              <p className="text-white text-[28px] font-serif font-bold mt-1">₹8.4L</p>
              <p className="text-white/40 text-xs mt-1">46% of revenue</p>
            </div>
            <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <p className="text-white/40 text-[13px] fyn-label">PAYROLL DATE</p>
              <p className="text-[#8B5A00] text-[28px] font-serif font-bold mt-1">18 days</p>
            </div>
            <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <p className="text-white/40 text-[13px] fyn-label">ATTRITION RISK</p>
              <p className="text-[#C41E1E] text-[28px] font-serif font-bold mt-1">2</p>
              <p className="text-[#C41E1E] text-xs mt-1">employees at risk</p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <p className="text-white/40 text-[13px] fyn-label">PF DUE</p>
              <p className="text-[#C41E1E] text-[28px] font-serif font-bold mt-1">₹1.01L</p>
              <p className="text-[#C41E1E] text-xs mt-1">Apr 15 — due soon</p>
            </div>
            <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <p className="text-white/40 text-[13px] fyn-label">ESIC DUE</p>
              <p className="text-white text-[28px] font-serif font-bold mt-1">₹27K</p>
              <p className="text-white/40 text-xs mt-1">Apr 15</p>
            </div>
            <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <p className="text-white/40 text-[13px] fyn-label">TDS ON SALARY</p>
              <p className="text-white text-[28px] font-serif font-bold mt-1">₹86K</p>
              <p className="text-white/40 text-xs mt-1">Apr 30</p>
            </div>
            <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <p className="text-white/40 text-[13px] fyn-label">PENDING APPROVALS</p>
              <p className="text-[#8B5A00] text-[28px] font-serif font-bold mt-1">3</p>
            </div>
          </>
        )}
      </div>

      {/* HEADCOUNT + PAYROLL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-serif text-lg mb-4">Team by Department</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie data={deptBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {deptBreakdown.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-fyn-ink fyn-metric font-semibold -mt-1">12 total</p>
          <div className="mt-3 space-y-1">
            {deptBreakdown.map((d) => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                <span className="flex-1 text-fyn-ink">{d.name}</span>
                <span className="fyn-metric">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-serif text-lg mb-4">Headcount Trend (12m)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={headcountTrend}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[8, 14]} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1A4A8B" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* PAYROLL BREAKDOWN */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
        <h3 className="text-fyn-ink font-serif text-lg mb-4">Payroll Breakdown — This Month</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                <th className="text-left py-2">Component</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {payrollBreakdown.map((p) => (
                <tr key={p.component} className="border-b border-fyn-ink-10 last:border-0">
                  <td className="py-3 text-fyn-ink">{p.component}</td>
                  <td className="py-3 text-right fyn-metric">{formatINR(p.amount)}</td>
                  <td className="py-3 text-right text-fyn-ink/50">{p.pct}%</td>
                </tr>
              ))}
              <tr className="font-semibold bg-fyn-beige">
                <td className="py-3 text-fyn-ink">TOTAL</td>
                <td className="py-3 text-right fyn-metric">{formatINR(846000)}</td>
                <td className="py-3 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ATTRITION RISK */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
        <h3 className="text-fyn-ink font-serif text-lg mb-4">Attrition Risk</h3>
        <div className="space-y-3">
          {attritionRisks.map((e) => (
            <div key={e.role} className="flex items-center justify-between p-3 bg-fyn-beige rounded-lg hover:-translate-y-0.5 hover:shadow-md transition-all">
              <div>
                <p className="text-fyn-ink font-medium text-sm">{e.role} ({e.count})</p>
                <p className="text-fyn-ink/50 text-xs">{e.gap}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${e.risk === "High" ? "bg-[#C41E1E]/10 text-[#C41E1E]" : e.risk === "Medium" ? "bg-amber-100 text-[#8B5A00]" : "bg-green-50 text-[#1A6B3C]"}`}>{e.risk}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HIRING SIMULATOR */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <h3 className="text-fyn-ink font-serif text-lg mb-3">Can I afford to hire?</h3>
        <div className="space-y-4">
          <div>
            <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">CTC: {formatINR(hireCTC)}</label>
            <input type="range" min={300000} max={3000000} step={50000} value={hireCTC} onChange={(e) => setHireCTC(Number(e.target.value))} className="w-full accent-[#C41E1E]" />
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-fyn-beige rounded-lg p-3">
              <p className="text-fyn-ink/50 text-[10px] fyn-label">TRUE MONTHLY COST</p>
              <p className="text-fyn-ink fyn-metric text-lg font-semibold">{formatINR(Math.round(trueCost / 12))}</p>
            </div>
            <div className="bg-fyn-beige rounded-lg p-3">
              <p className="text-fyn-ink/50 text-[10px] fyn-label">RUNWAY IMPACT</p>
              <p className={`fyn-metric text-lg font-semibold ${hireRunway < 30 ? "text-[#C41E1E]" : "text-[#8B5A00]"}`}>-{52 - hireRunway}d</p>
            </div>
            <div className="bg-fyn-beige rounded-lg p-3">
              <p className="text-fyn-ink/50 text-[10px] fyn-label">BREAK-EVEN REV</p>
              <p className="text-fyn-ink fyn-metric text-lg font-semibold">{formatINR(Math.round(trueCost / 12 / 0.34))}/mo</p>
            </div>
          </div>
          <button className="text-fyn-red text-sm font-medium hover:underline">Run full simulation →</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HRPage;
