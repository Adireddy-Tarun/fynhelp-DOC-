import { useState } from "react";
import Layout from "@/components/Layout";
import MountainScene from "@/components/roadmap/MountainScene";
import ProductWidgetModal, {
  type ModalProduct,
} from "@/components/products/ProductWidgetModal";
import type { RoadmapProduct } from "@/components/roadmap/roadmapData";

export default function RoadmapPage() {
  const [active, setActive] = useState<ModalProduct | null>(null);

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
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          padding: "80px 20px",
          background:
            "linear-gradient(180deg, #F4EDDA 0%, rgba(244, 237, 218, 0.6) 100%)",
          overflow: "hidden",
        }}
      >
        {/* Subtle noise texture */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.05,
            pointerEvents: "none",
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Title block */}
        <header
          style={{
            position: "relative",
            zIndex: 6,
            textAlign: "center",
            marginBottom: 40,
            maxWidth: 800,
            marginInline: "auto",
          }}
        >
          <h1
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(32px, 5vw, 48px)",
              color: "#1A1008",
              letterSpacing: "-1px",
              margin: 0,
              lineHeight: 1.05,
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
              color: "rgba(26,16,8,0.65)",
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
        <div style={{ position: "relative", zIndex: 4 }}>
          <MountainScene onSelectProduct={handleSelect} />
        </div>

        {/* Legend */}
        <div
          style={{
            position: "relative",
            zIndex: 6,
            marginTop: 40,
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
