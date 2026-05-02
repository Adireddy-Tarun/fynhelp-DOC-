import { useEffect, useMemo, useRef, useState } from "react";
import { HAIRPIN_STOPS, CLIMBER_AT, type HairpinStop } from "./hairpinStops";

const GOLD = "#C9A84C";
const GREEN = "#34C759";
const DARK = "#1a1814";

interface Props {
  onSelectStop: (s: HairpinStop) => void;
}

/** Climber: round head, brown hat, red jacket, dark pants, backpack, walking stick. */
function ClimberSvg() {
  return (
    <svg width="34" height="42" viewBox="0 0 34 42" fill="none" aria-hidden style={{ display: "block" }}>
      <rect x="6" y="16" width="9" height="11" rx="2" fill="#7a4f1f" />
      <path d="M12 13 C 9 13 8 15 8.5 19 L 8.5 26 C 8.5 27.5 9.8 28 11 28 L 19 28 C 20.2 28 21.5 27.5 21.5 26 L 21.5 19 C 22 15 21 13 18 13 Z" fill="#C41E1E" />
      <circle cx="15" cy="9" r="4.2" fill="#F5D0A9" />
      <path d="M10.5 8.5 C 10.5 5.5 12 4 15 4 C 18 4 19.5 5.5 19.5 8.5 L 19.5 9 L 10.5 9 Z" fill="#5a3a1a" />
      <ellipse cx="15" cy="9" rx="5.2" ry="0.9" fill="#5a3a1a" />
      <path d="M9 28 L 10.5 39 L 13.5 39 L 14.2 29 Z" fill={DARK} />
      <path d="M21 28 L 19.5 39 L 16.5 39 L 15.8 29 Z" fill={DARK} />
      <ellipse cx="12" cy="40" rx="2.4" ry="1.2" fill="#3a2410" />
      <ellipse cx="18" cy="40" rx="2.4" ry="1.2" fill="#3a2410" />
      <line x1="23" y1="14" x2="27" y2="36" stroke="#7a4f1f" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M21 18 C 23 17 24 15.5 24 14.8" stroke="#C41E1E" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/* ---------- Path math: build smooth curve through anchors ---------- */
type Pt = { x: number; y: number };

function buildSmoothPath(points: Pt[]): string {
  if (points.length < 2) return "";
  const t = 0.5;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + ((p2.x - p0.x) / 6) * t;
    const c1y = p1.y + ((p2.y - p0.y) / 6) * t;
    const c2x = p2.x - ((p3.x - p1.x) / 6) * t;
    const c2y = p2.y - ((p3.y - p1.y) / 6) * t;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Sample N points along an SVG path (in user-space units). */
function samplePath(path: SVGPathElement, n: number): { p: Pt; angle: number }[] {
  const total = path.getTotalLength();
  const out: { p: Pt; angle: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const len = (i / n) * total;
    const cur = path.getPointAtLength(len);
    const nxt = path.getPointAtLength(Math.min(len + 0.5, total));
    out.push({
      p: { x: cur.x, y: cur.y },
      angle: Math.atan2(nxt.y - cur.y, nxt.x - cur.x),
    });
  }
  return out;
}

/* ---------- Decorative SVG bits ---------- */

function PineTree({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      className="hairpin-tree"
      style={{ animationDelay: `${delay}s` }}
    >
      <rect x="-0.4" y="0" width="0.8" height="2.2" fill="#6B4226" />
      <polygon points="-2.5,0 2.5,0 0,-3.6" fill="#2D5016" />
      <polygon points="-2,-2 2,-2 0,-5" fill="#3a6620" />
      <polygon points="-1.5,-3.6 1.5,-3.6 0,-6" fill="#4a7a2e" />
    </g>
  );
}

function RoundTree({ x, y, scale = 1, delay = 0 }: { x: number; y: number; scale?: number; delay?: number }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale})`}
      className="hairpin-tree"
      style={{ animationDelay: `${delay}s` }}
    >
      <rect x="-0.35" y="0" width="0.7" height="1.8" fill="#6B4226" />
      <circle cx="0" cy="-1.6" r="2.2" fill="#4A7A2E" />
      <circle cx="-1.2" cy="-1" r="1.4" fill="#5a8a3a" />
      <circle cx="1.2" cy="-1" r="1.4" fill="#3d6a24" />
    </g>
  );
}

function Kiosk({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* Booth body */}
      <rect x="-3.4" y="-3.5" width="6.8" height="3.8" fill="#FAF6EE" stroke={DARK} strokeWidth="0.18" />
      {/* Roof */}
      <polygon points="-4,-3.5 4,-3.5 0,-5.6" fill={GOLD} stroke={DARK} strokeWidth="0.18" />
      <rect x="-4" y="-3.7" width="8" height="0.35" fill={GOLD} />
      {/* Door */}
      <rect x="-1.2" y="-2.4" width="2.4" height="2.1" fill="#E8DCC4" stroke={DARK} strokeWidth="0.12" />
      <circle cx="0.7" cy="-1.4" r="0.12" fill={DARK} />
      {/* Sign */}
      <rect x="-2.6" y="-3.25" width="5.2" height="0.7" fill="#FFF" stroke={GOLD} strokeWidth="0.1" rx="0.1" />
      <text x="0" y="-2.72" textAnchor="middle" fontSize="0.55" fontFamily="DM Sans, sans-serif" fontWeight="700" fill={DARK}>FYNHelp</text>
      {/* Arrow sign pointing up */}
      <g transform="translate(3.2 -2.6)">
        <rect x="-0.08" y="0" width="0.16" height="2" fill="#6B4226" />
        <polygon points="-1.1,-0.3 1.1,-0.3 0,-1.4" fill={GOLD} stroke={DARK} strokeWidth="0.1" />
        <text x="0" y="-0.65" textAnchor="middle" fontSize="0.42" fontWeight="700" fill={DARK}>UP</text>
      </g>
      {/* Tiny welcoming figure */}
      <g transform="translate(-2.5 -0.2)">
        <circle cx="0" cy="-0.6" r="0.32" fill="#F5D0A9" />
        <rect x="-0.28" y="-0.3" width="0.56" height="0.7" fill="#C41E1E" />
        <line x1="-0.28" y1="-0.05" x2="-0.55" y2="-0.5" stroke="#F5D0A9" strokeWidth="0.14" strokeLinecap="round" />
      </g>
    </g>
  );
}

function SinkingPerson({ x, y, delay = 0 }: { x: number; y: number; delay?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="hairpin-sinker" style={{ animationDelay: `${delay}s` }}>
      <circle cx="0" cy="0" r="0.55" fill="#F5D0A9" stroke={DARK} strokeWidth="0.08" />
      <line x1="-0.45" y1="-0.1" x2="-1.1" y2="-1.1" stroke="#F5D0A9" strokeWidth="0.18" strokeLinecap="round" />
      <line x1="0.45" y1="-0.1" x2="1.1" y2="-1.1" stroke="#F5D0A9" strokeWidth="0.18" strokeLinecap="round" />
    </g>
  );
}

function Raft({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} className="hairpin-raft">
      {/* planks */}
      <rect x="-3" y="-0.2" width="6" height="0.85" fill="#8B6914" stroke="#5a3a1a" strokeWidth="0.08" rx="0.12" />
      <line x1="-3" y1="0.05" x2="3" y2="0.05" stroke="#5a3a1a" strokeWidth="0.08" />
      <line x1="-3" y1="0.4" x2="3" y2="0.4" stroke="#5a3a1a" strokeWidth="0.08" />
      <line x1="-1.5" y1="-0.2" x2="-1.5" y2="0.65" stroke="#5a3a1a" strokeWidth="0.08" />
      <line x1="1.5" y1="-0.2" x2="1.5" y2="0.65" stroke="#5a3a1a" strokeWidth="0.08" />
      {/* people */}
      <g transform="translate(-1.5 -0.2)">
        <circle cx="0" cy="-0.7" r="0.4" fill="#F5D0A9" stroke={DARK} strokeWidth="0.06" />
        <rect x="-0.32" y="-0.35" width="0.64" height="0.6" fill="#3B82F6" />
      </g>
      <g transform="translate(0.2 -0.25)">
        <circle cx="0" cy="-0.75" r="0.42" fill="#F5D0A9" stroke={DARK} strokeWidth="0.06" />
        <rect x="-0.34" y="-0.4" width="0.68" height="0.65" fill="#10B981" />
        {/* arm pointing toward shore (left) */}
        <line x1="-0.3" y1="-0.3" x2="-1.1" y2="-0.6" stroke="#F5D0A9" strokeWidth="0.16" strokeLinecap="round" />
      </g>
      <g transform="translate(1.7 -0.2)">
        <circle cx="0" cy="-0.7" r="0.4" fill="#F5D0A9" stroke={DARK} strokeWidth="0.06" />
        <rect x="-0.32" y="-0.35" width="0.64" height="0.6" fill="#F59E0B" />
      </g>
    </g>
  );
}

/* ---------- Main scene ---------- */

export default function HairpinScene({ onSelectStop }: Props) {
  const [hoverId, setHoverId] = useState<number | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [steps, setSteps] = useState<{ x: number; y: number; angle: number; completed: boolean; behind: boolean }[]>([]);

  // Build the spiral path as PER-SEGMENT quadratic curves so we can:
  //  - bulge each curve outward toward the chip side (mountainside arc)
  //  - hide a small mid-portion when the curve crosses the ridge (behind illusion)
  //  - color completed (≤ climber) vs remaining segments
  const segments = useMemo(() => {
    const stops = HAIRPIN_STOPS.map((s) => ({
      x: s.xPct,
      y: s.yPct,
      side: s.side as "left" | "right",
      n: s.n,
    }));
    const anchors = [
      { x: 16, y: 90, side: "left" as const, n: 0 }, // kiosk
      ...stops,
      { x: 50, y: 7, side: "right" as const, n: 99 }, // summit
    ];
    const segs: Array<{
      d: string;
      completed: boolean;
      crosses: boolean;
      from: typeof anchors[number];
      to: typeof anchors[number];
    }> = [];
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i];
      const b = anchors[i + 1];
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      // Push control point outward toward the chip side of the source stop
      // for the "wraps around mountainside" arc.
      const bulge = a.side === "left" ? -8 : 8; // negative = leftward
      const cx = mx + bulge;
      const cy = my; // keep vertical mid
      const d = `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
      // crosses = endpoints are on opposite sides → curve wraps behind ridge
      const crosses = a.side !== b.side;
      const completed = b.n <= CLIMBER_AT && a.n < CLIMBER_AT + 1;
      segs.push({ d, completed, crosses, from: a, to: b });
    }
    return segs;
  }, []);

  // Combined path string for the hidden measurement path (used to find
  // climber pixel coords and to lay sample-driven step strokes).
  const pathD = useMemo(() => segments.map((s) => s.d).join(" "), [segments]);

  // After path renders, sample step positions for stairway look.
  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const samples = samplePath(path, 180);
    const total = path.getTotalLength();
    const climber = HAIRPIN_STOPS.find((s) => s.n === CLIMBER_AT)!;
    let climberLen = total * 0.5;
    let best = Infinity;
    for (let i = 0; i <= 240; i++) {
      const len = (i / 240) * total;
      const pt = path.getPointAtLength(len);
      const d = (pt.x - climber.xPct) ** 2 + (pt.y - climber.yPct) ** 2;
      if (d < best) { best = d; climberLen = len; }
    }
    const result = samples.map((s, i) => {
      const len = (i / samples.length) * total;
      const completed = len <= climberLen;
      // "Behind ridge" band — wider so behind portions are clearly hidden
      const behind = s.p.y < 70 && Math.abs(s.p.x - 50) < 6;
      return { x: s.p.x, y: s.p.y, angle: s.angle, completed, behind };
    });
    setSteps(result);
  }, [pathD]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        margin: "0 auto",
        aspectRatio: "12 / 16",
        maxWidth: 1040,
      }}
      className="hairpin-scene"
    >
      {/* Back drifting clouds (behind mountain) */}
      {[
        { top: "8%", left: "-15%", w: 110, h: 38, dur: 95, delay: 0 },
        { top: "16%", left: "-25%", w: 80, h: 30, dur: 120, delay: 30 },
        { top: "22%", left: "-10%", w: 95, h: 34, dur: 110, delay: 60 },
      ].map((c, i) => (
        <div
          key={`bc-${i}`}
          aria-hidden
          className="hairpin-cloud-back"
          style={{
            top: c.top,
            left: c.left,
            width: c.w,
            height: c.h,
            animation: `hairpin-front-cloud ${c.dur}s linear ${c.delay}s infinite`,
          }}
        />
      ))}

      {/* === Main scene SVG === */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 2 }}
        aria-hidden
      >
        <defs>
          <linearGradient id="hp-distant-1" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#B5A892" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#B5A892" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="hp-distant-2" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#C4B8A4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#C4B8A4" stopOpacity="0.18" />
          </linearGradient>

          <linearGradient id="hp-mountain" x1="0.3" x2="0.7" y1="0" y2="1">
            <stop offset="0%" stopColor="#1a1814" />
            <stop offset="55%" stopColor="#2a2520" />
            <stop offset="100%" stopColor="#3d3530" />
          </linearGradient>
          <linearGradient id="hp-mtn-lit" x1="0" x2="1" y1="0" y2="0.5">
            <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#C9A84C" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hp-snow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E8DCC4" />
          </linearGradient>
          <linearGradient id="hp-ocean" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7BA7BC" />
            <stop offset="50%" stopColor="#5B8FA8" />
            <stop offset="100%" stopColor="#4A7D96" />
          </linearGradient>
          <linearGradient id="hp-ground" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#7A9E5A" />
            <stop offset="35%" stopColor="#C4A87C" />
            <stop offset="100%" stopColor="#A88B5E" />
          </linearGradient>

          <filter id="hp-path-glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
          <filter id="hp-path-glow-green" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
        </defs>

        {/* Distant rolling hills */}
        <path d="M 0 70 Q 12 56 22 62 T 42 60 T 62 58 T 82 62 T 100 60 L 100 78 L 0 78 Z" fill="url(#hp-distant-1)" />
        <path d="M 0 78 Q 14 66 28 72 T 50 70 T 72 72 T 100 70 L 100 84 L 0 84 Z" fill="url(#hp-distant-2)" />

        {/* === Wide Mt-Fuji-style main mountain (base spans 92% of width) === */}
        <path
          d="M 4 92
             C 12 78, 20 60, 28 44
             C 34 32, 42 18, 50 8
             C 58 18, 66 32, 72 44
             C 80 60, 88 78, 96 92
             Z"
          fill="url(#hp-mountain)"
        />
        {/* lit slope from upper right */}
        <path
          d="M 50 8 C 58 18, 66 32, 72 44 C 80 60, 88 78, 96 92 L 50 92 Z"
          fill="url(#hp-mtn-lit)"
        />
        {/* Ridge shading lines */}
        <path d="M 50 8 L 50 92" stroke="#0e0c0a" strokeWidth="0.22" opacity="0.35" />
        <path d="M 36 32 L 50 12 M 64 32 L 50 12 M 28 55 L 50 25 M 72 55 L 50 25 M 18 78 L 50 45 M 82 78 L 50 45"
              stroke="#0e0c0a" strokeWidth="0.16" opacity="0.28" fill="none" />

        {/* Snow cap */}
        <path
          d="M 44 14 L 47 9 L 50 5 L 53 9 L 56 14 L 54.5 16 L 52.5 14 L 50 16 L 47.5 14 L 45.5 16 Z"
          fill="url(#hp-snow)"
          style={{ filter: "drop-shadow(0 0.4px 0.6px rgba(0,0,0,0.3))" }}
        />

        {/* === Hidden measurement path === */}
        <path ref={pathRef} d={pathD} fill="none" stroke="transparent" />

        {/* === Per-segment curves (visible) === */}
        {segments.map((seg, i) => {
          const color = seg.completed ? GREEN : GOLD;
          // Faint backing trail on every segment (subtle, even where step strokes go)
          return (
            <g key={`seg-${i}`}>
              {/* faint backing curve */}
              <path
                d={seg.d}
                stroke={color}
                strokeWidth="0.4"
                fill="none"
                opacity={seg.crosses ? 0.18 : 0.55}
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* === Stairway steps (horizontal stone treads) === */}
        {steps.map((s, i) => {
          if (i % 3 !== 0) return null; // step every 3rd sample → cleaner spacing
          const len = 1.0; // shorter tread (~3px on screen)
          const w = 0.5;   // ~2px tall
          // Tread is perpendicular to path direction (so it looks horizontal where path climbs vertically)
          const nx = -Math.sin(s.angle);
          const ny = Math.cos(s.angle);
          const x1 = s.x + nx * len * 0.5;
          const y1 = s.y + ny * len * 0.5;
          const x2 = s.x - nx * len * 0.5;
          const y2 = s.y - ny * len * 0.5;
          const color = s.completed ? GREEN : GOLD;
          if (s.behind) return null; // hide behind-ridge steps entirely → "wraps behind" illusion
          return (
            <line
              key={`step-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={color}
              strokeWidth={w}
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 0.5px ${color})` }}
            />
          );
        })}

        {/* === Ground strip (taller, with darker patches) === */}
        <rect x="0" y="87" width="100" height="8" fill="url(#hp-ground)" />
        {/* darker sand patches for variation */}
        <ellipse cx="22" cy="92" rx="9" ry="1.1" fill="#A88B5E" opacity="0.55" />
        <ellipse cx="55" cy="93" rx="12" ry="1.0" fill="#8E7448" opacity="0.4" />
        <ellipse cx="82" cy="92" rx="10" ry="1.2" fill="#A88B5E" opacity="0.55" />
        {/* grass tufts on top edge — denser, curved humps */}
        {Array.from({ length: 36 }).map((_, i) => {
          const x = (i + 0.5) * (100 / 36);
          return (
            <path
              key={`grass-${i}`}
              d={`M ${x - 0.5} 87.4 Q ${x} 86.2 ${x + 0.5} 87.4`}
              stroke="#7A9E5A" strokeWidth="0.32" strokeLinecap="round" fill="#7A9E5A" opacity="0.85"
            />
          );
        })}

        {/* === Ground strip === */}
        <rect x="0" y="89" width="100" height="6" fill="url(#hp-ground)" />
        {/* grass tufts on top edge */}
        {Array.from({ length: 28 }).map((_, i) => {
          const x = (i + 0.5) * (100 / 28);
          return (
            <path
              key={`grass-${i}`}
              d={`M ${x} 89.4 l -0.4 -0.7 M ${x} 89.4 l 0 -0.9 M ${x} 89.4 l 0.4 -0.7`}
              stroke="#3a6620" strokeWidth="0.18" strokeLinecap="round" fill="none"
            />
          );
        })}

        {/* === Trees on ground & lower slopes === */}
        <PineTree  x={10} y={89} scale={1.1} delay={0.0} />
        <RoundTree x={14} y={89} scale={0.9} delay={0.4} />
        <PineTree  x={6}  y={89} scale={0.8} delay={0.8} />
        <RoundTree x={22} y={89} scale={0.7} delay={1.2} />
        <PineTree  x={30} y={89} scale={1.0} delay={0.5} />
        <RoundTree x={70} y={89} scale={1.0} delay={0.2} />
        <PineTree  x={78} y={89} scale={1.2} delay={0.9} />
        <RoundTree x={86} y={89} scale={0.85} delay={1.5} />
        <PineTree  x={92} y={89} scale={0.7} delay={0.3} />
        {/* Tiny trees higher up */}
        <PineTree  x={18} y={78} scale={0.45} delay={1.1} />
        <RoundTree x={84} y={76} scale={0.4} delay={0.6} />
        <PineTree  x={28} y={66} scale={0.35} delay={1.4} />

        {/* === FYNHelp Kiosk at base === */}
        <Kiosk x={16} y={89} />

        {/* === Ocean === */}
        <rect x="0" y="95" width="100" height="5" fill="url(#hp-ocean)" />
        {/* wave lines */}
        <g className="hairpin-wave-1">
          <path d="M 0 96 Q 5 95.4 10 96 T 20 96 T 30 96 T 40 96 T 50 96 T 60 96 T 70 96 T 80 96 T 90 96 T 100 96"
                stroke="#FFFFFF" strokeWidth="0.18" opacity="0.55" fill="none" />
        </g>
        <g className="hairpin-wave-2">
          <path d="M 0 98 Q 6 97.4 12 98 T 24 98 T 36 98 T 48 98 T 60 98 T 72 98 T 84 98 T 100 98"
                stroke="#FFFFFF" strokeWidth="0.15" opacity="0.42" fill="none" />
        </g>

        {/* Sinking people */}
        <SinkingPerson x={42} y={96.3} delay={0} />
        <SinkingPerson x={56} y={97}   delay={0.6} />
        <SinkingPerson x={68} y={96.5} delay={1.2} />
        <SinkingPerson x={34} y={97}   delay={1.8} />

        {/* Raft */}
        <Raft x={80} y={96.2} />

        {/* === Flag at summit === */}
        <g transform="translate(50 5)">
          <line x1="0" y1="0" x2="0" y2="-6" stroke={DARK} strokeWidth="0.35" strokeLinecap="round" />
          <path
            d="M 0 -6 L 4 -5 L 3 -3.5 L 4 -2 L 0 -3 Z"
            fill={GOLD}
            style={{ transformOrigin: "0 -4px", animation: "hairpin-flag-wave 2.5s ease-in-out infinite" }}
          />
        </g>
      </svg>

      {/* === Story labels (positioned with %) === */}
      <span
        className="hairpin-sink-label"
        style={{
          position: "absolute", left: "30%", top: "94.4%",
          fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#3a3128",
          opacity: 0.85, zIndex: 5, pointerEvents: "none", whiteSpace: "nowrap",
        }}
      >
        63M Indian SMEs without financial clarity
      </span>
      <span
        className="hairpin-raft-label"
        style={{
          position: "absolute", left: "70%", top: "92.5%",
          fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "#3a3128",
          opacity: 0.85, zIndex: 5, pointerEvents: "none", whiteSpace: "nowrap",
        }}
      >
        Surviving on spreadsheets &amp; gut feeling
      </span>

      {/* === Front drifting clouds (over mountain, under chips) === */}
      {[
        { top: "20%", w: 120, h: 40, dur: 38, delay: 0 },
        { top: "40%", w: 90,  h: 32, dur: 48, delay: 12 },
        { top: "58%", w: 100, h: 36, dur: 55, delay: 25 },
      ].map((c, i) => (
        <div
          key={`fc-${i}`}
          aria-hidden
          className="hairpin-cloud-front"
          style={{
            top: c.top,
            left: 0,
            width: c.w,
            height: c.h,
            animation: `hairpin-front-cloud ${c.dur}s linear ${c.delay}s infinite`,
          }}
        />
      ))}

      {/* === Birds === */}
      {[
        { top: "6%",  left: "-10%", size: 14, dur: 90, delay: 0  },
        { top: "12%", left: "-20%", size: 10, dur: 110, delay: 25 },
        { top: "18%", left: "-15%", size: 12, dur: 75, delay: 50 },
        { top: "9%",  left: "-30%", size: 8,  dur: 130, delay: 10 },
        { top: "24%", left: "-25%", size: 11, dur: 95, delay: 70 },
        { top: "32%", left: "-12%", size: 16, dur: 60, delay: 5  },
        { top: "38%", left: "-18%", size: 13, dur: 70, delay: 35 },
      ].map((b, i) => (
        <div
          key={`bird-${i}`}
          aria-hidden
          className="hairpin-bird-wrap"
          style={{
            top: b.top,
            left: b.left,
            width: b.size,
            height: b.size * 0.5,
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
            zIndex: i > 4 ? 7 : 2, // last two birds in foreground
          }}
        >
          <svg viewBox="0 0 20 10" width="100%" height="100%">
            <path d="M 1 6 Q 5 1 10 5 Q 15 1 19 6" stroke="#5D4E37" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      ))}

      {/* === Stop dots === */}
      {HAIRPIN_STOPS.map((s, i) => (
        <div
          key={`dot-${s.n}`}
          aria-hidden
          className={`hairpin-dot ${s.n <= CLIMBER_AT ? "completed" : ""}`}
          style={{
            left: `${s.xPct}%`,
            top: `${s.yPct}%`,
            animationDelay: `${(i % 4) * 0.4}s`,
          }}
        />
      ))}

      {/* === Stop chips === */}
      {HAIRPIN_STOPS.map((s, i) => {
        const isLeft = s.side === "left";
        return (
          <div
            key={`chip-${s.n}`}
            className="hairpin-chip-anchor"
            style={{
              left: `${s.xPct}%`,
              top: `${s.yPct}%`,
              animationDelay: `${0.15 + i * 0.08}s`,
              transform: isLeft
                ? "translate(calc(-100% - 14px), -50%)"
                : "translate(14px, -50%)",
            }}
          >
            <button
              type="button"
              onClick={() => onSelectStop(s)}
              onMouseEnter={() => setHoverId(s.n)}
              onMouseLeave={() => setHoverId((id) => (id === s.n ? null : id))}
              onFocus={() => setHoverId(s.n)}
              onBlur={() => setHoverId((id) => (id === s.n ? null : id))}
              className="hairpin-chip"
              aria-label={`${s.name} — ${s.status === "live" ? "Live" : "Coming soon"}: ${s.description}`}
            >
              <span className="hairpin-chip-icon" style={{ background: s.color }} aria-hidden>
                {s.emoji}
              </span>
              <span className="hairpin-chip-name">{s.name}</span>
              <span className={s.status === "live" ? "hairpin-badge live" : "hairpin-badge soon"} aria-hidden>
                {s.status === "live" ? "LIVE" : "SOON"}
              </span>
            </button>
            {hoverId === s.n && (
              <div
                role="tooltip"
                className="hairpin-tooltip"
                style={{ left: isLeft ? "auto" : 0, right: isLeft ? 0 : "auto" }}
              >
                <span className="hairpin-tooltip-arrow" />
                {s.description}
              </div>
            )}
          </div>
        );
      })}

      {/* === Climber at stop 3 === */}
      {(() => {
        const stop = HAIRPIN_STOPS.find((s) => s.n === CLIMBER_AT);
        if (!stop) return null;
        const isLeft = stop.side === "left";
        return (
          <div
            className="hairpin-climber"
            style={{
              left: `${stop.xPct}%`,
              top: `${stop.yPct}%`,
              transform: isLeft
                ? "translate(8px, -100%)"
                : "translate(calc(-100% - 8px), -100%)",
            }}
          >
            <div className="hairpin-climber-bob">
              <ClimberSvg />
            </div>
            <span className="hairpin-here">▸ You are here</span>
          </div>
        );
      })()}
    </div>
  );
}
