import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { z } from "npm:zod@3.23.8";
import { rejectDisallowedOrigin, rejectOversizedBody } from "../_shared/cors.ts";
import { validateBankRows } from "../_shared/bankCsv.ts";
import { computeAndStoreLiquidity, istToday } from "../_shared/liquidity.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
const EXTERNAL_URL = Deno.env.get("EXTERNAL_SUPABASE_URL") as string;
const EXTERNAL_KEY = Deno.env.get("EXTERNAL_SUPABASE_SERVICE_KEY") as string;

const BodySchema = z.object({
  data_type: z.enum(["transactions", "invoices", "vendor_payments"]),
  business_id: z.string().uuid("business_id must be a valid UUID"),
  records: z.array(z.record(z.unknown())).min(1, "records must be non-empty"),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const originBlock = rejectDisallowedOrigin(req);
  if (originBlock) return originBlock;
  const sizeBlock = rejectOversizedBody(req, 25_000_000);
  if (sizeBlock) return sizeBlock;
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);


  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    // Local (Lovable Cloud) client — used for auth + profile lookup.
    const localClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    // Local client scoped to the caller's JWT for token validation.
    const localAuthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    // External Supabase client — used for ALL data writes.
    // External project only receives the audit_log entry (best effort).
    const externalClient = EXTERNAL_URL && EXTERNAL_KEY ? createClient(EXTERNAL_URL, EXTERNAL_KEY) : null;

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authErr } = await localAuthClient.auth.getUser(token);
    if (authErr || !userData?.user) {
      return json({ error: "Unauthorized" }, 401);
    }
    const userId = userData.user.id;

    const raw = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(raw);
    if (!parsed.success) {
      return json(
        { error: "Invalid request body", errors: parsed.error.flatten().fieldErrors },
        400,
      );
    }
    const { data_type, business_id, records } = parsed.data;

    // Verify caller has access to the business (Lovable Cloud profiles table).
    const { data: profile } = await localClient
      .from("profiles")
      .select("business_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (!profile?.business_id || profile.business_id !== business_id) {
      return json({ error: "Forbidden: business_id does not match user" }, 403);
    }

    if (data_type !== "transactions") {
      return json(
        { error: `data_type '${data_type}' not yet supported`, inserted_count: 0 },
        400,
      );
    }

    // Header detection + row validation (shared with the dashboard upload).
    const stringRows = records.map((r) => {
      const out: Record<string, string> = {};
      for (const [k, v] of Object.entries(r)) out[k] = v == null ? "" : String(v);
      return out;
    });
    const headers = Array.from(new Set(stringRows.flatMap((r) => Object.keys(r))));
    const v = validateBankRows(headers, stringRows);
    const today = istToday();
    // Future dates are invalid rows.
    const valid = v.valid.filter((row, idx) => {
      if (row.date > today) {
        v.invalid_count++;
        if (v.errors.length < 10) v.errors.push({ row: idx + 2, reason: "future date not allowed" });
        return false;
      }
      return true;
    });

    const audit = async (inserted: number, status: string) => {
      try {
        if (!externalClient) return;
        await externalClient.from("audit_log").insert({
          user_id: userId,
          business_id,
          action: "secure_data_import",
          resource_type: data_type,
          metadata: {
            status,
            records_total: v.total,
            records_valid: valid.length,
            records_invalid: v.invalid_count,
            records_inserted: inserted,
            missing_columns: v.missing_columns,
          },
        });
      } catch (e) {
        console.warn("[fyn:import] audit_log write failed", (e as Error).message);
      }
    };

    if (v.missing_columns.length > 0) {
      await audit(0, "rejected");
      return json({
        status: "rejected",
        missing_columns: v.missing_columns,
        message: `This file is missing required columns: ${v.missing_columns.join(", ")}`,
        records_total: v.total, records_valid: 0, records_invalid: v.total, records_inserted: 0,
      }, 422);
    }

    if (valid.length === 0) {
      await audit(0, "rejected");
      return json({
        status: "rejected",
        missing_columns: [],
        message: "No valid rows found in this file.",
        records_total: v.total, records_valid: 0, records_invalid: v.invalid_count, records_inserted: 0,
        invalid_rows: v.errors,
      }, 422);
    }

    // Write to the same Lovable Cloud `transactions` table the dashboards read.
    const rows = valid.map((r) => ({
      business_id,
      date: r.date,
      transaction_date: r.date,
      amount: r.amount,
      direction: r.direction,
      description: r.description,
      balance_after: r.balance,
    }));
    const { data: inserted, error: insertErr } = await localClient
      .from("transactions")
      .insert(rows)
      .select("id");
    if (insertErr) {
      await audit(0, "rejected");
      return json({ status: "rejected", error: insertErr.message, records_inserted: 0 }, 400);
    }
    const insertedCount = inserted?.length ?? 0;
    const status = insertedCount === 0 ? "rejected" : v.invalid_count > 0 ? "partial" : "success";

    // Recompute metrics now (insert has committed). Failure never fails the import.
    let recomputed = false;
    if (insertedCount > 0) {
      try {
        await computeAndStoreLiquidity(localClient, business_id);
        recomputed = true;
      } catch (e) {
        console.error(`[fyn:import] recompute failed for ${business_id}`, (e as Error).message);
      }
    }

    await audit(insertedCount, status);
    return json({
      status,
      records_total: v.total,
      records_valid: valid.length,
      records_invalid: v.invalid_count,
      records_inserted: insertedCount,
      inserted_count: insertedCount,
      invalid_rows: v.errors,
      metrics_recomputed: recomputed,
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
