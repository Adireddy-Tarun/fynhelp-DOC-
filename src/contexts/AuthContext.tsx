import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  businessId: string | null;
  profile: { full_name: string; language_preference: string; role: string } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, businessId: null, profile: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchProfile(session.user.id), 0);
      } else {
        setBusinessId(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // ──────────────────────────────────────────────────────────────────────
    // "Remember me" enforcement
    // ──────────────────────────────────────────────────────────────────────
    // Goal: when the user signs in WITHOUT "Remember me", their session must
    // NOT survive a browser close. It MUST survive a refresh / in-tab nav.
    //
    // Detection strategy (defence-in-depth, three independent signals):
    //   1. sessionStorage marker `fyn.tabAlive` — present for the lifetime of
    //      the tab, including refreshes. Absent on a brand new tab / after
    //      browser close.
    //   2. Performance Navigation API — `type === "reload"` is a definitive
    //      signal that this load is a refresh (so we keep the session even
    //      if sessionStorage was wiped, e.g. by extensions).
    //   3. Heartbeat timestamp `fyn.lastSeen` in localStorage — updated every
    //      few seconds while the tab is open. If it's older than the
    //      stale-threshold on cold start AND remember-me is off, we force a
    //      sign-out as a safe fallback (covers cases where both 1 and 2
    //      misbehave, e.g. private browsing edge cases or BFCache quirks).
    // ──────────────────────────────────────────────────────────────────────
    const SESSION_ONLY_KEY = "fyn.sessionOnly";
    const TAB_ALIVE_KEY = "fyn.tabAlive";
    const LAST_SEEN_KEY = "fyn.lastSeen";
    const STALE_THRESHOLD_MS = 90 * 1000; // 90s without heartbeat ⇒ cold start
    const HEARTBEAT_INTERVAL_MS = 15 * 1000;

    const isReloadNavigation = (): boolean => {
      try {
        const entries = performance.getEntriesByType?.("navigation") as
          | PerformanceNavigationTiming[]
          | undefined;
        if (entries && entries.length > 0) {
          return entries[0].type === "reload";
        }
        // Legacy fallback (deprecated but still present in some browsers)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const legacy = (performance as any).navigation;
        if (legacy && typeof legacy.type === "number") {
          return legacy.type === 1; // TYPE_RELOAD
        }
      } catch {
        /* ignore */
      }
      return false;
    };

    const isFreshBrowserSession = (): boolean => {
      let tabAlive = false;
      let lastSeenFresh = false;
      try {
        tabAlive = sessionStorage.getItem(TAB_ALIVE_KEY) === "1";
        const lastSeenRaw = localStorage.getItem(LAST_SEEN_KEY);
        if (lastSeenRaw) {
          const delta = Date.now() - Number(lastSeenRaw);
          lastSeenFresh = Number.isFinite(delta) && delta >= 0 && delta < STALE_THRESHOLD_MS;
        }
      } catch {
        /* storage may be unavailable in private mode */
      }
      // Treat as a continuation of the same browser session if ANY trusted
      // signal says so. Otherwise it's a fresh start (browser close & reopen).
      const continuation = tabAlive || isReloadNavigation() || lastSeenFresh;
      return !continuation;
    };

    const enforceRememberMe = async () => {
      let sessionOnly = false;
      try {
        sessionOnly = localStorage.getItem(SESSION_ONLY_KEY) === "1";
      } catch {
        /* ignore */
      }

      if (sessionOnly && isFreshBrowserSession()) {
        // Safe fallback: sign out before we surface any stale session to the app.
        try {
          await supabase.auth.signOut();
        } catch {
          /* ignore — proceed to clear local hints regardless */
        }
        try {
          localStorage.removeItem(SESSION_ONLY_KEY);
          localStorage.removeItem(LAST_SEEN_KEY);
        } catch {
          /* ignore */
        }
      }

      // Mark this tab as alive and start heartbeat.
      try {
        sessionStorage.setItem(TAB_ALIVE_KEY, "1");
        localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    };

    enforceRememberMe();

    // Heartbeat — keeps `fyn.lastSeen` fresh so a refresh or short navigation
    // is never mistaken for a browser-close.
    const heartbeat = () => {
      try {
        localStorage.setItem(LAST_SEEN_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
    };
    const heartbeatTimer = window.setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") heartbeat();
    };
    const onPageHide = () => heartbeat();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);

    return () => {
      subscription.unsubscribe();
      window.clearInterval(heartbeatTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("business_id, full_name, language_preference, role")
      .eq("user_id", userId)
      .maybeSingle();

    if (data) {
      setBusinessId(data.business_id);
      setProfile({
        full_name: data.full_name || "",
        language_preference: data.language_preference || "en",
        role: data.role || "owner",
      });
    }
    setLoading(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, businessId, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
