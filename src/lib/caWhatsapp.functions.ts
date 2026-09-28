/**
 * WhatsApp intake — authenticated server functions. Secrets are encrypted before storage.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const activateWhatsApp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { connectionId: string; phoneNumberId: string; accessToken: string; appSecret: string }) => {
    if (!input?.connectionId) throw new Error("Connection is required");
    if (!/^\d{5,30}$/.test(input.phoneNumberId?.trim() ?? "")) throw new Error("Phone number ID should be the numeric ID shown in Meta");
    if ((input.accessToken?.trim().length ?? 0) < 20) throw new Error("Paste the full access token from Meta");
    if ((input.appSecret?.trim().length ?? 0) < 16) throw new Error("Paste the app secret from Meta");
    return input;
  })
  .handler(async ({ data, context }) => {
    // RLS limits this read to members of the connection's firm.
    const { data: conn, error } = await context.supabase
      .from("ca_whatsapp_connections")
      .select("id")
      .eq("id", data.connectionId)
      .maybeSingle();
    if (error || !conn) throw new Error("You do not have access to this WhatsApp connection");

    const check = await fetch(`https://graph.facebook.com/v19.0/${data.phoneNumberId.trim()}?fields=display_phone_number,verified_name`, {
      headers: { Authorization: `Bearer ${data.accessToken.trim()}` },
    });
    const checkBody = await check.text();
    if (!check.ok) throw new Error(`Meta rejected these details [${check.status}]: ${checkBody.slice(0, 200)}`);
    const info = JSON.parse(checkBody) as { verified_name?: string };

    const { encryptToken } = await import("@/lib/caGmail.server");
    const { error: upErr } = await context.supabase
      .from("ca_whatsapp_connections")
      .update({
        phone_number_id: data.phoneNumberId.trim(),
        access_token_enc: await encryptToken(data.accessToken.trim()),
        app_secret_enc: await encryptToken(data.appSecret.trim()),
        display_name: info.verified_name ?? null,
        is_active: true,
        error_message: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.connectionId);
    if (upErr) throw new Error(upErr.message);
    console.log("[fyn:whatsapp] connection activated", data.connectionId);
    return { ok: true, displayName: info.verified_name ?? null };
  });
