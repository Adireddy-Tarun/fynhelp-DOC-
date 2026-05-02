import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import Climber from "./Climber";
import ProductIcon3D from "./ProductIcon3D";
import {
  MILESTONES,
  PATH_D,
  getClimberMilestoneIndex,
  type RoadmapProduct,
} from "./roadmapData";

const VIEW_W = 1000;
const VIEW_H = 700;

interface Props {
  onSelectProduct: (p: RoadmapProduct) => void;
}

/**
 * Sample N points along an SVG path so we can position DOM elements
 * (climber, milestones) accurately on top of the responsive SVG.
 */
function usePathPoints(pathD: string, count: number) {
  return useMemo(() => {
    if (typeof document === "undefined") return [];
    const svgNS = "http://www.w3.org/2000/svg";
    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", pathD);
    const total = path.getTotalLength();
    const points: { x: number; y: number; t: number }[] = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const p = path.getPointAtLength(total * t);
      points.push({ x: p.x, y: p.y, t });
    }
    return points;
  }, [pathD, count]);
}

export default function MountainScene({ onSelectProduct }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Sample path so we know exact (x,y) per milestone.
  const points = usePathPoints(PATH_D, 120);
  const sampleAt = (t: number) => {
    if (!points.length) return { x: 0, y: 0 };
    const i = Math.min(points.length - 1, Math.max(0, Math.round(t * points.length)));
    return points[i];
  };

  // Anchor each milestone to a fraction along the path.
  const milestoneAnchors = [0.04, 0.34, 0.66, 0.97];
  const climberTargetIdx = getClimberMilestoneIndex();
  const climberStartT = milestoneAnchors[0];
  const climberEndT = milestoneAnchors[climberTargetIdx];

  // Convert SVG coords → CSS pixels for absolutely-positioned DOM overlays.
  const toPx = (sx: number, sy: number) => ({
    x: (sx / VIEW_W) * size.w,
    y: (sy / VIEW_H) * size.h,
  });

  // Build climber animation keyframes by sampling the path between start & end.
  const climberKeyframes = useMemo(() => {
    if (!points.length || !size.w) return { x: [0], y: [0] };
    const startIdx = Math.round(climberStartT * points.length);
    const endIdx = Math.round(climberEndT * points.length);
    const slice = points.slice(Math.min(startIdx, endIdx), Math.max(startIdx, endIdx) + 1);
    const xs: number[] = [];
    const ys: number[] = [];
    const step = Math.max(1, Math.round(slice.length / 30));
    for (let i = 0; i < slice.length; i += step) {
      const p = toPx(slice[i].x, slice[i].y);
      xs.push(p.x - 25);
      ys.push(p.y - 56);
    }
    const last = toPx(slice[slice.length - 1].x, slice[slice.length - 1].y);
    xs.push(last.x - 25);
    ys.push(last.y - 56);
    return { x: xs, y: ys };
  }, [points, size.w, size.h, climberStartT, climberEndT]);

  // Floating clouds (fixed sizes/positions for organic spread).
  const clouds = [
    { top: "8%", size: 220, dur: 70, delay: 0, opacity: 0.65 },
    { top: "18%", size: 140, dur: 55, delay: 8, opacity: 0.55 },
    { top: "32%", size: 100, dur: 60, delay: 4, opacity: 0.6 },
    { top: "48%", size: 180, dur: 75, delay: 12, opacity: 0.5 },
    { top: "62%", size: 120, dur: 50, delay: 2, opacity: 0.6 },
    { top: "76%", size: 80, dur: 45, delay: 10, opacity: 0.55 },
  ];

  // Sparkle particles
  const sparkles = Array.from({ length: 18 }).map((_, i) => ({
    left: `${(i * 53) % 95}%`,
    top: `${30 + ((i * 17) % 60)}%`,
    dur: 8 + (i % 5) * 0.8,
    delay: (i % 7) * 1.2,
  }));

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 1200,
        height: "70vh",
        minHeight: 600,
        margin: "0 auto",
      }}
    >
      {/* Clouds */}
      {clouds.map((c, i) => (
        <div
          key={`cloud-${i}`}
          className="roadmap-cloud"
          style={{
            top: c.top,
            left: 0,
            width: c.size,
            height: c.size * 0.55,
            opacity: c.opacity,
            zIndex: 0,
            animation: `roadmap-cloud-drift ${c.dur}s linear ${c.delay}s infinite`,
          }}
        />
      ))}

      {/* Sparkles */}
      {sparkles.map((s, i) => (
        <div
          key={`spark-${i}`}
          className="roadmap-sparkle"
          style={{
            left: s.left,
            top: s.top,
            zIndex: 2,
            animation: `roadmap-sparkle-float ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}

      {/* Mountain SVG */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          overflow: "visible",
        }}
        aria-hidden
      >
        <defs>
          <linearGradient id="frontPeak" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#8B6914" />
            <stop offset="55%" stopColor="#3A2410" />
            <stop offset="100%" stopColor="#1A1008" />
          </linearGradient>
          <linearGradient id="midPeak" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#3A2410" />
            <stop offset="100%" stopColor="#1A1008" />
          </linearGradient>
          <linearGradient id="backPeak" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#5A3A1E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1A1008" stopOpacity="0.4" />
          </linearGradient>
          <radialGradient id="summitGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#8B6914" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#8B6914" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="snowGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#F4EDDA" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F4EDDA" />
          </linearGradient>
        </defs>

        {/* Back peaks */}
        <polygon points="80,680 380,250 580,680" fill="url(#backPeak)" />
        <polygon points="540,680 820,300 980,680" fill="url(#backPeak)" />

        {/* Mid peak */}
        <polygon points="160,680 520,180 760,680" fill="url(#midPeak)" />

        {/* Summit glow */}
        <circle cx="720" cy="120" r="120" fill="url(#summitGlow)" />

        {/* Front peak (main mountain) */}
        <polygon
          points="180,680 720,90 880,680"
          fill="url(#frontPeak)"
        />

        {/* Snow cap on front peak (top ~15%) */}
        <polygon
          points="675,170 720,90 765,170 740,180 720,165 700,180"
          fill="url(#snowGrad)"
        />
        {/* Snow detail on summit */}
        <path
          d="M 660 200 L 720 120 L 780 200 L 760 215 L 735 195 L 720 210 L 705 195 L 680 215 Z"
          fill="#F4EDDA"
          opacity="0.92"
        />

        {/* Golden path */}
        <path
          d={PATH_D}
          stroke="#8B6914"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="8 6"
          style={{ animation: "roadmap-path-dash 3s linear infinite" }}
          opacity="0.9"
        />
        {/* Subtle inner path glow */}
        <path
          d={PATH_D}
          stroke="#D9A441"
          strokeWidth="1.5"
          fill="none"
          opacity="0.35"
        />

        {/* Traveling dots along the path */}
        {[0.15, 0.4, 0.65, 0.88].map((offset, i) => {
          const p = sampleAt(offset);
          return (
            <circle
              key={`pt-${i}`}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#8B6914"
              opacity="0.85"
            >
              <animate
                attributeName="opacity"
                values="0.4;1;0.4"
                dur="2.4s"
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="r"
                values="3;5;3"
                dur="2.4s"
                begin={`${i * 0.4}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      </svg>

      {/* Summit shimmer overlay */}
      {size.w > 0 &&
        (() => {
          const p = toPx(720, 120);
          return (
            <div
              style={{
                position: "absolute",
                left: p.x - 60,
                top: p.y - 30,
                width: 120,
                height: 60,
                overflow: "hidden",
                borderRadius: 30,
                pointerEvents: "none",
                zIndex: 3,
              }}
            >
              <div className="roadmap-summit-shimmer" />
            </div>
          );
        })()}

      {/* Milestones + product icons */}
      {size.w > 0 &&
        MILESTONES.map((m, idx) => {
          const path = sampleAt(milestoneAnchors[idx]);
          const pos = toPx(path.x, path.y);
          const labelOffsetX = m.labelSide === "right" ? 70 : -210;

          // Layout product icons in a horizontal row near the milestone
          const iconCount = m.products.length;
          const iconSize = 64;
          const gap = 14;
          const rowWidth = iconCount * iconSize + (iconCount - 1) * gap;
          const iconRowLeft = pos.x - rowWidth / 2;
          const iconRowTop = pos.y - 95;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.18, duration: 0.5, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}
            >
              {/* Marker dot */}
              <div
                style={{
                  position: "absolute",
                  left: pos.x - 9,
                  top: pos.y - 9,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  background: "#8B6914",
                  border: "3px solid #F4EDDA",
                  boxShadow: "0 4px 12px rgba(26,16,8,0.3)",
                }}
              />

              {/* Label badge */}
              <div
                style={{
                  position: "absolute",
                  left: pos.x + labelOffsetX,
                  top: pos.y - 18,
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(8px)",
                  border: "2px solid #8B6914",
                  borderRadius: 16,
                  padding: "6px 14px",
                  boxShadow: "0 4px 12px rgba(26,16,8,0.12)",
                  pointerEvents: "auto",
                  width: 140,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#8B6914",
                    lineHeight: 1.1,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 11,
                    color: "rgba(26,16,8,0.7)",
                    marginTop: 2,
                  }}
                >
                  {m.quarter}
                </div>
              </div>

              {/* Product icons */}
              <div
                style={{
                  position: "absolute",
                  left: iconRowLeft,
                  top: iconRowTop,
                  display: "flex",
                  gap,
                  pointerEvents: "auto",
                }}
              >
                {m.products.map((p) => (
                  <ProductIcon3D
                    key={p.id}
                    product={p}
                    size={iconSize}
                    onClick={onSelectProduct}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}

      {/* Climber */}
      {size.w > 0 && climberKeyframes.x.length > 1 && (
        <motion.div
          initial={{ x: climberKeyframes.x[0], y: climberKeyframes.y[0], opacity: 0 }}
          animate={{
            x: climberKeyframes.x,
            y: climberKeyframes.y,
            opacity: 1,
          }}
          transition={{
            x: { duration: 3, ease: "easeInOut", delay: 0.6 },
            y: { duration: 3, ease: "easeInOut", delay: 0.6 },
            opacity: { duration: 0.4, delay: 0.6 },
          }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 5,
            transformOrigin: "bottom center",
            filter: "drop-shadow(0 6px 8px rgba(26,16,8,0.3))",
            animation:
              "roadmap-climber-bob 0.8s ease-in-out infinite, roadmap-climber-breathe 3s ease-in-out infinite",
          }}
        >
          <Climber />
        </motion.div>
      )}
    </div>
  );
}
