import { ReactNode, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar, { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from "@/components/Sidebar";
import GlobalHeader from "@/components/layout/GlobalHeader";
import OfflineBanner from "@/components/OfflineBanner";
import TrialExpiredBlock from "@/components/TrialExpiredBlock";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const STORAGE_KEY = "fynhelp_sidebar_open";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { ready: authReady } = useAuthRedirect("protected");
  const trial = useTrialStatus();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth < 768 : false);

  // Allow the Billing page even when the trial has expired, so users can upgrade.
  const isBillingRoute = location.pathname.startsWith("/dashboard/settings/billing");
  if (!authReady || (trial.loading && !isBillingRoute)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "#EFE8D8" }}>
        <div className="text-sm" style={{ color: "rgba(26,16,8,0.55)" }}>Loading…</div>
      </div>
    );
  }
  if (trial.shouldBlock && !isBillingRoute) {
    return <TrialExpiredBlock />;
  }

  useEffect(() => {
    const onResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setSidebarOpen(saved === "true");
    } else if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((v) => {
      const next = !v;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  const collapsed = !sidebarOpen;
  const sidebarWidth = collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <OfflineBanner />
      {!isMobile && (
        <Sidebar
          isOpen={drawerOpen}
          onToggle={() => setDrawerOpen((v) => !v)}
          collapsed={collapsed}
          onCollapsedChange={(next) => {
            setSidebarOpen(!next);
            localStorage.setItem(STORAGE_KEY, String(!next));
          }}
        />
      )}
      {isMobile && drawerOpen && (
        <Sidebar
          isOpen={drawerOpen}
          onToggle={() => setDrawerOpen(false)}
          collapsed={false}
          onCollapsedChange={() => {}}
        />
      )}

      <div
        className="flex-1 flex flex-col min-h-screen transition-[margin] duration-200"
        style={{ marginLeft: isMobile ? 0 : (isDesktop ? sidebarWidth : 0) }}
      >
        <GlobalHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          onOpenMobileDrawer={() => setDrawerOpen(true)}
        />

        <main
          className="flex-1 p-4 lg:p-6 overflow-y-auto bg-background"
          style={{ minHeight: "calc(100vh - 46px)" }}
          key={location.pathname}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
