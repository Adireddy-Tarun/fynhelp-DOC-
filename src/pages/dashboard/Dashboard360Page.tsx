import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { LineChart, Line, ResponsiveContainer } from "recharts";

type Tier = "critical" | "warning" | "normal";

interface MetricDef {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  tier: Tier;
  sparkData: number[];
  sparkUp: boolean; // is "up" good for this metric?
}

const tierStyles: Record<Tier, { bg: string; border: string; numColor: string }> = {
  critical: { bg: "#FDEAEA", border: "#C41E1E", numColor: "#C41E1E" },
  warning: { bg: "#FEF3E2", border: "#8B5A00", numColor: "#8B5A00" },
  normal: { bg: "#FFFFFF", border: "#E0D9C8", numColor: "#1A1008" },
};

const randomSpark = () => Array.from({ length: 8 }, () => Math.random() * 100);

const sections: { title: string; id: string; metrics: MetricDef[] }[] = [
  {
    title: "LIQUIDITY METRICS", id: "liquidity",
    metrics: [
      { label: "Cash Balance", value: "₹12.4L", change: "↑ ₹40K", positive: true, tier: "normal", sparkData: [40, 42, 38, 45, 50, 48, 52, 55], sparkUp: true },
      { label: "Daily Burn Rate", value: "₹23,846", change: "↑ 8%", positive: false, tier: "warning", sparkData: [20, 21, 22, 21, 23, 22, 24, 24], sparkUp: false },
      { label: "Runway Days", value: "52 days", change: "↓ 8 days", positive: false, tier: "warning", sparkData: [64, 61, 58, 55, 54, 53, 52, 52], sparkUp: true },
      { label: "Working Capital", value: "₹18.2L", change: "↑ ₹1.1L", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Total Receivables", value: "₹22.1L", change: "4 overdue", positive: false, tier: "critical", sparkData: [15, 16, 18, 19, 20, 21, 22, 22], sparkUp: false },
      { label: "Total Payables", value: "₹8.7L", change: "3 due this week", positive: false, tier: "warning", sparkData: randomSpark(), sparkUp: false },
      { label: "DSO", value: "42 days", change: "↓ 3 days", positive: true, tier: "normal", sparkData: [48, 46, 45, 44, 43, 43, 42, 42], sparkUp: false },
      { label: "DPO", value: "28 days", change: "Stable", positive: true, tier: "normal", sparkData: [28, 28, 29, 28, 27, 28, 28, 28], sparkUp: true },
      { label: "Net Cash Last 30d", value: "₹2.8L", change: "Positive", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
    ],
  },
  {
    title: "REVENUE METRICS", id: "revenue",
    metrics: [
      { label: "Revenue MTD", value: "₹18.4L", change: "↑ 12%", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Gross Margin", value: "34%", change: "↑ 2%", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Revenue vs Last Month", value: "↑ 8%", change: "Growth", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Overdue Receivables", value: "₹22.1L", change: "4 customers", positive: false, tier: "critical", sparkData: [15, 16, 18, 19, 20, 21, 22, 22], sparkUp: false },
      { label: "Collection Efficiency", value: "78%", change: "↑ 5%", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Active Customers", value: "47", change: "+3 this month", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Avg Invoice Value", value: "₹1.8L", change: "Stable", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Largest Customer %", value: "18%", change: "ABC Electronics", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
      { label: "Revenue Concentration", value: "Low Risk", change: "Top 3 = 38%", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
    ],
  },
  {
    title: "COST METRICS", id: "cost",
    metrics: [
      { label: "Total Spend MTD", value: "₹14.2L", change: "↓ 4%", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
      { label: "Payroll % of Revenue", value: "46%", change: "↑ 2%", positive: false, tier: "warning", sparkData: randomSpark(), sparkUp: false },
      { label: "Top Cost Category", value: "Raw Materials", change: "₹6.8L", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
      { label: "Fixed Costs", value: "₹4.2L", change: "Stable", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
      { label: "Variable Costs", value: "₹10L", change: "↓ 3%", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
      { label: "COGS", value: "₹12.1L", change: "66% of revenue", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
    ],
  },
  {
    title: "GST METRICS", id: "gst",
    metrics: [
      { label: "ITC Safe", value: "₹3.6L", change: "Claimable", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "ITC at Risk", value: "₹3.2L", change: "4 mismatches", positive: false, tier: "critical", sparkData: [10, 15, 20, 25, 28, 30, 32, 32], sparkUp: false },
      { label: "Mismatch Count", value: "4", change: "↑ 1", positive: false, tier: "critical", sparkData: [1, 1, 2, 2, 3, 3, 4, 4], sparkUp: false },
      { label: "Notice Risk Score", value: "34/100", change: "Medium", positive: true, tier: "warning", sparkData: [28, 30, 31, 32, 33, 34, 34, 34], sparkUp: false },
      { label: "Next Filing", value: "GSTR-3B · 8d", change: "Apr 20", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Last 2B Pull", value: "Apr 14", change: "Auto-pulled", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Advance Tax YTD", value: "₹2.4L", change: "On track", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "TDS Deducted", value: "₹86K", change: "This quarter", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Vendor Compliance", value: "82%", change: "3 non-compliant", positive: false, tier: "warning", sparkData: [90, 88, 86, 84, 83, 82, 82, 82], sparkUp: true },
    ],
  },
  {
    title: "HR METRICS", id: "hr",
    metrics: [
      { label: "Headcount", value: "12", change: "No change", positive: true, tier: "normal", sparkData: [12, 12, 12, 12, 12, 12, 12, 12], sparkUp: true },
      { label: "Monthly Payroll", value: "₹8.4L/mo", change: "Next: 1st", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
      { label: "Payroll Proximity", value: "18 days", change: "Safe", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: true },
      { label: "Attrition Risk", value: "2 at risk", change: "Below market", positive: false, tier: "critical", sparkData: [0, 0, 1, 1, 1, 2, 2, 2], sparkUp: false },
      { label: "PF Due", value: "₹1.01L", change: "15th Apr", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
      { label: "ESIC Due", value: "₹27K", change: "15th Apr", positive: true, tier: "normal", sparkData: randomSpark(), sparkUp: false },
    ],
  },
];

const sectionIds = sections.map(s => ({ id: s.id, title: s.title.split(" ")[0] }));

const Dashboard360Page = () => {
  const [activeSection, setActiveSection] = useState(sectionIds[0].id);
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("health-score");
      if (hero) {
        setShowNav(window.scrollY > hero.offsetTop + hero.offsetHeight - 180);
      }
      for (const s of [...sectionIds].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 200) {
          setActiveSection(s.id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const healthScores = [
    { label: "Liquidity", score: 68, color: "#F59E0B" },
    { label: "Revenue Quality", score: 81, color: "#16A34A" },
    { label: "Compliance", score: 72, color: "#F59E0B" },
    { label: "Governance", score: 71, color: "#F59E0B" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h2 className="text-fyn-ink text-lg font-sans">360 Dashboard, Complete Business Health View</h2>
        <p className="font-sans" style={{ color: "rgba(26,16,8,0.50)", fontSize: 14, marginTop: 4 }}>Every metric. Every module. One view. Last updated 12 min ago.</p>
        <div className="flex gap-4 mt-3">
          {[
            { src: "Bank AA", status: "Fresh", color: "#16A34A" },
            { src: "Tally", status: "2h ago", color: "#F59E0B" },
            { src: "GST Portal", status: "Yesterday", color: "rgba(26,16,8,0.40)" },
            { src: "Payroll", status: "This month", color: "rgba(26,16,8,0.40)" },
          ].map((d) => (
            <span key={d.src} style={{ fontSize: 13, color: "rgba(26,16,8,0.60)" }}>{d.src} <span style={{ color: d.color }}>● {d.status}</span></span>
          ))}
        </div>
      </div>

      {/* Health Score */}
      <div id="health-score" className="rounded-xl p-8 text-center mb-8" style={{ background: "#FFFFFF", border: "1px solid rgba(26,16,8,0.10)" }}>
        <p className="fyn-label" style={{ color: "#8B6914", fontSize: 12, marginBottom: 8 }}>BUSINESS HEALTH SCORE</p>
        <p className="font-sans text-5xl" style={{ color: "#F59E0B", fontWeight: 700, lineHeight: 1 }}>74<span style={{ fontSize: 24, color: "rgba(26,16,8,0.30)" }}>/100</span></p>
        <div className="grid grid-cols-4 gap-6 max-w-xl mx-auto mt-6">
          {healthScores.map((c) => (
            <div key={c.label}>
              <p className="text-base" style={{ fontWeight: 500, color: "#8B6914", marginBottom: 4 }}>{c.label}</p>
              <div style={{ height: 6, background: "#E0D9C8", borderRadius: 3 }}>
                <div className="progress-fill-animate" style={{ height: 6, background: c.color, borderRadius: 3, width: `${c.score}%` }} />
              </div>
              <p className="fyn-metric text-sm" style={{ color: c.color, marginTop: 4, fontWeight: 600 }}>{c.score}/100</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky section nav */}
      {showNav && (
        <div className="sticky z-20 flex items-center gap-8" style={{ top: 64, height: 40, background: "#FFFFFF", borderBottom: "1px solid #E0D9C8", padding: "0 24px", marginBottom: 8 }}>
          {sectionIds.map(s => (
            <button
              key={s.id}
              onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: activeSection === s.id ? "#C41E1E" : "rgba(26,16,8,0.45)",
                borderBottom: activeSection === s.id ? "2px solid #C41E1E" : "2px solid transparent",
                paddingBottom: 8,
                cursor: "pointer",
                transition: "all 200ms",
              }}
            >{s.title}</button>
          ))}
        </div>
      )}

      {/* Metric sections */}
      {sections.map((section) => (
        <div key={section.title} className="mb-8" id={section.id}>
          <h3 className="fyn-label mb-4" style={{ color: "#8B6914", fontSize: 12 }}>{section.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {section.metrics.map((m) => {
              const t = tierStyles[m.tier];
              const isUp = m.sparkData[7] > m.sparkData[0];
              const sparkColor = (m.sparkUp && isUp) || (!m.sparkUp && !isUp) ? "#16A34A" : isUp ? "#C41E1E" : "#16A34A";
              const sparkLineColor = m.tier === "normal" ? (m.positive ? "#16A34A" : "rgba(26,16,8,0.30)") : sparkColor;
              return (
                <div
                  key={m.label}
                  className="rounded-lg relative transition-all duration-250 hover:-translate-y-[3px] cursor-pointer"
                  style={{
                    background: t.bg,
                    border: `1px solid ${t.border}`,
                    padding: "16px 20px",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,16,8,0.10)"; e.currentTarget.style.borderColor = "#C41E1E"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = t.border; }}
                >
                  <p className="text-base" style={{ color: "rgba(26,16,8,0.50)", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>{m.label}</p>
                  <p className="font-sans text-2xl" style={{ fontWeight: 700, color: t.numColor }}>{m.value}</p>
                  <p style={{ fontSize: 13, marginTop: 4, color: m.positive ? "#16A34A" : "#C41E1E" }}>{m.change}</p>
                  {/* Sparkline */}
                  <div className="absolute bottom-3 right-3" style={{ width: 64, height: 28 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={m.sparkData.map((v, i) => ({ v, i }))}>
                        <Line type="monotone" dataKey="v" stroke={sparkLineColor} strokeWidth={1.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </DashboardLayout>
  );
};

export default Dashboard360Page;
