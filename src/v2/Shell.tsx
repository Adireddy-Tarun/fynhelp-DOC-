import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutGrid, Users, FileText, ListChecks, AlertTriangle, Send, BarChart3, Settings, Menu, X,
} from "lucide-react";
import { V, V2_STYLES } from "./ui";
import { V2StoreProvider } from "./store";

const NAV = [
  { to: "/v2", label: "Portfolio", icon: LayoutGrid, exact: true },
  { to: "/v2/clients", label: "Clients", icon: Users },
  { to: "/v2/documents", label: "Documents", icon: FileText },
  { to: "/v2/review", label: "Review Queue", icon: ListChecks },
  { to: "/v2/exceptions", label: "Exception Queue", icon: AlertTriangle },
  { to: "/v2/chaser", label: "Chaser", icon: Send },
  { to: "/v2/reports", label: "MIS and Reports", icon: BarChart3 },
  { to: "/v2/settings", label: "Settings", icon: Settings },
] as const;

const TITLES: Record<string, string> = {
  "/v2": "Portfolio",
  "/v2/clients": "Clients",
  "/v2/documents": "Documents",
  "/v2/review": "Review Queue",
  "/v2/exceptions": "Exception Queue",
  "/v2/chaser": "Chaser",
  "/v2/reports": "MIS and Reports",
  "/v2/settings": "Settings",
};

export default function V2Shell() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/v2/clients/") ? "Client workspace" : pathname.startsWith("/v2/reports/") ? "MIS report" : "FynHelp");

  return (
    <V2StoreProvider>
      <style>{V2_STYLES}</style>
      <div className="v2" style={{ minHeight: "100vh", display: "flex" }}>
        {open && (
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(20,20,20,.3)", zIndex: 55 }} />
        )}
        <aside
          className={`v2-sidebar${open ? " open" : ""}`}
          style={{
            width: 244, flex: "0 0 244px", background: V.card, borderRight: `1px solid ${V.line}`,
            padding: "22px 14px", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
            transition: "transform .22s ease",
          }}
        >
          <div style={{ padding: "0 8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.03em" }}>FynHelp</div>
              <div style={{ fontSize: 10.5, letterSpacing: ".16em", textTransform: "uppercase", color: V.muted, marginTop: 3 }}>Practice OS</div>
            </div>
            <button className="v2-btn v2-btn-quiet" style={{ display: "none" }} onClick={() => setOpen(false)}><X size={15} /></button>
          </div>

          <nav className="v2-nav" style={{ flex: 1, overflowY: "auto" }}>
            {NAV.map(({ to, label, icon: Icon, ...rest }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                activeOptions={{ exact: "exact" in rest ? true : false }}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          <div style={{ borderTop: `1px solid ${V.line}`, paddingTop: 14, fontSize: 11.5, color: V.muted, padding: "14px 8px 0" }}>
            Version 2 preview
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <header
            style={{
              position: "sticky", top: 0, zIndex: 40, background: "rgba(248,247,244,.86)", backdropFilter: "blur(10px)",
              borderBottom: `1px solid ${V.line}`, padding: "14px 24px",
              display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", alignItems: "center", gap: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <button className="v2-btn v2-btn-ghost v2-mobile-only" onClick={() => setOpen(true)} style={{ padding: "8px 10px" }}>
                <Menu size={16} />
              </button>
              <h2 className="truncate" style={{ fontSize: 16, fontWeight: 600 }}>{title}</h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right", lineHeight: 1.25 }} className="v2-hide-sm">
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>Prajwal Vakode</div>
                <div style={{ fontSize: 11, color: V.muted }}>Partner</div>
              </div>
              <div style={{ width: 34, height: 34, borderRadius: 999, background: V.beige, display: "grid", placeItems: "center", fontSize: 12.5, fontWeight: 700 }}>PV</div>
            </div>
          </header>

          <main style={{ padding: 24, flex: 1, maxWidth: 1280, width: "100%" }}>
            <Outlet />
          </main>
        </div>
      </div>
      <style>{`
        .v2-mobile-only { display:none; }
        @media (max-width:900px){ .v2-mobile-only { display:inline-flex; } }
        @media (max-width:560px){ .v2-hide-sm { display:none; } }
      `}</style>
    </V2StoreProvider>
  );
}
