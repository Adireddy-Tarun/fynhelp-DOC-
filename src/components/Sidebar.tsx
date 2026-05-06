import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home, MessageSquare, TrendingUp, FileText, Shield, Users,
  Brain, BarChart, CreditCard, Briefcase, Receipt, FileSpreadsheet,
  Settings, Building, X, ChevronLeft, ChevronRight,
  Droplet, DollarSign, Link2,
} from "lucide-react";
import { motion } from "framer-motion";
import FynLogo from "@/components/FynLogo";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  collapsed: boolean;
  onCollapsedChange: (next: boolean) => void;
}

interface MenuItem {
  icon: typeof Home;
  label: string;
  path: string;
  color: string;
  badge?: "Active" | "Soon";
}

const menuSections: { title: string; items: MenuItem[] }[] = [
  {
    title: "OVERVIEW",
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard/cockpit", color: "#3B82F6" },
      { icon: MessageSquare, label: "AI CFO Nidhi", path: "/dashboard/nidhi", color: "#C41E1E" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { icon: Droplet, label: "Liquidity", path: "/dashboard/runway", color: "#06B6D4", badge: "Active" },
      { icon: TrendingUp, label: "Revenue", path: "/dashboard/cash-flow", color: "#10B981", badge: "Active" },
      { icon: DollarSign, label: "Cost", path: "/dashboard/cost", color: "#F59E0B", badge: "Active" },
      { icon: FileText, label: "GST & Tax", path: "/dashboard/gst", color: "#EF4444", badge: "Active" },
      { icon: Shield, label: "Governance", path: "/dashboard/compliance", color: "#6366F1", badge: "Soon" },
      { icon: Users, label: "HR & Workforce", path: "/dashboard/hr", color: "#EC4899", badge: "Soon" },
      { icon: Brain, label: "Decision Simulator", path: "/dashboard/simulator", color: "#8B6914", badge: "Active" },
      { icon: BarChart, label: "Market & Growth", path: "/dashboard/market-growth", color: "#14B8A6", badge: "Soon" },
      { icon: CreditCard, label: "Banking", path: "/dashboard/banking", color: "#6366F1", badge: "Soon" },
      { icon: Briefcase, label: "CA Partner", path: "/dashboard/ca-partner", color: "#F97316", badge: "Soon" },
    ],
  },
  {
    title: "DATA",
    items: [
      { icon: Receipt, label: "Transactions", path: "/dashboard/data-import", color: "#64748B" },
      { icon: FileSpreadsheet, label: "Reports", path: "/dashboard/reports", color: "#64748B" },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { icon: Link2, label: "Integrations", path: "/dashboard/settings/integrations", color: "#64748B" },
      { icon: Building, label: "Business", path: "/dashboard/settings/business", color: "#64748B" },
      { icon: Settings, label: "Account", path: "/dashboard/settings/profile", color: "#64748B" },
    ],
  },
];

