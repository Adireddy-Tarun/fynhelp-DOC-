import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, MessageSquare, Droplets, TrendingUp, DollarSign,
  FileText, Shield, Users, Brain, BarChart3, BarChart, Landmark, Building2,
  ArrowLeftRight, FileBarChart, Plug, Building, Settings,
  X, ChevronLeft, ChevronRight, Lock,
} from "lucide-react";
import { motion } from "framer-motion";
import FynLogo from "@/components/FynLogo";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  collapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
}

export const SIDEBAR_WIDTH_EXPANDED = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 72;

type Item = { icon: any; label: string; path: string; soon?: boolean };
type Section = { title: string; items: Item[] };

const menuSections: Section[] = [
  {
    title: "OVERVIEW",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/cockpit" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { icon: Droplets, label: "Liquidity", path: "/dashboard/liquidity" },
      { icon: TrendingUp, label: "Revenue", path: "/dashboard/revenue-intelligence" },
      { icon: DollarSign, label: "Cost", path: "/dashboard/cost" },
      { icon: FileText, label: "GST & Tax", path: "/dashboard/gst" },
      { icon: Shield, label: "Governance", path: "/dashboard/compliance" },
      { icon: Users, label: "HR & Workforce", path: "/dashboard/hr" },
      { icon: BarChart3, label: "Investor", path: "/dashboard/investor" },
      { icon: MessageSquare, label: "Ask Fynny", path: "/dashboard/nidhi" },
      { icon: Brain, label: "Decision Simulator", path: "/dashboard/simulator", soon: true },
      { icon: BarChart, label: "Market & Growth", path: "/dashboard/market-growth", soon: true },
      { icon: Landmark, label: "Banking", path: "/dashboard/banking", soon: true },
      { icon: Building2, label: "CA Partner", path: "/dashboard/ca-partner", soon: true },
    ],
  },
  {
    title: "DATA",
    items: [
      { icon: ArrowLeftRight, label: "Transactions", path: "/dashboard/data-import" },
      { icon: FileBarChart, label: "Reports", path: "/dashboard/reports" },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { icon: Plug, label: "Integrations", path: "/dashboard/settings/integrations" },
      { icon: Building, label: "Business", path: "/dashboard/settings/business" },
      { icon: Settings, label: "Account", path: "/dashboard/settings/profile" },
    ],
  },
];

const INACTIVE = "#6B6B6B";
const ACTIVE = "#A93838";
const INK = "#1A1008";

export default function Sidebar({ isOpen, onToggle, collapsed, onCollapsedChange }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  const width = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;
  const visible = isDesktop || isOpen;

  return (
    <>
      {isOpen && !isDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width, x: visible ? 0 : -width }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 h-full z-50 flex flex-col bg-white"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          minWidth: width,
          maxWidth: width,
          borderRight: "1px solid rgba(26,16,8,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center justify-between"
          style={{
            padding: collapsed ? "20px 12px" : "24px",
            minHeight: 72,
          }}
        >
          <button
            onClick={() => navigate("/dashboard/cockpit")}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            aria-label="Go to dashboard"
          >
            <FynLogo variant="dark" showTagline={false} iconOnly={collapsed} />
          </button>

          {!collapsed && (
            <button
              onClick={() => onCollapsedChange(true)}
              className="hidden lg:flex items-center justify-center rounded-md transition-colors"
              style={{
                width: 28, height: 28, background: "transparent", border: "none", cursor: "pointer",
                color: INACTIVE,
              }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={18} strokeWidth={1.75} />
            </button>
          )}

          <button
            onClick={onToggle}
            className="lg:hidden"
            style={{ background: "transparent", border: "none", cursor: "pointer", color: INACTIVE }}
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>

        {collapsed && (
          <button
            onClick={() => onCollapsedChange(false)}
            className="hidden lg:flex items-center justify-center mx-auto rounded-md transition-colors"
            style={{
              width: 28, height: 28, background: "transparent", border: "none", cursor: "pointer",
              color: INACTIVE, marginBottom: 8,
            }}
            aria-label="Expand sidebar"
          >
            <ChevronRight size={18} strokeWidth={1.75} />
          </button>
        )}

        <nav
          className="flex-1"
          style={{ padding: collapsed ? "8px 10px" : "8px 12px" }}
        >
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx} style={{ marginTop: sectionIdx === 0 ? 0 : 24 }}>
              {!collapsed && (
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.08em",
                    color: ACTIVE,
                    marginBottom: 8,
                    padding: "0 12px",
                    textTransform: "uppercase",
                  }}
                >
                  {section.title}
                </p>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        if (!isDesktop) onToggle();
                      }}
                      className="relative group"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: active ? "rgba(169,56,56,0.08)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: 10,
                        padding: collapsed ? "10px" : "8px 12px",
                        position: "relative",
                        width: "100%",
                        height: 44,
                        justifyContent: collapsed ? "center" : "flex-start",
                        color: active ? ACTIVE : INACTIVE,
                        fontFamily: "inherit",
                        fontSize: 14,
                        fontWeight: active ? 600 : 500,
                        transition: "background 0.2s ease, color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "rgba(169,56,56,0.04)";
                          e.currentTarget.style.color = INK;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = INACTIVE;
                        }
                      }}
                      aria-current={active ? "page" : undefined}
                    >
                      {active && (
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 6,
                            bottom: 6,
                            width: 3,
                            background: ACTIVE,
                            borderRadius: "0 2px 2px 0",
                          }}
                        />
                      )}

                      <Icon size={20} strokeWidth={1.75} style={{ flexShrink: 0, color: "currentColor" }} />

                      {!collapsed && (
                        <>
                          <span
                            style={{
                              flex: 1,
                              textAlign: "left",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: "currentColor",
                            }}
                          >
                            {item.label}
                          </span>
                          {item.soon && (
                            <span
                              style={{
                                fontSize: 10,
                                fontStyle: "italic",
                                color: "#9B9B9B",
                                fontWeight: 400,
                                flexShrink: 0,
                              }}
                            >
                              Soon
                            </span>
                          )}
                        </>
                      )}

                      {collapsed && item.soon && (
                        <Lock
                          size={10}
                          strokeWidth={2}
                          style={{ position: "absolute", top: 8, right: 8, opacity: 0.3, color: INACTIVE }}
                        />
                      )}

                      {collapsed && (
                        <div
                          className="absolute left-full ml-2 px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                          style={{
                            background: INK,
                            color: "#FFFFFF",
                            fontSize: 12,
                            fontWeight: 500,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          }}
                        >
                          {item.label}
                          {item.soon && <span style={{ marginLeft: 6, opacity: 0.6, fontStyle: "italic" }}>Soon</span>}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div
          style={{
            padding: collapsed ? "16px 8px" : "16px 24px",
            borderTop: "1px solid rgba(26,16,8,0.06)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              color: "#9B9B9B",
              textAlign: collapsed ? "center" : "left",
              fontWeight: 400,
            }}
          >
            {collapsed ? "©" : "FYNHelp © 2026"}
          </p>
        </div>
      </motion.aside>
    </>
  );
}
