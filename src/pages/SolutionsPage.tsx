import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";

const nodes = [
  { id: "liquidity", label: "Liquidity", angle: 0, slug: "/dashboard/cash-flow", title: "Real-time cash runway, burn rate, and working capital intelligence. Updated every 6 hours.", dashSlug: "cash-flow" },
  { id: "revenue", label: "Revenue", angle: 45, slug: "/dashboard/receivables", title: "Receivables AI, default prediction, and automated collections. Know who won't pay before they don't.", dashSlug: "receivables" },
  { id: "gst", label: "GST", angle: 90, slug: "/dashboard/gst", title: "ITC reconciliation, notice risk scoring, vendor compliance. Protect ₹3.2L average annual ITC loss.", dashSlug: "gst" },
  { id: "governance", label: "Governance", angle: 135, slug: "/dashboard/cockpit", title: "50+ compliance obligations tracked. ROC, FEMA, MCA — nothing falls through the cracks.", dashSlug: "cockpit" },
  { id: "hr", label: "HR", angle: 180, slug: "/dashboard/hr", title: "Hiring forecast, payroll cash planning, attrition risk. Know when you can afford to grow.", dashSlug: "hr" },
  { id: "simulator", label: "Simulator", angle: 225, slug: "/dashboard/simulator", title: "8 what-if scenarios. Credit terms, hiring, pricing, capex — modelled against your live data.", dashSlug: "simulator" },
  { id: "market", label: "Market", angle: 270, slug: "/dashboard/360", title: "Industry benchmarks, credit rating simulation, fundraise readiness. Know where you stand.", dashSlug: "360" },
  { id: "banking", label: "Banking", angle: 315, slug: "/dashboard/cockpit", title: "Multi-bank aggregation via RBI AA framework. All accounts, one intelligent view.", dashSlug: "cockpit" },
];

const solutions = [
  {
    bg: "bg-fyn-beige", text: "text-fyn-ink", sub: "text-fyn-ink/70",
    title: "Never run out of cash again",
    slug: "cash-liquidity",
    problem: "The #1 cause of SME failure is cash flow management — not profitability. Most business owners only know their bank balance, not their runway.",
    solution: "AI CFO Nidhi computes your exact runway every morning from live bank data via RBI's Account Aggregator. She models your next 90 days using invoice due dates, vendor payment schedules, and payroll commitments.",
    modules: ["Financial Health Score", "Cash Flow Projection", "Burn Acceleration", "Liquidity Alerts"],
    before: "Average time to detect cash crisis: 14 days after it begins",
    after: "Average time to detect cash crisis: 62 days before it begins",
    dashSlug: "/dashboard/cash-flow",
  },
  {
    bg: "bg-fyn-ink", text: "text-white", sub: "text-white/70",
    title: "Stop losing money to customers who aren't paying",
    slug: "collections-revenue",
    problem: "The average Indian SME has 42 days of receivables sitting unpaid — working capital locked in invoices, not in your bank.",
    solution: "AI CFO Nidhi scores every customer on payment reliability. She automatically drafts WhatsApp payment reminders and enforces your Section 43B(h) rights.",
    modules: ["Receivables AI", "Default Prediction", "Customer Risk Score", "Collections Automation"],
    before: "Average DSO for Indian SMEs: 42 days",
    after: "FynHelp customers average DSO: 28 days",
    dashSlug: "/dashboard/receivables",
  },
  {
    bg: "bg-fyn-beige", text: "text-fyn-ink", sub: "text-fyn-ink/70",
    title: "Stop fearing GST notices",
    slug: "gst-compliance",
    problem: "Indian SMEs collectively lose thousands of crores in unclaimed ITC every year because their vendors don't file on time.",
    solution: "On the 14th of every month, AI CFO Nidhi automatically pulls your ITC data and matches it against every purchase invoice. Mismatches are flagged instantly.",
    modules: ["ITC Reconciliation", "Notice Risk Scorer", "Smart Filing Calendar", "Vendor GST Health"],
    before: "₹3.2L average annual ITC loss per SME",
    after: "74% of ITC losses prevented with vendor monitoring",
    dashSlug: "/dashboard/gst",
  },
];

