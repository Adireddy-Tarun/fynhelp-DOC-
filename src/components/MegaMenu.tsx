import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const suiteSlugMap: Record<string, string> = {
  "Liquidity Intelligence": "liquidity",
  "Revenue Intelligence": "revenue",
  "Cost Intelligence": "cost",
  "GST & Tax Intelligence": "gst-tax",
  "Governance Intelligence": "governance",
  "HR & Workforce": "hr-workforce",
  "Decision Simulator": "simulator",
  "Market & Growth": "market-growth",
  "Banking & Fintech": "banking-fintech",
  "CA Partner Ecosystem": "ca-partner",
};

const megaSuites = [
  { name: "Liquidity Intelligence", desc: "Cash, runway, burn rate", color: "#C41E1E" },
  { name: "Revenue Intelligence", desc: "Receivables, collections", color: "#1A4A8B" },
  { name: "Cost Intelligence", desc: "Spend control, payables", color: "#1A6B3C" },
  { name: "GST & Tax Intelligence", desc: "ITC, notice risk, filing", color: "#8B5A00" },
  { name: "Governance Intelligence", desc: "ROC, compliance, audit", color: "#8B6914" },
  { name: "HR & Workforce", desc: "Hiring, payroll, attrition", color: "#0F766E" },
  { name: "Decision Simulator", desc: "What-if scenarios", color: "#C41E1E" },
  { name: "Market & Growth", desc: "Benchmarks, credit rating", color: "#DC6B19" },
  { name: "Banking & Fintech", desc: "Multi-bank, AA, UPI", color: "#1A4A8B" },
  { name: "CA Partner Ecosystem", desc: "White-label for CAs", color: "#8B6914" },
];

const keyFeatures = [
  { name: "Nidhi AI CFO", desc: "Your AI-powered financial advisor", featured: true, href: "/products" },
  { name: "Decision Simulator", desc: "Model any business scenario", href: "/products/simulator" },
  { name: "GST Intelligence", desc: "ITC protection and compliance", href: "/products/gst-tax" },
  { name: "CA Partner Program", desc: "White-label for accountants", href: "/products/ca-partner" },
  { name: "Working Capital Marketplace", desc: "Access financing options", href: "/products" },
];

const industries = ["Textiles", "Manufacturing", "IT & Services", "Healthcare", "Exports"];
const sizes = ["Under ₹5Cr", "₹5-50Cr", "₹50-200Cr", "₹200Cr+"];

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MegaMenu({ open, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  return (
    <div
      ref={menuRef}
      className="hidden lg:block absolute left-0 w-full"
      style={{
        top: 72,
        zIndex: 1000,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div
        style={{
          background: "#1A1008",
          borderTop: "2px solid #C41E1E",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.40)",
          padding: "32px 96px 40px",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition: open
            ? "opacity 250ms ease-out, transform 250ms ease-out"
            : "opacity 200ms ease-in, transform 200ms ease-in",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "260px 280px 1fr",
            gap: 0,
            minHeight: 400,
          }}
        >
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.08)", paddingRight: 40 }}>
            <ColHeader>Intelligence Suites</ColHeader>
            <div
              style={{
                maxHeight: 340,
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(196,30,30,0.4) transparent",
              }}
            >
              {megaSuites.map((s) => (
                <Link
                  key={s.name}
                  to={`/products/${suiteSlugMap[s.name]}`}
                  onClick={onClose}
                  className="group flex items-start gap-2.5 rounded-md mb-0.5"
                  style={{
                    padding: "8px 10px",
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "background 200ms",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <div className="shrink-0 rounded-full" style={{ width: 7, height: 7, backgroundColor: s.color, marginTop: 5 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="group-hover:text-white" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.3 }}>{s.name}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, marginTop: 1 }}>{s.desc}</p>
                  </div>
                  <span className="opacity-0 group-hover:opacity-100" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#C41E1E", marginLeft: "auto", transform: "translateX(-4px)", transition: "opacity 200ms, transform 200ms", flexShrink: 0, marginTop: 2 }}>→</span>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ borderRight: "1px solid rgba(255,255,255,0.08)", paddingRight: 40, paddingLeft: 40 }}>
            <ColHeader>Key Features</ColHeader>
            <Link
              to="/products"
              onClick={onClose}
              className="block mb-2 group"
              style={{ background: "rgba(196,30,30,0.10)", border: "1px solid rgba(196,30,30,0.25)", borderRadius: 6, padding: "10px 12px", textDecoration: "none", position: "relative" }}
            >
              <span style={{ position: "absolute", top: 8, right: 8, fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 9, color: "#C41E1E", background: "rgba(196,30,30,0.1)", padding: "2px 6px", borderRadius: 3 }}>Featured</span>
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-full" style={{ width: 6, height: 6, background: "#C41E1E" }} />
                <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, color: "#FFFFFF", margin: 0 }}>Nidhi AI CFO</p>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.50)", margin: 0 }}>Your AI-powered financial advisor</p>
            </Link>
            {keyFeatures.slice(1).map((f) => (
              <Link
                key={f.name}
                to={f.href}
                onClick={onClose}
                className="group flex items-start gap-2.5 rounded-md mb-0.5"
                style={{ padding: "8px 10px", textDecoration: "none", transition: "background 200ms" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ flex: 1 }}>
                  <p className="group-hover:text-white" style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "rgba(255,255,255,0.85)", margin: 0 }}>{f.name}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0, marginTop: 1 }}>{f.desc}</p>
                </div>
                <span className="opacity-0 group-hover:opacity-100" style={{ fontSize: 12, color: "#C41E1E", marginLeft: "auto", transform: "translateX(-4px)", transition: "opacity 200ms, transform 200ms", flexShrink: 0, marginTop: 2 }}>→</span>
              </Link>
            ))}
          </div>

          <div style={{ paddingLeft: 40 }}>
            <ColHeader>By Industry</ColHeader>
            <div className="flex flex-wrap" style={{ gap: 6, marginBottom: 24 }}>
              {industries.map((i) => (
                <Chip key={i} label={i} onClick={onClose} />
              ))}
            </div>
            <ColHeader>By Business Size</ColHeader>
            <div className="flex flex-wrap" style={{ gap: 6 }}>
              {sizes.map((s) => (
                <Chip key={s} label={s} onClick={onClose} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, marginTop: 20, display: "flex", gap: 24, alignItems: "center" }}>
          <Link to="/products" onClick={onClose} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#C41E1E", textDecoration: "none", transition: "color 150ms" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#FF4444"; e.currentTarget.style.textDecoration = "underline"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#C41E1E"; e.currentTarget.style.textDecoration = "none"; }}>All 50+ modules →</Link>
          <Link to="/pricing" onClick={onClose} style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "rgba(255,255,255,0.60)", textDecoration: "none", transition: "color 150ms" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#FFFFFF"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.60)"; }}>See pricing →</Link>
        </div>
      </div>
    </div>
  );
}

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#8B6914", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid rgba(139,105,20,0.20)", margin: 0, marginBottom: 16 }}>
      {children}
    </p>
  );
}

function Chip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Link
      to={`/products?filter=${encodeURIComponent(label.toLowerCase())}`}
      onClick={onClick}
      style={{ border: "1px solid rgba(255,255,255,0.15)", borderRadius: 4, padding: "5px 12px", fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, color: "rgba(255,255,255,0.70)", background: "transparent", textDecoration: "none", transition: "all 200ms" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#C41E1E"; e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.background = "rgba(196,30,30,0.08)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.70)"; e.currentTarget.style.background = "transparent"; }}
    >
      {label}
    </Link>
  );
}
