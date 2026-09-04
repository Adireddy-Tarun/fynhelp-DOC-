/**
 * FynHelp v2 dashboard — local prototype store.
 * All data lives in React state (seeded with realistic sample data) so the
 * flows work end to end before any backend wiring happens.
 */
import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from "react";

export type Client = {
  id: string;
  name: string;
  entityType: string;
  gstin?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  lastMis?: string;
};

export type Doc = {
  id: string;
  name: string;
  clientId: string;
  source: "Manual" | "Gmail" | "WhatsApp";
  status: "Processing" | "Parsed" | "Failed";
  date: string;
  rows: { date: string; particulars: string; amount: number }[];
};

export type ReviewItem = {
  id: string;
  clientId: string;
  docName: string;
  rawText: string;
  suggestion: { date: string; particulars: string; amount: number };
  confidence: number;
  status: "open" | "confirmed" | "discarded";
};

export type Exception = {
  id: string;
  clientId: string;
  reason: "Amount mismatch" | "Date gap" | "No candidate" | "Duplicate";
  amount: number;
  date: string;
  narration: string;
  candidates: string[];
  status: "open" | "resolved" | "ignored";
};

export type Report = {
  id: string;
  clientId: string;
  period: string;
  generated: string;
  revenue: number;
  expenses: number;
  insights: { text: string; source: string }[];
};

export type Chase = {
  id: string;
  clientId: string;
  type: string;
  contact: string;
  phone: string;
  due: string;
  note: string;
  status: "Open" | "Following Up" | "Escalated" | "Resolved";
  timeline: { at: string; text: string }[];
};

const now = new Date();
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 864e5).toISOString().slice(0, 10);

const SEED_CLIENTS: Client[] = [
  { id: "c1", name: "Sundar Textiles Pvt Ltd", entityType: "Private Limited", gstin: "27AABCS1429B1ZP", contactName: "Ramesh Sundar", email: "ramesh@sundartextiles.in", phone: "919820011223", lastMis: iso(6) },
  { id: "c2", name: "Aarna Foods LLP", entityType: "LLP", gstin: "29AAFAA7391K1Z2", contactName: "Nisha Rao", email: "nisha@aarnafoods.in", phone: "919845567788", lastMis: iso(21) },
  { id: "c3", name: "Verve D2C Retail", entityType: "Private Limited", gstin: "36AAECV1122M1ZL", contactName: "Karthik Iyer", email: "karthik@vervedtc.com", phone: "919701234567", lastMis: iso(2) },
];

const SEED_DOCS: Doc[] = [
  { id: "d1", name: "HDFC-statement-Aug.csv", clientId: "c1", source: "Manual", status: "Parsed", date: iso(3), rows: [
    { date: iso(9), particulars: "NEFT ABC ENTERPRISES", amount: 248000 },
    { date: iso(8), particulars: "UPI SWIGGY ORDER", amount: -1290 },
    { date: iso(6), particulars: "SALARY PAYOUT AUG", amount: -412000 },
  ] },
  { id: "d2", name: "GSTR2B-Aug.xml", clientId: "c2", source: "Gmail", status: "Parsed", date: iso(5), rows: [
    { date: iso(12), particulars: "Sri Balaji Traders — INV/882", amount: 91500 },
    { date: iso(11), particulars: "Metro Packaging — INV/1180", amount: 43200 },
  ] },
  { id: "d3", name: "purchase-bills-Aug.pdf", clientId: "c3", source: "WhatsApp", status: "Processing", date: iso(1), rows: [] },
  { id: "d4", name: "ICICI-statement-Jul.csv", clientId: "c3", source: "Manual", status: "Failed", date: iso(11), rows: [] },
];

const SEED_REVIEW: ReviewItem[] = [
  { id: "r1", clientId: "c1", docName: "HDFC-statement-Aug.csv", rawText: "NEFT/ABC ENTRPRSES/CR/248000.00/REF9931", suggestion: { date: iso(9), particulars: "ABC Enterprises — sales receipt", amount: 248000 }, confidence: 0.62, status: "open" },
  { id: "r2", clientId: "c3", docName: "purchase-bills-Aug.pdf", rawText: "M/s Vinayak Print Solutons  Bill No 4417  Rs. 18,450/- incl GST", suggestion: { date: iso(4), particulars: "Vinayak Print Solutions — printing", amount: 18450 }, confidence: 0.54, status: "open" },
  { id: "r3", clientId: "c2", docName: "GSTR2B-Aug.xml", rawText: "METRO PACKAGNG INV1180 43,200", suggestion: { date: iso(11), particulars: "Metro Packaging — packaging material", amount: 43200 }, confidence: 0.71, status: "open" },
];

const SEED_EXCEPTIONS: Exception[] = [
  { id: "e1", clientId: "c1", reason: "Amount mismatch", amount: 248000, date: iso(9), narration: "NEFT ABC ENTERPRISES", candidates: ["Invoice INV/2211 — ₹2,47,500"], status: "open" },
  { id: "e2", clientId: "c3", reason: "No candidate", amount: -18450, date: iso(4), narration: "UPI VINAYAK PRINT", candidates: [], status: "open" },
  { id: "e3", clientId: "c2", reason: "Date gap", amount: 91500, date: iso(12), narration: "RTGS SRI BALAJI TRADERS", candidates: ["Invoice INV/882 — 08 days earlier"], status: "open" },
];

