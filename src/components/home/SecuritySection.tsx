import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Key,
  Database,
  Activity,
  Eye,
  UserX,
  FileCheck,
  Clock,
  AlertTriangle,
  Users,
  Download,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

type Card = { icon: LucideIcon; title: string; desc: string };

const CARDS: Card[] = [
  { icon: Shield,        title: "Bank-Level Encryption",       desc: "AES-256 encryption for data at rest. TLS 1.3 for data in transit. Same security used by HDFC, ICICI, Axis Bank." },
  { icon: Lock,          title: "Row-Level Security",          desc: "PostgreSQL RLS policies isolate your business data. Zero cross-contamination between accounts." },
  { icon: Key,           title: "Zero-Knowledge Architecture", desc: "Financial data encrypted before reaching servers. We cannot decrypt your raw transaction data." },
  { icon: Database,      title: "Indian Data Residency",       desc: "All data in Mumbai AWS data centers. RBI compliant data localization. No data leaves India." },
  { icon: Activity,      title: "99.9% Accuracy Guarantee",    desc: "Real-time calculations validated against CA standards. Deterministic algorithms. Auditable by your CA." },
  { icon: Eye,           title: "Complete Transparency",       desc: "Every calculation shows formula. Every insight shows source data. No black box AI. Verify everything." },
  { icon: UserX,         title: "Your Data Stays Yours",       desc: "Never used to train Fynny or AI models. Your business intelligence remains confidential forever." },
  { icon: FileCheck,     title: "SOC 2 Compliance Ready",      desc: "Annual third-party security audits. Quarterly vulnerability assessments. Bi-annual penetration testing." },
  { icon: Clock,         title: "Complete Audit Trail",        desc: "Every import, change, access logged with timestamp and user ID. Full forensic trail for tax compliance." },
  { icon: AlertTriangle, title: "Real-Time Threat Detection",  desc: "Automatic rate limiting. Suspicious activity alerts. IP-based access controls at enterprise level." },
  { icon: Users,         title: "Role-Based Access Control",   desc: "Granular permissions for team members. Your CA sees tax data only. You control complete access." },
  { icon: Download,      title: "One-Click Data Export",       desc: "Download all data anytime in CSV or Excel. No vendor lock-in. Your data portable and deletable." },
];

const N = CARDS.length;
const STEP = 360 / N; // 30deg

