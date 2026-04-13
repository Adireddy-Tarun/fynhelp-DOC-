import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR, getRunwayColor } from "@/lib/indian-format";

const scenarios = [
  { key: "credit", label: "Credit Terms", icon: "📊" },
  { key: "hire", label: "New Hire", icon: "👤" },
  { key: "pricing", label: "Pricing Change", icon: "💰" },
  { key: "gst", label: "GST Refund Delay", icon: "📄" },
  { key: "capex", label: "Machinery Purchase", icon: "🏭" },
  { key: "loan", label: "Loan Impact", icon: "🏦" },
];

const SimulatorPage = () => {
  const [scenario, setScenario] = useState("credit");
  const [creditDays, setCreditDays] = useState(60);
  const [monthlyRevenue] = useState(2500000);

  const cashGap = Math.round(((creditDays - 30) / 30) * monthlyRevenue);
  const newRunway = Math.max(10, 52 - Math.round(cashGap / 23846));
  const riskLevel = newRunway < 30 ? "High" : newRunway < 60 ? "Medium" : "Low";

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Scenario selector + params */}
        <div>
          <div className="flex flex-wrap gap-2 mb-6">
            {scenarios.map((s) => (
              <button
                key={s.key}
                onClick={() => setScenario(s.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-colors ${
                  scenario === s.key ? "bg-fyn-ink text-white" : "bg-fyn-beige-dark border border-fyn-ink-10 text-fyn-ink/60 hover:border-fyn-ink/30"
                }`}
              >
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-6">
            <h3 className="text-fyn-ink font-serif text-xl mb-6">What happens if I extend credit to {creditDays} days?</h3>

            <div className="space-y-6">
              <div>
                <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Current credit days: 30</label>
                <div className="h-2 bg-fyn-ink/10 rounded-full"><div className="h-2 bg-fyn-gold rounded-full w-1/3" /></div>
              </div>
              <div>
                <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">New credit days: {creditDays}</label>
                <input
                  type="range" min={30} max={120} value={creditDays}
                  onChange={(e) => setCreditDays(Number(e.target.value))}
                  className="w-full accent-[#C41E1E]"
                  aria-label="New credit days"
                />
              </div>
              <div>
                <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">Monthly revenue</label>
                <p className="text-fyn-ink fyn-metric text-xl">{formatINR(monthlyRevenue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          <h3 className="text-fyn-ink font-serif text-xl">Impact Analysis</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-fyn-red-light border border-fyn-red/20 rounded-lg p-4 text-center">
              <p className="text-fyn-red fyn-metric text-2xl font-bold">{formatINR(-cashGap)}</p>
              <p className="text-fyn-ink/50 text-xs mt-1">Cash gap created</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className={`fyn-metric text-2xl font-bold ${getRunwayColor(newRunway)}`}>{newRunway} days</p>
              <p className="text-fyn-ink/50 text-xs mt-1">New runway</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
              <p className={`fyn-metric text-2xl font-bold ${riskLevel === "High" ? "text-fyn-red" : riskLevel === "Medium" ? "text-fyn-warning" : "text-fyn-success"}`}>{riskLevel}</p>
              <p className="text-fyn-ink/50 text-xs mt-1">Risk level</p>
            </div>
          </div>

          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
            <h4 className="text-fyn-ink font-serif text-lg mb-3">Nidhi's Recommendation</h4>
            <p className="text-fyn-ink/70 text-sm leading-relaxed">
              {creditDays > 45
                ? `Extending credit to ${creditDays} days creates a ₹${(cashGap / 100000).toFixed(1)}L cash gap. I'd recommend counter-proposing ${Math.min(creditDays, 45)} days with a 2% early payment discount. This keeps your runway above 45 days while maintaining the customer relationship.`
                : "This credit extension is within your safe threshold. Your runway stays above 45 days. Proceed with confidence."}
            </p>
          </div>

          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
            <h4 className="text-fyn-ink font-serif text-lg mb-3">Simulation History</h4>
            <div className="space-y-2">
              {[
                { date: "Apr 10", type: "Credit Terms", result: "60d → Medium risk" },
                { date: "Apr 5", type: "New Hire", result: "2 hires → 31d runway" },
                { date: "Mar 28", type: "Pricing Change", result: "+10% → ₹3.2L/mo gain" },
              ].map((s) => (
                <div key={s.date} className="flex items-center justify-between text-sm">
                  <span className="text-fyn-ink/40">{s.date}</span>
                  <span className="text-fyn-ink">{s.type}</span>
                  <span className="text-fyn-ink/60">{s.result}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="text-fyn-gold text-sm hover:underline">Share simulation with CA →</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SimulatorPage;
