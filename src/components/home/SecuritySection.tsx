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

        <InfraBadges />

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

type Badge = {
  micro: string;
  icon: LucideIcon;
  label: string;
  sub: string;
  from: string;
  to: string;
  glow: string;
};

const BADGES: Badge[] = [
  { micro: "INFRASTRUCTURE", icon: Cloud,      label: "AWS Mumbai",    sub: "Enterprise Cloud",     from: "#45B7D1", to: "#2E86AB", glow: "rgba(46,134,171,0.45)" },
  { micro: "ENCRYPTION",     icon: Shield,     label: "256-bit AES",   sub: "Bank-Grade",           from: "#E85D5D", to: "#C41E1E", glow: "rgba(196,30,30,0.45)" },
  { micro: "DATABASE",       icon: Database,   label: "PostgreSQL",    sub: "Enterprise Security",  from: "#6C5CE7", to: "#5849BE", glow: "rgba(108,92,231,0.45)" },
  { micro: "COMPLIANCE",     icon: FileSearch, label: "Audit Trail",   sub: "Complete Logging",     from: "#00B894", to: "#00916E", glow: "rgba(0,184,148,0.45)" },
  { micro: "PRIVACY",        icon: Lock,       label: "Zero-Knowledge",sub: "Architecture",         from: "#F39C12", to: "#E67E22", glow: "rgba(243,156,18,0.45)" },
  { micro: "BACKUP",         icon: HardDrive,  label: "Daily Backups", sub: "Automated",            from: "#4ECDC4", to: "#3BB5AD", glow: "rgba(78,205,196,0.45)" },
];

function InfraBadges() {
  const { isMobile, isTablet } = useViewport();
  const orbSize = isMobile ? 80 : isTablet ? 100 : 120;
  const iconSize = isMobile ? 36 : isTablet ? 44 : 52;
  const cols = isMobile ? "repeat(2,1fr)" : isTablet ? "repeat(3,1fr)" : "repeat(6,1fr)";

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        margin: "64px -40px 80px",
        padding: "80px 40px",
        background: "linear-gradient(180deg, #F4EDDA 0%, #ECE3CC 100%)",
        borderRadius: 24,
      }}
    >
      {/* Grid pattern overlay */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(26,16,8,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(26,16,8,0.05) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: "#C41E1E",
          textAlign: "center",
          marginBottom: 48,
        }}
      >
        Built on Enterprise Infrastructure
      </div>

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: cols,
          columnGap: 48,
          rowGap: 56,
          maxWidth: 1300,
          margin: "0 auto",
        }}
      >
        {BADGES.map((b, i) => {
          const Icon = b.icon;
          return (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: [0.34, 1.56, 0.64, 1] }}
              whileHover="hover"
              variants={{
                hover: { y: -12, scale: 1.03 },
              }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "32px 24px",
                background: "#FFFFFF",
                borderRadius: 20,
                cursor: "pointer",
                boxShadow:
                  "0 4px 6px rgba(0,0,0,0.05), 0 12px 24px rgba(0,0,0,0.08), 0 24px 48px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.4s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              {/* Top accent line */}
              <motion.div
                variants={{ hover: { width: 80 } }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 60,
                  height: 4,
                  background: `linear-gradient(90deg, ${b.from}, ${b.to})`,
                  borderRadius: "0 0 4px 4px",
                  boxShadow: `0 2px 8px ${b.glow}`,
                }}
              />

              {/* Orb container */}
              <div
                style={{
                  position: "relative",
                  width: orbSize,
                  height: orbSize,
                  marginBottom: 24,
                  perspective: 600,
                }}
              >
                {/* Back glow */}
                <motion.div
                  variants={{ hover: { opacity: 1 } }}
                  initial={{ opacity: 0.6 }}
                  style={{
                    position: "absolute",
                    inset: -20,
                    background: `radial-gradient(circle, ${b.glow} 0%, transparent 70%)`,
                    filter: "blur(30px)",
                    zIndex: 0,
                  }}
                />

                {/* Sphere */}
                <motion.div
                  variants={{ hover: { rotateY: 10, rotateX: 5 } }}
                  transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{
                    position: "relative",
                    width: orbSize,
                    height: orbSize,
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${b.from} 0%, ${b.to} 100%)`,
                    boxShadow: `inset -4px -4px 12px rgba(0,0,0,0.3), inset 4px 4px 12px rgba(255,255,255,0.3), 0 12px 32px ${b.glow}`,
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Glossy highlight */}
                  <div
                    style={{
                      position: "absolute",
                      top: "15%",
                      left: "20%",
                      width: orbSize * 0.33,
                      height: orbSize * 0.33,
                      background:
                        "radial-gradient(circle, rgba(255,255,255,0.9) 0%, transparent 70%)",
                      borderRadius: "50%",
                      opacity: 0.6,
                      filter: "blur(8px)",
                      pointerEvents: "none",
                    }}
                  />
                  <Icon
                    size={iconSize}
                    color="#FFFFFF"
                    strokeWidth={2.5}
                    style={{
                      position: "relative",
                      zIndex: 2,
                      filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
                    }}
                  />
                </motion.div>
              </div>

              {/* Micro label */}
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 10,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: "rgba(196,30,30,0.6)",
                  marginBottom: 4,
                }}
              >
                {b.micro}
              </div>

              {/* Main label */}
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  fontSize: isMobile ? 14 : 16,
                  color: "#1A1008",
                  lineHeight: 1.4,
                  textAlign: "center",
                  maxWidth: 160,
                  marginTop: 8,
                  textShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                {b.label}
              </div>

              {/* Sub label */}
              <div
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 12,
                  color: "rgba(26,16,8,0.55)",
                  marginTop: 4,
                  textAlign: "center",
                }}
              >
                {b.sub}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
