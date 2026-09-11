/**
 * Gmail intake poller.
 *
 * Runs every 15 minutes from pg_cron. For every active Gmail connection it
 * looks for recent messages carrying PDF, CSV, XML or image attachments,
 * identifies the client with the 5-layer matcher, stores the attachment and
 * writes an extraction row so the document lands in the Intake inbox.
 *
 * Secret gated with the CA cron secret (`x-cron-secret` header or
 * `Authorization: Bearer <secret>`). No message content is returned.
 */
import { createFileRoute } from "@tanstack/react-router";
import type { ParsedRow } from "@/lib/caGmail.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ACCEPTED_MIME = /(pdf|csv|xml|excel|spreadsheet)|^image\//i;

interface GmailConnection {
  id: string;
  ca_firm_id: string;
  user_id: string;
  gmail_address: string;
  access_token_enc: string;
  refresh_token_enc: string;
  token_expiry: string;
  last_history_id: string | null;
}

function authorized(request: Request): boolean {
  const accepted = [process.env["CA_CRON_SECRET"], process.env["CRON_SECRET"]].filter(
    (s): s is string => Boolean(s),
  );
  const provided =
    request.headers.get("x-cron-secret") ??
    (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  return accepted.length > 0 && Boolean(provided) && accepted.includes(provided);
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/_{2,}/g, "_").toLowerCase();
}

