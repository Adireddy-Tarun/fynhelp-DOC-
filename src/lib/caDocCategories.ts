/**
 * Review Queue document categories — one source of truth for the category
 * select, the editable table columns, validation, and the posting target.
 */
import { financialYearOf, fyQuarterOf } from "@/lib/istDate";

export const DOC_CATEGORIES = [
  { value: "bank_statement", label: "Bank statement", target: "bank_transactions" },
  { value: "sales_invoice", label: "Sales invoice (outward)", target: "invoices" },
  { value: "purchase_invoice", label: "Purchase bill (inward)", target: "expenses + ca_itc_records" },
  { value: "expense_receipt", label: "Expense receipt (no GST)", target: "expenses" },
  { value: "tds_record", label: "TDS challan or certificate", target: "ca_tds_records" },
  { value: "reference_document", label: "Reference only (loan letter, agreement, notice, KYC)", target: "vault only" },
] as const;
export type DocCategory = typeof DOC_CATEGORIES[number]["value"];

export const CATEGORY_FIELDS: Record<DocCategory, string[]> = {
  bank_statement: ["date", "description", "amount", "type", "balance"],
  sales_invoice: ["invoice_number", "invoice_date", "due_date", "customer_name", "customer_gstin", "taxable_value", "cgst", "sgst", "igst", "total_amount"],
  purchase_invoice: ["invoice_number", "invoice_date", "due_date", "vendor_name", "vendor_gstin", "taxable_value", "cgst", "sgst", "igst", "total_amount"],
  expense_receipt: ["date", "vendor_name", "description", "amount"],
  tds_record: ["section_code", "deductee_name", "deductee_pan", "payment_date", "payment_amount", "tds_rate", "tds_amount", "challan_number", "challan_date"],
  reference_document: [],
};

const DATE_FIELDS = new Set(["date", "invoice_date", "due_date", "payment_date", "challan_date"]);
const REQUIRED_DATES = new Set(["date", "invoice_date", "payment_date"]);
const AMOUNT_FIELDS = new Set(["amount", "balance", "taxable_value", "cgst", "sgst", "igst", "total_amount", "payment_amount", "tds_rate", "tds_amount"]);
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

export const POST_LABEL: Record<DocCategory, string> = {
  bank_statement: "Post to bank ledger",
  sales_invoice: "Post to sales register",
  purchase_invoice: "Post to purchases and ITC",
  expense_receipt: "Post to expenses",
  tds_record: "Post to TDS register",
  reference_document: "File to vault",
};

export function categoryLabel(c: string): string {
  return DOC_CATEGORIES.find((d) => d.value === c)?.label ?? c;
}

export function isDocCategory(v: string): v is DocCategory {
  return DOC_CATEGORIES.some((d) => d.value === v);
}

/** Map legacy classification values onto the six categories. */
export function mapClassification(raw: string | null | undefined): DocCategory {
  const v = String(raw ?? "").toLowerCase();
  if (isDocCategory(v)) return v;
  if (v === "bank" || v === "bank_statement") return "bank_statement";
  if (v === "invoice") return "sales_invoice";
  if (v === "expense" || v === "purchase_order" || v === "bill") return "purchase_invoice";
  if (v === "challan" || v === "tds") return "tds_record";
  return "reference_document";
}

const blank = (v: unknown) => v === null || v === undefined || String(v).trim() === "";
export const toNum = (v: unknown): number => {
  if (blank(v)) return 0;
  const n = Number(String(v).replace(/[,₹\s]/g, ""));
  return Number.isFinite(n) ? n : NaN;
};

/** Bring legacy row shapes (direction, customer, vendor, date) onto category keys. */
export function normaliseRows(category: DocCategory, rows: Record<string, unknown>[]): Record<string, unknown>[] {
  return rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const f of CATEGORY_FIELDS[category]) o[f] = r[f] ?? "";
    if (category === "bank_statement" && blank(o.type) && r.direction) o.type = String(r.direction).toLowerCase();
    if (category === "sales_invoice") {
      if (blank(o.customer_name) && r.customer) o.customer_name = r.customer;
      if (blank(o.invoice_date) && r.date) o.invoice_date = r.date;
      if (blank(o.total_amount) && r.amount) o.total_amount = r.amount;
    }
    if (category === "purchase_invoice") {
      if (blank(o.vendor_name) && (r.vendor || r.supplier_name)) o.vendor_name = r.vendor ?? r.supplier_name;
      if (blank(o.vendor_gstin) && (r.supplier_gstin || r.gstin)) o.vendor_gstin = r.supplier_gstin ?? r.gstin;
      if (blank(o.invoice_date) && r.date) o.invoice_date = r.date;
      if (blank(o.total_amount) && r.amount) o.total_amount = r.amount;
    }
    if (category === "expense_receipt" && blank(o.vendor_name) && r.vendor) o.vendor_name = r.vendor;
    return o;
  });
}

