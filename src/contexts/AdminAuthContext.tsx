import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabaseExternal } from "@/integrations/supabase/external";

export type AdminRole = "super_admin" | "ops_admin" | "support_agent" | "analyst" | "user";

const ADMIN_ROLES: AdminRole[] = ["super_admin", "ops_admin", "support_agent", "analyst"];

interface AdminAuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  roles: AdminRole[];
  primaryRole: AdminRole | null;
  hasRole: (...r: AdminRole[]) => boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const ROLE_RANK: Record<AdminRole, number> = {
  super_admin: 5, ops_admin: 4, support_agent: 3, analyst: 2, user: 1,
};

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null, loading: true, isAdmin: false, roles: [], primaryRole: null,
  hasRole: () => false, refresh: async () => {}, signOut: async () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoles = useCallback(async (uid: string | null) => {
    if (!uid) { setRoles([]); return; }
    const { data, error } = await supabaseExternal
      .from("user_roles")
      .select("app_role")
      .eq("user_id", uid);
    if (error) {
      console.warn("[admin auth] role fetch failed", error.message);
      setRoles([]);
      return;
    }
    const r = (data ?? [])
      .map((row: { app_role: string }) => row.app_role as AdminRole)
      .filter((x) => x in ROLE_RANK);
    setRoles(r);
  }, []);

  const refresh = useCallback(async () => {
    const { data: { user: u } } = await supabaseExternal.auth.getUser();
    setUser(u ?? null);
    await fetchRoles(u?.id ?? null);
    setLoading(false);
  }, [fetchRoles]);

  useEffect(() => {
    const { data: { subscription } } = supabaseExternal.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        // Defer to avoid deadlocks in the auth callback.
        setTimeout(() => {
          fetchRoles(u?.id ?? null).finally(() => setLoading(false));
        }, 0);
      }
    );

    supabaseExternal.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      fetchRoles(u?.id ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [fetchRoles]);

  const primaryRole = roles.length
    ? roles.reduce((a, b) => (ROLE_RANK[a] >= ROLE_RANK[b] ? a : b))
    : null;

  const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));

  const hasRole = (...needed: AdminRole[]) =>
    needed.some((n) => roles.includes(n)) || roles.includes("super_admin");

  const signOut = async () => {
    await supabaseExternal.auth.signOut();
    setUser(null);
    setRoles([]);
  };

  return (
    <AdminAuthContext.Provider
      value={{ user, loading, isAdmin, roles, primaryRole, hasRole, refresh, signOut }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
