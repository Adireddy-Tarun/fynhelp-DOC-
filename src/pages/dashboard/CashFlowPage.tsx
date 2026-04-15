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

const catChipStyles: Record<string, { bg: string; color: string }> = {
  Revenue: { bg: "#DCFCE7", color: "#16A34A" },
  COGS: { bg: "#FDEAEA", color: "#C41E1E" },
  Finance: { bg: "#FEF3E2", color: "#8B5A00" },
  Overhead: { bg: "#F3E8FF", color: "#6B21A8" },
  Payroll: { bg: "#EAF0FB", color: "#1A4A8B" },
  GST: { bg: "#FEF3E2", color: "#8B5A00" },
  Other: { bg: "#F1F5F9", color: "#475569" },
};

const periods = ["30D", "90D", "6M", "1Y"];

const CashFlowPage = () => {
  const [activePeriod, setActivePeriod] = useState("90D");
  const [dirFilter, setDirFilter] = useState<"all" | "in" | "out">("all");

  const filteredTxns = transactions.filter(t => dirFilter === "all" || t.dir === dirFilter);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const cashIn = payload.find((p: any) => p.dataKey === "cashIn")?.value || 0;
    const cashOut = payload.find((p: any) => p.dataKey === "cashOut")?.value || 0;
    const net = cashIn - cashOut;
    return (
      <div style={{ background: "#1A1008", borderRadius: 8, padding: "12px 16px", border: "none" }}>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6 }}>{label}</p>
        <p style={{ color: "#4ADE80", fontSize: 14, fontWeight: 600 }}>In: ₹{cashIn.toLocaleString("en-IN")}</p>
        <p style={{ color: "#F87171", fontSize: 14, fontWeight: 600 }}>Out: ₹{cashOut.toLocaleString("en-IN")}</p>
        <p style={{ color: net >= 0 ? "#FFFFFF" : "#F87171", fontSize: 14, fontWeight: 600 }}>Net: ₹{net.toLocaleString("en-IN")}</p>
      </div>
    );
  };

  return (
    <DashboardLayout>
      {/* TOP METRICS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#1A1008", padding: "20px 24px" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>BALANCE TODAY</p>
          <p className="font-serif" style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 700, marginTop: 4 }}>₹12.4L</p>
          <p style={{ color: "#16A34A", fontSize: 13, marginTop: 4 }}>↑ ₹40K from yesterday</p>
          <p style={{ color: "#8B6914", fontSize: 11, marginTop: 2 }}>HDFC CA · synced 12 min ago</p>
        </div>
        <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#1A1008", padding: "20px 24px" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>DAILY BURN</p>
          <p className="font-serif" style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 700, marginTop: 4 }}>₹23,846</p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, marginTop: 4 }}>30-day rolling average</p>
          <p style={{ color: "#DC2626", fontSize: 13, marginTop: 2 }}>↑ 8% from last month</p>
        </div>
        <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#1A1008", padding: "20px 24px" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>RUNWAY</p>
          <p className="font-serif" style={{ color: "#F59E0B", fontSize: 28, fontWeight: 700, marginTop: 4 }}>52 days</p>
          <div style={{ marginTop: 8, height: 6, background: "rgba(255,255,255,0.10)", borderRadius: 3 }}>
            <div className="progress-fill-animate" style={{ height: 6, borderRadius: 3, background: "#F59E0B", width: `${(52 / 180) * 100}%` }} />
          </div>
          <p style={{ color: "rgba(255,255,255,0.40)", fontSize: 11, marginTop: 4 }}>Green &gt;90 · Amber 30-90 · Red &lt;30</p>
        </div>
        <div className="rounded-lg transition-all duration-250 hover:-translate-y-[3px] cursor-pointer" style={{ background: "#1A1008", padding: "20px 24px" }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; }}
        >
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>30-DAY NET</p>
          <p className="font-serif" style={{ color: "#16A34A", fontSize: 28, fontWeight: 700, marginTop: 4 }}>+₹2.8L</p>
          <p style={{ color: "rgba(255,255,255,0.60)", fontSize: 13, marginTop: 4 }}>Cash in minus cash out</p>
          <p style={{ color: "#16A34A", fontSize: 13, marginTop: 2 }}>vs last month: +12%</p>
        </div>
      </div>

      {/* CASH FLOW CHART */}
      <div className="rounded-lg p-5 mb-6" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fyn-ink font-serif" style={{ fontSize: 15 }}>Cash Flow — Last 90 Days + 30-Day Forecast</h3>
          <div className="flex gap-1">
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => setActivePeriod(p)}
                className="transition-colors"
                style={{
                  fontSize: 13, padding: "4px 12px", borderRadius: 4,
                  background: activePeriod === p ? "#C41E1E" : "transparent",
                  color: activePeriod === p ? "#FFFFFF" : "rgba(26,16,8,0.40)",
                }}
              >{p}</button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={cashFlowData}>
            <defs>
              <linearGradient id="cfGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#16A34A" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#16A34A" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="cfRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DC2626" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#DC2626" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgba(26,16,8,0.45)" }} interval={14} />
            <YAxis tick={{ fontSize: 11, fill: "rgba(26,16,8,0.45)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceArea x1={cashFlowData[90]?.date} x2={cashFlowData[119]?.date} fill="#8B6914" fillOpacity={0.06} />
            <ReferenceLine y={50000} stroke="#DC2626" strokeDasharray="4 4" label={{ value: "Danger ₹50K", fill: "#DC2626", fontSize: 10 }} />
            <Area type="monotone" dataKey="cashIn" stroke="#16A34A" strokeWidth={2} fill="url(#cfGreen)" />
            <Area type="monotone" dataKey="cashOut" stroke="#DC2626" strokeWidth={2} fill="url(#cfRed)" />
          </AreaChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3">
          <span className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
            <span className="inline-block w-4 h-4 rounded-sm" style={{ background: "#16A34A" }} /> Money In
          </span>
          <span className="flex items-center gap-1.5" style={{ fontSize: 13, fontWeight: 500 }}>
            <span className="inline-block w-4 h-4 rounded-sm" style={{ background: "#DC2626" }} /> Money Out
          </span>
          <span className="flex items-center gap-1.5" style={{ fontSize: 13 }}>
            <span className="inline-block w-4 h-4 rounded-sm" style={{ background: "rgba(139,105,20,0.10)" }} /> Forecast Zone
          </span>
        </div>
      </div>

      {/* MONEY FLOW BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1008", marginBottom: 16 }}>Money In — ₹18.4L total</h3>
          <div className="h-6 flex rounded-lg overflow-hidden mb-4">
            {moneyInCategories.map((c, i) => (
              <div key={i} className="h-full" style={{ width: `${c.pct}%`, background: "#16A34A", opacity: 1 - i * 0.25 }} />
            ))}
          </div>
          <div className="space-y-2">
            {moneyInCategories.map((c) => (
              <div key={c.cat} className="flex items-center gap-3" style={{ fontSize: 14 }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#16A34A" }} />
                <span className="flex-1 text-fyn-ink">{c.cat}</span>
                <span className="text-fyn-ink fyn-metric" style={{ fontWeight: 600 }}>{formatINR(c.amount)}</span>
                <span style={{ color: "rgba(26,16,8,0.40)", width: 40, textAlign: "right" }}>{c.pct}%</span>
                <span style={{ width: 48, textAlign: "right", fontSize: 13, color: c.positive ? "#16A34A" : "#DC2626" }}>{c.trend}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg p-5" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: "#1A1008", marginBottom: 16 }}>Money Out — ₹15.6L total</h3>
          <div className="h-6 flex rounded-lg overflow-hidden mb-4">
            {moneyOutCategories.map((c) => (
              <div key={c.cat} className="h-full" style={{ width: `${c.pct}%`, background: c.color }} />
            ))}
          </div>
          <div className="space-y-2">
            {moneyOutCategories.map((c) => (
              <div key={c.cat} className="flex items-center gap-3" style={{ fontSize: 14 }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                <span className="flex-1 text-fyn-ink">{c.cat}</span>
                <span className="text-fyn-ink fyn-metric" style={{ fontWeight: 600 }}>{formatINR(c.amount)}</span>
                <span style={{ color: "rgba(26,16,8,0.40)", width: 40, textAlign: "right" }}>{c.pct}%</span>
                <span style={{ width: 48, textAlign: "right", fontSize: 13, color: c.positive ? "#16A34A" : "#DC2626" }}>{c.trend}</span>
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
