import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type AdminRole = "super_admin" | "ops_admin" | "support_agent" | "analyst" | "admin";

interface AdminAuthContextType {
  loading: boolean;
  isAdmin: boolean;
  roles: AdminRole[];
  primaryRole: AdminRole | null;
  hasRole: (...r: AdminRole[]) => boolean;
  refresh: () => Promise<void>;
}

const ROLE_RANK: Record<AdminRole, number> = {
  super_admin: 5, admin: 4, ops_admin: 3, support_agent: 2, analyst: 1,
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  loading: true, isAdmin: false, roles: [], primaryRole: null,
  hasRole: () => false, refresh: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setRoles([]); setLoading(false); return; }
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id);
    const r = (data ?? [])
      .map((row) => row.role as AdminRole)
      .filter((x) => x in ROLE_RANK);
    setRoles(r);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    refresh();
  }, [authLoading, refresh]);

  const primaryRole = roles.length
    ? roles.reduce((a, b) => (ROLE_RANK[a] >= ROLE_RANK[b] ? a : b))
    : null;

  const hasRole = (...needed: AdminRole[]) =>
    needed.some((n) => roles.includes(n)) ||
    roles.includes("super_admin"); // super_admin always passes

  return (
    <AdminAuthContext.Provider
      value={{ loading, isAdmin: roles.length > 0, roles, primaryRole, hasRole, refresh }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
