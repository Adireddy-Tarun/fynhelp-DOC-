import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Full-page animated mountain roadmap.
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
  bg: string;
  desc: string;
}
interface Stop {
  id: number;
  x: number;
  y: number;
  status: Status;
  side: "left" | "right";
  products: Product[];
}

const VBW = 1200;
const VBH = 1000;

const STOPS: Stop[] = [
  {
    id: 1,
    x: 180,
    y: 750,
    status: "live",
    side: "right",
    products: [
      { name: "Liquidity Intelligence", emoji: "💧", bg: "#3B82F6", desc: "Cash flow tracking, runway forecast, working capital intelligence." },
      { name: "AI CFO Nidhi", emoji: "🤖", bg: "#8B6914", desc: "Conversational CFO assistant trained on Indian SME finance." },
    ],
  },
  {
    id: 2,
    x: 504,
    y: 620,
    status: "beta",
    side: "left",
    products: [
      { name: "Revenue Intelligence", emoji: "📊", bg: "#10B981", desc: "Customer cohorts, revenue mix, growth signals in real time." },
      { name: "Cost Intelligence", emoji: "💰", bg: "#F59E0B", desc: "Vendor and category-level cost analytics with anomaly alerts." },
    ],
  },
  {
    id: 3,
    x: 696,
    y: 480,
    status: "soon",
    side: "right",
    products: [
      { name: "GST & Tax Intelligence", emoji: "🏛️", bg: "#C41E1E", desc: "GST returns, ITC reconciliation, TDS tracking — automated." },
      { name: "CA Partner Ecosystem", emoji: "🤝", bg: "#8B6914", desc: "Bring your CA into the loop with shared workspaces and filings." },
    ],
  },
  {
    id: 4,
    x: 540,
    y: 320,
    status: "soon",
    side: "left",
    products: [
      { name: "HR Intelligence", emoji: "👥", bg: "#6366F1", desc: "Payroll planning, headcount cost modelling, compliance." },
      { name: "Market & Growth", emoji: "🌍", bg: "#0EA5E9", desc: "Market sizing, competitor signals, growth opportunity scoring." },
    ],
  },
];
const SUMMIT = { x: 624, y: 120 };

// Mountain center band where the path "disappears" behind the peak.
const HIDE_X1 = 540;
const HIDE_X2 = 720;

/** Build a structured staircase from a→b: a sequence of step rectangles
 *  going horizontally then vertically (like a flight of stairs). */
interface Step {
  x: number;
  y: number;
  w: number;
  h: number;
}
function buildStairs(
  a: { x: number; y: number },
  b: { x: number; y: number },
  stepCount = 6,
): { steps: Step[]; treadH: number; riserW: number } {
  const dx = b.x - a.x;
  const dy = b.y - a.y; // negative going up
  const dir = dx >= 0 ? 1 : -1;
  const treadW = Math.abs(dx) / stepCount;
  const riser = Math.abs(dy) / stepCount;
  const treadH = 6; // step thickness
  const steps: Step[] = [];
  for (let i = 0; i < stepCount; i++) {
    // each step: horizontal tread then vertical riser
    const x0 = a.x + dir * treadW * i;
    const y0 = a.y - riser * (i + 1);
    steps.push({
      x: dir > 0 ? x0 : x0 - treadW,
      y: y0,
      w: treadW,
      h: treadH,
    });
  }
  return { steps, treadH, riserW: 6 };
}

// Path starts from the ground (bottom of island) up to first stop, then through stops.
const GROUND_START = { x: 100, y: 905 };
const SEGMENTS: { from: { x: number; y: number }; to: { x: number; y: number }; status: Status }[] = [
  { from: GROUND_START, to: STOPS[0], status: "live" },
  { from: STOPS[0], to: STOPS[1], status: "live" },
  { from: STOPS[1], to: STOPS[2], status: "beta" },
  { from: STOPS[2], to: STOPS[3], status: "soon" },
  { from: STOPS[3], to: SUMMIT, status: "soon" },
];

type DbStatus = "live" | "coming_soon";
interface DbStop {
  name: string;
  status: DbStatus;
  description: string;
}

const dbStatusToChipStatus = (s: DbStatus): Status =>
  s === "live" ? "live" : "soon";

