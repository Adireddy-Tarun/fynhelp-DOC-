import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { formatINR } from "@/lib/indian-format";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, ReferenceLine, PieChart, Pie,
  ReferenceArea
} from "recharts";
import { Link } from "react-router-dom";

const runwayTrend = [
  { month: "May 25", days: 59 }, { month: "Jun 25", days: 64 },
  { month: "Jul 25", days: 61 }, { month: "Aug 25", days: 55 },
  { month: "Sep 25", days: 58 }, { month: "Oct 25", days: 59 },
  { month: "Nov 25", days: 64 }, { month: "Dec 25", days: 61 },
  { month: "Jan 26", days: 55 }, { month: "Feb 26", days: 58 },
  { month: "Mar 26", days: 52 }, { month: "Apr 26", days: 52 },
];

const burnBreakdown = [
  { name: "Payroll", value: 46, amount: 10973, color: "#1A4A8B" },
  { name: "Raw Materials", value: 28, amount: 6677, color: "#C41E1E" },
  { name: "Overhead", value: 13, amount: 3100, color: "#6B21A8" },
  { name: "GST/TDS", value: 8, amount: 1908, color: "#8B5A00" },
  { name: "Loan EMI", value: 5, amount: 1192, color: "#374151" },
];

const burnTrend = [
  { month: "Mar 26", burn: 23846, vs: "↑8%", runway: 52, current: true },
  { month: "Feb 26", burn: 22080, vs: "↓2%", runway: 58, current: false },
  { month: "Jan 26", burn: 22540, vs: "↑5%", runway: 55, current: false },
  { month: "Dec 25", burn: 21470, vs: "↑3%", runway: 61, current: false },
  { month: "Nov 25", burn: 20840, vs: "↓4%", runway: 64, current: false },
  { month: "Oct 25", burn: 21700, vs: "↑12%", runway: 59, current: false },
];

const scenarios = [
  { label: "Current", days: 52, color: "#C41E1E" },
  { label: "Collect ABC Electronics", days: 67, color: "#8B5A00" },
  { label: "Collect all overdues", days: 89, color: "#8B5A00" },
  { label: "Cut burn 10%", days: 58, color: "#8B5A00" },
  { label: "Invoice discounting", days: 95, color: "#1A6B3C" },
  { label: "All actions combined", days: 140, color: "#1A6B3C" },
];

