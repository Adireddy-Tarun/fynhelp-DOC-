import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Lock,
  MapPin,
  Shield,
  Building2,
  Users,
  PieChart,
  AlertCircle,
  XCircle,
  CheckCircle2,
  X,
  Check,
  TrendingDown,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  TimerOff,
  Lightbulb,
  Linkedin,
  Clock,
} from "lucide-react";
import Layout from "@/components/Layout";
import ProblemSection from "@/components/home/ProblemSection";

const TERRACOTTA = "#C41E1E";
const TERRACOTTA_LIGHT = "#E85D5D";
const DARK = "#1a1412";
const DEEPER = "#0a0a0a";

const fadeUp: import("framer-motion").Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } },
};

/* ---------- HERO ---------- */
function Hero() {
  const badges = [
    { icon: Lock, label: "Bank-Grade Security" },
    { icon: MapPin, label: "Indian Data Residency" },
    { icon: Shield, label: "SOC 2 In Progress" },
  ];

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(180deg, ${DARK} 0%, ${DEEPER} 100%)`,
        minHeight: 600,
      }}
      className="about-hero py-[80px] md:py-[140px] px-5 md:px-[60px]"
    >
      {/* Radial glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(800px, 90vw)",
          height: 400,
          background: "radial-gradient(circle, rgba(196,30,30,0.08), transparent 70%)",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      {/* Waves */}
      <svg
        aria-hidden
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 1,
          pointerEvents: "none",
        }}
      >
        <path
          d="M0,300 C360,200 720,400 1440,250 L1440,600 L0,600 Z"
          fill="rgba(255,255,255,0.02)"
        >
          <animate attributeName="d" dur="20s" repeatCount="indefinite"
            values="M0,300 C360,200 720,400 1440,250 L1440,600 L0,600 Z;
                    M0,320 C400,260 760,360 1440,280 L1440,600 L0,600 Z;
                    M0,300 C360,200 720,400 1440,250 L1440,600 L0,600 Z" />
        </path>
        <path
          d="M0,400 C480,320 960,460 1440,360 L1440,600 L0,600 Z"
          fill="rgba(255,255,255,0.015)"
        >
          <animate attributeName="d" dur="24s" repeatCount="indefinite"
            values="M0,400 C480,320 960,460 1440,360 L1440,600 L0,600 Z;
                    M0,420 C520,380 960,420 1440,380 L1440,600 L0,600 Z;
                    M0,400 C480,320 960,460 1440,360 L1440,600 L0,600 Z" />
        </path>
      </svg>

      {/* Particles */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <span
            key={i}
            className="about-particle"
            style={{
              left: `${(i * 53) % 100}%`,
              top: `${(i * 37) % 100}%`,
              animationDuration: `${8 + (i % 7)}s`,
              animationDelay: `${(i % 5) * 0.6}s`,
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 10, maxWidth: 1400, margin: "0 auto", textAlign: "center" }}>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            color: TERRACOTTA,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 24,
          }}
        >
          About FynHelp
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 900,
            color: "white",
            maxWidth: 900,
            margin: "0 auto 24px",
            textShadow: "0 4px 12px rgba(0,0,0,0.6)",
            lineHeight: 1.15,
          }}
          className="text-[42px] md:text-[72px] leading-[1.2] md:leading-[1.15]"
        >
          We're Building Financial Intelligence for 63 Million Indian Businesses
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            maxWidth: 700,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
          className="text-[19px] md:text-[25px]"
        >
          Every SME deserves CFO-level clarity, without CFO-level cost
        </motion.p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
          className="gap-4 md:gap-8 mt-6 md:mt-10"
        >
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={b.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 + i * 0.1 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                }}
                className="text-[14px] md:text-[16px]"
              >
                <Icon size={16} color={TERRACOTTA} />
                <span>{b.label}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- BEFORE / AFTER ---------- */
function ComparisonSection() {
  const without = [
    "Discover cash crisis 14 days too late",
    "Pay CA ₹30-50L per year for basic compliance",
    "React to GST notices after they arrive",
    "Make hiring/spending decisions blindly",
  ];
  const withFyn = [
    "Prevent crises 60 days ahead with proactive alerts",
    "Pay ₹30-90K per year for AI CFO intelligence",
    "Avoid GST notices before they're issued",
    "Make data-driven decisions with real-time insights",
  ];
  return (
    <section
      style={{
        background: "rgba(0,0,0,0.3)",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
      className="py-[60px] md:py-[100px] px-5 md:px-[60px]"
    >
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        style={{ fontFamily: "Georgia", fontWeight: 700, color: "white", textAlign: "center" }}
        className="text-[32px] md:text-[50px] mb-10 md:mb-16"
      >
        What Makes Us Different
      </motion.h2>
      <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          style={{
            background: "linear-gradient(135deg, rgba(239,68,68,0.05), transparent)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 16,
          }}
          className="p-6 md:p-10"
        >
          <p style={{ color: "rgba(239,68,68,0.8)", fontFamily: "Inter", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }} className="text-[15px] md:text-[17px] mb-5 md:mb-8">
            Without FynHelp
          </p>
          <ul className="space-y-3 md:space-y-4">
            {without.map((t) => (
              <li
                key={t}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 10,
                }}
                className="gap-3 md:gap-4 p-3 md:p-4"
              >
                <XCircle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: "Inter", fontWeight: 500, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }} className="text-[17px] md:text-[19px]">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          style={{
            background: "linear-gradient(135deg, rgba(196,30,30,0.08), transparent)",
            border: "1px solid rgba(196,30,30,0.3)",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(196,30,30,0.15)",
          }}
          className="p-6 md:p-10"
        >
          <p style={{ color: TERRACOTTA, fontFamily: "Inter", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, textAlign: "center" }} className="text-[15px] md:text-[17px] mb-5 md:mb-8">
            With FynHelp
          </p>
          <ul className="space-y-3 md:space-y-4">
            {withFyn.map((t) => (
              <li
                key={t}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 10,
                }}
                className="gap-3 md:gap-4 p-3 md:p-4"
              >
                <CheckCircle2 size={20} color="#10B981" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontFamily: "Inter", fontWeight: 500, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }} className="text-[17px] md:text-[19px]">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- PRICING COMPARISON ---------- */
function PricingComparison() {
  return (
    <section style={{ background: DARK }} className="py-[80px] md:py-[120px] px-5 md:px-[60px]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[45%_55%] gap-10 md:gap-[60px] items-center">
        {/* Traditional CFO */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          style={{
            background: "linear-gradient(135deg, rgba(0,0,0,0.6), rgba(26,20,18,0.4))",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 20,
            position: "relative",
            overflow: "hidden",
          }}
          className="p-8 md:p-12"
        >
          <span
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: "rgba(239,68,68,0.2)",
              border: "1px solid #EF4444",
              padding: "6px 12px",
              borderRadius: 20,
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 14,
              color: "#EF4444",
              textTransform: "uppercase",
            }}
          >
            Unaffordable
          </span>
          <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Inter", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 24 }} className="text-[15px] md:text-[17px]">
            Traditional CFO
          </p>
          <div style={{ fontFamily: "Georgia", fontWeight: 900, color: "rgba(255,255,255,0.6)", lineHeight: 1 }} className="text-[42px] md:text-[56px] mb-2">
            ₹30-50 Lakh
          </div>
          <div style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.4)", marginBottom: 32 }} className="text-[17px] md:text-[19px]">
            per year
          </div>
          <ul className="space-y-3 md:space-y-4">
            {[
              "Not affordable for most SMEs",
              "3-6 months hiring process",
              "Limited to business hours",
              "Single person perspective",
            ].map((t) => (
              <li key={t} style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: "Inter", color: "rgba(255,255,255,0.5)" }} className="text-[17px] md:text-[18px]">
                <X size={18} color="#EF4444" style={{ flexShrink: 0 }} />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* FynHelp */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          style={{
            background: "linear-gradient(135deg, rgba(196,30,30,0.15), rgba(229,93,93,0.08))",
            border: "2px solid rgba(196,30,30,0.4)",
            borderRadius: 20,
            position: "relative",
            boxShadow: "0 20px 60px rgba(196,30,30,0.3)",
          }}
          className="p-8 md:p-12"
        >
          <span
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              background: TERRACOTTA,
              padding: "6px 12px",
              borderRadius: 20,
              fontFamily: "Inter",
              fontWeight: 700,
              fontSize: 14,
              color: "white",
              textTransform: "uppercase",
              boxShadow: "0 4px 12px rgba(196,30,30,0.4)",
            }}
          >
            Recommended
          </span>
          <p style={{ color: TERRACOTTA, fontFamily: "Inter", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 32 }} className="text-[15px] md:text-[17px]">
            FynHelp AI CFO
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {[
              { name: "BASIC", price: "₹30,000", monthly: "(₹2,500/month)", popular: false, features: ["5 Intelligence Suites", "1 User", "Email Support", "CSV Upload"] },
              { name: "PRO", price: "₹90,000", monthly: "(₹7,500/month)", popular: true, features: ["Everything in Basic", "Unlimited Users", "Priority Support", "Custom Reports", "Dedicated Success Manager"] },
            ].map((plan) => (
              <div key={plan.name}>
                {plan.popular && (
                  <span style={{ background: "rgba(196,30,30,0.3)", padding: "4px 10px", borderRadius: 12, fontFamily: "Inter", fontWeight: 600, fontSize: 10, color: "white", display: "inline-block", marginBottom: 8 }}>
                    Popular
                  </span>
                )}
                <div style={{ fontFamily: "Inter", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", marginBottom: 12 }} className="text-[15px]">
                  {plan.name}
                </div>
                <div style={{ fontFamily: "Georgia", fontWeight: 900, color: "white", lineHeight: 1 }} className="text-[32px] md:text-[42px]">
                  {plan.price}
                </div>
                <div style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.6)", marginTop: 4 }} className="text-[17px]">/year</div>
                <div style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.5)", marginBottom: 20 }} className="text-[16px]">{plan.monthly}</div>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: "flex", gap: 8, color: "rgba(255,255,255,0.7)", fontFamily: "Inter" }} className="text-[15px] md:text-[16px]">
                      <Check size={16} color="#10B981" style={{ flexShrink: 0 }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              borderRadius: 12,
              textAlign: "center",
              marginTop: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              color: "#10B981",
              fontFamily: "Inter",
              fontWeight: 600,
            }}
            className="p-3 md:p-4 text-[16px] md:text-[18px]"
          >
            <TrendingDown size={20} />
            <span>Save 70-90% vs Traditional CFO</span>
          </div>

          <Link
            to="/waitlist"
            className="about-cta-button mt-8"
            style={{
              background: TERRACOTTA,
              border: `2px solid ${TERRACOTTA}`,
              color: "white",
              fontFamily: "Inter",
              fontWeight: 700,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              boxShadow: "0 4px 0 rgba(160,25,25,1), 0 8px 24px rgba(196,30,30,0.5)",
              transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
              width: "100%",
              textDecoration: "none",
            }}
          >
            <span className="text-[18px] md:text-[19px] py-4 md:py-[18px]">Start Your Free Trial</span>
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- VISION ---------- */
function VisionSection() {
  const nodes = [
    { icon: AlertTriangle, color: "#EF4444", text: "Crisis Discovered\n14 Days Late" },
    { icon: ArrowRight, color: TERRACOTTA, text: "FynHelp\nIntelligence Layer", center: true },
    { icon: CheckCircle2, color: "#10B981", text: "Prevented\n60 Days Ahead" },
  ];
  return (
    <section
      style={{
        background: DARK,
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
        position: "relative",
      }}
      className="py-[80px] md:py-[120px] px-5 md:px-[60px]"
    >
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: 60, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ height: 2, background: TERRACOTTA, margin: "0 auto 32px" }}
      />
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        style={{ color: TERRACOTTA, fontFamily: "Inter", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, textAlign: "center" }}
        className="text-[15px] mb-5 md:mb-8"
      >
        The Vision
      </motion.p>
      <motion.h2
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        style={{ fontFamily: "Georgia", fontWeight: 900, color: "white", textAlign: "center", maxWidth: 800, margin: "0 auto", lineHeight: 1.2 }}
        className="text-[38px] md:text-[64px] mb-6 md:mb-10"
      >
        Preventing Crises Before They Happen
      </motion.h2>
      <motion.p
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        style={{ fontFamily: "Inter", fontWeight: 500, color: "rgba(255,255,255,0.8)", maxWidth: 700, margin: "0 auto", textAlign: "center" }}
        className="text-[19px] md:text-[23px] leading-[1.7] md:leading-[1.8]"
      >
        We are building toward a future where no Indian SME owner discovers a cash crisis too late to fix it. Where GST notices are prevented, not received. Where the decision to hire, borrow, or extend credit is made with full knowledge of the consequences.
      </motion.p>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        whileInView={{ width: 60, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{ height: 2, background: TERRACOTTA, margin: "32px auto 0" }}
      />

      <div className="max-w-[900px] mx-auto mt-12 md:mt-16 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
        {nodes.map((n, i) => {
          const Icon = n.icon;
          const isCenter = !!n.center;
          const size = isCenter ? 96 : 80;
          return (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.15 }}
              className="flex flex-col items-center text-center gap-3 md:gap-4 flex-1"
            >
              <div
                style={{
                  width: size,
                  height: size,
                  borderRadius: "50%",
                  background: `${n.color}1A`,
                  border: `2px solid ${n.color}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={isCenter ? 44 : 36} color={n.color} />
              </div>
              <div style={{ fontFamily: "Inter", fontWeight: 600, color: "white", whiteSpace: "pre-line" }} className="text-[16px] md:text-[18px]">
                {n.text}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- FOUNDER STORY TIMELINE ---------- */
function StorySection() {
  const events = [
    { year: "2023", icon: Sparkles, color: "rgba(16,185,129,0.9)", title: "Started Dark Capital", desc: "Launched a luxury sugar-free chocolate brand with big dreams and optimism. Revenue growing, customers loving the product." },
    { year: "2024", icon: AlertTriangle, color: "rgba(245,158,11,0.9)", title: "Hidden Payables Discovered", desc: "Realized we had zero visibility into our true cash position. Hidden vendor payables, delayed payments, no real-time tracking." },
    { year: "2024", icon: TimerOff, color: "#EF4444", title: "14 Days from Bankruptcy", desc: "Discovered we were 14 days away from running out of cash, not 60 days out when we could have acted. No CFO. No warning system. Just sudden crisis." },
    { year: "2025", icon: XCircle, color: "rgba(239,68,68,0.7)", title: "Shut Down Dark Capital", desc: "Made the painful decision to close the business. The product was great. The execution was solid. But we flew blind financially." },
    { year: "2025", icon: Lightbulb, color: TERRACOTTA, title: "Built FynHelp", desc: "We decided to build what we wish we'd had. An AI CFO that gives every Indian SME the financial intelligence to prevent what happened to us." },
  ];
  return (
    <section style={{ background: DEEPER }} className="py-[80px] md:py-[120px] px-5 md:px-[60px]">
      <p style={{ color: TERRACOTTA, fontFamily: "Inter", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, textAlign: "center" }} className="text-[15px] mb-4 md:mb-6">
        Our Story
      </p>
      <h2 style={{ fontFamily: "Georgia", fontWeight: 700, color: "white", textAlign: "center" }} className="text-[38px] md:text-[56px] mb-10 md:mb-16">
        Born from Personal Pain
      </h2>

      <div className="max-w-[900px] mx-auto relative" style={{ paddingLeft: 0 }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 2,
            background: "linear-gradient(rgba(196,30,30,0.3), rgba(196,30,30,0.1))",
          }}
          className="left-[20px] md:left-[40px]"
        />
        <div className="flex flex-col gap-8 md:gap-10">
          {events.map((e, i) => {
            const Icon = e.icon;
            return (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                className="relative pl-[60px] md:pl-[100px]"
              >
                <div
                  className="absolute top-0"
                  style={{
                    left: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(196,30,30,0.15)",
                    border: `2px solid ${TERRACOTTA}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Inter",
                    fontWeight: 700,
                    color: TERRACOTTA,
                    fontSize: 15,
                    zIndex: 2,
                  }}
                >
                  {e.year}
                </div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    backdropFilter: "blur(10px)",
                  }}
                  className="p-5 md:p-8"
                >
                  <Icon size={24} color={e.color} className="mb-3" />
                  <h3 style={{ fontFamily: "Georgia", fontWeight: 700, color: "white" }} className="text-[21px] md:text-[25px] mb-3">
                    {e.title}
                  </h3>
                  <p style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }} className="text-[17px] md:text-[19px]">
                    {e.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Desktop year badges adjustment */}
        <style>{`
          @media (min-width: 768px) {
            .timeline-year { width: 60px; height: 60px; font-size: 19px; }
          }
        `}</style>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        style={{
          background: "rgba(196,30,30,0.08)",
          borderLeft: `4px solid ${TERRACOTTA}`,
          borderRadius: 12,
          maxWidth: 800,
          margin: "32px auto 0",
        }}
        className="p-5 md:p-8 mt-8 md:mt-12"
      >
        <p style={{ fontFamily: "Georgia", fontWeight: 600, fontStyle: "italic", color: "rgba(255,255,255,0.9)", lineHeight: 1.7 }} className="text-[19px] md:text-[23px]">
          "We're building what we wish we'd had. No founder should discover their crisis 14 days too late."
        </p>
        <p style={{ fontFamily: "Inter", fontWeight: 600, color: TERRACOTTA, marginTop: 16 }} className="text-[16px] md:text-[18px]">
         — Tarun &amp; Nidhi, Co-Founders
        </p>
      </motion.div>
    </section>
  );
}

/* ---------- TEAM ---------- */
function TeamSection() {
  const founders = [
    {
      letter: "T",
      name: "Adireddy Tarun",
      title: "CEO & CO-FOUNDER",
      bio: "B.Tech in Computer Science with 6 years of industry experience spanning technical development and management. Led engineering teams and product strategy at scale before founding FynHelp to solve the financial intelligence gap for Indian SMEs.",
      linkedin: "https://www.linkedin.com/in/tarun-adireddy/",
    },
    {
      letter: "N",
      name: "Nidhi Siddhapura",
      title: "CMO & CO-FOUNDER",
      bio: "MBA in Data Analytics with 3 years of experience in marketing and management. Built brand strategies for multiple startups and maintains a growing presence as a micro-influencer in the business and finance space. Leads all go-to-market and community-building efforts at FynHelp.",
      linkedin: "https://www.linkedin.com/in/nidhi-siddhapura/",
    },
  ];
  return (
    <section style={{ background: DARK }} className="py-[80px] md:py-[120px] px-5 md:px-[60px]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-[55%_45%] gap-12 md:gap-20 items-center">
        <div>
          <p style={{ color: TERRACOTTA, fontFamily: "Inter", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }} className="text-[15px] mb-4 md:mb-6 text-center md:text-left">
            The Team
          </p>
          <h2 style={{ fontFamily: "Georgia", fontWeight: 700, color: "white" }} className="text-[38px] md:text-[56px] mb-8 md:mb-12 text-center md:text-left">
            The Minds Behind FynHelp
          </h2>
          <div className="flex flex-col gap-5 md:gap-6">
            {founders.map((f) => (
              <motion.div
                key={f.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                className="about-founder-card md:flex md:gap-6"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderLeft: `4px solid ${TERRACOTTA}`,
                  borderRadius: 16,
                  padding: 24,
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    background: `linear-gradient(135deg, ${TERRACOTTA}, ${TERRACOTTA_LIGHT})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "Georgia",
                    fontWeight: 900,
                    color: "white",
                    flexShrink: 0,
                  }}
                  className="text-[38px] md:text-[56px] mx-auto md:mx-0 mb-4 md:mb-0 md:w-[120px] md:h-[120px]"
                >
                  {f.letter}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 style={{ fontFamily: "Georgia", fontWeight: 700, color: "white" }} className="text-[23px] md:text-[27px] mb-2">
                    {f.name}
                  </h3>
                  <p style={{ fontFamily: "Inter", fontWeight: 600, color: TERRACOTTA, textTransform: "uppercase", letterSpacing: 1 }} className="text-[15px] md:text-[17px] mb-3 md:mb-4">
                    {f.title}
                  </p>
                  <p style={{ fontFamily: "Inter", color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }} className="text-[17px] md:text-[18px]">
                    {f.bio}
                  </p>
                  <a
                    href={f.linkedin}
                    target="_blank" rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      fontFamily: "Inter",
                      fontWeight: 600,
                      color: "rgba(255,255,255,0.6)",
                      marginTop: 16,
                      transition: "color 0.3s",
                    }}
                    className="text-[16px]"
                    onMouseEnter={(e) => (e.currentTarget.style.color = TERRACOTTA)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  >
                    <Linkedin size={16} />
                    Connect
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center relative" style={{ minHeight: 400 }}>
          <div
            style={{
              width: 400,
              height: 400,
              position: "relative",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, rgba(196,30,30,0.15), rgba(229,93,93,0.08))",
                border: "2px solid rgba(196,30,30,0.3)",
                borderRadius: 20,
                padding: 40,
                transform: "rotate(-5deg)",
                boxShadow: "0 20px 60px rgba(196,30,30,0.2)",
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div style={{ fontFamily: "Georgia", fontWeight: 900, color: "white", fontSize: 108, lineHeight: 1, marginBottom: 12 }}>
                63M
              </div>
              <div style={{ fontFamily: "Inter", fontWeight: 600, fontSize: 21, color: "rgba(255,255,255,0.7)" }}>
                Businesses
              </div>
              <div style={{ marginTop: "auto", fontFamily: "Inter", fontWeight: 700, color: TERRACOTTA, fontSize: 19 }}>
                2 Founders, 1 Mission
              </div>
            </div>
          </div>
        </div>

        {/* Mobile alt */}
        <div className="md:hidden">
          <div
            style={{
              background: "rgba(196,30,30,0.1)",
              border: "1px solid rgba(196,30,30,0.3)",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              fontFamily: "Inter",
              fontWeight: 600,
              color: "white",
              fontSize: 21,
            }}
          >
            Building for 63M Indian Businesses
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- PARTNERS ---------- */
function PartnersSection() {
  const partners = ["Razorpay", "Zoho Books", "AWS", "Supabase", "Resend", "PostHog", "Sentry", "Stripe"];
  return (
    <section
      style={{
        background: DARK,
        backgroundImage: "radial-gradient(circle at center, rgba(196,30,30,0.03), transparent 60%)",
      }}
      className="py-[60px] md:py-[100px] px-5 md:px-[60px]"
    >
      <h2 style={{ fontFamily: "Georgia", fontWeight: 700, color: "white", textAlign: "center" }} className="text-[32px] md:text-[50px] mb-3 md:mb-4">
        Powered by Enterprise Infrastructure
      </h2>
      <p style={{ fontFamily: "Inter", fontWeight: 500, color: "rgba(255,255,255,0.6)", textAlign: "center", maxWidth: 600, margin: "0 auto" }} className="text-[18px] md:text-[20px] mb-10 md:mb-16">
        Built on the same platforms Fortune 500 companies trust
      </p>
      <div className="max-w-[1100px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {partners.map((p) => (
          <div
            key={p}
            className="about-partner"
            style={{
              padding: "24px 16px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 80,
              transition: "all 0.4s ease",
              fontFamily: "Inter",
              fontWeight: 700,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            <span className="text-[17px] md:text-[21px]">{p}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
function FinalCTA() {
  return (
    <section
      style={{
        background: `linear-gradient(180deg, ${DARK} 0%, ${DEEPER} 100%)`,
        position: "relative",
        overflow: "hidden",
      }}
      className="py-[80px] md:py-[120px] px-5 md:px-[60px]"
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(600px, 90vw)",
          height: "min(600px, 90vw)",
          background: "radial-gradient(circle, rgba(196,30,30,0.12), transparent 70%)",
          filter: "blur(100px)",
          zIndex: 0,
        }}
      />
      <div className="relative z-10 text-center">
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ fontFamily: "Georgia", fontWeight: 700, color: "white", maxWidth: 700, margin: "0 auto 24px", lineHeight: 1.2 }}
          className="text-[38px] md:text-[56px]"
        >
          Ready to Experience Financial Intelligence?
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ fontFamily: "Inter", fontWeight: 500, color: "rgba(255,255,255,0.7)", maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}
          className="text-[18px] md:text-[21px] mb-8 md:mb-12"
        >
          Join our founding member waitlist
        </motion.p>
        <Link
          to="/waitlist"
          className="about-cta-button inline-flex"
          style={{
            background: TERRACOTTA,
            border: `2px solid ${TERRACOTTA}`,
            color: "white",
            fontFamily: "Inter",
            fontWeight: 700,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            boxShadow: "0 4px 0 rgba(160,25,25,1), 0 8px 24px rgba(196,30,30,0.5)",
            transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
            textDecoration: "none",
          }}
        >
          <span className="text-[19px] md:text-[21px] py-[18px] md:py-5 px-9 md:px-12">Start Your Free Trial</span>
          <ArrowRight size={22} style={{ marginRight: 24 }} />
        </Link>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
          {[
            { icon: Check, label: "No credit card required" },
            { icon: Clock, label: "30 days free for beta users" },
            { icon: Shield, label: "Cancel anytime" },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "Inter",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                }}
                className="text-[14px] md:text-[16px]"
              >
                <Icon size={14} />
                <span>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------- PAGE ---------- */
export default function AboutPage() {
  return (
    <Layout>
      <Helmet>
        <title>About FynHelp — Built by Founders, for Founders</title>
        <meta name="description" content="FynHelp was born from the failure of Dark Capital. Two founders who lost a business to financial blindness are now building India's AI CFO platform." />
        <link rel="canonical" href="https://fynhelp.com/about" />
        <meta property="og:title" content="About FynHelp — Built by Founders, for Founders" />
        <meta property="og:description" content="FynHelp was born from the failure of Dark Capital. Two founders building India's AI CFO platform." />
        <meta property="og:url" content="https://fynhelp.com/about" />
      </Helmet>
      <style>{`
        .about-hero { isolation: isolate; }
        .about-particle {
          position: absolute;
          width: 2px;
          height: 2px;
          border-radius: 50%;
          background: rgba(196, 30, 30, 0.3);
          animation: aboutParticleFloat linear infinite;
        }
        @keyframes aboutParticleFloat {
          0% { transform: translate(0, 0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translate(40px, -120px); opacity: 0; }
        }
        @media (hover: hover) {
          .about-stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(196,30,30,0.15);
          }
          .about-founder-card:hover {
            background: rgba(255,255,255,0.08) !important;
            transform: translateX(8px);
            border-left-width: 6px;
          }
          .about-cta-button:hover {
            transform: translateY(-4px);
            box-shadow: 0 6px 0 rgba(160,25,25,1), 0 12px 32px rgba(196,30,30,0.7);
          }
          .about-partner:hover {
            transform: translateY(-4px) scale(1.05);
            background: radial-gradient(circle, rgba(196,30,30,0.08), transparent);
            color: white !important;
          }
        }
        .about-cta-button:active {
          transform: translateY(2px);
          box-shadow: 0 2px 0 rgba(160,25,25,1), 0 4px 16px rgba(196,30,30,0.5);
        }
        @media (max-width: 767px) {
          .about-particle { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .about-particle, * { animation: none !important; }
        }
        html, body { overflow-x: hidden; }
      `}</style>
      <main style={{ background: DARK, color: "white" }}>
        <Hero />
        <ProblemSection />
        <ComparisonSection />
        <PricingComparison />
        <VisionSection />
        <StorySection />
        <TeamSection />
        <PartnersSection />
        <FinalCTA />
      </main>
    </Layout>
  );
}
