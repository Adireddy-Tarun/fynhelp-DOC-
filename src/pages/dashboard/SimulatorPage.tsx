import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR, getRunwayColor } from "@/lib/indian-format";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const scenarioList = [
  { key: "credit", label: "Credit Terms", icon: "₹" },
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
  const [hireCount, setHireCount] = useState(1);
  const [hireCTC, setHireCTC] = useState(600000);
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanRate, setLoanRate] = useState(14);
  const [loanTenure, setLoanTenure] = useState(12);
  const [gstDelay, setGstDelay] = useState(30);
  const [simulated, setSimulated] = useState(false);

  // Computations
  const cashGap = scenario === "credit" ? Math.round(((creditDays - 30) / 30) * monthlyRevenue) : 0;
  const newRunway = scenario === "credit" ? Math.max(10, 52 - Math.round(cashGap / 23846)) : 52;
  const riskLevel = newRunway < 30 ? "Critical" : newRunway < 45 ? "High" : newRunway < 60 ? "Medium" : "Low";

  // Hire computations
  const trueCostPerHire = Math.round(hireCTC * 1.343);
  const monthlyBurdenPerHire = Math.round(trueCostPerHire / 12);
  const totalMonthlyBurden = monthlyBurdenPerHire * hireCount;
  const hireRunway = Math.max(10, 52 - Math.round((totalMonthlyBurden / 30) / 23846 * 52));

  // Loan computations
  const monthlyRate = loanRate / 100 / 12;
  const emi = Math.round(loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanTenure) / (Math.pow(1 + monthlyRate, loanTenure) - 1));
  const totalInterest = emi * loanTenure - loanAmount;
  const loanNewBurn = 23846 + Math.round(emi / 30);
  const loanRunway = Math.round(1240000 / loanNewBurn);

  // GST delay
  const gstPendingRefund = 320000;
  const gstRunwayImpact = Math.round((gstPendingRefund / 23846) * (gstDelay / 90));
  const gstNewRunway = Math.max(10, 52 - gstRunwayImpact);

  // Chart data for before/after
  const projectionData = Array.from({ length: 90 }, (_, i) => ({
    day: `Day ${i + 1}`,
    baseline: Math.max(0, 1240000 - i * 23846),
    withDecision: scenario === "credit"
      ? Math.max(0, 1240000 - i * 23846 - (i > 15 ? cashGap * 0.5 : 0))
      : scenario === "hire"
      ? Math.max(0, 1240000 - i * (23846 + totalMonthlyBurden / 30))
      : Math.max(0, 1240000 - i * 23846),
  }));

  const getImpactMetrics = () => {
    switch (scenario) {
      case "credit": return { cashImpact: -cashGap, runway: newRunway, risk: riskLevel };
      case "hire": return { cashImpact: -totalMonthlyBurden, runway: hireRunway, risk: hireRunway < 30 ? "Critical" : hireRunway < 45 ? "High" : "Medium" };
      case "gst": return { cashImpact: -gstPendingRefund, runway: gstNewRunway, risk: gstNewRunway < 30 ? "Critical" : "Medium" };
      case "loan": return { cashImpact: loanAmount - totalInterest, runway: loanRunway, risk: loanRunway > 60 ? "Low" : "Medium" };
      default: return { cashImpact: 0, runway: 52, risk: "Low" };
    }
  };

  const impact = getImpactMetrics();

  const runSimulation = () => setSimulated(true);

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        {/* LEFT PANEL */}
        <div>
          {/* Scenario selector */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {scenarioList.map((s) => (
              <button
                key={s.key}
                onClick={() => { setScenario(s.key); setSimulated(false); }}
                className={`relative flex items-center gap-2 px-3 py-3 rounded-lg text-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  scenario === s.key
                    ? "border-2 border-[#C41E1E] bg-fyn-red-light text-fyn-ink"
                    : "border border-fyn-ink-10 bg-fyn-beige-dark text-fyn-ink/60 hover:border-[#C41E1E]"
                }`}
              >
                {scenario === s.key && <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#C41E1E]" />}
                <span className="text-lg">{s.icon}</span>
                <span className="font-medium text-secondary-foreground">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Auto-detect toggle */}
          <div className="flex items-center gap-3 mb-6 p-3 bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg">
            <div className="w-8 h-5 bg-fyn-red rounded-full relative cursor-pointer">
              <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
            </div>
            <div>
              <p className="text-fyn-ink text-sm font-medium">Auto-fill from my live data</p>
              <p className="text-fyn-ink/40 text-xs">AI CFO Nidhi reads your bank, books, and GST to pre-fill inputs</p>
            </div>
          </div>

          {/* INPUTS */}
          <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-xl p-6">
            {scenario === "credit" && (
              <>
                <h3 className="text-fyn-ink text-xl mb-6 font-sans">What happens if I extend credit to {creditDays} days?</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Current credit days: 30</label>
                    <div className="h-2 bg-fyn-ink/10 rounded-full"><div className="h-2 bg-fyn-gold rounded-full w-1/3" /></div>
                  </div>
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">New credit days: {creditDays}</label>
                    <input type="range" min={30} max={120} value={creditDays} onChange={(e) => setCreditDays(Number(e.target.value))} className="w-full accent-[#C41E1E]" />
                    <p className="text-[11px] mt-1 text-[#754a00]">From your data · Updated 12 min ago</p>
                  </div>
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-1">Monthly revenue</label>
                    <p className="text-fyn-ink fyn-metric text-xl">{formatINR(monthlyRevenue)}</p>
                  </div>
                </div>
              </>
            )}

            {scenario === "hire" && (
              <>
                <h3 className="text-fyn-ink font-serif text-xl mb-6">Model new hire impact</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Number of hires</label>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setHireCount(Math.max(1, hireCount - 1))} className="w-8 h-8 rounded border border-fyn-ink-10 text-fyn-ink hover:bg-fyn-ink/5">−</button>
                      <span className="text-fyn-ink text-xl fyn-metric font-semibold w-8 text-center">{hireCount}</span>
                      <button onClick={() => setHireCount(Math.min(20, hireCount + 1))} className="w-8 h-8 rounded border border-fyn-ink-10 text-fyn-ink hover:bg-fyn-ink/5">+</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Average CTC (annual): {formatINR(hireCTC)}</label>
                    <input type="range" min={300000} max={5000000} step={50000} value={hireCTC} onChange={(e) => setHireCTC(Number(e.target.value))} className="w-full accent-[#C41E1E]" />
                  </div>
                  <div className="bg-[#FEF3E2] border border-[#8B5A00]/20 rounded-lg p-3">
                    <p className="text-[#8B5A00] text-xs fyn-label mb-2">TRUE COST CALCULATOR</p>
                    <div className="space-y-1 text-xs text-fyn-ink/70">
                      <div className="flex justify-between"><span>CTC entered:</span><span>{formatINR(hireCTC)}</span></div>
                      <div className="flex justify-between"><span>+ PF employer 12%:</span><span>{formatINR(Math.round(hireCTC * 0.12))}</span></div>
                      <div className="flex justify-between"><span>+ ESIC 3.25%:</span><span>{formatINR(Math.round(hireCTC * 0.0325))}</span></div>
                      <div className="flex justify-between"><span>+ Gratuity 4.8%:</span><span>{formatINR(Math.round(hireCTC * 0.048))}</span></div>
                      <div className="flex justify-between"><span>+ Bonus 8.33%:</span><span>{formatINR(Math.round(hireCTC * 0.0833))}</span></div>
                      <div className="flex justify-between"><span>+ Overhead:</span><span>{formatINR(36000)}</span></div>
                      <div className="border-t border-[#8B5A00]/20 pt-1 mt-1 flex justify-between font-semibold text-fyn-ink">
                        <span>TRUE ANNUAL COST:</span>
                        <span>{formatINR(trueCostPerHire)} per hire</span>
                      </div>
                      <div className="flex justify-between font-semibold text-[#8B5A00]">
                        <span>MONTHLY BURDEN:</span>
                        <span>{formatINR(monthlyBurdenPerHire)} per hire</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {scenario === "gst" && (
              <>
                <h3 className="text-fyn-ink font-serif text-xl mb-6">GST refund delay impact</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-fyn-ink/60 text-xs mb-1">Pending refund amount (auto-detected):</p>
                    <p className="text-fyn-ink fyn-metric text-xl font-semibold">{formatINR(gstPendingRefund)}</p>
                  </div>
                  <div className="flex gap-2">
                    {[30, 60, 90].map((d) => (
                      <button key={d} onClick={() => setGstDelay(d)} className={`flex-1 py-2 rounded text-sm ${gstDelay === d ? "bg-fyn-ink text-white" : "bg-fyn-beige border border-fyn-ink-10 text-fyn-ink/60"}`}>
                        {d} days
                      </button>
                    ))}
                  </div>
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Expected delay: {gstDelay} days</label>
                    <input type="range" min={0} max={90} step={15} value={gstDelay} onChange={(e) => setGstDelay(Number(e.target.value))} className="w-full accent-[#C41E1E]" />
                  </div>
                </div>
              </>
            )}

            {scenario === "loan" && (
              <>
                <h3 className="text-fyn-ink font-serif text-xl mb-6">Working capital loan impact</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Loan amount: {formatINR(loanAmount)}</label>
                    <input type="range" min={100000} max={20000000} step={100000} value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="w-full accent-[#C41E1E]" />
                  </div>
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Interest rate: {loanRate}% p.a.</label>
                    <input type="range" min={8} max={24} step={0.5} value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} className="w-full accent-[#C41E1E]" />
                  </div>
                  <div>
                    <label className="text-fyn-ink/60 text-xs fyn-label block mb-2">Tenure: {loanTenure} months</label>
                    <div className="flex gap-2">
                      {[3, 6, 12, 18, 24].map((t) => (
                        <button key={t} onClick={() => setLoanTenure(t)} className={`flex-1 py-2 rounded text-sm ${loanTenure === t ? "bg-fyn-ink text-white" : "bg-fyn-beige border border-fyn-ink-10 text-fyn-ink/60"}`}>
                          {t}m
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-fyn-beige rounded-lg p-3 space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-fyn-ink/60">Monthly EMI:</span><span className="fyn-metric font-semibold text-fyn-ink text-base">{formatINR(emi)}</span></div>
                    <div className="flex justify-between"><span className="text-fyn-ink/60">Total interest:</span><span>{formatINR(totalInterest)}</span></div>
                    <div className="flex justify-between"><span className="text-fyn-ink/60">New daily burn with EMI:</span><span>{formatINR(loanNewBurn)}</span></div>
                  </div>
                </div>
              </>
            )}

            {(scenario === "pricing" || scenario === "capex") && (
              <div className="text-center py-8">
                <p className="text-fyn-ink/40 text-sm">This scenario is coming soon.</p>
                <p className="text-fyn-ink/30 text-xs mt-1">Select another scenario to simulate.</p>
              </div>
            )}

            {/* Live base metrics */}
            <div className="mt-6 pt-4 border-t border-fyn-ink-10 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-fyn-ink/40 text-[10px] fyn-label">CASH</p>
                <p className="text-fyn-ink fyn-metric text-sm font-semibold">₹12.4L</p>
              </div>
              <div>
                <p className="text-fyn-ink/40 text-[10px] fyn-label">BURN</p>
                <p className="text-fyn-ink fyn-metric text-sm font-semibold">₹23,846</p>
              </div>
              <div>
                <p className="text-fyn-ink/40 text-[10px] fyn-label">RUNWAY</p>
                <p className="text-[#8B5A00] fyn-metric text-sm font-semibold">52d</p>
              </div>
            </div>
          </div>

          <button
            onClick={runSimulation}
            disabled={scenario === "pricing" || scenario === "capex"}
            className="w-full mt-4 bg-fyn-red text-white py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Run Simulation →
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="space-y-6">
          {!simulated ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <rect x="20" y="30" width="80" height="70" rx="8" stroke="#1A100820" strokeWidth="2" fill="#F4EDDA" />
                <rect x="30" y="45" width="25" height="3" rx="1.5" fill="#1A100815" />
                <rect x="30" y="53" width="40" height="3" rx="1.5" fill="#1A100815" />
                <rect x="30" y="61" width="35" height="3" rx="1.5" fill="#1A100815" />
                <path d="M70 75 L85 55 L100 70" stroke="#C41E1E" strokeWidth="2" fill="none" />
              </svg>
              <p className="text-fyn-ink/40 text-sm mt-4">Choose a scenario and set your inputs.</p>
              <p className="text-fyn-ink/30 text-sm">AI CFO Nidhi will model the exact cash impact using your live data.</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              {/* Impact summary */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                  <p className="text-white/40 text-xs fyn-label">CASH IMPACT</p>
                  <p className={`text-[28px] font-serif font-bold mt-1 ${impact.cashImpact < 0 ? "text-[#C41E1E]" : "text-[#1A6B3C]"}`}>
                    {impact.cashImpact < 0 ? "" : "+"}{formatINR(impact.cashImpact)}
                  </p>
                </div>
                <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                  <p className="text-white/40 text-xs fyn-label">NEW RUNWAY</p>
                  <p className={`text-[28px] font-serif font-bold mt-1 ${getRunwayColor(impact.runway)}`}>{impact.runway} days</p>
                </div>
                <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                  <p className="text-white/40 text-xs fyn-label">RISK LEVEL</p>
                  <p className={`text-[28px] font-serif font-bold mt-1 ${
                    impact.risk === "Critical" || impact.risk === "High" ? "text-[#C41E1E]" : impact.risk === "Medium" ? "text-[#8B5A00]" : "text-[#1A6B3C]"
                  }`}>{impact.risk}</p>
                </div>
                <div className="bg-fyn-ink rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
                  <p className="text-white/40 text-xs fyn-label">ACTION REQUIRED</p>
                  <p className="text-white text-sm mt-2">{impact.runway < 30 ? "Immediate action needed" : impact.runway < 60 ? "Monitor closely" : "Safe to proceed"}</p>
                </div>
              </div>

              {/* Before vs After chart */}
              <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
                <h4 className="text-fyn-ink font-serif text-lg mb-4">Before vs After — 90 Day Projection</h4>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={projectionData}>
                    <XAxis dataKey="day" tick={{ fontSize: 9 }} interval={14} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatINR(v)} />
                    <Tooltip contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff", fontSize: 12 }} formatter={(v: number) => [formatINR(v)]} />
                    <Area type="monotone" dataKey="baseline" stroke="#1A4A8B" strokeDasharray="4 4" fill="none" name="Baseline" />
                    <Area type="monotone" dataKey="withDecision" stroke="#C41E1E" fill="#C41E1E" fillOpacity={0.1} name="With Decision" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recommendations */}
              <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
                <h4 className="text-fyn-ink font-serif text-lg mb-3">AI CFO Nidhi's Recommendation</h4>
                <p className="text-fyn-ink/70 text-sm leading-relaxed">
                  {scenario === "credit" && creditDays > 45
                    ? `Extending credit to ${creditDays} days creates a ${formatINR(cashGap)} cash gap. I'd recommend counter-proposing ${Math.min(creditDays, 45)} days with a 2% early payment discount. This keeps your runway above 45 days.`
                    : scenario === "hire"
                    ? `Hiring ${hireCount} at ${formatINR(hireCTC)} CTC adds ${formatINR(totalMonthlyBurden)}/month in true cost. Your runway drops to ${hireRunway} days. Consider phased hiring — one now, one after collecting top overdues.`
                    : scenario === "gst"
                    ? `A ${gstDelay}-day GST refund delay locks ${formatINR(gstPendingRefund)} and reduces runway by ${gstRunwayImpact} days. File GSTR-3B on time and follow up with the GST portal.`
                    : scenario === "loan"
                    ? `A ${formatINR(loanAmount)} loan at ${loanRate}% adds ${formatINR(emi)}/month EMI. Net runway impact depends on how you deploy the funds. Use for receivables collection leverage.`
                    : "This decision is within your safe threshold. Proceed with confidence."}
                </p>
              </div>

              {/* Save + Share */}
              <div className="flex gap-3">
                <button className="flex-1 border border-fyn-ink-10 text-fyn-ink py-2.5 rounded-lg text-sm font-medium hover:bg-fyn-ink/5 transition-colors">
                  Save Simulation
                </button>
                <button className="flex-1 border border-fyn-ink-10 text-fyn-ink py-2.5 rounded-lg text-sm font-medium hover:bg-fyn-ink/5 transition-colors">
                  Share with CA
                </button>
                <button className="text-fyn-ink/40 text-sm hover:text-fyn-ink py-2.5 px-4">
                  Export PDF
                </button>
              </div>

              {/* Simulation History */}
              <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mt-6">
                <h4 className="text-fyn-ink font-serif text-lg mb-3">Your Saved Simulations</h4>
                <div className="space-y-2">
                  {[
                    { date: "Apr 10", type: "Credit Terms", result: "60d → Medium risk" },
                    { date: "Apr 5", type: "New Hire", result: "2 hires → 31d runway" },
                    { date: "Mar 28", type: "Pricing Change", result: "+10% → ₹3.2L/mo gain" },
                    { date: "Mar 15", type: "Loan Impact", result: "₹5L loan → 68d runway" },
                    { date: "Mar 1", type: "GST Refund Delay", result: "60d delay → 38d runway" },
                  ].map((s) => (
                    <div key={s.date + s.type} className="flex items-center justify-between text-sm p-2 rounded hover:bg-fyn-beige transition-colors cursor-pointer">
                      <span className="text-fyn-ink/40">{s.date}</span>
                      <span className="text-fyn-ink font-medium">{s.type}</span>
                      <span className="text-fyn-ink/60">{s.result}</span>
                    </div>
                  ))}
                </div>
                <button className="text-fyn-red text-sm font-medium hover:underline mt-3">View all →</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SimulatorPage;
