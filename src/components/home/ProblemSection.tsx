import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  EyeOff,
  AlertTriangle,
  TrendingDown,
  LineChart,
  Calculator,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type Slide = {
  id: string;
  Icon: LucideIcon;
  eyebrow: string;
  headline: string;
  statValue: string;
  statLabel: string;
  body: string;
  accent: string; // hex
};

const SLIDES: Slide[] = [
  {
    id: "blindness",
    Icon: EyeOff,
    eyebrow: "Cash Flow Blindness",
    headline:
      "63 million Indian businesses make ₹Crore decisions with zero financial intelligence.",
    statValue: "₹0",
    statLabel: "Average financial intelligence budget for Indian SMEs",
    body: "No CFO. No analyst. No financial model. Just gut feeling and a bank balance check.",
    accent: "#C41E1E",
  },
  {
    id: "crisis",
    Icon: AlertTriangle,
    eyebrow: "Cash Crisis Reality",
    headline: "42% of Indian SMEs cite cash flow as their #1 challenge.",
    statValue: "14 days",
    statLabel: "Average time before a cash crisis is discovered",
    body: "Most owners discover a cash crisis 14 days before it happens — not 60 days out, when something can still be done about it.",
    accent: "#C41E1E",
  },
  {
    id: "leak",
    Icon: TrendingDown,
    eyebrow: "Hidden Money Loss",
    headline: "₹3.2L lost per SME annually to GST mismatches.",
    statValue: "₹3.2L",
    statLabel: "Lost per business yearly to ITC leakage",
    body: "Vendor non-compliance, missed reconciliations, and unclaimed credit silently drain Indian businesses that can least afford it.",
    accent: "#8B6914",
  },
  {
    id: "failure",
    Icon: LineChart,
    eyebrow: "Business Failure Rate",
    headline: "50% of Indian businesses fail within 5 years.",
    statValue: "50%",
    statLabel: "SMEs that fail within 5 years of starting up",
    body: "Most failures are not caused by bad products or poor sales — they are caused by cash flow mismanagement and compliance surprises.",
    accent: "#C41E1E",
  },
  {
    id: "cost",
    Icon: Calculator,
    eyebrow: "The Real Cost",
    headline: "98% of Indian SMEs operate financially blind.",
    statValue: "98%",
    statLabel: "SMEs that cannot afford a CFO today",
    body: "Manufacturers in Ludhiana, traders in Surat, clinics in Chennai, exporters in Tiruppur — making critical calls on hiring, credit, inventory, and compliance purely on gut feel.",
    accent: "#8B6914",
  },
];

const AUTO_MS = 6000;

