import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import FynLogo from "@/components/FynLogo";
import {
  LayoutDashboard, MessageCircle, Grid3X3, TrendingUp, Gauge,
  Zap, ArrowDownCircle, ArrowUpCircle, FileCheck, Calculator,
  CalendarDays, Users, IndianRupee, Building2, UserCheck, PieChart,
  Shield, ClipboardCheck, FileText, History, Plug, Settings,
  CreditCard, UsersRound, LogOut, Search, Bell, Menu, X,
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
      { label: "Nidhi Cockpit", href: "/dashboard/cockpit", icon: LayoutDashboard },
      { label: "Talk to Nidhi", href: "/dashboard/nidhi", icon: MessageCircle },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      { label: "360 Dashboard", href: "/dashboard/360", icon: Grid3X3 },
      { label: "Cash Flow", href: "/dashboard/cash-flow", icon: TrendingUp },
      { label: "Runway", href: "/dashboard/cash-flow", icon: Gauge },
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
      { label: "Payables", href: "/dashboard/receivables", icon: ArrowUpCircle },
    ],
  },
  {
    title: "COMPLIANCE",
    items: [
      { label: "GST Intelligence", href: "/dashboard/gst", icon: FileCheck },
      { label: "TDS & Advance Tax", href: "/dashboard/gst", icon: Calculator },
      { label: "Filing Calendar", href: "/dashboard/filing-calendar", icon: CalendarDays },
    ],
  },
  {
    title: "WORKFORCE",
    items: [
      { label: "HR Intelligence", href: "/dashboard/hr", icon: Users },
      { label: "Payroll Planner", href: "/dashboard/hr", icon: IndianRupee },
    ],
  },
  {
    title: "BUSINESS",
    items: [
      { label: "Vendors", href: "/dashboard/360", icon: Building2 },
      { label: "Customers", href: "/dashboard/360", icon: UserCheck },
      { label: "Cost Intelligence", href: "/dashboard/360", icon: PieChart },
    ],
  },
  {
    title: "GOVERNANCE",
    items: [
      { label: "Compliance Health", href: "/dashboard/360", icon: Shield },
      { label: "Audit Readiness", href: "/dashboard/360", icon: ClipboardCheck },
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
    title: "SETTINGS",
    items: [
      { label: "Integrations", href: "/dashboard/360", icon: Plug },
      { label: "Business Profile", href: "/dashboard/360", icon: Settings },
      { label: "Team & Access", href: "/dashboard/360", icon: UsersRound },
      { label: "Billing", href: "/dashboard/360", icon: CreditCard },
    ],
  },
];

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isCockpit = location.pathname === "/dashboard/cockpit";

  const pageTitle = navSections
    .flatMap((s) => s.items)
    .find((i) => i.href === location.pathname)?.label || "Dashboard";

  return (
    <div className="min-h-screen flex bg-fyn-beige">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex w-60 bg-fyn-ink flex-col fixed inset-y-0 left-0 z-40 overflow-y-auto">
        <div className="p-4 border-b border-white/10">
          <FynLogo variant="light" showTagline={false} className="mb-2" />
          <p className="text-white/40 text-xs truncate">{profile?.full_name || "Business Owner"}</p>
          <span className="text-fyn-gold text-[10px] fyn-label">STARTER PLAN</span>
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
                    key={item.label}
                    to={item.href}
                    className={`flex items-center gap-2.5 px-2 py-1.5 rounded text-sm transition-colors ${
                      active ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                    aria-label={item.label}
                  >
                    <Icon size={16} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-fyn-red text-white text-[9px] px-1.5 py-0.5 rounded fyn-label">{item.badge}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-green-400 text-xs mb-2">● Live | Last sync: 12 min ago</p>
          <button onClick={signOut} className="flex items-center gap-2 text-white/40 text-sm hover:text-white">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-72 bg-fyn-ink overflow-y-auto">
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
                        key={item.label}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded text-sm text-white/50 hover:text-white"
                      >
                        <Icon size={16} />{item.label}
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
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="h-16 bg-fyn-beige-dark border-b border-fyn-ink-10 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button className="lg:hidden mr-3 text-fyn-ink" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            {!isCockpit && (
              <button onClick={() => navigate("/dashboard/cockpit")} className="text-fyn-gold text-sm hover:underline flex items-center gap-1">
                ← Back to Cockpit
              </button>
            )}
            <h1 className="text-fyn-ink font-serif text-lg">{pageTitle}</h1>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:flex items-center bg-fyn-beige border border-fyn-ink-10 rounded-lg px-3 py-1.5 gap-2 w-64">
              <Search size={14} className="text-fyn-ink/30" />
              <input placeholder="Search customers, invoices..." className="bg-transparent text-sm text-fyn-ink outline-none flex-1" aria-label="Search" />
              <span className="text-fyn-ink/20 text-xs">⌘K</span>
            </div>
            <span className="hidden md:inline text-xs bg-amber-100 text-fyn-warning px-2 py-1 rounded fyn-metric">GSTR-3B in 8 days</span>
            <button className="relative text-fyn-ink/60 hover:text-fyn-ink" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-fyn-red rounded-full text-white text-[9px] flex items-center justify-center">3</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-fyn-red flex items-center justify-center text-white text-sm font-bold">
              {profile?.full_name?.[0] || "U"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
