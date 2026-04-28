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
  const [pinnedNode, setPinnedNode] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Pinned wins over hover, so a tap holds the highlight on touch devices
  const activeNode = pinnedNode ?? hoveredNode;

  // Pause animations when off-screen for perf
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Dismiss pinned node when tapping/clicking outside the diagram
  useEffect(() => {
    if (!pinnedNode) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      const el = containerRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) {
        setPinnedNode(null);
        setHoveredNode(null);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [pinnedNode]);

  const navigateToNode = (node: typeof nodes[0]) => {
    if (!user) {
      navigate(`/waitlist?return=${node.slug}`);
    } else {
      navigate(node.slug);
    }
  };

  const handleNodeTap = (node: typeof nodes[0]) => {
    // Tap toggles the pinned highlight + tooltip; navigation happens via the tooltip link.
    setPinnedNode((prev) => (prev === node.id ? null : node.id));
  };

  // Geometry — viewBox 700x700, center (350,350), outer radius 280, center r 60, outer r 40
  const CENTER = 350;
  const RADIUS = 280;
  const CENTER_R = 60;
  const OUTER_R = 40;
  // Particle travels from edge of outer node to edge of center node
  const PARTICLES_PER_LINE = 3;
  const BASE_DUR = 3; // seconds

  return (
    <div ref={containerRef} className="relative mx-auto" style={{ maxWidth: 700 }}>
      <svg
        viewBox="0 0 700 700"
        className="w-full h-auto mx-auto"
        style={{ maxWidth: 700, transform: "var(--ecosystem-scale, none)" }}
        aria-label="FynHelp ecosystem map"
      >
        <defs>
          {/* Soft glow for the center */}
          <radialGradient id="nidhi-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C41E1E" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#C41E1E" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#C41E1E" stopOpacity="0" />
          </radialGradient>
          {/* Hidden motion paths — one per node, from outer edge to center edge */}
          {nodes.map((n) => {
            const rad = ((n.angle - 90) * Math.PI) / 180; // -90° so 0° = top (12 o'clock)
            const ox = CENTER + RADIUS * Math.cos(rad);
            const oy = CENTER + RADIUS * Math.sin(rad);
            // Trim to outer-circle edge → center-circle edge
            const dx = CENTER - ox;
            const dy = CENTER - oy;
            const len = Math.hypot(dx, dy);
            const ux = dx / len;
            const uy = dy / len;
            const sx = ox + ux * OUTER_R;
            const sy = oy + uy * OUTER_R;
            const ex = CENTER - ux * CENTER_R;
            const ey = CENTER - uy * CENTER_R;
            return (
              <path
                key={`path-${n.id}`}
                id={`path-${n.id}`}
                d={`M${sx},${sy} L${ex},${ey}`}
                fill="none"
              />
            );
          })}
        </defs>

        {/* Center glow halo */}
        <circle cx={CENTER} cy={CENTER} r={CENTER_R + 60} fill="url(#nidhi-glow)" />

        {/* Connection lines */}
        {nodes.map((n) => {
          const rad = ((n.angle - 90) * Math.PI) / 180;
          const ox = CENTER + RADIUS * Math.cos(rad);
          const oy = CENTER + RADIUS * Math.sin(rad);
          const dx = CENTER - ox;
          const dy = CENTER - oy;
          const len = Math.hypot(dx, dy);
          const ux = dx / len;
          const uy = dy / len;
          const sx = ox + ux * OUTER_R;
          const sy = oy + uy * OUTER_R;
          const ex = CENTER - ux * CENTER_R;
          const ey = CENTER - uy * CENTER_R;
          const isActive = activeNode === n.id;
          return (
            <line
              key={`${n.id}-line`}
              x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={isActive ? "#C41E1E" : "#CCCCCC"}
              strokeWidth={2}
              strokeDasharray={isActive ? "none" : "5 5"}
              style={{ transition: "stroke 250ms ease, stroke-dasharray 250ms ease" }}
            />
          );
        })}

        {/* Particles flowing inward — multiple per line, staggered */}
        {visible && nodes.map((n, ni) => {
          const isActive = activeNode === n.id;
          return (
            <g key={`${n.id}-particles`}>
              {Array.from({ length: PARTICLES_PER_LINE }).map((_, pi) => (
                <circle
                  key={pi}
                  r={isActive ? 4 : 3}
                  fill="#C41E1E"
                  opacity={isActive ? 1 : 0.8}
                  style={{ transition: "r 250ms ease, opacity 250ms ease" }}
                >
                  <animateMotion
                    dur={`${BASE_DUR}s`}
                    repeatCount="indefinite"
                    begin={`${(ni * 0.18) + (pi * (BASE_DUR / PARTICLES_PER_LINE))}s`}
                    rotate="auto"
                  >
                    <mpath href={`#path-${n.id}`} />
                  </animateMotion>
                </circle>
              ))}
            </g>
          );
        })}

        {/* Center AI CFO Nidhi */}
        <g
          onMouseEnter={() => setHoveredNode("nidhi")}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={(e) => {
            e.stopPropagation();
            setPinnedNode((prev) => (prev === "nidhi" ? null : "nidhi"));
          }}
          style={{ cursor: "pointer" }}
        >
          <circle
            cx={CENTER} cy={CENTER} r={CENTER_R}
            fill="#C41E1E"
            style={{
              filter: "drop-shadow(0 0 18px rgba(196,30,30,0.45))",
              transform: activeNode === "nidhi" ? "scale(1.06)" : "scale(1)",
              transformOrigin: `${CENTER}px ${CENTER}px`,
              transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
          <text
            x={CENTER} y={CENTER + 5}
            textAnchor="middle" fill="#FFFFFF"
            fontSize="16" fontWeight="700"
            style={{ pointerEvents: "none", fontFamily: "'Inter', sans-serif" }}
          >
            AI CFO Nidhi
          </text>
        </g>

        {/* Outer module nodes */}
        {nodes.map((n) => {
          const rad = ((n.angle - 90) * Math.PI) / 180;
          const x = CENTER + RADIUS * Math.cos(rad);
          const y = CENTER + RADIUS * Math.sin(rad);
          const isActive = activeNode === n.id;
          return (
            <g
              key={n.id}
              onMouseEnter={() => setHoveredNode(n.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={(e) => {
                e.stopPropagation();
                handleNodeTap(n);
              }}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={x} cy={y} r={OUTER_R}
                fill={isActive ? "#FFFFFF" : "#F5F1E8"}
                stroke={isActive ? "#C41E1E" : "rgba(26,16,8,0.18)"}
                strokeWidth={2}
                style={{
                  filter: "drop-shadow(0 4px 10px rgba(26,16,8,0.10))",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transformOrigin: `${x}px ${y}px`,
                  transition: "all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />
              <text
                x={x} y={y + 5} textAnchor="middle"
                fill={isActive ? "#C41E1E" : "#2A2A2A"}
                fontSize="14" fontWeight="500"
                style={{ pointerEvents: "none", fontFamily: "'Inter', sans-serif", transition: "fill 250ms ease" }}
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip — outer node */}
      {hoveredNode && hoveredNode !== "nidhi" && (() => {
        const n = nodes.find((nd) => nd.id === hoveredNode);
        if (!n) return null;
        const rad = ((n.angle - 90) * Math.PI) / 180;
        // Position tooltip relative to container (700x700 viewBox mapped to %)
        const xPct = 50 + (RADIUS / 700) * 100 * Math.cos(rad);
        const yPct = 50 + (RADIUS / 700) * 100 * Math.sin(rad) - 8;
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
              maxWidth: 240, boxShadow: "0 8px 32px rgba(26,16,8,0.25)",
            }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#FFFFFF", marginBottom: 4 }}>{n.label}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>{n.title}</p>
            </div>
            <div style={{
              width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent",
              borderTop: "6px solid hsl(24 53% 7%)", margin: "0 auto",
            }} />
          </div>
        );
      })()}

      {/* Tooltip — center */}
      {hoveredNode === "nidhi" && (
        <div
          className="absolute pointer-events-none"
          style={{ left: "50%", top: "32%", transform: "translate(-50%, -100%)", animation: "fade-in 200ms ease-out", zIndex: 20 }}
        >
          <div style={{ background: "hsl(24 53% 7%)", borderRadius: 8, padding: "12px 16px", maxWidth: 260, boxShadow: "0 8px 32px rgba(26,16,8,0.25)" }}>
            <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#FFFFFF", marginBottom: 4 }}>AI CFO Nidhi</p>
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
      navigate(`/waitlist?return=${dashSlug}`);
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
      <section style={{ background: "#F9F7F4", paddingTop: 80, paddingBottom: 80 }}>
        <div className="fyn-container text-center">
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              fontSize: 32,
              color: "#2A2A2A",
              marginBottom: 16,
            }}
          >
            How the product ecosystem works together
          </h2>
          <p style={{ fontSize: 16, color: "#2A2A2A", opacity: 0.7, marginBottom: 40 }}>
            Hover over any node to learn more. Click to explore the module.
          </p>
          <EcosystemMap />
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.6,
              color: "#2A2A2A",
              opacity: 0.8,
              marginTop: 40,
              maxWidth: 640,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
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
