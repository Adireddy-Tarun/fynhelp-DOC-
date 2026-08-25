import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SyncResult, CanonicalTxn } from "./caSync.server";

export type { SyncResult } from "./caSync.server";

export interface IntegrationStatus {
  business_id: string;
  provider: string;
  status: string | null;
  connected_at: string | null;
}

/** Which providers the firm's clients have connected. Never returns credentials. */
export const getFirmIntegrations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { firmId: string }) => {
    if (!input?.firmId) throw new Error("firmId is required");
    return input;
  })
  .handler(async ({ data, context }): Promise<IntegrationStatus[]> => {
    const { supabase } = context;
    // RLS on ca_client_access limits this to firms the caller belongs to.
    const { data: access, error } = await supabase
      .from("ca_client_access")
      .select("business_id")
      .eq("ca_firm_id", data.firmId)
      .eq("is_active", true);
    if (error) throw new Error(error.message);
    const ids = (access ?? []).map((a) => a.business_id as string).filter(Boolean);
    if (ids.length === 0) return [];

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error: intErr } = await supabaseAdmin
      .from("integrations")
      .select("organization_id, provider, status, created_at")
      .in("organization_id", ids);
    if (intErr) throw new Error(intErr.message);

    return (rows ?? []).map((r) => ({
      business_id: String(r.organization_id),
      provider: String(r.provider),
      status: r.status ?? null,
      connected_at: r.created_at ?? null,
    }));
  });

export const syncZohoBooks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { businessId: string; firmId: string }) => {
    if (!input?.businessId || !input?.firmId) throw new Error("businessId and firmId are required");
    return input;
  })
  .handler(async ({ data, context }): Promise<SyncResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const helpers = await import("./caSync.server");
    const admin = supabaseAdmin as never as Parameters<typeof helpers.resolveFirmId>[0];

    const firmId = await helpers.resolveFirmId(admin, context.userId);
    if (!firmId || firmId !== data.firmId) throw new Error("CA firm not found for this user");
    if (!(await helpers.assertClientAccess(admin, firmId, data.businessId))) {
      throw new Error("Access denied. This client is not in your portfolio.");
    }

    const { data: integration } = await supabaseAdmin
      .from("integrations")
      .select("access_token, refresh_token, expires_at, metadata")
      .eq("organization_id", data.businessId)
      .eq("provider", "zoho_books")
      .maybeSingle();
    if (!integration) throw new Error("Zoho Books is not connected for this client");

    const jobId = await helpers.openSyncJob(admin, firmId, data.businessId, "zoho_books");
    const errors: string[] = [];

    try {
      const { token, apiDomain } = await helpers.zohoAccessToken(
        admin,
        integration as never,
        data.businessId,
      );
      const auth = { Authorization: `Zoho-oauthtoken ${token}` };

      const orgRes = await fetch(`${apiDomain}/books/v3/organizations`, { headers: auth });
      if (!orgRes.ok) throw new Error(`Zoho organizations failed (${orgRes.status})`);
      const orgBody = await orgRes.json();
      const zohoOrgId = orgBody?.organizations?.[0]?.organization_id;
      if (!zohoOrgId) throw new Error("No Zoho Books organization found on this connection");

      const [invRes, expRes] = await Promise.all([
        fetch(`${apiDomain}/books/v3/invoices?status=all&organization_id=${zohoOrgId}`, { headers: auth }),
        fetch(`${apiDomain}/books/v3/expenses?organization_id=${zohoOrgId}`, { headers: auth }),
      ]);
      if (!invRes.ok) errors.push(`Invoices fetch failed (${invRes.status})`);
      if (!expRes.ok) errors.push(`Expenses fetch failed (${expRes.status})`);

      const invoices: Array<Record<string, unknown>> = invRes.ok ? (await invRes.json())?.invoices ?? [] : [];
      const expenses: Array<Record<string, unknown>> = expRes.ok ? (await expRes.json())?.expenses ?? [] : [];

      const rows: CanonicalTxn[] = [];
      for (const inv of invoices) {
        rows.push({
          business_id: data.businessId,
          date: String(inv.date ?? "").slice(0, 10),
          description: `Invoice ${inv.invoice_number ?? ""} — ${inv.customer_name ?? "Customer"}`.slice(0, 300),
          amount: Number(inv.total ?? 0),
          type: "credit",
          category: "Revenue",
          source_reference: `zoho_books:invoice:${inv.invoice_id}`,
          is_demo: false,
        });
      }
      for (const exp of expenses) {
        rows.push({
          business_id: data.businessId,
          date: String(exp.date ?? "").slice(0, 10),
          description: String(exp.description || exp.account_name || "Expense").slice(0, 300),
          amount: Number(exp.total ?? exp.amount ?? 0),
          type: "debit",
          category: String(exp.account_name ?? "Expense").slice(0, 100),
          source_reference: `zoho_books:expense:${exp.expense_id}`,
          is_demo: false,
        });
      }

      const inserted = await helpers.insertNewTxns(admin, data.businessId, rows);
      const cursor = new Date().toISOString();

      await helpers.closeSyncJob(admin, jobId, {
        status: errors.length ? "completed_with_errors" : "completed",
        records_synced: inserted,
        error_message: errors.join("; ") || null,
        last_sync_cursor: cursor,
      });
      await helpers.logSyncAudit(admin, {
        firmId, businessId: data.businessId, actorId: context.userId,
        action: "zoho_sync",
        detail: { records_synced: inserted, invoices: invoices.length, expenses: expenses.length, period: cursor },
      });

      return { success: true, records_synced: inserted, errors, cursor };
    } catch (e) {
      const message = (e as Error).message ?? "Zoho sync failed";
      await helpers.closeSyncJob(admin, jobId, { status: "failed", error_message: message });
      return { success: false, records_synced: 0, errors: [message] };
    }
  });

