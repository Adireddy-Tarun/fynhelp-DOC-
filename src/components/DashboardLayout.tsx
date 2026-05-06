import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import ProfileCompletionBadge from "@/components/ProfileCompletionBadge";
import { Search, Bell, Menu } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/cockpit": "AI CFO Nidhi Cockpit",
  "/dashboard/nidhi": "Talk to AI CFO Nidhi",
  "/dashboard/runway": "Liquidity",
  "/dashboard/cash-flow": "Revenue",
  "/dashboard/cost": "Cost",
  "/dashboard/gst": "GST & Tax",
  "/dashboard/compliance": "Governance",
  "/dashboard/hr": "HR & Workforce",
  "/dashboard/simulator": "Decision Simulator",
  "/dashboard/market-growth": "Market & Growth",
  "/dashboard/banking": "Banking",
  "/dashboard/ca-partner": "CA Partner",
  "/dashboard/data-import": "Transactions",
  "/dashboard/reports": "CFO Reports",
  "/dashboard/settings/integrations": "Integrations",
  "/dashboard/settings/business": "Business Profile",
  "/dashboard/settings/profile": "Profile",
};

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    if (saved !== null) {
      try {
        setCollapsed(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const onCollapsedChange = (next: boolean) => {
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(next));
  };

  const isCockpit = location.pathname === "/dashboard/cockpit";
  const pageTitle = PAGE_TITLES[location.pathname] || "Dashboard";
  const sidebarWidth = collapsed ? 80 : 280;

  return (
    <div className="min-h-screen flex" style={{ background: "#EDE4CB" }}>
      <Sidebar
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen((v) => !v)}
        collapsed={collapsed}
        onCollapsedChange={onCollapsedChange}
      />

      <div
        className="flex-1 flex flex-col min-h-screen transition-[margin] duration-300"
        style={{ marginLeft: typeof window !== "undefined" && window.innerWidth >= 1024 ? sidebarWidth : 0 }}
      >
        <header
          className="h-16 border-b flex items-center px-4 lg:px-6 sticky top-0 z-30"
          style={{ background: "#EDE4CB", borderColor: "rgba(26,16,8,0.10)" }}
        >
          <button
            className="lg:hidden mr-3 text-fyn-ink"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-3">
            {!isCockpit && (
              <button
                onClick={() => navigate("/dashboard/cockpit")}
                className="text-[#8B6914] text-[13px] hover:underline flex items-center gap-1"
              >
                ← Back to Cockpit
              </button>
            )}
            <h1 className="text-lg font-sans text-secondary-foreground">{pageTitle}</h1>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <div
              className="hidden md:flex items-center border rounded-lg px-3 py-1.5 gap-2 w-64"
              style={{ background: "#FFFFFF", borderColor: "rgba(26,16,8,0.10)" }}
            >
              <Search size={14} className="text-fyn-ink/30" />
              <input
                placeholder="Search customers, invoices..."
                className="bg-transparent text-[13px] text-fyn-ink outline-none flex-1"
                aria-label="Search"
              />
              <span className="text-fyn-ink/20 text-xs">⌘K</span>
            </div>
            <span
              className="hidden md:inline text-[12px] px-2 py-1 rounded fyn-metric"
              style={{ background: "#FEF3E2", color: "#8B5A00" }}
            >
              GSTR-3B in 8 days
            </span>
            <button className="relative text-fyn-ink/60 hover:text-fyn-ink" aria-label="Notifications">
              <Bell size={18} />
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] flex items-center justify-center"
                style={{ background: "#C41E1E" }}
              >
                3
              </span>
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

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto" style={{ minHeight: "calc(100vh - 64px)" }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
