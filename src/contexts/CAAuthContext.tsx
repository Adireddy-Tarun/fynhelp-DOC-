import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface CAFirm {
  id: string;
  firm_name: string;
  membership_number: string | null;
  email: string | null;
  city: string | null;
  state: string | null;
  is_verified: boolean;
  plan_type: string;
  max_clients: number;
  logo_url: string | null;
}

interface CAAuthContextType {
  user: User | null;
  session: Session | null;
  caFirm: CAFirm | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshFirm: () => Promise<void>;
}

const CAAuthContext = createContext<CAAuthContextType>({
  user: null, session: null, caFirm: null, loading: true,
  signOut: async () => {}, refreshFirm: async () => {},
});

export const useCAAuth = () => useContext(CAAuthContext);

export const CAAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [caFirm, setCAFirm] = useState<CAFirm | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFirm = async (uid: string) => {
    const { data } = await supabase
      .from("ca_firms")
      .select("id, firm_name, membership_number, email, city, state, is_verified, plan_type, max_clients, logo_url")
      .eq("user_id", uid)
      .maybeSingle();
    setCAFirm(data as CAFirm | null);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        setTimeout(() => fetchFirm(sess.user.id), 0);
      } else {
        setCAFirm(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) fetchFirm(sess.user.id);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };
  const refreshFirm = async () => { if (user) await fetchFirm(user.id); };

  return (
    <CAAuthContext.Provider value={{ user, session, caFirm, loading, signOut, refreshFirm }}>
      {children}
    </CAAuthContext.Provider>
  );
};
