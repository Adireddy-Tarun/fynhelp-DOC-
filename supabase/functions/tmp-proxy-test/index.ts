import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async () => {
  const url = Deno.env.get("SUPABASE_URL")!;
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const anon = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!);

  const email = "blogadmin@fynhelp.com";
  // give blogadmin a profile pointing at the target business for verification
  await admin.from("profiles").upsert(
    { user_id: "884645b6-e103-474c-a573-f4eb60170002", business_id: "4b30494f-4c30-4a74-a6bb-6bf56493a97d" },
    { onConflict: "user_id" },
  );

  const { data: signIn, error: signErr } = await anon.auth.signInWithPassword({
    email,
    password: "FynBlog2026!",
  });
  if (signErr) return new Response(JSON.stringify({ signErr: signErr.message }), { status: 200 });
  const token = signIn.session!.access_token;

  const results: Record<string, unknown> = {};
  for (const t of ["liquidity_metrics", "revenue_metrics", "bank_transactions"]) {
    const r = await fetch(`${url}/functions/v1/external-data-proxy`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ table: t, business_id: "4b30494f-4c30-4a74-a6bb-6bf56493a97d", limit: t === "bank_transactions" ? 5 : undefined }),
    });
    const j = await r.json();
    results[t] = { status: r.status, success: j.success, rows: Array.isArray(j.data) ? j.data.length : null, error: j.error ?? null };
  }
  // negative test: other business
  const rNeg = await fetch(`${url}/functions/v1/external-data-proxy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ table: "bank_transactions", business_id: "a65d4d45-4927-4e65-9d2e-d9354acc9312" }),
  });
  results["negative_other_business"] = { status: rNeg.status, body: await rNeg.json() };
  // negative test: disallowed table
  const rTbl = await fetch(`${url}/functions/v1/external-data-proxy`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ table: "profiles", business_id: "4b30494f-4c30-4a74-a6bb-6bf56493a97d" }),
  });
  results["negative_bad_table"] = { status: rTbl.status, body: await rTbl.json() };

  return new Response(JSON.stringify(results, null, 2), { headers: { "Content-Type": "application/json" } });
});
