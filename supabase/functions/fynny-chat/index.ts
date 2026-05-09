// Fynny — AI CFO chat. Streams via Lovable AI Gateway with the user's real
// financial context (bank, txns, subs, payables, receivables, GST).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

function inr(n: number) {
  if (!isFinite(n)) return "₹0";
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

async function buildContext(client: ReturnType<typeof createClient>) {
  const { data: profile } = await client
    .from("profiles")
    .select("business_id, full_name")
    .maybeSingle();
  const businessId = profile?.business_id;
  if (!businessId) {
    return { error: "no_business", summary: "User has no business linked yet." };
  }

  const today = new Date().toISOString().slice(0, 10);
  const ninetyAgo = new Date(Date.now() - 90 * 86400000)
    .toISOString()
    .slice(0, 10);

  const [banks, txns, subs, payables, receivables, gst, biz] =
    await Promise.all([
      client.from("bank_accounts").select("bank_name,balance,connected").eq("business_id", businessId),
      client.from("transactions").select("date,amount,direction,category,counterparty").eq("business_id", businessId).gte("date", ninetyAgo).order("date", { ascending: false }).limit(500),
      client.from("subscriptions").select("plan_type,status,mrr,billing_cycle,next_billing_date").eq("business_id", businessId),
      client.from("payables").select("vendor_name,amount,outstanding,due_date,status").eq("business_id", businessId),
      client.from("receivables").select("customer_name,amount,outstanding,due_date,status,invoice_number").eq("business_id", businessId),
      client.from("gst_filings").select("return_type,filing_period,due_date,filed_date,status,tax_payable").eq("business_id", businessId).order("due_date", { ascending: false }).limit(12),
      client.from("businesses").select("business_name,industry,state,turnover_range").eq("id", businessId).maybeSingle(),
    ]);

  const cashOnHand = (banks.data || []).reduce((s, b: any) => s + Number(b.balance || 0), 0);
  const last90Out = (txns.data || [])
    .filter((t: any) => t.direction === "out")
    .reduce((s: number, t: any) => s + Number(t.amount || 0), 0);
  const monthlyBurn = last90Out / 3;
  const runwayDays = monthlyBurn > 0 ? Math.round((cashOnHand / monthlyBurn) * 30) : null;

  const activeMrr = (subs.data || [])
    .filter((s: any) => s.status === "active")
    .reduce((s: number, x: any) => s + Number(x.mrr || 0), 0);
  const arr = activeMrr * 12;

  const overdueRecv = (receivables.data || [])
    .filter((r: any) => r.due_date && r.due_date < today && r.status !== "paid")
    .reduce((s: number, r: any) => s + Number(r.outstanding || r.amount || 0), 0);
  const totalPayablesOutstanding = (payables.data || []).reduce(
    (s: number, p: any) => s + Number(p.outstanding || 0),
    0,
  );

  const upcomingGst = (gst.data || []).filter(
    (g: any) => g.status !== "filed" && g.due_date >= today,
  )[0];

  return {
    business: biz.data,
    today,
    metrics: {
      cash_on_hand: cashOnHand,
      cash_on_hand_pretty: inr(cashOnHand),
      monthly_burn: Math.round(monthlyBurn),
      monthly_burn_pretty: inr(monthlyBurn),
      runway_days: runwayDays,
      mrr: activeMrr,
      mrr_pretty: inr(activeMrr),
      arr: arr,
      arr_pretty: inr(arr),
      overdue_receivables: overdueRecv,
      overdue_receivables_pretty: inr(overdueRecv),
      total_payables_outstanding: totalPayablesOutstanding,
      total_payables_outstanding_pretty: inr(totalPayablesOutstanding),
      next_gst_due: upcomingGst || null,
    },
    bank_accounts: banks.data || [],
    subscriptions_count: (subs.data || []).length,
    receivables_top: (receivables.data || [])
      .filter((r: any) => Number(r.outstanding || 0) > 0)
      .sort((a: any, b: any) => Number(b.outstanding) - Number(a.outstanding))
      .slice(0, 10),
    payables_top: (payables.data || [])
      .filter((p: any) => Number(p.outstanding || 0) > 0)
      .sort((a: any, b: any) => Number(b.outstanding) - Number(a.outstanding))
      .slice(0, 10),
    recent_gst_filings: gst.data || [],
    recent_transactions_sample: (txns.data || []).slice(0, 30),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });

    const { messages = [] } = await req.json();
    const context = await buildContext(supabase);

    const systemPrompt = `You are Fynny, an AI CFO assistant for Indian startups and SMEs.
You have access to the user's REAL financial data below. Answer questions conversationally with SPECIFIC numbers from the data. For calculations, briefly show your math. Use Indian currency formatting (₹, lakhs, crores). Be friendly, concise, and professional like a real CFO.

If a metric is null, missing, or zero, say so honestly — never invent numbers.

CURRENT BUSINESS DATA (as of ${new Date().toISOString()}):
${JSON.stringify(context, null, 2)}`;

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI gateway error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(aiResp.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("fynny-chat error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
