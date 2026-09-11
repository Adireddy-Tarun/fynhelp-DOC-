/**
 * Gmail intake — server-only helpers.
 *
 * Tokens are encrypted at rest with AES-GCM using GMAIL_ENCRYPTION_KEY.
 * Client identification runs here (server side) only, never in the browser.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { detectAmountPattern, normaliseAmount } from "@/lib/bankAmount";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Admin = SupabaseClient<any, any, any>;

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

const ALLOWED_ORIGINS = [
  "https://fynhelp.com",
  "https://www.fynhelp.com",
  "https://fynhelp.lovable.app",
  "http://localhost:8080",
];
const ORIGIN_PATTERNS = [/^https:\/\/[a-z0-9-]+\.lovable\.app$/i, /^https:\/\/[a-z0-9-]+\.lovableproject\.com$/i];

export const CALLBACK_PATH = "/ca/integrations/gmail/callback";

/** Only ever redirect Google back to one of our own origins. */
export function redirectUriFor(origin: string | null | undefined): string {
  const fallback = process.env["GMAIL_REDIRECT_URI"] ?? `https://fynhelp.com${CALLBACK_PATH}`;
  if (!origin) return fallback;
  const ok = ALLOWED_ORIGINS.includes(origin) || ORIGIN_PATTERNS.some((re) => re.test(origin));
  return ok ? `${origin}${CALLBACK_PATH}` : fallback;
}

export function gmailCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env["GMAIL_CLIENT_ID"] ?? "";
  const clientSecret = process.env["GMAIL_CLIENT_SECRET"] ?? "";
  if (!clientId || !clientSecret) {
    throw new Error("GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET are not configured");
  }
  return { clientId, clientSecret };
}

/* ---------------- token encryption ---------------- */

async function aesKey(): Promise<CryptoKey> {
  const raw = process.env["GMAIL_ENCRYPTION_KEY"] ?? "";
  if (!raw) throw new Error("GMAIL_ENCRYPTION_KEY is not configured");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

function toB64(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

export async function encryptToken(token: string): Promise<string> {
  const key = await aesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(token)),
  );
  const out = new Uint8Array(iv.length + cipher.length);
  out.set(iv, 0);
  out.set(cipher, iv.length);
  return toB64(out);
}

export async function decryptToken(enc: string): Promise<string> {
  const key = await aesKey();
  const bytes = fromB64(enc);
  const iv = bytes.slice(0, 12);
  const cipher = bytes.slice(12);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return new TextDecoder().decode(plain);
}

/* ---------------- oauth ---------------- */

export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function exchangeCode(code: string, redirectUri: string): Promise<GoogleTokens> {
  const { clientId, clientSecret } = gmailCredentials();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const body = (await res.json()) as GoogleTokens & { error?: string; error_description?: string };
  if (!res.ok || body.error) throw new Error(body.error_description ?? body.error ?? "Token exchange failed");
  return body;
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number } | null> {
  const { clientId, clientSecret } = gmailCredentials();
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const body = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!res.ok || body.error || !body.access_token) return null;
  return { access_token: body.access_token, expires_in: body.expires_in ?? 3600 };
}

export async function fetchGmailAddress(accessToken: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/oauth2/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const body = (await res.json()) as { email?: string };
  if (!body.email) throw new Error("Could not read the Google account email");
  return body.email;
}

