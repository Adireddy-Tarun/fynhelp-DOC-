import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  PieChart,
  AlertTriangle,
  EyeOff,
  BellOff,
  ShieldAlert,
  TrendingDown,
} from "lucide-react";

const TERRACOTTA = "#C41E1E";
const TERRACOTTA_LIGHT = "#E85D5D";
const RED = "#EF4444";
const ORANGE = "#F59E0B";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const STAT_BADGES = [
  { Icon: Building2, number: "63M", label: "Businesses" },
  { Icon: Users, number: "110M", label: "People" },
  { Icon: PieChart, number: "30%", label: "of GDP" },
];

const CRISIS_STATS = [
  { Icon: EyeOff, color: RED, label: "Visibility", status: "NONE" },
  { Icon: BellOff, color: ORANGE, label: "Alerts", status: "OFF" },
  { Icon: ShieldAlert, color: RED, label: "Protection", status: "ZERO" },
];

const PARTICLES = [
  { top: "10%", left: "8%", delay: 0, size: 6 },
  { top: "20%", left: "85%", delay: 1.2, size: 4 },
  { top: "70%", left: "5%", delay: 2.4, size: 5 },
  { top: "85%", left: "78%", delay: 0.6, size: 4 },
  { top: "45%", left: "92%", delay: 1.8, size: 6 },
  { top: "60%", left: "12%", delay: 3, size: 4 },
];

function Highlight({
  children,
  color = TERRACOTTA,
}: {
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        fontWeight: 700,
        color,
        background: `${color}1A`,
        padding: "2px 6px",
        borderRadius: 4,
      }}
    >
      {children}
    </span>
  );
}

