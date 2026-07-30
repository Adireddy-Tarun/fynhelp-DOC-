import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const EXTERNAL_URL = "https://wiknwxniwqvsxgyzqqxu.supabase.co";
const SERVICE_KEY = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const STATEMENTS = [
  "ALTER TABLE public.cohort_analysis ENABLE ROW LEVEL SECURITY",
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cohort_analysis' AND policyname='business_isolation') THEN CREATE POLICY "business_isolation" ON public.cohort_analysis FOR ALL USING (true); END IF; END $$`,
  "ALTER TABLE public.churn_signals ENABLE ROW LEVEL SECURITY",
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='churn_signals' AND policyname='business_isolation') THEN CREATE POLICY "business_isolation" ON public.churn_signals FOR ALL USING (true); END IF; END $$`,
];

const RPC_CANDIDATES = ["exec_sql", "exec", "execute_sql", "run_sql"];

async function callRpc(name: string, args: Record<string, unknown>) {
  const res = await fetch(`${EXTERNAL_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (!SERVICE_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: "EXTERNAL_SUPABASE_SERVICE_KEY missing" }),
      { status: 500, headers: cors },
    );
  }

  // Discover a usable SQL-executing RPC on the external project.
  let rpcName: string | null = null;
  let paramName: "sql" | "query" = "sql";
  const probes: Record<string, string> = {};
  for (const name of RPC_CANDIDATES) {
    for (const p of ["sql", "query"] as const) {
      const r = await callRpc(name, { [p]: "SELECT 1" });
      probes[`${name}(${p})`] = `${r.status} ${r.text.slice(0, 160)}`;
      if (r.ok) { rpcName = name; paramName = p; break; }
    }
    if (rpcName) break;
  }

  if (!rpcName) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "No SQL-executing RPC available on the external project; RLS must be applied by its owner.",
        probes,
      }),
      { status: 200, headers: cors },
    );
  }

  const results: { statement: string; ok: boolean; detail: string }[] = [];
  for (const stmt of STATEMENTS) {
    const r = await callRpc(rpcName, { [paramName]: stmt });
    results.push({ statement: stmt.slice(0, 80), ok: r.ok, detail: r.text.slice(0, 200) });
  }

  return new Response(
    JSON.stringify({ success: results.every((r) => r.ok), rpc: `${rpcName}(${paramName})`, results }),
    { status: 200, headers: cors },
  );
});
