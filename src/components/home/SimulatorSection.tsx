import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { formatINR } from "@/lib/indian-format";

const scenarios = ["Credit Terms", "Hiring", "Pricing", "GST Refund Delay", "Machinery Purchase", "Working Capital Loan", "Seasonal Push", "M&A"];

export default function SimulatorSection() {
  const ref = useScrollReveal();
  const [active, setActive] = useState(0);
  const [currentDays, setCurrentDays] = useState(30);
  const [newDays, setNewDays] = useState(60);
  const [revenue, setRevenue] = useState(2500000);

  const results = useMemo(() => {
    const gap = (newDays - currentDays) / 30 * revenue;
    const baseRunway = 52;
    const dailyBurn = 23846;
    const newRunway = Math.max(0, Math.round(baseRunway - gap / dailyBurn));
    const bridging = Math.max(0, gap * 0.73);
    const risk = newRunway > 60 ? "Low" : newRunway > 30 ? "Medium" : "High";
    const riskColor = newRunway > 60 ? "text-fyn-success" : newRunway > 30 ? "text-fyn-warning" : "text-fyn-red";
    return { gap, newRunway, bridging, risk, riskColor };
  }, [currentDays, newDays, revenue]);

  return (
    <section className="bg-fyn-beige py-24" ref={ref}>
      <div className="fyn-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left — Copy */}
          <div className="reveal-left">
            <span className="fyn-caption text-fyn-gold block mb-4 text-base">Decision Simulator</span>
            <h2 className="text-3xl lg:text-[44px] leading-[1.2] text-fyn-ink mb-6 font-serif">
              Simulate every business decision before you make it.
            </h2>
            <p className="text-fyn-ink/65 text-lg leading-relaxed mb-8">
              Every major decision has a cash consequence. Extending credit terms to a customer.
              Hiring a senior engineer. Buying a new machine. FynHelp's Decision Simulator models
              any scenario against your live business data and shows you the exact cash impact.
            </p>

            <div className="flex flex-wrap gap-2 mb-8">
              {scenarios.map((s, i) => (
                <button
                  key={s}
                  onClick={() => setActive(i)}
                  className={`text-sm px-4 py-2 rounded-md transition-all duration-200 ${
                    active === i
                      ? "bg-fyn-ink text-white"
                      : "bg-fyn-ink/5 border border-fyn-ink/10 text-fyn-ink/60 hover:border-fyn-ink/30"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <p className="text-sm italic mb-6 text-secondary-foreground">
              These are real scenarios built by our CA team from 500+ SME interviews.
            </p>
            <Link to="/early-access" className="inline-block bg-fyn-red text-white font-semibold px-8 py-3.5 rounded-lg hover-btn-primary">
              Try it with your data →
            </Link>
          </div>

          {/* Right — Interactive Widget */}
          <div className="bg-fyn-beige-card border border-fyn-ink/10 rounded-xl p-7 reveal-right">
            <h3 className="font-display text-xl text-fyn-ink mb-6">
              {active === 0 ? "What happens if I extend credit terms?" : scenarios[active] + " — Impact Analysis"}
            </h3>

            {/* Sliders */}
            <div className="space-y-5 mb-8">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="fyn-caption text-fyn-ink/50 text-[11px]">Current credit days</label>
                  <span className="fyn-metric text-fyn-ink text-sm">{currentDays} days</span>
                </div>
                <input type="range" min={0} max={90} value={currentDays} onChange={(e) => setCurrentDays(+e.target.value)}
                  className="w-full h-2 rounded-full appearance-none bg-fyn-ink/10 cursor-grab active:cursor-grabbing
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fyn-gold [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="fyn-caption text-fyn-ink/50 text-[11px]">New credit days</label>
                  <span className="fyn-metric text-fyn-ink text-sm">{newDays} days</span>
                </div>
                <input type="range" min={0} max={120} value={newDays} onChange={(e) => setNewDays(+e.target.value)}
                  className="w-full h-2 rounded-full appearance-none bg-fyn-ink/10 cursor-grab active:cursor-grabbing
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fyn-red [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing" />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="fyn-caption text-fyn-ink/50 text-[11px]">Monthly revenue from customer</label>
                  <span className="fyn-metric text-fyn-ink text-sm">{formatINR(revenue)}</span>
                </div>
                <input type="range" min={100000} max={10000000} step={100000} value={revenue} onChange={(e) => setRevenue(+e.target.value)}
                  className="w-full h-2 rounded-full appearance-none bg-fyn-ink/10 cursor-grab active:cursor-grabbing
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-fyn-ink [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing" />
              </div>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-fyn-danger-bg border border-fyn-red/15 rounded-lg p-4 text-center">
                <p className="text-fyn-red fyn-metric text-2xl font-bold">−{formatINR(Math.abs(results.gap))}</p>
                <p className="text-fyn-ink/40 text-xs mt-1">Cash Gap Created</p>
              </div>
              <div className="bg-fyn-warning-bg border border-fyn-warning/15 rounded-lg p-4 text-center">
                <p className={`fyn-metric text-2xl font-bold ${results.newRunway > 60 ? "text-fyn-success" : results.newRunway > 30 ? "text-fyn-warning" : "text-fyn-red"}`}>
                  {results.newRunway} days
                </p>
                <p className="text-fyn-ink/40 text-xs mt-1">New Runway</p>
              </div>
              <div className="bg-fyn-warning-bg border border-fyn-warning/15 rounded-lg p-4 text-center">
                <p className="text-fyn-warning fyn-metric text-2xl font-bold">{formatINR(results.bridging)}</p>
                <p className="text-fyn-ink/40 text-xs mt-1">Bridging Needed</p>
              </div>
              <div className="bg-fyn-beige-dark border border-fyn-ink/8 rounded-lg p-4 text-center">
                <p className={`fyn-metric text-2xl font-bold ${results.riskColor}`}>{results.risk}</p>
                <p className="text-fyn-ink/40 text-xs mt-1">Risk Level</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              {[
                { label: "A", title: `Accept ${newDays} days + arrange invoice discounting`, tag: "Financing cost ~18% p.a." },
                { label: "B", title: `Counter-propose ${Math.round((currentDays + newDays) / 2)} days with 2% early payment discount`, tag: "Reduces cash gap ~50%" },
                { label: "C", title: `Maintain current ${currentDays}-day terms`, tag: "Zero cash impact" },
              ].map((r) => (
                <div key={r.label} className="flex items-start gap-3 p-3 rounded-lg border border-fyn-ink/8 hover:border-fyn-ink/20 transition-colors cursor-pointer">
                  <div className="w-7 h-7 rounded-full bg-fyn-ink/10 flex items-center justify-center shrink-0">
                    <span className="text-fyn-ink text-xs font-semibold">{r.label}</span>
                  </div>
                  <div>
                    <p className="text-fyn-ink text-sm font-medium">{r.title}</p>
                    <p className="text-fyn-ink/40 text-xs">{r.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