export function validateRows(category: DocCategory, rows: Record<string, unknown>[]): string[] {
  const errs: string[] = [];
  const fields = CATEGORY_FIELDS[category];
  rows.forEach((r, i) => {
    const n = `Row ${i + 1}`;
    for (const f of fields) {
      const v = r[f];
      if (DATE_FIELDS.has(f)) {
        if (blank(v)) { if (REQUIRED_DATES.has(f)) errs.push(`${n}: ${f.replace(/_/g, " ")} is required (YYYY-MM-DD)`); continue; }
        const s = String(v).trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(new Date(s).getTime())) errs.push(`${n}: ${f.replace(/_/g, " ")} must be YYYY-MM-DD`);
      } else if (AMOUNT_FIELDS.has(f)) {
        if (f === "balance" && blank(v)) continue;
        const x = toNum(v);
        if (!Number.isFinite(x)) errs.push(`${n}: ${f.replace(/_/g, " ")} is not a number`);
        else if (x < 0 && f !== "balance") errs.push(`${n}: ${f.replace(/_/g, " ")} cannot be negative`);
      }
    }
    if (category === "bank_statement") {
      const t = String(r.type ?? "").toLowerCase();
      if (t !== "credit" && t !== "debit") errs.push(`${n}: type must be credit or debit`);
      if (!(toNum(r.amount) > 0)) errs.push(`${n}: amount must be greater than zero`);
    }
    if (category === "sales_invoice" || category === "purchase_invoice") {
      const [tv, c, s, ig, tot] = ["taxable_value", "cgst", "sgst", "igst", "total_amount"].map((k) => toNum(r[k]));
      if ([tv, c, s, ig, tot].every(Number.isFinite)) {
        if (Math.abs(tv + c + s + ig - tot) > 1) errs.push(`${n}: taxable value + CGST + SGST + IGST must equal total within ₹1`);
        if ((c > 0 || s > 0) && ig > 0) errs.push(`${n}: use either CGST + SGST or IGST, not both`);
        if ((c > 0) !== (s > 0)) errs.push(`${n}: CGST and SGST must both be set`);
      }
      if (blank(r.invoice_number)) errs.push(`${n}: invoice number is required`);
      const g = String(r[category === "sales_invoice" ? "customer_gstin" : "vendor_gstin"] ?? "").trim().toUpperCase();
      if (g && !GSTIN_RE.test(g)) errs.push(`${n}: GSTIN format is invalid`);
    }
    if (category === "tds_record") {
      const p = String(r.deductee_pan ?? "").trim().toUpperCase();
      if (p && !PAN_RE.test(p)) errs.push(`${n}: PAN format is invalid`);
      if (blank(r.section_code)) errs.push(`${n}: section code is required`);
    }
  });
  return errs;
}

/** Indian FY (April–March) and quarter for a YYYY-MM-DD date — no timezone shifting. */
export function fyQuarter(iso: string): { financial_year: string; quarter: string } {
  return { financial_year: financialYearOf(iso), quarter: fyQuarterOf(iso) };
}

/** "Mon YYYY", matching the ITC recon period label (and the database posting function). */
export function filingPeriod(iso: string): string {
  const m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(iso.slice(5, 7)) - 1];
  return `${m} ${iso.slice(0, 4)}`;
}

/**
 * Which document categories answer a request type. Mirror of the SQL function
 * public.ca_request_type_categories — keep both in step.
 */
export function requestTypeCategories(type: string | null | undefined): DocCategory[] {
  const t = String(type ?? "").toLowerCase();
  if (t === "bank" || t.includes("bank")) return ["bank_statement"];
  if (t === "invoice" || t === "sales_invoice" || t.includes("sales")) return ["sales_invoice"];
  if (["expense", "purchase_invoice", "expense_receipt"].includes(t) || t.includes("purchase") || t.includes("expense") || t.includes("bill")) return ["purchase_invoice", "expense_receipt"];
  if (["challan", "tds", "tds_record"].includes(t) || t.includes("tds") || t.includes("challan")) return ["tds_record"];
  return DOC_CATEGORIES.map((d) => d.value);
}

export function postedLabel(postedRef: string | null | undefined): string | null {
  if (!postedRef) return null;
  try {
    const o = JSON.parse(postedRef) as Record<string, string[]>;
    const names: Record<string, string> = {
      bank_transactions: "Bank ledger", invoices: "Sales register", expenses: "Expenses",
      ca_itc_records: "ITC register", ca_tds_records: "TDS register", vault: "Evidence vault",
    };
    return Object.entries(o).map(([t, ids]) => `${names[t] ?? t}${Array.isArray(ids) && ids.length ? ` (${ids.length})` : ""}`).join(", ");
  } catch {
    return postedRef;
  }
}
