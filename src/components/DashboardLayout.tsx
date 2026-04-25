import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import FynLogo from "@/components/FynLogo";
import ProfileCompletionBadge from "@/components/ProfileCompletionBadge";
import {
  LayoutDashboard, MessageCircle, Grid3X3, TrendingUp, Gauge,
  Zap, ArrowDownCircle, ArrowUpCircle, FileCheck, Calculator,
  CalendarDays, Users, IndianRupee, Building2, UserCheck, PieChart,
  Shield, ClipboardCheck, FileText, History, Plug, Settings,
  CreditCard, UsersRound, LogOut, Search, Bell, Menu, X,
  BarChart3, Landmark, Briefcase, TrendingUpDown,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: "NIDHI",
    items: [
      { label: "AI CFO Nidhi Cockpit", href: "/dashboard/cockpit", icon: LayoutDashboard },
      { label: "Talk to AI CFO Nidhi", href: "/dashboard/nidhi", icon: MessageCircle },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { label: "360 Dashboard", href: "/dashboard/360", icon: Grid3X3 },
      { label: "Cash Flow", href: "/dashboard/cash-flow", icon: TrendingUp },
      { label: "Runway", href: "/dashboard/runway", icon: Gauge },
      { label: "Working Capital", href: "/dashboard/working-capital", icon: TrendingUpDown },
    ],
  },
  {
    title: "SIMULATE",
    items: [
      { label: "Decision Simulator", href: "/dashboard/simulator", icon: Zap, badge: "SIMULATE" },
    ],
  },
  {
    title: "RECEIVABLES & PAYABLES",
    items: [
      { label: "Receivables", href: "/dashboard/receivables", icon: ArrowDownCircle },
      { label: "Payables", href: "/dashboard/payables", icon: ArrowUpCircle },
    ],
  },
  {
    title: "COMPLIANCE",
    items: [
      { label: "GST Intelligence", href: "/dashboard/gst", icon: FileCheck },
      { label: "TDS & Advance Tax", href: "/dashboard/tds-tax", icon: Calculator },
      { label: "Filing Calendar", href: "/dashboard/filing-calendar", icon: CalendarDays },
    ],
  },
  {
    title: "WORKFORCE",
    items: [
      { label: "HR Intelligence", href: "/dashboard/hr", icon: Users },
      { label: "Payroll Planner", href: "/dashboard/payroll", icon: IndianRupee },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { label: "Vendors", href: "/dashboard/vendors", icon: Building2 },
      { label: "Customers", href: "/dashboard/customers", icon: UserCheck },
      { label: "Cost Intelligence", href: "/dashboard/cost", icon: PieChart },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { label: "Compliance Health", href: "/dashboard/compliance", icon: Shield },
      { label: "Audit Readiness", href: "/dashboard/audit-readiness", icon: ClipboardCheck },
    ],
  },
  {
    title: "REPORTS",
    items: [
      { label: "CFO Reports", href: "/dashboard/reports", icon: FileText },
      { label: "Simulations", href: "/dashboard/simulator", icon: History },
    ],
  },
  {
    title: "GROWTH",
    items: [
      { label: "Market & Growth", href: "/dashboard/market-growth", icon: BarChart3 },
    ],
  },
  {
    title: "BANKING",
    items: [
      { label: "Banking & Fintech", href: "/dashboard/banking", icon: Landmark },
    ],
  },
  {
    title: "CA PARTNER",
    items: [
      { label: "CA Partner Hub", href: "/dashboard/ca-partner", icon: Briefcase },
    ],
  },
  {
    title: "SETTINGS",
    items: [
      { label: "Profile", href: "/dashboard/settings/profile", icon: UserCheck },
      { label: "Integrations", href: "/dashboard/settings/integrations", icon: Plug },
      { label: "Business Profile", href: "/dashboard/settings/business", icon: Settings },
      { label: "Team & Access", href: "/dashboard/settings/team", icon: UsersRound },
      { label: "Billing", href: "/dashboard/settings/billing", icon: CreditCard },
    ],
  },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isCockpit = location.pathname === "/dashboard/cockpit";

  // Normalize current path (drop trailing slash, lowercase) for robust active matching
  const currentPath = location.pathname.replace(/\/+$/, "").toLowerCase() || "/";
  const isActive = (href: string) => {
    const normalized = href.replace(/\/+$/, "").toLowerCase();
    return currentPath === normalized;
  };

  const pageTitle = navSections
    .flatMap((s) => s.items)
    .find((i) => isActive(i.href))?.label || "Dashboard";

  return (
    <div className="min-h-screen flex" style={{ background: "#EDE4CB" }}>
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40 overflow-y-auto" style={{ width: 256, background: "#1A1008" }}>
        <div className="p-4 border-b border-white/10">
          <FynLogo variant="light" showTagline={false} className="mb-2" />
        </div>

        {/* Subscription badge */}
        <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#16A34A" }} />
            <span className="text-[13px] font-semibold text-white truncate">{profile?.full_name || "Business Owner"}</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-[0.10em] text-primary-foreground"
              style={{ background: "rgba(139,105,20,0.20)", border: "1px solid rgba(139,105,20,0.40)", color: "#8B6914" }}>
              ★ EARLY ACCESS
            </span>
            <button onClick={() => navigate("/dashboard/settings/billing")}
              className="transition-colors text-primary-foreground text-sm"
              style={{ color: "rgba(255,255,255,0.35)" }}>Manage →</button>
          </div>
        </div>

        <nav className="flex-1 py-2 px-2 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.title}>
              <p className="text-white/20 fyn-label text-[10px] px-2 mb-1">{section.title}</p>
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.href;
                return (
                  <Link
                    key={item.label + item.href}
                    to={item.href}
                    className="flex items-center gap-2.5 px-2 py-1.5 rounded transition-all duration-150 border-0"
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      background: active ? "rgba(196,30,30,0.15)" : "transparent",
                      borderLeft: active ? "3px solid #C41E1E" : "3px solid transparent",
                      color: active ? "#FFFFFF" : "rgba(255,255,255,0.50)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                        e.currentTarget.style.transform = "translateX(2px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "rgba(255,255,255,0.50)";
                        e.currentTarget.style.transform = "translateX(0)";
                      }
                    }}
                    aria-label={item.label}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <span className="whitespace-nowrap text-primary-foreground font-sans font-light">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-white text-[9px] px-1.5 py-0.5 rounded fyn-label flex-shrink-0" style={{ background: "#C41E1E" }}>{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-[#4ADE80] text-[13px] mb-2">● Live | Last sync: 12 min ago</p>
          <button onClick={signOut} className="flex items-center gap-2 text-white/40 text-[13px] hover:text-white transition-colors">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 overflow-y-auto" style={{ background: "#1A1008" }}>
            <div className="p-4 flex justify-between items-center border-b border-white/10">
              <FynLogo variant="light" showTagline={false} />
              <button onClick={() => setSidebarOpen(false)} className="text-white"><X size={20} /></button>
            </div>
            <nav className="py-2 px-2 space-y-3">
              {navSections.map((section) => (
                <div key={section.title}>
                  <p className="text-white/20 fyn-label text-[10px] px-2 mb-1">{section.title}</p>
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label + item.href}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded text-white/50 hover:text-white"
                        style={{ fontSize: 13, fontWeight: 500 }}
                      >
                        <Icon size={16} className="flex-shrink-0" /><span className="whitespace-nowrap">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-16 border-b flex items-center px-4 lg:px-6 sticky top-0 z-30" style={{ background: "#EDE4CB", borderColor: "rgba(26,16,8,0.10)" }}>
          <button className="lg:hidden mr-3 text-fyn-ink" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            {!isCockpit && (
              <button onClick={() => navigate("/dashboard/cockpit")} className="text-[#8B6914] text-[13px] hover:underline flex items-center gap-1">
                ← Back to Cockpit
              </button>
            )}
            <h1 className="text-lg font-sans text-secondary-foreground">{pageTitle}</h1>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center border rounded-lg px-3 py-1.5 gap-2 w-64" style={{ background: "#FFFFFF", borderColor: "rgba(26,16,8,0.10)" }}>
              <Search size={14} className="text-fyn-ink/30" />
              <input placeholder="Search customers, invoices..." className="bg-transparent text-[13px] text-fyn-ink outline-none flex-1" aria-label="Search" />
              <span className="text-fyn-ink/20 text-xs">⌘K</span>
            </div>
            <span className="hidden md:inline text-[12px] px-2 py-1 rounded fyn-metric" style={{ background: "#FEF3E2", color: "#8B5A00" }}>GSTR-3B in 8 days</span>
            <button className="relative text-fyn-ink/60 hover:text-fyn-ink" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center" style={{ background: "#C41E1E" }}>3</span>
            </button>
            <ProfileCompletionBadge />
            <Link
              to="/dashboard/settings/profile"
              aria-label="Open profile"
              title="Profile"
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-transform hover:scale-105"
              style={{ background: "#C41E1E" }}
            >
              {profile?.full_name?.[0] || "U"}
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto" style={{ minHeight: "calc(100vh - 64px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
