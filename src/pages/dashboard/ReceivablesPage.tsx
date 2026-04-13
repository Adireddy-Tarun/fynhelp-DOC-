import DashboardLayout from "@/components/DashboardLayout";
import { formatINR, getDaysOverdueColor } from "@/lib/indian-format";

const mockReceivables = [
  { id: "1", customer: "ABC Electronics", invoice: "INV-2025-0342", date: "2025-02-05", due: "2025-02-10", amount: 840000, received: 0, outstanding: 840000, risk: 85, lastChase: "Mar 28" },
  { id: "2", customer: "Sharma & Sons", invoice: "INV-2025-0298", date: "2025-02-20", due: "2025-03-05", amount: 310000, received: 0, outstanding: 310000, risk: 62, lastChase: "Apr 2" },
  { id: "3", customer: "Delhi Distributors", invoice: "INV-2025-0401", date: "2025-03-18", due: "2025-04-01", amount: 570000, received: 0, outstanding: 570000, risk: 35, lastChase: "—" },
  { id: "4", customer: "Kumar Fabrics", invoice: "INV-2025-0412", date: "2025-04-01", due: "2025-04-15", amount: 220000, received: 55000, outstanding: 165000, risk: 15, lastChase: "—" },
  { id: "5", customer: "Chennai Trading Co", invoice: "INV-2025-0389", date: "2025-03-10", due: "2025-03-25", amount: 190000, received: 0, outstanding: 190000, risk: 48, lastChase: "Apr 5" },
];

const daysOverdue = (due: string) => Math.max(0, Math.floor((Date.now() - new Date(due).getTime()) / 86400000));

const agingBuckets = [
  { label: "Current", count: 3, amount: 450000, color: "bg-fyn-success" },
  { label: "0-30d", count: 2, amount: 380000, color: "bg-fyn-success" },
  { label: "31-60d", count: 1, amount: 310000, color: "bg-amber-500" },
  { label: "61-90d", count: 1, amount: 840000, color: "bg-fyn-red" },
  { label: "90d+", count: 0, amount: 0, color: "bg-red-800" },
];
const totalAging = agingBuckets.reduce((s, b) => s + b.amount, 0);

const ReceivablesPage = () => (
  <DashboardLayout>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Total Outstanding", value: formatINR(2075000) },
        { label: "Overdue", value: formatINR(2210000), red: true },
        { label: "Collected MTD", value: formatINR(155000) },
        { label: "DSO", value: "42 days" },
      ].map((m) => (
        <div key={m.label} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-4">
          <p className="text-fyn-ink/50 text-xs fyn-label">{m.label}</p>
          <p className={`text-xl fyn-metric font-bold mt-1 ${m.red ? "text-fyn-red" : "text-fyn-ink"}`}>{m.value}</p>
        </div>
      ))}
    </div>

    {/* MSME Alert */}
    <div className="bg-fyn-red-light border border-fyn-red/20 rounded-lg p-4 mb-6">
      <p className="text-fyn-ink text-sm font-medium">🔔 You have 2 invoices from large corporate buyers that are 30+ days overdue.</p>
      <p className="text-fyn-ink/60 text-xs mt-1">Under Section 43B(h), you have legal rights to collect. <span className="text-fyn-red cursor-pointer hover:underline">View your rights →</span></p>
    </div>

    {/* Aging funnel */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">Aging Breakdown</h3>
      <div className="flex h-6 rounded overflow-hidden mb-3">
        {agingBuckets.map((b) => (
          <div key={b.label} className={`${b.color} transition-all`} style={{ width: `${totalAging > 0 ? (b.amount / totalAging) * 100 : 0}%` }} title={`${b.label}: ${formatINR(b.amount)}`} />
        ))}
      </div>
      <div className="flex gap-4 text-xs">
        {agingBuckets.map((b) => (
          <span key={b.label} className="text-fyn-ink/60"><span className={`inline-block w-2 h-2 rounded-full ${b.color} mr-1`} />{b.label}: {formatINR(b.amount)}</span>
        ))}
      </div>
    </div>

    {/* Receivables table */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-fyn-ink font-serif text-lg">All Receivables</h3>
        <div className="flex gap-2">
          <button className="text-fyn-red text-xs font-medium border border-fyn-red/20 px-3 py-1 rounded hover:bg-fyn-red-light">Send chase to selected</button>
          <button className="text-fyn-ink/50 text-xs border border-fyn-ink-10 px-3 py-1 rounded hover:bg-fyn-ink/5">Export to Excel</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
              <th className="text-left py-2"><input type="checkbox" aria-label="Select all" /></th>
              <th className="text-left py-2">Customer</th>
              <th className="text-left py-2">Invoice</th>
              <th className="text-left py-2">Due Date</th>
              <th className="text-right py-2">Amount</th>
              <th className="text-right py-2">Outstanding</th>
              <th className="text-right py-2">Days Overdue</th>
              <th className="text-right py-2">Risk</th>
              <th className="text-right py-2">Last Chase</th>
              <th className="text-right py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {mockReceivables.map((r) => {
              const days = daysOverdue(r.due);
              return (
                <tr key={r.id} className="border-b border-fyn-ink-10 last:border-0">
                  <td className="py-3"><input type="checkbox" aria-label={`Select ${r.customer}`} /></td>
                  <td className="py-3 text-fyn-ink font-medium">{r.customer}</td>
                  <td className="py-3 text-fyn-ink/60 fyn-mono text-xs">{r.invoice}</td>
                  <td className="py-3 text-fyn-ink/60 text-xs">{r.due}</td>
                  <td className="py-3 text-right fyn-metric">{formatINR(r.amount)}</td>
                  <td className="py-3 text-right fyn-metric font-medium">{formatINR(r.outstanding)}</td>
                  <td className={`py-3 text-right fyn-metric ${getDaysOverdueColor(days)}`}>{days > 0 ? `${days}d` : "Current"}</td>
                  <td className="py-3 text-right">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${r.risk > 70 ? "bg-fyn-red/10 text-fyn-red" : r.risk > 40 ? "bg-amber-100 text-fyn-warning" : "bg-green-50 text-fyn-success"}`}>{r.risk}</span>
                  </td>
                  <td className="py-3 text-right text-fyn-ink/40 text-xs">{r.lastChase}</td>
                  <td className="py-3 text-right">
                    <button className="text-fyn-red text-xs font-medium hover:underline mr-2">Chase</button>
                    <button className="text-fyn-ink/40 text-xs hover:underline">Mark Paid</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default ReceivablesPage;
