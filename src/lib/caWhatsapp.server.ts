/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WhatsApp document intake — server-only helpers.
 * Each CA firm brings its own Meta WhatsApp Business app; tokens are stored encrypted.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

export const MAX_WA_MEDIA_BYTES = 25 * 1024 * 1024;

export interface WhatsAppMessage {
  messageId: string;
  from: string;
  fromName: string;
  timestamp: string;
  caption: string | null;
  mediaId: string | null;
  mediaType: string | null;
  filename: string | null;
  phoneNumberId: string;
}

export interface ClientMatch {
  businessId: string | null;
  method: string;
  confidence: number;
}

export const normalisePhone = (p: string) => p.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");

/** Verify Meta's X-Hub-Signature-256 header against the app secret. */
export function verifyMetaSignature(rawBody: string, header: string | null, appSecret: string): boolean {
  if (!header || !header.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const a = Buffer.from(header.slice(7));
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Every media message in a webhook payload (Meta may batch several). */
export function parseWebhookMessages(body: unknown): WhatsAppMessage[] {
  const out: WhatsAppMessage[] = [];
  const b = body as any;
  for (const entry of b?.entry ?? []) {
    for (const change of entry?.changes ?? []) {
      const value = change?.value;
      const phoneNumberId = String(value?.metadata?.phone_number_id ?? "");
      for (const msg of value?.messages ?? []) {
        if (!msg?.id) continue;
        const contact = (value?.contacts ?? []).find((c: any) => c?.wa_id === msg.from) ?? value?.contacts?.[0];
        const fromName = contact?.profile?.name ?? msg.from;
        let mediaId: string | null = null;
        let mediaType: string | null = null;
        let filename: string | null = null;
        let caption: string | null = null;
        if (msg.type === "document") {
          mediaId = msg.document?.id ?? null;
          mediaType = msg.document?.mime_type ?? "application/octet-stream";
          filename = msg.document?.filename ?? `document_${msg.id}.pdf`;
          caption = msg.document?.caption ?? null;
        } else if (msg.type === "image") {
          mediaId = msg.image?.id ?? null;
          mediaType = msg.image?.mime_type ?? "image/jpeg";
          filename = `image_${msg.id}.jpg`;
          caption = msg.image?.caption ?? null;
        }
        if (!mediaId) continue;
        out.push({ messageId: msg.id, from: String(msg.from), fromName: String(fromName), timestamp: String(msg.timestamp ?? ""), caption, mediaId, mediaType, filename, phoneNumberId });
      }
    }
  }
  return out;
}

/** Download media bytes via the Graph API, with a streaming size cap. */
export async function downloadWhatsAppMedia(mediaId: string, accessToken: string): Promise<Uint8Array> {
  const urlRes = await fetch(`https://graph.facebook.com/v19.0/${encodeURIComponent(mediaId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!urlRes.ok) throw new Error(`WhatsApp media lookup failed [${urlRes.status}]: ${await urlRes.text()}`);
  const meta = (await urlRes.json()) as { url?: string; file_size?: number };
  if (!meta.url) throw new Error("No media URL returned from WhatsApp");
  if ((meta.file_size ?? 0) > MAX_WA_MEDIA_BYTES) throw new Error("File is larger than 25 MB");
  const mediaRes = await fetch(meta.url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!mediaRes.ok || !mediaRes.body) throw new Error(`WhatsApp media download failed [${mediaRes.status}]`);
  const reader = mediaRes.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_WA_MEDIA_BYTES) {
      await reader.cancel();
      throw new Error("File is larger than 25 MB");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

/** 3-layer client identification: exact phone → learned mapping → fuzzy profile name. */
export async function identifyClientByPhone(
  db: SupabaseClient,
  caFirmId: string,
  senderPhone: string,
  senderName: string,
): Promise<ClientMatch> {
  const normPhone = normalisePhone(senderPhone);
  const { data: clients } = await db
    .from("ca_clients")
    .select("business_id, client_name, client_phone")
    .eq("ca_firm_id", caFirmId);
  const clientList = ((clients ?? []) as { business_id: string | null; client_name: string; client_phone: string | null }[])
    .filter((c) => !!c.business_id);

  for (const c of clientList) {
    if (c.client_phone && normalisePhone(c.client_phone) === normPhone) {
      return { businessId: c.business_id, method: "phone_exact", confidence: 1.0 };
    }
  }

  const { data: mapping } = await db
    .from("ca_whatsapp_sender_mappings")
    .select("business_id, confidence")
    .eq("ca_firm_id", caFirmId)
    .eq("sender_phone", normPhone)
    .maybeSingle();
  if ((mapping as any)?.business_id) {
    return { businessId: (mapping as any).business_id, method: "learned_mapping", confidence: Number((mapping as any).confidence ?? 0.95) };
  }

  const NOISE = /\b(pvt|private|limited|ltd|llp|llc|co|corp|enterprises|solutions|services|group|associates|and)\b\.?/gi;
  const norm = (s: string) => s.toLowerCase().replace(NOISE, " ").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const senderTokens = norm(senderName).split(/\s+/).filter((t) => t.length > 2);
  let bestScore = 0;
  let bestId: string | null = null;
  for (const c of clientList) {
    const clientTokens = norm(c.client_name).split(/\s+/).filter((t) => t.length > 2);
    if (!clientTokens.length || !senderTokens.length) continue;
    const common = senderTokens.filter((t) => clientTokens.includes(t)).length;
    const total = new Set([...senderTokens, ...clientTokens]).size;
    const score = total > 0 ? common / total : 0;
    if (score > bestScore) { bestScore = score; bestId = c.business_id; }
  }
  if (bestScore >= 0.6 && bestId) {
    return { businessId: bestId, method: "name_fuzzy", confidence: Math.min(0.65, 0.4 + bestScore * 0.3) };
  }
  return { businessId: null, method: "none", confidence: 0 };
}
