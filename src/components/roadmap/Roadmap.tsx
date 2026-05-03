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
const START_POINT = { x: 600, y: 870 };

// Mountain center band where the path "disappears" behind the peak.
const HIDE_X1 = 540;
const HIDE_X2 = 720;

/** Build a smooth cubic bezier from a→b. If the segment crosses the mountain
 *  center band, return TWO sub-paths with a gap so it looks like it goes behind. */
function buildSegment(
  a: { x: number; y: number },
  b: { x: number; y: number },
): string[] {
  const midY = (a.y + b.y) / 2;
  const c1x = a.x;
  const c1y = midY;
  const c2x = b.x;
  const c2y = midY;
  const fullPath = `M ${a.x} ${a.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${b.x} ${b.y}`;

  // Detect if the segment crosses the mountain center band.
  const minX = Math.min(a.x, b.x);
  const maxX = Math.max(a.x, b.x);
  if (maxX < HIDE_X1 || minX > HIDE_X2) return [fullPath];

  // Sample along the bezier to find entry/exit t-values at HIDE_X1/HIDE_X2.
  const sample = (t: number) => {
    const u = 1 - t;
    return {
      x: u * u * u * a.x + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * b.x,
      y: u * u * u * a.y + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * b.y,
    };
  };
  let entryT = -1;
  let exitT = -1;
  const STEPS = 80;
  let prev = sample(0);
  for (let i = 1; i <= STEPS; i++) {
    const t = i / STEPS;
    const cur = sample(t);
    const inside = (p: { x: number }) => p.x >= HIDE_X1 && p.x <= HIDE_X2;
    if (entryT < 0 && !inside(prev) && inside(cur)) entryT = t;
    if (entryT >= 0 && exitT < 0 && inside(prev) && !inside(cur)) exitT = t;
    prev = cur;
  }
  if (entryT < 0 || exitT < 0) return [fullPath];

  const p1 = sample(entryT);
  const p2 = sample(exitT);
  return [
    `M ${a.x} ${a.y} Q ${(a.x + p1.x) / 2} ${(a.y + p1.y) / 2 - 20}, ${p1.x} ${p1.y}`,
    `M ${p2.x} ${p2.y} Q ${(p2.x + b.x) / 2} ${(p2.y + b.y) / 2 - 20}, ${b.x} ${b.y}`,
  ];
}

