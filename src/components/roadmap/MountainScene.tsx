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

/** Sample N points along an SVG path so we can position DOM overlays. */
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
      setIsMobile(width < 640);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const points = usePathPoints(PATH_D, 200);
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

  // Convert SVG coords → CSS pixels.
  const toPx = (sx: number, sy: number) => ({
    x: (sx / VIEW_W) * size.w,
    y: (sy / VIEW_H) * size.h,
  });

  // Climber walk-on keyframes
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

  /** Compute icon position in circular orbit around milestone center. */
  const orbitPosition = (
    centerX: number,
    centerY: number,
    angleDeg: number,
    radius: number,
  ) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: centerX + Math.cos(rad) * radius,
      y: centerY + Math.sin(rad) * radius,
    };
  };

  /** Per-milestone orbit configs (angle list), alternating sides of the path. */
  const orbitConfigs: { radius: number; angles: number[] }[] = [
    { radius: 95,  angles: [-150, -180, -210] }, // Base Camp — left/below
    { radius: 95,  angles: [-30, 0, 30] },        // Mid Slope — right
    { radius: 95,  angles: [-150, -180, -210] }, // High Ridge — left
    { radius: 90,  angles: [-110, -90, -70] },    // Summit — fan above
  ];

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
            <stop offset="0%" stopColor="#3A2410" />
            <stop offset="35%" stopColor="#2A1A0C" />
            <stop offset="100%" stopColor="#1A1008" />
          </linearGradient>
          <linearGradient id="frontPeakLit" x1="0" x2="1" y1="0" y2="0.6">
            <stop offset="0%" stopColor="#8B6914" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#1A1008" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="midPeak" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#2A1A0C" />
            <stop offset="100%" stopColor="#1A1008" />
          </linearGradient>
          <linearGradient id="backPeak" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#3A2410" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#1A1008" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="summitGlow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#8B6914" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#8B6914" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="snowGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#F4EDDA" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F4EDDA" />
          </linearGradient>
          <filter id="pathGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Back peaks */}
        <polygon points="80,680 380,250 580,680" fill="url(#backPeak)" />
        <polygon points="540,680 820,300 980,680" fill="url(#backPeak)" />

        {/* Mid peak */}
        <polygon points="160,680 520,180 760,680" fill="url(#midPeak)" />

        {/* Summit glow */}
        <circle cx="720" cy="120" r="140" fill="url(#summitGlow)" />

        {/* Front peak (main mountain) */}
        <polygon points="180,680 720,90 880,680" fill="url(#frontPeak)" />
        {/* Lit slope overlay (sun-facing left side) */}
        <polygon points="180,680 720,90 720,680" fill="url(#frontPeakLit)" />

        {/* Subtle rock shading lines */}
        <path d="M 320 540 L 540 320 M 380 600 L 620 280 M 460 640 L 680 220" 
              stroke="#1A1008" strokeWidth="1.2" opacity="0.25" />

        {/* Snow cap — jagged */}
        <path
          d="M 660 200 L 685 160 L 705 175 L 720 90 L 735 175 L 755 160 L 780 200 L 760 215 L 738 195 L 720 215 L 702 195 L 680 215 Z"
          fill="url(#snowGrad)"
          style={{ filter: "drop-shadow(0 -8px 24px rgba(139,105,20,0.5))" }}
        />

        {/* Golden path — thick + glow */}
        <path
          d={PATH_D}
          stroke="#8B6914"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray="10 6"
          filter="url(#pathGlow)"
          style={{ animation: "roadmap-path-dash 4s linear infinite" }}
          opacity="0.95"
        />
        {/* Inner brighter highlight */}
        <path
          d={PATH_D}
          stroke="#D9A441"
          strokeWidth="2.5"
          fill="none"
          opacity="0.6"
          strokeLinecap="round"
        />
      </svg>

      {/* Traveling dots along the path (CSS offset-path) */}
      {[0, 2, 4, 6].map((delay) => (
        <div
          key={`pdot-${delay}`}
          className="roadmap-path-dot"
          aria-hidden
          style={{
            offsetPath: `path('${PATH_D}')`,
            // Scale dot positioning to container size
            transform: `scale(${size.w ? size.w / VIEW_W : 1})`,
            transformOrigin: "0 0",
            animationDelay: `${delay}s`,
          }}
        />
      ))}

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
          const labelOffsetX = m.labelSide === "right" ? 90 : -240;
          const labelOffsetY = -22;
          const labelCenterX = pos.x + labelOffsetX + 75;
          const labelCenterY = pos.y + labelOffsetY + 22;

          // Icon orbit
          const cfg = orbitConfigs[idx];
          const isCurrentMilestone = idx === climberTargetIdx;
          const iconSize = isMobile ? 56 : isCurrentMilestone ? 72 : 64;
          const iconOpacity = isCurrentMilestone ? 1 : 0.78;

          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.18, duration: 0.5, ease: "easeOut" }}
              style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}
            >
              {/* Connector line from path to label */}
              <svg
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  overflow: "visible",
                }}
                aria-hidden
              >
                <line
                  x1={pos.x}
                  y1={pos.y}
                  x2={labelCenterX}
                  y2={labelCenterY}
                  stroke="#8B6914"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
              </svg>

              {/* Marker dot */}
              <div
                style={{
                  position: "absolute",
                  left: pos.x - 10,
                  top: pos.y - 10,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: "#8B6914",
                  border: "3px solid #F4EDDA",
                  boxShadow:
                    "0 4px 12px rgba(26,16,8,0.35), 0 0 0 4px rgba(139,105,20,0.18)",
                }}
              />

              {/* Label badge — gold border, gold text */}
              <div
                style={{
                  position: "absolute",
                  left: pos.x + labelOffsetX,
                  top: pos.y + labelOffsetY,
                  background: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(12px) saturate(110%)",
                  WebkitBackdropFilter: "blur(12px) saturate(110%)",
                  border: "3px solid #8B6914",
                  borderRadius: 18,
                  padding: "10px 20px",
                  boxShadow:
                    "0 6px 20px rgba(139,105,20,0.25), inset 0 1px 0 rgba(255,255,255,0.8)",
                  pointerEvents: "auto",
                  width: 150,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Raleway', sans-serif",
                    fontWeight: 600,
                    fontSize: 18,
                    color: "#8B6914",
                    lineHeight: 1.1,
                    letterSpacing: 0.5,
                  }}
                >
                  {m.label}
                </div>
                <div
                  style={{
                    fontFamily: "'Roboto', sans-serif",
                    fontSize: 13,
                    color: "#1A1008",
                    opacity: 0.7,
                    marginTop: 4,
                  }}
                >
                  {m.quarter}
                </div>
              </div>

              {/* Product icons — circular orbit around milestone */}
              {m.products.map((p, i) => {
                const angle = cfg.angles[i] ?? cfg.angles[0];
                const orbit = orbitPosition(pos.x, pos.y, angle, cfg.radius);
                return (
                  <div
                    key={p.id}
                    style={{
                      position: "absolute",
                      left: orbit.x - iconSize / 2,
                      top: orbit.y - iconSize / 2,
                      pointerEvents: "auto",
                      opacity: iconOpacity,
                      transition: "opacity 0.4s ease",
                    }}
                  >
                    <ProductIcon3D
                      product={p}
                      size={iconSize}
                      onClick={onSelectProduct}
                    />
                  </div>
                );
              })}
            </motion.div>
          );
        })}

      {/* Climber */}
      {size.w > 0 && climberKeyframes.x.length > 1 && (
        <motion.div
          initial={{
            x: climberKeyframes.x[0] - 80,
            y: climberKeyframes.y[0] + 40,
            opacity: 0,
          }}
          animate={{
            x: climberKeyframes.x,
            y: climberKeyframes.y,
            opacity: 1,
          }}
          transition={{
            x: { duration: 3.2, ease: "easeInOut", delay: 0.8 },
            y: { duration: 3.2, ease: "easeInOut", delay: 0.8 },
            opacity: { duration: 0.5, delay: 0.8 },
          }}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            zIndex: 10,
            transformOrigin: "bottom center",
            filter: "drop-shadow(0 6px 8px rgba(26,16,8,0.35))",
          }}
        >
          <div
            style={{
              animation:
                "roadmap-climber-bob 0.8s ease-in-out infinite, roadmap-climber-breathe 3s ease-in-out infinite",
            }}
          >
            <Climber />
          </div>
        </motion.div>
      )}
    </div>
  );
}
