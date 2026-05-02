import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Full-page animated mountain roadmap with real-time sun/moon, layered clouds,
 * 3D path wrapping, and interactive product chips.
 * Self-contained: SVG + CSS keyframes, no external libs.
 */

type Status = "live" | "beta" | "soon";

const STATUS_COLOR: Record<Status, string> = {
  live: "#34C759",
  beta: "#FF9F0A",
  soon: "#C9A84C",
};
const STATUS_LABEL: Record<Status, string> = {
  live: "LIVE",
  beta: "BETA",
  soon: "SOON",
};

interface Product {
  name: string;
  emoji: string;
  color: string;
  status: Status;
  desc: string;
}
interface Stop {
  id: number;
  // viewBox coordinates (0..1200 x, 0..1000 y)
  x: number;
  y: number;
  side: "left" | "right";
  pathColor: string;
  products: Product[];
}

const VB_W = 1200;
const VB_H = 1000;

// ───────────────── Stops & products ─────────────────
const STOPS: Stop[] = [
  {
    id: 1,
    x: 180,
    y: 750, // 75%
    side: "left",
    pathColor: "#34C759",
    products: [
      { name: "Liquidity Intelligence", emoji: "💧", color: "#3B82F6", status: "live", desc: "Cash flow tracking & runway forecasts" },
      { name: "AI CFO Nidhi", emoji: "🤖", color: "#F43F5E", status: "live", desc: "Your always-on AI Chief Financial Officer" },
    ],
  },
  {
    id: 2,
    x: 380,
    y: 620, // 62%
    side: "left",
    pathColor: "#FF9F0A",
    products: [
      { name: "Revenue Intelligence", emoji: "📊", color: "#14B8A6", status: "beta", desc: "Live revenue analytics & forecasting" },
      { name: "Cost Intelligence", emoji: "💰", color: "#F97316", status: "beta", desc: "Spend visibility & burn optimization" },
    ],
  },
  {
    id: 3,
    x: 820,
    y: 480, // 48%
    side: "right",
    pathColor: "#C9A84C",
    products: [
      { name: "GST & Tax Intelligence", emoji: "🏛️", color: "#F59E0B", status: "soon", desc: "Auto-filing, ITC reconciliation & TDS" },
      { name: "CA Partner Ecosystem", emoji: "🤝", color: "#EC4899", status: "soon", desc: "Connect with verified CAs in one click" },
    ],
  },
  {
    id: 4,
    x: 460,
    y: 320, // 32%
    side: "left",
    pathColor: "#C9A84C",
    products: [
      { name: "HR Intelligence", emoji: "👥", color: "#8B5CF6", status: "soon", desc: "Payroll, compliance & people analytics" },
      { name: "Market & Growth", emoji: "🌍", color: "#10B981", status: "soon", desc: "Competitor benchmarks & expansion signals" },
    ],
  },
];

// Summit position
const SUMMIT = { x: 720, y: 120 }; // 12%

// ───────────────── Path segments (cubic beziers) ─────────────────
// Each segment carries its own stroke color & a "wraps behind" flag.
const HIDE_X1 = 560;
const HIDE_X2 = 880;

interface Seg {
  d: string;
  color: string;
  width: number;
}

function buildPath(): Seg[] {
  // Stop1 → Stop2 (green)
  const s12 = `M ${STOPS[0].x} ${STOPS[0].y} C 240 700, 320 670, ${STOPS[1].x} ${STOPS[1].y}`;
  // Stop2 → Stop3 (orange) — crosses behind mountain center
  // Split into pre-hide and post-emerge for the "wrap" illusion.
  const s23a = `M ${STOPS[1].x} ${STOPS[1].y} C 460 580, ${HIDE_X1 - 20} 540, ${HIDE_X1} 530`;
  const s23b = `M ${HIDE_X2} 510 C 900 500, 860 490, ${STOPS[2].x} ${STOPS[2].y}`;
  // Stop3 → Stop4 (gold) — crosses back behind on the way left
  const s34a = `M ${STOPS[2].x} ${STOPS[2].y} C 780 420, ${HIDE_X2 + 10} 400, ${HIDE_X2} 395`;
  const s34b = `M ${HIDE_X1} 380 C 540 360, 500 340, ${STOPS[3].x} ${STOPS[3].y}`;
  // Stop4 → Summit (gold)
  const s4s = `M ${STOPS[3].x} ${STOPS[3].y} C 520 240, 640 180, ${SUMMIT.x} ${SUMMIT.y}`;
  return [
    { d: s12, color: "#34C759", width: 4 },
    { d: s23a, color: "#FF9F0A", width: 3.5 },
    { d: s23b, color: "#FF9F0A", width: 3.5 },
    { d: s34a, color: "#C9A84C", width: 3 },
    { d: s34b, color: "#C9A84C", width: 3 },
    { d: s4s, color: "#C9A84C", width: 3 },
  ];
}

