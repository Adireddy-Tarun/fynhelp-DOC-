import { ReactNode, useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAdminEmail } from "@/lib/adminEmails";

/**
 * Gate for internal FynHelp admin tooling.
 * Only the fixed admin email allowlist can pass. No bypass.
 */
export default function AdminGuard({ children }: { children?: ReactNode }) {
  const [state, setState] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setState(isAdminEmail(data.user?.email) ? "allowed" : "denied");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <div
        className="min-h-screen grid place-items-center"
        style={{ background: "#F8F7F4", color: "#1A1A1A", fontFamily: "Inter, sans-serif" }}
      >
        <span className="text-sm">Checking admin access…</span>
      </div>
    );
  }

  if (state === "denied") return <Navigate to="/" replace />;

  return <>{children ?? <Outlet />}</>;
}
