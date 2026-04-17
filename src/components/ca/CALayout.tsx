import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, Outlet, Navigate } from "react-router-dom";
import { useCAAuth } from "@/contexts/CAAuthContext";
import {
  Home, Grid3x3, Bell, Calendar, FileText, Calculator, Shield,
  CheckCircle2, BarChart3, Layers, Activity, IndianRupee,
  Settings, Users, CreditCard, Search, HelpCircle, LogOut, ChevronDown
} from "lucide-react";

interface NavItem { label: string; path: string; icon: any; badge?: number }
interface NavSection { label: string; items: NavItem[] }

const sections: NavSection[] = [
  { label: "OVERVIEW", items: [
    { label: "Dashboard", path: "/ca/dashboard", icon: Home },
    { label: "Client Portfolio", path: "/ca/clients", icon: Grid3x3 },
    { label: "Notifications", path: "/ca/notifications", icon: Bell, badge: 3 },
  ]},
  { label: "FILING & COMPLIANCE", items: [
    { label: "Filing Calendar", path: "/ca/filing-calendar", icon: Calendar },
    { label: "GST Portfolio", path: "/ca/gst-portfolio", icon: FileText },
    { label: "TDS Tracker", path: "/ca/tds-tracker", icon: Calculator },
    { label: "Compliance Matrix", path: "/ca/compliance", icon: Shield },
  ]},
  { label: "CLIENT TOOLS", items: [
    { label: "ITC Reconciliation", path: "/ca/itc-recon", icon: CheckCircle2 },
    { label: "Reports Generator", path: "/ca/reports", icon: BarChart3 },
    { label: "Bulk Actions", path: "/ca/bulk-actions", icon: Layers },
  ]},
  { label: "ANALYTICS", items: [
    { label: "Portfolio Health", path: "/ca/portfolio-health", icon: Activity },
    { label: "Revenue Analytics", path: "/ca/revenue", icon: IndianRupee },
  ]},
  { label: "ACCOUNT", items: [
    { label: "Firm Settings", path: "/ca/settings", icon: Settings },
    { label: "Team Members", path: "/ca/settings/team", icon: Users },
    { label: "Billing", path: "/ca/settings/billing", icon: CreditCard },
  ]},
];

const pageTitles: Record<string, string> = {
  "/ca/dashboard": "Dashboard",
  "/ca/clients": "Client Portfolio",
  "/ca/clients/add": "Add Client",
  "/ca/notifications": "Notifications",
  "/ca/filing-calendar": "Filing Calendar",
  "/ca/gst-portfolio": "GST Portfolio",
  "/ca/tds-tracker": "TDS Tracker",
  "/ca/compliance": "Compliance Matrix",
  "/ca/itc-recon": "ITC Reconciliation",
  "/ca/reports": "Reports Generator",
  "/ca/bulk-actions": "Bulk Actions",
  "/ca/portfolio-health": "Portfolio Health",
  "/ca/revenue": "Revenue Analytics",
  "/ca/settings": "Firm Settings",
  "/ca/settings/team": "Team Members",
  "/ca/settings/billing": "Billing",
};

export default function CALayout() {
  const { user, caFirm, loading, signOut } = useCAAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0EBE0" }}>
        <div className="text-sm font-sans" style={{ color: "#1A1008" }}>Loading…</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/ca/login" replace />;
  if (!caFirm) return <Navigate to="/ca/register" replace />;

  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith("/ca/client/") ? "Client Detail" : "CA Portal");

  const initials = caFirm.firm_name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "#F0EBE0" }}>
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 fixed inset-y-0 left-0 flex flex-col z-40" style={{ background: "#1A1008" }}>
        {/* Top: logo */}
        <div className="px-5 py-4 h-16 flex flex-col justify-center">
          <div className="text-white font-bold text-lg tracking-tight">FynHelp</div>
          <div className="text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: "#8B6914" }}>
            CA Partner Portal
          </div>
        </div>

        {/* Firm info */}
        <div className="px-5 py-3.5 flex items-center gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: "#C41E1E" }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white font-semibold text-[13px] truncate">{caFirm.firm_name}</div>
            <div className="text-[11px]" style={{ color: "#8B6914" }}>CA Partner</div>
            {caFirm.membership_number && (
              <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>#{caFirm.membership_number}</div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          {sections.map((sec) => (
            <div key={sec.label} className="mb-3">
              <div className="px-5 mb-1 text-[10px] font-medium uppercase tracking-[0.12em]" style={{ color: "#8B6914" }}>
                {sec.label}
              </div>
              {sec.items.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`group h-10 px-5 flex items-center gap-2.5 transition-all duration-150 text-[13px] font-medium ${
                      active ? "text-white" : "hover:translate-x-0.5"
                    }`}
                    style={active ? {
                      background: "rgba(196,30,30,0.15)",
                      borderLeft: "3px solid #C41E1E",
                      paddingLeft: "17px",
                    } : { color: "rgba(255,255,255,0.65)" }}
                    onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                    onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                  >
                    <Icon size={15} style={{ color: active ? "#C41E1E" : "rgba(255,255,255,0.45)" }} />
                    <span className="flex-1">{item.label}</span>
                    {item.badge ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "#C41E1E" }}>
                        {item.badge}
                      </span>
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.40)" }}>47 clients</div>
          <button
            onClick={async () => { await signOut(); navigate("/ca/login"); }}
            className="text-xs hover:text-white/60 transition-colors flex items-center gap-1.5"
            style={{ color: "rgba(255,255,255,0.30)" }}
          >
            <LogOut size={12} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-[260px] flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-14 sticky top-0 z-30 bg-white flex items-center px-6 gap-6" style={{ borderBottom: "1px solid #D4C9A8" }}>
          <h1 className="text-[18px] font-semibold" style={{ color: "#1A1008" }}>{title}</h1>

          <div className="flex-1 max-w-[400px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,16,8,0.40)" }} />
            <input
              type="text"
              placeholder="Search client name, GSTIN, or email..."
              className="w-full h-9 pl-9 pr-3 rounded-md text-sm font-sans focus:outline-none focus:ring-1"
              style={{ border: "1px solid #D4C9A8", color: "#1A1008" }}
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-[13px]" style={{ color: "rgba(26,16,8,0.50)" }}>{today}</span>
            <button onClick={() => navigate("/ca/notifications")} className="relative" aria-label="Notifications">
              <Bell size={18} style={{ color: "#1A1008" }} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: "#C41E1E" }}>3</span>
            </button>
            <HelpCircle size={18} style={{ color: "#1A1008" }} className="cursor-pointer" />
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "#C41E1E" }}
              >
                {initials}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white rounded-md shadow-lg py-2 z-50" style={{ border: "1px solid #D4C9A8" }}>
                  <div className="px-3 py-2 border-b" style={{ borderColor: "#F0EBD8" }}>
                    <div className="text-sm font-semibold" style={{ color: "#1A1008" }}>{caFirm.firm_name}</div>
                    <div className="text-xs" style={{ color: "rgba(26,16,8,0.60)" }}>{caFirm.email}</div>
                  </div>
                  <button onClick={() => { setMenuOpen(false); navigate("/ca/settings"); }} className="w-full text-left px-3 py-2 text-sm hover:bg-[#F8F6F1]" style={{ color: "#1A1008" }}>Settings</button>
                  <button onClick={async () => { setMenuOpen(false); await signOut(); navigate("/ca/login"); }} className="w-full text-left px-3 py-2 text-sm hover:bg-[#F8F6F1]" style={{ color: "#C41E1E" }}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