// ───────────────── Supabase row mapping ─────────────────
type DbStatus = "live" | "in_progress" | "planned" | "beta" | "soon";
interface RoadmapRow {
  name: string;
  status: DbStatus | string;
  description: string | null;
}
const dbToStatus = (s: string): Status =>
  s === "live" ? "live" : s === "beta" || s === "in_progress" ? "beta" : "soon";
const norm = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");

// ───────────────── Component ─────────────────
const Roadmap: React.FC = () => {
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, RoadmapRow>>({});
  const [sunPosition, setSunPosition] = useState({ x: 50, y: 30, opacity: 1 });
  const [moonPosition, setMoonPosition] = useState({ x: 50, y: 90, opacity: 0 });
  const [skyGradient, setSkyGradient] = useState(
    "linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)"
  );
  const [isNight, setIsNight] = useState(false);

  // Real-time celestial bodies
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const t = now.getHours() + now.getMinutes() / 60;
      const sunrise = 6;
      const sunset = 18;

      // Sun
      let sunX: number, sunY: number, sunOpacity: number;
      if (t >= sunrise && t <= sunset) {
        const p = (t - sunrise) / (sunset - sunrise);
        sunX = 15 + p * 70;
        sunY = 85 - Math.sin(p * Math.PI) * 65;
        sunOpacity = 1;
      } else {
        sunOpacity = 0;
        sunX = t < sunrise ? 10 : 90;
        sunY = 90;
      }

      // Moon
      let moonX: number, moonY: number, moonOpacity: number;
      if (t < sunrise || t > sunset) {
        const adj = t < 12 ? t + 24 : t;
        const p = (adj - 18) / 12;
        moonX = 85 - p * 70;
        moonY = 85 - Math.sin(p * Math.PI) * 65;
        moonOpacity = 1;
      } else {
        moonOpacity = 0;
        moonX = 50;
        moonY = 90;
      }

      setSunPosition({ x: sunX, y: sunY, opacity: sunOpacity });
      setMoonPosition({ x: moonX, y: moonY, opacity: moonOpacity });

      let g: string;
      let night = false;
      if (t >= 5 && t < 7) g = "linear-gradient(180deg, #FFE5D9 0%, #FFC4A3 100%)";
      else if (t >= 7 && t < 17) g = "linear-gradient(180deg, #87CEEB 0%, #E0F6FF 100%)";
      else if (t >= 17 && t < 19) g = "linear-gradient(180deg, #FFA07A 0%, #FF6B9D 100%)";
      else {
        g = "linear-gradient(180deg, #2D1B4E 0%, #1a1a2e 100%)";
        night = true;
      }
      setSkyGradient(g);
      setIsNight(night);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  // Load Supabase overrides
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("roadmap_stops")
        .select("name,status,description");
      if (cancelled || error || !data) return;
      const map: Record<string, RoadmapRow> = {};
      data.forEach((r: any) => (map[norm(r.name)] = r as RoadmapRow));
      setOverrides(map);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveProduct = (p: Product): Product => {
    const o = overrides[norm(p.name)];
    if (!o) return p;
    return {
      ...p,
      status: dbToStatus(String(o.status)),
      desc: o.description || p.desc,
    };
  };

  const segments = useMemo(buildPath, []);

  // Convert viewBox % helpers
  const pctX = (px: number) => (px / VB_W) * 100;
  const pctY = (py: number) => (py / VB_H) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600;700&family=Playfair+Display:wght@700;900&display=swap');

        @keyframes rm-rays-rotate { to { transform: rotate(360deg); } }
        @keyframes rm-sun-glow {
          0%,100% { filter: drop-shadow(0 0 30px rgba(255,217,61,0.7)); }
          50%     { filter: drop-shadow(0 0 50px rgba(255,217,61,0.95)); }
        }
        @keyframes rm-cloud-pulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.05);} }
        @keyframes rm-cloud-drift-slow { from { transform: translateX(-10%);} to { transform: translateX(110%);} }
        @keyframes rm-cloud-drift-mid  { from { transform: translateX(-15%);} to { transform: translateX(115%);} }
        @keyframes rm-cloud-drift-fast { from { transform: translateX(-20%);} to { transform: translateX(120%);} }
        @keyframes rm-bird-fly { from { transform: translateX(-10%);} to { transform: translateX(115%);} }
        @keyframes rm-tree-sway { 0%,100% { transform: rotate(-0.5deg);} 50% { transform: rotate(0.5deg);} }
        @keyframes rm-flag-wave { 0%,100% { transform: rotate(-3deg);} 50% { transform: rotate(3deg);} }
        @keyframes rm-mini-flag-wave { 0%,100% { transform: rotate(-2deg);} 50% { transform: rotate(2deg);} }
        @keyframes rm-pulse-ring {
          0% { r: 7; opacity: 0.55; }
          100% { r: 18; opacity: 0; }
        }
        @keyframes rm-climber-bob { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-3px);} }
        @keyframes rm-stick-sway { 0%,100% { transform: rotate(-2deg);} 50% { transform: rotate(2deg);} }
        @keyframes rm-dash {
          to { stroke-dashoffset: -26; }
        }

        .rm-chip {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1.5px solid rgba(26,24,20,0.08);
          border-radius: 10px;
          padding: 5px 7px 5px 5px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease;
          box-shadow: 0 4px 14px rgba(26,24,20,0.10);
          font-family: 'DM Sans', sans-serif;
          min-width: 138px;
        }
        .rm-chip:hover {
          transform: translateY(-2px);
          border-color: #C9A84C;
          box-shadow: 0 8px 22px rgba(201,168,76,0.30);
        }
        .rm-chip-icon {
          width: 22px; height: 22px; border-radius: 6px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; flex-shrink: 0;
        }
        .rm-chip-name {
          font-size: 9px; font-weight: 700; color: #1a1814;
          line-height: 1.15; letter-spacing: 0.2px;
        }
        .rm-chip-status {
          font-family: 'DM Sans', sans-serif;
          font-size: 7.5px; font-weight: 700;
          padding: 2px 5px; border-radius: 4px; color: #fff;
          letter-spacing: 0.5px; margin-top: 2px; display: inline-block;
        }
        .rm-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: rgba(26,24,20,0.93);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          line-height: 1.35;
          padding: 8px 10px;
          border-radius: 8px;
          width: 200px;
          text-align: center;
          pointer-events: none;
          box-shadow: 0 8px 24px rgba(0,0,0,0.25);
          z-index: 50;
        }
        .rm-tooltip:after {
          content: '';
          position: absolute;
          top: 100%; left: 50%;
          transform: translateX(-50%);
          border: 5px solid transparent;
          border-top-color: rgba(26,24,20,0.93);
        }
      `}</style>

      <section
        style={{
          background: "#FAF7F0",
          padding: "48px 16px 64px",
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 28px" }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 900,
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              color: "#1a1814",
              letterSpacing: "-0.03em",
              margin: 0,
            }}
          >
            Roadmap
          </h1>
          <div
            style={{
              color: "#C9A84C",
              fontWeight: 600,
              fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
              marginTop: 6,
            }}
          >
            Your Journey to Financial Excellence
          </div>
          <p
            style={{
              color: "#7A6F60",
              fontSize: "clamp(0.82rem, 1.4vw, 0.95rem)",
              maxWidth: 520,
              margin: "10px auto 0",
              lineHeight: 1.5,
            }}
          >
            From first steps to enterprise summit — 4 major milestones, 8 intelligence suites.
          </p>
        </div>

        {/* Scene */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 1100,
            aspectRatio: "1200 / 1000",
            margin: "0 auto",
            borderRadius: 20,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(26,24,20,0.18)",
            background: skyGradient,
            transition: "background 2s ease",
          }}
        >
          {/* SVG scene */}
          <svg
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            preserveAspectRatio="xMidYMid slice"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            aria-hidden
          >
            <defs>
              {segments.map((s, i) => (
                <filter key={`f${i}`} id={`glow${i}`} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.5" />
                </filter>
              ))}
              <linearGradient id="bgMtn" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#6b5e4f" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#3a3328" stopOpacity="0.25" />
              </linearGradient>
              <linearGradient id="mainMtn" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#3a2a18" />
                <stop offset="100%" stopColor="#1f1610" />
              </linearGradient>
              <linearGradient id="mainMtnLit" x1="0" x2="1" y1="0" y2="0.6">
                <stop offset="0%" stopColor="#8B6914" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#1f1610" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hillGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4a7c2e" />
                <stop offset="100%" stopColor="#2d5016" />
              </linearGradient>
              <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#8b6f47" />
                <stop offset="100%" stopColor="#5d4928" />
              </linearGradient>
              <radialGradient id="moonGlow" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Distant background mountains */}
            <polygon points="0,720 220,420 440,720" fill="url(#bgMtn)" opacity="0.6" />
            <polygon points="320,720 560,360 800,720" fill="url(#bgMtn)" opacity="0.5" />
            <polygon points="700,720 980,400 1200,720" fill="url(#bgMtn)" opacity="0.55" />

            {/* Main mountain (low-poly faceted) */}
            <polygon points="200,820 720,90 1100,820" fill="url(#mainMtn)" />
            <polygon points="200,820 720,90 720,820" fill="url(#mainMtnLit)" />
            {/* Facet lines */}
            <polyline
              points="720,90 600,360 480,560 360,720 200,820"
              fill="none"
              stroke="#1A1008"
              strokeWidth="1.2"
              opacity="0.35"
            />
            <polyline
              points="720,90 820,300 920,520 1020,700 1100,820"
              fill="none"
              stroke="#1A1008"
              strokeWidth="1.2"
              opacity="0.25"
            />
            {/* Snow cap */}
            <path
              d="M 670 200 L 695 165 L 712 178 L 720 90 L 730 178 L 748 165 L 772 200 L 752 215 L 732 198 L 720 215 L 706 198 L 686 215 Z"
              fill="#F4EDDA"
              style={{ filter: "drop-shadow(0 -6px 18px rgba(244,237,218,0.6))" }}
            />

            {/* Small starting hill */}
            <path
              d="M 0 820 Q 100 690 200 760 L 280 820 Z"
              fill="url(#hillGrad)"
            />

            {/* Mountain slope trees */}
            {[
              { x: 300, y: 680, s: 0.7 },
              { x: 870, y: 650, s: 0.8 },
              { x: 460, y: 580, s: 0.6 },
              { x: 940, y: 540, s: 0.55 },
            ].map((t, i) => (
              <g
                key={`mt${i}`}
                transform={`translate(${t.x},${t.y}) scale(${t.s})`}
                style={{
                  transformOrigin: `${t.x}px ${t.y}px`,
                  animation: `rm-tree-sway 4s ease-in-out ${i * 0.4}s infinite`,
                }}
              >
                <rect x="-2" y="0" width="4" height="10" fill="#6B4226" />
                <polygon points="-10,0 10,0 0,-26" fill="#1F3D0E" />
              </g>
            ))}

            {/* Ground strip */}
            <rect x="0" y="900" width={VB_W} height="100" fill="url(#ground)" />
            <rect x="0" y="895" width={VB_W} height="10" fill="#3a6b24" />
            {/* Grass tufts */}
            {Array.from({ length: 22 }).map((_, i) => {
              const x = 30 + i * 55;
              return (
                <path
                  key={`g${i}`}
                  d={`M ${x} 900 L ${x - 3} 892 M ${x} 900 L ${x} 890 M ${x} 900 L ${x + 3} 892`}
                  stroke="#2d5016"
                  strokeWidth="1.4"
                />
              );
            })}

            {/* Ground & hill trees */}
            {[
              { x: 60, y: 760, h: 32 },
              { x: 110, y: 740, h: 28 },
              { x: 150, y: 770, h: 24 },
              { x: 40, y: 895, h: 34 },
              { x: 230, y: 895, h: 30 },
              { x: 540, y: 895, h: 28 },
              { x: 760, y: 895, h: 32 },
              { x: 1000, y: 895, h: 26 },
              { x: 1130, y: 895, h: 30 },
            ].map((t, i) => (
              <g
                key={`gt${i}`}
                transform={`translate(${t.x},${t.y})`}
                style={{
                  transformOrigin: `${t.x}px ${t.y}px`,
                  animation: `rm-tree-sway 4s ease-in-out ${(i % 5) * 0.5}s infinite`,
                }}
              >
                <rect x="-2" y="-4" width="4" height="8" fill="#6B4226" />
                <polygon points={`-9,-4 9,-4 0,${-4 - t.h}`} fill="#2D5016" />
              </g>
            ))}

            {/* Path segments with glow */}
            {segments.map((s, i) => (
              <g key={`seg${i}`}>
                <path
                  d={s.d}
                  stroke={s.color}
                  strokeWidth={s.width + 2}
                  fill="none"
                  opacity="0.35"
                  filter={`url(#glow${i})`}
                  strokeLinecap="round"
                />
                <path
                  d={s.d}
                  stroke={s.color}
                  strokeWidth={s.width}
                  strokeDasharray="8 5"
                  fill="none"
                  strokeLinecap="round"
                  style={{ animation: "rm-dash 2s linear infinite" }}
                />
              </g>
            ))}

            {/* Waypoint dots + pulse rings on live stops */}
            {[...STOPS, { id: 5, x: SUMMIT.x, y: SUMMIT.y, pathColor: "#C9A84C", products: [] as Product[] } as Stop].map(
              (s, i) => {
                const isLive = s.products.some((p) => resolveProduct(p).status === "live");
                return (
                  <g key={`wp${s.id}`}>
                    {isLive && (
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r="7"
                        fill="none"
                        stroke={s.pathColor}
                        strokeWidth="2"
                        style={{
                          animation: `rm-pulse-ring 2.5s ease-out ${i * 0.4}s infinite`,
                          transformOrigin: `${s.x}px ${s.y}px`,
                        }}
                      />
                    )}
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r="7"
                      fill={s.pathColor}
                      stroke="#fff"
                      strokeWidth="2.5"
                    />
                  </g>
                );
              }
            )}

            {/* Mini flag at Stop 4 */}
            <g
              transform={`translate(${STOPS[3].x + 8},${STOPS[3].y - 18})`}
              style={{
                transformOrigin: `${STOPS[3].x + 8}px ${STOPS[3].y}px`,
              }}
            >
              <line x1="0" y1="0" x2="0" y2="18" stroke="#8B6914" strokeWidth="2" />
              <g
                style={{
                  transformOrigin: "0px 2px",
                  animation: "rm-mini-flag-wave 2s ease-in-out infinite",
                }}
              >
                <polygon points="0,2 14,6 0,10" fill="#C9A84C" />
              </g>
            </g>

            {/* Summit flag */}
            <g transform={`translate(${SUMMIT.x},${SUMMIT.y - 50})`}>
              <line x1="0" y1="0" x2="0" y2="50" stroke="#8B6914" strokeWidth="3" />
              <g
                style={{
                  transformOrigin: "0px 4px",
                  animation: "rm-flag-wave 2s ease-in-out infinite",
                }}
              >
                <polygon points="0,2 28,12 0,22" fill="#C9A84C" stroke="#8B6914" strokeWidth="1" />
              </g>
            </g>

            {/* Climber at Stop 1 */}
            <g
              transform={`translate(${STOPS[0].x - 32},${STOPS[0].y - 38})`}
              style={{ animation: "rm-climber-bob 2s ease-in-out infinite" }}
            >
              {/* backpack */}
              <rect x="3" y="14" width="12" height="10" rx="2" fill="#8B4513" />
              {/* body */}
              <rect x="6" y="12" width="10" height="13" rx="3" fill="#C0392B" />
              {/* head */}
              <circle cx="11" cy="8" r="5" fill="#F5D0A9" />
              {/* hat */}
              <path d="M5 7 Q 11 0 17 7 L 17 8 L 5 8 Z" fill="#5D4E37" />
              {/* legs */}
              <line x1="9" y1="25" x2="8" y2="35" stroke="#2C3E50" strokeWidth="2.5" />
              <line x1="13" y1="25" x2="14" y2="35" stroke="#2C3E50" strokeWidth="2.5" />
              {/* boots */}
              <rect x="6" y="34" width="5" height="3" fill="#5D4E37" />
              <rect x="12" y="34" width="5" height="3" fill="#5D4E37" />
              {/* walking stick */}
              <line
                x1="18"
                y1="14"
                x2="22"
                y2="36"
                stroke="#8B7355"
                strokeWidth="1.8"
                strokeLinecap="round"
                style={{
                  transformOrigin: "22px 36px",
                  animation: "rm-stick-sway 3s ease-in-out infinite",
                }}
              />
            </g>

            {/* Background birds */}
            {[
              { y: 180, dur: 24, delay: 0, scale: 1, op: 0.45 },
              { y: 240, dur: 28, delay: 6, scale: 0.9, op: 0.5 },
              { y: 140, dur: 22, delay: 11, scale: 1.1, op: 0.4 },
              { y: 300, dur: 26, delay: 3, scale: 0.85, op: 0.45 },
              { y: 200, dur: 20, delay: 14, scale: 1, op: 0.4 },
            ].map((b, i) => (
              <g
                key={`bb${i}`}
                style={{
                  animation: `rm-bird-fly ${b.dur}s linear ${b.delay}s infinite`,
                  opacity: b.op,
                }}
              >
                <g transform={`translate(0,${b.y}) scale(${b.scale})`}>
                  <path
                    d="M 0 0 L 6 -4 L 12 0"
                    stroke="#5D4E37"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                  />
                </g>
              </g>
            ))}
          </svg>

          {/* HTML overlays — sun, moon, clouds, chips, foreground birds */}

          {/* Sun */}
          <div
            style={{
              position: "absolute",
              left: `${sunPosition.x}%`,
              top: `${sunPosition.y}%`,
              width: 60,
              height: 60,
              transform: "translate(-50%,-50%)",
              opacity: sunPosition.opacity,
              transition: "left 1s ease-out, top 1s ease-out, opacity 2s ease",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                animation: "rm-rays-rotate 8s linear infinite",
              }}
            >
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 2,
                    height: 30,
                    background: "#FFD93D",
                    transformOrigin: "center 0",
                    transform: `translate(-50%,0) rotate(${i * 36}deg) translateY(38px)`,
                    opacity: 0.8,
                    borderRadius: 2,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "#FFD93D",
                animation: "rm-sun-glow 3s ease-in-out infinite",
              }}
            />
          </div>

          {/* Moon */}
          <div
            style={{
              position: "absolute",
              left: `${moonPosition.x}%`,
              top: `${moonPosition.y}%`,
              width: 45,
              height: 45,
              transform: "translate(-50%,-50%)",
              opacity: moonPosition.opacity,
              transition: "left 1s ease-out, top 1s ease-out, opacity 2s ease",
              pointerEvents: "none",
              zIndex: 1,
              filter: "drop-shadow(0 0 20px rgba(255,255,255,0.6))",
            }}
          >
            <svg viewBox="-22 -22 44 44" width="100%" height="100%">
              <circle cx="0" cy="0" r="20" fill="url(#moonGlow)" />
              <circle cx="0" cy="0" r="18" fill="#F4F1DE" />
              <circle cx="-8" cy="-5" r="4" fill="#D4C9BC" opacity="0.5" />
              <circle cx="6" cy="3" r="3" fill="#D4C9BC" opacity="0.6" />
              <circle cx="-3" cy="8" r="5" fill="#D4C9BC" opacity="0.4" />
            </svg>
          </div>

          {/* Back clouds */}
          {[
            { y: 12, dur: 90, delay: 0, w: 70, scale: 1 },
            { y: 22, dur: 100, delay: 30, w: 80, scale: 0.9 },
            { y: 8, dur: 85, delay: 55, w: 60, scale: 1.1 },
          ].map((c, i) => (
            <div
              key={`bc${i}`}
              style={{
                position: "absolute",
                top: `${c.y}%`,
                left: 0,
                width: "100%",
                pointerEvents: "none",
                zIndex: 1,
                opacity: isNight ? 0.35 : 0.5,
                transition: "opacity 2s ease",
                animation: `rm-cloud-drift-slow ${c.dur}s linear ${-c.delay}s infinite`,
              }}
            >
              <div style={{ animation: `rm-cloud-pulse 6s ease-in-out ${i * 1.5}s infinite` }}>
                <Cloud w={c.w} />
              </div>
            </div>
          ))}

          {/* Mid clouds */}
          {[
            { y: 28, dur: 60, delay: 0, w: 95 },
            { y: 36, dur: 55, delay: 20, w: 110 },
            { y: 18, dur: 65, delay: 40, w: 85 },
            { y: 44, dur: 58, delay: 12, w: 100 },
          ].map((c, i) => (
            <div
              key={`mc${i}`}
              style={{
                position: "absolute",
                top: `${c.y}%`,
                left: 0,
                width: "100%",
                pointerEvents: "none",
                zIndex: 3,
                opacity: isNight ? 0.5 : 0.7,
                transition: "opacity 2s ease",
                animation: `rm-cloud-drift-mid ${c.dur}s linear ${-c.delay}s infinite`,
              }}
            >
              <div style={{ animation: `rm-cloud-pulse 6s ease-in-out ${i * 2}s infinite` }}>
                <Cloud w={c.w} />
              </div>
            </div>
          ))}

          {/* Front clouds */}
          {[
            { y: 32, dur: 45, delay: 0, w: 130 },
            { y: 50, dur: 50, delay: 18, w: 115 },
            { y: 24, dur: 42, delay: 32, w: 140 },
          ].map((c, i) => (
            <div
              key={`fc${i}`}
              style={{
                position: "absolute",
                top: `${c.y}%`,
                left: 0,
                width: "100%",
                pointerEvents: "none",
                zIndex: 6,
                opacity: isNight ? 0.6 : 0.85,
                transition: "opacity 2s ease",
                animation: `rm-cloud-drift-fast ${c.dur}s linear ${-c.delay}s infinite`,
              }}
            >
              <div style={{ animation: `rm-cloud-pulse 6s ease-in-out ${i * 1.7}s infinite` }}>
                <Cloud w={c.w} />
              </div>
            </div>
          ))}

          {/* Foreground birds (above everything) */}
          {[
            { y: 42, dur: 34, delay: 0 },
            { y: 48, dur: 38, delay: 16 },
          ].map((b, i) => (
            <div
              key={`fb${i}`}
              style={{
                position: "absolute",
                top: `${b.y}%`,
                left: 0,
                width: "100%",
                pointerEvents: "none",
                zIndex: 9,
                opacity: 0.4,
                animation: `rm-bird-fly ${b.dur}s linear ${-b.delay}s infinite`,
              }}
            >
              <svg width="14" height="8" viewBox="0 0 14 8">
                <path
                  d="M 0 6 L 7 0 L 14 6"
                  stroke="#5D4E37"
                  strokeWidth="1.6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ))}

          {/* "START HERE" label near climber */}
          <div
            style={{
              position: "absolute",
              left: `${pctX(STOPS[0].x - 110)}%`,
              top: `${pctY(STOPS[0].y - 60)}%`,
              background: "#fff",
              border: "1.5px solid #C9A84C",
              borderRadius: 8,
              padding: "4px 8px",
              fontSize: 10,
              fontWeight: 700,
              color: "#1a1814",
              letterSpacing: 0.5,
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              zIndex: 7,
              pointerEvents: "none",
            }}
          >
            START HERE →
          </div>

          {/* Product chips */}
          {STOPS.map((stop) => {
            const offsetX = stop.side === "right" ? 28 : -150;
            return stop.products.map((rawP, idx) => {
              const p = resolveProduct(rawP);
              const yOffset = idx * 48 - 22;
              const left = pctX(stop.x + offsetX);
              const top = pctY(stop.y + yOffset);
              const key = `${stop.id}-${idx}`;
              const showTip = hoveredChip === key;
              return (
                <div
                  key={key}
                  style={{
                    position: "absolute",
                    left: `${left}%`,
                    top: `${top}%`,
                    zIndex: 8,
                  }}
                >
                  {/* dashed connector */}
                  <svg
                    style={{
                      position: "absolute",
                      left: stop.side === "right" ? -22 : 142,
                      top: 14,
                      width: 24,
                      height: 2,
                      overflow: "visible",
                    }}
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="24"
                      y2="0"
                      stroke="#C9A84C"
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      opacity="0.7"
                    />
                  </svg>
                  <button
                    type="button"
                    className="rm-chip"
                    onMouseEnter={() => setHoveredChip(key)}
                    onMouseLeave={() => setHoveredChip(null)}
                    onClick={() => {
                      /* placeholder for modal */
                    }}
                    style={{ position: "relative" }}
                  >
                    <div
                      className="rm-chip-icon"
                      style={{ background: p.color }}
                    >
                      {p.emoji}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span className="rm-chip-name">{p.name}</span>
                      <span
                        className="rm-chip-status"
                        style={{ background: STATUS_COLOR[p.status] }}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    {showTip && (
                      <div className="rm-tooltip">{p.desc}</div>
                    )}
                  </button>
                </div>
              );
            });
          })}

          {/* Enterprise Summit label */}
          <div
            style={{
              position: "absolute",
              left: `${pctX(SUMMIT.x)}%`,
              top: `${pctY(SUMMIT.y + 30)}%`,
              transform: "translateX(-50%)",
              fontFamily: "'Playfair Display', serif",
              fontWeight: 700,
              fontSize: "clamp(0.85rem, 1.6vw, 1.05rem)",
              color: "#1a1814",
              background: "rgba(255,255,255,0.85)",
              padding: "4px 10px",
              borderRadius: 6,
              border: "1px solid #C9A84C",
              zIndex: 7,
              whiteSpace: "nowrap",
            }}
          >
            Enterprise System
          </div>
        </div>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "2.5rem",
            marginTop: 28,
            flexWrap: "wrap",
            color: "#7A6F60",
            fontSize: "clamp(0.78rem, 1.2vw, 0.9rem)",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <LegendItem color="#34C759" label="Live today" />
          <LegendItem color="#FF9F0A" label="In Beta" />
          <LegendItem color="#C9A84C" label="Coming soon" />
        </div>
      </section>
    </>
  );
};

// ───────────────── Cloud ─────────────────
const Cloud: React.FC<{ w: number }> = ({ w }) => (
  <svg width={w} height={w * 0.55} viewBox="0 0 100 55" style={{ display: "block" }}>
    <ellipse cx="25" cy="35" rx="22" ry="14" fill="#fff" />
    <ellipse cx="50" cy="28" rx="26" ry="18" fill="#fff" />
    <ellipse cx="75" cy="34" rx="20" ry="13" fill="#fff" />
    <ellipse cx="40" cy="40" rx="18" ry="10" fill="#fff" />
    <ellipse cx="62" cy="40" rx="18" ry="10" fill="#fff" />
  </svg>
);

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
      }}
    />
    {label}
  </div>
);

export default Roadmap;
