import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";

const HRPage = () => (
  <DashboardLayout>
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: "Headcount", value: "12" },
        { label: "Monthly Payroll", value: formatINR(840000) },
        { label: "Days to Payroll", value: "18 days" },
        { label: "Payroll Risk", value: "Low", color: "text-fyn-success" },
      ].map((m) => (
        <div key={m.label} className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-4">
          <p className="text-fyn-ink/50 text-xs fyn-label">{m.label}</p>
          <p className={`text-xl fyn-metric font-bold mt-1 ${m.color || "text-fyn-ink"}`}>{m.value}</p>
        </div>
      ))}
    </div>

    {/* Labour compliance */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">Labour Compliance Status</h3>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { name: "PF", due: "₹1.01L", date: "Apr 15", status: "pending" },
          { name: "ESIC", due: "₹27K", date: "Apr 15", status: "pending" },
          { name: "Bonus", due: "₹2.1L", date: "Nov 2025", status: "scheduled" },
          { name: "Gratuity", due: "₹4.8L", date: "Provision", status: "ok" },
          { name: "Min Wage", due: "Compliant", date: "All roles", status: "ok" },
        ].map((c) => (
          <div key={c.name} className="p-3 bg-fyn-beige rounded-lg">
            <p className="text-fyn-ink font-medium text-sm">{c.name}</p>
            <p className="text-fyn-ink fyn-metric text-sm">{c.due}</p>
            <p className={`text-xs mt-1 ${c.status === "pending" ? "text-fyn-warning" : "text-fyn-success"}`}>{c.date}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Attrition Risk */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
      <h3 className="text-fyn-ink font-serif text-lg mb-4">Attrition Risk</h3>
      <div className="space-y-3">
        {[
          { role: "Senior Developer", count: 3, gap: "23% below market median", risk: "High" },
          { role: "Sales Executive", count: 2, gap: "12% below market median", risk: "Medium" },
          { role: "Accountant", count: 1, gap: "5% below market median", risk: "Low" },
        ].map((e) => (
          <div key={e.role} className="flex items-center justify-between p-3 bg-fyn-beige rounded-lg">
            <div>
              <p className="text-fyn-ink font-medium text-sm">{e.role} ({e.count})</p>
              <p className="text-fyn-ink/50 text-xs">{e.gap}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${e.risk === "High" ? "bg-fyn-red/10 text-fyn-red" : e.risk === "Medium" ? "bg-amber-100 text-fyn-warning" : "bg-green-50 text-fyn-success"}`}>{e.risk}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Hiring Simulator */}
    <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
      <h3 className="text-fyn-ink font-serif text-lg mb-3">Quick Hiring Simulator</h3>
      <p className="text-fyn-ink/60 text-sm mb-4">How many people can I safely hire now?</p>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => {
          const cost = n * 850000;
          const runway = Math.max(15, 52 - Math.round(cost / 12 / 23846));
          return (
            <div key={n} className="p-4 bg-fyn-beige rounded-lg text-center">
              <p className="text-fyn-ink font-serif text-lg">{n} hire{n > 1 ? "s" : ""}</p>
              <p className="text-fyn-ink/60 text-xs">~{formatINR(cost)}/year true cost</p>
              <p className={`fyn-metric text-lg font-bold mt-2 ${runway < 30 ? "text-fyn-red" : runway < 60 ? "text-fyn-warning" : "text-fyn-success"}`}>{runway}d runway</p>
            </div>
          );
        })}
      </div>
    </div>
  </DashboardLayout>
);

export default HRPage;
