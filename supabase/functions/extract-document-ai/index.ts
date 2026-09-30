// Extract structured financial data from a photo or PDF using Gemini via the
// Lovable AI Gateway. Returns strict JSON matching the shape the existing
// CSV importer already consumes, so the frontend can reuse its insertion path.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { rejectDisallowedOrigin, rejectOversizedBody } from "../_shared/cors.ts";
import { checkAiQuota, quotaExceededResponse, logAiUsage, estimateTokens } from "../_shared/ai-metering.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

type DocType = "bank" | "invoice" | "expense";

const PROMPTS: Record<DocType, string> = {
  bank: `Extract every transaction row visible in this bank statement.
Return STRICT JSON ONLY (no prose, no markdown fences) of the form:
{"rows":[{"date":"YYYY-MM-DD","description":"...","amount":<number>,"direction":"debit"|"credit"}]}
Rules:
- amount is always a POSITIVE number (no minus sign, no commas, no currency symbol).
- direction is "debit" if money went out of the account (withdrawal), "credit" if money came in (deposit).
- Parse Indian date formats (DD/MM/YYYY, DD-MM-YY, DD MMM YYYY) into ISO YYYY-MM-DD.
- Skip the opening/closing balance row.
- If no transactions are visible, return {"rows":[]}.`,
  invoice: `Extract every invoice/receivable line item visible.
Return STRICT JSON ONLY of the form:
{"rows":[{"customer":"...","invoice_number":"...","amount":<number>,"date":"YYYY-MM-DD"}]}
- amount positive, no currency symbol.
- Parse Indian date formats to ISO YYYY-MM-DD.
- If no invoices are visible, return {"rows":[]}.`,
  expense: `Extract every expense / payable / bill line item visible.
Return STRICT JSON ONLY of the form:
{"rows":[{"vendor":"...","category":"...","amount":<number>,"date":"YYYY-MM-DD"}]}
- amount positive, no currency symbol.
- Parse Indian date formats to ISO YYYY-MM-DD.
- category may be an empty string if not obvious.
- If no expenses are visible, return {"rows":[]}.`,
};

type Category = "bank_statement" | "sales_invoice" | "purchase_invoice" | "expense_receipt" | "tds_record" | "reference_document";

const CATEGORY_PROMPTS: Record<Category, string> = {
  bank_statement: `Extract every transaction row in this bank statement.
Return STRICT JSON ONLY: {"rows":[{"date":"YYYY-MM-DD","description":"...","amount":<positive number>,"type":"credit"|"debit","balance":<number or null>}]}
- type "debit" for withdrawals, "credit" for deposits. Skip opening/closing balance rows.`,
  sales_invoice: `This is an outward (sales) GST invoice. Extract each invoice.
Return STRICT JSON ONLY: {"rows":[{"invoice_number":"...","invoice_date":"YYYY-MM-DD","due_date":"YYYY-MM-DD or empty","customer_name":"...","customer_gstin":"15-char GSTIN or empty","taxable_value":<number>,"cgst":<number>,"sgst":<number>,"igst":<number>,"total_amount":<number>}]}
- Use 0 for tax heads not present. Either cgst+sgst or igst, never both.`,
  purchase_invoice: `This is an inward (purchase) GST bill received from a supplier. Extract each bill.
Return STRICT JSON ONLY: {"rows":[{"invoice_number":"...","invoice_date":"YYYY-MM-DD","due_date":"YYYY-MM-DD or empty","vendor_name":"...","vendor_gstin":"15-char GSTIN or empty","taxable_value":<number>,"cgst":<number>,"sgst":<number>,"igst":<number>,"total_amount":<number>}]}
- Use 0 for tax heads not present. Either cgst+sgst or igst, never both.`,
  expense_receipt: `This is an expense receipt without GST. Extract each line.
Return STRICT JSON ONLY: {"rows":[{"date":"YYYY-MM-DD","vendor_name":"...","description":"...","amount":<positive number>}]}`,
  tds_record: `This is a TDS challan or TDS certificate (Form 16A / 281). Extract each deduction.
Return STRICT JSON ONLY: {"rows":[{"section_code":"e.g. 194C","deductee_name":"...","deductee_pan":"10-char PAN or empty","payment_date":"YYYY-MM-DD","payment_amount":<number>,"tds_rate":<number percent>,"tds_amount":<number>,"challan_number":"... or empty","challan_date":"YYYY-MM-DD or empty"}]}`,
  reference_document: `This is a reference document (agreement, loan letter, notice, KYC).
Return STRICT JSON ONLY: {"rows":[],"summary":"one line description of the document"}`,
};

const CATEGORY_REQUIRED: Record<Category, string[]> = {
  bank_statement: ["date", "description", "amount", "type"],
  sales_invoice: ["invoice_number", "invoice_date", "customer_name", "total_amount"],
  purchase_invoice: ["invoice_number", "invoice_date", "vendor_name", "total_amount"],
  expense_receipt: ["date", "vendor_name", "amount"],
  tds_record: ["section_code", "deductee_name", "payment_date", "tds_amount"],
  reference_document: [],
};

