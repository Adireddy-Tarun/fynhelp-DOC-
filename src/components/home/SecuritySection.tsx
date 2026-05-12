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
  Cloud,
  FileSearch,
  HardDrive,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

type Card = {
  icon: LucideIcon;
  label: string;
  title: string;
  desc: string;
  stat?: { value: string; caption: string };
};

const CARDS: Card[] = [
  { icon: Shield,        label: "ENCRYPTION STANDARD", title: "Bank-level encryption protects every byte of your data.", desc: "AES-256 encryption for data at rest. TLS 1.3 for data in transit. Same security standards used by HDFC, ICICI, and Axis Bank." },
  { icon: Lock,          label: "DATABASE SECURITY",   title: "Row-level security ensures zero data leakage.",            desc: "PostgreSQL RLS policies isolate your business data at database level. Zero cross-contamination between accounts. Your data stays yours." },
  { icon: Key,           label: "PRIVACY ARCHITECTURE",title: "We can't see your data. By design.",                       desc: "Your financial data is encrypted before reaching our servers. Zero-knowledge architecture means we cannot decrypt or access your raw transaction data." },
  { icon: Database,      label: "DATA RESIDENCY",      title: "Your data never leaves India.",                            desc: "All data stored in Mumbai AWS data centers. Compliant with RBI data localization regulations. No international data transfer. Period." },
  { icon: Activity,      label: "ACCURACY PROMISE",    title: "99.9% calculation accuracy. Auditable by your CA.",        desc: "Real-time calculations validated against CA standards. Deterministic algorithms, not AI guesswork. Every number is verifiable.", stat: { value: "99.9%", caption: "Accuracy Rate" } },
  { icon: Eye,           label: "TRANSPARENCY CORE",   title: "Every calculation shows its source. No black boxes.",      desc: "Every insight shows its formula. Every number shows its source data. No hidden AI making decisions you can't verify or challenge." },
  { icon: UserX,         label: "DATA ETHICS",         title: "Your data will never train our AI. Ever.",                 desc: "We never use your financial data to train Fynny or any AI models. Your business intelligence remains confidential forever. Zero exceptions." },
  { icon: FileCheck,     label: "COMPLIANCE READY",    title: "Enterprise-grade audits without enterprise cost.",         desc: "Annual third-party security audits. Quarterly vulnerability assessments. Bi-annual penetration testing by certified firms. SOC 2 compliance ready." },
  { icon: Clock,         label: "AUDIT SYSTEM",        title: "Complete forensic trail for every action.",                desc: "Every data import, every change, every access logged with timestamp and user ID. Full audit trail for compliance, tax filing, and dispute resolution." },
  { icon: AlertTriangle, label: "THREAT DETECTION",    title: "Real-time protection against suspicious activity.",        desc: "Automatic rate limiting. Instant suspicious activity alerts. IP-based access controls. Enterprise security infrastructure at startup pricing." },
  { icon: Users,         label: "ACCESS CONTROL",      title: "Granular permissions for every team member.",              desc: "Role-based access control. Your CA sees tax data only. Your CFO sees everything. You decide who sees what. Complete access audit log." },
  { icon: Download,      label: "DATA FREEDOM",        title: "Export everything. Delete everything. Anytime.",           desc: "One-click data export in CSV or Excel format. No vendor lock-in. Your data is portable and deletable. We don't hold your data hostage." },
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

  const pauseAuto = () => { pauseUntilRef.current = Date.now() + 10000; };

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

  const cardW = isMobile ? "92vw" : isTablet ? 720 : 980;
  const cardH = isMobile ? "auto" : isTablet ? 460 : 480;
  const cardPad = isMobile ? 40 : 56;
  const titleSize = isMobile ? 32 : 42;
  const descSize = isMobile ? 15 : 17;
  const showStat = !!card.stat && !isMobile;

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
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, maxWidth: 800, marginBottom: 56 }}
          >
            Your financial data deserves military-grade protection. Here's how we keep it safe.
          </p>
        </div>

        {/* Slider */}
        <div
          className="relative w-full flex items-center justify-center"
          style={{
            minHeight: isMobile ? 480 : 520,
            overflow: "visible",
            touchAction: "pan-y",
            userSelect: "none",
          }}
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
              whileDrag={{ scale: 0.99, opacity: 0.92, cursor: "grabbing" }}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
              onDragEnd={(_, info) => {
                const power = swipePower(info.offset.x, info.velocity.x);
                if (power < -SWIPE_THRESHOLD) goNext();
                else if (power > SWIPE_THRESHOLD) goPrev();
              }}
              style={{
                position: "relative",
                width: cardW,
                maxWidth: "92vw",
                height: cardH,
                padding: cardPad,
                background: "#1a1412",
                borderRadius: 24,
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                cursor: "grab",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Subtle radial gradient atmosphere */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse at 50% 40%, rgba(196,30,30,0.08) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              {/* Content */}
              <div
                style={{
                  position: "relative",
                  zIndex: 1,
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  maxWidth: showStat ? "calc(100% - 360px)" : "100%",
                }}
              >
                {/* Top label badge */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    alignSelf: "flex-start",
                    background: "rgba(196,30,30,0.08)",
                    color: "#C41E1E",
                    padding: "8px 16px",
                    borderRadius: 6,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    marginBottom: 32,
                  }}
                >
                  <Icon size={18} strokeWidth={2.2} color="#C41E1E" />
                  {card.label}
                </span>

                {/* Title */}
                <h3
                  style={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 800,
                    fontSize: titleSize,
                    lineHeight: 1.2,
                    color: "#FFFFFF",
                    marginBottom: 24,
                    maxWidth: 600,
                    letterSpacing: "-0.5px",
                  }}
                >
                  {card.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: descSize,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,0.7)",
                    maxWidth: 550,
                  }}
                >
                  {card.desc}
                </p>
              </div>

              {/* Stat card */}
              {showStat && card.stat && (
                <div
                  style={{
                    position: "absolute",
                    top: cardPad,
                    right: cardPad,
                    width: 320,
                    background: "#252220",
                    border: "1px solid rgba(196,30,30,0.2)",
                    borderRadius: 16,
                    padding: 32,
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontWeight: 900,
                      fontSize: 72,
                      color: "#C41E1E",
                      lineHeight: 1,
                      marginBottom: 12,
                      letterSpacing: "-2px",
                    }}
                  >
                    {card.stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.6)",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {card.stat.caption}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows + Counter */}
        <div className="flex items-center justify-center" style={{ gap: 24, marginTop: 40 }}>
          <button
            onClick={goPrev}
            aria-label="Previous"
            className="flex items-center justify-center transition-all"
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "transparent",
              border: "2px solid rgba(26,16,8,0.2)",
              color: "#1A1008",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(196,30,30,0.9)";
              e.currentTarget.style.borderColor = "#C41E1E";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(26,16,8,0.2)";
              e.currentTarget.style.color = "#1A1008";
            }}
          >
            <ChevronLeft size={26} />
          </button>

          <span
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 14,
              color: "rgba(26,16,8,0.5)",
              fontWeight: 500,
              minWidth: 70,
              textAlign: "center",
              letterSpacing: "1px",
            }}
          >
            {String(index + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
          </span>

          <button
            onClick={goNext}
            aria-label="Next"
            className="flex items-center justify-center transition-all"
            style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "transparent",
              border: "2px solid rgba(26,16,8,0.2)",
              color: "#1A1008",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(196,30,30,0.9)";
              e.currentTarget.style.borderColor = "#C41E1E";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "rgba(26,16,8,0.2)";
              e.currentTarget.style.color = "#1A1008";
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
                  width: active ? 10 : 8,
                  height: active ? 10 : 8,
                  borderRadius: "50%",
                  background: active ? "#C41E1E" : "transparent",
                  border: active ? "none" : "1.5px solid rgba(26,16,8,0.25)",
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
