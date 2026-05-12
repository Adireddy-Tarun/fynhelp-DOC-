import { AnimatePresence, motion } from "framer-motion";
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
  { icon: Shield,        title: "Bank-Level Encryption",       desc: "AES-256 encryption for data at rest. TLS 1.3 for data in transit. Same security standards used by HDFC, ICICI, and Axis Bank." },
  { icon: Lock,          title: "Row-Level Security",          desc: "PostgreSQL RLS policies isolate your business data. Zero cross-contamination between accounts. Database-level protection." },
  { icon: Key,           title: "Zero-Knowledge Architecture", desc: "Your financial data encrypted before reaching servers. We cannot decrypt or access your raw transaction data." },
  { icon: Database,      title: "Indian Data Residency",       desc: "All data stored in Mumbai AWS data centers. Compliant with RBI data localization regulations. No data leaves Indian jurisdiction." },
  { icon: Activity,      title: "99.9% Accuracy Guarantee",    desc: "Real-time calculations validated against CA standards. Deterministic algorithms, not AI guesswork. Auditable by your chartered accountant." },
  { icon: Eye,           title: "Complete Transparency",       desc: "Every calculation shows its formula. Every insight shows its source data. No black box AI making decisions you cannot verify." },
  { icon: UserX,         title: "Your Data Stays Yours",       desc: "We never use your financial data to train Fynny or any AI models. Your business intelligence remains confidential forever." },
  { icon: FileCheck,     title: "SOC 2 Compliance Ready",      desc: "Annual third-party security audits. Quarterly vulnerability assessments. Bi-annual penetration testing by certified firms." },
  { icon: Clock,         title: "Complete Audit Trail",        desc: "Every data import, every change, every access logged with timestamp and user ID. Complete forensic trail for compliance and tax audits." },
  { icon: AlertTriangle, title: "Real-Time Threat Detection",  desc: "Automatic rate limiting. Suspicious activity alerts. IP-based access controls. Enterprise security without enterprise cost." },
  { icon: Users,         title: "Role-Based Access Control",   desc: "Granular permissions for team members. Your CA sees tax data only. Founders see everything. You control who sees what." },
  { icon: Download,      title: "One-Click Data Export",       desc: "Download all your data anytime in CSV or Excel format. No vendor lock-in. Your data is portable and yours to keep forever." },
];

const N = CARDS.length;
const SWIPE_THRESHOLD = 10000;
const swipePower = (offset: number, velocity: number) => Math.abs(offset) * velocity;

