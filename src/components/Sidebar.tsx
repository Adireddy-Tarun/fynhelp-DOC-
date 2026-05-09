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

export const SIDEBAR_WIDTH_EXPANDED = 300;
export const SIDEBAR_WIDTH_COLLAPSED = 100;

const menuSections = [
  {
    title: "OVERVIEW",
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard/cockpit", color: "#3B82F6" },
      { icon: MessageSquare, label: "CFO Fynny", path: "/dashboard/nidhi", color: "#8B5CF6" },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { icon: Droplet, label: "Liquidity", path: "/dashboard/liquidity", color: "#06B6D4", badge: "Active" },
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
] as const;

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
        className="fixed top-0 left-0 h-full z-50 flex flex-col bg-card border-r border-border"
        style={{
          overflowY: "auto",
          overflowX: "hidden",
          minWidth: width,
          maxWidth: width,
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
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* Header — logo + toggle always visible, stacked when collapsed */}
        <div
          className="flex flex-col items-center gap-3 px-4 py-5"
          style={{
            borderBottom: "2px solid rgba(139,105,20,0.15)",
            background:
              "linear-gradient(135deg, rgba(196,30,30,0.04) 0%, rgba(139,105,20,0.04) 100%)",
            minHeight: collapsed ? 140 : 90,
          }}
        >
          <button
            onClick={() => navigate("/dashboard/cockpit")}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            aria-label="Go to dashboard"
          >
            {collapsed ? (
              <FynLogo variant="dark" showTagline={false} iconOnly />
            ) : (
              <FynLogo variant="dark" showTagline={false} />
            )}
          </button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onCollapsedChange(!collapsed)}
            className="hidden lg:flex items-center justify-center rounded-xl"
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(139,105,20,0.3)",
              flexShrink: 0,
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
            <X size={24} className="text-foreground" strokeWidth={2.5} />
          </button>
        </div>

        <nav
          className="flex-1 py-6"
          style={{ paddingLeft: collapsed ? 10 : 20, paddingRight: collapsed ? 10 : 20 }}
        >
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx} style={{ marginBottom: 28 }}>
              {!collapsed && (
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: "1.2px",
                    color: "#8B6914",
                    marginBottom: 14,
                    paddingLeft: 8,
                    textTransform: "uppercase",
                  }}
                >
                  {section.title}
                </p>
              )}
              {collapsed && sectionIdx > 0 && <div style={{ height: 12 }} />}

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const badge = "badge" in item ? (item as { badge?: string }).badge : undefined;
                  return (
                    <motion.button
                      key={itemIdx}
                      onClick={() => {
                        navigate(item.path);
                        if (!isDesktop) onToggle();
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        background: active
                          ? "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)"
                          : "hsl(var(--card))",
                        border: "none",
                        cursor: "pointer",
                        borderRadius: collapsed ? 14 : (active ? "0 14px 14px 0" : 14),
                        padding: collapsed ? "14px" : "12px 14px",
                        position: "relative",
                        width: "100%",
                        justifyContent: collapsed ? "center" : "flex-start",
                        boxShadow: active
                          ? "0 6px 20px rgba(139,105,20,0.3), 0 3px 10px rgba(196,30,30,0.2)"
                          : "0 2px 6px rgba(0,0,0,0.06)",
                        transition: "background 0.2s ease, box-shadow 0.2s ease",
                        minHeight: 60,
                      }}
                      aria-current={active ? "page" : undefined}
                    >
                      {active && !collapsed && (
                        <div
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 6,
                            background: "#8B6914",
                          }}
                        />
                      )}

                      <div
                        style={{
                          width: 48,
                          height: 48,
                          minWidth: 48,
                          minHeight: 48,
                          maxWidth: 48,
                          maxHeight: 48,
                          borderRadius: 12,
                          background: active ? "rgba(255,255,255,0.2)" : `${item.color}15`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          border: active
                            ? "2px solid rgba(255,255,255,0.3)"
                            : `2px solid ${item.color}25`,
                          boxShadow: active
                            ? "0 3px 10px rgba(0,0,0,0.12)"
                            : `0 2px 6px ${item.color}12`,
                        }}
                      >
                        <Icon
                          size={24}
                          width={24}
                          height={24}
                          color={active ? "#FFFFFF" : item.color}
                          strokeWidth={2.5}
                          style={{ flexShrink: 0, minWidth: 24, minHeight: 24 }}
                        />
                      </div>

                      {!collapsed && (
                        <>
                          <span
                            style={{
                              fontFamily: "Inter, sans-serif",
                              fontSize: 15,
                              fontWeight: 700,
                              color: active ? "#FFFFFF" : "hsl(var(--foreground))",
                              flex: 1,
                              textAlign: "left",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item.label}
                          </span>
                          {badge && (
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 800,
                                fontFamily: "Inter, sans-serif",
                                padding: "4px 10px",
                                borderRadius: 8,
                                background: active
                                  ? "rgba(255,255,255,0.2)"
                                  : badge === "Active"
                                  ? "linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)"
                                  : "linear-gradient(135deg, #94A3B8 0%, #64748B 100%)",
                                color: "#FFFFFF",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                flexShrink: 0,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {badge}
                            </span>
                          )}
                        </>
                      )}

                      {collapsed && (
                        <div
                          className="absolute left-full ml-3 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                          style={{
                            background: "linear-gradient(135deg, #1A1008 0%, #2D1810 100%)",
                            color: "#F5EFE6",
                            fontSize: 13,
                            fontFamily: "Inter, sans-serif",
                            fontWeight: 700,
                            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                            border: "1px solid rgba(139,105,20,0.4)",
                          }}
                        >
                          {item.label}
                          {badge && (
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 800,
                                marginLeft: 8,
                                padding: "2px 6px",
                                borderRadius: 4,
                                background: badge === "Active" ? "#14B8A6" : "#64748B",
                                color: "#FFFFFF",
                              }}
                            >
                              {badge}
                            </span>
                          )}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
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
