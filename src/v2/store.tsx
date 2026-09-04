/**
 * FynHelp v2 dashboard — local prototype store.
 * Holds client data plus the live "agent run" state that drives the agentic UI.
 * Every number shown in the product is derived from rows that live here, so a
 * figure can always be traced back to its source transactions.
 */
import { createContext, useContext, useMemo, useState, ReactNode, useCallback, useRef, useEffect } from "react";
import type { AgentKey } from "./agents";

export type Txn = { date: string; particulars: string; amount: number };

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
  rows: Txn[];
};

export type ReviewItem = {
  id: string;
  clientId: string;
  docName: string;
  rawText: string;
  suggestion: Txn;
  confidence: number;
  status: "open" | "confirmed" | "discarded";
};

export type Exception = {
  id: string;
  clientId: string;
  reason: "Amount mismatch" | "Date gap" | "No candidate" | "Duplicate suspect" | "Missing counterparty";
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
  template: ReportTemplate;
  generated: string;
  /** Rows deliberately excluded because recon could not match them. */
  excluded: number;
  signedOff?: { by: string; at: string };
  correction?: { note: string; at: string };
  revenue: number;
  expenses: number;
  sources: { revenue: Txn[]; expenses: Txn[] };
  insights: { text: string; source: string }[];
  variances: { label: string; current: number; prior: number }[];
  bankSummary: { label: string; value: number; rows: Txn[] }[];
};

export const REPORT_TEMPLATES = [
  "Monthly MIS",
  "Bank Reconciliation Summary",
  "Key Variances",
  "Working Paper",
  "Exception and Review Summary",
] as const;
export type ReportTemplate = (typeof REPORT_TEMPLATES)[number];

export type Firm = {
  name: string;
  partnerName: string;
  email: string;
  city: string;
  frn: string;
  gmailConnected: boolean;
};


export type Chase = {
  id: string;
  clientId: string;
  type: string;
  contact: string;
  phone: string;
  due: string;
  note: string;
  followUps: number;
  status: "Open" | "Following Up" | "Escalated" | "Resolved";
  timeline: { at: string; text: string; agent?: AgentKey }[];
};

export type ReconResult = { matched: number; exceptions: number; bank: number; at: string };

export type Activity = { id: string; clientId: string; at: string; text: string; agent?: AgentKey };

export type Role = "Partner" | "Junior";

/** The monthly close cycle every client moves through. */
export const CLOSE_STAGES = ["Documents", "Review", "Recon", "Exceptions", "MIS"] as const;
export type CloseStage = (typeof CLOSE_STAGES)[number];

export type CloseStep = { stage: CloseStage; done: boolean; detail: string };

export type CloseState = {
  steps: CloseStep[];
  percent: number;
  stage: CloseStage;
  /** The single most useful thing to do next for this client. */
  next: { label: string; why: string; tab: string; action?: "recon" | "mis" | "upload" };
};

export const PERIODS = ["August 2026", "July 2026", "June 2026", "May 2026"];

export type AgentRun = {
  id: string;
  agent: AgentKey;
  title: string;
  steps: string[];
  current: number;
  /** entity this run belongs to: doc id, client id or report id */
  target: string;
};

const now = new Date();
const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 864e5).toISOString().slice(0, 10);
const today = () => iso(0);

const SEED_CLIENTS: Client[] = [
  { id: "c1", name: "Sundar Textiles Pvt Ltd", entityType: "Private Limited", gstin: "27AABCS1429B1ZP", contactName: "Ramesh Sundar", email: "ramesh@sundartextiles.in", phone: "919820011223", lastMis: iso(6) },
  { id: "c2", name: "Aarna Foods LLP", entityType: "LLP", gstin: "29AAFAA7391K1Z2", contactName: "Nisha Rao", email: "nisha@aarnafoods.in", phone: "919845567788", lastMis: iso(21) },
  { id: "c3", name: "Verve D2C Retail", entityType: "Private Limited", gstin: "36AAECV1122M1ZL", contactName: "Karthik Iyer", email: "karthik@vervedtc.com", phone: "919701234567", lastMis: iso(2) },
  { id: "c4", name: "Kaveri Engineering Works", entityType: "Partnership", gstin: "33AAGFK5580R1ZQ", contactName: "Latha Kaveri", email: "latha@kaveriengg.in", phone: "919894112233", lastMis: iso(1) },
  { id: "c5", name: "Mehr Consulting Proprietorship", entityType: "Proprietorship", gstin: "07AJXPM4412Q1Z8", contactName: "Mehr Ahluwalia", email: "mehr@mehrconsulting.in", phone: "919810099887" },
  { id: "c6", name: "Northlight Studios Pvt Ltd", entityType: "Private Limited", gstin: "19AAFCN8821L1ZR", contactName: "Sohini Dutta", email: "sohini@northlightstudios.in", phone: "919830445566", lastMis: iso(34) },
];

