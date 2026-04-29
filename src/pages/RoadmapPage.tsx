import { useState } from "react";
import Layout from "@/components/Layout";
import NotifyMeModal from "@/components/NotifyMeModal";
import SuiteStatusBadge from "@/components/SuiteStatusBadge";
import { SUITES, QUARTERS, type SuiteMeta } from "@/data/suiteStatus";

const stripeBg = {
  backgroundImage:
    "repeating-linear-gradient(45deg, transparent 0, transparent 10px, rgba(249,247,244,0.3) 10px, rgba(249,247,244,0.3) 20px)",
};

function FeatureCard({ suite, onNotify }: { suite: SuiteMeta; onNotify: (id: string) => void }) {
  const Icon = suite.Icon;
  return (
    <div
      id={suite.id}
      className="relative bg-fyn-beige-card rounded-lg p-6 overflow-hidden scroll-mt-24"
      style={{
        border: "1px dashed #E5E7EB",
        ...stripeBg,
      }}
    >
      {/* Diagonal "In Development" watermark */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        style={{
          transform: "rotate(-15deg)",
          fontSize: 28,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#9CA3AF",
          opacity: 0.1,
          fontWeight: 700,
        }}
      >
        In Development
      </span>

      <div className="relative" style={{ opacity: 0.85 }}>
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center"
            style={{ background: "rgba(107,114,128,0.10)" }}
          >
            <Icon size={20} color="#6B7280" />
          </div>
          <SuiteStatusBadge status={suite.status} />
        </div>
        <h3 className="font-serif text-fyn-ink mb-1" style={{ fontSize: 18, fontWeight: 700 }}>
          {suite.name}
        </h3>
        <p className="text-xs font-semibold text-fyn-ink/70 mb-3">
          Launching <span className="text-fyn-ink">{suite.quarter}</span>
        </p>
        <p className="text-[13px] text-fyn-ink/70 leading-relaxed mb-4">{suite.description}</p>
        <p className="text-[11px] uppercase tracking-wider text-fyn-ink/50 mb-3">
          Currently in development
        </p>
        <button
          type="button"
          onClick={() => onNotify(suite.id)}
          className="w-full py-2.5 rounded-md bg-fyn-ink text-white text-sm font-medium hover:opacity-90"
          style={{ transition: "opacity 200ms" }}
        >
          Notify me at launch
        </button>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  const [modalSuite, setModalSuite] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const openNotify = (id: string) => {
    setModalSuite(id);
    setModalOpen(true);
  };

  const liveSuites = SUITES.filter((s) => s.status === "live");

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-fyn-ink py-16">
        <div className="fyn-container text-center">
          <span className="fyn-label block mb-4 font-sans text-[#8e7343] text-base">
            WHAT'S NEXT
          </span>
          <h1
            className="text-white max-w-[900px] mx-auto mb-4 font-serif font-bold"
            style={{ fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.15 }}
          >
            Product Roadmap
          </h1>
          <p className="text-white/60 text-lg max-w-[680px] mx-auto">
            Building the complete financial operating system for Indian businesses. One Intelligence Suite is live today; nine more arrive over the next 18 months.
          </p>
        </div>
      </section>

      {/* Available Now strip */}
      <section className="fyn-section" style={{ background: "#F9F7F4", paddingBlock: 48 }}>
        <div className="fyn-container">
          <div className="flex items-center gap-3 mb-6">
            <span
              className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md text-white"
              style={{ background: "#10B981" }}
            >
              Available Now
            </span>
            <h2 className="font-serif text-fyn-ink" style={{ fontSize: 22, fontWeight: 700 }}>
              Live today
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {liveSuites.map((s) => {
              const Icon = s.Icon;
              return (
                <a
                  key={s.id}
                  href={s.href}
                  className="block bg-fyn-beige-card border rounded-lg p-6 hover:shadow-md transition-all"
                  style={{ borderColor: "#E5E7EB" }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="w-10 h-10 rounded-md flex items-center justify-center"
                      style={{ background: "rgba(196,30,30,0.10)" }}
                    >
                      <Icon size={20} color="#C41E1E" />
                    </div>
                    <SuiteStatusBadge status="live" />
                  </div>
                  <h3 className="font-serif text-fyn-ink mb-2" style={{ fontSize: 18, fontWeight: 700 }}>
                    {s.name}
                  </h3>
                  <p className="text-[13px] text-fyn-ink/70 leading-relaxed">{s.description}</p>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quarters timeline */}
      <section className="fyn-section" style={{ background: "#F9F7F4", paddingBottom: 96 }}>
        <div className="fyn-container">
          {QUARTERS.map((q) => {
            const inQuarter = SUITES.filter((s) => s.quarter === q);
            if (inQuarter.length === 0) return null;
            return (
              <div key={q} className="mb-12">
                <div className="flex items-baseline gap-3 mb-6">
                  <h2 className="font-serif text-fyn-ink" style={{ fontSize: 28, fontWeight: 700 }}>
                    {q}
                  </h2>
                  <span className="text-sm text-fyn-ink/50">
                    {inQuarter.length} suite{inQuarter.length > 1 ? "s" : ""} launching
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inQuarter.map((s) => (
                    <FeatureCard key={s.id} suite={s} onNotify={openNotify} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <NotifyMeModal
        open={modalOpen}
        initialModuleId={modalSuite}
        onClose={() => setModalOpen(false)}
      />
    </Layout>
  );
}
