import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authErr } = await supabase.auth.getClaims(token);
    if (authErr || !claims?.claims) return json({ error: "Unauthorized" }, 401);

    const { data: isAdmin } = await supabase.rpc("is_admin_user");
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const body = await req.json();
    const emails: string[] = Array.isArray(body.emails) ? body.emails : [];
    const subject = String(body.subject ?? "").trim();
    const html = String(body.body ?? "").trim();
    if (!emails.length || !subject || !html) {
      return json({ error: "emails, subject, and body are required" }, 400);
    }
    if (!RESEND_API_KEY) return json({ error: "Email service not configured" }, 500);

    let sent = 0;
    let failed = 0;
    for (const to of emails) {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "FYNHelp <noreply@fynhelp.com>",
          to,
          subject,
          html,
        }),
      });
      if (r.ok) sent++;
      else failed++;
    }
    return json({ sent, failed, total: emails.length });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
