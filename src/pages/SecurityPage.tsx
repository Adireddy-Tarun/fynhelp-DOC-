import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, RefreshCw, CheckCircle2, X, KeyRound, Server, Users, FileCheck, Clock, Calendar, Rocket } from "lucide-react";
import Layout from "@/components/Layout";

const INK = "#1A1008";
const RED = "#C41E1E";
const BEIGE = "#F4EDDA";
const GOLD = "#8B6914";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] as const },
};

/* ─────────────────── Whitepaper Modal ─────────────────── */
const WhitepaperModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-8">
      <h3 style={{ fontFamily: "'Raleway'", fontWeight: 600, fontSize: 20, color: INK, marginBottom: 12 }}>{title}</h3>
      <div style={{ fontFamily: "'Roboto'", fontSize: 15, color: INK, lineHeight: 1.8 }}>{children}</div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(26,16,8,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative bg-white rounded-3xl w-full max-w-[900px] max-h-[85vh] overflow-hidden flex flex-col"
        style={{ boxShadow: "0 40px 100px rgba(26,16,8,0.3)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:rotate-90 z-10"
          style={{ background: BEIGE, color: INK }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="px-8 md:px-14 pt-10 pb-6 border-b" style={{ borderColor: "rgba(26,16,8,0.08)" }}>
          <h2 style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 32, color: INK, lineHeight: 1.15 }}>
            FYNHelp Security &amp; Privacy Policy
          </h2>
          <p style={{ fontFamily: "'Roboto'", fontSize: 13, color: "rgba(26,16,8,0.6)", marginTop: 8 }}>
            Last Updated: May 2026 · Version 1.0 (Pre-Launch)
          </p>
        </div>

        <div className="overflow-y-auto px-8 md:px-14 py-8 flex-1">
          <Section title="1. Data Collection & Storage">
            We collect only the minimum data necessary to provide FYNHelp's financial intelligence services.
            <br /><br />
            <strong>Account Data (Required):</strong> Full name, email, phone, company name, industry, business registration details, and onboarding preferences.
            <br /><br />
            <strong>Financial System Connections (Optional, User-Initiated):</strong> OAuth tokens for Razorpay, Zoho Books, or Account Aggregator banks; transaction metadata (dates, amounts, categories — not full narratives stored permanently); invoice and payment records cached temporarily for analysis, then discarded.
            <br /><br />
            <strong>Usage Analytics (Non-Personal):</strong> Feature usage statistics, performance metrics, anonymized error logs.
            <br /><br />
            <strong>What we DON'T collect:</strong> Razorpay/Zoho/banking passwords (we use OAuth 2.0), full transaction narratives, biometrics, location tracking, or anything unrelated to financial intelligence.
          </Section>

          <Section title="2. Data Storage & Encryption">
            <strong>Infrastructure:</strong> Hosted on enterprise-grade cloud (Supabase) in Mumbai, India (ap-south-1). All data stays within Indian borders, RBI data localization compliant. Daily encrypted backups with 30-day retention.
            <br /><br />
            <strong>Encryption:</strong> AES-256-GCM at rest. TLS 1.3 with perfect forward secrecy in transit. Encryption keys managed via Vault, rotated quarterly.
            <br /><br />
            <strong>Database Security:</strong> PostgreSQL with Row Level Security (RLS), parameterized queries, weekly automated vulnerability scanning.
          </Section>

          <Section title="3. Access Controls & Authentication">
            <strong>MFA:</strong> Mandatory for all accounts. TOTP-based via authenticator apps. Backup codes for recovery.
            <br /><br />
            <strong>RBAC:</strong> Owners define roles (Admin, Manager, Accountant, Viewer) with granular permissions. Every change logged with timestamp and actor.
            <br /><br />
            <strong>Sessions:</strong> JWT tokens with 24-hour expiration, secure httpOnly cookies, auto-logout after 30 minutes of inactivity, device fingerprinting for suspicious login detection.
          </Section>

          <Section title="4. Third-Party Integrations (Available Q2 2026)">
            <strong>OAuth 2.0:</strong> Industry-standard secure authorization (same as Google, GitHub, Stripe). We never see or store your passwords.
            <br /><br />
            <strong>Read-Only:</strong> FYNHelp can only read data from Razorpay, Zoho Books, and banks. We cannot create, modify, or delete transactions; we cannot initiate payments or transfers.
            <br /><br />
            <strong>Token Security:</strong> Tokens expire after 7-30 days (provider-dependent), stored encrypted, never logged in plaintext. Instant revocation via your provider's dashboard.
          </Section>

          <Section title="5. AI & Machine Learning">
            <strong>Fynny (AI CFO):</strong> Analyzes your financial data in real-time; results are returned to you, not stored in AI training datasets. We do <em>not</em> use your proprietary financial data to train or improve our models. Fynny learns from anonymized, aggregated industry benchmarks.
            <br /><br />
            <strong>Anonymization:</strong> Any aggregated data used for product improvement strips all identifiers — no company names, transaction details, or sensitive figures.
          </Section>

          <Section title="6. Data Retention & Deletion">
            <strong>Client-Controlled Financial Data:</strong> Your actual financial data lives in your systems (Razorpay, Zoho, bank). FYNHelp caches transient copies for analysis (~90 days), then discards them. You control retention at the source.
            <br /><br />
            <strong>Account Data:</strong> Retained while your account is active. On deletion: contact details deleted within 30 days; onboarding metadata anonymized; cached financial data purged immediately; audit logs retained 90 days (regulatory) then deleted.
            <br /><br />
            <strong>Legal Holds:</strong> If required by Indian law, we may retain data beyond standard timelines. We notify you where legally permissible.
          </Section>

          <Section title="7. Security Incident Response">
            We will notify you within 24 hours of discovering any breach affecting your data, via email and SMS to account owners and admins.
            <br /><br />
            <strong>Plan:</strong> Detection → Containment → Investigation → Remediation → Communication → Post-Mortem.
            <br /><br />
            <strong>Current Record:</strong> Zero security incidents recorded during beta with sandbox data. Zero unauthorized access events since internal deployment.
          </Section>

          <Section title="8. Compliance & Certifications">
            <strong>Current:</strong> RBI Data Localization (all data in Mumbai). GDPR-Ready (data portability, right to deletion, consent management). Secure Development Lifecycle with code reviews, dependency scanning, and penetration testing.
            <br /><br />
            <strong>Roadmap:</strong> SOC 2 Type II audit (Q3 2026), ISO 27001 certification (Q4 2026), annual third-party penetration tests, bug bounty program.
          </Section>

          <Section title="9. Your Rights & Controls">
            <strong>Access:</strong> View all data we store via Settings &gt; Data Export.
            <br /><strong>Portability:</strong> Export anytime in CSV, Excel, or JSON. No fees.
            <br /><strong>Deletion:</strong> Settings &gt; Account &gt; Delete Account. 30-day deletion timeline.
            <br /><strong>Revoke Integrations:</strong> Disconnect Razorpay/Zoho/bank instantly via Integrations.
            <br /><br />
            <strong>Contact:</strong> support@fynhelp.com · privacy@fynhelp.com · support@fynhelp.com
          </Section>

          <Section title="10. Changes to This Policy">
            We notify you via email 30 days before material changes. Continued use after changes constitutes acceptance. Version history available at fynhelp.com/security/changelog.
          </Section>
        </div>

        <div className="px-8 md:px-14 py-5 border-t flex items-center justify-between gap-4 flex-wrap" style={{ borderColor: "rgba(26,16,8,0.08)", background: BEIGE }}>
          <p style={{ fontFamily: "'Roboto'", fontSize: 13, color: "rgba(26,16,8,0.7)" }}>
            Questions? Email <a href="mailto:support@fynhelp.com" style={{ color: GOLD, fontWeight: 600 }}>support@fynhelp.com</a>
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl transition-all hover:bg-fyn-gold hover:text-white"
            style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 14, border: `2px solid ${GOLD}`, color: GOLD, background: "transparent" }}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ─────────────────── Page ─────────────────── */
