import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const ADMIN_EMAILS = [
  "adireddytarun@fynhelp.com",
  "nidhi@fynhelp.com",
  "support@fynhelp.com",
];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json",
};

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: cors });

type Action = "approve" | "reject" | "suspend" | "reactivate";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader) return json({ success: false, error: "Unauthorized" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: userRes } = await admin.auth.getUser(authHeader.replace("Bearer ", ""));
  const email = userRes?.user?.email?.toLowerCase().trim();
  if (!email || !ADMIN_EMAILS.includes(email)) {
    return json({ success: false, error: "Forbidden" }, 403);
  }

  let body: { op?: "list" | "review"; firm_id?: string; action?: Action; reason?: string };
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid body" }, 400);
  }

  const op = body.op ?? "list";

  if (op === "list") {
    const { data, error } = await admin
      .from("ca_firms")
      .select(
        "id, firm_name, ca_name, icai_membership_number, email, phone, city, state, is_verified, is_active, verification_status, verification_submitted_at, verification_reviewed_at, verification_rejected_reason, created_at",
      )
      .eq("is_demo", false)
      .order("verification_submitted_at", { ascending: false, nullsFirst: false });
    if (error) return json({ success: false, error: error.message }, 500);
    return json({ success: true, firms: data ?? [] });
  }

  if (op === "audit") {
    const firm_id = body.firm_id;
    if (!firm_id) return json({ success: false, error: "firm_id required" }, 400);
    const { data, error } = await admin
      .from("ca_approval_log")
      .select("id, ca_firm_id, reviewed_by_email, action, reason, created_at")
      .eq("ca_firm_id", firm_id)
      .order("created_at", { ascending: false });
    if (error) return json({ success: false, error: error.message }, 500);
    return json({ success: true, log: data ?? [] });
  }



  const { firm_id, action } = body;
  const reason = (body.reason ?? "").trim();
  if (!firm_id || !action || !["approve", "reject", "suspend", "reactivate"].includes(action)) {
    return json({ success: false, error: "firm_id and a valid action are required" }, 400);
  }
  if ((action === "reject" || action === "suspend") && !reason) {
    return json({ success: false, error: "A reason is required for this action" }, 400);
  }

  const { data: firm, error: firmErr } = await admin
    .from("ca_firms")
    .select("id, firm_name, ca_name, icai_membership_number, email")
    .eq("id", firm_id)
    .maybeSingle();
  if (firmErr) return json({ success: false, error: firmErr.message }, 500);
  if (!firm) return json({ success: false, error: "Firm not found" }, 404);

  const now = new Date().toISOString();
  const positive = action === "approve" || action === "reactivate";

  const patch: Record<string, unknown> = {
    verification_status: positive ? "approved" : "rejected",
    is_verified: positive,
    is_active: positive,
    verification_reviewed_at: now,
    verification_rejected_reason: positive ? null : reason,
    updated_at: now,
  };

  const { error: updErr } = await admin.from("ca_firms").update(patch).eq("id", firm_id);
  if (updErr) return json({ success: false, error: updErr.message }, 500);

  const logAction =
    action === "approve" ? "approved"
    : action === "reject" ? "rejected"
    : action === "suspend" ? "suspended"
    : "reactivated";

  const { error: logErr } = await admin.from("ca_approval_log").insert({
    ca_firm_id: firm_id,
    reviewed_by_email: email,
    action: logAction,
    reason: positive ? null : reason,
  });
  if (logErr) console.error("approval log insert failed", logErr);

  const firmName = firm.firm_name ?? "your firm";
  const notif = positive
    ? {
        title:
          action === "approve"
            ? "Your CA firm has been approved"
            : "Your CA firm has been reactivated",
        message: `Congratulations. Your firm ${firmName} has been verified on FynHelp. You can now onboard clients.`,
        severity: "info",
      }
    : {
        title:
          action === "reject"
            ? "Your CA firm registration was not approved"
            : "Your CA firm account has been suspended",
        message: `Your firm ${firmName} could not be verified. Reason: ${reason}. Please contact support@fynhelp.com for assistance.`,
        severity: "warning",
      };

  const { error: notifErr } = await admin.from("ca_notifications").insert({
    ca_firm_id: firm_id,
    business_id: null,
    type: "verification",
    title: notif.title,
    message: notif.message,
    severity: notif.severity,
    is_read: false,
    is_demo: false,
  });
  if (notifErr) console.error("notification insert failed", notifErr);

  // Email the CA via the shared ca-send-email function.
  let email_sent = false;
  let email_error: string | null = null;
  if (firm.email) {
    const subject = positive
      ? "Your FynHelp CA account has been approved"
      : "Update on your FynHelp CA application";
    const text = positive
      ? `Dear ${firm.ca_name ?? "CA"}, your firm ${firmName} has been approved on FynHelp. Your ICAI membership ${firm.icai_membership_number ?? ""} has been verified. You can now log in and start onboarding clients at fynhelp.com/ca/login. — Team FynHelp`
      : `Dear ${firm.ca_name ?? "CA"}, we were unable to verify your firm ${firmName} on FynHelp. Reason: ${reason}. Please email support@fynhelp.com with any questions. — Team FynHelp`;

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ca-send-email`, {
        method: "POST",
        headers: { Authorization: authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({ to: firm.email, subject, body: text }),
      });
      const payload = await res.json().catch(() => ({}));
      email_sent = res.ok && payload?.success !== false;
      if (!email_sent) email_error = payload?.error ?? `HTTP ${res.status}`;
    } catch (e) {
      email_error = String(e);
    }
  }

  return json({ success: true, action: logAction, email_sent, email_error });
});