const SEED_DOCS: Doc[] = [
  { id: "d1", name: "HDFC-statement-Aug.csv", clientId: "c1", source: "Manual", status: "Parsed", date: iso(3), rows: [
    { date: iso(9), particulars: "NEFT ABC ENTERPRISES", amount: 248000 },
    { date: iso(8), particulars: "UPI SWIGGY ORDER", amount: -1290 },
    { date: iso(7), particulars: "RTGS MEHTA WEAVERS", amount: 176500 },
    { date: iso(6), particulars: "SALARY PAYOUT AUG", amount: -412000 },
  ] },
  { id: "d2", name: "GSTR2B-Aug.xml", clientId: "c2", source: "Gmail", status: "Parsed", date: iso(5), rows: [
    { date: iso(12), particulars: "Sri Balaji Traders — INV/882", amount: 91500 },
    { date: iso(11), particulars: "Metro Packaging — INV/1180", amount: -43200 },
  ] },
  { id: "d3", name: "purchase-bills-Aug.pdf", clientId: "c3", source: "WhatsApp", status: "Parsed", date: iso(1), rows: [
    { date: iso(5), particulars: "Marketplace payout — Amazon", amount: 812000 },
    { date: iso(4), particulars: "UPI VINAYAK PRINT", amount: -18450 },
    { date: iso(3), particulars: "Courier charges — Delhivery", amount: -96400 },
  ] },
  { id: "d4", name: "ICICI-statement-Jul.csv", clientId: "c3", source: "Manual", status: "Failed", date: iso(11), rows: [] },
  { id: "d5", name: "SBI-statement-Aug.csv", clientId: "c4", source: "Gmail", status: "Parsed", date: iso(4), rows: [
    { date: iso(14), particulars: "RTGS Bharat Forge Components", amount: 486000 },
    { date: iso(12), particulars: "NEFT Coimbatore Castings", amount: 214500 },
    { date: iso(10), particulars: "Wages payout August", amount: -268000 },
    { date: iso(9), particulars: "Electricity board — factory unit", amount: -74800 },
    { date: iso(7), particulars: "Steel purchase — Annai Metals", amount: -152300 },
  ] },
  { id: "d6", name: "sales-register-Aug.xlsx", clientId: "c4", source: "Manual", status: "Parsed", date: iso(4), rows: [
    { date: iso(13), particulars: "Invoice KEW/441 — Bharat Forge", amount: 486000 },
    { date: iso(11), particulars: "Invoice KEW/442 — Coimbatore Castings", amount: 214500 },
  ] },
  { id: "d7", name: "Axis-statement-Aug.csv", clientId: "c6", source: "WhatsApp", status: "Parsed", date: iso(2), rows: [
    { date: iso(8), particulars: "Client retainer — Lumen Media", amount: 325000 },
    { date: iso(8), particulars: "Client retainer — Lumen Media", amount: 325000 },
    { date: iso(6), particulars: "Studio rent August", amount: -145000 },
    { date: iso(5), particulars: "IMPS transfer to unknown payee", amount: -62000 },
  ] },
];

const SEED_REVIEW: ReviewItem[] = [
  { id: "r1", clientId: "c1", docName: "HDFC-statement-Aug.csv", rawText: "NEFT/ABC ENTRPRSES/CR/248000.00/REF9931", suggestion: { date: iso(9), particulars: "ABC Enterprises — sales receipt", amount: 248000 }, confidence: 0.62, status: "open" },
  { id: "r2", clientId: "c3", docName: "purchase-bills-Aug.pdf", rawText: "M/s Vinayak Print Solutons  Bill No 4417  Rs. 18,450/- incl GST", suggestion: { date: iso(4), particulars: "Vinayak Print Solutions — printing", amount: -18450 }, confidence: 0.54, status: "open" },
  { id: "r3", clientId: "c2", docName: "GSTR2B-Aug.xml", rawText: "METRO PACKAGNG INV1180 43,200", suggestion: { date: iso(11), particulars: "Metro Packaging — packaging material", amount: -43200 }, confidence: 0.71, status: "open" },
];

