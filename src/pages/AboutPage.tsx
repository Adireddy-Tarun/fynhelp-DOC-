import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Droplet,
  TrendingUp,
  DollarSign,
  FileText,
  Shield,
} from "lucide-react";
import Layout from "@/components/Layout";

const TERRACOTTA = "#C41E1E";
const TERRACOTTA_LIGHT = "#E85D5D";
const DARK = "#1a1412";
const DEEPER = "#0a0a0a";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const Section = ({
  children,
  style,
  className = "",
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}) => (
  <section
    className={className}
    style={{
      position: "relative",
      overflow: "hidden",
      ...style,
    }}
  >
    <div
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 var(--about-px, 60px)",
        position: "relative",
        zIndex: 1,
      }}
    >
      {children}
    </div>
  </section>
);

const Tag = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      fontFamily: "Inter, sans-serif",
      fontWeight: 700,
      fontSize: 12,
      color: TERRACOTTA,
      textTransform: "uppercase",
      letterSpacing: "2px",
      marginBottom: 24,
    }}
  >
    {children}
  </div>
);

const suites = [
  { icon: Droplet, title: "Liquidity Intelligence", desc: "Real-time cash flow tracking, burn rate alerts, runway forecasting" },
  { icon: TrendingUp, title: "Revenue Intelligence", desc: "MRR/ARR tracking, cohort analysis, churn prediction" },
  { icon: DollarSign, title: "Cost Intelligence", desc: "Expense categorization, vendor spend analysis, optimization insights" },
  { icon: FileText, title: "GST & Tax Intelligence", desc: "Compliance tracking, ITC reconciliation, deadline alerts" },
  { icon: Shield, title: "Governance Intelligence", desc: "Audit readiness, compliance tracking, regulatory alerts" },
];

const partners = [
  ["Razorpay", "Zoho Books", "AWS", "Supabase"],
  ["Resend", "PostHog", "Sentry", "Stripe"],
].flat();

