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

export default function SecuritySection() {
  const loop = [...CARDS, ...CARDS];

  return (
    <section
      id="security"
      className="bg-fyn-beige"
      style={{ padding: "120px 80px" }}
    >
      <style>{`
        @keyframes fynScrollCards {
          0% { transform: translate3d(0,0,0); }
          100% { transform: translate3d(-50%,0,0); }
        }
        .fyn-sec-track {
          display: inline-flex;
          will-change: transform;
          animation: fynScrollCards 50s linear infinite;
        }
        .fyn-sec-mask {
          mask-image: linear-gradient(to right, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 40px, #000 calc(100% - 40px), transparent 100%);
        }
        .fyn-sec-carousel:hover .fyn-sec-track { animation-play-state: paused; }
        @media (max-width: 1199px) {
          .fyn-sec-track { animation-duration: 40s; }
        }
        @media (max-width: 767px) {
          .fyn-sec-track { animation-duration: 30s; }
        }
      `}</style>

      <div className="mx-auto" style={{ maxWidth: 1400 }}>
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full"
            style={{
              background: "hsl(var(--primary) / 0.10)",
              color: "hsl(var(--primary))",
              padding: "8px 16px",
              fontSize: 11,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
            }}
          >
            <Shield size={16} strokeWidth={1.75} />
            Trusted by 1000+ Beta Users
          </span>

          <h2
            className="text-fyn-ink mt-6 text-[32px] md:text-[48px] leading-[1.15]"
            style={{ fontFamily: "Georgia, serif", fontWeight: 700, maxWidth: 800, marginBottom: 16 }}
          >
            Enterprise-Grade Security. Zero Compromise.
          </h2>

          <p
            className="text-fyn-ink/60 text-base md:text-xl"
            style={{ fontFamily: "Inter, sans-serif", maxWidth: 700, marginBottom: 64 }}
          >
            Your financial data deserves military-grade protection. Here's how we keep it safe.
          </p>
        </div>

        {/* Carousel */}
        <div
          className="fyn-sec-carousel fyn-sec-mask relative overflow-hidden"
          style={{ height: 340, width: "100%" }}
        >
          <div className="fyn-sec-track">
            {loop.map((c, i) => {
              const Icon = c.icon;
              return (
                <div
                  key={i}
                  className="group shrink-0 transition-all duration-300 hover:-translate-y-2"
                  style={{
                    width: 340,
                    height: 300,
                    marginRight: 20,
                    padding: 32,
                    background: "hsl(var(--card))",
                    border: "1.5px solid hsl(var(--primary))",
                    borderRadius: 16,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 12px 32px rgba(196,30,30,0.12)";
                    e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.85)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.borderColor = "hsl(var(--primary))";
                  }}
                >
                  <Icon
                    size={40}
                    strokeWidth={1.5}
                    style={{ color: "hsl(var(--primary))", marginBottom: 20 }}
                  />
                  <h3
                    className="text-fyn-ink"
                    style={{ fontFamily: "Georgia, serif", fontWeight: 600, fontSize: 22, marginBottom: 12 }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="text-fyn-ink/60"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: 15, lineHeight: 1.6 }}
                  >
                    {c.desc}
                  </p>
                </div>
              );
            })}
          </div>
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
            className="inline-flex items-center gap-2 rounded-lg transition-colors hover:opacity-90"
            style={{
              background: "hsl(var(--primary))",
              color: "white",
              padding: "12px 28px",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
              fontSize: 15,
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