function tryParseJson(raw: string): any | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  try { return JSON.parse(cleaned); } catch {}
  // fallback: extract first {...} block
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch {} }
  return null;
}

function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.length !== y.length || x.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

class ProviderError extends Error {
  status: number | null;
  constructor(message: string, status: number | null) {
    super(message);
    this.status = status;
  }
}

type ProviderResult = { text: string; tokens: number | null };

async function callGoogleGemini(
  promptText: string,
  systemText: string,
  base64Data: string,
  mimeType: string,
): Promise<ProviderResult> {
  const raw = base64Data.replace(/^data:[^;,]*;base64,/, "");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60_000);
  let resp: Response;
  try {
    resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent",
      {
        method: "POST",
        signal: ctrl.signal,
        headers: {
          "x-goog-api-key": Deno.env.get("GEMINI_API_KEY") ?? "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemText }] },
          contents: [{
            role: "user",
            parts: [
              { text: promptText },
              { inline_data: { mime_type: mimeType, data: raw } },
            ],
          }],
          generationConfig: { responseMimeType: "application/json", temperature: 0 },
        }),
      },
    );
  } catch (e) {
    const reason = (e as Error)?.name === "AbortError" ? "timeout" : "network";
    throw new ProviderError(`google ${reason}`, null);
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    await resp.body?.cancel().catch(() => {});
    throw new ProviderError(`google http ${resp.status}`, resp.status);
  }
  const json = await resp.json().catch(() => null);
  const cand = json?.candidates?.[0];
  if (!cand) throw new ProviderError(`google http ${resp.status} finishReason=none`, resp.status);
  const finish = String(cand.finishReason ?? "");
  if (finish === "SAFETY" || finish === "RECITATION") {
    throw new ProviderError(`google http ${resp.status} finishReason=${finish}`, resp.status);
  }
  const parts: Array<{ text?: string }> = cand?.content?.parts ?? [];
  const text = parts.filter((p) => typeof p?.text === "string").map((p) => p.text).join("");
  const tokens = typeof json?.usageMetadata?.totalTokenCount === "number"
    ? json.usageMetadata.totalTokenCount
    : null;
  return { text, tokens };
}

async function callLovableGateway(
  promptText: string,
  systemText: string,
  dataUrl: string,
): Promise<ProviderResult> {
  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemText },
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!aiResp.ok) {
    const detail = await aiResp.text().catch(() => "");
    console.error("extract-document-ai gateway error", aiResp.status, detail.slice(0, 300));
    throw new ProviderError(`lovable http ${aiResp.status}`, aiResp.status);
  }
  const json = await aiResp.json();
  const text = String(json?.choices?.[0]?.message?.content ?? "");
  return { text, tokens: json?.usage?.total_tokens ?? null };
}

