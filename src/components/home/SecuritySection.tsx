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
import { useEffect, useState } from "react";

type Card = {
  icon: LucideIcon;
  title: string;
  desc: string;
  pos: { left?: string; right?: string; top: string };
  z: number;
  rotY: number;
};

const CARDS: Card[] = [
  // Row 1 — back layer
  { icon: Shield,         title: "Bank-Level Encryption",       desc: "AES-256 encryption for data at rest. TLS 1.3 for data in transit. Same security used by major banks.", pos: { left: "5%",  top: "10%" }, z: -100, rotY:  2 },
  { icon: Lock,           title: "Row-Level Security",          desc: "PostgreSQL RLS policies isolate your data. Zero cross-contamination. Database-level protection.", pos: { left: "30%", top: "5%"  }, z: -100, rotY: -1 },
  { icon: Key,            title: "Zero-Knowledge Architecture", desc: "Financial data encrypted before reaching servers. We cannot decrypt your raw data.", pos: { left: "55%", top: "15%" }, z: -100, rotY:  1 },
  { icon: Database,       title: "Indian Data Residency",       desc: "Mumbai AWS data centers. RBI compliant. No data leaves Indian jurisdiction.", pos: { right: "5%", top: "8%"  }, z: -100, rotY: -2 },
  // Row 2 — middle layer
  { icon: Activity,       title: "99.9% Accuracy Guarantee",    desc: "Real-time calculations validated against CA standards. Deterministic algorithms. Auditable.", pos: { left: "10%", top: "35%" }, z: -50,  rotY: -1 },
  { icon: Eye,            title: "Complete Transparency",       desc: "Every calculation shows formula. Every insight shows source. No black box AI.", pos: { left: "35%", top: "30%" }, z: -50,  rotY:  2 },
  { icon: UserX,          title: "Your Data Stays Yours",       desc: "Never used to train Fynny or AI models. Your intelligence remains confidential forever.", pos: { left: "60%", top: "40%" }, z: -50,  rotY: -1 },
  { icon: FileCheck,      title: "SOC 2 Compliance Ready",      desc: "Annual security audits. Quarterly vulnerability assessments. Bi-annual penetration testing.", pos: { right: "10%", top: "35%" }, z: -50, rotY:  1 },
  // Row 3 — front layer
  { icon: Clock,          title: "Complete Audit Trail",        desc: "Every import, change, access logged with timestamp and user ID. Full forensic trail.", pos: { left: "15%", top: "60%" }, z: 0,   rotY:  1 },
  { icon: AlertTriangle,  title: "Real-Time Threat Detection",  desc: "Automatic rate limiting. Suspicious activity alerts. IP-based access controls.", pos: { left: "40%", top: "55%" }, z: 0,   rotY: -2 },
  { icon: Users,          title: "Role-Based Access Control",   desc: "Granular permissions for team. Your CA sees tax data only. Complete access audit.", pos: { left: "65%", top: "65%" }, z: 0,   rotY:  1 },
  { icon: Download,       title: "One-Click Data Export",       desc: "Download all data anytime. No vendor lock-in. Your data is portable and deletable.", pos: { right: "15%", top: "60%" }, z: 0,  rotY: -1 },
];

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
  const { isMobile, isTablet } = useViewport();

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
        .fyn-3d-card {
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--background)) 100%);
          border: 2px solid transparent;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          transform-style: preserve-3d;
          transition: box-shadow 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          position: relative;
          overflow: hidden;
        }
        .fyn-3d-card::before {
          content: "";
          position: absolute;
          inset: -2px;
          z-index: 0;
          border-radius: 22px;
          padding: 2px;
          background: conic-gradient(from 0deg, #C41E1E, #8B6914, #1A1008, #C41E1E);
          background-size: 200% 200%;
          animation: fynBorderRotate 6s linear infinite;
          -webkit-mask:
            linear-gradient(#000 0 0) content-box,
            linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          opacity: 0.55;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }
        .fyn-3d-card::after {
          content: "";
          position: absolute;
          top: -40px;
          right: -40px;
          width: 150px;
          height: 150px;
          border-radius: 50%;
          background: radial-gradient(circle, hsl(var(--primary) / 0.20) 0%, transparent 70%);
          filter: blur(50px);
          opacity: 0.5;
          pointer-events: none;
          z-index: 0;
        }
        .fyn-3d-card:hover { box-shadow: 0 30px 80px rgba(196, 30, 30, 0.3); }
        .fyn-3d-card:hover::before { opacity: 1; }
        .fyn-3d-card > * { position: relative; z-index: 1; }

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

        {/* 3D floating cards */}
        {isMobile ? (
          <div className="grid grid-cols-1 gap-5">
            {CARDS.map((c, i) => (
              <FloatingCard key={c.title} card={c} index={i} mode="stack" />
            ))}
          </div>
        ) : (
          <div
            className="relative mx-auto"
            style={{
              maxWidth: 1200,
              height: 600,
              perspective: "1000px",
              transformStyle: "preserve-3d",
            }}
          >
            {CARDS.map((c, i) => (
              <FloatingCard key={c.title} card={c} index={i} mode={isTablet ? "tablet" : "desktop"} />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="flex flex-col items-center text-center" style={{ marginTop: 120 }}>
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

// Unique floating motion patterns per card (12 cards) — organic, varied
const FLOAT_PATTERNS: Array<{
  y: [number, number];
  x: [number, number];
  rz: [number, number];
  duration: number;
}> = [
  { y: [-20, 20],  x: [-8, 8],   rz: [-1.5, 1.5], duration: 7.0 },
  { y: [15, -15],  x: [10, -10], rz: [2, -2],     duration: 8.5 },
  { y: [-12, 18],  x: [-6, 9],   rz: [-1, 2],     duration: 6.5 },
  { y: [18, -10],  x: [7, -5],   rz: [1.5, -1],   duration: 9.0 },
  { y: [-18, 12],  x: [-10, 6],  rz: [-2, 1],     duration: 7.5 },
  { y: [10, -20],  x: [5, -8],   rz: [1, -2],     duration: 6.0 },
  { y: [-15, 15],  x: [-7, 10],  rz: [-1.8, 1.8], duration: 8.0 },
  { y: [20, -12],  x: [9, -6],   rz: [2, -1.2],   duration: 7.2 },
  { y: [-10, 18],  x: [-9, 7],   rz: [-1.2, 2],   duration: 8.8 },
  { y: [16, -18],  x: [6, -10],  rz: [1.8, -1.8], duration: 6.8 },
  { y: [-20, 10],  x: [-5, 9],   rz: [-2, 1.5],   duration: 9.0 },
  { y: [12, -16],  x: [8, -7],   rz: [1.2, -2],   duration: 7.8 },
];

function FloatingCard({
  card,
  index,
  mode,
}: {
  card: Card;
  index: number;
  mode: "desktop" | "tablet" | "stack";
}) {
  const Icon = card.icon;
  const p = FLOAT_PATTERNS[index % FLOAT_PATTERNS.length];
  const delay = index * 0.3;

  const floatAnim = {
    y: p.y,
    x: p.x,
    rotateZ: p.rz,
  };
  const floatTransition = {
    duration: p.duration,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
    delay,
  };

  if (mode === "stack") {
    return (
      <motion.div
        className="fyn-3d-card cursor-pointer"
        style={{ width: "100%", height: 280 }}
        animate={floatAnim}
        transition={floatTransition}
        whileHover={{ scale: 1.05, y: 0, x: 0, rotateZ: 0, transition: { duration: 0.3 } }}
      >
        <CardInner Icon={Icon} title={card.title} desc={card.desc} />
      </motion.div>
    );
  }

  const z = mode === "tablet" ? card.z / 2 : card.z;

  return (
    <motion.div
      className="fyn-3d-card cursor-pointer"
      style={{
        position: "absolute",
        width: 320,
        height: 280,
        ...card.pos,
        zIndex: 100 + Math.round(z),
        translateZ: z,
      }}
      animate={floatAnim}
      transition={floatTransition}
      whileHover={{
        scale: 1.05,
        y: 0,
        x: 0,
        rotateZ: 0,
        zIndex: 999,
        transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
      }}
    >
      <CardInner Icon={Icon} title={card.title} desc={card.desc} />
    </motion.div>
  );
}

function CardInner({
  Icon,
  title,
  desc,
}: {
  Icon: LucideIcon;
  title: string;
  desc: string;
}) {
  return (
    <>
      <div
        className="flex items-center justify-center"
        style={{
          width: 72,
          height: 72,
          borderRadius: 12,
          background: "hsl(var(--primary) / 0.10)",
          boxShadow: "0 8px 20px rgba(196,30,30,0.12)",
          marginBottom: 20,
        }}
      >
        <Icon size={44} strokeWidth={2} style={{ color: "hsl(var(--primary))" }} />
      </div>

      <h3
        className="text-fyn-ink"
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: 20,
          marginBottom: 12,
          textShadow: "0 2px 4px rgba(0,0,0,0.04)",
        }}
      >
        {title}
      </h3>

      <p
        className="text-fyn-ink/65"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: 14, lineHeight: 1.6 }}
      >
        {desc}
      </p>
    </>
  );
}