const SecurityPage = () => {
  const [whitepaperOpen, setWhitepaperOpen] = useState(false);

  useEffect(() => {
    document.title = "Security | FYNHelp — Enterprise-Grade Financial Data Protection";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "Learn how FYNHelp protects your financial data with bank-grade encryption, India-first infrastructure, and complete transparency."
    );
  }, []);

  return (
    <Layout>
      {/* ───── Hero (FynHelp Premium Security) ───── */}
      <section
        className="security-hero relative overflow-hidden flex items-center justify-center"
        style={{
          minHeight: 700,
          padding: "120px 40px",
          background: "linear-gradient(180deg, #1a1412 0%, #0a0a0a 100%)",
        }}
        aria-label="Security overview"
      >
        {/* Grid pattern */}
        <div
          aria-hidden="true"
          className="security-grid-pattern absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            zIndex: 1,
          }}
        />
        {/* Center radial glow */}
        <div
          aria-hidden="true"
          className="absolute pointer-events-none"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 800,
            height: 800,
            background: "radial-gradient(circle, rgba(196,30,30,0.08) 0%, transparent 70%)",
            filter: "blur(60px)",
            zIndex: 1,
          }}
        />
        {/* Top vignette */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: 200,
            background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%)",
            zIndex: 2,
          }}
        />

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.4, 0, 0.2, 1], delay: 0.1 }}
          className="security-glass-panel relative"
          style={{
            zIndex: 10,
            width: "90vw",
            maxWidth: 900,
            padding: "64px",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 32,
            overflow: "hidden",
            textAlign: "center",
            boxShadow:
              "0 20px 60px rgba(0,0,0,0.5), 0 8px 32px rgba(196,30,30,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* top highlight */}
          <div
            aria-hidden="true"
            className="absolute top-0 left-0 right-0 pointer-events-none"
            style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
          />
          {/* corner accent */}
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              top: -1,
              left: -1,
              width: 120,
              height: 120,
              background: "radial-gradient(circle at top left, rgba(196,30,30,0.15), transparent)",
              borderRadius: "32px 0 0 0",
            }}
          />

          {/* Security icon */}
          <motion.div
            initial={{ rotate: 20, scale: 0.8, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
            className="mx-auto flex items-center justify-center"
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(196,30,30,0.15), transparent 70%)",
              boxShadow: "0 0 60px rgba(196,30,30,0.3)",
              marginBottom: 32,
            }}
          >
            <Shield size={80} strokeWidth={1.5} color={RED} style={{ opacity: 0.9 }} />
          </motion.div>

          {/* Trust bar */}
          <div className="security-trustbar">
            {[
              { Icon: Shield, label: "Enterprise-Grade Security" },
              { Icon: Server, label: "Indian Data Residency" },
              { Icon: CheckCircle2, label: "Zero Breaches Since 2024" },
            ].map((t, i, arr) => (
              <div key={t.label} className="security-trustitem-wrap">
                <div className="security-trustitem">
                  <t.Icon size={20} color={RED} strokeWidth={2} />
                  <span
                    style={{
                      fontFamily: "'Inter', 'Roboto', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                    }}
                  >
                    {t.label}
                  </span>
                </div>
                {i < arr.length - 1 && (
                  <span className="security-trustsep" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>

          <h1
            className="security-headline"
            style={{
              fontFamily: "Georgia, 'Playfair Display', serif",
              fontWeight: 900,
              fontSize: "clamp(40px, 5.2vw, 64px)",
              lineHeight: 1.1,
              letterSpacing: "-1px",
              color: "#FFFFFF",
              margin: "32px 0 24px",
              textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            }}
          >
            Military-Grade Security. Zero Compromise.
          </h1>

          <p
            style={{
              fontFamily: "'Inter', 'Roboto', sans-serif",
              fontWeight: 400,
              fontSize: "clamp(17px, 1.4vw, 20px)",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.75)",
              maxWidth: 700,
              margin: "0 auto 40px",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Your financial data is the lifeblood of your business. We've built FYNHelp with enterprise-grade security standards, complete transparency, and an unwavering commitment to your privacy.
          </p>

          <div className="security-cta-row">
            <button
              onClick={() => setWhitepaperOpen(true)}
              className="security-btn-secondary"
            >
              <FileCheck size={20} />
              <span>View Security Whitepaper</span>
            </button>

            <Link to="/waitlist" className="security-btn-primary">
              <span>Start Free Trial</span>
              <Rocket size={20} />
            </Link>
          </div>
        </motion.div>

        <style>{`
          .security-trustbar {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0;
            margin: 0 auto;
          }
          .security-trustitem-wrap {
            display: inline-flex;
            align-items: center;
          }
          .security-trustitem {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            padding: 0 16px;
          }
          .security-trustsep {
            display: inline-block;
            width: 1px;
            height: 16px;
            background: rgba(255,255,255,0.2);
          }
          .security-cta-row {
            display: flex;
            gap: 20px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 40px;
          }
          .security-btn-secondary {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: transparent;
            border: 2px solid rgba(255,255,255,0.25);
            color: #FFFFFF;
            font-family: 'Inter', 'Roboto', sans-serif;
            font-weight: 600;
            font-size: 16px;
            padding: 16px 32px;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
          }
          .security-btn-secondary:hover {
            background: rgba(196,30,30,0.1);
            border-color: ${RED};
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(196,30,30,0.2);
          }
          .security-btn-secondary:active { transform: translateY(0); transition: 0.1s; }
          .security-btn-primary {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background: ${RED};
            border: 2px solid ${RED};
            color: #FFFFFF;
            font-family: 'Inter', 'Roboto', sans-serif;
            font-weight: 700;
            font-size: 16px;
            padding: 16px 36px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(196,30,30,0.4);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            text-decoration: none;
          }
          .security-btn-primary:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(196,30,30,0.6);
            filter: brightness(1.1);
          }
          .security-btn-primary:active { transform: translateY(0); transition: 0.1s; }

          @media (max-width: 767px) {
            .security-hero { min-height: 600px !important; padding: 80px 24px !important; }
            .security-glass-panel { padding: 40px 24px !important; border-radius: 24px !important; }
            .security-grid-pattern { display: none; }
            .security-trustbar {
              display: flex;
              flex-direction: column;
              gap: 16px;
            }
            .security-trustitem { padding: 0; }
            .security-trustsep { display: none; }
            .security-cta-row { flex-direction: column; gap: 16px; }
            .security-btn-secondary, .security-btn-primary {
              width: 100%;
              justify-content: center;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .security-btn-primary, .security-btn-secondary { transition: none; }
          }
        `}</style>
      </section>

      {/* ───── Section 2: Pillars ───── */}
      <section style={{ background: BEIGE, padding: "100px 24px" }}>
        <div className="max-w-[1200px] mx-auto">
          <motion.h2 {...fadeUp} className="text-center" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: "clamp(32px, 4.2vw, 48px)", color: INK, marginBottom: 20 }}>
            Built for Security, Designed for Trust
          </motion.h2>
          <motion.p {...fadeUp} className="text-center mx-auto" style={{ fontFamily: "'Raleway'", fontWeight: 400, fontSize: 18, color: "rgba(26,16,8,0.7)", maxWidth: 800, marginBottom: 60, lineHeight: 1.6 }}>
            FYNHelp's security architecture is built on industry standards and India-first compliance. Here's what that means for your business:
          </motion.p>

          <div className="grid md:grid-cols-2 gap-10">
            {[
              {
                icon: <Server size={32} color="#FFFFFF" />,
                title: "Built for Indian Businesses, Secured in India",
                bullets: [
                  ["India-First Infrastructure", "Your data never leaves India. Hosted in Mumbai (ap-south-1) on enterprise-grade cloud infrastructure with 99.9% uptime SLA."],
                  ["Bank-Grade Encryption", "AES-256-GCM at rest, TLS 1.3 in transit. Encrypted on your device before transmission and remains encrypted in our database."],
                  ["Role-Based Access Control", "Granular permissions. Define exactly who can view cash flow, edit invoices, or access GST filings. Accountants ≠ managers ≠ board."],
                  ["Regulatory Compliance", "Built day one to meet RBI data localization (all data in India) and GDPR data portability standards. Sovereignty is non-negotiable."],
                ],
              },
              {
                icon: <Lock size={32} color="#FFFFFF" />,
                title: "Your Data is Yours — And Only Yours",
                bullets: [
                  ["No AI Training on Your Data", "Your proprietary financial information is never used to train our AI models. Fynny learns from general benchmarks, not your books."],
                  ["No Third-Party Sharing", "We don't sell, rent, lease, or share your financial data with advertisers, brokers, or anyone outside your organization. Period."],
                  ["Complete Data Portability", "Export everything anytime in CSV, Excel, or JSON. No vendor lock-in, no export fees, no delays."],
                  ["Client-Controlled Lifecycle", "We store only contact details and onboarding metadata. Your actual financial data stays in Razorpay, Zoho, your bank — you control retention."],
                ],
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="rounded-[32px] p-12 transition-all duration-500 hover:-translate-y-2"
                style={{
                  background: `linear-gradient(145deg, rgba(26,16,8,0.97) 0%, rgba(26,16,8,0.9) 100%)`,
                  border: "1px solid rgba(139,105,20,0.2)",
                  boxShadow: "0 20px 60px rgba(26,16,8,0.15)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 30px 80px rgba(26,16,8,0.25)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 20px 60px rgba(26,16,8,0.15)"; }}
              >
                <div
                  className="flex items-center justify-center mb-6"
                  style={{
                    width: 64, height: 64, borderRadius: 16,
                    background: `linear-gradient(135deg, ${GOLD} 0%, rgba(139,105,20,0.7) 100%)`,
                    boxShadow: "0 8px 24px rgba(139,105,20,0.3)",
                  }}
                >
                  {card.icon}
                </div>

                <h3 style={{ fontFamily: "'Raleway'", fontWeight: 600, fontSize: 26, color: "#FFFFFF", lineHeight: 1.3, marginBottom: 20 }}>
                  {card.title}
                </h3>

                <p style={{ fontFamily: "'Roboto'", fontWeight: 500, fontSize: 12, letterSpacing: "1px", color: GOLD, textTransform: "uppercase", paddingBottom: 12, marginBottom: 20, borderBottom: "1px solid rgba(139,105,20,0.3)" }}>
                  What this means for you
                </p>

                <div className="flex flex-col gap-5">
                  {card.bullets.map(([title, desc], idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 24, height: 24, background: GOLD, marginTop: 2 }}>
                        <CheckCircle2 size={14} color="#FFFFFF" strokeWidth={3} />
                      </div>
                      <div>
                        <div style={{ fontFamily: "'Roboto'", fontWeight: 500, fontSize: 16, color: BEIGE, marginBottom: 4 }}>{title}</div>
                        <div style={{ fontFamily: "'Roboto'", fontWeight: 400, fontSize: 14, color: "rgba(244,237,218,0.85)", lineHeight: 1.6 }}>{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Section 3: 3-Step Process ───── */}
      <section style={{ background: "#FFFFFF", padding: "100px 24px" }}>
        <div className="max-w-[1200px] mx-auto">
          <motion.h2 {...fadeUp} className="text-center" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: "clamp(32px, 4.2vw, 48px)", color: INK, marginBottom: 20 }}>
            How FYNHelp Connects to Your Financial Systems
          </motion.h2>
          <motion.p {...fadeUp} className="text-center mx-auto" style={{ fontFamily: "'Raleway'", fontWeight: 400, fontSize: 18, color: "rgba(26,16,8,0.7)", maxWidth: 900, marginBottom: 16, lineHeight: 1.6 }}>
            When you integrate FYNHelp with Razorpay, Zoho Books, or your bank via Account Aggregator, security is engineered into every step.
          </motion.p>
          <motion.div {...fadeUp} className="text-center mb-16">
            <span
              className="inline-block"
              style={{
                fontFamily: "'Roboto'", fontWeight: 500, fontSize: 14, color: GOLD,
                background: "rgba(139,105,20,0.1)", border: "1px solid rgba(139,105,20,0.3)",
                padding: "10px 24px", borderRadius: 20, marginTop: 16,
              }}
            >
              ⚙️ Integration in Progress — Available Q2 2026
            </span>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-10 mt-8">
            {[
              {
                icon: <KeyRound size={48} color={GOLD} strokeWidth={1.5} />,
                title: "Secure Authentication (OAuth 2.0)",
                bullets: [
                  "One-click secure login via OAuth 2.0 — the same protocol used by Google, Microsoft, and your bank.",
                  "We never ask for or store your Razorpay, Zoho, or banking credentials.",
                  "Time-limited access tokens that expire automatically and require periodic re-auth.",
                  "Entire flow over TLS 1.3 — eavesdropping or MITM attacks are cryptographically impossible.",
                ],
              },
              {
                icon: <Eye size={48} color={GOLD} strokeWidth={1.5} />,
                title: "Read-Only Access",
                bullets: [
                  "We only observe, never modify. We cannot transfer funds, delete invoices, or alter source data.",
                  "All financial actions stay in your original systems. FYNHelp observes and analyzes; you execute.",
                  "Disconnect anytime from Razorpay, Zoho, or bank settings. Access ends instantly.",
                  "Scoped permissions — only the minimum data needed. No personal messages, employee data, or unrelated systems.",
                ],
              },
              {
                icon: <RefreshCw size={48} color={GOLD} strokeWidth={1.5} />,
                title: "Encrypted Sync & Continuous Monitoring",
                bullets: [
                  "Real-time data sync over TLS 1.3 with perfect forward secrecy.",
                  "Tokens expire every 24-72 hours and refresh with your consent. No stale access.",
                  "Anomaly detection — unusual access patterns trigger instant email + SMS alerts.",
                  "Automatic disconnection on suspicious activity, with notification within minutes.",
                ],
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative rounded-3xl p-10 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: BEIGE,
                  border: "2px solid rgba(26,16,8,0.08)",
                  paddingTop: 48,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = GOLD;
                  e.currentTarget.style.boxShadow = "0 12px 40px rgba(139,105,20,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(26,16,8,0.08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    top: -24, left: 32, width: 48, height: 48,
                    background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`,
                    color: "#FFFFFF",
                    fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 22,
                    border: `4px solid ${BEIGE}`,
                    boxShadow: "0 4px 16px rgba(196,30,30,0.3)",
                  }}
                >
                  {i + 1}
                </div>

                <div className="mb-5">{step.icon}</div>

                <h3 style={{ fontFamily: "'Raleway'", fontWeight: 600, fontSize: 22, color: INK, lineHeight: 1.3, marginBottom: 20 }}>
                  {step.title}
                </h3>

                <div className="flex flex-col gap-3">
                  {step.bullets.map((b, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span style={{ color: RED, fontSize: 20, lineHeight: 1, flexShrink: 0 }}>•</span>
                      <span style={{ fontFamily: "'Roboto'", fontWeight: 400, fontSize: 15, color: "rgba(26,16,8,0.85)", lineHeight: 1.6 }}>{b}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Section 4: Trust ───── */}
      <section style={{ background: `linear-gradient(135deg, ${BEIGE} 0%, rgba(244,237,218,0.5) 100%)`, padding: "100px 24px" }}>
        <div className="max-w-[1200px] mx-auto">
          <motion.h2 {...fadeUp} className="text-center" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: "clamp(32px, 4.2vw, 48px)", color: INK, marginBottom: 60, lineHeight: 1.2 }}>
            Built by Founders Who Understand What's at Stake
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative rounded-3xl overflow-hidden flex items-center justify-center"
              style={{
                aspectRatio: "5 / 6",
                background: `linear-gradient(145deg, ${INK} 0%, rgba(26,16,8,0.85) 50%, rgba(139,105,20,0.4) 100%)`,
                boxShadow: "0 20px 60px rgba(26,16,8,0.2)",
              }}
            >
              {/* Geometric brand illustration */}
              <div className="absolute inset-0">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 80 + i * 40,
                      height: 80 + i * 40,
                      border: `1px solid rgba(139,105,20,${0.3 - i * 0.04})`,
                      top: "50%", left: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                ))}
              </div>
              <div className="relative z-10 text-center px-8">
                <Shield size={80} color={GOLD} strokeWidth={1.2} className="mx-auto mb-6" />
                <div style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: 32, color: "#FFFFFF", letterSpacing: "1px", marginBottom: 12 }}>
                  FYNHelp
                </div>
                <div style={{ fontFamily: "'Raleway'", fontWeight: 400, fontSize: 14, color: "rgba(244,237,218,0.85)", letterSpacing: "2px", textTransform: "uppercase" }}>
                  Founder-Built · India-First
                </div>
                <div className="mt-8 inline-block px-5 py-2 rounded-full" style={{ background: "rgba(244,237,218,0.1)", border: `1px solid ${GOLD}` }}>
                  <span style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 13, color: BEIGE }}>Tarun &amp; Fynny · Co-Founders</span>
                </div>
              </div>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p style={{ fontFamily: "'Raleway'", fontWeight: 600, fontSize: 18, color: GOLD, marginBottom: 28 }}>
                Why founders and finance professionals trust FYNHelp:
              </p>

              <div className="flex flex-col gap-6">
                {[
                  ["Designed by founders who've managed real businesses.", "FYNHelp was born from running a D2C chocolate brand (Dark Capital) that nearly failed due to poor financial visibility. We built the tool we desperately needed."],
                  ["Engineered with production-grade security from day one.", "Enterprise infrastructure (the same backbone trusted by Mozilla and 1Password), PostgreSQL Row Level Security, and defense-in-depth strategies."],
                  ["Tested with realistic data in secure sandbox environments.", "Beta testing uses realistic transaction volumes, invoice patterns, and GST scenarios — not toy data. Every decision validated against real SME use cases."],
                  ["Continuously improved based on feedback from security-conscious users.", "Every concern raised — MFA preferences, data export formats — is logged, prioritized, and addressed. Security is our foundation, not a feature."],
                ].map(([title, desc], i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`, marginTop: 2 }}>
                      <CheckCircle2 size={16} color="#FFFFFF" strokeWidth={3} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Roboto'", fontWeight: 500, fontSize: 16, color: INK, marginBottom: 4, lineHeight: 1.5 }}>{title}</div>
                      <div style={{ fontFamily: "'Roboto'", fontWeight: 400, fontSize: 15, color: "rgba(26,16,8,0.75)", lineHeight: 1.7 }}>{desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-10 rounded-xl"
                style={{
                  background: "rgba(139,105,20,0.1)",
                  borderLeft: `4px solid ${GOLD}`,
                  padding: "20px 24px",
                }}
              >
                <p style={{ fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 15, color: INK, lineHeight: 1.7 }}>
                  🔒 Zero security incidents during beta · 100% uptime since internal deployment · MFA enabled for all accounts
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ───── Section 5: Roadmap ───── */}
      <section style={{ background: "#FFFFFF", padding: "80px 24px" }}>
        <div className="max-w-[1200px] mx-auto">
          <motion.h2 {...fadeUp} className="text-center" style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: "clamp(28px, 3.6vw, 42px)", color: INK, marginBottom: 20 }}>
            Our Security Roadmap
          </motion.h2>
          <motion.p {...fadeUp} className="text-center mx-auto" style={{ fontFamily: "'Raleway'", fontWeight: 400, fontSize: 18, color: "rgba(26,16,8,0.7)", maxWidth: 800, marginBottom: 60, lineHeight: 1.6 }}>
            Security is an ongoing commitment, not a one-time checkbox. Here's what we're building:
          </motion.p>

          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line - desktop only */}
            <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-1 rounded-full" style={{ background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD} 50%, rgba(139,105,20,0.3) 50%, rgba(139,105,20,0.3) 100%)` }} />

            {[
              {
                status: "LIVE",
                statusColor: "#10B981",
                title: "Foundation",
                icon: <CheckCircle2 size={28} color="#FFFFFF" />,
                nodeBg: GOLD,
                nodeBorder: GOLD,
                items: ["AES-256 encryption at rest", "TLS 1.3 in transit", "Row Level Security in DB", "Mumbai data residency", "Multi-factor authentication", "bcrypt password hashing"],
              },
              {
                status: "Q2 2026",
                statusColor: GOLD,
                title: "Integration Security",
                icon: <Clock size={28} color={GOLD} />,
                nodeBg: "#FFFFFF",
                nodeBorder: GOLD,
                items: ["OAuth 2.0 for Razorpay", "OAuth 2.0 for Zoho Books", "Read-only API permissions", "Token expiration & refresh", "RBI Account Aggregator framework"],
              },
              {
                status: "Q3-Q4 2026",
                statusColor: "rgba(26,16,8,0.5)",
                title: "Compliance Certifications",
                icon: <FileCheck size={28} color="rgba(26,16,8,0.5)" />,
                nodeBg: "#FFFFFF",
                nodeBorder: "rgba(139,105,20,0.4)",
                items: ["SOC 2 Type II audit", "ISO 27001 certification", "GDPR compliance attestation", "Quarterly penetration testing", "Bug bounty program"],
              },
              {
                status: "2027",
                statusColor: "rgba(26,16,8,0.5)",
                title: "Advanced Security",
                icon: <Rocket size={28} color="rgba(26,16,8,0.5)" />,
                nodeBg: "#FFFFFF",
                nodeBorder: "rgba(139,105,20,0.4)",
                items: ["End-to-end encryption (sensitive)", "HSM integration", "Blockchain audit trail", "AI anomaly detection", "Compliance automation"],
              },
            ].map((stage, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center"
              >
                <div
                  className="relative z-10 flex items-center justify-center rounded-full mb-5"
                  style={{
                    width: 60, height: 60,
                    background: stage.nodeBg,
                    border: `3px solid ${stage.nodeBorder}`,
                    boxShadow: i === 0 ? "0 4px 20px rgba(139,105,20,0.4)" : "none",
                  }}
                >
                  {stage.icon}
                </div>

                <span
                  className="inline-block mb-3"
                  style={{
                    fontFamily: "'Work Sans'", fontWeight: 600, fontSize: 11, letterSpacing: "1px",
                    color: stage.statusColor,
                    background: i === 0 ? "rgba(16,185,129,0.12)" : i === 1 ? "rgba(139,105,20,0.12)" : "rgba(26,16,8,0.06)",
                    padding: "5px 12px", borderRadius: 12, textTransform: "uppercase",
                  }}
                >
                  {stage.status}
                </span>

                <h3 style={{ fontFamily: "'Raleway'", fontWeight: 600, fontSize: 18, color: INK, marginBottom: 16 }}>
                  {stage.title}
                </h3>

                <ul className="text-left w-full">
                  {stage.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 mb-2">
                      <Calendar size={12} color={GOLD} className="mt-1 flex-shrink-0" />
                      <span style={{ fontFamily: "'Roboto'", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.8)", lineHeight: 1.5 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Section 7: Final CTA ───── */}
      <section
        className="relative bg-sidebar"
        style={{
          background: `linear-gradient(145deg, ${INK} 0%, ${INK} 40%, rgba(196,30,30,0.15) 75%, rgba(139,105,20,0.15) 100%)`,
          padding: "100px 24px",
          borderRadius: "48px 48px 0 0",
        }}
      >
        <div className="max-w-[1000px] mx-auto text-center">
          <motion.h2 {...fadeUp} style={{ fontFamily: "'Oswald'", fontWeight: 700, fontSize: "clamp(28px, 4.4vw, 52px)", color: "#FFFFFF", lineHeight: 1.2, marginBottom: 24, textShadow: "0 4px 16px rgba(0,0,0,0.5)" }}>
            Ready to Experience Financial Intelligence You Can Trust?
          </motion.h2>
          <motion.p {...fadeUp} className="mx-auto" style={{ fontFamily: "'Raleway'", fontWeight: 400, fontSize: "clamp(16px, 1.4vw, 20px)", color: "rgba(244,237,218,1)", lineHeight: 1.6, maxWidth: 800, marginBottom: 48, textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
            See how FYNHelp keeps your data secure while giving you the insights you need. Start your 6-month free trial — no credit card, no risk, no obligations.
          </motion.p>

          <motion.div {...fadeUp} className="flex flex-wrap items-center justify-center gap-5">
            <Link
              to="/waitlist"
              className="transition-all hover:-translate-y-0.5"
              style={{
                fontFamily: "'DM Sans'", fontWeight: 700, fontSize: 17, textTransform: "uppercase", letterSpacing: "0.5px",
                padding: "20px 52px", borderRadius: 16,
                color: "#FFFFFF",
                background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`,
                boxShadow: "0 12px 32px rgba(196,30,30,0.5)",
                display: "inline-block",
              }}
            >
              Start Your Free Trial
            </Link>

            <a
              href="mailto:support@fynhelp.com"
              className="transition-all hover:-translate-y-0.5"
              style={{
                fontFamily: "'DM Sans'", fontWeight: 600, fontSize: 17,
                padding: "20px 44px", borderRadius: 16,
                background: "transparent",
                border: "2px solid rgba(244,237,218,0.8)",
                color: BEIGE,
                display: "inline-block",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = BEIGE; e.currentTarget.style.color = INK; e.currentTarget.style.borderColor = BEIGE; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = BEIGE; e.currentTarget.style.borderColor = "rgba(244,237,218,0.8)"; }}
            >
              Talk to Our Security Team
            </a>
          </motion.div>

          <div className="mt-12 flex items-center justify-center gap-2 flex-wrap" style={{ color: "rgba(244,237,218,0.8)" }}>
            <Users size={16} />
            <span style={{ fontFamily: "'Roboto'", fontSize: 16 }}>
              Questions? Email <a href="mailto:support@fynhelp.com" style={{ color: GOLD, fontWeight: 600 }}>support@fynhelp.com</a>
            </span>
          </div>
        </div>
      </section>

      <WhitepaperModal open={whitepaperOpen} onClose={() => setWhitepaperOpen(false)} />

      <style>{`
        @keyframes fynFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-120vh) translateX(20px); opacity: 0; }
        }
        @keyframes fynShieldPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 40px rgba(139,105,20,0.6), 0 0 80px rgba(196,30,30,0.3); }
          50% { transform: scale(1.08); box-shadow: 0 0 60px rgba(139,105,20,0.8), 0 0 120px rgba(196,30,30,0.45); }
        }
      `}</style>
    </Layout>
  );
};

export default SecurityPage;