function useViewport() {
  const [w, setW] = useState(typeof window === "undefined" ? 1280 : window.innerWidth);
  useEffect(() => {
    const onR = () => setW(window.innerWidth);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);
  return { isMobile: w < 768, isTablet: w >= 768 && w < 1100 };
}

export default function SecuritySection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [autoOn, setAutoOn] = useState(true);
  const pauseUntilRef = useRef(0);
  const { isMobile, isTablet } = useViewport();

  useEffect(() => {
    if (!autoOn) return;
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntilRef.current) return;
      setDirection(1);
      setIndex((i) => (i + 1) % N);
    }, 4000);
    return () => window.clearInterval(id);
  }, [autoOn]);

  const pauseAuto = () => {
    pauseUntilRef.current = Date.now() + 10000;
  };

  const goPrev = () => {
    pauseAuto();
    setDirection(-1);
    setIndex((i) => (i === 0 ? N - 1 : i - 1));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(10);
  };
  const goNext = () => {
    pauseAuto();
    setDirection(1);
    setIndex((i) => (i === N - 1 ? 0 : i + 1));
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(10);
  };
  const goTo = (i: number) => {
    pauseAuto();
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "Escape") setAutoOn(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const card = CARDS[index];
  const Icon = card.icon;

  // Sizing
  const cardW = isMobile ? "90vw" : isTablet ? 500 : 600;
  const cardH = isMobile ? 380 : isTablet ? 360 : 400;
  const cardPad = isMobile ? 32 : 48;
  const titleSize = isMobile ? 24 : 28;
  const descSize = isMobile ? 16 : 18;
  const iconBoxSize = isMobile ? 84 : 96;
  const iconSize = isMobile ? 48 : 56;

  return (
    <section
      id="security"
      className="bg-fyn-beige relative overflow-hidden"
      style={{ padding: "120px 0" }}
    >
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
            className="mt-6 text-[36px] md:text-[56px] leading-[1.1]"
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 700,
              marginBottom: 20,
              background: "linear-gradient(90deg, #1A1008 0%, #C41E1E 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
            }}
          >
            Enterprise-Grade Security. Zero Compromise.
          </h2>

          <p
            className="text-fyn-ink/65 text-[18px] md:text-[22px]"
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, maxWidth: 800, marginBottom: 40 }}
          >
            Your financial data deserves military-grade protection. Here's how we keep it safe.
          </p>
        </div>

        {/* Single-card slider */}
        <style>{`
          @keyframes fynSecBorderGlow {
            0%, 100% { filter: hue-rotate(0deg) brightness(1); }
            50%      { filter: hue-rotate(90deg) brightness(1.2); }
          }
          @keyframes fynSecFloatA { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-18px) } }
          @keyframes fynSecFloatB { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-26px) } }
          @keyframes fynSecFloatC { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-12px) } }
          .fyn-sec-card {
            position: relative;
            background:
              linear-gradient(rgba(45,27,105,0.92), rgba(26,26,46,0.92)),
              url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M0 0h40v40H0z' fill='none'/><path d='M0 0h40M0 0v40' stroke='rgba(255,255,255,0.05)' stroke-width='1'/></svg>");
            background-size: auto, 40px 40px;
            border-radius: 28px;
            transform-style: preserve-3d;
            transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease;
            isolation: isolate;
          }
          .fyn-sec-card::before {
            content: "";
            position: absolute;
            inset: -3px;
            border-radius: 31px;
            background: linear-gradient(135deg, #FF6B6B, #4ECDC4, #45B7D1, #F7B731, #FF6B6B);
            background-size: 300% 300%;
            z-index: -1;
            animation: fynSecBorderGlow 3s ease-in-out infinite;
            filter: drop-shadow(0 0 12px rgba(78,205,196,0.35));
          }
          .fyn-sec-card::after {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; height: 200px;
            background: radial-gradient(ellipse at 50% 0%, rgba(255,107,107,0.30), transparent 70%);
            filter: blur(60px);
            pointer-events: none;
            border-radius: 28px 28px 0 0;
          }
          .fyn-sec-card:hover { transform: translateY(-8px) scale(1.02) rotateX(2deg) rotateY(2deg); }
          .fyn-sec-icon-wrap {
            position: relative;
            background: linear-gradient(135deg, #4ECDC4 0%, #45B7D1 100%);
            border: 2px solid rgba(255,255,255,0.20);
            border-radius: 24px;
            box-shadow: 0 8px 32px rgba(78,205,196,0.40);
            transform: translateZ(20px);
          }
          .fyn-sec-icon-wrap::after {
            content: "";
            position: absolute;
            inset: -20px;
            background: radial-gradient(circle, rgba(78,205,196,0.55), transparent 70%);
            filter: blur(30px);
            opacity: 0.6;
            z-index: -1;
            border-radius: 50%;
          }
          .fyn-sec-title {
            background: linear-gradient(180deg, #ffffff 0%, #E0F7FA 100%);
            -webkit-background-clip: text;
                    background-clip: text;
            -webkit-text-fill-color: transparent;
                    color: transparent;
            text-shadow: 0 0 30px rgba(255,255,255,0.30);
          }
          .fyn-sec-accent {
            width: 80px; height: 4px; border-radius: 2px;
            background: linear-gradient(90deg, #FF6B6B 0%, #4ECDC4 50%, #45B7D1 100%);
            box-shadow: 0 0 20px rgba(78,205,196,0.6);
          }
          .fyn-sec-corner-dot {
            position: absolute; width: 8px; height: 8px; border-radius: 50%;
          }
        `}</style>

        <div
          className="relative w-full flex items-center justify-center"
          style={{ height: 540, overflow: "visible", touchAction: "pan-y", userSelect: "none", perspective: 1200 }}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={index}
              custom={direction}
              initial={{ opacity: 0, x: direction * 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -100 }}
              transition={{ duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              whileDrag={{ scale: 0.98, opacity: 0.9, cursor: "grabbing" }}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
              onDragEnd={(_, info) => {
                const power = swipePower(info.offset.x, info.velocity.x);
                if (power < -SWIPE_THRESHOLD) goNext();
                else if (power > SWIPE_THRESHOLD) goPrev();
              }}
              className="fyn-sec-card"
              style={{
                width: cardW,
                maxWidth: "92vw",
                height: cardH,
                padding: cardPad,
                display: "flex",
                flexDirection: "column",
                cursor: "grab",
                boxShadow:
                  "0 10px 40px rgba(255,107,107,0.30), 0 20px 60px rgba(78,205,196,0.20), 0 30px 80px rgba(0,0,0,0.40)",
              }}
            >
              {/* Glassmorphism overlay */}
              <div
                aria-hidden
                style={{
                  position: "absolute", inset: 0, borderRadius: 28,
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  pointerEvents: "none",
                }}
              />

              {/* Floating particles */}
              <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 28, pointerEvents: "none" }}>
                {[
                  { size: 6,  top: "12%", left: "18%", color: "rgba(78,205,196,0.45)",  anim: "fynSecFloatA 4s ease-in-out infinite" },
                  { size: 10, top: "70%", left: "10%", color: "rgba(255,107,107,0.40)", anim: "fynSecFloatB 5.5s ease-in-out infinite" },
                  { size: 4,  top: "30%", left: "85%", color: "rgba(247,183,49,0.45)",  anim: "fynSecFloatC 3.5s ease-in-out infinite" },
                  { size: 8,  top: "55%", left: "78%", color: "rgba(69,183,209,0.45)",  anim: "fynSecFloatA 6s ease-in-out infinite" },
                  { size: 5,  top: "85%", left: "55%", color: "rgba(78,205,196,0.40)",  anim: "fynSecFloatB 4.5s ease-in-out infinite" },
                  { size: 12, top: "8%",  left: "70%", color: "rgba(255,107,107,0.30)", anim: "fynSecFloatC 5s ease-in-out infinite" },
                ].map((p, i) => (
                  <span
                    key={i}
                    style={{
                      position: "absolute",
                      top: p.top, left: p.left,
                      width: p.size, height: p.size,
                      borderRadius: "50%",
                      background: p.color,
                      boxShadow: `0 0 16px ${p.color}`,
                      animation: p.anim,
                    }}
                  />
                ))}
              </div>

              {/* Corner accents */}
              <span className="fyn-sec-corner-dot" style={{ top: 16, right: 16, background: "#4ECDC4", boxShadow: "0 0 20px #4ECDC4" }} />
              <span className="fyn-sec-corner-dot" style={{ bottom: 16, left: 16, background: "#FF6B6B", boxShadow: "0 0 20px #FF6B6B" }} />

              {/* Content */}
              <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
                <div
                  className="fyn-sec-icon-wrap flex items-center justify-center"
                  style={{ width: 100, height: 100, marginBottom: 24 }}
                >
                  <Icon
                    size={52}
                    strokeWidth={2.5}
                    style={{ color: "#ffffff", filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))" }}
                  />
                </div>

                <h3
                  className="fyn-sec-title"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 800,
                    fontSize: 26,
                    lineHeight: 1.3,
                    letterSpacing: "-0.5px",
                    marginBottom: 20,
                  }}
                >
                  {card.title}
                </h3>

                <div className="fyn-sec-accent" style={{ marginBottom: 20 }} />

                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    fontSize: 17,
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.85)",
                    textShadow: "0 2px 8px rgba(0,0,0,0.3)",
                  }}
                >
                  {card.desc}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <div className="flex items-center justify-center" style={{ gap: 24, marginTop: 40 }}>
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="flex items-center justify-center transition-transform hover:-translate-y-0.5"
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #C41E1E 0%, #a01818 100%)",
              color: "#fff", border: "none", cursor: "pointer",
              boxShadow: "0 8px 24px rgba(196,30,30,0.35)",
            }}
          >
            <ChevronLeft size={26} />
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            className="flex items-center justify-center transition-transform hover:-translate-y-0.5"
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, #C41E1E 0%, #a01818 100%)",
              color: "#fff", border: "none", cursor: "pointer",
              boxShadow: "0 8px 24px rgba(196,30,30,0.35)",
            }}
          >
            <ChevronRight size={26} />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center flex-wrap" style={{ gap: 12, marginTop: 24 }}>
          {CARDS.map((_, i) => {
            const active = i === index;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to card ${i + 1}`}
                style={{
                  width: active ? 12 : 8,
                  height: active ? 12 : 8,
                  borderRadius: "50%",
                  background: active ? "#C41E1E" : "rgba(196,30,30,0.3)",
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
