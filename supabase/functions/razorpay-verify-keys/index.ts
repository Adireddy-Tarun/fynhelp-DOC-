import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const RZP_BASE = "https://api.razorpay.com/v1";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function basicAuth(keyId: string, keySecret: string) {
  return "Basic " + btoa(`${keyId}:${keySecret}`);
}

function randomSecret(len = 40) {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsRes, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsRes?.claims) return json({ error: "Unauthorized" }, 401);
    const userId = claimsRes.claims.sub as string;

    const body = await req.json().catch(() => ({}));
    const organization_id = String(body.organization_id ?? "").trim();
    const key_id = String(body.key_id ?? "").trim();
    const key_secret = String(body.key_secret ?? "");

    if (!organization_id || !key_id || !key_secret) {
      return json({ error: "organization_id, key_id and key_secret are required" }, 400);
    }
    if (!/^rzp_(live|test)_[A-Za-z0-9]+$/.test(key_id)) {
      return json({ error: "Invalid key_id. Must start with rzp_live_ or rzp_test_" }, 400);
    }

    const admin = createClient(SUPABASE_URL, SERVICE);

    // Verify caller owns this organization (business_id on their profile)
    const { data: profile, error: profErr } = await admin
      .from("profiles")
      .select("business_id, org_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (profErr) return json({ error: "Failed to load profile" }, 500);
    const ownedOrg = profile?.business_id ?? profile?.org_id ?? null;
    if (!ownedOrg || String(ownedOrg) !== organization_id) {
      return json({ error: "You do not own this organization" }, 403);
    }

    // Verify keys with Razorpay
    const verifyRes = await fetch(`${RZP_BASE}/payments?count=1`, {
      method: "GET",
      headers: { Authorization: basicAuth(key_id, key_secret) },
    });

    if (verifyRes.status === 401) {
      return json({ error: "Razorpay rejected these keys. Double-check the Key ID and Key Secret." }, 400);
    }
    if (!verifyRes.ok) {
      const text = await verifyRes.text();
      return json({ error: `Razorpay verification failed (${verifyRes.status}): ${text.slice(0, 200)}` }, 400);
    }
    // Drain body
    await verifyRes.text();

    const is_live = key_id.startsWith("rzp_live_");

    // Auto-register webhook
    const webhookSecret = randomSecret(32);
    const webhookUrl =
      `${SUPABASE_URL}/functions/v1/razorpay-webhook?org=${encodeURIComponent(organization_id)}`;
    let webhook_id: string | null = null;
    let webhook_warning: string | null = null;

    try {
      const whRes = await fetch(`${RZP_BASE}/webhooks`, {
        method: "POST",
        headers: {
          Authorization: basicAuth(key_id, key_secret),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: webhookUrl,
          alert_email: undefined,
          secret: webhookSecret,
          events: [
            "payment.captured",
            "payment.failed",
            "refund.created",
            "refund.processed",
            "settlement.processed",
            "order.paid",
          ],
        }),
      });
      const whText = await whRes.text();
      if (whRes.ok) {
        try { webhook_id = JSON.parse(whText)?.id ?? null; } catch { /* ignore */ }
      } else {
        webhook_warning =
          `Keys verified but webhook auto-registration failed (${whRes.status}). ` +
          `Add this URL manually in Razorpay Dashboard → Settings → Webhooks: ${webhookUrl}`;
      }
    } catch (_e) {
      webhook_warning =
        "Keys verified but webhook auto-registration failed. " +
        `Add this URL manually in Razorpay Dashboard → Settings → Webhooks: ${webhookUrl}`;
    }

    const nowIso = new Date().toISOString();
    const metadata = {
      key_id,
      key_secret, // stored server-side only; never returned to client
      webhook_id,
      webhook_secret: webhook_id ? webhookSecret : null,
      webhook_url: webhookUrl,
      is_live,
      mode: is_live ? "live" : "test",
      verified_at: nowIso,
      connected_at: nowIso,
      webhook_warning,
    };

    const { error: upsertErr } = await admin
      .from("integrations")
      .upsert(
        {
          organization_id,
          provider: "razorpay",
          status: "active",
          access_token: null,
          metadata,
          updated_at: nowIso,
        },
        { onConflict: "organization_id,provider" },
      );
    if (upsertErr) return json({ error: `Failed to save integration: ${upsertErr.message}` }, 500);

    // Response never contains key_secret or webhook_secret
    return json({
      success: true,
      provider: "razorpay",
      key_id,
      mode: is_live ? "live" : "test",
      webhook_registered: !!webhook_id,
      webhook_warning,
      webhook_url: webhookUrl,
    });
  } catch (e) {
    return json({ error: (e as Error).message ?? "Unexpected error" }, 500);
  }
});