export default function ProblemSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const touchStart = useRef<number | null>(null);

  // Auto-advance + progress bar
  useEffect(() => {
    if (paused) return;
    setProgress(0);
    const tick = 50;
    const step = (100 / AUTO_MS) * tick;
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(100, p + step));
    }, tick);
    const advance = setTimeout(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_MS);
    return () => {
      clearInterval(progressTimer);
      clearTimeout(advance);
    };
  }, [index, paused]);

  const goTo = (i: number) => {
    setIndex((i + SLIDES.length) % SLIDES.length);
    setProgress(0);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 50) goTo(index + (dx < 0 ? 1 : -1));
    touchStart.current = null;
  };

  return (
    <section className="bg-fyn-beige py-24">
      <div className="fyn-container">
        {/* Section heading */}
        <div className="mb-10 text-center">
          <span
            className="block mb-3"
            style={{
              fontFamily: "'Work Sans', sans-serif",
              fontWeight: 600,
              fontSize: 12,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#C41E1E",
            }}
          >
            ◆ The Problem
          </span>
          <h2
            className="text-fyn-ink"
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px, 3vw, 40px)",
              lineHeight: 1.15,
              letterSpacing: "0.005em",
            }}
          >
            India's SMEs are flying blind.
          </h2>
        </div>

        {/* Carousel */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          aria-roledescription="carousel"
          aria-label="The problem facing Indian SMEs"
        >
          {/* Stage */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-2xl"
            style={{
              background: "linear-gradient(180deg, #1F1610 0%, #15100A 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              minHeight: 460,
              boxShadow:
                "0 30px 80px -20px rgba(0,0,0,0.45), 0 0 0 1px rgba(196,30,30,0.06)",
            }}
          >
            {/* Slides */}
            {SLIDES.map((s, i) => (
              <SlideView key={s.id} slide={s} active={i === index} idx={i} total={SLIDES.length} />
            ))}

            {/* Arrows */}
            <button
              aria-label="Previous slide"
              onClick={() => goTo(index - 1)}
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all hover:scale-110"
              style={{
                left: 16,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#FFFFFF",
                backdropFilter: "blur(8px)",
                zIndex: 5,
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              aria-label="Next slide"
              onClick={() => goTo(index + 1)}
              className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all hover:scale-110"
              style={{
                right: 16,
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#FFFFFF",
                backdropFilter: "blur(8px)",
                zIndex: 5,
              }}
            >
              <ChevronRight size={20} />
            </button>

            {/* Progress bar */}
            <div
              className="absolute left-0 right-0 bottom-0"
              style={{ height: 3, background: "rgba(255,255,255,0.06)" }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "#C41E1E",
                  transition: "width 50ms linear",
                }}
              />
            </div>
          </div>

          {/* Dots + counter */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => goTo(i)}
                  className="transition-all"
                  style={{
                    width: i === index ? 28 : 8,
                    height: 8,
                    borderRadius: 100,
                    background: i === index ? "#C41E1E" : "rgba(26,16,8,0.25)",
                  }}
                />
              ))}
            </div>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: "rgba(26,16,8,0.55)",
              }}
            >
              {String(index + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            to="/#product-ecosystem"
            className="inline-flex items-center gap-2 hover:underline"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: 15,
              color: "#C41E1E",
            }}
          >
            See how FynHelp fixes this →
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Single Slide ── */
function SlideView({
  slide,
  active,
  idx,
  total,
}: {
  slide: Slide;
  active: boolean;
  idx: number;
  total: number;
}) {
  const { Icon } = slide;
  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${idx + 1} of ${total}`}
      aria-hidden={!active}
      className="absolute inset-0"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? "translateX(0)" : "translateX(20px)",
        transition: "opacity 600ms ease, transform 600ms ease",
        pointerEvents: active ? "auto" : "none",
      }}
    >
      {/* Accent glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${slide.accent}33, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      <div className="grid lg:grid-cols-5 gap-8 items-center h-full p-8 md:p-12 lg:p-14">
        {/* Left: copy */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: `${slide.accent}1F`,
                border: `1px solid ${slide.accent}55`,
                color: slide.accent,
              }}
            >
              <Icon size={22} strokeWidth={1.8} />
            </div>
            <span
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: slide.accent,
              }}
            >
              {slide.eyebrow}
            </span>
          </div>

          <h3
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: "clamp(26px, 2.6vw, 38px)",
              lineHeight: 1.15,
              color: "#FFFFFF",
              marginBottom: 18,
            }}
          >
            {slide.headline}
          </h3>

          <p
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontWeight: 400,
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 560,
            }}
          >
            {slide.body}
          </p>
        </div>

        {/* Right: stat card */}
        <div className="lg:col-span-2">
          <div
            className="relative"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 14,
              padding: "28px 26px",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 26,
                right: 26,
                height: 2,
                background: slide.accent,
                borderRadius: 2,
              }}
            />
            <div
              style={{
                fontFamily: "'Work Sans', sans-serif",
                fontWeight: 600,
                fontSize: 10,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.45)",
                marginBottom: 10,
              }}
            >
              The Number
            </div>
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontWeight: 700,
                fontSize: "clamp(56px, 7vw, 88px)",
                lineHeight: 1,
                color: slide.accent,
                letterSpacing: "-0.02em",
                marginBottom: 14,
              }}
            >
              {slide.statValue}
            </div>
            <div
              style={{
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.78)",
              }}
            >
              {slide.statLabel}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
