import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  PieChart,
  AlertTriangle,
  EyeOff,
  BellOff,
  TrendingDown,
  AlertCircle,
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

const CRISIS_CARDS = [
  { Icon: EyeOff, color: RED, text: "No cash flow visibility" },
  { Icon: BellOff, color: ORANGE, text: "No proactive alerts" },
  { Icon: TrendingDown, color: RED, text: "No runway forecasting" },
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
                    transition: "border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease",
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
                    className="problem-badge-icon"
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

          {/* RIGHT - Crisis visualization */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="problem-visual"
            style={{
              position: "relative",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: 20,
              padding: "clamp(24px, 3vw, 40px)",
              backdropFilter: "blur(20px)",
              overflow: "hidden",
            }}
          >
            {/* Crisis alert */}
            <div
              className="problem-pulse"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: 12,
                padding: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <AlertTriangle size={32} color={RED} strokeWidth={2} />
              <div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 700,
                    fontSize: "clamp(14px, 1.4vw, 16px)",
                    color: "#FFFFFF",
                  }}
                >
                  Cash Crisis Discovered
                </div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 400,
                    fontSize: 13,
                    color: "rgba(255, 255, 255, 0.6)",
                    marginTop: 2,
                  }}
                >
                  14 days too late
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div
              style={{
                position: "relative",
                height: 80,
                background: "rgba(255, 255, 255, 0.03)",
                borderRadius: 10,
                overflow: "visible",
                marginBottom: 36,
                marginTop: 36,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "77%" }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(90deg, rgba(239, 68, 68, 0.3), rgba(239, 68, 68, 0.1))",
                    borderRight: `2px solid ${RED}`,
                  }}
                />
              </div>

              {/* Crisis marker */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 1.8 }}
                style={{
                  position: "absolute",
                  left: "77%",
                  top: 0,
                  bottom: 0,
                  width: 3,
                  background: RED,
                  boxShadow: "0 0 12px rgba(239, 68, 68, 0.8)",
                  pointerEvents: "none",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: -32,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: `1px solid ${RED}`,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 11,
                    color: "#FFFFFF",
                    whiteSpace: "nowrap",
                  }}
                >
                  Crisis Discovered
                </div>
              </motion.div>

              <span
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                Day 1
              </span>
              <span
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: 12,
                  color: "rgba(255, 255, 255, 0.5)",
                }}
              >
                Day 60 (Bankrupt)
              </span>
            </div>

            {/* Crisis cards */}
            <div className="flex flex-col" style={{ gap: 12 }}>
              {CRISIS_CARDS.map(({ Icon, color, text }, i) => (
                <motion.div
                  key={text}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.12 }}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    borderLeft: `3px solid ${color}`,
                    padding: 16,
                    borderRadius: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Icon size={20} color={color} strokeWidth={2} />
                  <span
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "rgba(255, 255, 255, 0.85)",
                    }}
                  >
                    {text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Footer caption */}
            <div
              style={{
                marginTop: 24,
                background: "rgba(26, 20, 18, 0.95)",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(196, 30, 30, 0.3)",
                padding: 16,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <AlertCircle size={24} color={TERRACOTTA} strokeWidth={2} />
              <span
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  fontSize: "clamp(12px, 1.2vw, 14px)",
                  color: "#FFFFFF",
                  lineHeight: 1.4,
                }}
              >
                Most Indian SMEs operate without visibility
              </span>
            </div>
          </motion.div>
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
          align-items: center;
        }
        @media (min-width: 900px) {
          .problem-grid {
            grid-template-columns: 55fr 45fr;
          }
        }
        .problem-badge:hover {
          border-color: rgba(196, 30, 30, 0.5) !important;
          background: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 8px 24px rgba(196, 30, 30, 0.2);
        }
        .problem-pulse {
          animation: problemPulse 2s infinite;
        }
        @keyframes problemPulse {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
      `}</style>
    </section>
  );
}
