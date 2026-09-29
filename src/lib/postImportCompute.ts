// ─── src/lib/postImportCompute.ts ───────────────────────────────────────────
// After any successful import, recompute stored intelligence metrics for the
// business immediately (same computation the nightly job uses), so dashboards
// reflect the new transactions without waiting for the 2 AM cron.
// A failed recompute never fails the import — it only logs.
import { supabase } from "@/integrations/supabase/client";

export async function recomputeIntelligence(businessId: string): Promise<boolean> {
  if (!businessId) return false;
  const jobs: Array<[string, Promise<{ error: { message: string } | null }>]> = [
    ["compute-liquidity", supabase.functions.invoke("compute-liquidity", { body: { business_id: businessId } })],
    ["compute-revenue", supabase.functions.invoke("compute-revenue", { body: { business_id: businessId } })],
  ];
  let ok = true;
  await Promise.all(
    jobs.map(async ([name, p]) => {
      try {
        const { error } = await p;
        if (error) throw new Error(error.message);
      } catch (e) {
        ok = false;
        console.error(`[fyn:import] recompute failed for ${businessId}`, name, e);
      }
    }),
  );
  return ok;
}
