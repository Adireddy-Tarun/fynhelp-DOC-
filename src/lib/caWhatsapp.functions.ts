/**
 * WhatsApp intake via Meta Embedded Signup — authenticated server functions.
 * Tokens are encrypted before storage; secrets and raw Meta responses never leave the server.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GRAPH = "https://graph.facebook.com/v21.0";

type Ctx = { supabase: any; userId: string };

async function assertPartnerOrManager(ctx: Ctx, firmId: string) {
  const { data } = await ctx.supabase
    .from("ca_firm_members")
    .select("role")
    .eq("ca_firm_id", firmId)
    .eq("user_id", ctx.userId)
    .eq("status", "active")
    .maybeSingle();
  if (!data || !["partner", "manager"].includes(String(data.role))) {
    throw new Error("Only partners and managers can connect WhatsApp");
  }
}

async function metaCall(step: string, url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  let body: any = null;
  try { body = await res.json(); } catch { body = null; }
  if (!res.ok || body?.error) {
    const err = body?.error ?? {};
    console.error(`[fyn:whatsapp] meta ${step} failed — status ${res.status} code ${err.code ?? "?"} type ${err.type ?? "?"}`);
    const e = new Error(`Meta ${step} failed`) as Error & { metaMessage?: string };
    e.metaMessage = String(err.message ?? "");
    throw e;
  }
  return body;
}

function normalisePhone(display: string): string {
  const cleaned = display.replace(/[\s\-()]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
}

export const getWhatsappSignupConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const appId = process.env["META_APP_ID"] ?? "";
    const configId = process.env["META_ES_CONFIG_ID"] ?? "";
    const configured = Boolean(
      appId && configId && process.env["META_APP_SECRET"] && process.env["META_WEBHOOK_VERIFY_TOKEN"],
    );
    return { appId: configured ? appId : "", configId: configured ? configId : "", configured };
  });

const signupSchema = z.object({
  code: z.string().min(10),
  waba_id: z.string().regex(/^\d+$/),
  phone_number_id: z.string().regex(/^\d+$/),
  firm_id: z.string().uuid(),
  is_coexistence: z.boolean().default(false),
});

export const completeWhatsappSignup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: z.input<typeof signupSchema>) => signupSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertPartnerOrManager(context as Ctx, data.firm_id);
    const appId = process.env["META_APP_ID"];
    const appSecret = process.env["META_APP_SECRET"];
    if (!appId || !appSecret) throw new Error("WhatsApp connect is not configured yet");

    try {
      const tokenRes = await metaCall(
        "token exchange",
        `${GRAPH}/oauth/access_token?client_id=${encodeURIComponent(appId)}&client_secret=${encodeURIComponent(appSecret)}&code=${encodeURIComponent(data.code)}`,
      );
      const token: string | undefined = tokenRes?.access_token;
      if (!token) throw new Error("Meta did not return a token. Please try again.");
      const auth = { Authorization: `Bearer ${token}` };

      await metaCall("subscribe", `${GRAPH}/${data.waba_id}/subscribed_apps`, { method: "POST", headers: auth });

      const info = await metaCall(
        "number lookup",
        `${GRAPH}/${data.phone_number_id}?fields=display_phone_number,verified_name,code_verification_status`,
        { headers: auth },
      );
      const phone = normalisePhone(String(info?.display_phone_number ?? ""));
      const displayName: string | null = info?.verified_name ?? null;

      if (!data.is_coexistence) {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        const pin = String(buf[0] % 1_000_000).padStart(6, "0");
        try {
          await metaCall("register", `${GRAPH}/${data.phone_number_id}/register`, {
            method: "POST",
            headers: { ...auth, "Content-Type": "application/json" },
            body: JSON.stringify({ messaging_product: "whatsapp", pin }),
          });
        } catch (e) {
          const msg = (e as { metaMessage?: string }).metaMessage ?? "";
          if (!/already registered/i.test(msg)) throw e;
        }
      }

      const { encryptToken } = await import("@/lib/caGmail.server");
      const { error } = await context.supabase
        .from("ca_whatsapp_connections")
        .upsert(
          {
            ca_firm_id: data.firm_id,
            phone_number: phone,
            phone_number_id: data.phone_number_id,
            waba_id: data.waba_id,
            display_name: displayName,
            is_coexistence: data.is_coexistence,
            access_token_enc: await encryptToken(token),
            is_active: true,
            is_verified: true,
            error_message: null,
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "ca_firm_id,phone_number" },
        );
      if (error) {
        console.error("[fyn:whatsapp] connection save failed:", error.code);
        throw new Error("Could not save the WhatsApp connection. Please try again.");
      }

      void context.supabase.from("ca_brain_events").insert({
        ca_firm_id: data.firm_id,
        business_id: null,
        event_type: "whatsapp_connected",
        payload: { phone_number: phone, waba_id: data.waba_id, is_coexistence: data.is_coexistence },
      } as never).then(undefined, () => undefined);

      console.log(`[fyn:whatsapp] signup complete — firm ${data.firm_id} phone_number_id ${data.phone_number_id}`);
      return { ok: true, phone_number: phone, display_name: displayName };
    } catch (e) {
      if ((e as { metaMessage?: string }).metaMessage !== undefined) {
        throw new Error("Meta could not complete the connection. Please try again.");
      }
      throw e;
    }
  });

export const disconnectWhatsapp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { firm_id: string }) => z.object({ firm_id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertPartnerOrManager(context as Ctx, data.firm_id);
    const { data: conn } = await context.supabase
      .from("ca_whatsapp_connections")
      .select("id, waba_id, access_token_enc")
      .eq("ca_firm_id", data.firm_id)
      .eq("is_active", true)
      .maybeSingle();
    if (!conn) return { ok: true };
    const c = conn as { id: string; waba_id: string | null; access_token_enc: string | null };
    if (c.waba_id && c.access_token_enc) {
      try {
        const { decryptToken } = await import("@/lib/caGmail.server");
        const token = await decryptToken(c.access_token_enc);
        await fetch(`${GRAPH}/${c.waba_id}/subscribed_apps`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      } catch {
        // ignore — local disconnect still proceeds
      }
    }
    const { error } = await context.supabase
      .from("ca_whatsapp_connections")
      .update({ is_active: false, access_token_enc: null, updated_at: new Date().toISOString() } as never)
      .eq("id", c.id);
    if (error) throw new Error("Could not disconnect WhatsApp. Please try again.");
    return { ok: true };
  });