const SEGMENTS: { from: { x: number; y: number }; to: { x: number; y: number }; status: Status }[] = [
  { from: START_POINT, to: STOPS[0], status: "live" },
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
            <linearGradient id="hazeGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="60%" stopColor="#E8E4D6" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#D8D4C6" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="oceanGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#5BA8C9" />
              <stop offset="40%" stopColor="#3A8FB7" />
              <stop offset="100%" stopColor="#0F3D54" />
            </linearGradient>
            <radialGradient id="oceanShine" cx="0.5" cy="0" r="0.7">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>

            {/* Island silhouette path — used by both clipPath (ocean exclusion) and visual rendering */}
            <path
              id="islandShape"
              d="M -20 940 Q 60 905 180 895 Q 360 875 624 872 Q 880 875 1040 893 Q 1140 902 1220 940 L 1220 1010 L -20 1010 Z"
            />
            <clipPath id="oceanClip" clipPathUnits="userSpaceOnUse">
              {/* Ocean rectangle MINUS island shape via even-odd fill rule */}
              <path
                d="M 0 820 L 1200 820 L 1200 1000 L 0 1000 Z M -20 940 Q 60 905 180 895 Q 360 875 624 872 Q 880 875 1040 893 Q 1140 902 1220 940 L 1220 1010 L -20 1010 Z"
                clipRule="evenodd"
              />
            </clipPath>

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

          {/* Atmospheric haze layer (depth) */}
          <g opacity="0.5">
            <rect x="0" y="380" width={VBW} height="240" fill="url(#hazeGrad)" />
          </g>

          {/* Far distant mountains (deepest, most faded) */}
          <g opacity="0.22">
            <polygon points="-50,860 180,560 420,860" fill="#A8B5C8" />
            <polygon points="320,860 560,500 800,860" fill="#9AA8BC" />
            <polygon points="700,860 940,540 1180,860" fill="#A8B5C8" />
            <polygon points="1000,860 1200,600 1260,860" fill="#94A2B8" />
          </g>

          {/* Mid-distance mountains */}
          <g opacity="0.42">
            <polygon points="0,870 220,640 440,870" fill="#B8BCB8" />
            <polygon points="380,870 600,580 820,870" fill="#A8AEAC" />
            <polygon points="780,870 1000,620 1200,870" fill="#B0B6B2" />
          </g>

          {/* Forest tree-line silhouette across mid distance */}
          <g opacity="0.35">
            <path d="M 0 855 Q 80 845 160 852 T 320 850 T 480 855 T 640 848 T 800 853 T 960 850 T 1120 855 T 1200 852 L 1200 875 L 0 875 Z" fill="#5A6B58" />
          </g>

          {/* Main mountain — sits ON the island (bases at land top y=860) */}
          <g>
            {/* base silhouette */}
            <polygon points="200,862 624,120 1060,862" fill="url(#rockA)" />
            {/* shadow side (right) */}
            <polygon points="624,120 1060,862 624,862" fill="url(#rockShadow)" opacity="0.9" />
            {/* facet planes */}
            <polygon points="200,862 624,120 380,862" fill="url(#rockB)" opacity="0.85" />
            <polygon points="380,862 624,120 520,862" fill="url(#rockA)" opacity="0.7" />
            <polygon points="624,120 760,862 880,862" fill="url(#rockShadow)" opacity="0.6" />
            <polygon points="624,120 520,862 700,862" fill="url(#rockB)" opacity="0.5" />
            <polygon points="624,120 880,862 1060,862" fill="url(#rockShadow)" opacity="0.45" />
            {/* ridge lines */}
            <polyline points="320,760 480,520 560,420" stroke="#1A1008" strokeWidth="1.2" opacity="0.18" fill="none" />
            <polyline points="760,740 700,500 640,360" stroke="#1A1008" strokeWidth="1.2" opacity="0.18" fill="none" />
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
            <polygon points="60,878 100,820 160,795 220,810 270,878" fill="url(#hill)" />
            <polygon points="100,820 160,795 135,840" fill="#B0A488" opacity="0.7" />
            <polygon points="160,795 220,810 195,845" fill="#9C9078" opacity="0.6" />
            <path d="M 60 878 Q 165 855 270 878 Z" fill="#8B9E6B" opacity="0.85" />
          </g>

          {/* Ocean (full-width water) — extends from y=820 to bottom, wraps around island */}
          <g>
            <rect x="0" y="820" width={VBW} height={180} fill="url(#oceanGrad)" />
            <rect x="0" y="820" width={VBW} height="80" fill="url(#oceanShine)" />

            {/* Distant horizon shimmer */}
            <path d="M 0 828 L 1200 828" stroke="#A8D4E5" strokeWidth="1" opacity="0.55" />

            {/* Reflection of mountains shimmering */}
            <g opacity="0.18">
              <polygon points="180,820 624,860 1080,820" fill="#1A1008" />
            </g>

            {/* Wave highlights — many lines for depth */}
            <path d="M 0 850 Q 60 846 120 850 T 240 850 T 360 850 T 480 850 T 600 850 T 720 850 T 840 850 T 960 850 T 1080 850 T 1200 850" stroke="#B8DCEC" strokeWidth="1.2" fill="none" opacity="0.5" />
            <path d="M 0 880 Q 60 874 120 880 T 240 880 T 360 880 T 480 880 T 600 880 T 720 880 T 840 880 T 960 880 T 1080 880 T 1200 880" stroke="#B8DCEC" strokeWidth="1.3" fill="none" opacity="0.55" />
            <path d="M 0 915 Q 60 908 120 915 T 240 915 T 360 915 T 480 915 T 600 915 T 720 915 T 840 915 T 960 915 T 1080 915 T 1200 915" stroke="#9CC9DD" strokeWidth="1.5" fill="none" opacity="0.6" />
            <path d="M 0 950 Q 60 942 120 950 T 240 950 T 360 950 T 480 950 T 600 950 T 720 950 T 840 950 T 960 950 T 1080 950 T 1200 950" stroke="#9CC9DD" strokeWidth="1.5" fill="none" opacity="0.55" />
            <path d="M 0 985 Q 60 977 120 985 T 240 985 T 360 985 T 480 985 T 600 985 T 720 985 T 840 985 T 960 985 T 1080 985 T 1200 985" stroke="#7FB5CC" strokeWidth="1.3" fill="none" opacity="0.5" />

            {/* Drifting wave foam line */}
            <path
              d="M -40 935 Q 80 928 200 935 T 440 935 T 680 935 T 920 935 T 1160 935 T 1400 935"
              stroke="#E8F4F9"
              strokeWidth="1.4"
              fill="none"
              opacity="0.55"
              style={{ animation: "wave-drift 14s linear infinite" }}
            />
          </g>

          {/* Island (the land the mountain stands on) — shaped like a rounded landmass with water wrapping around */}
          <g>
            {/* Underwater shadow / depth ring */}
            <path
              d="M -10 880 Q 200 855 624 850 Q 1000 855 1210 880 L 1210 905 Q 1000 920 624 915 Q 200 920 -10 905 Z"
              fill="#1A1008"
              opacity="0.18"
            />
            {/* Main land shape */}
            <path
              d="M -10 905 Q 60 870 180 866 Q 360 855 624 855 Q 880 858 1040 868 Q 1140 875 1210 905 L 1210 935 Q 1080 922 880 924 Q 624 926 380 924 Q 160 922 -10 935 Z"
              fill="#C4B89C"
            />
            {/* sandy beach edge */}
            <path
              d="M -10 905 Q 60 870 180 866 Q 360 855 624 855 Q 880 858 1040 868 Q 1140 875 1210 905 L 1210 912 Q 1080 880 880 878 Q 624 870 380 880 Q 160 884 -10 912 Z"
              fill="#E5D5A8"
              opacity="0.85"
            />
            {/* grass cap on top of land */}
            <path
              d="M 30 880 Q 200 858 624 858 Q 1000 858 1170 880 L 1170 875 Q 1000 855 624 855 Q 200 855 30 875 Z"
              fill="#8B9E6B"
              opacity="0.9"
            />
          </g>
          {/* grass tufts on island */}
          {Array.from({ length: 16 }).map((_, i) => {
            const x = 60 + i * 70;
            return (
              <path
                key={i}
                d={`M ${x} 870 q 3 -8 6 0 M ${x + 3} 870 q 0 -10 3 -2`}
                stroke="#5C7042"
                strokeWidth="1.2"
                fill="none"
              />
            );
          })}

          {/* Trees */}
          <g className="trees">
            {[
              { x: 70, y: 868, s: 0.6, d: 0 },
              { x: 130, y: 866, s: 0.7, d: 0.3 },
              { x: 245, y: 868, s: 0.5, d: 0.9 },
              { x: 340, y: 866, s: 0.9, d: 0.2 },
              { x: 410, y: 866, s: 0.7, d: 0.5 },
              { x: 760, y: 866, s: 1.0, d: 0.1 },
              { x: 850, y: 864, s: 0.8, d: 0.7 },
              { x: 940, y: 866, s: 0.9, d: 1.1 },
              { x: 1050, y: 868, s: 1.1, d: 0.4 },
              { x: 1140, y: 872, s: 0.75, d: 0.9 },
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

          {/* Climber at Stop 2 */}
          <g
            transform={`translate(${STOPS[1].x - 38} ${STOPS[1].y - 56})`}
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

          {/* Starting waypoint at the bottom */}
          <g transform={`translate(${START_POINT.x} ${START_POINT.y})`}>
            <circle r="8" fill="none" stroke={STATUS_COLOR.live} strokeWidth="2">
              <animate attributeName="r" values="8;16;8" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle r="7" fill={STATUS_COLOR.live} stroke="#FFFFFF" strokeWidth="2.5" />
          </g>

          {/* Rafts on the ocean */}
          <g className="rafts">
            {[
              { x: 80, y: 945, dur: 22, delay: 0, scale: 1 },
              { x: 360, y: 970, dur: 28, delay: -8, scale: 0.85 },
              { x: 920, y: 955, dur: 26, delay: -14, scale: 1.05 },
              { x: 1080, y: 980, dur: 32, delay: -4, scale: 0.9 },
            ].map((r, i) => (
              <g
                key={`raft-${i}`}
                style={{
                  animation: `raft-bob 4.${i + 2}s ease-in-out ${r.delay}s infinite`,
                  transformOrigin: `${r.x}px ${r.y}px`,
                }}
              >
                <g transform={`translate(${r.x} ${r.y}) scale(${r.scale})`}>
                  {/* raft logs */}
                  <rect x="-22" y="-2" width="44" height="5" rx="2" fill="#6B4226" />
                  <rect x="-22" y="-5" width="44" height="2" fill="#5C3A1F" opacity="0.7" />
                  {/* mast */}
                  <line x1="0" y1="-3" x2="0" y2="-22" stroke="#3B2613" strokeWidth="1.4" />
                  {/* sail */}
                  <path d="M 0 -22 L 14 -8 L 0 -8 Z" fill="#F4EDDA" />
                  <path d="M 0 -22 L 14 -8 L 0 -8 Z" fill="#C9A84C" opacity="0.25" />
                  {/* reflection in water */}
                  <ellipse cx="0" cy="6" rx="20" ry="2" fill="#1A1008" opacity="0.18" />
                </g>
              </g>
            ))}
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
          0%,100% { transform: translate(${STOPS[1].x - 38}px, ${STOPS[1].y - 56}px); }
          50%     { transform: translate(${STOPS[1].x - 38}px, ${STOPS[1].y - 59}px); }
        }

        /* Flag */
        @keyframes flag-wave { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }

        /* Path dash march */
        @keyframes path-dash { to { stroke-dashoffset: -26; } }

        /* Rafts bobbing on water */
        @keyframes raft-bob {
          0%,100% { transform: translateY(0) rotate(-1.2deg); }
          50%     { transform: translateY(-3px) rotate(1.2deg); }
        }

        /* Drifting wave foam */
        @keyframes wave-drift {
          from { transform: translateX(-60px); }
          to   { transform: translateX(60px); }
        }

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
