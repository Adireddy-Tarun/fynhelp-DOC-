import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async () => {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await admin.auth.admin.createUser({
    email: "blogadmin@fynhelp.com",
    password: "FynBlog2026!",
    email_confirm: true,
  });
  return new Response(
    JSON.stringify({ id: data?.user?.id ?? null, error: error?.message ?? null }),
    { headers: { "Content-Type": "application/json" } },
  );
});