/** Normalize names so DB rows match in-scene product names regardless of emoji prefix. */
const normalizeName = (n: string) =>
  n
    .replace(/^[^\p{L}\p{N}]+/u, "") // strip leading emoji/punctuation
    .trim()
    .toLowerCase();

const Roadmap: React.FC = () => {
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);
  const [overrides, setOverrides] = useState<Record<string, DbStop>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("roadmap_stops")
        .select("name, status, description")
        .order("sort_order", { ascending: true });
      if (cancelled || error || !data) return;
      const map: Record<string, DbStop> = {};
      for (const row of data as DbStop[]) {
        map[normalizeName(row.name)] = row;
      }
      setOverrides(map);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const resolveProduct = (p: Product, fallback: Status) => {
    const o = overrides[normalizeName(p.name)];
    return {
      status: o ? dbStatusToChipStatus(o.status) : fallback,
      desc: o?.description || p.desc,
    };
  };

  return (
    <section className="roadmap-root">
      <header className="roadmap-header">
        <h1 className="roadmap-title">Roadmap</h1>
        <div className="roadmap-subtitle">Your Journey to Financial Excellence</div>
        <p className="roadmap-desc">
          From first steps to enterprise summit — 4 major milestones, 8 intelligence suites
        </p>
      </header>

      <div className="roadmap-scene">
        <div className="sky-bg" aria-hidden />

        <svg
          className="scene-svg"
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id="hill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#C4B89C" />
              <stop offset="100%" stopColor="#A89B7E" />
            </linearGradient>
            <linearGradient id="rockA" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#D6D0C6" />
              <stop offset="100%" stopColor="#A5A098" />
            </linearGradient>
            <linearGradient id="rockB" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#C2BCB2" />
              <stop offset="100%" stopColor="#8E8880" />
            </linearGradient>
            <linearGradient id="rockShadow" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#9C968D" />
              <stop offset="100%" stopColor="#6E6860" />
            </linearGradient>
            <linearGradient id="snow" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F5F2EC" />
            </linearGradient>
            <radialGradient id="sunBody" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%" stopColor="#FFEB7A" />
              <stop offset="60%" stopColor="#FFD93D" />
              <stop offset="100%" stopColor="#FFA500" stopOpacity="0.6" />
            </radialGradient>

            {(["live", "beta", "soon"] as Status[]).map((s) => (
              <filter key={s} id={`glow-${s}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Back clouds (behind mountain) */}
          <g className="clouds clouds-back">
            <Cloud x={120} y={140} scale={0.7} dur={75} delay={-10} />
            <Cloud x={780} y={90} scale={0.6} dur={88} delay={-40} />
            <Cloud x={500} y={200} scale={0.55} dur={70} delay={-25} />
            <Cloud x={950} y={170} scale={0.65} dur={82} delay={-55} />
          </g>

          {/* Sun + moon */}
          <g className="sun-wrap" aria-hidden>
            <g className="sun">
              <g className="sun-rays">
                {Array.from({ length: 12 }).map((_, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1="-44"
                    x2="0"
                    y2="-74"
                    stroke="#FFD93D"
                    strokeWidth="2"
                    strokeLinecap="round"
                    transform={`rotate(${i * 30})`}
                    style={{ animation: `ray-pulse 2s ease-in-out ${i * 0.15}s infinite` }}
                  />
                ))}
              </g>
              <circle r="30" fill="url(#sunBody)" />
              <circle r="46" fill="#FFA500" opacity="0.18" />
            </g>
          </g>
          <g className="moon-wrap" aria-hidden>
            <g className="moon">
              <circle r="48" fill="#F4F1DE" opacity="0.18" />
              <circle r="25" fill="#F4F1DE" />
              <circle r="22" cx="-7" fill="#0F0A1E" opacity="0.55" />
            </g>
          </g>

          {/* Background mountains */}
          <g opacity="0.35">
            <polygon points="0,900 220,640 440,900" fill="#C5BFB5" />
            <polygon points="380,900 600,580 820,900" fill="#B8B2A8" />
            <polygon points="780,900 1000,620 1200,900" fill="#C5BFB5" />
          </g>

          {/* Main mountain — many low-poly facets (base extended down to ground) */}
          <g>
            {/* base silhouette */}
            <polygon points="180,905 624,120 1080,905" fill="url(#rockA)" />
            {/* shadow side (right) */}
            <polygon points="624,120 1080,905 624,905" fill="url(#rockShadow)" opacity="0.9" />
            {/* facet planes */}
            <polygon points="180,905 624,120 380,905" fill="url(#rockB)" opacity="0.85" />
            <polygon points="380,905 624,120 520,905" fill="url(#rockA)" opacity="0.7" />
            <polygon points="624,120 760,905 880,905" fill="url(#rockShadow)" opacity="0.6" />
            <polygon points="624,120 520,905 700,905" fill="url(#rockB)" opacity="0.5" />
            <polygon points="624,120 880,905 1080,905" fill="url(#rockShadow)" opacity="0.45" />
            {/* ridge lines */}
            <polyline points="280,780 480,520 560,420" stroke="#1A1008" strokeWidth="1.2" opacity="0.18" fill="none" />
            <polyline points="780,760 700,500 640,360" stroke="#1A1008" strokeWidth="1.2" opacity="0.18" fill="none" />
            {/* snow cap (jagged) */}
            <polygon
              points="540,260 580,210 600,225 624,120 648,225 670,210 710,260 685,275 660,255 638,275 614,255 590,275 566,255"
              fill="url(#snow)"
              style={{ filter: "drop-shadow(0 -6px 18px rgba(255,255,255,0.4))" }}
            />
            <polygon points="568,245 595,235 580,255" fill="#FFFFFF" opacity="0.9" />
            <polygon points="660,245 685,235 670,255" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Small starting hill (left) — sits on the island */}
          <g>
            <polygon points="40,905 90,805 160,775 230,795 280,905" fill="url(#hill)" />
            <polygon points="90,805 160,775 130,835" fill="#B0A488" opacity="0.7" />
            <polygon points="160,775 230,795 200,845" fill="#9C9078" opacity="0.6" />
            {/* grass strip top */}
            <path d="M 40 905 Q 160 845 280 905 Z" fill="#8B9E6B" opacity="0.85" />
          </g>

          {/* Ocean (full-width water behind island) */}
          <g>
            <defs>
              <linearGradient id="oceanGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#3A8FB7" />
                <stop offset="100%" stopColor="#1E5A7A" />
              </linearGradient>
            </defs>
            <rect x="0" y="900" width={VBW} height={100} fill="url(#oceanGrad)" />
            {/* wave highlights */}
            <path d="M 0 920 Q 60 914 120 920 T 240 920 T 360 920 T 480 920 T 600 920 T 720 920 T 840 920 T 960 920 T 1080 920 T 1200 920" stroke="#9CC9DD" strokeWidth="1.4" fill="none" opacity="0.7" />
            <path d="M 0 945 Q 60 939 120 945 T 240 945 T 360 945 T 480 945 T 600 945 T 720 945 T 840 945 T 960 945 T 1080 945 T 1200 945" stroke="#9CC9DD" strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M 0 970 Q 60 964 120 970 T 240 970 T 360 970 T 480 970 T 600 970 T 720 970 T 840 970 T 960 970 T 1080 970 T 1200 970" stroke="#9CC9DD" strokeWidth="1" fill="none" opacity="0.4" />
          </g>

          {/* Island (the land the mountain stands on) */}
          <g>
            <path
              d="M 0 905 Q 90 895 180 902 Q 360 880 624 882 Q 880 884 1080 902 Q 1140 906 1200 905 L 1200 940 Q 1100 960 900 950 Q 624 938 360 952 Q 160 962 0 945 Z"
              fill="#C4B89C"
            />
            {/* sandy/grass top edge */}
            <path d="M 0 905 Q 90 895 180 902 Q 360 880 624 882 Q 880 884 1080 902 Q 1140 906 1200 905 L 1200 912 Q 1100 905 900 908 Q 624 902 360 910 Q 160 916 0 912 Z" fill="#8B9E6B" opacity="0.9" />
          </g>
          {/* grass tufts on island */}
          {Array.from({ length: 18 }).map((_, i) => {
            const x = 30 + i * 65;
            return (
              <path
                key={i}
                d={`M ${x} 908 q 3 -8 6 0 M ${x + 3} 908 q 0 -10 3 -2`}
                stroke="#5C7042"
                strokeWidth="1.2"
                fill="none"
              />
            );
          })}

          {/* Trees */}
          <g className="trees">
            {[
              { x: 70, y: 890, s: 0.6, d: 0 },
              { x: 130, y: 885, s: 0.7, d: 0.3 },
              { x: 210, y: 885, s: 0.55, d: 0.6 },
              { x: 245, y: 895, s: 0.5, d: 0.9 },
              { x: 340, y: 905, s: 0.9, d: 0.2 },
              { x: 410, y: 905, s: 0.7, d: 0.5 },
              { x: 760, y: 905, s: 1.0, d: 0.1 },
              { x: 850, y: 905, s: 0.8, d: 0.7 },
              { x: 940, y: 905, s: 0.9, d: 1.1 },
              { x: 1050, y: 905, s: 1.1, d: 0.4 },
              { x: 1140, y: 905, s: 0.75, d: 0.9 },
              { x: 320, y: 855, s: 0.45, d: 1.3 },
            ].map((t, i) => (
              <g
                key={i}
                transform={`translate(${t.x} ${t.y}) scale(${t.s})`}
                style={{
                  transformOrigin: `${t.x}px ${t.y}px`,
                  animation: `tree-sway 4s ease-in-out ${t.d}s infinite`,
                }}
              >
                <rect x="-3" y="0" width="6" height="14" fill="#6B4226" />
                <polygon points="-14,2 14,2 0,-30" fill="#2D5016" />
                <polygon points="-12,-12 12,-12 0,-38" fill="#3B6B1E" />
                <polygon points="-10,-26 10,-26 0,-46" fill="#4A7E26" />
              </g>
            ))}
          </g>

          {/* Path segments — drawn split for behind-mountain effect */}
          <g className="path-group">
            {SEGMENTS.flatMap((seg, idx) => {
              const paths = buildSegment(seg.from, seg.to);
              const color = STATUS_COLOR[seg.status];
              const sw = seg.status === "live" ? 4 : seg.status === "beta" ? 3.5 : 3;
              return paths.map((d, k) => (
                <path
                  key={`seg-${idx}-${k}`}
                  d={d}
                  stroke={color}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  strokeDasharray="8 5"
                  fill="none"
                  filter={`url(#glow-${seg.status})`}
                  style={{ animation: "path-dash 2.5s linear infinite" }}
                />
              ));
            })}
          </g>

          {/* Waypoints */}
          <g>
            {[...STOPS, { ...SUMMIT, id: 5, status: "soon" as Status }].map((w) => {
              const c = STATUS_COLOR[w.status];
              return (
                <g key={`wp-${w.id}`} transform={`translate(${w.x} ${w.y})`}>
                  {w.status === "live" && (
                    <circle r="7" fill="none" stroke={c} strokeWidth="2">
                      <animate attributeName="r" values="7;15;7" dur="2.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle r="7" fill={c} stroke="#FFFFFF" strokeWidth="2.5" />
                </g>
              );
            })}
          </g>

          {/* Summit flag */}
          <g transform={`translate(${SUMMIT.x} ${SUMMIT.y})`}>
            <line x1="0" y1="0" x2="0" y2="-60" stroke="#8B6914" strokeWidth="2.5" />
            <g style={{ transformOrigin: "0px -55px", animation: "flag-wave 2s ease-in-out infinite" }}>
              <polygon points="0,-58 38,-50 0,-42" fill="#C9A84C" />
              <polygon points="0,-58 38,-50 0,-50" fill="#A78836" />
            </g>
            <text
              x="0"
              y="22"
              textAnchor="middle"
              fontFamily="'Playfair Display', serif"
              fontSize="14"
              fontWeight={700}
              fill="#1A1008"
            >
              Enterprise System
            </text>
          </g>

          {/* Climber at Stop 1 */}
          <g
            transform={`translate(${STOPS[0].x - 38} ${STOPS[0].y - 56})`}
            style={{ animation: "climber-bob 2s ease-in-out infinite" }}
          >
            {/* backpack */}
            <rect x="11" y="22" width="14" height="16" rx="3" fill="#8B6914" />
            {/* body */}
            <path d="M18 18 C 14 18 12 22 13 28 L 13 38 C 13 40 15 41 17 41 L 27 41 C 29 41 31 40 31 38 L 31 28 C 32 22 30 18 26 18 Z" fill="#C41E1E" />
            {/* head */}
            <circle cx="22" cy="13" r="6" fill="#E8C9A1" />
            {/* hat */}
            <path d="M16 12 C 16 8 18 6 22 6 C 26 6 28 8 28 12 L 28 13 L 16 13 Z" fill="#6B4226" />
            <ellipse cx="22" cy="13" rx="7" ry="1.2" fill="#6B4226" />
            {/* legs */}
            <path d="M14 41 L 16 56 L 20 56 L 21 43 Z" fill="#1A1008" />
            <path d="M30 41 L 28 56 L 24 56 L 23 43 Z" fill="#1A1008" />
            {/* stick */}
            <line x1="34" y1="20" x2="40" y2="50" stroke="#8B6914" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          {/* START HERE label */}
          <g transform={`translate(${STOPS[0].x - 110} ${STOPS[0].y - 70})`}>
            <rect x="0" y="0" width="78" height="22" rx="11" fill="#1A1008" />
            <text x="39" y="15" textAnchor="middle" fontFamily="'DM Sans', sans-serif" fontWeight={700} fontSize="10" fill="#F4EDDA" letterSpacing="1">
              START HERE
            </text>
            <path d="M 78 11 L 92 11" stroke="#1A1008" strokeWidth="1.5" />
            <polygon points="92,7 100,11 92,15" fill="#1A1008" />
          </g>

          {/* Front clouds (in front of mountain) */}
          <g className="clouds clouds-front">
            <Cloud x={300} y={260} scale={1.0} dur={48} delay={-5} />
            <Cloud x={680} y={340} scale={1.1} dur={55} delay={-22} />
            <Cloud x={920} y={260} scale={0.9} dur={50} delay={-12} />
            <Cloud x={150} y={400} scale={0.85} dur={58} delay={-30} />
          </g>

          {/* Birds */}
          <g className="birds">
            {[
              { y: 180, dur: 22, delay: 0 },
              { y: 260, dur: 26, delay: -8 },
              { y: 140, dur: 19, delay: -14 },
              { y: 320, dur: 24, delay: -3 },
              { y: 220, dur: 28, delay: -18 },
            ].map((b, i) => (
              <g
                key={i}
                style={{
                  animation: `bird-fly ${b.dur}s linear ${b.delay}s infinite`,
                }}
              >
                <g transform={`translate(0 ${b.y})`} opacity="0.5">
                  <path d="M 0 0 L 8 -5 L 16 0" stroke="#5D4E37" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                </g>
              </g>
            ))}
          </g>
        </svg>

        {/* Chip overlays (HTML for crisp text + hover) */}
        <div className="chip-layer">
          {STOPS.map((stop) => {
            const left = (stop.x / VBW) * 100;
            const top = (stop.y / VBH) * 100;
            const sideLeft = stop.side === "left";
            return (
              <div
                key={`chip-${stop.id}`}
                className={`chip-cluster ${sideLeft ? "side-left" : "side-right"}`}
                style={{ left: `${left}%`, top: `${top}%` }}
              >
                <div className="chip-card">
                  {stop.products.map((p, i) => {
                    const id = `${stop.id}-${i}`;
                    const isHover = hoveredChip === id;
                    const resolved = resolveProduct(p, stop.status);
                    return (
                      <button
                        key={id}
                        type="button"
                        className={`chip ${isHover ? "is-hover" : ""}`}
                        onMouseEnter={() => setHoveredChip(id)}
                        onMouseLeave={() => setHoveredChip(null)}
                        onClick={() => {
                          // TODO: open product detail modal
                        }}
                      >
                        <span className="chip-icon" style={{ background: p.bg }}>
                          {p.emoji}
                        </span>
                        <span className="chip-name">{p.name}</span>
                        <span
                          className="chip-status"
                          style={{ background: STATUS_COLOR[resolved.status] }}
                        >
                          {STATUS_LABEL[resolved.status]}
                        </span>
                        {isHover && (
                          <div className="chip-tooltip" role="tooltip">
                            <div className="chip-tooltip-title">{p.name}</div>
                            <div className="chip-tooltip-desc">{resolved.desc}</div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="roadmap-legend">
        <span className="lg-item"><span className="lg-dot" style={{ background: STATUS_COLOR.live }} />Live today</span>
        <span className="lg-item"><span className="lg-dot" style={{ background: STATUS_COLOR.beta }} />In Beta</span>
        <span className="lg-item"><span className="lg-dot" style={{ background: STATUS_COLOR.soon }} />Coming soon</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');

        .roadmap-root {
          --gold: #C9A84C;
          --green: #34C759;
          --orange: #FF9F0A;
          --ink: #1A1008;
          --beige: #F4EDDA;
          padding: 48px 24px 80px;
          background: var(--beige);
          font-family: 'DM Sans', sans-serif;
        }
        .roadmap-header { text-align: center; max-width: 880px; margin: 0 auto 32px; }
        .roadmap-title {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          color: var(--ink);
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }
        .roadmap-subtitle {
          color: var(--gold);
          font-weight: 600;
          font-size: clamp(1rem, 1.6vw, 1.2rem);
          margin-bottom: 8px;
          letter-spacing: 0.02em;
        }
        .roadmap-desc { color: #7A6F60; font-size: 0.95rem; margin: 0; }

        .roadmap-scene {
          position: relative;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          aspect-ratio: 1200 / 1000;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 24px 60px -20px rgba(26,16,8,0.25), 0 0 0 1px rgba(139,105,20,0.18);
        }

        .sky-bg {
          position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(to bottom, #FFE5D9, #FFC4A3);
          animation: sky-cycle 24s linear infinite;
        }
        @keyframes sky-cycle {
          0%   { background: linear-gradient(to bottom, #FFE5D9, #FFC4A3); }
          25%  { background: linear-gradient(to bottom, #87CEEB, #E0F6FF); }
          55%  { background: linear-gradient(to bottom, #F4A988, #6B4F8C); }
          80%  { background: linear-gradient(to bottom, #2D1B4E, #0F0A1E); }
          100% { background: linear-gradient(to bottom, #FFE5D9, #FFC4A3); }
        }

        .scene-svg { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 1; overflow: visible; }

        /* Sun & moon arcs */
        .sun-wrap { transform-origin: 0 0; animation: sun-arc 24s linear infinite; }
        .moon-wrap { transform-origin: 0 0; animation: moon-arc 24s linear infinite; opacity: 0; }
        @keyframes sun-arc {
          0%   { transform: translate(-80px, 850px); opacity: 0; }
          8%   { opacity: 1; }
          25%  { transform: translate(600px, 110px); opacity: 1; }
          42%  { transform: translate(1280px, 850px); opacity: 0; }
          100% { transform: translate(1280px, 850px); opacity: 0; }
        }
        @keyframes moon-arc {
          0%, 50%   { transform: translate(-80px, 850px); opacity: 0; }
          58%       { transform: translate(-80px, 850px); opacity: 0; }
          75%       { transform: translate(600px, 200px); opacity: 0.95; }
          92%       { transform: translate(1280px, 850px); opacity: 0; }
          100%      { transform: translate(1280px, 850px); opacity: 0; }
        }
        .sun-rays { animation: ray-spin 8s linear infinite; transform-origin: 0 0; }
        @keyframes ray-spin { to { transform: rotate(360deg); } }
        @keyframes ray-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }

        /* Cloud drifts */
        .cloud { will-change: transform; }
        @keyframes drift { from { transform: translateX(-220px); } to { transform: translateX(1420px); } }
        @keyframes cloud-pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.05); } }

        /* Birds */
        @keyframes bird-fly {
          0%   { transform: translateX(-40px); }
          100% { transform: translateX(1260px); }
        }

        /* Trees */
        @keyframes tree-sway {
          0%,100% { transform: rotate(-0.6deg); }
          50%     { transform: rotate(0.6deg); }
        }

        /* Climber */
        @keyframes climber-bob {
          0%,100% { transform: translate(${STOPS[0].x - 38}px, ${STOPS[0].y - 56}px); }
          50%     { transform: translate(${STOPS[0].x - 38}px, ${STOPS[0].y - 59}px); }
        }

        /* Flag */
        @keyframes flag-wave { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }

        /* Path dash march */
        @keyframes path-dash { to { stroke-dashoffset: -26; } }

        /* Chips */
        .chip-layer { position: absolute; inset: 0; z-index: 5; pointer-events: none; }
        .chip-cluster {
          position: absolute;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .chip-cluster.side-right { transform: translate(20px, -50%); }
        .chip-cluster.side-left  { transform: translate(calc(-100% - 20px), -50%); }
        .chip-card {
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(139,105,20,0.25);
          border-radius: 14px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          box-shadow: 0 8px 22px -8px rgba(26,16,8,0.35);
          pointer-events: auto;
        }
        .chip {
          all: unset;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 10px;
          border: 1.5px solid transparent;
          background: rgba(255,255,255,0.6);
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease;
          position: relative;
          min-width: 170px;
        }
        .chip:hover, .chip.is-hover {
          transform: translateY(-2px);
          border-color: var(--gold);
          background: #FFFFFF;
          box-shadow: 0 10px 24px -10px rgba(201,168,76,0.6);
        }
        .chip-icon {
          width: 22px; height: 22px;
          border-radius: 6px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 13px;
          color: #fff;
          flex-shrink: 0;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4);
        }
        .chip-name {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 11px;
          color: var(--ink);
          line-height: 1.1;
          flex: 1;
          letter-spacing: 0.1px;
        }
        .chip-status {
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 7px;
          color: #fff;
          padding: 3px 6px;
          border-radius: 999px;
          letter-spacing: 0.6px;
        }
        .chip-tooltip {
          position: absolute;
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--ink);
          color: var(--beige);
          padding: 10px 12px;
          border-radius: 10px;
          width: 220px;
          z-index: 20;
          box-shadow: 0 14px 30px -10px rgba(0,0,0,0.5);
          animation: tip-in .18s ease-out;
        }
        .chip-tooltip-title {
          font-weight: 700; font-size: 12px; color: var(--gold); margin-bottom: 4px;
        }
        .chip-tooltip-desc {
          font-size: 11px; line-height: 1.45; color: rgba(244,237,218,0.85);
        }
        @keyframes tip-in {
          from { opacity: 0; transform: translate(-50%, 6px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }

        .roadmap-legend {
          display: flex; justify-content: center; gap: 28px;
          margin-top: 28px; flex-wrap: wrap;
        }
        .lg-item {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--ink); font-weight: 500;
        }
        .lg-dot { width: 12px; height: 12px; border-radius: 50%; box-shadow: 0 0 0 3px rgba(255,255,255,0.6); }

        @media (max-width: 768px) {
          .chip { min-width: 130px; }
          .chip-name { font-size: 9px; }
          .clouds-back, .birds { display: none; }
          .roadmap-legend { gap: 16px; }
        }
      `}</style>
    </section>
  );
};

/** Reusable cloud (drift + gentle pulse). */
const Cloud: React.FC<{ x: number; y: number; scale: number; dur: number; delay: number }> = ({
  x,
  y,
  scale,
  dur,
  delay,
}) => (
  <g
    className="cloud"
    style={{
      animation: `drift ${dur}s linear ${delay}s infinite, cloud-pulse 8s ease-in-out infinite`,
      transformOrigin: `${x}px ${y}px`,
    }}
  >
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity="0.85">
      <ellipse cx="0" cy="0" rx="38" ry="16" fill="#FFFFFF" />
      <ellipse cx="-26" cy="6" rx="22" ry="14" fill="#FFFFFF" />
      <ellipse cx="28" cy="6" rx="24" ry="13" fill="#FFFFFF" />
      <ellipse cx="-8" cy="-10" rx="22" ry="12" fill="#FFFFFF" />
      <ellipse cx="14" cy="-8" rx="18" ry="11" fill="#FFFFFF" />
    </g>
  </g>
);

export default Roadmap;
