import { useMemo, useState } from "react";
import { HAIRPIN_STOPS, CLIMBER_AT, type HairpinStop } from "./hairpinStops";

const GOLD = "#C9A84C";
const DARK = "#1a1814";

interface Props {
  onSelectStop: (s: HairpinStop) => void;
}

/** Tiny climber SVG — round head, brown hat, red jacket, dark pants, backpack, walking stick. */
function ClimberSvg() {
  return (
    <svg
      width="34"
      height="42"
      viewBox="0 0 34 42"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{ display: "block" }}
    >
      {/* Backpack */}
      <rect x="6" y="16" width="9" height="11" rx="2" fill="#7a4f1f" />
      {/* Body / red jacket */}
      <path
        d="M12 13 C 9 13 8 15 8.5 19 L 8.5 26 C 8.5 27.5 9.8 28 11 28 L 19 28 C 20.2 28 21.5 27.5 21.5 26 L 21.5 19 C 22 15 21 13 18 13 Z"
        fill="#C41E1E"
      />
      {/* Head */}
      <circle cx="15" cy="9" r="4.2" fill="#F5D0A9" />
      {/* Hat (brown) */}
      <path d="M10.5 8.5 C 10.5 5.5 12 4 15 4 C 18 4 19.5 5.5 19.5 8.5 L 19.5 9 L 10.5 9 Z" fill="#5a3a1a" />
      <ellipse cx="15" cy="9" rx="5.2" ry="0.9" fill="#5a3a1a" />
      {/* Pants */}
      <path d="M9 28 L 10.5 39 L 13.5 39 L 14.2 29 Z" fill="#1a1814" />
      <path d="M21 28 L 19.5 39 L 16.5 39 L 15.8 29 Z" fill="#1a1814" />
      {/* Boots */}
      <ellipse cx="12" cy="40" rx="2.4" ry="1.2" fill="#3a2410" />
      <ellipse cx="18" cy="40" rx="2.4" ry="1.2" fill="#3a2410" />
      {/* Walking stick (brown) */}
      <line x1="23" y1="14" x2="27" y2="36" stroke="#7a4f1f" strokeWidth="1.4" strokeLinecap="round" />
      {/* Arm */}
      <path d="M21 18 C 23 17 24 15.5 24 14.8" stroke="#C41E1E" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Build a smooth SVG path through (xPct,yPct) anchors using Catmull-Rom→Bezier. */
function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";
  const tension = 0.5;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export default function HairpinScene({ onSelectStop }: Props) {
  const [hoverId, setHoverId] = useState<number | null>(null);

  // Build road path: start at shore (just left of stop 1, at sea level)
  // through every stop, ending just past the summit.
  const pathD = useMemo(() => {
    const anchors = [
      { x: 8, y: 96 }, // shore start
      ...HAIRPIN_STOPS.map((s) => ({ x: s.xPct, y: s.yPct })),
      { x: 50, y: 6 }, // summit cap
    ];
    return buildSmoothPath(anchors);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        margin: "0 auto",
        aspectRatio: "12 / 16",
        maxWidth: 980,
      }}
      className="hairpin-scene"
    >
      {/* === SCENE SVG (mountain, ocean, clouds, flag) === */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
        aria-hidden
      >
        <defs>
          {/* Sky already on parent — just put faint distant peaks here */}
          <linearGradient id="hp-distant" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#B5A892" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#B5A892" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="hp-mountain" x1="0.3" x2="0.7" y1="0" y2="1">
            <stop offset="0%" stopColor="#3a3128" />
            <stop offset="35%" stopColor="#2a2520" />
            <stop offset="100%" stopColor="#1a1814" />
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
            <stop offset="0%" stopColor="#5B8FA8" />
            <stop offset="100%" stopColor="#3F6B82" />
          </linearGradient>
          <filter id="hp-path-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.8" />
          </filter>
        </defs>

        {/* Distant faded peaks */}
        <polygon points="0,72 12,52 22,64 34,46 46,62 60,48 76,60 88,50 100,66 100,80 0,80" fill="url(#hp-distant)" />
        <polygon points="0,80 18,62 32,72 50,58 70,72 86,62 100,76 100,86 0,86" fill="url(#hp-distant)" opacity="0.7" />

        {/* Main mountain — a tall triangular peak rising from ocean */}
        <polygon points="2,98 50,4 98,98" fill="url(#hp-mountain)" />
        {/* Lit slope (sun side from upper right) */}
        <polygon points="50,4 98,98 50,98" fill="url(#hp-mtn-lit)" />
        {/* Subtle ridge shading */}
        <path d="M 50 4 L 50 98" stroke="#0e0c0a" strokeWidth="0.25" opacity="0.35" />
        <path d="M 30 70 L 50 30 M 38 84 L 50 50 M 62 84 L 50 50 M 70 70 L 50 30"
              stroke="#0e0c0a" strokeWidth="0.18" opacity="0.4" fill="none" />

        {/* Snow cap */}
        <path
          d="M 44 12 L 47 7 L 50 4 L 53 7 L 56 12 L 54 14 L 52 12 L 50 14 L 48 12 L 46 14 Z"
          fill="url(#hp-snow)"
          style={{ filter: "drop-shadow(0 0.4px 0.6px rgba(0,0,0,0.3))" }}
        />

        {/* Ocean at very bottom */}
        <rect x="0" y="93" width="100" height="7" fill="url(#hp-ocean)" />
        {/* Wave lines */}
        <path d="M 0 95 Q 5 94.3 10 95 T 20 95 T 30 95 T 40 95 T 50 95 T 60 95 T 70 95 T 80 95 T 90 95 T 100 95"
              stroke="#FFFFFF" strokeWidth="0.18" opacity="0.55" fill="none" />
        <path d="M 0 97 Q 6 96.3 12 97 T 24 97 T 36 97 T 48 97 T 60 97 T 72 97 T 84 97 T 100 97"
              stroke="#FFFFFF" strokeWidth="0.15" opacity="0.4" fill="none" />

        {/* Golden hairpin road — glow base */}
        <path
          d={pathD}
          stroke={GOLD}
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
          opacity="0.18"
          filter="url(#hp-path-glow)"
        />
        {/* Dashed road on top */}
        <path
          d={pathD}
          stroke={GOLD}
          strokeWidth="0.55"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="1.1 0.85"
          style={{ animation: "hairpin-road-flow 6s linear infinite" }}
        />

        {/* Flag at summit */}
        <g transform="translate(50 4)">
          <line x1="0" y1="0" x2="0" y2="-6" stroke={DARK} strokeWidth="0.35" strokeLinecap="round" />
          <path
            d="M 0 -6 L 4 -5 L 3 -3.5 L 4 -2 L 0 -3 Z"
            fill={GOLD}
            style={{ transformOrigin: "0 -4px", animation: "hairpin-flag-wave 2.5s ease-in-out infinite" }}
          />
        </g>
      </svg>

      {/* === Drifting clouds (CSS) === */}
      {[
        { top: "6%", size: 90, dur: 75, delay: 0, dir: "l2r", op: 0.85 },
        { top: "11%", size: 60, dur: 90, delay: 14, dir: "r2l", op: 0.75 },
        { top: "18%", size: 70, dur: 80, delay: 6, dir: "l2r", op: 0.7 },
        { top: "26%", size: 55, dur: 70, delay: 18, dir: "r2l", op: 0.7 },
      ].map((c, i) => (
        <div
          key={`hc-${i}`}
          aria-hidden
          className="hairpin-cloud"
          style={{
            top: c.top,
            width: c.size,
            height: c.size * 0.4,
            opacity: c.op,
            animation: `roadmap-cloud-drift-${c.dir} ${c.dur}s linear ${c.delay}s infinite`,
          }}
        />
      ))}

      {/* === Stop dots (positioned via %) === */}
      {HAIRPIN_STOPS.map((s, i) => (
        <div
          key={`dot-${s.n}`}
          aria-hidden
          className="hairpin-dot"
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
              <span
                className="hairpin-chip-icon"
                style={{ background: s.color }}
                aria-hidden
              >
                {s.emoji}
              </span>
              <span className="hairpin-chip-name">{s.name}</span>
              <span
                className={s.status === "live" ? "hairpin-badge live" : "hairpin-badge soon"}
                aria-hidden
              >
                {s.status === "live" ? "LIVE" : "SOON"}
              </span>
            </button>
            {hoverId === s.n && (
              <div
                role="tooltip"
                className="hairpin-tooltip"
                style={{
                  left: isLeft ? "auto" : 0,
                  right: isLeft ? 0 : "auto",
                }}
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
            <span className="hairpin-here">You are here</span>
          </div>
        );
      })()}
    </div>
  );
}
