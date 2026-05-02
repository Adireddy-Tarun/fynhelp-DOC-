import { useState } from "react";
import Layout from "@/components/Layout";
import HairpinScene from "@/components/roadmap/HairpinScene";
import { type HairpinStop } from "@/components/roadmap/hairpinStops";
import ProductWidgetModal, {
  type ModalProduct,
} from "@/components/products/ProductWidgetModal";

export default function RoadmapPage() {
  const [active, setActive] = useState<ModalProduct | null>(null);

  const handleSelect = (s: HairpinStop) => {
    setActive({
      name: s.name,
      description: s.description,
      widget: s.widget,
      href: s.href,
      status: s.status,
    });
  };

  return (
    <Layout>
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          padding: "64px 20px 96px",
          background:
            "linear-gradient(180deg, #FAF6EE 0%, #F2E8D2 55%, #E8DCC8 100%)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "relative",
            zIndex: 5,
            textAlign: "center",
            maxWidth: 760,
            margin: "0 auto 40px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Playfair Display', 'Oswald', serif",
              fontWeight: 900,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.05,
              color: "#2C2418",
              margin: 0,
              letterSpacing: "-1px",
            }}
          >
            Roadmap
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: "clamp(15px, 2vw, 18px)",
              color: "#C9A84C",
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            Your Journey to Financial Excellence
          </p>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "#6B5D4D",
              marginTop: 14,
              maxWidth: 580,
              marginInline: "auto",
              lineHeight: 1.6,
            }}
          >
            Building the complete financial operating system for Indian businesses.
            Climb with us — from shore to summit, one Intelligence Suite at a time.
          </p>
        </header>

        {/* Mountain hairpin scene */}
        <div style={{ position: "relative", zIndex: 4 }}>
          <HairpinScene onSelectStop={handleSelect} />
        </div>

        {/* Legend */}
        <div
          style={{
            position: "relative",
            zIndex: 5,
            marginTop: 28,
            display: "flex",
            justifyContent: "center",
            gap: 22,
            flexWrap: "wrap",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#2C2418",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: "#34C759", boxShadow: "0 0 0 2px rgba(52,199,89,0.25)" }} />
            Live today — click to open
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: 5, background: "#FF9F0A" }} />
            Coming soon — preview the experience
          </span>
        </div>
      </section>

      <ProductWidgetModal product={active} onClose={() => setActive(null)} />
    </Layout>
  );
}
