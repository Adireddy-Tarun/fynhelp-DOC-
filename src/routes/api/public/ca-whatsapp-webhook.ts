/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WhatsApp Cloud API webhook for CA document intake.
 * GET  — Meta verification handshake (matches a firm's verify token).
 * POST — incoming messages; signature verified with the firm's app secret.
 */
import { createFileRoute } from "@tanstack/react-router";
import type { ParsedRow } from "@/lib/caGmail.server";
import { createHmac, timingSafeEqual } from "node:crypto";

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_").toLowerCase();
}

export const Route = createFileRoute("/api/public/ca-whatsapp-webhook")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const mode = url.searchParams.get("hub.mode");
        const token = url.searchParams.get("hub.verify_token") ?? "";
        const challenge = url.searchParams.get("hub.challenge");
        const expected = process.env["META_WEBHOOK_VERIFY_TOKEN"] ?? "";
        if (mode !== "subscribe" || !challenge || !expected) return new Response("Forbidden", { status: 403 });
        const a = Buffer.from(token);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) return new Response("Forbidden", { status: 403 });
        return new Response(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
      },

      POST: async ({ request }) => {
        console.log("[fyn:whatsapp] webhook received");
        const raw = await request.text();
        const appSecret = process.env["META_APP_SECRET"] ?? "";
        const signature = request.headers.get("x-hub-signature-256") ?? "";
        const expectedSig = appSecret ? "sha256=" + createHmac("sha256", appSecret).update(raw).digest("hex") : "";
        const sa = Buffer.from(signature);
        const sb = Buffer.from(expectedSig);
        if (!expectedSig || sa.length !== sb.length || !timingSafeEqual(sa, sb)) {
          console.warn("[fyn:whatsapp] webhook signature rejected");
          return new Response("Invalid signature", { status: 401 });
        }
        let body: unknown;
        try { body = JSON.parse(raw); } catch { return new Response("OK", { status: 200 }); }

        try {
        const wa = await import("@/lib/caWhatsapp.server");
        const gmail = await import("@/lib/caGmail.server");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const messages = wa.parseWebhookMessages(body);
        if (messages.length === 0) {
          console.log("[fyn:whatsapp] no media message — skipping");
          return new Response("OK", { status: 200 });
        }

        for (const msg of messages) {
          const { data: conn } = await supabaseAdmin
            .from("ca_whatsapp_connections")
            .select("id, ca_firm_id, access_token_enc")
            .eq("phone_number_id", msg.phoneNumberId)
            .eq("is_active", true)
            .maybeSingle();
          if (!conn || !conn.access_token_enc) {
            console.log(`[fyn:whatsapp] unknown phone_number_id ${msg.phoneNumberId} — ignored`);
            continue;
          }
          const caFirmId = conn.ca_firm_id;
          console.log(`[fyn:whatsapp] media message from ${msg.from} — file: ${msg.filename} — type: ${msg.mediaType}`);

          const { count } = await supabaseAdmin
            .from("ca_document_extractions")
            .select("id", { count: "exact", head: true })
            .eq("ca_firm_id", caFirmId)
            .eq("whatsapp_message_id", msg.messageId);
          if ((count ?? 0) > 0) {
            console.log("[fyn:whatsapp] duplicate message — skipping:", msg.messageId);
            continue;
          }

          try {
            const accessToken = await gmail.decryptToken(conn.access_token_enc);
            const match = await wa.identifyClientByPhone(supabaseAdmin as never, caFirmId, msg.from, msg.fromName);
            console.log(`[fyn:whatsapp] client match — method: ${match.method} confidence: ${match.confidence}`);

            const bytes = await wa.downloadWhatsAppMedia(msg.mediaId!, accessToken);
            console.log(`[fyn:whatsapp] downloaded ${bytes.length} bytes`);

            const filename = msg.filename ?? `wa_${Date.now()}.pdf`;
            const mime = msg.mediaType ?? "application/octet-stream";
            const storagePath = `${caFirmId}/${match.businessId ?? "unassigned"}/whatsapp/${Date.now()}_${safeName(filename)}`;
            const { error: uploadErr } = await supabaseAdmin.storage
              .from("ca-client-documents")
              .upload(storagePath, bytes, { contentType: mime, upsert: false });
            if (uploadErr) throw new Error(`storage upload failed: ${uploadErr.message}`);

            const classification = gmail.classifyByFilename(filename);
            const isCsv = mime.includes("csv") || /\.csv$/i.test(filename);
            const isXml = /\.xml$/i.test(filename);
            const isPdfOrImage = mime.includes("pdf") || mime.startsWith("image/");
            let rows: ParsedRow[] = [];
            let extractConfidence = 0;
            if (isCsv) {
              rows = gmail.parseBankCsvText(new TextDecoder().decode(bytes));
              extractConfidence = gmail.scoreRows(rows);
            } else if (isXml) {
              rows = gmail.parseTallyXmlBytes(bytes);
              extractConfidence = gmail.scoreRows(rows);
            } else if (isPdfOrImage && match.businessId) {
              try {
                let binary = "";
                for (const byte of bytes) binary += String.fromCharCode(byte);
                const docType = classification === "invoice" || classification === "expense" ? classification : "bank";
                const ocrRes = await supabaseAdmin.functions.invoke("extract-document-ai", {
                  body: { doc_type: docType, file_base64: btoa(binary), mime_type: mime, filename, classification, firmId: caFirmId, businessId: match.businessId },
                });
                const ocrData = ocrRes.data as { rows?: ParsedRow[]; confidence?: number } | null;
                if (!ocrRes.error && Array.isArray(ocrData?.rows) && ocrData.rows.length > 0) {
                  rows = ocrData.rows;
                  extractConfidence = ocrData.confidence ?? gmail.scoreRows(rows);
                }
              } catch (ocrErr) {
                console.error(`[fyn:whatsapp] OCR failed for ${filename}: ${ocrErr instanceof Error ? ocrErr.message : String(ocrErr)}`);
              }
            }

            const reviewState = !match.businessId
              ? "needs_review"
              : match.confidence < 0.75
                ? "pending_verification"
                : rows.length > 0 && extractConfidence >= 0.85
                  ? "auto_accepted"
                  : "needs_review";

            const { data: extraction, error: insertErr } = await supabaseAdmin
              .from("ca_document_extractions")
              .insert({
                ca_firm_id: caFirmId,
                business_id: match.businessId,
                source_type: "whatsapp",
                original_filename: filename,
                storage_path: storagePath,
                classification,
                confidence: rows.length > 0 ? extractConfidence : match.confidence,
                extracted: { rows },
                review_state: reviewState,
                whatsapp_message_id: msg.messageId,
                whatsapp_sender_phone: msg.from,
                whatsapp_sender_name: msg.fromName,
                whatsapp_caption: msg.caption,
                whatsapp_match_method: match.method,
                whatsapp_match_confidence: match.confidence,
                error_message: !match.businessId
                  ? `Sender ${msg.from} (${msg.fromName}) could not be matched to a client. Assign in the Intake inbox.`
                  : null,
              } as never)
              .select("id")
              .maybeSingle();
            if (insertErr) {
              if (insertErr.code === "23505") continue; // concurrent duplicate
              throw new Error(`extraction insert failed: ${insertErr.message}`);
            }
            console.log(`[fyn:whatsapp] extraction created — id: ${(extraction as any)?.id} state: ${reviewState}`);

            await supabaseAdmin.from("ca_whatsapp_connections").update({ last_received_at: new Date().toISOString(), error_message: null }).eq("id", conn.id);

            if (match.businessId && reviewState !== "pending_verification") {
              const nowIso = new Date().toISOString();
              const { data: open } = await supabaseAdmin
                .from("ca_document_requests")
                .select("id")
                .eq("ca_firm_id", caFirmId)
                .eq("business_id", match.businessId)
                .in("status", ["open", "pending", "sent", "chased", "escalated"])
                .limit(20);
              if (open && open.length > 0) {
                await supabaseAdmin
                  .from("ca_document_requests")
                  .update({ status: "fulfilled", fulfilled_at: nowIso, updated_at: nowIso } as never)
                  .in("id", open.map((o: any) => o.id));
              }
            }

            await supabaseAdmin.from("ca_brain_events").insert({
              ca_firm_id: caFirmId,
              business_id: match.businessId,
              event_type: "whatsapp_document_received",
              payload: { match_method: match.method, match_confidence: match.confidence, review_state: reviewState, classification },
            } as never).then(undefined, () => undefined);

            await supabaseAdmin.from("ca_notifications").insert({
              ca_firm_id: caFirmId,
              business_id: match.businessId,
              type: "whatsapp_document",
              severity: reviewState === "auto_accepted" ? "info" : "warning",
              title: match.businessId ? "WhatsApp document received" : `Unmatched WhatsApp document — ${msg.fromName}`,
              message: match.businessId
                ? `${filename} received from ${msg.fromName} via WhatsApp. ${reviewState === "auto_accepted" ? "Ready to post." : "Waiting in the Review queue."}`
                : `${filename} from ${msg.fromName} (${msg.from}) could not be matched to a client. Assign it in the Intake inbox.`,
              is_read: false,
            } as never).then(undefined, () => undefined);
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            console.error("[fyn:whatsapp] processing failed:", message);
            await supabaseAdmin.from("ca_whatsapp_connections").update({ error_message: message.slice(0, 300) }).eq("id", conn.id);
          }
        }
        } catch (err) {
          console.error("[fyn:whatsapp] webhook error:", err instanceof Error ? err.message : String(err));
        }

        // Always 200 once the signature has passed; duplicates are skipped by message id.
        return new Response("OK", { status: 200 });
      },
    },
  },
});