const SEED_REPORTS: Report[] = [
  { id: "m1", clientId: "c3", period: "August 2026", generated: iso(2), revenue: 4820000, expenses: 3610000, insights: [
    { text: "Revenue grew 12 percent over July, led by marketplace payouts.", source: "42 matched bank credits" },
    { text: "Logistics cost rose 18 percent while orders rose 9 percent.", source: "17 courier invoices" },
  ] },
  { id: "m2", clientId: "c1", period: "August 2026", generated: iso(6), revenue: 2680000, expenses: 2310000, insights: [
    { text: "Payroll is 41 percent of total outflow this month.", source: "1 salary batch, 34 employees" },
  ] },
];

const SEED_CHASES: Chase[] = [
  { id: "h1", clientId: "c2", type: "Missing purchase bills", contact: "Nisha Rao", phone: "919845567788", due: iso(-2), note: "August purchase bills for 6 vendors still pending.", status: "Following Up", timeline: [{ at: iso(5), text: "Chase created" }, { at: iso(3), text: "Reminder sent on WhatsApp" }] },
  { id: "h2", clientId: "c1", type: "Bank statement", contact: "Ramesh Sundar", phone: "919820011223", due: iso(4), note: "September statement not received.", status: "Escalated", timeline: [{ at: iso(10), text: "Chase created" }, { at: iso(7), text: "Reminder sent" }, { at: iso(4), text: "Escalated to partner" }] },
];

type Store = {
  clients: Client[];
  docs: Doc[];
  review: ReviewItem[];
  exceptions: Exception[];
  reports: Report[];
  chases: Chase[];
  addClient: (c: Omit<Client, "id">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  addDoc: (name: string, clientId: string) => void;
  resolveReview: (id: string, status: "confirmed" | "discarded", patch?: ReviewItem["suggestion"]) => void;
  setExceptionStatus: (id: string, status: Exception["status"]) => void;
  addReport: (clientId: string, period: string) => Report;
  addChase: (c: Omit<Chase, "id" | "timeline" | "status">) => void;
  setChaseStatus: (id: string, status: Chase["status"], note?: string) => void;
  clientName: (id: string) => string;
};

const Ctx = createContext<Store | null>(null);

const uid = () => Math.random().toString(36).slice(2, 9);

export function V2StoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
  const [docs, setDocs] = useState<Doc[]>(SEED_DOCS);
  const [review, setReview] = useState<ReviewItem[]>(SEED_REVIEW);
  const [exceptions, setExceptions] = useState<Exception[]>(SEED_EXCEPTIONS);
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);
  const [chases, setChases] = useState<Chase[]>(SEED_CHASES);

  const addClient = useCallback((c: Omit<Client, "id">) => {
    const created: Client = { ...c, id: uid() };
    setClients((p) => [created, ...p]);
    return created;
  }, []);

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const addDoc = useCallback((name: string, clientId: string) => {
    const id = uid();
    setDocs((p) => [{ id, name, clientId, source: "Manual", status: "Processing", date: iso(0), rows: [] }, ...p]);
    setTimeout(() => {
      setDocs((p) => p.map((d) => (d.id === id ? {
        ...d,
        status: "Parsed",
        rows: [
          { date: iso(2), particulars: "Opening balance carried forward", amount: 0 },
          { date: iso(1), particulars: "UPI collection — retail", amount: 34500 },
        ],
      } : d)));
    }, 2200);
  }, []);

  const resolveReview = useCallback((id: string, status: "confirmed" | "discarded", patch?: ReviewItem["suggestion"]) => {
    setReview((p) => p.map((r) => (r.id === id ? { ...r, status, suggestion: patch ?? r.suggestion } : r)));
  }, []);

  const setExceptionStatus = useCallback((id: string, status: Exception["status"]) => {
    setExceptions((p) => p.map((e) => (e.id === id ? { ...e, status } : e)));
  }, []);

  const addReport = useCallback((clientId: string, period: string) => {
    const created: Report = {
      id: uid(), clientId, period, generated: iso(0),
      revenue: 1850000 + Math.round(Math.random() * 2500000),
      expenses: 1400000 + Math.round(Math.random() * 1800000),
      insights: [{ text: "Generated from matched transactions for the selected period.", source: "Matched ledger" }],
    };
    setReports((p) => [created, ...p]);
    setClients((p) => p.map((c) => (c.id === clientId ? { ...c, lastMis: created.generated } : c)));
    return created;
  }, []);

  const addChase = useCallback((c: Omit<Chase, "id" | "timeline" | "status">) => {
    setChases((p) => [{ ...c, id: uid(), status: "Open", timeline: [{ at: iso(0), text: "Chase created" }] }, ...p]);
  }, []);

  const setChaseStatus = useCallback((id: string, status: Chase["status"], note?: string) => {
    setChases((p) => p.map((c) => (c.id === id ? { ...c, status, timeline: [...c.timeline, { at: iso(0), text: note ?? `Marked ${status.toLowerCase()}` }] } : c)));
  }, []);

  const value = useMemo<Store>(() => ({
    clients, docs, review, exceptions, reports, chases,
    addClient, updateClient, addDoc, resolveReview, setExceptionStatus, addReport, addChase, setChaseStatus,
    clientName: (id: string) => clients.find((c) => c.id === id)?.name ?? "Unassigned",
  }), [clients, docs, review, exceptions, reports, chases, addClient, updateClient, addDoc, resolveReview, setExceptionStatus, addReport, addChase, setChaseStatus]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useV2() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useV2 must be used inside V2StoreProvider");
  return ctx;
}

export const ENTITY_TYPES = ["Private Limited", "LLP", "Partnership", "Proprietorship", "Public Limited", "Trust or Society"];
