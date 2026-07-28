import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  const { email, secret } = await req.json();
  if (secret !== Deno.env.get("CRON_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) return new Response(JSON.stringify({ error: listErr.message }), { status: 500 });
  const user = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return new Response(JSON.stringify({ error: "not found" }), { status: 404 });
  const { data, error } = await supabase.auth.admin.updateUserById(user.id, { email_confirm: true });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true, id: user.id, email: data.user?.email, confirmed_at: data.user?.email_confirmed_at }), {
    headers: { "content-type": "application/json" },
  });
});
