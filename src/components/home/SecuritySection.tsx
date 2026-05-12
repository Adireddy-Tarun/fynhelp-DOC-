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
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";

type Card = { icon: LucideIcon; title: string; desc: string };

const CARDS: Card[] = [
  { icon: Shield, title: "Bank-Level Encryption", desc: "AES-256 encryption for data at rest. TLS 1.3 for data in transit. Same security standards used by HDFC, ICICI, and Axis Bank." },
  { icon: Lock, title: "Row-Level Security", desc: "PostgreSQL RLS policies isolate your business data. Zero cross-contamination between accounts. Database-level protection." },
  { icon: Key, title: "Zero-Knowledge Architecture", desc: "Your financial data encrypted before reaching servers. We cannot decrypt or access your raw transaction data." },
  { icon: Database, title: "Indian Data Residency", desc: "All data in Mumbai AWS data centers. Compliant with RBI data localization. No data leaves Indian jurisdiction." },
  { icon: Activity, title: "99.9% Accuracy Guarantee", desc: "Real-time calculations validated against CA standards. Deterministic algorithms. No AI guesswork. Auditable by your chartered accountant." },
  { icon: Eye, title: "Complete Transparency", desc: "Every calculation shows formula. Every insight shows source data. No black box AI. Verify every number yourself." },
  { icon: UserX, title: "Your Data Stays Yours", desc: "We never use your financial data to train Fynny or any AI models. Your business intelligence remains confidential forever." },
  { icon: FileCheck, title: "SOC 2 Compliance Ready", desc: "Annual third-party security audits. Quarterly vulnerability assessments. Bi-annual penetration testing by certified firms." },
  { icon: Clock, title: "Complete Audit Trail", desc: "Every data import, change, and access logged with timestamp and user ID. Full forensic trail for compliance and tax audits." },
  { icon: AlertTriangle, title: "Real-Time Threat Detection", desc: "Automatic rate limiting. Suspicious activity alerts. IP-based access controls. Enterprise security without enterprise cost." },
  { icon: Users, title: "Role-Based Access Control", desc: "Granular permissions for team members. Your CA sees tax data only. You control who sees what. Complete access audit trail." },
  { icon: Download, title: "One-Click Data Export", desc: "Download all data anytime in CSV or Excel. No vendor lock-in. Your data is portable. Delete account deletes all data permanently." },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] as const },
  },
};

export default function SecuritySection() {
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
        .fyn-sec-card {
          position: relative;
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%);
          border: 2px solid transparent;
          border-radius: 20px;
          padding: 36px;
          height: 320px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .fyn-sec-card::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: 0;
          border-radius: 22px;
          padding: 2px;
          background: conic-gradient(from 0deg, #C41E1E, #8B6914, #1A1008, #C41E1E);
          background-size: 200% 200%;
          animation: fynBorderRotate 4s linear infinite;
          filter: blur(0.5px);
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          opacity: 0.55;
          transition: opacity 0.4s ease;
        }
        .fyn-sec-card::after {
          content: "";
          position: absolute;
          top: -60px;
          right: -60px;
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--primary) / 0.20) 0%, transparent 70%);
          filter: blur(60px);
          opacity: 0.4;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 0;
        }
        .fyn-sec-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 20px 60px rgba(196, 30, 30, 0.25);
        }
        .fyn-sec-card:hover::before { opacity: 1; }
        .fyn-sec-card:hover::after  { opacity: 0.7; }
        .fyn-sec-card > * { position: relative; z-index: 1; }

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
            style={{ fontFamily: "Inter, sans-serif", fontWeight: 500, maxWidth: 800, marginBottom: 80 }}
          >
            Your financial data deserves military-grade protection. Here's how we keep it safe.
          </p>
        </div>

        {/* Card grid */}
        <motion.div
          className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {CARDS.map((c) => {
            const Icon = c.icon;
            return (
              <motion.div key={c.title} variants={cardVariants} className="fyn-sec-card">
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    background: "hsl(var(--primary) / 0.10)",
                    boxShadow: "0 8px 24px rgba(196,30,30,0.15)",
                    marginBottom: 24,
                  }}
                >
                  <Icon size={48} strokeWidth={1.8} style={{ color: "hsl(var(--primary))" }} />
                </div>

                <h3
                  className="text-fyn-ink"
                  style={{
                    fontFamily: "Georgia, serif",
                    fontWeight: 700,
                    fontSize: 24,
                    marginBottom: 12,
                    textShadow: "0 2px 4px rgba(0,0,0,0.05)",
                  }}
                >
                  {c.title}
                </h3>

                <div
                  style={{
                    width: 60,
                    height: 3,
                    background: "linear-gradient(90deg, #C41E1E 0%, transparent 100%)",
                    borderRadius: 2,
                    marginBottom: 16,
                  }}
                />

                <p
                  className="text-fyn-ink/65"
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 16, lineHeight: 1.7 }}
                >
                  {c.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <div className="flex flex-col items-center text-center" style={{ marginTop: 100 }}>
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