function useViewport() {
  const [w, setW] = useState(typeof window === "undefined" ? 1280 : window.innerWidth);
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return {
    isMobile: w < 768,
    isTablet: w >= 768 && w < 1200,
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

export default function SecuritySection() {
  const { isMobile, isTablet } = useViewport();
  const reducedMotion = usePrefersReducedMotion();

  // activeIndex = which card is at center; rotation = -activeIndex * STEP
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setActiveIndex((i) => (i + 1) % N);
    }, 3000);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const rotation = -activeIndex * STEP;

  // sizing per breakpoint
  const radius = isMobile ? 360 : isTablet ? 600 : 800;
  const perspective = isMobile ? 1200 : isTablet ? 1500 : 2000;
  const cardW = isMobile ? 300 : isTablet ? 320 : 380;
  const cardH = isMobile ? 260 : isTablet ? 280 : 320;
  const containerH = isMobile ? 600 : 700;

  const goPrev = () => setActiveIndex((i) => (i - 1 + N) % N);
  const goNext = () => setActiveIndex((i) => (i + 1) % N);

  return (
    <section
      id="security"
      className="bg-fyn-beige relative overflow-hidden"
      style={{ padding: "120px 0" }}
    >
      <style>{`
        @keyframes fynBorderRotate {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .fyn-carousel-card {
          background: linear-gradient(135deg, #ffffff 0%, hsl(var(--card)) 100%);
          border: 2px solid hsl(var(--border));
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .fyn-carousel-card.is-center {
          border-color: transparent;
          box-shadow: 0 40px 100px rgba(196, 30, 30, 0.25);
        }
        .fyn-carousel-card.is-center::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: 0;
          border-radius: 26px;
          padding: 2px;
          background: conic-gradient(from 0deg, #C41E1E, #8B6914, #1A1008, #C41E1E);
          background-size: 200% 200%;
          animation: fynBorderRotate 6s linear infinite;
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          pointer-events: none;
        }
        .fyn-carousel-card > * { position: relative; z-index: 1; }

        .fyn-sec-headline {
          background: linear-gradient(90deg, #1A1008 0%, #C41E1E 100%);
          -webkit-background-clip: text;
                  background-clip: text;
          -webkit-text-fill-color: transparent;
                  color: transparent;
        }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 1400, padding: "0 40px" }}>
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full"
            style={{
              background: "linear-gradient(90deg, #C41E1E 0%, #8a1414 100%)",
              color: "#fff",
              padding: "10px 20px",
              fontSize: 11,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 16px rgba(196,30,30,0.3)",
            }}
          >
            <Shield size={18} strokeWidth={2} />
            Trusted by 1000+ Beta Users
          </span>

          <h2
            className="fyn-sec-headline mt-6 text-[36px] md:text-[56px] leading-[1.1]"
            style={{ fontFamily: "Georgia, serif", fontWeight: 700, marginBottom: 20 }}
          >
            Enterprise-Grade Security. Zero Compromise.
          </h2>

          <p
            className="text-fyn-ink/65 text-[18px] md:text-[22px]"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, maxWidth: 800, marginBottom: 60 }}
          >
            Your financial data deserves military-grade protection. Here's how we keep it safe.
          </p>
        </div>

        {/* 3D Carousel */}
        <div
          className="relative w-full flex items-center justify-center"
          style={{
            height: containerH,
            perspective: `${perspective}px`,
          }}
          onMouseEnter={() => (pausedRef.current = true)}
          onMouseLeave={() => (pausedRef.current = false)}
        >
          <div
            className="relative"
            style={{
              width: cardW,
              height: cardH,
              transformStyle: "preserve-3d",
            }}
          >
            {CARDS.map((card, i) => {
              // signed shortest delta from center, in steps
              let delta = i - activeIndex;
              if (delta > N / 2) delta -= N;
              if (delta < -N / 2) delta += N;
              const absDelta = Math.abs(delta);

              // visual params by distance from center
              let scale = 1;
              let opacity = 1;
              let blur = 0;
              let shadow = "0 40px 100px rgba(196,30,30,0.25)";
              let zIndex = 10;
              if (absDelta === 0) {
                scale = 1; opacity = 1; blur = 0; zIndex = 10;
                shadow = "0 40px 100px rgba(196,30,30,0.25)";
              } else if (absDelta === 1) {
                scale = 0.85; opacity = 0.7; blur = 0; zIndex = 5;
                shadow = "0 20px 60px rgba(0,0,0,0.18)";
              } else if (absDelta <= 4) {
                scale = 0.6; opacity = 0.4; blur = 2; zIndex = 2;
                shadow = "0 10px 30px rgba(0,0,0,0.15)";
              } else {
                scale = 0.4; opacity = 0.2; blur = 4; zIndex = 0;
                shadow = "0 6px 18px rgba(0,0,0,0.12)";
              }

              const cardRotateY = i * STEP + rotation;
              const isCenter = absDelta === 0;

              return (
                <motion.div
                  key={card.title}
                  className={`fyn-carousel-card ${isCenter ? "is-center" : ""}`}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: cardW,
                    height: cardH,
                    pointerEvents: isCenter ? "auto" : "none",
                    boxShadow: shadow,
                    transformOrigin: "center center",
                  }}
                  animate={{
                    rotateY: cardRotateY,
                    scale,
                    opacity,
                    filter: blur ? `blur(${blur}px)` : "blur(0px)",
                  }}
                  transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                  // initial transform applied via style for translateZ baseline
                  initial={false}
                >
                  <div
                    style={{
                      transform: `translateZ(${radius}px)`,
                      transformStyle: "preserve-3d",
                      width: "100%",
                      height: "100%",
                      padding: isMobile ? 28 : 40,
                      display: "flex",
                      flexDirection: "column",
                      zIndex: zIndex as number,
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        background: "hsl(var(--primary) / 0.10)",
                        boxShadow: "0 8px 24px rgba(196,30,30,0.15)",
                        marginBottom: 20,
                        transform: "translateZ(20px)",
                      }}
                    >
                      <card.icon size={48} strokeWidth={2} style={{ color: "hsl(var(--primary))" }} />
                    </div>

                    <h3
                      className="text-fyn-ink"
                      style={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 700,
                        fontSize: isMobile ? 20 : 24,
                        marginBottom: 12,
                      }}
                    >
                      {card.title}
                    </h3>

                    <p
                      className="text-fyn-ink/70"
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 400,
                        fontSize: isMobile ? 14 : 15,
                        lineHeight: 1.6,
                      }}
                    >
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-center" style={{ gap: 40, marginTop: 24 }}>
          <button
            onClick={goPrev}
            aria-label="Previous card"
            className="flex items-center justify-center transition-transform hover:-translate-y-0.5"
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #C41E1E 0%, #a01818 100%)",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(196,30,30,0.35)",
              border: "none", cursor: "pointer",
            }}
          >
            <ChevronLeft size={26} />
          </button>
          <button
            onClick={goNext}
            aria-label="Next card"
            className="flex items-center justify-center transition-transform hover:-translate-y-0.5"
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #C41E1E 0%, #a01818 100%)",
              color: "#fff",
              boxShadow: "0 8px 24px rgba(196,30,30,0.35)",
              border: "none", cursor: "pointer",
            }}
          >
            <ChevronRight size={26} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center flex-wrap" style={{ gap: 10, marginTop: 24 }}>
          {CARDS.map((_, i) => {
            const active = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Go to card ${i + 1}`}
                style={{
                  width: active ? 12 : 8,
                  height: active ? 12 : 8,
                  borderRadius: "50%",
                  background: active ? "#C41E1E" : "rgba(196,30,30,0.25)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center text-center" style={{ marginTop: 80 }}>
          <p
            className="text-fyn-ink/60 mb-4"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, fontSize: 16 }}
          >
            Want technical security details?
          </p>
          <Link
            to="/security"
            className="inline-flex items-center gap-2 rounded-lg transition-all hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(90deg, #C41E1E 0%, #a01818 100%)",
              color: "white",
              padding: "14px 28px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 15,
              boxShadow: "0 8px 24px rgba(196,30,30,0.3)",
            }}
          >
            Read Security Documentation
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