export default function ProblemSection() {
  return (
    <section
      className="relative"
      style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #1a1412 100%)",
        padding: "clamp(80px, 10vw, 120px) clamp(20px, 5vw, 60px)",
      }}
      aria-labelledby="problem-heading"
    >
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="problem-grid">
          {/* LEFT */}
          <div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: TERRACOTTA,
                marginBottom: 24,
              }}
            >
              The Problem
            </motion.div>

            <motion.h2
              id="problem-heading"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeUp}
              custom={1}
              style={{
                fontFamily: "Georgia, serif",
                fontWeight: 700,
                fontSize: "clamp(32px, 4.5vw, 48px)",
                lineHeight: 1.2,
                color: "#FFFFFF",
                marginBottom: 32,
              }}
            >
              India's SMEs Are{" "}
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  color: TERRACOTTA,
                }}
              >
                Flying Blind
                <motion.span
                  initial={{ width: 0 }}
                  whileInView={{ width: "100%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    bottom: -4,
                    left: 0,
                    height: 3,
                    background: `linear-gradient(90deg, ${TERRACOTTA}, ${TERRACOTTA_LIGHT})`,
                    boxShadow: "0 0 12px rgba(196, 30, 30, 0.6)",
                    borderRadius: 2,
                  }}
                />
              </span>
            </motion.h2>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              custom={2}
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 400,
                fontSize: "clamp(15px, 1.4vw, 17px)",
                lineHeight: 1.7,
                color: "rgba(255, 255, 255, 0.85)",
              }}
            >
              <p style={{ marginBottom: 16 }}>
                India has <Highlight>63 million</Highlight> small and medium
                businesses. Together, they employ{" "}
                <Highlight>110 million</Highlight> people and contribute nearly{" "}
                <Highlight>30%</Highlight> of our GDP.
              </p>
              <p style={{ marginBottom: 16 }}>
                Yet the vast majority operate without even basic financial
                intelligence — no cash flow visibility, no proactive
                compliance, no way to model decisions before making them.
              </p>
              <p style={{ marginBottom: 40 }}>
                A CFO costs <Highlight color={RED}>₹30–50 lakh</Highlight> a
                year. Most SMEs can't afford one.
              </p>
            </motion.div>

            {/* Stat badges */}
            <div
              className="grid grid-cols-3"
              style={{ gap: "clamp(12px, 1.5vw, 20px)", marginTop: 8 }}
            >
              {STAT_BADGES.map(({ Icon, number, label }, i) => (
                <motion.div
                  key={label}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.3 }}
                  variants={fadeUp}
                  custom={i + 3}
                  whileHover={{ y: -4 }}
                  className="problem-badge"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(196, 30, 30, 0.25)",
                    borderRadius: 12,
                    padding: "clamp(16px, 2vw, 24px) clamp(12px, 1.5vw, 20px)",
                    textAlign: "center",
                    transition:
                      "border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
                  }}
                >
                  <div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: "-50%",
                      left: "50%",
                      width: 100,
                      height: 100,
                      background:
                        "radial-gradient(circle, rgba(196, 30, 30, 0.15), transparent)",
                      transform: "translateX(-50%)",
                      filter: "blur(20px)",
                      pointerEvents: "none",
                    }}
                  />
                  <Icon
                    size={32}
                    strokeWidth={2}
                    color={TERRACOTTA}
                    style={{ margin: "0 auto 12px", display: "block" }}
                  />
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontWeight: 900,
                      fontSize: "clamp(24px, 3vw, 36px)",
                      lineHeight: 1,
                      color: TERRACOTTA_LIGHT,
                      marginBottom: 8,
                      textShadow: "0 2px 8px rgba(196, 30, 30, 0.4)",
                    }}
                  >
                    {number}
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "clamp(10px, 1vw, 13px)",
                      color: "rgba(255, 255, 255, 0.75)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      lineHeight: 1.3,
                    }}
                  >
                    {label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* RIGHT - 3D Crisis Dashboard */}
          <div className="problem-stage">
            {/* Floating particles */}
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                aria-hidden
                className="problem-particle"
                style={{
                  top: p.top,
                  left: p.left,
                  width: p.size,
                  height: p.size,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="problem-card"
            >
              {/* Header */}
              <div className="problem-card-header">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="problem-live-dot" aria-hidden />
                  <div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#FFFFFF",
                        lineHeight: 1.2,
                      }}
                    >
                      Cash Flow Monitor
                    </div>
                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 600,
                        fontSize: 10,
                        letterSpacing: "1.5px",
                        color: "rgba(255,255,255,0.5)",
                        marginTop: 2,
                      }}
                    >
                      REAL-TIME
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(239, 68, 68, 0.15)",
                    border: `1px solid ${RED}`,
                    color: RED,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: 11,
                    letterSpacing: "1px",
                    padding: "6px 10px",
                    borderRadius: 999,
                  }}
                >
                  <AlertTriangle size={12} strokeWidth={2.5} />
                  CRITICAL
                </div>
              </div>

              {/* Gauge */}
              <div
                className="problem-gauge"
                style={{ transform: "translateZ(20px)" }}
              >
                <svg
                  viewBox="0 0 200 200"
                  width="100%"
                  height="100%"
                  style={{ overflow: "visible" }}
                  aria-hidden
                >
                  <defs>
                    <linearGradient id="gaugeDanger" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                    <filter id="gaugeGlow">
                      <feGaussianBlur stdDeviation="3" result="b" />
                      <feMerge>
                        <feMergeNode in="b" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  {/* Background arc */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth="14"
                    strokeDasharray="377 503"
                    strokeLinecap="round"
                    transform="rotate(135 100 100)"
                  />
                  {/* Danger arc */}
                  <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#gaugeDanger)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    transform="rotate(135 100 100)"
                    filter="url(#gaugeGlow)"
                    initial={{ strokeDasharray: "0 503" }}
                    whileInView={{ strokeDasharray: "88 503" }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
                  />
                  {/* Tick at current position */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeDasharray="2 501"
                    transform="rotate(217 100 100)"
                  />
                </svg>
                <div className="problem-gauge-center">
                  <div
                    style={{
                      fontFamily: "Georgia, serif",
                      fontWeight: 900,
                      fontSize: "clamp(36px, 5vw, 56px)",
                      lineHeight: 1,
                      color: RED,
                      textShadow: "0 4px 20px rgba(239, 68, 68, 0.5)",
                    }}
                  >
                    14
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 12,
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.85)",
                      marginTop: 4,
                    }}
                  >
                    Days Left
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: 10,
                      color: "rgba(255,255,255,0.45)",
                      marginTop: 2,
                    }}
                  >
                    of 60-day runway
                  </div>
                </div>
              </div>

              {/* Stat cards */}
              <div
                className="grid grid-cols-3"
                style={{ gap: 10, marginBottom: 16 }}
              >
                {CRISIS_STATS.map(({ Icon, color, label, status }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.4, delay: 0.5 + i * 0.12 }}
                    className="problem-stat"
                    style={{ borderColor: `${color}55` }}
                  >
                    <div
                      className="problem-stat-icon"
                      style={{
                        background: `${color}1F`,
                        color,
                      }}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>
                    <div
                      style={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 600,
                        fontSize: 10,
                        color: "rgba(255,255,255,0.6)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginTop: 8,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontFamily: "JetBrains Mono, monospace",
                        fontWeight: 700,
                        fontSize: 13,
                        color,
                        marginTop: 2,
                        letterSpacing: "1px",
                      }}
                    >
                      {status}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Warning banner */}
              <div className="problem-banner" style={{ transform: "translateZ(10px)" }}>
                <TrendingDown size={20} color={RED} strokeWidth={2.2} />
                <div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "#FFFFFF",
                      lineHeight: 1.3,
                    }}
                  >
                    Most Indian SMEs operate like this
                  </div>
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 400,
                      fontSize: 11,
                      color: "rgba(255,255,255,0.6)",
                      marginTop: 2,
                    }}
                  >
                    Zero visibility until it's too late
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center" style={{ marginTop: 48 }}>
          <Link
            to="/#product-ecosystem"
            className="inline-flex items-center gap-2 hover:underline"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 15,
              color: TERRACOTTA_LIGHT,
            }}
          >
            See how FynHelp fixes this →
          </Link>
        </div>
      </div>

      <style>{`
        .problem-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          gap: clamp(32px, 5vw, 60px);
          align-items: start;
        }
        @media (min-width: 900px) {
          .problem-grid {
            grid-template-columns: 55fr 45fr;
            align-items: center;
          }
        }
        .problem-badge:hover {
          border-color: rgba(196, 30, 30, 0.5) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 8px 24px rgba(196, 30, 30, 0.2);
        }

        .problem-stage {
          position: relative;
          height: 350px;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
        }
        @media (min-width: 900px) {
          .problem-stage { height: 560px; }
        }

        .problem-card {
          position: relative;
          width: 100%;
          height: 320px;
          background: linear-gradient(135deg, rgba(26,20,18,0.85), rgba(10,10,10,0.92));
          border: 1px solid rgba(196,30,30,0.3);
          border-radius: 20px;
          padding: 20px;
          box-shadow:
            0 20px 60px rgba(0,0,0,0.7),
            inset 0 0 0 1px rgba(255,255,255,0.05),
            0 40px 80px rgba(196,30,30,0.15);
          backdrop-filter: blur(20px);
          transform-style: preserve-3d;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 900px) {
          .problem-card {
            height: 480px;
            padding: 32px;
            transform: rotateX(2deg) rotateY(-5deg);
          }
          .problem-card:hover {
            transform: rotateX(0deg) rotateY(0deg) scale(1.02);
          }
        }

        .problem-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 14px;
          margin-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        @media (min-width: 900px) {
          .problem-card-header { padding-bottom: 16px; margin-bottom: 24px; }
        }

        .problem-live-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: ${RED};
          box-shadow: 0 0 12px ${RED};
          animation: problemPulseDot 1.6s ease-in-out infinite;
        }

        .problem-gauge {
          position: relative;
          flex: 1;
          min-height: 140px;
          max-height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        @media (min-width: 900px) {
          .problem-gauge { min-height: 180px; max-height: 220px; margin-bottom: 24px; }
        }
        .problem-gauge svg {
          max-width: 220px;
          max-height: 100%;
        }
        .problem-gauge-center {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: none;
        }

        .problem-stat {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 10px 8px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transform: translateZ(15px);
        }
        @media (min-width: 900px) {
          .problem-stat { padding: 14px 10px; }
        }
        .problem-stat-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .problem-banner {
          background: linear-gradient(90deg, rgba(239,68,68,0.18), rgba(239,68,68,0.05));
          border: 1px solid rgba(239,68,68,0.3);
          border-radius: 10px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        @media (min-width: 900px) {
          .problem-banner { padding: 14px 16px; }
        }

        .problem-particle {
          position: absolute;
          border-radius: 50%;
          background: ${TERRACOTTA};
          box-shadow: 0 0 12px ${TERRACOTTA};
          opacity: 0.5;
          animation: problemFloat 6s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes problemPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.85); }
        }
        @keyframes problemFloat {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-24px); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
