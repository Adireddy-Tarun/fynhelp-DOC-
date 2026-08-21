import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "@/lib/router-compat";
import { LayoutGrid, Users, UserPlus, Bell, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCAPortal } from "@/hooks/useCAPortal";
import { CA } from "./portalUi";

const LINKS = [
  { label: "Portfolio", path: "/ca/dashboard", icon: LayoutGrid },
  { label: "Clients", path: "/ca/clients", icon: Users },
  { label: "Add Client", path: "/ca/clients/add", icon: UserPlus },
  { label: "Notifications", path: "/ca/notifications", icon: Bell },
  { label: "Settings", path: "/ca/settings", icon: Settings },
];

export default function CASidebar() {
  const { firmId, firmName, caName } = useCAPortal();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!firmId) return;
    let cancelled = false;
    (async () => {
      const { count } = await supabase
        .from("ca_notifications")
        .select("id", { count: "exact", head: true })
        .eq("ca_firm_id", firmId)
        .eq("is_read", false);
      if (!cancelled) setUnread(count ?? 0);
    })();
    return () => { cancelled = true; };
  }, [firmId]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/ca/login", { replace: true });
  };

  return (
    <aside
      className="fixed inset-y-0 left-0 flex flex-col z-40"
      style={{ width: 236, background: "#FFFFFF", borderRight: `0.5px solid ${CA.line}` }}
    >
      <div style={{ padding: "22px 20px 16px" }}>
        <div style={{ fontFamily: CA.serif, fontSize: 20, fontWeight: 700, color: CA.ink }}>
          Fyn<span style={{ color: CA.teal }}>Help</span>
        </div>
        <div style={{ fontFamily: CA.sans, fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: CA.teal, marginTop: 3 }}>
          CA Portal
        </div>
        <div style={{ fontFamily: CA.sans, fontSize: 12.5, color: CA.muted, marginTop: 12 }}>
          {firmName ?? "—"}
        </div>
        {caName && <div style={{ fontFamily: CA.sans, fontSize: 11.5, color: CA.faint }}>{caName}</div>}
      </div>

      <nav style={{ padding: "6px 12px", flex: 1 }}>
        {LINKS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/ca/clients"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 9,
              marginBottom: 2,
              fontFamily: CA.sans,
              fontSize: 13.5,
              fontWeight: isActive ? 600 : 500,
              color: isActive ? CA.teal : CA.ink,
              background: isActive ? CA.tealSoft : "transparent",
              textDecoration: "none",
            })}
          >
            <Icon size={16} />
            <span style={{ flex: 1 }}>{label}</span>
            {label === "Notifications" && unread > 0 && (
              <span
                style={{
                  fontFamily: CA.mono, fontSize: 10.5, fontWeight: 700, color: "#fff",
                  background: CA.teal, borderRadius: 999, padding: "1px 7px",
                }}
              >
                {unread}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={signOut}
        style={{
          display: "flex", alignItems: "center", gap: 10, margin: "0 12px 18px",
          padding: "9px 12px", borderRadius: 9, background: "transparent", border: "none",
          fontFamily: CA.sans, fontSize: 13, color: CA.muted, cursor: "pointer",
        }}
      >
        <LogOut size={15} /> Sign out
      </button>
    </aside>
  );
}
