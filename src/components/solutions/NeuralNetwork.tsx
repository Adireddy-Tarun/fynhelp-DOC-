import { useState, useEffect, useRef, useMemo, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Check, X } from "lucide-react";
import { SUITES } from "@/data/suiteStatus";
import { useAuth } from "@/contexts/AuthContext";

// Module-specific copy for the hover/tap information cards
const MODULE_INFO: Record<string, { solves: string; metrics: string[] }> = {
  liquidity: {
    solves: "Cash flow blindness",
    metrics: [
      "Cash runway (days remaining)",
      "Monthly burn rate (₹)",
      "Working capital position",
      "Next cash crunch date",
    ],
  },
  revenue: {
    solves: "Receivables chaos and revenue unpredictability",
    metrics: [
      "MRR/ARR growth trends",
      "Aging receivables (30/60/90 days)",
      "Customer payment patterns",
      "Churn risk signals",
    ],
  },
  cost: {
    solves: "Expense opacity and cost leaks",
    metrics: [
      "Cost by category breakdown",
      "Top vendor spend ranking",
      "Hidden cost alerts",
      "Cost optimization opportunities",
    ],
  },
  gst: {
    solves: "GST compliance chaos and ITC loss",
    metrics: [
      "ITC reconciliation (GSTR-2B match rate)",
      "Filing deadline countdown",
      "Notice risk score",
      "Unclaimed ITC amount (₹)",
    ],
  },
  governance: {
    solves: "Compliance deadline surprises",
    metrics: [
      "50+ obligation calendar",
      "Upcoming deadline alerts (next 30 days)",
      "Compliance completion rate",
      "Audit readiness score",
    ],
  },
  hr: {
    solves: "Hidden people costs and attrition surprises",
    metrics: [
      "True cost per employee (all-in)",
      "Attrition risk score by employee",
      "Headcount ROI analysis",
      "Payroll optimization opportunities",
    ],
  },
  simulator: {
    solves: "Blind business decisions",
    metrics: [
      "Cash impact of 8 scenarios",
      "Break-even period (months)",
      "ROI projections",
      "Risk assessment score",
    ],
  },
  market: {
    solves: "Industry positioning blindness",
    metrics: [
      "Industry benchmark comparison",
      "Growth readiness score",
      "Competitive position ranking",
      "Expansion opportunity map",
    ],
  },
  banking: {
    solves: "Multi-account chaos",
    metrics: [
      "All bank accounts unified view",
      "UPI transaction tracking",
      "Credit utilization rate",
      "Working capital financing options",
    ],
  },
  "ca-partner": {
    solves: "CA-client disconnect and manual work",
    metrics: [
      "Client portfolio health dashboard",
      "Multi-client compliance status",
      "Shared intelligence access",
      "White-label report generation",
    ],
  },
};

// Logged-in target route per module
const PRODUCT_HASH: Record<string, string> = {
  liquidity: "/products#liquidity",
  revenue: "/products#revenue",
  cost: "/products#cost",
  gst: "/products#gst",
  governance: "/products#governance",
  hr: "/products#hr",
  simulator: "/products#simulator",
  market: "/products#market",
  banking: "/products#banking",
  "ca-partner": "/products#ca-partner",
};

// Display label override (some shortLabels are too terse for the card title)
const DISPLAY_NAME: Record<string, string> = {
  liquidity: "Liquidity Intelligence",
  revenue: "Revenue Intelligence",
  cost: "Cost Intelligence",
  gst: "GST & Tax Intelligence",
  governance: "Governance Intelligence",
  hr: "HR & Workforce Intelligence",
  simulator: "Decision Simulator Suite",
  market: "Market & Growth Intelligence",
  banking: "Banking & Fintech Intelligence",
  "ca-partner": "CA Partner Ecosystem",
};

// Asymmetric, organic positions in % of container (x, y). Hand-tuned to feel
// algorithmic rather than perfectly circular. Varied radii from center.
const POSITIONS: Record<string, { x: number; y: number }> = {
  liquidity:    { x: 50, y: 8 },
  revenue:      { x: 74, y: 18 },
  cost:         { x: 88, y: 42 },
  gst:          { x: 80, y: 70 },
  governance:   { x: 52, y: 84 },
  hr:           { x: 22, y: 70 },
  simulator:    { x: 8,  y: 48 },
  market:       { x: 14, y: 22 },
  banking:      { x: 34, y: 12 },
  "ca-partner": { x: 66, y: 80 },
};