export const syncRazorpay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { businessId: string; firmId: string }) => {
    if (!input?.businessId || !input?.firmId) throw new Error("businessId and firmId are required");
    return input;
  })
  .handler(async ({ data, context }): Promise<SyncResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const helpers = await import("./caSync.server");
    const admin = supabaseAdmin as never as Parameters<typeof helpers.resolveFirmId>[0];

    const firmId = await helpers.resolveFirmId(admin, context.userId);
    if (!firmId || firmId !== data.firmId) throw new Error("CA firm not found for this user");
    if (!(await helpers.assertClientAccess(admin, firmId, data.businessId))) {
      throw new Error("Access denied. This client is not in your portfolio.");
    }

    const { data: integration } = await supabaseAdmin
      .from("integrations")
      .select("metadata")
      .eq("organization_id", data.businessId)
      .eq("provider", "razorpay")
      .maybeSingle();
    const meta = (integration?.metadata ?? {}) as Record<string, string>;
    if (!meta.key_id || !meta.key_secret) throw new Error("Razorpay is not connected for this client");

    const jobId = await helpers.openSyncJob(admin, firmId, data.businessId, "razorpay");

    try {
      const cursor = await helpers.lastCursor(admin, firmId, data.businessId, "razorpay");
      const from = cursor ? Number(cursor) : null;
      const params = new URLSearchParams({ count: "100" });
      if (from && Number.isFinite(from)) params.set("from", String(from + 1));

      const res = await fetch(`https://api.razorpay.com/v1/payments?${params.toString()}`, {
        headers: { Authorization: "Basic " + btoa(`${meta.key_id}:${meta.key_secret}`) },
      });
      if (!res.ok) throw new Error(`Razorpay request failed (${res.status})`);
      const payload = await res.json();
      const payments: Array<Record<string, unknown>> = payload?.items ?? [];
      const usable = payments.filter((p) => p.status === "captured" || p.status === "authorized");

      const rows: CanonicalTxn[] = usable.map((p) => ({
        business_id: data.businessId,
        date: new Date(Number(p.created_at ?? 0) * 1000).toISOString().slice(0, 10),
        description: String(p.description ?? `Razorpay payment ${p.id}`).slice(0, 300),
        amount: Number(p.amount ?? 0) / 100,
        type: "credit" as const,
        category: "Payment Gateway",
        source_reference: `razorpay:${p.id}`,
        is_demo: false,
      }));

      const inserted = await helpers.insertNewTxns(admin, data.businessId, rows);
      const maxCursor = usable.reduce((m, p) => Math.max(m, Number(p.created_at ?? 0)), from ?? 0);

      await helpers.closeSyncJob(admin, jobId, {
        status: "completed",
        records_synced: inserted,
        last_sync_cursor: maxCursor ? String(maxCursor) : null,
      });
      await helpers.logSyncAudit(admin, {
        firmId, businessId: data.businessId, actorId: context.userId,
        action: "razorpay_sync",
        detail: { records_synced: inserted, payments_seen: payments.length, cursor: maxCursor ? String(maxCursor) : null },
      });

      return { success: true, records_synced: inserted, errors: [], cursor: maxCursor ? String(maxCursor) : null };
    } catch (e) {
      const message = (e as Error).message ?? "Razorpay sync failed";
      await helpers.closeSyncJob(admin, jobId, { status: "failed", error_message: message });
      return { success: false, records_synced: 0, errors: [message] };
    }
  });