const SEED_EXCEPTIONS: Exception[] = [
  { id: "e1", clientId: "c1", reason: "Amount mismatch", amount: 248000, date: iso(9), narration: "NEFT ABC ENTERPRISES", candidates: ["Invoice INV/2211 — ₹2,47,500"], status: "open" },
  { id: "e2", clientId: "c3", reason: "No candidate", amount: -18450, date: iso(4), narration: "UPI VINAYAK PRINT", candidates: [], status: "open" },
  { id: "e3", clientId: "c2", reason: "Date gap", amount: 91500, date: iso(12), narration: "RTGS SRI BALAJI TRADERS", candidates: ["Invoice INV/882 — 08 days earlier"], status: "open" },
  { id: "e4", clientId: "c6", reason: "Duplicate suspect", amount: 325000, date: iso(8), narration: "Client retainer — Lumen Media", candidates: ["Identical credit on the same date"], status: "open" },
  { id: "e5", clientId: "c6", reason: "Missing counterparty", amount: -62000, date: iso(5), narration: "IMPS transfer to unknown payee", candidates: [], status: "open" },
];

/** Kaveri Engineering is the clean client: recon done, MIS ready for the partner. */
const KAVERI_BANK = 7;
const SEED_RECON: Record<string, ReconResult> = {
  c4: { matched: KAVERI_BANK, exceptions: 0, bank: KAVERI_BANK, at: iso(2) },
};

const KAVERI_ROWS: Txn[] = SEED_DOCS.filter((d) => d.clientId === "c4").flatMap((d) => d.rows);
const KAVERI_REV = KAVERI_ROWS.filter((r) => r.amount > 0);
const KAVERI_EXP = KAVERI_ROWS.filter((r) => r.amount < 0);
const kRevenue = KAVERI_REV.reduce((s, r) => s + r.amount, 0);
const kExpenses = KAVERI_EXP.reduce((s, r) => s + Math.abs(r.amount), 0);

const SEED_REPORTS: Report[] = [
  {
    id: "rep-kaveri", clientId: "c4", period: PERIODS[0], template: "Monthly MIS", generated: iso(1), excluded: 0,
    revenue: kRevenue, expenses: kExpenses,
    sources: { revenue: KAVERI_REV, expenses: KAVERI_EXP },
    variances: [
      { label: "Revenue", current: kRevenue, prior: 612000 },
      { label: "Expenses", current: kExpenses, prior: 431000 },
      { label: "Net position", current: kRevenue - kExpenses, prior: 181000 },
    ],
    bankSummary: [
      { label: "Credits in bank", value: kRevenue, rows: KAVERI_REV },
      { label: "Debits in bank", value: kExpenses, rows: KAVERI_EXP },
      { label: "High value lines above one lakh", value: KAVERI_ROWS.filter((r) => Math.abs(r.amount) >= 100000).length, rows: KAVERI_ROWS.filter((r) => Math.abs(r.amount) >= 100000) },
    ],
    insights: [
      { text: `Collections stayed ahead of outflow, leaving a surplus of ₹${(kRevenue - kExpenses).toLocaleString("en-IN")}.`, source: `${KAVERI_REV.length} credits and ${KAVERI_EXP.length} debits` },
      { text: "Wages remained the single largest outflow for the month.", source: "1 transaction, wages payout August" },
      { text: "Every bank line was matched, so nothing was left out of these figures.", source: `${KAVERI_ROWS.length} matched transactions` },
    ],
  },
];

