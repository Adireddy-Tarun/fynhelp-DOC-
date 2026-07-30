import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const fmtDate = (d: string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "—");
const daysOverdue = (d: string) =>
  Math.max(0, Math.floor((Date.now() - new Date(d).getTime()) / 86400000));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "Method not allowed" }), { status: 405, headers: cors });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    const nowIso = new Date().toISOString();
    const { data: events, error } = await admin
      .from("ca_compliance_events")
      .select("id, ca_firm_id, business_id, event_type, filing_period, due_date, status")
      .neq("status", "filed")
      .lt("due_date", nowIso)
      .eq("is_demo", false)
      .order("due_date", { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400, headers: cors });
    }

    const byFirm = new Map<string, typeof events>();
    for (const e of events ?? []) {
      if (!e.ca_firm_id) continue;
      const list = byFirm.get(e.ca_firm_id) ?? [];
      list.push(e);
      byFirm.set(e.ca_firm_id, list as typeof events);
    }

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    let firmsAlerted = 0;
    let eventsProcessed = 0;
    let skipped = 0;

    for (const [firmId, firmEvents] of byFirm.entries()) {
      const { data: firm } = await admin
        .from("ca_firms")
        .select("id, email, ca_name, firm_name")
        .eq("id", firmId)
        .maybeSingle();
      if (!firm?.email) {
        skipped += firmEvents!.length;
        continue;
      }

      const fresh: NonNullable<typeof events> = [];
      for (const ev of firmEvents!) {
        const { data: existing } = await admin
          .from("ca_notifications")
          .select("id")
          .eq("ca_firm_id", firmId)
          .eq("type", "compliance_overdue")
          .like("message", `%${ev.id}%`)
          .gte("created_at", since)
          .limit(1);
        if (existing && existing.length > 0) {
          skipped++;
          continue;
        }
        fresh.push(ev);
      }

      if (fresh.length === 0) continue;

      for (const ev of fresh) {
        await admin.from("ca_notifications").insert({
          ca_firm_id: firmId,
          business_id: ev.business_id,
          type: "compliance_overdue",
          title: "Compliance event overdue",
          message: `Filing ${ev.event_type} for period ${ev.filing_period} was due on ${fmtDate(ev.due_date)} and has not been filed. Penalty may apply. [event:${ev.id}]`,
          severity: "warning",
          is_read: false,
          is_demo: false,
        });
        eventsProcessed++;
      }

      const lines = fresh
        .map(
          (ev) =>
            `• Client ${ev.business_id ?? "—"} — ${ev.event_type} (${ev.filing_period}) — due ${fmtDate(ev.due_date)} — ${daysOverdue(ev.due_date)} day(s) overdue`,
        )
        .join("\n");

      const emailBody = `Hello ${firm.ca_name ?? firm.firm_name ?? "there"},

The following compliance filings for your clients are overdue:

${lines}

Please review and file these at the earliest to avoid penalties.`;

      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/ca-send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVICE_KEY}`,
            "X-Internal-Service": "ca-compliance-alerts",
          },
          body: JSON.stringify({
            to: firm.email,
            subject: `Action required: ${fresh.length} overdue compliance filing(s) for your clients`,
            body: emailBody,
          }),
        });
        if (!res.ok) console.error("ca-send-email failed", firmId, await res.text());
      } catch (e) {
        console.error("ca-send-email error", firmId, e);
      }

      firmsAlerted++;
    }

    return new Response(
      JSON.stringify({ success: true, firms_alerted: firmsAlerted, events_processed: eventsProcessed, skipped }),
      { headers: cors },
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unexpected error" }),
      { status: 500, headers: cors },
    );
  }
});
