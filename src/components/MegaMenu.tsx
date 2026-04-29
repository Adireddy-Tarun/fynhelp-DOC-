import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { MessageSquare, Calculator, Users, Landmark } from "lucide-react";

const intelligenceModules = [
  { name: "Liquidity Intelligence", desc: "Know your runway before you run out", slug: "liquidity" },
  { name: "Revenue Intelligence", desc: "Track MRR, ARR, and customer cohorts", slug: "revenue" },
  { name: "Cost Intelligence", desc: "Optimize vendor spend and expenses", slug: "cost" },
  { name: "GST & Tax Intelligence", desc: "Never miss deadlines, avoid penalties", slug: "gst-tax" },
  { name: "Governance Intelligence", desc: "Board ready reports and audit trails", slug: "governance" },
  { name: "HR & Workforce Intelligence", desc: "Payroll analytics and headcount ROI", slug: "hr-workforce" },
];

const businessTypes = [
  { name: "D2C & E-commerce", slug: "d2c-ecommerce" },
  { name: "SaaS & Technology", slug: "saas-technology" },
  { name: "Manufacturing", slug: "manufacturing" },
  { name: "Professional Services", slug: "professional-services" },
  { name: "Healthcare & Education", slug: "healthcare-education" },
];

const platformFeatures = [
  { name: "AI CFO Nidhi", desc: "Conversational financial intelligence", href: "/products", Icon: MessageSquare },
  { name: "Decision Simulator", desc: "Model any business scenario", href: "/products/simulator", Icon: Calculator },
  { name: "CA Partner Program", desc: "White label for accountants", href: "/products/ca-partner", Icon: Users },
  { name: "Working Capital Marketplace", desc: "Access financing options", href: "/products", Icon: Landmark },
];

interface MegaMenuProps {
  open: boolean;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function MegaMenu({ open, onClose, onMouseEnter, onMouseLeave }: MegaMenuProps) {
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
      className="hidden lg:flex absolute left-0 w-full justify-center"
      style={{
        top: 72,
        zIndex: 1000,
        pointerEvents: open ? "auto" : "none",
      }}
      aria-hidden={!open}
      role="menu"
      aria-label="Products menu"
    >
      <div
        style={{
          background: "#F9F7F4",
          border: "1px solid #E5E5E5",
          borderTop: "none",
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 16px 40px rgba(26,16,8,0.12)",
          padding: 32,
          width: "min(1000px, calc(100vw - 48px))",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0)" : "translateY(-8px)",
          transition: open
            ? "opacity 300ms ease-out, transform 300ms ease-out"
            : "opacity 200ms ease-in, transform 200ms ease-in",
        }}
      >
        {/* 3 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "35fr 30fr 35fr",
            gap: 40,
            alignItems: "start",
          }}
        >
          {/* Column 1 — Intelligence Modules */}
          <div>
            <ColHeader>Intelligence Suites</ColHeader>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {intelligenceModules.map((m) => (
                <li key={m.slug}>
                  <Link
                    to={`/solutions#${m.slug}`}
                    onClick={onClose}
                    role="menuitem"
                    className="mega-row"
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      borderRadius: 6,
                      textDecoration: "none",
                      transition: "background 200ms ease, padding-left 200ms ease",
                      minHeight: 44,
                    }}
                  >
                    <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 16, lineHeight: 1.5, color: "#1A1A1A", margin: 0 }}>
                      {m.name}
                    </p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, lineHeight: 1.5, color: "#666666", margin: 0, marginTop: 2 }}>
                      {m.desc}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — By Business Type */}
          <div>
            <ColHeader>By Business Type</ColHeader>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
              {businessTypes.map((b) => (
                <li key={b.slug}>
                  <Link
                    to={`/solutions?type=${b.slug}`}
                    onClick={onClose}
                    role="menuitem"
                    className="mega-biz"
                    style={{
                      display: "block",
                      padding: "12px",
                      borderRadius: 6,
                      textDecoration: "none",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 500,
                      fontSize: 16,
                      lineHeight: 1.5,
                      color: "#1A1A1A",
                      transition: "color 200ms ease",
                      minHeight: 44,
                    }}
                  >
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Platform Features */}
          <div>
            <ColHeader>Platform Features</ColHeader>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {platformFeatures.map((f) => {
                const Icon = f.Icon;
                return (
                  <li key={f.name}>
                    <Link
                      to={f.href}
                      onClick={onClose}
                      role="menuitem"
                      className="mega-card"
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "flex-start",
                        background: "#FFFFFF",
                        border: "1px solid #F0F0F0",
                        borderRadius: 6,
                        padding: 12,
                        textDecoration: "none",
                        transition: "border-color 200ms ease, box-shadow 200ms ease",
                        minHeight: 44,
                      }}
                    >
                      <Icon size={16} color="#C41E1E" style={{ marginTop: 3, flexShrink: 0 }} aria-hidden />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, lineHeight: 1.5, color: "#1A1A1A", margin: 0 }}>
                          {f.name}
                        </p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, lineHeight: 1.5, color: "#666666", margin: 0, marginTop: 2 }}>
                          {f.desc}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            marginTop: 32,
            paddingTop: 20,
            borderTop: "1px solid #E5E5E5",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <Link
            to="/solutions"
            onClick={onClose}
            className="mega-foot-link"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14, color: "#C41E1E", textDecoration: "none" }}
          >
            View All 10 Intelligence Suites →
          </Link>
          <Link
            to="/pricing"
            onClick={onClose}
            className="mega-foot-link"
            style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14, color: "#C41E1E", textDecoration: "none" }}
          >
            See Pricing →
          </Link>
        </div>
      </div>

      {/* Scoped hover/focus styles */}
      <style>{`
        .mega-row:hover, .mega-row:focus-visible {
          background: #FFFFFF;
          padding-left: 16px !important;
        }
        .mega-row:focus-visible,
        .mega-biz:focus-visible,
        .mega-card:focus-visible,
        .mega-foot-link:focus-visible {
          outline: 2px solid #C41E1E;
          outline-offset: 2px;
        }
        .mega-biz:hover {
          color: #C41E1E !important;
        }
        .mega-card:hover {
          border-color: #C41E1E !important;
          box-shadow: 0 4px 14px rgba(196,30,30,0.10);
        }
        .mega-foot-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 600,
        fontSize: 14,
        letterSpacing: "1px",
        textTransform: "uppercase",
        color: "#666666",
        margin: "0 0 16px 0",
      }}
    >
      {children}
    </p>
  );
}