export async function revokeToken(accessToken: string): Promise<void> {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(accessToken)}`, {
    method: "POST",
  }).catch(() => undefined);
}

/* ---------------- 5-layer client identification ---------------- */

export interface ClientMatch {
  businessId: string | null;
  method: "exact" | "learned" | "domain" | "name" | "gstin" | "none";
  confidence: number;
}

const GSTIN_RE = /[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}/;

export async function identifyClient(
  admin: Admin,
  firmId: string,
  senderEmail: string,
  senderName: string,
  subject: string,
): Promise<ClientMatch> {
  const domain = senderEmail.split("@")[1] ?? "";

  const { data: clients } = await admin
    .from("ca_clients")
    .select("business_id, client_email, client_name, gstin")
    .eq("ca_firm_id", firmId);
  const list = (clients ?? []).filter((c: any) => c.business_id);

  // Layer 1 — exact sender email on the client record.
  const exact = list.find((c: any) => (c.client_email ?? "").toLowerCase() === senderEmail.toLowerCase());
  if (exact) return { businessId: exact.business_id, method: "exact", confidence: 1 };

  // Layer 2 — a mapping a human already confirmed.
  const { data: learned } = await admin
    .from("ca_email_sender_mappings")
    .select("business_id")
    .eq("ca_firm_id", firmId)
    .eq("sender_email", senderEmail)
    .not("confirmed_at", "is", null)
    .maybeSingle();
  if (learned?.business_id) return { businessId: learned.business_id, method: "learned", confidence: 0.95 };

  // Layer 3 — unique domain match.
  if (domain) {
    const domainMatches = list.filter((c: any) => (c.client_email ?? "").split("@")[1]?.toLowerCase() === domain.toLowerCase());
    if (domainMatches.length === 1) {
      return { businessId: domainMatches[0].business_id, method: "domain", confidence: 0.75 };
    }
  }

  // Layer 4 — fuzzy sender-name match.
  if (senderName) {
    const senderTokens = senderName.toLowerCase().split(/\s+/).filter(Boolean);
    let bestScore = 0;
    let bestId: string | null = null;
    for (const c of list) {
      const clientTokens = String(c.client_name ?? "").toLowerCase().split(/\s+/).filter(Boolean);
      if (!clientTokens.length || !senderTokens.length) continue;
      const common = senderTokens.filter((t) => clientTokens.includes(t)).length;
      const total = new Set([...senderTokens, ...clientTokens]).size;
      const score = total > 0 ? common / total : 0;
      if (score > bestScore) {
        bestScore = score;
        bestId = c.business_id;
      }
    }
    if (bestScore > 0.7 && bestId) return { businessId: bestId, method: "name", confidence: 0.65 };
  }

  // Layer 5 — GSTIN quoted in the subject line.
  const gstin = subject.match(GSTIN_RE)?.[0];
  if (gstin) {
    const byGstin = list.find((c: any) => (c.gstin ?? "").toUpperCase() === gstin);
    if (byGstin) return { businessId: byGstin.business_id, method: "gstin", confidence: 0.7 };
  }

  return { businessId: null, method: "none", confidence: 0 };
}

/* ---------------- deterministic CSV parsing (server side) ---------------- */

export interface ParsedRow {
  date: string;
  description: string;
  amount: number;
  direction: "debit" | "credit";
}

export function parseBankCsvText(text: string): ParsedRow[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const sep = text.includes("\t") ? "\t" : text.includes("|") ? "|" : ",";
  let headerIdx = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (lines[i].split(sep).length >= 3) {
      headerIdx = i;
      break;
    }
  }
  const clean = (c: string) => c.replace(/^["']|["']$/g, "").trim();
  const headers = lines[headerIdx].split(sep).map(clean);
  const dataRows = lines.slice(headerIdx + 1).map((l) => l.split(sep).map(clean));
  const detected = detectAmountPattern(headers, dataRows.slice(0, 10));
  const dateIdx = headers.findIndex((h) => /date|dt|value date|transaction date/i.test(h));
  const descIdx = headers.findIndex((h) => /description|narration|particular|remarks|details|memo|note/i.test(h));

  const rows: ParsedRow[] = [];
  for (const cols of dataRows) {
    if (cols.length < 2) continue;
    const rawDate = dateIdx >= 0 ? cols[dateIdx] : "";
    const rawDesc = descIdx >= 0 ? cols[descIdx] : cols[1] ?? "";
    const signed = normaliseAmount(
      detected.amountIdx >= 0 ? cols[detected.amountIdx] : undefined,
      detected.typeIdx >= 0 ? cols[detected.typeIdx] : undefined,
      detected.debitIdx >= 0 ? cols[detected.debitIdx] : undefined,
      detected.creditIdx >= 0 ? cols[detected.creditIdx] : undefined,
    );
    if (signed === 0 && !rawDate) continue;
    rows.push({
      date: rawDate,
      description: rawDesc,
      amount: Math.abs(signed),
      direction: signed < 0 ? "debit" : "credit",
    });
  }
  return rows;
}

/** Confidence of a CSV extraction: how complete the parsed rows are. */
export function scoreRows(rows: ParsedRow[]): number {
  if (!rows.length) return 0;
  let filled = 0;
  let total = 0;
  for (const r of rows) {
    for (const v of [r.date, r.description, r.amount, r.direction]) {
      total += 1;
      if (v !== null && v !== undefined && String(v).trim() !== "") filled += 1;
    }
  }
  const completeness = total ? filled / total : 0;
  const volumeFactor = rows.length < 3 ? 0.9 : 1;
  return Math.round(completeness * volumeFactor * 100) / 100;
}

export function classifyByFilename(filename: string): "bank" | "invoice" | "expense" | "challan" | "other" {
  const f = filename.toLowerCase();
  if (/(statement|bank|passbook|acct|account)/.test(f)) return "bank";
  if (/(invoice|inv[-_ ]?\d|bill[-_ ]?to|sales)/.test(f)) return "invoice";
  if (/(expense|purchase|vendor|receipt|voucher)/.test(f)) return "expense";
  if (/(challan|gst|tds|itns|payment[-_ ]?ack)/.test(f)) return "challan";
  return "other";
}
