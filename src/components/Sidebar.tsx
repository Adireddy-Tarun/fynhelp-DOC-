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
  const width = collapsed ? 80 : 280;
  const visible = isDesktop || isOpen;

  return (
    <>
      {isOpen && !isDesktop && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{ width, x: visible ? 0 : -width }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow:
            "0 8px 32px rgba(139, 105, 20, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.05)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          className="mx-4 mt-4 mb-2 flex items-center justify-between px-4 py-4 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(196,30,30,0.15) 0%, rgba(139,105,20,0.15) 100%)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.4)",
            boxShadow: "0 4px 16px rgba(139,105,20,0.15)",
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
                  width: 36, height: 36, borderRadius: 12,
                  background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
                  color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 18,
                  boxShadow: "0 4px 12px rgba(139,105,20,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
                  border: "1px solid rgba(255,255,255,0.4)",
                }}
              >
                F
              </div>
            ) : (
              <FynLogo variant="dark" showTagline={false} />
            )}
          </button>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onCollapsedChange(!collapsed)}
            className="hidden lg:flex items-center justify-center w-9 h-9 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid rgba(139,105,20,0.2)",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={18} color="#8B6914" strokeWidth={3} />
            ) : (
              <ChevronLeft size={18} color="#8B6914" strokeWidth={3} />
            )}
          </motion.button>

          <button
            onClick={onToggle}
            className="lg:hidden"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            aria-label="Close menu"
          >
            <X size={22} color="#1A1008" strokeWidth={2.5} />
          </button>
        </div>

        <nav className="flex-1 py-2" style={{ paddingLeft: 16, paddingRight: 16 }}>
          {menuSections.map((section) => (
            <div key={section.title} className="mb-6">
              {!collapsed && (
                <div className="mb-3 px-3">
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: "1px",
                      color: "#8B6914",
                      textTransform: "uppercase",
                      textShadow: "0 1px 2px rgba(255,255,255,0.8)",
                    }}
                  >
                    {section.title}
                  </p>
                </div>
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
                    whileHover={{ scale: 1.02, x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-4 py-3 mb-2 rounded-xl transition-all relative group"
                    style={{
                      background: active
                        ? "linear-gradient(135deg, rgba(196,30,30,0.25) 0%, rgba(139,105,20,0.25) 100%)"
                        : "rgba(255,255,255,0.3)",
                      border: active
                        ? "1px solid rgba(139,105,20,0.4)"
                        : "1px solid rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      justifyContent: collapsed ? "center" : "flex-start",
                      boxShadow: active
                        ? "0 4px 16px rgba(139,105,20,0.25), inset 0 1px 0 rgba(255,255,255,0.3)"
                        : "0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)",
                      backdropFilter: "blur(10px)",
                    }}
                    aria-current={active ? "page" : undefined}
                  >
                    <motion.div
                      whileHover={{ rotate: 5 }}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: active
                          ? `linear-gradient(135deg, ${item.color}40 0%, ${item.color}25 100%)`
                          : "rgba(255,255,255,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        border: `2px solid ${active ? item.color + "60" : "rgba(255,255,255,0.6)"}`,
                        boxShadow: active
                          ? `0 4px 12px ${item.color}30, inset 0 1px 0 rgba(255,255,255,0.5)`
                          : "0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)",
                      }}
                    >
                      <Icon
                        size={22}
                        color={active ? item.color : "rgba(26,16,8,0.7)"}
                        strokeWidth={active ? 3 : 2.5}
                      />
                    </motion.div>

                    {!collapsed && (
                      <>
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: 15,
                            fontWeight: active ? 700 : 600,
                            color: active ? "#1A1008" : "rgba(26,16,8,0.8)",
                            flex: 1,
                            textAlign: "left",
                            textShadow: active ? "0 1px 1px rgba(255,255,255,0.5)" : "none",
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
                              padding: "4px 10px",
                              borderRadius: 8,
                              background:
                                item.badge === "Active"
                                  ? "linear-gradient(135deg, rgba(16,185,129,0.3) 0%, rgba(16,185,129,0.2) 100%)"
                                  : "linear-gradient(135deg, rgba(100,116,139,0.25) 0%, rgba(100,116,139,0.15) 100%)",
                              color: item.badge === "Active" ? "#059669" : "#475569",
                              border:
                                item.badge === "Active"
                                  ? "1px solid rgba(16,185,129,0.4)"
                                  : "1px solid rgba(100,116,139,0.3)",
                              boxShadow:
                                "0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {collapsed && (
                      <div
                        className="absolute left-full ml-3 px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                        style={{
                          background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
                          color: "#FFFFFF",
                          fontSize: 14,
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 600,
                          boxShadow: "0 8px 24px rgba(139,105,20,0.4)",
                          border: "1px solid rgba(255,255,255,0.2)",
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
                              background: "rgba(255,255,255,0.25)",
                              border: "1px solid rgba(255,255,255,0.3)",
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
            className="mx-4 mb-4 px-4 py-3 rounded-2xl"
            style={{
              background:
                "linear-gradient(135deg, rgba(139,105,20,0.15) 0%, rgba(196,30,30,0.15) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.4)",
              boxShadow: "0 4px 16px rgba(139,105,20,0.15)",
            }}
          >
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 12,
                color: "#8B6914",
                textAlign: "center",
                fontWeight: 700,
                textShadow: "0 1px 2px rgba(255,255,255,0.8)",
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