const CENTER = { x: 50, y: 46 };

export default function NeuralNetwork() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null); // mobile/click
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [isMobile, setIsMobile] = useState(false);

  const active = pinned ?? hovered;

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
      setIsMobile(window.innerWidth < 768);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const centerSize = isMobile ? 100 : 140;
  const nodeSize = isMobile ? 70 : 90;

  // Compute pixel positions for nodes + center
  const nodes = useMemo(() => {
    return SUITES.map((s) => {
      const p = POSITIONS[s.id];
      return {
        ...s,
        cx: (p.x / 100) * size.w,
        cy: (p.y / 100) * size.h,
      };
    });
  }, [size]);

  const centerCx = (CENTER.x / 100) * size.w;
  const centerCy = (CENTER.y / 100) * size.h;

  const handleClick = (id: string, href: string) => {
    if (isMobile) {
      // Tap shows card; explicit button inside navigates.
      setPinned((prev) => (prev === id ? null : id));
      return;
    }
    navigateToModule(id);
  };

  const navigateToModule = (id: string) => {
    if (!user) {
      navigate(`/waitlist?module=${id}`);
    } else {
      navigate(PRODUCT_HASH[id] ?? "/products");
    }
  };

  const onKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigateToModule(id);
    }
  };

  // Card position relative to node (desktop)
  const cardPosition = (cx: number, cy: number) => {
    const cardW = 360;
    const cardH = 320; // approx
    const gap = 16 + nodeSize / 2;
    const onLeftHalf = cx < size.w / 2;
    let left = onLeftHalf ? cx + gap : cx - gap - cardW;
    let top = cy - cardH / 2;
    // Clamp to container
    left = Math.max(12, Math.min(left, size.w - cardW - 12));
    top = Math.max(12, Math.min(top, size.h - cardH - 12));
    return { left, top };
  };

  const activeNode = active ? nodes.find((n) => n.id === active) : null;

  return (
    <div
      ref={containerRef}
      className="relative w-full mx-auto"
      style={{
        maxWidth: 1280,
        minHeight: isMobile ? 600 : 800,
        background: "transparent",
      }}
    >
      {/* SVG layer for connection lines + animated particles */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ overflow: "visible" }}
        aria-hidden="true"
      >
        <defs>
          {nodes.map((n) => {
            const dx = centerCx - n.cx;
            const dy = centerCy - n.cy;
            const len = Math.hypot(dx, dy) || 1;
            const ux = dx / len;
            const uy = dy / len;
            const sx = n.cx + ux * (nodeSize / 2);
            const sy = n.cy + uy * (nodeSize / 2);
            const ex = centerCx - ux * (centerSize / 2);
            const ey = centerCy - uy * (centerSize / 2);
            return (
              <path
                key={`p-${n.id}`}
                id={`nn-path-${n.id}`}
                d={`M${sx},${sy} L${ex},${ey}`}
                fill="none"
              />
            );
          })}
        </defs>

        {/* Connection lines */}
        {nodes.map((n) => {
          const dx = centerCx - n.cx;
          const dy = centerCy - n.cy;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const sx = n.cx + ux * (nodeSize / 2);
          const sy = n.cy + uy * (nodeSize / 2);
          const ex = centerCx - ux * (centerSize / 2);
          const ey = centerCy - uy * (centerSize / 2);
          const isActive = active === n.id;
          return (
            <line
              key={`line-${n.id}`}
              x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={isActive ? "#C41E1E" : "#D1D5DB"}
              strokeWidth={isActive ? 2.5 : 1.5}
              opacity={isActive ? 1 : 0.45}
              style={{ transition: "stroke 200ms ease, stroke-width 200ms ease, opacity 200ms ease" }}
            />
          );
        })}

        {/* Animated particles flowing inward */}
        {nodes.map((n, i) => (
          <circle
            key={`particle-${n.id}`}
            r={active === n.id ? 4.5 : 3}
            fill="#C41E1E"
            opacity={active === n.id ? 0.95 : 0.55}
            style={{ transition: "r 200ms ease, opacity 200ms ease" }}
          >
            <animateMotion
              dur={active === n.id ? "1.2s" : "2.4s"}
              repeatCount="indefinite"
              begin={`${(i * 0.22).toFixed(2)}s`}
              rotate="auto"
            >
              <mpath href={`#nn-path-${n.id}`} />
            </animateMotion>
          </circle>
        ))}
      </svg>

      {/* Center node — AI CFO Nidhi */}
      <div
        className="absolute flex flex-col items-center"
        style={{
          left: centerCx,
          top: centerCy,
          transform: "translate(-50%, -50%)",
          zIndex: 30,
        }}
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: centerSize,
            height: centerSize,
            background: "radial-gradient(circle at 35% 30%, #FF4444 0%, #C41E1E 75%)",
            boxShadow: active
              ? "0 12px 48px rgba(196,30,30,0.6)"
              : "0 8px 32px rgba(196,30,30,0.4)",
            animation: "nn-pulse 3000ms ease-in-out infinite",
            transition: "box-shadow 200ms ease",
          }}
          aria-label="AI CFO Nidhi — Central Intelligence"
        >
          <Brain
            color="#FFFFFF"
            size={isMobile ? 36 : 56}
            strokeWidth={2}
          />
        </div>
        <div
          className="mt-3 text-center"
          style={{ pointerEvents: "none" }}
        >
          <div
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? 16 : 18,
              color: "#1A1A1A",
            }}
          >
            AI CFO Nidhi
          </div>
          <div
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: 400,
              fontSize: isMobile ? 12 : 14,
              color: "#6B7280",
              marginTop: 2,
            }}
          >
            Central Intelligence
          </div>
        </div>
      </div>

      {/* Outer module nodes */}
      {nodes.map((n) => {
        const Icon = n.Icon;
        const isActive = active === n.id;
        const isLive = n.status === "live";
        const dimmed = active && !isActive;
        return (
          <div
            key={n.id}
            className="absolute flex flex-col items-center"
            style={{
              left: n.cx,
              top: n.cy,
              transform: "translate(-50%, -50%)",
              zIndex: isActive ? 100 : 20,
              opacity: dimmed ? 0.5 : 1,
              transition: "opacity 200ms ease",
            }}
          >
            <button
              type="button"
              role="button"
              tabIndex={0}
              aria-label={`${DISPLAY_NAME[n.id]} — ${isLive ? "Live" : "In development"}`}
              onMouseEnter={() => !isMobile && setHovered(n.id)}
              onMouseLeave={() => !isMobile && setHovered(null)}
              onClick={() => handleClick(n.id, n.href)}
              onKeyDown={(e) => onKey(e, n.id)}
              className="relative rounded-full flex items-center justify-center focus:outline-none"
              style={{
                width: nodeSize,
                height: nodeSize,
                background: "#FFFFFF",
                border: `2px solid ${isActive ? "#C41E1E" : "#E5E7EB"}`,
                boxShadow: isActive
                  ? "0 8px 24px rgba(196,30,30,0.25)"
                  : "0 4px 12px rgba(0,0,0,0.08)",
                transform: isActive ? "scale(1.15)" : "scale(1)",
                transition: "transform 200ms ease-out, border-color 200ms ease, box-shadow 200ms ease",
                cursor: "pointer",
                animation: isActive ? undefined : "nn-breathe 4000ms ease-in-out infinite",
                willChange: "transform",
              }}
            >
              <Icon
                size={isMobile ? 24 : 32}
                color="#1A1A1A"
                strokeWidth={2}
              />
              {/* Status indicator dot */}
              <span
                aria-hidden="true"
                className="absolute"
                style={{
                  top: 2,
                  right: 2,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: isLive ? "#10B981" : "#9CA3AF",
                  border: "2px solid #FFFFFF",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              />
            </button>
            <div
              className="mt-2 text-center"
              style={{
                pointerEvents: "none",
                fontFamily: "'Raleway', sans-serif",
                fontWeight: 500,
                fontSize: isMobile ? 12 : 14,
                color: "#1A1A1A",
                maxWidth: 120,
                lineHeight: 1.3,
              }}
            >
              {DISPLAY_NAME[n.id].replace(" Intelligence", "").replace(" Suite", "").replace(" Ecosystem", "")}
            </div>
          </div>
        );
      })}

      {/* Information card — desktop hover/click positioned beside node */}
      {activeNode && !isMobile && (() => {
        const pos = cardPosition(activeNode.cx, activeNode.cy);
        return (
          <InfoCard
            id={activeNode.id}
            isLive={activeNode.status === "live"}
            onAction={() => navigateToModule(activeNode.id)}
            onClose={() => { setPinned(null); setHovered(null); }}
            style={{ left: pos.left, top: pos.top, position: "absolute" }}
          />
        );
      })()}

      {/* Mobile modal */}
      {activeNode && isMobile && (
        <div
          className="fixed inset-0 flex items-end sm:items-center justify-center"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1000 }}
          onClick={() => { setPinned(null); setHovered(null); }}
        >
          <div onClick={(e) => e.stopPropagation()}>
            <InfoCard
              id={activeNode.id}
              isLive={activeNode.status === "live"}
              onAction={() => navigateToModule(activeNode.id)}
              onClose={() => { setPinned(null); setHovered(null); }}
              style={{
                position: "relative",
                margin: 16,
                maxHeight: "80vh",
                overflowY: "auto",
              }}
              showClose
            />
          </div>
        </div>
      )}

      {/* Local keyframes */}
      <style>{`
        @keyframes nn-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50%      { transform: translate(-50%, -50%) scale(1.05); }
        }
        @keyframes nn-breathe {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.95; }
        }
        @keyframes nn-card-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

interface InfoCardProps {
  id: string;
  isLive: boolean;
  onAction: () => void;
  onClose: () => void;
  style?: React.CSSProperties;
  showClose?: boolean;
}

function InfoCard({ id, isLive, onAction, onClose, style, showClose }: InfoCardProps) {
  const info = MODULE_INFO[id];
  const name = DISPLAY_NAME[id];
  if (!info) return null;
  return (
    <div
      role="dialog"
      aria-label={`${name} details`}
      style={{
        width: 360,
        maxWidth: "90vw",
        background: "#FFFFFF",
        borderRadius: 12,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        padding: 24,
        zIndex: 1000,
        animation: "nn-card-in 200ms ease-out",
        ...style,
      }}
    >
      {showClose && (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <X size={20} color="#6B7280" />
        </button>
      )}
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        <h3 style={{
          fontFamily: "'Raleway', sans-serif",
          fontWeight: 700,
          fontSize: 20,
          color: "#1A1A1A",
          margin: 0,
          lineHeight: 1.25,
        }}>{name}</h3>
        <span style={{
          background: isLive ? "#10B981" : "#6B7280",
          color: "#FFFFFF",
          padding: "4px 10px",
          borderRadius: 12,
          fontFamily: "'Work Sans', sans-serif",
          fontWeight: 500,
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          {isLive ? "Live" : "In Development"}
        </span>
      </div>

      {/* Solves */}
      <div style={{
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 500,
        fontSize: 11,
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 6,
      }}>Solves:</div>
      <p style={{
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 500,
        fontSize: 16,
        color: "#1A1A1A",
        lineHeight: 1.4,
        marginBottom: 16,
      }}>{info.solves}</p>

      {/* Metrics */}
      <div style={{
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 500,
        fontSize: 11,
        color: "#6B7280",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: 10,
      }}>Key metrics you'll get:</div>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}>
        {info.metrics.map((m) => (
          <li key={m} style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            fontFamily: "'Roboto', sans-serif",
            fontSize: 14,
            color: "#1A1A1A",
            lineHeight: 1.6,
            marginBottom: 8,
          }}>
            <Check size={16} color="#10B981" style={{ marginTop: 3, flexShrink: 0 }} strokeWidth={2.5} />
            <span>{m}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        type="button"
        onClick={onAction}
        style={{
          width: "100%",
          padding: "12px 20px",
          borderRadius: 8,
          background: isLive ? "#C41E1E" : "#6B7280",
          color: "#FFFFFF",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 15,
          border: "none",
          cursor: "pointer",
          transition: "all 200ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "brightness(0.9)";
          e.currentTarget.style.transform = "scale(1.02)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "none";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        {isLive ? "Click to explore →" : "Join waitlist for early access →"}
      </button>
    </div>
  );
}
