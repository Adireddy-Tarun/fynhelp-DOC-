import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

Deno.serve(async () => {
  const supa = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const { data, error } = await supa.auth.admin.createUser({
    email: "support@fynhelp.com",
    password: "fynhelpintern2026",
    email_confirm: true,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = data.user.id;

  await supa.from("user_roles").insert({ user_id: userId, role: "intern" });

  return new Response(
    JSON.stringify({ success: true, user_id: userId }),
    { headers: { "Content-Type": "application/json" } }
  );
});
