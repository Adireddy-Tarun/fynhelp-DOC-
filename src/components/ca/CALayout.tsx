import { ReactNode, useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate, Outlet, Navigate } from "@/lib/router-compat";
import { useCAAuth } from "@/contexts/CAAuthContext";
import FynLogo from "@/components/FynLogo";
import {
  Home, Grid3x3, Bell, Calendar, FileText, Calculator, Shield,
  CheckCircle2, BarChart3, Layers, Activity, IndianRupee,
  Settings, Users, CreditCard, Search, HelpCircle, LogOut, ChevronDown,
  ChevronLeft, ClipboardCheck, Building2, Briefcase
} from "lucide-react";

interface NavItem { label: string; path: string; icon: any; badge?: number }
interface NavGroup { label: string; icon: any; soon?: boolean; items: NavItem[] }
interface NavSection { label: string; items?: NavItem[]; groups?: NavGroup[] }

const sections: NavSection[] = [
  {
    label: "OVERVIEW",
    items: [
      { label: "Dashboard", path: "/ca/dashboard", icon: Home },
      { label: "Client Portfolio", path: "/ca/clients", icon: Grid3x3 },
      { label: "Notifications", path: "/ca/notifications", icon: Bell, badge: 3 },
    ],
  },
  {
    label: "PRACTICE AREAS",
    groups: [
      {
        label: "Taxation",
        icon: FileText,
        items: [
          { label: "Filing Calendar", path: "/ca/filing-calendar", icon: Calendar },
          { label: "GST Portfolio", path: "/ca/gst-portfolio", icon: FileText },
          { label: "TDS Tracker", path: "/ca/tds-tracker", icon: Calculator },
          { label: "Compliance Matrix", path: "/ca/compliance", icon: Shield },
          { label: "ITC Reconciliation", path: "/ca/itc-recon", icon: CheckCircle2 },
        ],
      },
      {
        label: "Audit & Assurance",
        icon: ClipboardCheck,
        soon: true,
        items: [],
      },
      {
        label: "Corporate & ROC",
        icon: Building2,
        soon: true,
        items: [],
      },
      {
        label: "Advisory & CFO Suite",
        icon: Briefcase,
        items: [
          { label: "Portfolio Health", path: "/ca/portfolio-health", icon: Activity },
          { label: "Revenue Analytics", path: "/ca/revenue", icon: IndianRupee },
        ],
      },
    ],
  },
  {
    label: "CLIENT TOOLS",
    items: [
      { label: "Reports Generator", path: "/ca/reports", icon: BarChart3 },
      { label: "Bulk Actions", path: "/ca/bulk-actions", icon: Layers },
    ],
  },
  {
    label: "ACCOUNT",
    items: [
      { label: "Firm Settings", path: "/ca/settings", icon: Settings },
      { label: "Team Members", path: "/ca/settings/team", icon: Users },
      { label: "Billing", path: "/ca/settings/billing", icon: CreditCard },
    ],
  },
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
  const { caFirm, loading } = useCAAuth();
  const { signOut } = useCAAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Auto-expand whichever Practice Area group contains the active route
  const findActiveGroup = () => {
    for (const sec of sections) {
      if (!sec.groups) continue;
      for (const g of sec.groups) {
        if (g.items.some((i) => i.path === location.pathname)) return g.label;
      }
    }
    return "Taxation";
  };
  const [openGroup, setOpenGroup] = useState<string>(findActiveGroup());

  useEffect(() => {
    setOpenGroup(findActiveGroup());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // TEMP: auth gate disabled for UI inspection
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F3" }}>
        <div className="text-sm" style={{ color: "#1A1008" }}>Loading…</div>
      </div>
    );
  }

  if (!caFirm) return null;

  const title = pageTitles[location.pathname] ||
    (location.pathname.startsWith("/ca/clients/") ? "Client Detail" : "CA Portal");

  const initials = caFirm.firm_name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const today = new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });

  const sidebarWidth = collapsed ? 76 : 236;

  return (
    <div className="min-h-screen flex font-sans" style={{ background: "#FAF8F3" }}>
      {/* Sidebar — white, collapsible, matches FynHelp Sidebar.tsx pattern */}
      <aside
        className="flex-shrink-0 fixed inset-y-0 left-0 flex flex-col z-40 transition-all duration-200"
        style={{ width: sidebarWidth, background: "#FFFFFF", borderRight: "1px solid rgba(26,16,8,0.07)" }}
      >
        {/* Top: logo + collapse toggle */}
        <div className="flex items-center justify-between px-4 pt-[18px] pb-3">
          {!collapsed && (
            <div>
              <FynLogo variant="dark" size="md" />
              <div className="text-[10px] font-semibold uppercase tracking-[0.06em] mt-1" style={{ color: "#A93838" }}>
                CA Workbench
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="w-[26px] h-[26px] rounded-[7px] flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ color: "#9E9E9E" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(26,16,8,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft size={16} style={{ transform: collapsed ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
        </div>

        {/* Firm plan pill */}
        {!collapsed && (
          <div
            className="mx-3.5 mb-3.5 px-[11px] py-[7px] rounded-[7px] flex items-center justify-between"
            style={{ background: "#EFE8D8" }}
          >
            <span className="text-[11.5px] font-semibold" style={{ color: "#1A1008" }}>CA Partner</span>
            <span
              className="text-[9.5px] font-semibold px-[7px] py-0.5 rounded-full"
              style={{ background: "#FAEEDA", color: "#633806" }}
            >
              {caFirm.is_verified ? "Verified" : "Pending"}
            </span>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
          {sections.map((sec) => (
            <div key={sec.label} className="mb-1">
              {!collapsed && (
                <div className="px-2.5 pt-3 pb-[5px] text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: "#A93838" }}>
                  {sec.label}
                </div>
              )}

              {/* Flat items */}
              {sec.items?.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="group h-9 px-2.5 flex items-center gap-2.5 rounded-lg transition-all duration-150 text-[13.5px] font-medium mb-0.5"
                    style={
                      active
                        ? { background: "rgba(169,56,56,0.07)", borderLeft: "2px solid #A93838", borderRadius: "0 8px 8px 0", color: "#1A1008", fontWeight: 600 }
                        : { color: "#6B6B6B", borderLeft: "2px solid transparent" }
                    }
                  >
                    <span
                      className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center flex-shrink-0"
                      style={active ? { background: "rgba(169,56,56,0.12)" } : {}}
                    >
                      <Icon size={15} style={{ color: active ? "#A93838" : "#9E9E9E" }} />
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white flex-shrink-0" style={{ background: "#C41E1E" }}>
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    )}
                  </NavLink>
                );
              })}

              {/* Expandable groups (Practice Areas) */}
              {sec.groups?.map((g) => {
                const GroupIcon = g.icon;
                const isOpen = openGroup === g.label && !g.soon;
                const groupHasActive = g.items.some((i) => i.path === location.pathname);
                return (
                  <div key={g.label} className="mb-0.5">
                    <button
                      type="button"
                      disabled={g.soon}
                      onClick={() => !g.soon && setOpenGroup(isOpen ? "" : g.label)}
                      className="w-full h-9 px-2.5 flex items-center gap-2.5 rounded-lg transition-all duration-150 text-[13.5px] font-medium"
                      style={{
                        color: groupHasActive ? "#1A1008" : "#6B6B6B",
                        fontWeight: groupHasActive ? 600 : 500,
                        cursor: g.soon ? "default" : "pointer",
                        opacity: g.soon ? 0.55 : 1,
                      }}
                    >
                      <span className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center flex-shrink-0">
                        <GroupIcon size={15} style={{ color: groupHasActive ? "#A93838" : "#9E9E9E" }} />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left truncate">{g.label}</span>
                          {g.soon ? (
                            <span className="text-[9.5px] italic flex-shrink-0" style={{ color: "#9B9B9B" }}>Soon</span>
                          ) : (
                            <ChevronDown
                              size={13}
                              style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s", color: "#9E9E9E", flexShrink: 0 }}
                            />
                          )}
                        </>
                      )}
                    </button>
                    {!collapsed && isOpen && g.items.length > 0 && (
                      <div className="ml-[14px] pl-[16px]" style={{ borderLeft: "1.5px solid rgba(26,16,8,0.08)" }}>
                        {g.items.map((item) => {
                          const active = location.pathname === item.path;
                          const Icon = item.icon;
                          return (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              className="h-[34px] px-2.5 flex items-center gap-2 rounded-lg transition-all duration-150 text-[13px] font-medium mb-0.5"
                              style={
                                active
                                  ? { background: "rgba(169,56,56,0.07)", color: "#1A1008", fontWeight: 600 }
                                  : { color: "#6B6B6B" }
                              }
                            >
                              <Icon size={13} style={{ color: active ? "#A93838" : "#9E9E9E", flexShrink: 0 }} />
                              <span className="truncate">{item.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: user */}
        <div className="px-3.5 py-3 flex items-center gap-2.5" style={{ borderTop: "1px solid rgba(26,16,8,0.06)" }}>
          <div
            className="w-[30px] h-[30px] rounded-[8px] flex items-center justify-center text-white font-bold text-[12px] flex-shrink-0"
            style={{ background: "#A93838" }}
          >
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-[12.5px] font-semibold truncate" style={{ color: "#1A1008" }}>{caFirm.firm_name}</div>
              <button
                onClick={async () => { await signOut(); navigate("/ca/login"); }}
                className="text-[10.5px] flex items-center gap-1 hover:text-[#A93838] transition-colors"
                style={{ color: "#9E9E9E" }}
              >
                <LogOut size={11} /> Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-200" style={{ marginLeft: sidebarWidth }}>
        {/* Header */}
        <header className="h-16 sticky top-0 z-30 bg-white flex items-center px-7 gap-6" style={{ borderBottom: "1px solid rgba(26,16,8,0.08)" }}>
          <h1 className="text-[19px] font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#1A1008" }}>{title}</h1>

          <div className="flex-1 max-w-[400px] relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,16,8,0.40)" }} />
            <input
              type="text"
              placeholder="Search client name, GSTIN, or email..."
              className="w-full h-9 pl-9 pr-3 rounded-md text-sm font-sans focus:outline-hidden focus:ring-1"
              style={{ border: "1px solid #E2D5BC", color: "#1A1008", background: "#FCFAF4" }}
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <span className="text-[12.5px]" style={{ color: "rgba(26,16,8,0.50)" }}>{today}</span>
            <button onClick={() => navigate("/ca/notifications")} className="relative" aria-label="Notifications">
              <Bell size={18} style={{ color: "#1A1008" }} />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center" style={{ background: "#C41E1E" }}>3</span>
            </button>
            <HelpCircle size={18} style={{ color: "#1A1008" }} className="cursor-pointer" />
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "#A93838" }}
              >
                {initials}
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-10 w-56 bg-white rounded-md shadow-lg py-2 z-50" style={{ border: "1px solid #E2D5BC" }}>
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