function EcosystemMap() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNodeClick = (node: typeof nodes[0]) => {
    if (!user) {
      navigate(`/early-access?return=${node.slug}`);
    } else {
      navigate(node.slug);
    }
  };

  return (
    <div className="relative max-w-lg mx-auto">
      <svg viewBox="0 0 400 400" className="w-full max-w-md mx-auto" aria-label="FynHelp ecosystem map">
        {/* Animated data lines */}
        {nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = 200 + 140 * Math.cos(rad);
          const y = 200 + 140 * Math.sin(rad);
          const isHovered = hoveredNode === n.id || hoveredNode === "nidhi";
          return (
            <g key={n.id + "-line"}>
              <line x1="200" y1="200" x2={x} y2={y}
                stroke={isHovered ? "#C41E1E" : "rgba(26,16,8,0.15)"}
                strokeWidth={isHovered ? 1.5 : 1}
                strokeDasharray={isHovered ? "none" : "4 4"}
                style={{ transition: "all 300ms" }} />
              {/* Animated dot traveling along line */}
              <circle r="3" fill={isHovered ? "#C41E1E" : "hsl(38 74% 31%)"} opacity={0.7}>
                <animateMotion dur={isHovered ? "1s" : "2s"} repeatCount="indefinite" begin={`${nodes.indexOf(n) * 0.25}s`}>
                  <mpath href={`#path-${n.id}`} />
                </animateMotion>
              </circle>
              <path id={`path-${n.id}`} d={`M${x},${y} L200,200`} fill="none" />
            </g>
          );
        })}

        {/* Center AI CFO Nidhi */}
        <g
          onMouseEnter={() => setHoveredNode("nidhi")}
          onMouseLeave={() => setHoveredNode(null)}
          style={{ cursor: "pointer" }}
        >
          <circle cx="200" cy="200" r="40" fill="#C41E1E"
            style={{ transform: hoveredNode === "nidhi" ? "scale(1.1)" : "scale(1)", transformOrigin: "200px 200px", transition: "transform 300ms" }} />
          <text x="200" y="205" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" style={{ pointerEvents: "none" }}>AI CFO Nidhi</text>
        </g>

        {/* Satellite nodes */}
        {nodes.map((n) => {
          const rad = (n.angle * Math.PI) / 180;
          const x = 200 + 140 * Math.cos(rad);
          const y = 200 + 140 * Math.sin(rad);
          const isHovered = hoveredNode === n.id;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(n)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={x} cy={y} r="30"
                fill={isHovered ? "hsl(0 52% 95%)" : "hsl(40 42% 86%)"}
                stroke={isHovered ? "#C41E1E" : "rgba(26,16,8,0.2)"}
                strokeWidth={isHovered ? 1.5 : 1}
                style={{
                  transform: isHovered ? `scale(1.15)` : "scale(1)",
                  transformOrigin: `${x}px ${y}px`,
                  transition: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)"
                }}
              />
              <text x={x} y={y + 4} textAnchor="middle"
                fill={isHovered ? "#C41E1E" : "rgba(26,16,8,0.6)"}
                fontSize="9" fontWeight="500" style={{ pointerEvents: "none", transition: "fill 300ms" }}>
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredNode && hoveredNode !== "nidhi" && (() => {
        const n = nodes.find((nd) => nd.id === hoveredNode);
        if (!n) return null;
        const rad = (n.angle * Math.PI) / 180;
        const xPct = 50 + 35 * Math.cos(rad);
        const yPct = 50 + 35 * Math.sin(rad) - 18;
        return (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${xPct}%`, top: `${yPct}%`,
              transform: "translate(-50%, -100%)",
              animation: "fade-in 200ms ease-out",
              zIndex: 20,
            }}
          >
            <div style={{
              background: "hsl(24 53% 7%)", borderRadius: 8, padding: "12px 16px",
              maxWidth: 220, boxShadow: "0 8px 32px rgba(26,16,8,0.25)"
            }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#FFFFFF", marginBottom: 4 }}>{n.label}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{n.title}</p>
            </div>
            <div style={{
              width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
              borderTop: "6px solid hsl(24 53% 7%)", margin: "0 auto"
            }} />
          </div>
        );
      })()}

      {hoveredNode === "nidhi" && (
        <div
          className="absolute pointer-events-none"
          style={{ left: "50%", top: "28%", transform: "translate(-50%, -100%)", animation: "fade-in 200ms ease-out", zIndex: 20 }}
        >
          <div style={{ background: "hsl(24 53% 7%)", borderRadius: 8, padding: "12px 16px", maxWidth: 240, boxShadow: "0 8px 32px rgba(26,16,8,0.25)" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#FFFFFF", marginBottom: 4 }}>AI CFO Nidhi AI CFO</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
              Connects all modules and synthesises them into one coherent recommendation for your business.
            </p>
          </div>
          <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: "6px solid hsl(24 53% 7%)", margin: "0 auto" }} />
        </div>
      )}
    </div>
  );
}

const SolutionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLearnMore = (dashSlug: string) => {
    if (!user) {
      navigate(`/early-access?return=${dashSlug}`);
    } else {
      navigate(dashSlug);
    }
  };

  return (
    <Layout>
      <section className="bg-fyn-ink py-16">
        <div className="fyn-container text-center">
          <span className="fyn-label block mb-4 font-sans text-[#8e7343] text-base">HOW FYNHELP WORKS</span>
          <h1 className="text-3xl leading-tight text-white max-w-[900px] mx-auto mb-4 font-serif md:text-7xl font-bold">
            One platform. Every financial problem an Indian SME faces. Solved.
          </h1>
          <p className="text-white/60 text-lg max-w-[700px] mx-auto">
            FynHelp's intelligence suites are deeply interconnected — when AI CFO Nidhi spots a cash crunch, she simultaneously checks your receivables for quick wins, your GST for refunds due, your payables for deferral options, and your working capital marketplace for financing.
          </p>
        </div>
      </section>

      {/* Interactive Ecosystem Map */}
      <section className="bg-fyn-beige fyn-section">
        <div className="fyn-container text-center">
          <h2 className="text-3xl text-fyn-ink mb-4">How the product ecosystem works together</h2>
          <p className="text-fyn-ink/60 text-sm mb-12">Hover over any node to learn more. Click to explore the module.</p>
          <EcosystemMap />
          <p className="text-fyn-ink/60 text-base mt-8 max-w-lg mx-auto">
            Every module feeds AI CFO Nidhi. AI CFO Nidhi connects everything. You get one coherent answer — not 6 separate dashboards.
          </p>
        </div>
      </section>

      {/* Solution deep dives */}
      {solutions.map((s) => (
        <section key={s.title} className={`${s.bg} fyn-section`}>
          <div className="fyn-container max-w-3xl font-bold">
            <h2 className={`text-3xl ${s.text} mb-4`}>{s.title}</h2>
            <p className={`${s.sub} mb-6 leading-relaxed`}>{s.problem}</p>
            <p className={`${s.sub} mb-6 leading-relaxed`}>{s.solution}</p>

            {/* Before / After */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className={`rounded-lg p-4 ${s.bg === "bg-fyn-ink" ? "bg-white/5" : "bg-fyn-danger-bg"}`}>
                <p className="fyn-caption text-fyn-red text-[10px] mb-1">Before FynHelp</p>
                <p className={`text-sm ${s.bg === "bg-fyn-ink" ? "text-white/80" : "text-fyn-ink/80"}`}>{s.before}</p>
              </div>
              <div className={`rounded-lg p-4 ${s.bg === "bg-fyn-ink" ? "bg-white/5" : "bg-fyn-success-bg"}`}>
                <p className="fyn-caption text-fyn-success text-[10px] mb-1">After FynHelp</p>
                <p className={`text-sm ${s.bg === "bg-fyn-ink" ? "text-white/80" : "text-fyn-ink/80"}`}>{s.after}</p>
              </div>
            </div>

            {/* Module chips — clickable */}
            <div className="flex flex-wrap gap-2 mb-6">
              {s.modules.map((m) => (
                <button key={m}
                  onClick={() => handleLearnMore(s.dashSlug)}
                  className={`text-xs px-3 py-1.5 rounded border cursor-pointer ${
                    s.bg === "bg-fyn-ink"
                      ? "border-white/20 text-white/60 hover:border-fyn-red hover:text-fyn-red"
                      : "border-fyn-ink-10 text-fyn-ink/60 hover:border-fyn-red hover:text-fyn-red hover:bg-fyn-red-light"
                  }`}
                  style={{ transition: "all 200ms" }}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Learn more */}
            <button
              onClick={() => handleLearnMore(s.dashSlug)}
              className="text-fyn-red text-sm font-medium inline-flex items-center gap-1 group"
              style={{ background: "transparent", border: "none", cursor: "pointer" }}
            >
              Learn more
              <span className="inline-block transition-transform group-hover:translate-x-1" style={{ transition: "transform 200ms" }}>→</span>
            </button>
          </div>
        </section>
      ))}
    </Layout>
  );
};

export default SolutionsPage;
