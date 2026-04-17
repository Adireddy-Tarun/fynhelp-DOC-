import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCAAuth } from "@/contexts/CAAuthContext";

export interface CAClientRow {
  id: string; // ca_client_access.id
  business_id: string;
  name: string;
  industry: string;
  turnover: string;
  health: number;
  cash: "Safe" | "Watch" | "Critical";
  filing: number; // days to next filing
  itc: string;
  report: string;
  notes: string | null;
  granted_at: string | null;
  gstin: string | null;
}

const fmtTurnover = (range: string | null) => range || "—";
const turnoverToHealth = (range: string | null) => {
  // BACKEND: replace with real health score from analytics
  if (!range) return 60;
  if (range.includes("25")) return 78;
  if (range.includes("10")) return 65;
  if (range.includes("5")) return 50;
  return 45;
};
const planToCash = (plan: string | null): "Safe" | "Watch" | "Critical" => {
  // BACKEND: derive from runway/cash flow data
  if (plan === "growth" || plan === "scale") return "Safe";
  if (plan === "starter") return "Watch";
  return "Critical";
};
const reportLabel = (granted_at: string | null) => {
  if (!granted_at) return "Never";
  const days = Math.floor((Date.now() - new Date(granted_at).getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return "Never";
};

export function useCAClients() {
  const { caFirm } = useCAAuth();
  const [clients, setClients] = useState<CAClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!caFirm?.id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Step 1: get access rows
      const { data: access, error: e1 } = await supabase
        .from("ca_client_access")
        .select("id, business_id, notes, granted_at, is_active")
        .eq("ca_firm_id", caFirm.id)
        .eq("is_active", true);

      if (e1) {
        if (!cancelled) { setError(e1.message); setLoading(false); }
        return;
      }
      const ids = (access ?? []).map((a) => a.business_id);
      if (ids.length === 0) {
        if (!cancelled) { setClients([]); setLoading(false); }
        return;
      }
      // Step 2: get businesses (RLS may filter — relies on additional policy)
      const { data: biz, error: e2 } = await supabase
        .from("businesses")
        .select("id, business_name, industry, turnover_range, plan, gstin")
        .in("id", ids);

      if (e2) {
        if (!cancelled) { setError(e2.message); setLoading(false); }
        return;
      }

      const bizMap = new Map((biz ?? []).map((b) => [b.id, b]));
      const rows: CAClientRow[] = (access ?? []).map((a) => {
        const b = bizMap.get(a.business_id);
        return {
          id: a.id,
          business_id: a.business_id,
          name: b?.business_name ?? "Pending access",
          industry: b?.industry ?? "—",
          turnover: fmtTurnover(b?.turnover_range ?? null),
          health: turnoverToHealth(b?.turnover_range ?? null),
          cash: planToCash(b?.plan ?? null),
          filing: Math.floor(Math.random() * 14) + 1, // BACKEND: join compliance_events
          itc: "₹—", // BACKEND: join gst_itc_lines
          report: reportLabel(a.granted_at),
          notes: a.notes,
          granted_at: a.granted_at,
          gstin: (b as any)?.gstin ?? null,
        };
      });
      if (!cancelled) {
        setClients(rows);
        setError(null);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [caFirm?.id]);

  return { clients, loading, error };
}
