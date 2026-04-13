import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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

const CashFlowPage = () => (
  <DashboardLayout>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Balance", value: "₹12.4L", change: "↑ ₹40K", positive: true },
        { label: "Daily Burn", value: "₹23,846", change: "↓ 3%", positive: true },
        { label: "Runway", value: "52 days", change: "↓ 8 days", positive: false },
        { label: "30-Day Net", value: "+₹2.8L", change: "Positive", positive: true },
      ].map((m) => (
        <div key={m.label} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-4">
          <p className="text-fyn-ink/50 text-xs fyn-label">{m.label}</p>
          <p className="text-fyn-ink text-2xl fyn-metric font-bold mt-1">{m.value}</p>
          <p className={`text-xs mt-1 ${m.positive ? "text-fyn-success" : "text-fyn-red"}`}>{m.change}</p>
        </div>
      ))}
    </div>

    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fyn-ink font-serif text-lg">Cash Flow — Last 90 Days + 30-Day Forecast</h3>
        <div className="flex gap-1">
          {["30D", "90D", "6M", "1Y"].map((p) => (
            <button key={p} className={`text-xs px-2 py-1 rounded ${p === "90D" ? "bg-fyn-ink text-white" : "text-fyn-ink/40"}`}>{p}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={cashFlowData}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={14} />
          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
          <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, ""]} />
          <Area type="monotone" dataKey="cashIn" stroke="#1A6B3C" fill="#1A6B3C" fillOpacity={0.15} strokeDasharray={undefined} />
          <Area type="monotone" dataKey="cashOut" stroke="#C41E1E" fill="#C41E1E" fillOpacity={0.15} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fyn-ink font-serif text-lg">Transaction History</h3>
        <button className="text-fyn-red text-sm font-medium">Export to Excel</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
              <th className="text-left py-2">Date</th>
              <th className="text-left py-2">Description</th>
              <th className="text-left py-2">Category</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: "Apr 12", desc: "Payment from Kumar Fabrics", cat: "Revenue", amount: 55000, dir: "in" },
              { date: "Apr 11", desc: "Raj Textiles — raw material", cat: "COGS", amount: -120000, dir: "out" },
              { date: "Apr 10", desc: "HDFC Bank interest", cat: "Finance", amount: 1200, dir: "in" },
              { date: "Apr 9", desc: "Office rent — April", cat: "Overhead", amount: -45000, dir: "out" },
              { date: "Apr 8", desc: "Partial payment — Sharma & Sons", cat: "Revenue", amount: 100000, dir: "in" },
              { date: "Apr 7", desc: "Internet & phone bills", cat: "Overhead", amount: -8500, dir: "out" },
            ].map((t, i) => (
              <tr key={i} className="border-b border-fyn-ink-10 last:border-0">
                <td className="py-3 text-fyn-ink/60">{t.date}</td>
                <td className="py-3 text-fyn-ink">{t.desc}</td>
                <td className="py-3 text-fyn-ink/50">{t.cat}</td>
                <td className={`py-3 text-right fyn-metric ${t.dir === "in" ? "text-fyn-success" : "text-fyn-red"}`}>
                  {t.dir === "in" ? "+" : ""}{formatINR(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default CashFlowPage;