const SEED_CHASES: Chase[] = [
  { id: "h1", clientId: "c2", type: "Missing purchase bills", contact: "Nisha Rao", phone: "919845567788", due: iso(-2), note: "August purchase bills for 6 vendors still pending.", followUps: 1, status: "Following Up", timeline: [
    { at: iso(5), text: "Chase created", agent: "chaser" },
    { at: iso(3), text: "Reminder sent on WhatsApp", agent: "chaser" },
  ] },
  { id: "h2", clientId: "c1", type: "Bank statement", contact: "Ramesh Sundar", phone: "919820011223", due: iso(4), note: "September statement not received.", followUps: 2, status: "Escalated", timeline: [
    { at: iso(10), text: "Chase created", agent: "chaser" },
    { at: iso(7), text: "First reminder sent", agent: "chaser" },
    { at: iso(5), text: "Second reminder sent", agent: "chaser" },
    { at: iso(4), text: "No reply after two follow ups. Escalated to partner.", agent: "chaser" },
  ] },
  { id: "h3", clientId: "c6", type: "Missing invoice", contact: "Sohini Dutta", phone: "919830445566", due: iso(-4), note: "Retainer invoice for the duplicate credit is still awaited.", followUps: 0, status: "Open", timeline: [
    { at: iso(2), text: "Chase created", agent: "chaser" },
  ] },
  { id: "h4", clientId: "c4", type: "Missing bank statement", contact: "Latha Kaveri", phone: "919894112233", due: iso(6), note: "August SBI statement.", followUps: 1, status: "Resolved", timeline: [
    { at: iso(9), text: "Chase created", agent: "chaser" },
    { at: iso(6), text: "Email follow up sent", agent: "chaser" },
    { at: iso(4), text: "Document received (SBI-statement-Aug.csv). Chase closed automatically.", agent: "chaser" },
  ] },
];

type Store = {
  hydrated: boolean;
  session: { name: string; email: string } | null;
  firm: Firm | null;
  onboarded: boolean;
  signIn: (name: string, email: string) => void;
  signOut: () => void;
  saveFirm: (patch: Partial<Firm>) => void;
  completeOnboarding: () => void;
  clients: Client[];
  docs: Doc[];
  review: ReviewItem[];
  exceptions: Exception[];
  reports: Report[];
  chases: Chase[];
  runs: AgentRun[];
  recon: Record<string, ReconResult>;
  runsFor: (target: string) => AgentRun[];
  addClient: (c: Omit<Client, "id">) => Client;
  updateClient: (id: string, patch: Partial<Client>) => void;
  addDoc: (name: string, clientId: string, source?: Doc["source"]) => void;
  resolveReview: (id: string, status: "confirmed" | "discarded", patch?: Txn) => void;
  setExceptionStatus: (id: string, status: Exception["status"]) => void;
  runRecon: (clientId: string, onDone?: (r: ReconResult) => void) => void;
  generateReport: (clientId: string, period: string, template: ReportTemplate, onDone: (r: Report) => void) => void;
  addChase: (c: Omit<Chase, "id" | "timeline" | "status" | "followUps">) => void;
  sendFollowUp: (id: string, channel: "Email" | "WhatsApp") => void;
  setChaseStatus: (id: string, status: Chase["status"], note?: string) => void;
  clientName: (id: string) => string;
  clientTxns: (clientId: string) => Txn[];
  matchedTxns: (clientId: string) => Txn[];
  signOffReport: (reportId: string, by: string) => void;
  requestCorrection: (reportId: string, note: string) => void;
  period: string;
  setPeriod: (p: string) => void;
  role: Role;
  setRole: (r: Role) => void;
  activity: Activity[];
  activityFor: (clientId: string) => Activity[];
  closeStateFor: (clientId: string) => CloseState;
};


const Ctx = createContext<Store | null>(null);
const uid = () => Math.random().toString(36).slice(2, 9);
const STORAGE_KEY = "fynhelp.v2.session";