const RunwayPage = () => {
  const [needleAngle, setNeedleAngle] = useState(0);
  const targetAngle = (52 / 180) * 180;

  useEffect(() => {
    const timer = setTimeout(() => setNeedleAngle(targetAngle), 100);
    return () => clearTimeout(timer);
  }, [targetAngle]);

  const gaugeRadius = 85;
  const cx = 100, cy = 95;

  const getArcPath = (startDeg: number, endDeg: number) => {
    const startRad = (Math.PI * (180 - startDeg)) / 180;
    const endRad = (Math.PI * (180 - endDeg)) / 180;
    const x1 = cx + gaugeRadius * Math.cos(startRad);
    const y1 = cy - gaugeRadius * Math.sin(startRad);
    const x2 = cx + gaugeRadius * Math.cos(endRad);
    const y2 = cy - gaugeRadius * Math.sin(endRad);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${gaugeRadius} ${gaugeRadius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const needleRad = (Math.PI * (180 - needleAngle)) / 180;
  const needleX = cx + 65 * Math.cos(needleRad);
  const needleY = cy - 65 * Math.sin(needleRad);

  return (
    <DashboardLayout>
      {/* HERO GAUGE */}
      <div className="bg-fyn-ink rounded-xl p-8 lg:p-12 mb-6 text-center">
        <div className="max-w-[400px] mx-auto">
          <svg viewBox="0 0 200 110" className="w-full">
            <path d={getArcPath(0, 30)} fill="none" stroke="#C41E1E" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
            <path d={getArcPath(30, 90)} fill="none" stroke="#8B5A00" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
            <path d={getArcPath(90, 180)} fill="none" stroke="#1A6B3C" strokeWidth="14" strokeLinecap="round" opacity="0.4" />
            <text x="20" y="100" fill="#C41E1E" fontSize="8" opacity="0.7">Critical</text>
            <text x="82" y="18" fill="#8B5A00" fontSize="8" opacity="0.7">Watch</text>
            <text x="155" y="100" fill="#1A6B3C" fontSize="8" opacity="0.7">Safe</text>
            <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#C41E1E" strokeWidth="2.5" strokeLinecap="round" style={{ transition: "all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
            <circle cx={cx} cy={cy} r="4" fill="#C41E1E" />
          </svg>
        </div>
        <p className="text-white text-[72px] font-bold leading-none font-sans">52</p>
        <p className="text-white/60 text-base mt-1">days of runway</p>
        <p className="text-fyn-gold text-[13px] mt-1">At ₹23,846 daily burn</p>
        <div className="flex gap-3 mt-6 justify-center flex-wrap">
          <button className="bg-[#1A6B3C] text-white text-sm px-4 py-2 rounded-lg hover:brightness-110 hover:scale-[1.02] transition-all">
            Collect faster (+15d)
          </button>
          <button className="bg-[#8B5A00] text-white text-sm px-4 py-2 rounded-lg hover:brightness-110 hover:scale-[1.02] transition-all">
            Pay slower (+8d)
          </button>
          <button className="bg-[#1A4A8B] text-white text-sm px-4 py-2 rounded-lg hover:brightness-110 hover:scale-[1.02] transition-all">
            Cut burn (+6d)
          </button>
        </div>
      </div>

      {/* RUNWAY HISTORY CHART */}
      <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5 mb-6">
        <h3 className="text-fyn-ink font-serif text-lg mb-4">Runway trend — last 12 months</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={runwayTrend}>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} domain={[0, 120]} />
            <Tooltip contentStyle={{ background: "#1A1008", border: "none", borderRadius: 8, color: "#fff", fontSize: 13 }} />
            <ReferenceArea y1={0} y2={30} fill="#C41E1E" fillOpacity={0.05} />
            <ReferenceArea y1={30} y2={90} fill="#8B5A00" fillOpacity={0.05} />
            <ReferenceArea y1={90} y2={120} fill="#1A6B3C" fillOpacity={0.05} />
            <ReferenceLine y={90} stroke="#1A6B3C" strokeDasharray="4 4" />
            <ReferenceLine y={30} stroke="#C41E1E" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="days" stroke="#8B5A00" strokeWidth={2} dot={{ r: 3, fill: "#8B5A00" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* RUNWAY PROJECTION - 3 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-fyn-beige-card border border-fyn-ink-10 rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <h4 className="text-fyn-ink text-base mb-3 font-sans">Current State</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fyn-ink/60">Cash:</span><span className="fyn-metric font-semibold">₹12.4L</span></div>
            <div className="flex justify-between"><span className="text-fyn-ink/60">Daily burn:</span><span className="fyn-metric">₹23,846</span></div>
            <div className="flex justify-between"><span className="text-fyn-ink/60">Runway:</span><span className="fyn-metric font-semibold text-[#8B5A00]">52 days</span></div>
            <div className="flex justify-between"><span className="text-fyn-ink/60">Crisis date:</span><span className="fyn-metric text-[#C41E1E]">June 6, 2026</span></div>
          </div>
          <p className="text-fyn-ink/40 text-xs italic mt-3">If nothing changes</p>
        </div>

        <div className="bg-[#f0faf4] border-[1.5px] border-[#1A6B3C] rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <h4 className="text-fyn-ink text-base mb-3 font-sans">Collect ₹8.4L from ABC Electronics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fyn-ink/60">New runway:</span><span className="fyn-metric font-semibold text-[#1A6B3C]">67 days <span className="text-xs bg-[#1A6B3C]/10 px-1.5 py-0.5 rounded">+15 days</span></span></div>
            <div className="flex justify-between"><span className="text-fyn-ink/60">New crisis date:</span><span className="fyn-metric">June 21, 2026</span></div>
          </div>
          <Link to="/dashboard/receivables" className="mt-3 inline-block text-[#1A6B3C] text-sm font-medium hover:underline">
            Chase ABC Electronics →
          </Link>
          <div className="mt-3 pt-3 border-t border-[#1A6B3C]/20 space-y-1 text-xs text-fyn-ink/60">
            <p>ABC Electronics: +15 days</p>
            <p>Sharma & Sons: +8 days</p>
            <p>Delhi Distributors: +4 days</p>
          </div>
        </div>

        <div className="bg-fyn-info-bg border-[1.5px] border-fyn-info rounded-lg p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <h4 className="text-fyn-ink text-base mb-3 font-sans">Invoice discounting on ₹22.1L</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-fyn-ink/60">New runway:</span><span className="fyn-metric font-semibold text-[#1A6B3C]">95 days <span className="text-xs bg-[#1A6B3C]/10 px-1.5 py-0.5 rounded">+43 days</span></span></div>
            <div className="flex justify-between"><span className="text-fyn-ink/60">Financing cost:</span><span className="fyn-metric">~18% p.a. = ₹33K/30d</span></div>
          </div>
          <button className="mt-3 text-fyn-info text-sm font-medium hover:underline">Explore financing →</button>
        </div>
      </div>

      {/* BURN BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink text-lg mb-4 font-sans">Burn by Category</h3>
          <div className="flex justify-center">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie data={burnBreakdown} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {burnBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-center text-fyn-ink font-semibold fyn-metric text-lg -mt-2">₹23,846 / day</p>
          <div className="mt-4 space-y-1">
            {burnBreakdown.map((b) => (
              <div key={b.name} className="flex items-center gap-2 text-sm">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.color }} />
                <span className="flex-1 text-fyn-ink">{b.name}</span>
                <span className="text-fyn-ink/50">{b.value}%</span>
                <span className="fyn-metric font-medium">₹{b.amount.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-fyn-beige-dark border border-fyn-ink-10 rounded-lg p-5">
          <h3 className="text-fyn-ink text-lg mb-4 font-sans">Burn Rate Trend</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-fyn-ink/40 text-xs fyn-label border-b border-fyn-ink-10">
                  <th className="text-left py-2">Month</th>
                  <th className="text-right py-2">Burn Rate</th>
                  <th className="text-right py-2">vs Prior</th>
                  <th className="text-right py-2">Runway</th>
                </tr>
              </thead>
              <tbody>
                {burnTrend.map((b) => (
                  <tr key={b.month} className={`border-b border-fyn-ink-10 last:border-0 ${b.current ? "bg-fyn-beige-dark" : ""}`}>
                    <td className="py-3 text-fyn-ink font-medium">{b.month}{b.current && <span className="text-fyn-gold text-[10px] ml-1">(current)</span>}</td>
                    <td className="py-3 text-right fyn-metric">{formatINR(b.burn)}</td>
                    <td className={`py-3 text-right text-xs ${b.vs.includes("↑") ? "text-[#C41E1E]" : b.vs.includes("↓") ? "text-[#1A6B3C]" : "text-fyn-ink/40"}`}>{b.vs}</td>
                    <td className="py-3 text-right fyn-metric">{b.runway}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SCENARIO COMPARE */}
      <div className="bg-fyn-ink rounded-xl p-6 mb-6">
        <h3 className="text-white font-serif text-lg mb-6">How different actions change your runway</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={scenarios} layout="vertical" margin={{ left: 140 }}>
            <XAxis type="number" domain={[0, 180]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }} />
            <YAxis type="category" dataKey="label" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }} width={130} />
            <Tooltip contentStyle={{ background: "#1A1008", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
            <ReferenceLine x={90} stroke="#1A6B3C" strokeDasharray="4 4" label={{ value: "Safe zone", fill: "#1A6B3C", fontSize: 10, position: "top" }} />
            <Bar dataKey="days" radius={[0, 4, 4, 0]} barSize={24}>
              {scenarios.map((s) => (
                <Cell key={s.label} fill={s.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </DashboardLayout>
  );
};

export default RunwayPage;