const SYSTEM_TEXT =
  "You extract structured financial data from images and PDFs of Indian bank statements, invoices, and expense bills. Output STRICT JSON only, no prose, no markdown fences.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const originBlock = rejectDisallowedOrigin(req);
  if (originBlock) return originBlock;
  const sizeBlock = rejectOversizedBody(req, 25_000_000);
  if (sizeBlock) return sizeBlock;

  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bearer = auth.slice("Bearer ".length);
    const internalCall = safeEqual(bearer, SUPABASE_SERVICE_ROLE_KEY ?? "");
    const requestBody = await req.json().catch(() => ({}));
    const supabase = createClient(SUPABASE_URL, internalCall ? SUPABASE_SERVICE_ROLE_KEY : SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = internalCall ? { data: { user: null } } : await supabase.auth.getUser();
    const userId = userData?.user?.id ?? (internalCall ? String(requestBody?.userId || "") : "");
    if (!userId) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profileRow } = internalCall
      ? { data: null }
      : await supabase.from("profiles").select("business_id").eq("user_id", userId).maybeSingle();
    const businessId = internalCall
      ? String(requestBody?.businessId || "") || null
      : (profileRow as { business_id?: string } | null)?.business_id ?? null;

    const quota = await checkAiQuota(businessId, userId);
    if (!quota.allowed) {
      await logAiUsage({
        userId, businessId, feature: "document_extraction",
        model: Deno.env.get("GEMINI_API_KEY") ? "gemini-3.5-flash (google)" : "google/gemini-2.5-flash (lovable)",
        prompt: "(blocked before call)",
        status: "blocked", errorMessage: "daily_limit_reached",
      });
      return quotaExceededResponse(quota, corsHeaders);
    }

    const startedAt = Date.now();
    const body = requestBody;
    const category = (String(body?.category || "") || null) as Category | null;
    const docType = String(body?.doc_type || "") as DocType;
    const fileBase64 = String(body?.file_base64 || "");
    const mimeType = String(body?.mime_type || "image/png");

    if (category && !(category in CATEGORY_PROMPTS)) {
      return new Response(JSON.stringify({ error: "invalid category" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!category && !["bank", "invoice", "expense"].includes(docType)) {
      return new Response(JSON.stringify({ error: "invalid doc_type" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!fileBase64 || fileBase64.length > 12_000_000) {
      return new Response(JSON.stringify({ error: "file missing or too large (max ~9MB)" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const dataUrl = fileBase64.startsWith("data:")
      ? fileBase64
      : `data:${mimeType};base64,${fileBase64}`;

    const promptText = category ? CATEGORY_PROMPTS[category] : PROMPTS[docType];
    const label = category ?? docType;
    let provider: "google" | "lovable" = "lovable";
    let result: ProviderResult | null = null;
    let lastStatus: number | null = null;

    if (Deno.env.get("GEMINI_API_KEY")) {
      try {
        result = await callGoogleGemini(promptText, SYSTEM_TEXT, fileBase64, mimeType);
        provider = "google";
      } catch (e) {
        const st = e instanceof ProviderError && e.status ? String(e.status) : (e as Error)?.message ?? "error";
        console.warn(`[fyn:ocr] google failed (${st}) — falling back to lovable gateway`);
      }
    }
    if (!result) {
      try {
        result = await callLovableGateway(promptText, SYSTEM_TEXT, dataUrl);
        provider = "lovable";
      } catch (e) {
        lastStatus = e instanceof ProviderError ? e.status : null;
      }
    }
    const modelLabel = provider === "google" ? "gemini-3.5-flash (google)" : "google/gemini-2.5-flash (lovable)";

    if (!result) {
      const status = lastStatus === 429 || lastStatus === 402 ? lastStatus : 500;
      const msg =
        lastStatus === 429
          ? "Rate limited. Try again in a moment."
          : lastStatus === 402
          ? "AI credits exhausted."
          : "AI gateway error";
      await logAiUsage({
        userId, businessId, feature: "document_extraction",
        model: modelLabel, prompt: `doc_type=${docType}`,
        responseTimeMs: Date.now() - startedAt, status: "error", errorMessage: msg,
      });
      return new Response(JSON.stringify({ error: msg }), {
        status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const raw = result.text;
    const parsed = tryParseJson(raw);
    const okParsed = !!parsed && Array.isArray(parsed.rows);
    const elapsed = Date.now() - startedAt;
    const tokens = result.tokens ?? estimateTokens(raw);
    console.log(`[fyn:ocr] provider=${provider} category=${label} ms=${elapsed} tokens=${tokens}`);
    await logAiUsage({
      userId, businessId, feature: "document_extraction",
      model: modelLabel, prompt: `doc_type=${docType}`,
      response: `rows=${okParsed ? parsed.rows.length : 0} parsed=${okParsed}`,
      tokensUsed: tokens,
      responseTimeMs: elapsed, status: "success",
    });

    if (!okParsed) {
      console.error("extract-document-ai unparseable AI response", { provider, length: raw.length });
      return new Response(JSON.stringify({ error: "Could not parse AI response as JSON" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const required: Record<DocType, string[]> = {
      bank: ["date", "description", "amount", "direction"],
      invoice: ["customer", "invoice_number", "amount", "date"],
      expense: ["vendor", "amount", "date"],
    };
    if (category) {
      const cf = CATEGORY_REQUIRED[category];
      const tot = parsed.rows.length * cf.length;
      const fil = parsed.rows.reduce(
        (sum: number, row: Record<string, unknown>) => sum + cf.filter((f) => String(row[f] ?? "").trim() !== "").length, 0);
      const vf = category === "bank_statement" && parsed.rows.length < 3 ? 0.9 : 1;
      const conf = category === "reference_document" ? 1 : tot > 0 ? Math.round((fil / tot) * vf * 100) / 100 : 0;
      return new Response(JSON.stringify({ rows: parsed.rows, category, summary: typeof parsed.summary === "string" ? parsed.summary : null, confidence: conf }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const fields = required[docType];
    const total = parsed.rows.length * fields.length;
    const filled = parsed.rows.reduce(
      (sum: number, row: Record<string, unknown>) => sum + fields.filter((field) => String(row[field] ?? "").trim() !== "").length,
      0,
    );
    const volumeFactor = docType === "bank" && parsed.rows.length < 3 ? 0.9 : 1;
    const confidence = total > 0 ? Math.round((filled / total) * volumeFactor * 100) / 100 : 0;
    return new Response(JSON.stringify({ rows: parsed.rows, doc_type: docType, confidence }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-document-ai error", String(e instanceof Error ? e.message : e).slice(0, 300));
    return new Response(JSON.stringify({ error: "Extraction failed. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