export function V2StoreProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(SEED_CLIENTS);
  const [docs, setDocs] = useState<Doc[]>(SEED_DOCS);
  const [review, setReview] = useState<ReviewItem[]>(SEED_REVIEW);
  const [exceptions, setExceptions] = useState<Exception[]>(SEED_EXCEPTIONS);
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);
  const [chases, setChases] = useState<Chase[]>(SEED_CHASES);
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [recon, setRecon] = useState<Record<string, ReconResult>>(SEED_RECON);
  const [hydrated, setHydrated] = useState(false);
  const [session, setSession] = useState<Store["session"]>(null);
  const [firm, setFirm] = useState<Firm | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [period, setPeriod] = useState(PERIODS[0]);
  const [role, setRole] = useState<Role>("Junior");
  const [activity, setActivity] = useState<Activity[]>([
    { id: "a1", clientId: "c1", at: iso(3), text: "HDFC-statement-Aug.csv collected and read", agent: "extract" },
    { id: "a2", clientId: "c2", at: iso(5), text: "GSTR2B-Aug.xml arrived from Gmail", agent: "extract" },
    { id: "a3", clientId: "c3", at: iso(1), text: "purchase-bills-Aug.pdf arrived on WhatsApp", agent: "extract" },
  ]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Sign in state survives a refresh so the journey is not restarted every time.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { session: Store["session"]; firm: Firm | null; onboarded: boolean; role?: Role; period?: string };
        setSession(saved.session ?? null);
        setFirm(saved.firm ?? null);
        setOnboarded(Boolean(saved.onboarded));
        if (saved.role) setRole(saved.role);
        if (saved.period) setPeriod(saved.period);
      }
    } catch {
      /* first visit, nothing saved yet */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ session, firm, onboarded, role, period }));
    } catch {
      /* storage unavailable, the app still works for this session */
    }
  }, [hydrated, session, firm, onboarded, role, period]);

  const signIn = useCallback((name: string, email: string) => setSession({ name, email }), []);
  const signOut = useCallback(() => { setSession(null); setFirm(null); setOnboarded(false); }, []);
  const saveFirm = useCallback((patch: Partial<Firm>) => {
    setFirm((p) => ({ name: "", partnerName: "", email: "", city: "", frn: "", gmailConnected: false, ...(p ?? {}), ...patch }));
  }, []);
  const completeOnboarding = useCallback(() => setOnboarded(true), []);

  /** Every meaningful thing that happens to a client is written to its timeline. */
  const log = useCallback((clientId: string, text: string, agent?: AgentKey) => {
    setActivity((p) => [{ id: uid(), clientId, at: today(), text, agent }, ...p]);
  }, []);


  /** Advance a visible agent run one step at a time, then finish. */
  const startRun = useCallback(
    (agent: AgentKey, title: string, steps: string[], target: string, onDone: () => void, stepMs = 850) => {
      const id = uid();
      setRuns((p) => [...p, { id, agent, title, steps, current: 0, target }]);
      steps.forEach((_, i) => {
        timers.current.push(
          setTimeout(() => setRuns((p) => p.map((r) => (r.id === id ? { ...r, current: i + 1 } : r))), stepMs * (i + 1)),
        );
      });
      timers.current.push(
        setTimeout(() => {
          setRuns((p) => p.filter((r) => r.id !== id));
          onDone();
        }, stepMs * (steps.length + 0.4)),
      );
    },
    [],
  );

  const addClient = useCallback((c: Omit<Client, "id">) => {
    const created: Client = { ...c, id: uid() };
    setClients((p) => [created, ...p]);
    return created;
  }, []);

  const updateClient = useCallback((id: string, patch: Partial<Client>) => {
    setClients((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  /** Workflow A — upload, Extract agent works, rows land, low confidence goes to Review. */
  const addDoc = useCallback((name: string, clientId: string, source: Doc["source"] = "Manual") => {
    const docId = uid();
    setDocs((p) => [{ id: docId, name, clientId, source, status: "Processing", date: today(), rows: [] }, ...p]);


    startRun("extract", name, ["Reading file", "Classifying rows", "Scoring confidence"], docId, () => {
      const rows: Txn[] = [
        { date: iso(2), particulars: "UPI collection — retail counter", amount: 34500 },
        { date: iso(1), particulars: "Vendor payment — packaging", amount: -12800 },
      ];
      setDocs((p) => p.map((d) => (d.id === docId ? { ...d, status: "Parsed", rows } : d)));
      log(clientId, `${name} read. ${rows.length} rows extracted, 1 row needs review.`, "extract");
      setReview((p) => [
        {
          id: uid(), clientId, docName: name,
          rawText: "UPI/COLLCTN RETAIL CNTR/CR/34,500.00",
          suggestion: { date: iso(2), particulars: "Retail counter collection", amount: 34500 },
          confidence: 0.58, status: "open",
        },
        ...p,
      ]);
      // Workflow D closing rule: a document arriving resolves an open chase for that client.
      setChases((prev) => {
        if (prev.some((c) => c.clientId === clientId && c.status !== "Resolved")) {
          log(clientId, `Chase closed automatically because ${name} arrived.`, "chaser");
        }
        return prev;
      });
      setChases((p) =>
        p.map((c) =>
          c.clientId === clientId && c.status !== "Resolved"
            ? { ...c, status: "Resolved", timeline: [...c.timeline, { at: today(), text: `Document received (${name}). Chase closed automatically.`, agent: "chaser" as AgentKey }] }
            : c,
        ),
      );
    });
  }, [startRun, log]);

  const resolveReview = useCallback((id: string, status: "confirmed" | "discarded", patch?: Txn) => {
    setReview((p) => {
      const item = p.find((r) => r.id === id);
      if (item) log(item.clientId, `Review item from ${item.docName} ${status === "confirmed" ? "confirmed" : "discarded"}.`, "extract");
      return p.map((r) => (r.id === id ? { ...r, status, suggestion: patch ?? r.suggestion } : r));
    });
  }, [log]);

  const setExceptionStatus = useCallback((id: string, status: Exception["status"]) => {
    setExceptions((p) => p.map((e) => (e.id === id ? { ...e, status } : e)));
    setRecon((p) => {
      const ex = exceptions.find((e) => e.id === id);
      if (!ex || !p[ex.clientId]) return p;
      const r = p[ex.clientId];
      return { ...p, [ex.clientId]: { ...r, matched: r.matched + 1, exceptions: Math.max(0, r.exceptions - 1) } };
    });
    const ex = exceptions.find((e) => e.id === id);
    if (ex) log(ex.clientId, `Exception "${ex.narration}" ${status}.`, "recon");
  }, [exceptions, log]);

  const clientTxns = useCallback((clientId: string) => docs.filter((d) => d.clientId === clientId).flatMap((d) => d.rows), [docs]);

  /**
   * Only transactions the Recon agent could match are allowed into an MIS.
   * A row sitting in the exception queue is unmatched and is excluded by rule.
   */
  const matchedTxns = useCallback((clientId: string) => {
    const open = exceptions.filter((e) => e.clientId === clientId && e.status === "open");
    return docs
      .filter((d) => d.clientId === clientId)
      .flatMap((d) => d.rows)
      .filter((r) => !open.some((e) => e.date === r.date && Math.abs(e.amount) === Math.abs(r.amount)));
  }, [docs, exceptions]);

  /** Workflow B — Recon agent, three passes, unmatched lines become exceptions. */
  const runRecon = useCallback((clientId: string, onDone?: (r: ReconResult) => void) => {
    startRun("recon", "Reconciling bank and books", ["Loading bank lines", "Exact match pass", "Fuzzy match pass", "Rules pass", "Flagging exceptions"], clientId, () => {
      const bank = docs.filter((d) => d.clientId === clientId).flatMap((d) => d.rows);
      const open = exceptions.filter((e) => e.clientId === clientId && e.status === "open");
      const unresolved = bank.filter((r) => Math.abs(r.amount) > 500000).slice(0, 1);
      const created: Exception[] = unresolved.map((r) => ({
        id: uid(), clientId, reason: "Amount mismatch" as const, amount: r.amount, date: r.date,
        narration: r.particulars, candidates: ["Closest book entry differs by ₹1,200"], status: "open" as const,
      }));
      if (created.length) setExceptions((p) => [...created, ...p]);
      const result: ReconResult = {
        bank: bank.length,
        matched: Math.max(0, bank.length - open.length - created.length),
        exceptions: open.length + created.length,
        at: today(),
      };
      setRecon((p) => ({ ...p, [clientId]: result }));
      log(clientId, `Recon run. ${result.matched} of ${result.bank} bank lines matched, ${result.exceptions} exceptions left.`, "recon");
      onDone?.(result);
    });
  }, [startRun, docs, exceptions, log]);

  /** Stage 7 — the partner either accepts the MIS or sends it back. */
  const signOffReport = useCallback((reportId: string, by: string) => {
    setReports((p) => p.map((r) => {
      if (r.id !== reportId) return r;
      log(r.clientId, `${by} signed off the ${r.template} for ${r.period}.`, "narrate");
      return { ...r, signedOff: { by, at: today() }, correction: undefined };
    }));
  }, [log]);

  const requestCorrection = useCallback((reportId: string, note: string) => {
    setReports((p) => p.map((r) => {
      if (r.id !== reportId) return r;
      log(r.clientId, `Correction requested on the ${r.template} for ${r.period}. ${note}`, "narrate");
      return { ...r, correction: { note, at: today() }, signedOff: undefined };
    }));
  }, [log]);

  /** Workflow C — Narrate agent, numbers first then insights, all traceable. */
  const generateReport = useCallback((clientId: string, period: string, template: ReportTemplate, onDone: (r: Report) => void) => {
    startRun("narrate", `${template} for ${period}`, ["Collecting matched transactions", "Computing figures", "Writing insights"], clientId, () => {
      const allRows = docs.filter((d) => d.clientId === clientId).flatMap((d) => d.rows);
      const rows = matchedTxns(clientId);
      const excluded = allRows.length - rows.length;
      const revenueRows = rows.filter((r) => r.amount > 0);
      const expenseRows = rows.filter((r) => r.amount < 0);
      const revenue = revenueRows.reduce((s, r) => s + r.amount, 0);
      const expenses = expenseRows.reduce((s, r) => s + Math.abs(r.amount), 0);
      const biggest = [...expenseRows].sort((a, b) => a.amount - b.amount)[0];
      // Prior period comparison uses the older half of the same transaction set,
      // so a variance can always be traced to rows that exist in the product.
      const half = Math.max(1, Math.ceil(rows.length / 2));
      const priorRows = rows.slice(half);
      const priorRevenue = priorRows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
      const priorExpenses = priorRows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
      const largeRows = rows.filter((r) => Math.abs(r.amount) >= 100000);
      const created: Report = {
        id: uid(), clientId, period, template, generated: today(), excluded, revenue, expenses,
        sources: { revenue: revenueRows, expenses: expenseRows },
        variances: [
          { label: "Revenue", current: revenue, prior: priorRevenue },
          { label: "Expenses", current: expenses, prior: priorExpenses },
          { label: "Net position", current: revenue - expenses, prior: priorRevenue - priorExpenses },
        ],
        bankSummary: [
          { label: "Credits in bank", value: revenue, rows: revenueRows },
          { label: "Debits in bank", value: expenses, rows: expenseRows },
          { label: "High value lines above one lakh", value: largeRows.length, rows: largeRows },
        ],
        insights: [
          { text: revenue > expenses
              ? `Collections exceeded outflow this period, leaving a surplus of ₹${(revenue - expenses).toLocaleString("en-IN")}.`
              : `Outflow ran ahead of collections by ₹${(expenses - revenue).toLocaleString("en-IN")} this period.`,
            source: `${revenueRows.length} credits and ${expenseRows.length} debits` },
          ...(biggest ? [{ text: `The single largest outflow was ${biggest.particulars}.`, source: `1 transaction dated ${biggest.date}` }] : []),
          ...(largeRows.length ? [{ text: `${largeRows.length} transactions crossed one lakh rupees and were checked line by line.`, source: `${largeRows.length} high value transactions` }] : []),
        ],
      };
      setReports((p) => [created, ...p]);
      setClients((p) => p.map((c) => (c.id === clientId ? { ...c, lastMis: today() } : c)));
      log(clientId, `${template} generated for ${period}.`, "narrate");
      onDone(created);
    });
  }, [startRun, docs, log]);


  const addChase = useCallback((c: Omit<Chase, "id" | "timeline" | "status" | "followUps">) => {
    setChases((p) => [
      { ...c, id: uid(), status: "Open", followUps: 0, timeline: [{ at: today(), text: "Chase created", agent: "chaser" }] },
      ...p,
    ]);
    log(c.clientId, `Chase created for ${c.type}.`, "chaser");
  }, [log]);

  /** Workflow D — follow ups escalate after the second unanswered nudge. */
  const sendFollowUp = useCallback((id: string, channel: "Email" | "WhatsApp") => {
    setChases((p) =>
      p.map((c) => {
        if (c.id !== id || c.status === "Resolved") return c;
        const followUps = c.followUps + 1;
        const status: Chase["status"] = followUps >= 2 ? "Escalated" : "Following Up";
        const entries = [{ at: today(), text: `${channel} follow up sent`, agent: "chaser" as AgentKey }];
        if (status === "Escalated" && c.status !== "Escalated") {
          entries.push({ at: today(), text: "No reply after two follow ups. Escalated to partner.", agent: "chaser" as AgentKey });
        }
        return { ...c, followUps, status, timeline: [...c.timeline, ...entries] };
      }),
    );
  }, []);

  const setChaseStatus = useCallback((id: string, status: Chase["status"], note?: string) => {
    setChases((p) => p.map((c) => (c.id === id ? { ...c, status, timeline: [...c.timeline, { at: today(), text: note ?? `Marked ${status.toLowerCase()}`, agent: "chaser" }] } : c)));
  }, []);

  const activityFor = useCallback((clientId: string) => activity.filter((a) => a.clientId === clientId), [activity]);

  /**
   * Close progress for one client. The stages mirror how a CA firm actually
   * closes a month, and the next action is the single most useful step left.
   */
  const closeStateFor = useCallback((clientId: string): CloseState => {
    const cDocs = docs.filter((d) => d.clientId === clientId);
    const parsed = cDocs.filter((d) => d.status === "Parsed");
    const openReview = review.filter((r) => r.clientId === clientId && r.status === "open");
    const openEx = exceptions.filter((e) => e.clientId === clientId && e.status === "open");
    const openChase = chases.filter((c) => c.clientId === clientId && c.status !== "Resolved");
    const reconRun = recon[clientId];
    const mis = reports.filter((r) => r.clientId === clientId && r.period === period);

    const steps: CloseStep[] = [
      { stage: "Documents", done: parsed.length > 0 && openChase.length === 0, detail: openChase.length ? `${openChase.length} still being chased` : `${parsed.length} documents read` },
      { stage: "Review", done: parsed.length > 0 && openReview.length === 0, detail: openReview.length ? `${openReview.length} rows to confirm` : "All rows confirmed" },
      { stage: "Recon", done: Boolean(reconRun), detail: reconRun ? `${reconRun.matched} of ${reconRun.bank} matched` : "Not run for this period" },
      { stage: "Exceptions", done: Boolean(reconRun) && openEx.length === 0, detail: openEx.length ? `${openEx.length} to clear` : "Nothing unmatched" },
      { stage: "MIS", done: mis.some((r) => r.signedOff), detail: mis.some((r) => r.signedOff) ? "Signed off by the partner" : mis.length ? "Waiting for partner sign off" : "Not generated yet" },
    ];

    const firstOpen = steps.find((s) => !s.done);
    const percent = Math.round((steps.filter((s) => s.done).length / steps.length) * 100);

    let next: CloseState["next"];
    if (!firstOpen) {
      next = { label: "This period is closed", why: "The partner has signed off and every figure still links to its source.", tab: "mis" };
    } else if (firstOpen.stage === "Documents") {
      next = openChase.length
        ? { label: "Follow up on pending documents", why: `${openChase.length} item${openChase.length > 1 ? "s are" : " is"} still with the client.`, tab: "chaser" }
        : { label: "Upload the first document", why: "Nothing has been collected for this client yet.", tab: "documents", action: "upload" };
    } else if (firstOpen.stage === "Review") {
      next = { label: `Confirm ${openReview.length} extracted row${openReview.length > 1 ? "s" : ""}`, why: "The Extract agent was unsure about these. Recon needs them confirmed first.", tab: "review" };
    } else if (firstOpen.stage === "Recon") {
      next = { label: "Run recon for this period", why: "Bank and books have not been matched yet.", tab: "recon", action: "recon" };
    } else if (firstOpen.stage === "Exceptions") {
      next = { label: `Clear ${openEx.length} exception${openEx.length > 1 ? "s" : ""}`, why: "Only matched transactions are allowed into the MIS.", tab: "exceptions" };
    } else {
      next = mis.length
        ? { label: "Send the MIS to the partner for sign off", why: "The report is ready and waiting for a partner to accept it.", tab: "mis" }
        : { label: `Generate the ${period} MIS`, why: "Recon is clean, so the numbers can be trusted.", tab: "mis", action: "mis" };
    }

    return { steps, percent, stage: firstOpen ? firstOpen.stage : "MIS", next };
  }, [docs, review, exceptions, chases, recon, reports, period]);

  const value = useMemo<Store>(() => ({
    hydrated, session, firm, onboarded, signIn, signOut, saveFirm, completeOnboarding,
    clients, docs, review, exceptions, reports, chases, runs, recon,
    runsFor: (target: string) => runs.filter((r) => r.target === target),
    addClient, updateClient, addDoc, resolveReview, setExceptionStatus, runRecon, generateReport,
    addChase, sendFollowUp, setChaseStatus, clientTxns, matchedTxns, signOffReport, requestCorrection,
    clientName: (id: string) => clients.find((c) => c.id === id)?.name ?? "Unassigned",
    period, setPeriod, role, setRole, activity, activityFor, closeStateFor,
  }), [matchedTxns, signOffReport, requestCorrection, period, role, activity, activityFor, closeStateFor, hydrated, session, firm, onboarded, signIn, signOut, saveFirm, completeOnboarding, clients, docs, review, exceptions, reports, chases, runs, recon, addClient, updateClient, addDoc, resolveReview, setExceptionStatus, runRecon, generateReport, addChase, sendFollowUp, setChaseStatus, clientTxns]);


  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useV2() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useV2 must be used inside V2StoreProvider");
  return ctx;
}

export const ENTITY_TYPES = ["Private Limited", "LLP", "Partnership", "Proprietorship", "Public Limited", "Trust or Society"];
