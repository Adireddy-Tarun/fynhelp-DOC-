// Copy of src/lib/bankCsv.ts for edge functions — keep both in sync.

export const HEADER_ALIASES = {
  date: ["date", "txn date", "transaction date", "value date"],
  amount: ["amount", "amt"],
  debit: ["debit", "withdrawal", "dr"],
  credit: ["credit", "deposit", "cr"],
  description: ["description", "narration", "particulars", "remarks"],
  balance: ["balance", "closing balance"],
} as const;

export type BankField = keyof typeof HEADER_ALIASES;
export type HeaderMap = Partial<Record<BankField, string>>;

const clean = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ").replace(/[.:]+$/, "");

export function detectHeaders(headers: string[]): HeaderMap {
  const map: HeaderMap = {};
  for (const field of Object.keys(HEADER_ALIASES) as BankField[]) {
    const aliases = HEADER_ALIASES[field] as readonly string[];
    const hit = headers.find((h) => aliases.includes(clean(h)));
    if (hit) map[field] = hit;
  }
  return map;
}

export function missingColumns(map: HeaderMap): string[] {
  const missing: string[] = [];
  if (!map.date) missing.push("date");
  if (!map.amount && !map.debit && !map.credit) missing.push("amount (or debit/credit)");
  return missing;
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};

function validYmd(y: number, m: number, d: number): string | null {
  if (y < 1900 || y > 2100 || m < 1 || m > 12 || d < 1) return null;
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (d > dim) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function parseIstDate(raw: string): string | null {
  const s = (raw ?? "").trim();
  if (!s) return null;
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T].*)?$/);
  if (m) return validYmd(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return validYmd(y, +m[2], +m[1]);
  }
  m = s.match(/^(\d{1,2})[-\s/]([A-Za-z]{3,4})[-\s/,]*(\d{2}|\d{4})$/);
  if (m) {
    const mon = MONTHS[m[2].toLowerCase()];
    if (!mon) return null;
    const y = m[3].length === 2 ? 2000 + +m[3] : +m[3];
    return validYmd(y, mon, +m[1]);
  }
  return null;
}

export function parseInrAmount(raw: string | number | null | undefined): number | null {
  if (raw == null) return null;
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  let s = raw.trim();
  if (!s || s === "-" || s === "—") return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1).trim(); }
  const suffix = s.match(/\s*(dr|cr)\.?$/i);
  if (suffix) { if (suffix[1].toLowerCase() === "dr") neg = !neg; s = s.slice(0, suffix.index).trim(); }
  s = s.replace(/^(₹|rs\.?|inr)\s*/i, "").trim();
  if (s.startsWith("-")) { neg = !neg; s = s.slice(1).trim(); }
  else if (s.startsWith("+")) s = s.slice(1).trim();
  s = s.replace(/^(₹|rs\.?|inr)\s*/i, "");
  if (!/^\d{1,3}(,\d{2,3})*(\.\d+)?$|^\d+(\.\d+)?$/.test(s)) return null;
  const n = Number(s.replace(/,/g, ""));
  if (!Number.isFinite(n)) return null;
  return neg ? -n : n;
}

export type ParsedBankRow = {
  date: string;
  amount: number;
  direction: "in" | "out";
  description: string;
  balance: number | null;
};

export type RowError = { row: number; reason: string };

export type BankValidation = {
  status: "success" | "partial" | "rejected";
  missing_columns: string[];
  valid: ParsedBankRow[];
  invalid_count: number;
  errors: RowError[];
  total: number;
};

export function validateBankRows(headers: string[], rows: Record<string, string>[]): BankValidation {
  const map = detectHeaders(headers);
  const missing = missingColumns(map);
  if (missing.length) {
    return { status: "rejected", missing_columns: missing, valid: [], invalid_count: rows.length, errors: [], total: rows.length };
  }
  const valid: ParsedBankRow[] = [];
  const errors: RowError[] = [];
  let invalid = 0;
  const fail = (row: number, reason: string) => { invalid++; if (errors.length < 10) errors.push({ row, reason }); };

  rows.forEach((r, i) => {
    const line = i + 2;
    const date = parseIstDate(r[map.date!] ?? "");
    if (!date) return fail(line, `invalid date "${(r[map.date!] ?? "").slice(0, 30)}"`);
    let signed: number | null = null;
    if (map.debit || map.credit) {
      const dr = map.debit ? parseInrAmount(r[map.debit]) : null;
      const cr = map.credit ? parseInrAmount(r[map.credit]) : null;
      if (dr != null && Math.abs(dr) > 0) signed = -Math.abs(dr);
      else if (cr != null && Math.abs(cr) > 0) signed = Math.abs(cr);
      else if (map.amount) signed = parseInrAmount(r[map.amount]);
    } else if (map.amount) {
      signed = parseInrAmount(r[map.amount]);
    }
    if (signed == null) return fail(line, "missing or unreadable amount");
    if (signed === 0) return fail(line, "amount is zero");
    const bal = map.balance ? parseInrAmount(r[map.balance]) : null;
    valid.push({
      date,
      amount: Math.abs(signed),
      direction: signed < 0 ? "out" : "in",
      description: (map.description ? r[map.description] : "")?.trim() || "-",
      balance: bal,
    });
  });

  const status = valid.length === 0 ? "rejected" : invalid > 0 ? "partial" : "success";
  return { status, missing_columns: [], valid, invalid_count: invalid, errors, total: rows.length };
}
