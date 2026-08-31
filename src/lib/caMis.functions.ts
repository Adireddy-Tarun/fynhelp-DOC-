import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  monthsInRange,
  summariseCompliance,
  summariseDocuments,
  summariseExceptions,
  summariseItc,
  type MisComplianceRow,
  type MisExceptionRow,
  type MisExtraction,
  type MisItcRow,
} from "./caMis.server";

export interface GenerateMisInput {
  firm_id: string;
  client_id?: string | null;
  business_id: string;
  period: string;
  report_type?: string;
  /** Optional YYYY-MM-DD bounds. When both are present the MIS covers the date range. */
  period_start?: string;
  period_end?: string;
}

export interface MisReport {
  period: string;
  client_name: string;
  revenue: number;
  expenses: number;
  gross_profit: number;
  gst_collected: number;
  gst_paid: number;
  itc_available: number;
  itc_claimed: number;
  itc_balance: number;
  compliance_summary: {
    filed: number;
    pending: number;
    overdue: number;
    items: { event_type: string | null; filing_period: string | null; due_date: string | null; status: string | null }[];
  };
  exceptions_summary: { open_count: number; amount_at_risk: number };
  data_quality: { doc_count: number; confidence_avg: number };
  generated_at: string;
  report_id: string;
}

/**
 * Builds a monthly MIS pack for one client from posted documents, ITC records,
 * compliance events and open exceptions, and logs it in `ca_reports_log`.
 */
export const generateMisReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: GenerateMisInput) => {
    const hasRange =
      !!input?.period_start &&
      !!input?.period_end &&
      /^\d{4}-\d{2}-\d{2}$/.test(input.period_start) &&
      /^\d{4}-\d{2}-\d{2}$/.test(input.period_end);
    if (!input?.firm_id || !input?.business_id || (!input?.period?.trim() && !hasRange)) {
      throw new Error("firm_id, business_id and period are required");
    }
    if (input.period_start && input.period_end && input.period_end < input.period_start) {
      throw new Error("period_end cannot be before period_start");
    }
    return input;
  })
  .handler(async ({ data, context }): Promise<MisReport> => {
    const { supabase, userId } = context;
    const reportType = data.report_type?.trim() || "monthly_mis";
    const hasRange = !!data.period_start && !!data.period_end;
    const periodLabel = hasRange
      ? `${data.period_start} to ${data.period_end}`
      : data.period.trim();
    const rangeMonths = hasRange ? monthsInRange(data.period_start!, data.period_end!) : null;

    // Portfolio access is enforced in SQL as well; fail fast with a clear message.
    const { data: access } = await supabase
      .from("ca_client_access")
      .select("id")
      .eq("ca_firm_id", data.firm_id)
      .eq("business_id", data.business_id)
      .eq("is_active", true)
      .maybeSingle();
    if (!access) throw new Error("Access denied. This client is not in your portfolio.");

    const [clientRes, docsRes, itcRes, complianceRes, exceptionsRes] = await Promise.all([
      supabase
        .from("ca_clients")
        .select("client_name")
        .eq("ca_firm_id", data.firm_id)
        .eq("business_id", data.business_id)
        .maybeSingle(),
      supabase
        .from("ca_document_extractions")
        .select("classification, confidence, extracted, corrected")
        .eq("ca_firm_id", data.firm_id)
        .eq("business_id", data.business_id)
        .eq("review_state", "posted")
        .limit(5000),
      supabase
        .from("ca_itc_records")
        .select("total_itc, match_status, filing_period")
        .eq("ca_firm_id", data.firm_id)
        .eq("business_id", data.business_id)
        .eq("filing_period", data.period)
        .limit(5000),
      supabase
        .from("ca_compliance_events")
        .select("status, event_type, due_date, filing_period")
        .eq("ca_firm_id", data.firm_id)
        .eq("business_id", data.business_id)
        .eq("filing_period", data.period)
        .limit(500),
      supabase
        .from("ca_exceptions")
        .select("status, amount")
        .eq("ca_firm_id", data.firm_id)
        .eq("business_id", data.business_id)
        .limit(2000),
    ]);

    const docs = summariseDocuments((docsRes.data ?? []) as unknown as MisExtraction[], data.period);
    const itc = summariseItc((itcRes.data ?? []) as unknown as MisItcRow[]);
    const compliance = summariseCompliance((complianceRes.data ?? []) as unknown as MisComplianceRow[]);
    const exceptions = summariseExceptions((exceptionsRes.data ?? []) as unknown as MisExceptionRow[]);

    const report = {
      period: data.period,
      client_name: clientRes.data?.client_name ?? "Client",
      revenue: docs.revenue,
      expenses: docs.expenses,
      gross_profit: docs.gross_profit,
      gst_collected: docs.gst_collected,
      gst_paid: docs.gst_paid,
      itc_available: itc.itc_available,
      itc_claimed: itc.itc_claimed,
      itc_balance: itc.itc_balance,
      compliance_summary: compliance,
      exceptions_summary: exceptions,
      data_quality: { doc_count: docs.doc_count, confidence_avg: docs.confidence_avg },
      generated_at: new Date().toISOString(),
    };

    const { data: logRow, error: logErr } = await supabase
      .from("ca_reports_log")
      .insert({
        ca_firm_id: data.firm_id,
        business_id: data.business_id,
        report_type: reportType,
        report_name: `MIS — ${report.client_name} — ${data.period}`,
        period: data.period,
        content: report as never,
        generated_by_user_id: userId,
        status: "ready",
      })
      .select("id")
      .maybeSingle();
    if (logErr) throw new Error(logErr.message);

    await supabase.from("ca_audit_events").insert({
      ca_firm_id: data.firm_id,
      business_id: data.business_id,
      actor_id: userId,
      entity_type: "report",
      entity_id: logRow?.id ?? null,
      action: "mis_generated",
      detail: { period: data.period, report_type: reportType, doc_count: docs.doc_count } as never,
    });

    return { ...report, report_id: logRow?.id ?? "" };
  });
