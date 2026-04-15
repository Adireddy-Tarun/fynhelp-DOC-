import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  ReferenceLine, ReferenceArea
} from "recharts";

const cashFlowData = Array.from({ length: 120 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - 90 + i);
  const isFuture = i > 90;
  return {
    date: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
    cashIn: Math.round((15000 + Math.random() * 35000) * (isFuture ? 0.9 : 1)),
    cashOut: Math.round((18000 + Math.random() * 25000) * (isFuture ? 0.95 : 1)),
    isFuture,
  };
});

const moneyInCategories = [
  { cat: "Customer Payments", amount: 1420000, pct: 77, trend: "↑ 8%", positive: true },
  { cat: "Advance Receipts", amount: 280000, pct: 15, trend: "↓ 2%", positive: false },
  { cat: "Other Income", amount: 140000, pct: 8, trend: "→ 0%", positive: true },
];

const moneyOutCategories = [
  { cat: "Supplier Payments", amount: 680000, pct: 44, trend: "↑ 12%", positive: false, color: "#C41E1E" },
  { cat: "Payroll", amount: 420000, pct: 27, trend: "→ 0%", positive: true, color: "#8B5A00" },
  { cat: "GST / TDS", amount: 210000, pct: 13, trend: "↓ 1%", positive: true, color: "#1A4A8B" },
  { cat: "Rent & Overhead", amount: 140000, pct: 9, trend: "→ 0%", positive: true, color: "#6B21A8" },
  { cat: "Loan EMI", amount: 80000, pct: 5, trend: "→ 0%", positive: true, color: "#374151" },
  { cat: "Other", amount: 30000, pct: 2, trend: "↑ 1%", positive: false, color: "#6B7280" },
];

const transactions = [
  { date: "Apr 12", desc: "Payment from Kumar Fabrics", cat: "Revenue", bank: "HDFC CA", amount: 55000, dir: "in", balance: 1240000 },
  { date: "Apr 11", desc: "Raj Textiles — raw material", cat: "COGS", bank: "HDFC CA", amount: 120000, dir: "out", balance: 1185000 },
  { date: "Apr 10", desc: "HDFC Bank interest", cat: "Finance", bank: "HDFC CA", amount: 1200, dir: "in", balance: 1305000 },
  { date: "Apr 9", desc: "Office rent — April", cat: "Overhead", bank: "HDFC CA", amount: 45000, dir: "out", balance: 1303800 },
  { date: "Apr 8", desc: "Partial payment — Sharma & Sons", cat: "Revenue", bank: "ICICI CA", amount: 100000, dir: "in", balance: 1348800 },
  { date: "Apr 7", desc: "Internet & phone bills", cat: "Overhead", bank: "HDFC CA", amount: 8500, dir: "out", balance: 1248800 },
  { date: "Apr 6", desc: "GST Payment — March", cat: "GST", bank: "HDFC CA", amount: 86000, dir: "out", balance: 1257300 },
  { date: "Apr 5", desc: "Chennai Trading Co", cat: "Revenue", bank: "ICICI CA", amount: 190000, dir: "in", balance: 1343300 },
  { date: "Apr 4", desc: "Staff salaries — March", cat: "Payroll", bank: "HDFC CA", amount: 420000, dir: "out", balance: 1153300 },
  { date: "Apr 3", desc: "Delhi Distributors advance", cat: "Revenue", bank: "HDFC CA", amount: 50000, dir: "in", balance: 1573300 },
];

const catColors: Record<string, string> = {
  Revenue: "bg-[#1A6B3C] text-white",
  COGS: "bg-[#C41E1E] text-white",
  Finance: "bg-fyn-gold text-white",
  Overhead: "bg-[#6B21A8] text-white",
  Payroll: "bg-[#1A4A8B] text-white",
  GST: "bg-[#8B5A00] text-white",
};

const periods = ["30D", "90D", "6M", "1Y"];

