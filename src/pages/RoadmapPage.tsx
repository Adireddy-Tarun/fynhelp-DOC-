import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import MountainScene from "@/components/roadmap/MountainScene";
import ProductWidgetModal, {
  type ModalProduct,
} from "@/components/products/ProductWidgetModal";
import type { RoadmapProduct } from "@/components/roadmap/roadmapData";

/** Distant background peaks — soft faded gold silhouettes for depth. */
function DistantPeaks() {
  return (
    <svg
      className="roadmap-distant-peaks"
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden
    >
      <defs>
        <linearGradient id="distantPeak" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#8B6914" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#8B6914" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <polygon points="-50,720 200,520 380,640 520,560 700,720 900,720 -50,820" fill="url(#distantPeak)" />
      <polygon points="700,720 900,500 1080,620 1280,540 1500,720 1500,820 700,820" fill="url(#distantPeak)" />
      <polygon points="1080,720 1240,580 1400,660 1500,640 1500,820 1080,820" fill="url(#distantPeak)" opacity="0.7" />
    </svg>
  );
}

interface CloudCfg {
  top: string;
  left: string;
  size: number;
  dir: "l2r" | "r2l";
  dur: number;
  delay: number;
  opacity: number;
}

const CLOUDS: CloudCfg[] = [
  { top: "8%",  left: "10%", size: 220, dir: "l2r", dur: 70, delay: 0,  opacity: 0.85 },
  { top: "14%", left: "55%", size: 160, dir: "r2l", dur: 90, delay: 12, opacity: 0.75 },
  { top: "20%", left: "80%", size: 120, dir: "l2r", dur: 80, delay: 6,  opacity: 0.7  },
  { top: "32%", left: "5%",  size: 180, dir: "r2l", dur: 85, delay: 20, opacity: 0.7  },
  { top: "38%", left: "70%", size: 140, dir: "l2r", dur: 75, delay: 4,  opacity: 0.65 },
  { top: "48%", left: "20%", size: 100, dir: "l2r", dur: 60, delay: 18, opacity: 0.6  },
  { top: "55%", left: "85%", size: 200, dir: "r2l", dur: 95, delay: 8,  opacity: 0.7  },
  { top: "62%", left: "8%",  size: 130, dir: "l2r", dur: 70, delay: 14, opacity: 0.6  },
  { top: "70%", left: "60%", size: 110, dir: "r2l", dur: 65, delay: 2,  opacity: 0.55 },
  { top: "80%", left: "30%", size: 90,  dir: "l2r", dur: 55, delay: 22, opacity: 0.55 },
];

const RAYS = [
  { left: "82%", rotate: -18 },
  { left: "75%", rotate: -12 },
  { left: "88%", rotate: -25 },
  { left: "70%", rotate: -8  },
];

export default function RoadmapPage() {
  const [active, setActive] = useState<ModalProduct | null>(null);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        left: `${(i * 41 + 7) % 96}%`,
        top: `${20 + ((i * 23) % 70)}%`,
        dur: 10 + (i % 6),
        delay: (i % 9) * 1.3,
        size: 3 + (i % 3),
      })),
    [],
  );

  const handleSelect = (p: RoadmapProduct) => {
    setActive({
      name: p.name,
      description: p.longDescription,
      widget: p.widget,
      href: p.href,
      status: p.status,
    });
  };

  return (
    <Layout>
      <section className="roadmap-scene" style={{ padding: "80px 20px 120px" }}>
        <div className="roadmap-noise" />

        {/* Distant peaks */}
        <DistantPeaks />

        {/* Sun glow */}
        <div className="roadmap-sun" aria-hidden />

        {/* Light rays */}
        {RAYS.map((r, i) => (
          <div
            key={`ray-${i}`}
            className="roadmap-ray"
            aria-hidden
            style={{
              left: r.left,
              transform: `rotate(${r.rotate}deg)`,
              animationDelay: `${i * 1.2}s`,
            }}
          />
        ))}

        {/* Birds */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "12%",
            right: "8%",
            zIndex: 4,
            display: "flex",
            gap: 6,
            animation: "roadmap-bird-fly 60s linear infinite",
          }}
        >
          <span className="roadmap-bird">ᐯ</span>
          <span className="roadmap-bird" style={{ marginTop: -4 }}>ᐯ</span>
          <span className="roadmap-bird" style={{ marginTop: -8 }}>ᐯ</span>
          <span className="roadmap-bird" style={{ marginTop: -4 }}>ᐯ</span>
          <span className="roadmap-bird">ᐯ</span>
        </div>

        {/* Decorative clouds */}
        {CLOUDS.map((c, i) => (
          <div
            key={`cloud-${i}`}
            className="roadmap-cloud"
            aria-hidden
            style={{
              top: c.top,
              left: c.left,
              width: c.size,
              height: c.size * 0.45,
              opacity: c.opacity,
              animation: `roadmap-cloud-drift-${c.dir} ${c.dur}s linear ${c.delay}s infinite`,
            }}
          />
        ))}

        {/* Sparkle particles */}
        {sparkles.map((s, i) => (
          <div
            key={`spark-${i}`}
            className="roadmap-sparkle"
            aria-hidden
            style={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              animation: `roadmap-sparkle-float ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}

        {/* Ground horizon */}
        <div className="roadmap-ground" aria-hidden />

        {/* Title block */}
        <header
          style={{
            position: "relative",
            zIndex: 8,
            textAlign: "center",
            marginBottom: 32,
            maxWidth: 800,
            marginInline: "auto",
          }}
        >
          <h1
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 52px)",
              color: "#1A1008",
              letterSpacing: "-1px",
              margin: 0,
              lineHeight: 1.05,
              textShadow: "0 2px 12px rgba(244,237,218,0.6)",
            }}
          >
            Roadmap
          </h1>
          <p
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "#8B6914",
              marginTop: 12,
              marginBottom: 0,
            }}
          >
            Your Journey to Financial Excellence
          </p>
          <p
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 14,
              color: "rgba(26,16,8,0.7)",
              marginTop: 16,
              maxWidth: 620,
              marginInline: "auto",
              lineHeight: 1.6,
            }}
          >
            Building the complete financial operating system for Indian businesses.
            Climb with us — from Base Camp to Summit, one Intelligence Suite at a time.
          </p>
        </header>

        {/* Mountain scene */}
        <div style={{ position: "relative", zIndex: 5 }}>
          <MountainScene onSelectProduct={handleSelect} />
        </div>

        {/* Legend */}
        <div
          style={{
            position: "relative",
            zIndex: 8,
            marginTop: 32,
            display: "flex",
            justifyContent: "center",
            gap: 24,
            flexWrap: "wrap",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#1A1008",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 5,
                background: "#10B981",
                boxShadow: "0 0 0 2px rgba(16,185,129,0.25)",
              }}
            />
            Live today — click to open
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: 5,
                background: "#6B7280",
              }}
            />
            Coming soon — preview the experience
          </span>
        </div>
      </section>

      <ProductWidgetModal product={active} onClose={() => setActive(null)} />
    </Layout>
  );
}