export const SIDEBAR_WIDTH_EXPANDED = 300;
export const SIDEBAR_WIDTH_COLLAPSED = 90;

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
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width, x: visible ? 0 : -width }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          background: "#F5EFE6",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 4,
            background: "linear-gradient(180deg, #C41E1E 0%, #8B6914 100%)",
            boxShadow: "2px 0 8px rgba(196,30,30,0.3)",
            pointerEvents: "none",
          }}
        />

        <div
          className="flex items-center justify-between px-6 py-6"
          style={{
            borderBottom: "2px solid rgba(139,105,20,0.15)",
            background:
              "linear-gradient(135deg, rgba(196,30,30,0.04) 0%, rgba(139,105,20,0.04) 100%)",
          }}
        >
          <button
            onClick={() => navigate("/dashboard/cockpit")}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            aria-label="Go to dashboard"
          >
            {collapsed ? (
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
                  color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 20,
                  boxShadow: "0 4px 14px rgba(139,105,20,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
                }}
              >
                F
              </div>
            ) : (
              <FynLogo variant="dark" showTagline={false} />
            )}
          </button>

          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onCollapsedChange(!collapsed)}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-xl"
            style={{
              background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(139,105,20,0.3)",
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={20} color="#FFF" strokeWidth={3} />
            ) : (
              <ChevronLeft size={20} color="#FFF" strokeWidth={3} />
            )}
          </motion.button>

          <button
            onClick={onToggle}
            className="lg:hidden"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            aria-label="Close menu"
          >
            <X size={24} color="#1A1008" strokeWidth={2.5} />
          </button>
        </div>

        <nav
          className="flex-1 py-4"
          style={{ paddingLeft: collapsed ? 12 : 20, paddingRight: collapsed ? 12 : 20 }}
        >
          {menuSections.map((section) => (
            <div key={section.title} className="mb-8">
              {!collapsed && (
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "1.2px",
                    color: "#8B6914",
                    marginBottom: 12,
                    paddingLeft: 4,
                    textTransform: "uppercase",
                    textShadow: "0 1px 0 rgba(255,255,255,0.5)",
                  }}
                >
                  {section.title}
                </p>
              )}

              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      if (!isDesktop) onToggle();
                    }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-4 px-4 py-4 mb-2 rounded-2xl transition-all relative group"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)"
                        : "rgba(255,255,255,0.6)",
                      border: "none",
                      cursor: "pointer",
                      borderLeft: active ? "6px solid #8B6914" : "6px solid transparent",
                      justifyContent: collapsed ? "center" : "flex-start",
                      boxShadow: active
                        ? "0 8px 24px rgba(139,105,20,0.4), 0 4px 12px rgba(196,30,30,0.3), inset 0 1px 0 rgba(255,255,255,0.2)"
                        : "0 2px 8px rgba(0,0,0,0.08)",
                      position: "relative",
                      overflow: "visible",
                    }}
                    aria-current={active ? "page" : undefined}
                  >
                    {active && (
                      <div
                        style={{
                          position: "absolute",
                          inset: -2,
                          background:
                            "linear-gradient(135deg, rgba(196,30,30,0.3) 0%, rgba(139,105,20,0.3) 100%)",
                          borderRadius: 18,
                          filter: "blur(8px)",
                          zIndex: -1,
                          opacity: 0.6,
                          pointerEvents: "none",
                        }}
                      />
                    )}

                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: active ? "rgba(255,255,255,0.25)" : item.color + "20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: active
                          ? "2px solid rgba(255,255,255,0.4)"
                          : `2px solid ${item.color}30`,
                        boxShadow: active
                          ? "0 4px 12px rgba(0,0,0,0.15)"
                          : "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    >
                      <Icon
                        size={26}
                        color={active ? "#FFFFFF" : item.color}
                        strokeWidth={2.5}
                        fill={active ? "rgba(255,255,255,0.2)" : "none"}
                      />
                    </div>

                    {!collapsed && (
                      <>
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: 15,
                            fontWeight: 700,
                            color: active ? "#FFFFFF" : "#1A1008",
                            flex: 1,
                            textAlign: "left",
                            textShadow: active ? "0 1px 2px rgba(0,0,0,0.2)" : "none",
                          }}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 800,
                              fontFamily: "Inter, sans-serif",
                              padding: "5px 12px",
                              borderRadius: 10,
                              background: active
                                ? "rgba(255,255,255,0.25)"
                                : item.badge === "Active"
                                ? "linear-gradient(135deg, #10B981 0%, #059669 100%)"
                                : "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
                              color: "#FFFFFF",
                              border: active
                                ? "1px solid rgba(255,255,255,0.3)"
                                : "1px solid rgba(255,255,255,0.25)",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              textTransform: "uppercase",
                              letterSpacing: "0.8px",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {collapsed && (
                      <div
                        className="absolute left-full ml-4 px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                        style={{
                          background: "linear-gradient(135deg, #1A1008 0%, #2D1810 100%)",
                          color: "#F5EFE6",
                          fontSize: 14,
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 700,
                          boxShadow:
                            "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,105,20,0.3)",
                          border: "1px solid rgba(139,105,20,0.5)",
                        }}
                      >
                        {item.label}
                        {item.badge && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              marginLeft: 10,
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: item.badge === "Active" ? "#10B981" : "#64748B",
                              color: "#FFFFFF",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </nav>

        {!collapsed && (
          <div
            className="px-6 py-4"
            style={{
              borderTop: "2px solid rgba(139,105,20,0.15)",
              background:
                "linear-gradient(135deg, rgba(139,105,20,0.04) 0%, rgba(196,30,30,0.04) 100%)",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 13,
                color: "#8B6914",
                textAlign: "center",
                fontWeight: 700,
                letterSpacing: "0.5px",
              }}
            >
              FYNHelp © 2026
            </p>
          </div>
        )}
      </motion.aside>
    </>
  );
}