const CashFlowPage = () => {
  const [activePeriod, setActivePeriod] = useState("90D");
  const [dirFilter, setDirFilter] = useState<"all" | "in" | "out">("all");

  const filteredTxns = transactions.filter(t => dirFilter === "all" || t.dir === dirFilter);

  return (
    <DashboardLayout>
      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-white/40 text-[13px] fyn-label">BALANCE TODAY</p>
          <p className="text-white text-[28px] font-serif font-bold mt-1">₹12.4L</p>
          <p className="text-[#1A6B3C] text-[13px] mt-1">↑ ₹40K from yesterday</p>
          <p className="text-fyn-gold text-[11px] mt-0.5">HDFC CA · synced 12 min ago</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-white/40 text-[13px] fyn-label">DAILY BURN</p>
          <p className="text-white text-[28px] font-serif font-bold mt-1">₹23,846</p>
          <p className="text-white/60 text-[13px] mt-1">30-day rolling average</p>
          <p className="text-[#C41E1E] text-[13px] mt-0.5">↑ 8% from last month</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-white/40 text-[13px] fyn-label">RUNWAY</p>
          <p className="text-[#8B5A00] text-[28px] font-serif font-bold mt-1">52 days</p>
          <div className="mt-2 h-2 bg-white/10 rounded-full relative">
            <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${(30 / 180) * 100}%`, background: "#C41E1E", opacity: 0.4 }} />
            <div className="absolute inset-y-0 rounded-full" style={{ left: `${(30 / 180) * 100}%`, width: `${(60 / 180) * 100}%`, background: "#8B5A00", opacity: 0.4 }} />
            <div className="absolute inset-y-0 rounded-full" style={{ left: `${(90 / 180) * 100}%`, right: 0, background: "#1A6B3C", opacity: 0.4 }} />
            <div className="absolute top-0 h-2 bg-[#8B5A00] rounded-full transition-all" style={{ width: `${(52 / 180) * 100}%` }} />
          </div>
          <p className="text-white/40 text-[11px] mt-1.5">Green &gt;90 · Amber 30-90 · Red &lt;30</p>
        </div>
        <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <p className="text-white/40 text-[13px] fyn-label">30-DAY NET</p>
          <p className="text-[#1A6B3C] text-[28px] font-serif font-bold mt-1">+₹2.8L</p>
          <p className="text-white/60 text-[13px] mt-1">Cash in minus cash out</p>
          <p className="text-[#1A6B3C] text-[13px] mt-0.5">vs last month: +12%</p>
        </div>
      </div>

      {/* CASH FLOW CHART */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink font-serif text-lg">Cash Flow — Last 90 Days + 30-Day Forecast</h3>
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className={`text-xs px-3 py-1.5 rounded transition-colors ${
                  activePeriod === p ? "bg-fyn-red text-white" : "text-fyn-ink/40 hover:bg-fyn-ink/5"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={cashFlowData}>
            <defs>
              <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1A6B3C" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#1A6B3C" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C41E1E" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#C41E1E" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={14} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff", fontSize: 13 }}
              formatter={(v: number, name: string) => [
                `₹${v.toLocaleString("en-IN")}`,
                name === "cashIn" ? "Money In" : "Money Out",
              ]}
              labelStyle={{ color: "#8B6914" }}
            />
            <ReferenceArea x1={cashFlowData[90]?.date} x2={cashFlowData[119]?.date} fill="#8B6914" fillOpacity={0.06} />
            <ReferenceLine y={50000} stroke="#C41E1E" strokeDasharray="4 4" label={{ value: "Danger ₹50K", fill: "#C41E1E", fontSize: 10 }} />
            <Area type="monotone" dataKey="cashIn" stroke="#1A6B3C" strokeWidth={2} fill="url(#greenGrad)" name="cashIn" />
            <Area type="monotone" dataKey="cashOut" stroke="#C41E1E" strokeWidth={2} fill="url(#redGrad)" name="cashOut" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#1A6B3C] inline-block" /> Money In</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-[#C41E1E] inline-block" /> Money Out</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#8B6914]/10 inline-block rounded" /> Forecast Zone</span>
        </div>
      </div>

      {/* MONEY FLOW BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-semibold text-[15px] mb-4">Money In — ₹18.4L total</h3>
          <div className="h-6 flex rounded-lg overflow-hidden mb-4">
            {moneyInCategories.map((c, i) => (
              <div key={i} className="h-full bg-[#1A6B3C] first:rounded-l-lg last:rounded-r-lg" style={{ width: `${c.pct}%`, opacity: 1 - i * 0.25 }} />
            ))}
          </div>
          <div className="space-y-2">
            {moneyInCategories.map((c) => (
              <div key={c.cat} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full bg-[#1A6B3C] flex-shrink-0" />
                <span className="flex-1 text-fyn-ink">{c.cat}</span>
                <span className="text-fyn-ink font-semibold fyn-metric">{formatINR(c.amount)}</span>
                <span className="text-fyn-ink/40 w-10 text-right">{c.pct}%</span>
                <span className={`w-12 text-right text-xs ${c.positive ? "text-[#1A6B3C]" : "text-[#C41E1E]"}`}>{c.trend}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink font-semibold text-[15px] mb-4">Money Out — ₹15.6L total</h3>
          <div className="h-6 flex rounded-lg overflow-hidden mb-4">
            {moneyOutCategories.map((c) => (
              <div key={c.cat} className="h-full" style={{ width: `${c.pct}%`, background: c.color }} />
            ))}
          </div>
          <div className="space-y-2">
            {moneyOutCategories.map((c) => (
              <div key={c.cat} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="flex-1 text-fyn-ink">{c.cat}</span>
                <span className="text-fyn-ink font-semibold fyn-metric">{formatINR(c.amount)}</span>
                <span className="text-fyn-ink/40 w-10 text-right">{c.pct}%</span>
                <span className={`w-12 text-right text-xs ${c.positive ? "text-[#1A6B3C]" : "text-[#C41E1E]"}`}>{c.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TRANSACTION HISTORY */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink font-serif text-lg">Transaction History</h3>
          <button className="text-fyn-red text-sm font-medium border border-fyn-red/20 px-3 py-1.5 rounded hover:bg-fyn-red-light transition-colors">
            Export to Excel
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-fyn-beige rounded-lg">
          <input placeholder="Search description..." className="h-9 px-3 bg-white border border-fyn-ink-10 rounded text-sm flex-1 min-w-[160px] outline-none focus:ring-2 focus:ring-fyn-red" />
          <div className="flex gap-1">
            {(["all", "in", "out"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDirFilter(d)}
                className={`text-xs px-3 py-2 rounded transition-colors ${
                  dirFilter === d ? "bg-fyn-ink text-white" : "bg-white border border-fyn-ink-10 text-fyn-ink/60"
                }`}
              >
                {d === "all" ? "All" : d === "in" ? "Money In" : "Money Out"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Description</th>
                <th className="text-left py-2">Category</th>
                <th className="text-left py-2">Bank</th>
                <th className="text-right py-2">Amount</th>
                <th className="text-right py-2">Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.map((t, i) => (
                <tr
                  key={i}
                  className={`border-b border-fyn-ink-10 last:border-0 hover:bg-fyn-beige-deep transition-colors cursor-pointer ${
                    i % 2 === 0 ? "bg-[#FAF7F0]" : "bg-white"
                  }`}
                >
                  <td className="py-3 text-fyn-ink/60">{t.date}</td>
                  <td className="py-3 text-fyn-ink font-medium">{t.desc}</td>
                  <td className="py-3">
                    <span className={`text-[11px] px-2 py-0.5 rounded ${catColors[t.cat] || "bg-gray-100 text-gray-600"}`}>
                      {t.cat}
                    </span>
                  </td>
                  <td className="py-3 text-fyn-ink/50 text-xs">{t.bank}</td>
                  <td className={`py-3 text-right fyn-metric font-semibold ${t.dir === "in" ? "text-[#1A6B3C]" : "text-[#C41E1E]"}`}>
                    {t.dir === "in" ? "+" : "-"}{formatINR(t.amount)}
                  </td>
                  <td className="py-3 text-right fyn-metric text-fyn-ink/60">{formatINR(t.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CashFlowPage;