const AboutPage = () => (
  <Layout>
    <style>{`
      .about-page { background: ${DARK}; color: rgba(255,255,255,0.95); font-family: 'Inter', sans-serif; }
      .about-h { font-family: Georgia, serif; color: #fff; }
      .about-grid-2 { display: grid; grid-template-columns: 1fr; gap: 40px; align-items: center; }
      .about-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 48px; }
      .about-pills { display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 16px 60px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
      .about-pills::-webkit-scrollbar { display: none; }
      .about-pill { width: 220px; min-width: 220px; height: 280px; background: #fff; border-radius: 20px; padding: 32px 24px; display: flex; flex-direction: column; align-items: center; text-align: center; box-shadow: 0 8px 32px rgba(0,0,0,0.3); scroll-snap-align: center; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
      .about-pill:hover { transform: translateY(-12px); box-shadow: 0 20px 60px rgba(196,30,30,0.25); }
      .about-stat:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(196,30,30,0.15); }
      .about-stat { transition: all 0.3s ease; }
      .about-cta { background: ${TERRACOTTA}; border: 2px solid ${TERRACOTTA}; color: #fff; font-family: Inter, sans-serif; font-weight: 700; font-size: 16px; padding: 16px 32px; border-radius: 12px; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 20px rgba(196,30,30,0.4); transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1); cursor: pointer; }
      .about-cta:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(196,30,30,0.6); filter: brightness(1.1); }
      .about-cta-lg { font-size: 18px; padding: 20px 48px; border-radius: 14px; box-shadow: 0 4px 0 rgba(160,25,25,1), 0 8px 24px rgba(196,30,30,0.5); }
      .about-cta-lg:hover { transform: translateY(-4px); box-shadow: 0 6px 0 rgba(160,25,25,1), 0 12px 32px rgba(196,30,30,0.7); filter: brightness(1.05); }
      .about-cta-lg:active { transform: translateY(2px); box-shadow: 0 2px 0 rgba(160,25,25,1), 0 4px 16px rgba(196,30,30,0.5); }
      .about-founder-card { background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 32px; margin-bottom: 24px; transition: all 0.3s ease; }
      .about-founder-card:hover { background: rgba(255,255,255,0.08); transform: translateX(8px); }
      .about-logo-cell { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 32px 24px; display: flex; align-items: center; justify-content: center; height: 100px; transition: all 0.3s ease; font-family: Inter, sans-serif; font-weight: 600; color: rgba(255,255,255,0.6); letter-spacing: 0.5px; }
      .about-logo-cell:hover { background: rgba(255,255,255,0.08); border-color: rgba(196,30,30,0.3); color: rgba(255,255,255,1); }
      .about-logo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; max-width: 1000px; margin: 0 auto; }
      @keyframes aboutWave { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
      .about-wave { animation: aboutWave 20s ease-in-out infinite; }
      @media (min-width: 900px) {
        .about-grid-60-40 { grid-template-columns: 60% 40%; gap: 80px; }
        .about-grid-40-60 { grid-template-columns: 40% 60%; gap: 80px; }
        .about-grid-50-50 { grid-template-columns: 1fr 1fr; gap: 80px; }
        .about-grid-55-45 { grid-template-columns: 55% 45%; gap: 60px; }
      }
      @media (max-width: 768px) {
        :root { --about-px: 24px; }
        .about-logo-grid { grid-template-columns: repeat(2, 1fr); }
        .about-pills { padding: 16px 24px; }
        .about-stat-grid { gap: 12px; }
      }
    `}</style>

    <div className="about-page">
      {/* SECTION 1: HERO */}
      <Section
        style={{
          background: `linear-gradient(180deg, ${DARK} 0%, ${DEEPER} 100%)`,
          padding: "140px 0",
        }}
      >
        <svg
          className="about-wave"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 0 }}
          viewBox="0 0 1440 800"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            d="M0,400 C360,300 720,500 1440,350 L1440,800 L0,800 Z"
            fill="rgba(255,255,255,0.02)"
          />
          <path
            d="M0,500 C480,400 960,600 1440,450 L1440,800 L0,800 Z"
            fill="rgba(255,255,255,0.015)"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 400,
            background: "radial-gradient(circle, rgba(196,30,30,0.08), transparent)",
            filter: "blur(80px)",
            zIndex: 0,
          }}
        />
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <Tag>About FynHelp</Tag>
          <h1
            className="about-h"
            style={{
              fontWeight: 900,
              fontSize: "clamp(40px, 6vw, 64px)",
              lineHeight: 1.15,
              maxWidth: 900,
              margin: "0 auto 24px",
              textShadow: "0 4px 12px rgba(0,0,0,0.6)",
            }}
          >
            We're Building Financial Intelligence for 63 Million Indian Businesses
          </h1>
          <p
            style={{
              fontWeight: 500,
              fontSize: "clamp(18px, 2vw, 22px)",
              color: "rgba(255,255,255,0.7)",
              lineHeight: 1.6,
              maxWidth: 700,
              margin: "0 auto",
            }}
          >
            Every SME deserves CFO-level clarity — without CFO-level cost
          </p>
        </motion.div>
      </Section>

      {/* SECTION 2: PROBLEM */}
      <Section style={{ padding: "120px 0", background: DARK }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="about-grid-2 about-grid-60-40"
        >
          <div>
            <Tag>The Problem</Tag>
            <h2
              className="about-h"
              style={{ fontWeight: 700, fontSize: "clamp(36px, 4vw, 48px)", lineHeight: 1.2, marginBottom: 32 }}
            >
              India's SMEs Are <span style={{ color: TERRACOTTA }}>Flying Blind</span>
            </h2>
            {[
              "India has 63 million small and medium businesses. Together, they employ 110 million people and contribute nearly 30% of our GDP.",
              "Yet the vast majority operate without even basic financial intelligence — no cash flow visibility, no proactive compliance, no way to model decisions before making them.",
              "A CFO costs ₹30–50 lakh a year. Most SMEs can't afford one.",
            ].map((t, i) => (
              <p
                key={i}
                style={{
                  fontSize: 17,
                  color: "rgba(255,255,255,0.75)",
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                {t}
              </p>
            ))}
            <div className="about-stat-grid">
              {[
                { num: "63M", label: "Businesses" },
                { num: "110M", label: "People Employed" },
                { num: "30%", label: "of GDP" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="about-stat"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "24px 20px",
                    textAlign: "center",
                  }}
                >
                  <div
                    className="about-h"
                    style={{ fontWeight: 900, fontSize: 36, color: TERRACOTTA, lineHeight: 1, marginBottom: 8 }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.6)",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 8px 32px rgba(196,30,30,0.15)",
              background: `linear-gradient(135deg, #3D2817, ${DARK})`,
              height: 500,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AlertCircle size={80} color="rgba(255,255,255,0.1)" strokeWidth={1.5} />
          </div>
        </motion.div>
      </Section>

      {/* SECTION 3: OUR SOLUTION */}
      <Section style={{ padding: "120px 0", background: `linear-gradient(180deg, ${DARK}, ${DEEPER})` }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="about-grid-2 about-grid-40-60"
        >
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 8px 32px rgba(196,30,30,0.15)",
              background: `linear-gradient(135deg, #2a1f1a, ${DARK})`,
              height: 500,
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 24,
                right: 24,
                background: `linear-gradient(135deg, ${TERRACOTTA}, ${TERRACOTTA_LIGHT})`,
                padding: "20px 28px",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(196,30,30,0.6)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div
                className="about-h"
                style={{ fontWeight: 900, fontSize: 32, color: "#fff", lineHeight: 1, marginBottom: 4 }}
              >
                ₹1,999/month
              </div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
                vs ₹30-50L for CFO
              </div>
            </div>
          </div>
          <div>
            <Tag>Our Solution</Tag>
            <h2
              className="about-h"
              style={{ fontWeight: 700, fontSize: "clamp(36px, 4vw, 48px)", lineHeight: 1.2, marginBottom: 32 }}
            >
              CFO-Level Intelligence. <span style={{ color: TERRACOTTA }}>Startup Pricing.</span>
            </h2>
            {[
              "FynHelp was founded on a simple belief: every business that generates revenue deserves the same quality of financial intelligence that large corporations take for granted.",
              "We built CFO Fynny — an AI CFO who speaks your language, knows your business, monitors your numbers every day, and tells you exactly what to do.",
              "For ₹1,999 a month.",
            ].map((t, i) => (
              <p key={i} style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 16 }}>
                {t}
              </p>
            ))}
            <button className="about-cta" style={{ marginTop: 32 }}>
              Meet Fynny <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </Section>

      {/* SECTION 4: VISION */}
      <Section
        style={{
          padding: "120px 0",
          background: `${DARK} url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'><path d='M0 0H40M0 0V40' stroke='rgba(255,255,255,0.02)' stroke-width='1'/></svg>")`,
        }}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          style={{ textAlign: "center" }}
        >
          <div style={{ width: 60, height: 2, background: TERRACOTTA, margin: "0 auto 40px" }} />
          <Tag>The Vision</Tag>
          <h2
            className="about-h"
            style={{
              fontWeight: 900,
              fontSize: "clamp(38px, 5vw, 56px)",
              lineHeight: 1.2,
              maxWidth: 800,
              margin: "0 auto 40px",
            }}
          >
            Preventing Crises Before They Happen
          </h2>
          <p
            style={{
              fontWeight: 500,
              fontSize: "clamp(18px, 2vw, 20px)",
              color: "rgba(255,255,255,0.8)",
              lineHeight: 1.8,
              maxWidth: 700,
              margin: "0 auto",
            }}
          >
            We are building toward a future where no Indian SME owner discovers a cash crisis too late to fix it.
            Where GST notices are prevented, not received. Where the decision to hire, borrow, or extend credit is
            made with full knowledge of the consequences.
          </p>
          <div style={{ width: 60, height: 2, background: TERRACOTTA, margin: "40px auto 0" }} />
        </motion.div>
      </Section>

      {/* SECTION 5: FOUNDER STORY */}
      <Section style={{ padding: "120px 0", background: DARK }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="about-grid-2 about-grid-50-50"
        >
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              background: `linear-gradient(135deg, #3D2817, ${DARK})`,
              height: 500,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 24,
                left: 24,
                background: "rgba(26,20,18,0.9)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(196,30,30,0.4)",
                padding: "8px 16px",
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 12,
                color: TERRACOTTA,
              }}
            >
              Founded 2024
            </div>
          </div>
          <div>
            <Tag>Our Story</Tag>
            <h2
              className="about-h"
              style={{ fontWeight: 700, fontSize: "clamp(32px, 3.5vw, 42px)", lineHeight: 1.2, marginBottom: 32 }}
            >
              Born from Personal Pain
            </h2>
            {[
              "We ran a luxury chocolate brand that nearly went bankrupt because we couldn't see our cash position until it was too late.",
              "Hidden payables. Zero visibility. We discovered our crisis 14 days before running out of money — not 60 days out, when we could have acted.",
              "We shut down in late 2025. FynHelp is what we wish we'd had.",
            ].map((t, i) => (
              <p key={i} style={{ fontSize: 17, color: "rgba(255,255,255,0.75)", lineHeight: 1.8, marginBottom: 16 }}>
                {t}
              </p>
            ))}
            <p
              style={{
                fontWeight: 600,
                fontSize: 16,
                color: "rgba(255,255,255,0.9)",
                fontStyle: "italic",
                marginTop: 32,
              }}
            >
              — Tarun & Nidhi, Co-founders
            </p>
          </div>
        </motion.div>
      </Section>

      {/* SECTION 6: INTELLIGENCE SUITES */}
      <Section style={{ padding: "120px 0", background: DEEPER }}>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="about-h"
          style={{
            fontWeight: 700,
            fontSize: "clamp(36px, 4vw, 48px)",
            textAlign: "center",
            marginBottom: 64,
          }}
        >
          5 Intelligence Suites Built for India
        </motion.h2>
        <div className="about-pills" style={{ marginLeft: -60, marginRight: -60 }}>
          {suites.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                className="about-pill"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <div
                  style={{
                    width: 60,
                    height: 60,
                    background: "rgba(196,30,30,0.1)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <Icon size={28} color={TERRACOTTA} strokeWidth={2} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 18, color: DARK, lineHeight: 1.3, marginBottom: 12 }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: "rgba(26,20,18,0.7)", lineHeight: 1.5 }}>{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </Section>

      {/* SECTION 7: PARTNERS */}
      <Section
        style={{
          padding: "100px 0",
          background: `radial-gradient(circle at center, rgba(196,30,30,0.04), ${DARK})`,
        }}
      >
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="about-h"
          style={{
            fontWeight: 700,
            fontSize: "clamp(32px, 3.5vw, 42px)",
            textAlign: "center",
            marginBottom: 64,
          }}
        >
          Integrated with India's Leading Platforms
        </motion.h2>
        <div className="about-logo-grid">
          {partners.map((p) => (
            <div key={p} className="about-logo-cell">
              {p}
            </div>
          ))}
        </div>
      </Section>

      {/* SECTION 8: TEAM */}
      <Section style={{ padding: "120px 0", background: DARK }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="about-grid-2 about-grid-55-45"
        >
          <div>
            <Tag>The Team</Tag>
            <h2
              className="about-h"
              style={{ fontWeight: 700, fontSize: "clamp(36px, 4vw, 48px)", lineHeight: 1.2, marginBottom: 48 }}
            >
              The Minds Behind FynHelp
            </h2>
            {[
              {
                name: "Adireddy Tarun",
                title: "CEO & Founder",
                bio: "B.Tech in Computer Science with 6 years of industry experience spanning technical development and management. Led engineering teams and product strategy at scale before founding FynHelp to solve the financial intelligence gap for Indian SMEs.",
              },
              {
                name: "Nidhi Siddhpura",
                title: "CMO & Co-Founder",
                bio: "MBA in Data Analytics with 3 years of experience in marketing and management. Built brand strategies for multiple startups and maintains a growing presence as a micro-influencer in the business and finance space. Leads all go-to-market and community-building efforts at FynHelp.",
              },
            ].map((f) => (
              <div key={f.name} className="about-founder-card">
                <h3 className="about-h" style={{ fontWeight: 700, fontSize: 24, marginBottom: 8 }}>
                  {f.name}
                </h3>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    color: TERRACOTTA,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                    marginBottom: 16,
                  }}
                >
                  {f.title}
                </div>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>{f.bio}</p>
              </div>
            ))}
          </div>
          <div
            style={{
              width: "min(400px, 80vw)",
              height: "min(400px, 80vw)",
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${TERRACOTTA}, ${TERRACOTTA_LIGHT})`,
              border: "8px solid white",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 0 16px rgba(255,255,255,0.1)",
              position: "relative",
              overflow: "hidden",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="about-h"
              style={{ fontWeight: 900, fontSize: 96, color: "rgba(255,255,255,0.9)", letterSpacing: "-2px" }}
            >
              T&N
            </span>
            <div
              style={{
                position: "absolute",
                bottom: 20,
                right: 20,
                background: "rgba(26,20,18,0.95)",
                backdropFilter: "blur(10px)",
                border: `1px solid ${TERRACOTTA}`,
                padding: "8px 16px",
                borderRadius: 20,
                fontWeight: 600,
                fontSize: 11,
                color: "#fff",
              }}
            >
              Est. 2024
            </div>
          </div>
        </motion.div>
      </Section>

      {/* SECTION 9: FINAL CTA */}
      <Section
        style={{
          padding: "120px 0",
          background: `linear-gradient(180deg, ${DARK} 0%, ${DEEPER} 100%)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(196,30,30,0.12), transparent)",
            filter: "blur(100px)",
            zIndex: 0,
          }}
        />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          style={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <h2
            className="about-h"
            style={{
              fontWeight: 700,
              fontSize: "clamp(36px, 4vw, 48px)",
              maxWidth: 700,
              margin: "0 auto 24px",
            }}
          >
            Ready to Experience Financial Intelligence?
          </h2>
          <p
            style={{
              fontWeight: 500,
              fontSize: "clamp(16px, 2vw, 18px)",
              color: "rgba(255,255,255,0.7)",
              maxWidth: 600,
              margin: "0 auto 48px",
            }}
          >
            Join 1,000+ beta users building the future of Indian SME finance
          </p>
          <button className="about-cta about-cta-lg">
            Start Your Free Trial <ArrowRight size={22} />
          </button>
        </motion.div>
      </Section>
    </div>
  </Layout>
);

export default AboutPage;
