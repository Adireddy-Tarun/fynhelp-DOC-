import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const EXTERNAL_URL = "https://wiknwxniwqvsxgyzqqxu.supabase.co";
const EXTERNAL_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpa253eG5pd3F2c3hneXpxcXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyMzc1MTksImV4cCI6MjA5MTgxMzUxOX0.MVIp_hMUZsiMQ-LFulVdYaFkGonNk5WwdcHYWsx__qY";

const BUCKET = "ca-reports";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const inr = (n: number) =>
  "Rs. " +
  Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });

const pad = (label: string, value: string, width = 34) =>
  `${label.padEnd(width, ".")} ${value}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ success: false, error: "Method not allowed" }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // --- auth: the caller must be a signed-in member of the CA firm ---
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ success: false, error: "Missing authorization header" }, 401);
    }
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return json({ success: false, error: "Invalid or expired session" }, 401);
    }
    const uid = userData.user.id;

    // --- validate body ---
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ success: false, error: "Invalid JSON body" }, 400);
    }
    const ca_firm_id = String(body.ca_firm_id ?? "");
    const business_id = String(body.business_id ?? "");
    const period_start = String(body.period_start ?? "");
    const period_end = String(body.period_end ?? "");

    const fieldErrors: string[] = [];
    if (!UUID_RE.test(ca_firm_id)) fieldErrors.push("ca_firm_id must be a uuid");
    if (!UUID_RE.test(business_id)) fieldErrors.push("business_id must be a uuid");
    if (!DATE_RE.test(period_start)) fieldErrors.push("period_start must be YYYY-MM-DD");
    if (!DATE_RE.test(period_end)) fieldErrors.push("period_end must be YYYY-MM-DD");
    if (DATE_RE.test(period_start) && DATE_RE.test(period_end) && period_end < period_start) {
      fieldErrors.push("period_end must be on or after period_start");
    }
    if (fieldErrors.length) return json({ success: false, error: fieldErrors.join("; ") }, 400);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // --- authorisation: caller belongs to the firm, firm has access to the client ---
    const [{ data: ownerFirm }, { data: memberRow }] = await Promise.all([
      admin.from("ca_firms").select("id").eq("id", ca_firm_id).eq("user_id", uid).maybeSingle(),
      admin
        .from("ca_firm_members")
        .select("id")
        .eq("ca_firm_id", ca_firm_id)
        .eq("user_id", uid)
        .eq("status", "active")
        .maybeSingle(),
    ]);
    if (!ownerFirm && !memberRow) {
      return json({ success: false, error: "You do not have access to this CA firm" }, 403);
    }

    const { data: accessRow } = await admin
      .from("ca_client_access")
      .select("id")
      .eq("ca_firm_id", ca_firm_id)
      .eq("business_id", business_id)
      .eq("is_active", true)
      .maybeSingle();
    const { data: clientRow } = await admin
      .from("ca_clients")
      .select("client_name, gstin, pan, client_email")
      .eq("ca_firm_id", ca_firm_id)
      .eq("business_id", business_id)
      .maybeSingle();
    if (!accessRow && !clientRow) {
      return json({ success: false, error: "This client is not linked to your firm" }, 403);
    }

    const ext = createClient(EXTERNAL_URL, EXTERNAL_ANON, { auth: { persistSession: false } });

    // --- external financial data ---
    const safe = async <T>(p: PromiseLike<{ data: T | null; error: unknown }>, label: string) => {
      try {
        const { data, error } = await p;
        if (error) console.warn(`[mis] ${label}`, error);
        return data;
      } catch (e) {
        console.warn(`[mis] ${label} threw`, e);
        return null;
      }
    };

    const [liquidity, revenue, txns, invoices, gstFilings] = await Promise.all([
      safe(
        ext.from("liquidity_metrics").select("*").eq("business_id", business_id)
          .order("recorded_at", { ascending: false }).limit(1).maybeSingle(),
        "liquidity_metrics",
      ),
      safe(
        ext.from("revenue_metrics").select("*").eq("org_id", business_id)
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        "revenue_metrics",
      ),
      safe(
        ext.from("bank_transactions")
          .select("date, description, category, amount, balance, type")
          .eq("business_id", business_id)
          .gte("date", period_start).lte("date", period_end)
          .order("date", { ascending: true }),
        "bank_transactions",
      ),
      safe(
        ext.from("invoices")
          .select("invoice_date, total_amount, paid_amount, outstanding_amount, status")
          .eq("business_id", business_id)
          .gte("invoice_date", period_start).lte("invoice_date", period_end),
        "invoices",
      ),
      safe(
        ext.from("gst_filings").select("*").eq("business_id", business_id),
        "gst_filings",
      ),
    ]);

    // --- Lovable Cloud CA data ---
    const [itcRes, tdsRes, complianceRes] = await Promise.all([
      admin.from("ca_itc_records").select("total_itc, match_status, mismatch_amount")
        .eq("business_id", business_id).eq("ca_firm_id", ca_firm_id),
      admin.from("ca_tds_records").select("tds_amount, deposited_amount, status, return_filed")
        .eq("business_id", business_id).eq("ca_firm_id", ca_firm_id),
      admin.from("ca_compliance_events").select("event_type, filing_period, due_date, status, penalty_amount")
        .eq("business_id", business_id).eq("ca_firm_id", ca_firm_id)
        .order("due_date", { ascending: true }),
    ]);

    const itc = itcRes.data ?? [];
    const tds = tdsRes.data ?? [];
    const compliance = complianceRes.data ?? [];
    const txnRows = (txns as any[]) ?? [];
    const invoiceRows = (invoices as any[]) ?? [];
    const gstRows = (gstFilings as any[]) ?? [];

    // --- compute ---
    const signed = (t: any) => {
      const a = num(t.amount);
      if (typeof t.type === "string" && t.type.toLowerCase() === "debit") return -Math.abs(a);
      if (typeof t.type === "string" && t.type.toLowerCase() === "credit") return Math.abs(a);
      return a;
    };

    const total_income = txnRows.reduce((s, t) => (signed(t) > 0 ? s + signed(t) : s), 0);
    const total_expenses = txnRows.reduce((s, t) => (signed(t) < 0 ? s + Math.abs(signed(t)) : s), 0);
    const net_cash_flow = total_income - total_expenses;
    const withBalance = txnRows.filter((t) => t.balance !== null && t.balance !== undefined);
    const opening_balance = withBalance.length ? num(withBalance[0].balance) : 0;
    const closing_balance = withBalance.length ? num(withBalance[withBalance.length - 1].balance) : 0;

    const total_invoiced = invoiceRows.reduce((s, i) => s + num(i.total_amount), 0);
    const total_collected = invoiceRows.reduce((s, i) => s + num(i.paid_amount), 0);
    const outstanding_receivables = invoiceRows.reduce((s, i) => s + num(i.outstanding_amount), 0);

    const total_itc_claimed = itc.reduce((s, r) => s + num(r.total_itc), 0);
    const total_itc_matched = itc.reduce(
      (s, r) => (r.match_status === "matched" ? s + num(r.total_itc) : s), 0);
    const total_itc_mismatched = itc.reduce((s, r) => s + num(r.mismatch_amount), 0);

    const total_tds_deducted = tds.reduce((s, r) => s + num(r.tds_amount), 0);
    const total_tds_deposited = tds.reduce((s, r) => s + num(r.deposited_amount), 0);
    const tds_outstanding = total_tds_deducted - total_tds_deposited;

    const gstFiled = gstRows.filter((g) =>
      ["filed", "completed", "submitted"].includes(String(g.status ?? "").toLowerCase())).length;
    const gst_compliance_rate = gstRows.length
      ? Math.round((gstFiled / gstRows.length) * 1000) / 10
      : 0;

    const overdueEvents = compliance.filter(
      (e) => e.status !== "filed" && e.due_date && new Date(e.due_date) < new Date());
    const pendingEvents = compliance.filter(
      (e) => e.status !== "filed" && !(e.due_date && new Date(e.due_date) < new Date()));

    const periodLabel = `${period_start} to ${period_end}`;
    const generated_at = new Date().toISOString();
    const clientName = clientRow?.client_name ?? "Client";

    const report = {
      report_type: "MIS",
      generated_at,
      period: { label: periodLabel, start: period_start, end: period_end },
      client: {
        business_id,
        name: clientName,
        gstin: clientRow?.gstin ?? null,
        pan: clientRow?.pan ?? null,
        email: clientRow?.client_email ?? null,
      },
      cash_flow: {
        total_income, total_expenses, net_cash_flow,
        opening_balance, closing_balance,
        transaction_count: txnRows.length,
      },
      revenue: {
        total_invoiced, total_collected, outstanding_receivables,
        invoice_count: invoiceRows.length,
        mrr: revenue ? num((revenue as any).mrr) : null,
        arr: revenue ? num((revenue as any).arr) : null,
        customer_count: revenue ? (revenue as any).customer_count ?? null : null,
        churn_rate: revenue ? (revenue as any).churn_rate ?? null : null,
      },
      liquidity: {
        cash_position: liquidity ? num((liquidity as any).cash_position) : null,
        runway_months: liquidity ? (liquidity as any).runway_months ?? null : null,
        burn_rate: liquidity ? num((liquidity as any).burn_rate_current) : null,
        health_status: liquidity ? (liquidity as any).health_status ?? null : null,
      },
      gst_itc: {
        total_itc_claimed, total_itc_matched, total_itc_mismatched,
        itc_record_count: itc.length,
        gst_filings_total: gstRows.length,
        gst_filings_filed: gstFiled,
        gst_compliance_rate,
      },
      tds: {
        total_tds_deducted, total_tds_deposited, tds_outstanding,
        tds_record_count: tds.length,
        returns_filed: tds.filter((r) => r.return_filed).length,
      },
      compliance: {
        total_events: compliance.length,
        overdue: overdueEvents.length,
        pending: pendingEvents.length,
        filed: compliance.filter((e) => e.status === "filed").length,
        total_penalties: compliance.reduce((s, e) => s + num(e.penalty_amount), 0),
        events: compliance.map((e) => ({
          event_type: e.event_type, filing_period: e.filing_period,
          due_date: e.due_date, status: e.status,
        })),
      },
    };

    // --- text rendering ---
    const line = "=".repeat(58);
    const thin = "-".repeat(58);
    const text = [
      line,
      "  MANAGEMENT INFORMATION SYSTEM (MIS) REPORT",
      `  ${clientName}`,
      line,
      `Period          : ${periodLabel}`,
      `GSTIN           : ${report.client.gstin ?? "—"}`,
      `PAN             : ${report.client.pan ?? "—"}`,
      `Generated at    : ${generated_at}`,
      "",
      thin,
      "1. EXECUTIVE SUMMARY",
      thin,
      pad("Net cash flow", inr(net_cash_flow)),
      pad("Closing bank balance", inr(closing_balance)),
      pad("Outstanding receivables", inr(outstanding_receivables)),
      pad("ITC at risk (mismatched)", inr(total_itc_mismatched)),
      pad("TDS outstanding", inr(tds_outstanding)),
      pad("GST compliance rate", `${gst_compliance_rate}%`),
      pad("Overdue compliance events", String(overdueEvents.length)),
      pad("Liquidity health", String(report.liquidity.health_status ?? "no data")),
      "",
      thin,
      "2. CASH FLOW SUMMARY",
      thin,
      pad("Opening balance", inr(opening_balance)),
      pad("Total income", inr(total_income)),
      pad("Total expenses", inr(total_expenses)),
      pad("Net cash flow", inr(net_cash_flow)),
      pad("Closing balance", inr(closing_balance)),
      pad("Transactions in period", String(txnRows.length)),
      pad("Monthly burn rate", report.liquidity.burn_rate != null ? inr(report.liquidity.burn_rate) : "—"),
      pad("Runway (months)", String(report.liquidity.runway_months ?? "—")),
      "",
      thin,
      "3. REVENUE SUMMARY",
      thin,
      pad("Total invoiced", inr(total_invoiced)),
      pad("Total collected", inr(total_collected)),
      pad("Outstanding receivables", inr(outstanding_receivables)),
      pad("Invoices in period", String(invoiceRows.length)),
      pad("MRR", report.revenue.mrr != null ? inr(report.revenue.mrr) : "—"),
      pad("ARR", report.revenue.arr != null ? inr(report.revenue.arr) : "—"),
      pad("Customers", String(report.revenue.customer_count ?? "—")),
      pad("Churn rate", report.revenue.churn_rate != null ? `${report.revenue.churn_rate}%` : "—"),
      "",
      thin,
      "4. GST AND ITC SUMMARY",
      thin,
      pad("Total ITC claimed", inr(total_itc_claimed)),
      pad("ITC matched", inr(total_itc_matched)),
      pad("ITC mismatched", inr(total_itc_mismatched)),
      pad("ITC records", String(itc.length)),
      pad("GST filings on record", String(gstRows.length)),
      pad("GST filings completed", String(gstFiled)),
      pad("GST compliance rate", `${gst_compliance_rate}%`),
      "",
      thin,
      "5. TDS SUMMARY",
      thin,
      pad("TDS deducted", inr(total_tds_deducted)),
      pad("TDS deposited", inr(total_tds_deposited)),
      pad("TDS outstanding", inr(tds_outstanding)),
      pad("TDS records", String(tds.length)),
      pad("Returns filed", String(report.tds.returns_filed)),
      "",
      thin,
      "6. COMPLIANCE STATUS",
      thin,
      pad("Total events", String(compliance.length)),
      pad("Filed", String(report.compliance.filed)),
      pad("Pending", String(pendingEvents.length)),
      pad("Overdue", String(overdueEvents.length)),
      pad("Penalties accrued", inr(report.compliance.total_penalties)),
      "",
      ...(compliance.length
        ? [
            "  Event            Period        Due          Status",
            ...compliance.slice(0, 40).map(
              (e) =>
                `  ${String(e.event_type ?? "—").padEnd(16)} ${String(e.filing_period ?? "—").padEnd(13)} ${String(e.due_date ?? "—").padEnd(12)} ${e.status ?? "—"}`,
            ),
          ]
        : ["  No compliance events on record."]),
      "",
      line,
      "  Generated by FynHelp CA Workbench.",
      "  Figures are derived from connected books and filings.",
      "  Review with your accountant before filing or distribution.",
      line,
      "",
    ].join("\n");

    // --- upload ---
    const filePath = `${ca_firm_id}/${business_id}/MIS_${period_start}_${period_end}.txt`;
    const bytes = new TextEncoder().encode(text);
    const { error: uploadErr } = await admin.storage
      .from(BUCKET)
      .upload(filePath, bytes, { contentType: "text/plain; charset=utf-8", upsert: true });
    if (uploadErr) {
      console.error("[mis] upload failed", uploadErr);
      return json({ success: false, error: `Upload failed: ${uploadErr.message}` }, 500);
    }

    // Bucket is private (public buckets are blocked by workspace policy) — issue a long-lived signed URL.
    const { data: signedData, error: signErr } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60 * 60 * 24 * 365);
    if (signErr || !signedData?.signedUrl) {
      console.error("[mis] signed url failed", signErr);
      return json({ success: false, error: "Could not create a download link" }, 500);
    }
    const file_url = signedData.signedUrl;

    // --- log row ---
    const logPayload = {
      ca_firm_id,
      business_id,
      report_type: "MIS",
      period: periodLabel,
      period_start,
      period_end,
      status: "ready",
      file_url,
      file_size: bytes.length,
      file_path: filePath,
      report_name: `MIS report — ${clientName} — ${periodLabel}`,
      generated_by_user_id: uid,
    };

    const { data: existing } = await admin
      .from("ca_reports_log")
      .select("id")
      .eq("ca_firm_id", ca_firm_id)
      .eq("business_id", business_id)
      .eq("report_type", "MIS")
      .eq("period", periodLabel)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await admin.from("ca_reports_log").update(logPayload).eq("id", existing.id);
      if (error) console.warn("[mis] log update", error);
    } else {
      const { error } = await admin.from("ca_reports_log").insert(logPayload);
      if (error) console.warn("[mis] log insert", error);
    }

    return json({
      success: true,
      file_url,
      report_summary: {
        period: periodLabel,
        client_name: clientName,
        total_income,
        total_expenses,
        net_cash_flow,
        opening_balance,
        closing_balance,
        total_invoiced,
        total_collected,
        outstanding_receivables,
        total_itc_claimed,
        total_itc_matched,
        total_tds_deducted,
        gst_compliance_rate,
        overdue_compliance_events: overdueEvents.length,
      },
    });
  } catch (e) {
    console.error("[mis] unhandled", e);
    return json({ success: false, error: e instanceof Error ? e.message : "Unexpected error" }, 500);
  }
});
