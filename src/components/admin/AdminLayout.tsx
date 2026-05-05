import { ReactNode, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3, Users, CreditCard, FileText, MessageCircle, TrendingUp,
  Send, Flag, Settings, Activity, ClipboardList, Menu, X, LogOut, ChevronDown, Bot,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminAuth, type AdminRole } from "@/contexts/AdminAuthContext";

type NavItem = { to: string; label: string; icon: typeof BarChart3; roles?: AdminRole[] };

const NAV: NavItem[] = [
  { to: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/subscriptions", label: "Subscriptions & Billing", icon: CreditCard, roles: ["super_admin","ops_admin","analyst"] },
  { to: "/admin/content", label: "Content Management", icon: FileText, roles: ["super_admin","ops_admin"] },
  { to: "/admin/support", label: "Support Tickets", icon: MessageCircle },
  { to: "/admin/analytics", label: "Analytics", icon: TrendingUp, roles: ["super_admin","ops_admin","analyst"] },
  { to: "/admin/ai-monitoring", label: "AI Monitoring", icon: Bot, roles: ["super_admin","ops_admin","analyst"] },
  { to: "/admin/communications", label: "Communications Hub", icon: Send, roles: ["super_admin","ops_admin"] },
  { to: "/admin/feature-flags", label: "Feature Flags", icon: Flag, roles: ["super_admin"] },
  { to: "/admin/settings", label: "Settings", icon: Settings, roles: ["super_admin"] },
  { to: "/admin/system-health", label: "System Health", icon: Activity, roles: ["super_admin","ops_admin"] },
];
const FOOTER_NAV: NavItem[] = [
  { to: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
];

export function AdminProtected({ children }: { children?: ReactNode; allowed?: AdminRole[] }) {
  // Auth temporarily disabled — admin portal is in design phase.
  return <>{children ?? <Outlet />}</>;
}

const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super Admin", admin: "Admin", ops_admin: "Ops Admin",
  support_agent: "Support Agent", analyst: "Analyst",
};

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const { primaryRole, hasRole } = useAdminAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = (user?.email ?? "A").slice(0, 2).toUpperCase();
  // Auth temporarily disabled — show all nav items during design phase.
  const visible = NAV;

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--fyn-beige))" }}>
      {/* Top nav */}
      <header
        className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 md:px-6"
        style={{
          height: 64, background: "#FFFFFF",
          borderBottom: "1px solid hsl(var(--fyn-ink) / 0.1)",
          boxShadow: "0 2px 8px hsl(var(--fyn-ink) / 0.04)",
        }}
      >
        <div className="flex items-center gap-3">
          <button
            className="md:hidden p-2 -ml-2 rounded-lg"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation"
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <Menu size={22} color="hsl(var(--fyn-ink))" />
          </button>
          <Link to="/admin/dashboard" className="flex items-baseline gap-2">
            <span style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 20, color: "hsl(var(--fyn-ink))" }}>
              FYNHelp
            </span>
            <span style={{ fontFamily: "Raleway, sans-serif", fontSize: 12, color: "hsl(var(--fyn-gold))" }}>
              Admin
            </span>
          </Link>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="flex items-center gap-3 rounded-xl pl-2 pr-3 py-1.5 hover:bg-[hsl(var(--fyn-ink)/0.04)]"
            style={{ minHeight: 44 }}
          >
            <span
              className="grid place-items-center rounded-full text-white"
              style={{
                width: 36, height: 36,
                background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
                fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 13,
              }}
            >{initials}</span>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 14, color: "hsl(var(--fyn-ink))" }}>
                {user?.email?.split("@")[0] ?? "Admin"}
              </span>
              <span
                style={{
                  fontFamily: "DM Sans, sans-serif", fontSize: 11,
                  color: "hsl(var(--fyn-gold))", fontWeight: 600,
                }}
              >{primaryRole ? ROLE_LABEL[primaryRole] : "Admin"}</span>
            </div>
            <ChevronDown size={16} color="hsl(var(--fyn-ink) / 0.5)" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div
                className="absolute right-0 mt-2 w-56 z-20 overflow-hidden rounded-xl"
                style={{
                  background: "rgba(255,255,255,0.98)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid hsl(var(--fyn-gold) / 0.2)",
                  boxShadow: "0 12px 32px hsl(var(--fyn-ink) / 0.15)",
                }}
              >
                <button
                  onClick={async () => { await signOut(); nav("/admin/login"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[hsl(var(--fyn-ink)/0.05)] text-left"
                  style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink))" }}
                >
                  <LogOut size={16} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 md:z-30 transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{
          width: 260, height: "100vh", background: "hsl(var(--fyn-ink))",
          paddingTop: 64, display: "flex", flexDirection: "column",
        }}
      >
        <button
          className="md:hidden absolute top-3 right-3 p-2 rounded-lg text-white"
          onClick={() => setMobileOpen(false)}
          aria-label="Close navigation"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <X size={22} />
        </button>
        <nav className="flex-1 overflow-y-auto py-4">
          {visible.map((item) => (
            <SidebarLink key={item.to} item={item} onClick={() => setMobileOpen(false)} />
          ))}
        </nav>
        <div style={{ borderTop: "1px solid rgba(244,237,218,0.1)", padding: "8px 0" }}>
          {FOOTER_NAV.map((item) => (
            <SidebarLink key={item.to} item={item} onClick={() => setMobileOpen(false)} />
          ))}
        </div>
        <div
          className="px-5 py-4"
          style={{
            borderTop: "1px solid rgba(244,237,218,0.1)",
            color: "rgba(244,237,218,0.5)",
            fontFamily: "Roboto, sans-serif", fontSize: 12,
          }}
        >v1.0.0</div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <main
        style={{
          paddingTop: 64,
          paddingLeft: 0,
          minHeight: "100vh",
        }}
        className="md:pl-[260px]"
      >
        <div className="px-5 py-6 md:px-10 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3.5 px-5 py-3.5 transition-all duration-200 ${
          isActive ? "active-admin-link" : ""
        }`
      }
      style={({ isActive }) =>
        isActive
          ? {
              background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
              color: "#FFFFFF",
              borderLeft: "4px solid #8B6914",
              paddingLeft: 16,
              boxShadow: "0 4px 12px rgba(196,30,30,0.3)",
              fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 15,
            }
          : {
              color: "rgba(244,237,218,0.8)",
              fontFamily: "Raleway, sans-serif", fontWeight: 500, fontSize: 15,
            }
      }
    >
      <Icon size={20} />
      <span>{item.label}</span>
    </NavLink>
  );
}