async function run(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const gmail = await import("@/lib/caGmail.server");

  const { data: connections } = await supabaseAdmin
    .from("ca_gmail_connections")
    .select("id, ca_firm_id, user_id, gmail_address, access_token_enc, refresh_token_enc, token_expiry, last_history_id")
    .eq("is_active", true);

  const list = (connections ?? []) as unknown as GmailConnection[];
  if (!list.length) {
    console.log("[fyn:gmail] poll complete — connections=0 attachments=0");
    return new Response(JSON.stringify({ connections: 0, processed: 0 }), {
      headers: { "content-type": "application/json" },
    });
  }

  let totalProcessed = 0;

  for (const conn of list) {
    try {
      let accessToken = await gmail.decryptToken(conn.access_token_enc);

      // Refresh when the token expires within five minutes.
      if (new Date(conn.token_expiry).getTime() - Date.now() < 5 * 60 * 1000) {
        const refreshed = await gmail.refreshAccessToken(await gmail.decryptToken(conn.refresh_token_enc));
        if (!refreshed) {
          await supabaseAdmin
            .from("ca_gmail_connections")
            .update({ is_active: false, error_message: "Google access was revoked. Please reconnect Gmail." } as never)
            .eq("id", conn.id);
          await supabaseAdmin.from("ca_notifications").insert({
            ca_firm_id: conn.ca_firm_id,
            type: "gmail_disconnected",
            severity: "critical",
            title: "Gmail connection expired",
            message: `The Gmail connection for ${conn.gmail_address} has expired. Open Integrations to reconnect.`,
            is_read: false,
          } as never);
          continue;
        }
        accessToken = refreshed.access_token;
        await supabaseAdmin
          .from("ca_gmail_connections")
          .update({
            access_token_enc: await gmail.encryptToken(accessToken),
            token_expiry: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
            error_message: null,
          } as never)
          .eq("id", conn.id);
      }

      const query = "has:attachment newer_than:2d";
      const listRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=25`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      const listBody = (await listRes.json()) as { messages?: { id: string }[]; error?: { message: string } };
      if (listBody.error) throw new Error(listBody.error.message);

      for (const msg of listBody.messages ?? []) {
        const { data: seen } = await supabaseAdmin
          .from("ca_document_extractions")
          .select("id")
          .eq("ca_firm_id", conn.ca_firm_id)
          .eq("gmail_message_id", msg.id)
          .limit(1);
        if (seen && seen.length > 0) continue;

        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const msgBody = (await msgRes.json()) as {
          payload?: { headers?: { name: string; value: string }[]; parts?: any[] };
        };
        const headers = msgBody.payload?.headers ?? [];
        const fromHeader = headers.find((h) => h.name.toLowerCase() === "from")?.value ?? "";
        const subject = headers.find((h) => h.name.toLowerCase() === "subject")?.value ?? "";
        const senderEmail = (fromHeader.match(/<(.+?)>/)?.[1] ?? fromHeader.match(/([^\s]+@[^\s]+)/)?.[1] ?? fromHeader).trim();
        const senderName = fromHeader.replace(/<.+>/, "").replace(/"/g, "").trim();

        const match = await gmail.identifyClient(supabaseAdmin as any, conn.ca_firm_id, senderEmail, senderName, subject);

        // Attachments can be nested one level inside multipart parts.
        const flat: any[] = [];
        const walk = (parts: any[]) => {
          for (const p of parts) {
            if (p.parts) walk(p.parts);
            if (p.filename && p.body?.attachmentId) flat.push(p);
          }
        };
        walk(msgBody.payload?.parts ?? []);
        const attachments = flat.filter((p) => ACCEPTED_MIME.test(String(p.mimeType ?? "")));

        for (const att of attachments) {
          const attRes = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}/attachments/${att.body.attachmentId}`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );
          const attBody = (await attRes.json()) as { data?: string };
          if (!attBody.data) continue;
          const bytes = Uint8Array.from(
            atob(attBody.data.replace(/-/g, "+").replace(/_/g, "/")),
            (c) => c.charCodeAt(0),
          );

          const filename = String(att.filename ?? "attachment");
          const isCsv = /\.csv$/i.test(filename) || String(att.mimeType ?? "").includes("csv");
          const classification = gmail.classifyByFilename(filename);

          let rows: ParsedRow[] = [];
          let extractConfidence = 0;
          if (isCsv) {
            rows = gmail.parseBankCsvText(new TextDecoder().decode(bytes));
            extractConfidence = gmail.scoreRows(rows);
          }

          const path = `${conn.ca_firm_id}/${match.businessId ?? "unassigned"}/gmail/${Date.now()}_${safeName(filename)}`;
          const { error: upErr } = await supabaseAdmin.storage
            .from("ca-client-documents")
            .upload(path, bytes, { contentType: String(att.mimeType ?? "application/octet-stream"), upsert: false });
          if (upErr) {
            console.error(`[fyn:gmail] storage upload failed: ${upErr.message}`);
            continue;
          }

          const reviewState = !match.businessId
            ? "needs_review"
            : rows.length > 0 && extractConfidence >= 0.85 && match.confidence >= 0.75
              ? "auto_accepted"
              : "needs_review";

          const { error: insertErr } = await supabaseAdmin.from("ca_document_extractions").insert({
            ca_firm_id: conn.ca_firm_id,
            business_id: match.businessId,
            storage_path: path,
            original_filename: filename,
            classification,
            confidence: rows.length > 0 ? extractConfidence : match.confidence,
            extracted: { rows },
            review_state: reviewState,
            source_type: "gmail",
            gmail_message_id: msg.id,
            gmail_sender_email: senderEmail,
            gmail_subject: subject,
            gmail_match_method: match.method,
            gmail_match_confidence: match.confidence,
            uploaded_by: conn.user_id,
            error_message: match.businessId
              ? null
              : `Sender ${senderEmail} could not be matched to a client. Assign the client in the Intake inbox.`,
          } as never);

          if (insertErr) {
            console.error(`[fyn:gmail] extraction insert failed: ${insertErr.message}`);
            continue;
          }
          totalProcessed++;

          if (match.businessId) {
            await supabaseAdmin
              .from("ca_email_sender_mappings")
              .upsert(
                {
                  ca_firm_id: conn.ca_firm_id,
                  business_id: match.businessId,
                  sender_email: senderEmail,
                  sender_domain: senderEmail.split("@")[1] ?? null,
                  sender_name: senderName || null,
                  match_method: match.method === "learned" ? "manual" : match.method,
                  confidence: match.confidence,
                } as never,
                { onConflict: "ca_firm_id,sender_email" },
              )
              .then(undefined, () => undefined);

            // Any open chaser for this client is answered by the arriving document.
            try {
              const nowIso = new Date().toISOString();
              const { data: open } = await supabaseAdmin
                .from("ca_document_requests")
                .select("id")
                .eq("ca_firm_id", conn.ca_firm_id)
                .eq("business_id", match.businessId)
                .in("status", ["pending", "sent", "chased", "escalated"])
                .limit(20);
              if (open && open.length > 0) {
                await supabaseAdmin
                  .from("ca_document_requests")
                  .update({ status: "fulfilled", fulfilled_at: nowIso, updated_at: nowIso } as never)
                  .in("id", open.map((o: any) => o.id));
              }
            } catch { /* non-blocking */ }
          }

          try {
            await supabaseAdmin.from("ca_brain_events").insert({
              ca_firm_id: conn.ca_firm_id,
              business_id: match.businessId,
              event_type: "gmail_document_received",
              payload: {
                match_method: match.method,
                confidence: match.confidence,
                classification,
                row_count: rows.length,
                sender_domain: senderEmail.split("@")[1] ?? null,
              },
            } as never);
          } catch { /* fire and forget */ }

          try {
            await supabaseAdmin.from("ca_notifications").insert({
              ca_firm_id: conn.ca_firm_id,
              business_id: match.businessId,
              type: "gmail_document",
              severity: match.businessId ? "info" : "warning",
              title: match.businessId ? "Document received by email" : "Unmatched email attachment",
              message: match.businessId
                ? `${filename} arrived from ${senderEmail} and is in the Intake inbox.`
                : `${filename} arrived from ${senderEmail} but the sender could not be matched. Assign the client in the Intake inbox.`,
              is_read: false,
            } as never);
          } catch { /* fire and forget */ }
        }
      }

      await supabaseAdmin
        .from("ca_gmail_connections")
        .update({ last_polled_at: new Date().toISOString(), error_message: null } as never)
        .eq("id", conn.id);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gmail poll failed";
      console.error(`[fyn:gmail] poll failed for connection ${conn.id}: ${message}`);
      await supabaseAdmin
        .from("ca_gmail_connections")
        .update({ error_message: message } as never)
        .eq("id", conn.id);
    }
  }

  console.log(`[fyn:gmail] poll complete — connections=${list.length} attachments=${totalProcessed}`);
  return new Response(JSON.stringify({ connections: list.length, processed: totalProcessed }), {
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/ca-poll-gmail")({
  server: {
    handlers: {
      POST: async ({ request }) => run(request),
      GET: async ({ request }) => run(request),
    },
  },
});
