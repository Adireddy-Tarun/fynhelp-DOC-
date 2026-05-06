import { useState, useEffect } from "react";
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

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuSections: MenuSection[] = [
  {
    title: "OVERVIEW",
    items: [
      { icon: Home, label: "Dashboard", path: "/dashboard/cockpit", color: "#3B82F6" },
      { icon: MessageSquare, label: "AI CFO Nidhi", path: "/dashboard/nidhi", color: "#8B5CF6" },
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
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <motion.aside
        initial={false}
        animate={{
          width,
          x: visible ? 0 : -width,
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(139,105,20,0.12)",
          boxShadow: "2px 0 12px rgba(0,0,0,0.04)",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        <div
          className="flex items-center justify-between px-4 py-5 border-b"
          style={{ borderColor: "rgba(139,105,20,0.12)", minHeight: 80 }}
        >
          <button
            onClick={() => navigate("/dashboard/cockpit")}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
            aria-label="Go to dashboard"
          >
            {collapsed ? (
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1A1008", color: "#F4EDDA", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontWeight: 700 }}>
                F
              </div>
            ) : (
              <FynLogo variant="dark" showTagline={false} />
            )}
          </button>

          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(139,105,20,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} color="rgba(26,16,8,0.6)" /> : <ChevronLeft size={18} color="rgba(26,16,8,0.6)" />}
          </button>

          <button
            onClick={onToggle}
            className="lg:hidden"
            style={{ background: "transparent", border: "none", cursor: "pointer" }}
            aria-label="Close menu"
          >
            <X size={20} color="#1A1008" />
          </button>
        </div>

        <nav className="flex-1 py-4" style={{ paddingLeft: collapsed ? 12 : 16, paddingRight: collapsed ? 12 : 16 }}>
          {menuSections.map((section) => (
            <div key={section.title} className="mb-8">
              {!collapsed && (
                <p
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.8px",
                    color: "rgba(26,16,8,0.4)",
                    marginBottom: 8,
                    paddingLeft: 12,
                    textTransform: "uppercase",
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
                    whileHover={{ scale: collapsed ? 1.05 : 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center gap-3 px-3 py-3 mb-1 rounded-xl transition-all relative group"
                    style={{
                      background: active
                        ? "linear-gradient(90deg, rgba(196,30,30,0.08) 0%, rgba(139,105,20,0.08) 100%)"
                        : "transparent",
                      border: "none",
                      cursor: "pointer",
                      borderLeft: active ? "4px solid #8B6914" : "4px solid transparent",
                      justifyContent: collapsed ? "center" : "flex-start",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.background = "rgba(139,105,20,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.background = "transparent";
                    }}
                    aria-current={active ? "page" : undefined}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: active ? `${item.color}15` : "rgba(100,116,139,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                    >
                      <Icon size={20} color={active ? item.color : "rgba(26,16,8,0.6)"} strokeWidth={active ? 2.5 : 2} />
                    </div>

                    {!collapsed && (
                      <>
                        <span
                          style={{
                            fontFamily: "Inter, sans-serif",
                            fontSize: 14,
                            fontWeight: active ? 600 : 500,
                            color: active ? "#1A1008" : "rgba(26,16,8,0.7)",
                            flex: 1,
                            textAlign: "left",
                          }}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              fontFamily: "Inter, sans-serif",
                              padding: "3px 8px",
                              borderRadius: 6,
                              background: item.badge === "Active" ? "rgba(16,185,129,0.12)" : "rgba(100,116,139,0.12)",
                              color: item.badge === "Active" ? "#10B981" : "#64748B",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}

                    {collapsed && (
                      <div
                        className="absolute left-full ml-2 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
                        style={{
                          background: "#1A1008",
                          color: "#fff",
                          fontSize: 13,
                          fontFamily: "Inter, sans-serif",
                          fontWeight: 500,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        }}
                      >
                        {item.label}
                        {item.badge && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              marginLeft: 8,
                              padding: "2px 6px",
                              borderRadius: 4,
                              background: item.badge === "Active" ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.2)",
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
          <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(139,105,20,0.12)" }}>
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 11,
                color: "rgba(26,16,8,0.5)",
                textAlign: "center",
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
