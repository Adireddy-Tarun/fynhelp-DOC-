export type Agent = {
  slug: string;
  name: string;
  /** Short use-case shown next to the agent name in the footer. */
  footerUse: string;
  kicker: string;
  headline: string;
  italic: string;
  sub: string;
  stats: [string, string][];
  useCases: { t: string; d: string }[];
  outputs: string[];
  inputs: string[];
};

export const AGENTS: Agent[] = [
  {
    slug: "liquidity",
    name: "Liquidity agent",
    footerUse: "cash and runway",
    kicker: "Agent 01",
    headline: "Know your cash position",
    italic: "before the month closes",
    sub: "Reads bank feeds and payables daily, rebuilds the 13 week forecast every morning, and tells you the date cash runs short instead of the balance you already knew.",
    stats: [
      ["13 wk", "rolling cash forecast"],
      ["Daily", "bank feed refresh"],
      ["4", "runway scenarios kept live"],
      ["0", "manual sheets to maintain"],
    ],
    useCases: [
      { t: "Runway alerts before payroll", d: "Warns when the projected balance dips below one payroll cycle, with the exact week it happens." },
      { t: "Collections that move the needle", d: "Ranks overdue receivables by the cash they release this month, not by size alone." },
      { t: "Vendor payment sequencing", d: "Suggests which payables to release now and which to hold, without breaking credit terms." },
    ],
    outputs: ["13 week cash forecast", "Runway and burn note", "Receivables priority list"],
    inputs: ["Bank statements or feeds", "Sales and purchase ledgers", "Payroll calendar"],
  },
  {
    slug: "revenue",
    name: "Revenue agent",
    footerUse: "collections and growth",
    kicker: "Agent 02",
    headline: "See revenue the way",
    italic: "a CFO reads it",
    sub: "Splits growth into new, retained and lost, tracks customer concentration, and flags invoices that slipped from paid on time to a collections problem.",
    stats: [
      ["MoM", "growth decomposition"],
      ["Top 10", "concentration watch"],
      ["DSO", "tracked per customer"],
      ["Auto", "overdue escalation"],
    ],
    useCases: [
      { t: "Concentration risk", d: "Shows the share of revenue sitting with your largest customers and how it moved this quarter." },
      { t: "Slipping payers", d: "Detects customers whose payment behaviour has drifted before the invoice becomes a write off." },
      { t: "Price and mix review", d: "Separates volume growth from price growth so a good month is explained, not assumed." },
    ],
    outputs: ["Revenue bridge", "Customer ageing with DSO", "Concentration report"],
    inputs: ["Sales invoices", "Receipts and bank credits", "Customer master"],
  },
  {
    slug: "cost",
    name: "Cost agent",
    footerUse: "spend and margin leaks",
    kicker: "Agent 03",
    headline: "Find the spend",
    italic: "nobody approved twice",
    sub: "Classifies every expense line, compares it with the last six months, and surfaces the increases that are real rather than seasonal.",
    stats: [
      ["6 mo", "rolling baseline"],
      ["Line", "level anomaly checks"],
      ["Vendor", "duplicate detection"],
      ["Monthly", "margin walk"],
    ],
    useCases: [
      { t: "Silent subscription creep", d: "Recurring charges that grew or renewed without a decision behind them." },
      { t: "Duplicate vendor payments", d: "Same amount, same vendor, near dates, matched across bank and ledger." },
      { t: "Cost to serve", d: "Shows which cost heads move with revenue and which stay fixed regardless of volume." },
    ],
    outputs: ["Expense anomaly queue", "Vendor spend summary", "Gross margin walk"],
    inputs: ["Purchase invoices", "Bank debits", "Expense ledger"],
  },
  {
    slug: "gst-tax",
    name: "GST and tax agent",
    footerUse: "filings and input credit",
    kicker: "Agent 04",
    headline: "Claim every rupee",
    italic: "of input credit you earned",
    sub: "Matches purchase registers with GSTR 2B, flags blocked credit, and keeps a calendar of every filing due date with the working papers already attached.",
    stats: [
      ["2B", "reconciliation each cycle"],
      ["12", "compliance events tracked"],
      ["Blocked", "ITC flagged with section"],
      ["Auto", "due date reminders"],
    ],
    useCases: [
      { t: "ITC reconciliation", d: "Exact, then fuzzy, then your firm rules. Only genuine mismatches reach a human." },
      { t: "Vendor non filers", d: "Names the suppliers whose returns are holding up your credit, with the amount at stake." },
      { t: "Filing calendar", d: "GSTR 1, 3B, TDS and advance tax dates that move with the statutory calendar." },
    ],
    outputs: ["2B match report", "Blocked credit list", "Filing calendar with papers"],
    inputs: ["Purchase register", "GSTR 2B download", "Filing history"],
  },
  {
    slug: "governance",
    name: "Governance agent",
    footerUse: "controls and audit trail",
    kicker: "Agent 05",
    headline: "Sign off you can",
    italic: "defend months later",
    sub: "Keeps an exportable trail of who changed what, when, and from which source line, plus the statutory registers a review will ask for.",
    stats: [
      ["100%", "actions logged"],
      ["Source", "linked figures"],
      ["Role", "based approvals"],
      ["Export", "ready registers"],
    ],
    useCases: [
      { t: "Audit preparation", d: "The trail is assembled as you work, so audit season is a download rather than a reconstruction." },
      { t: "Maker checker discipline", d: "Junior review and partner sign off are separate steps with separate records." },
      { t: "Related party visibility", d: "Flags transactions with linked entities so disclosure is never missed." },
    ],
    outputs: ["Audit trail export", "Approval history", "Statutory register pack"],
    inputs: ["All ledger activity", "User actions", "Entity master"],
  },
  {
    slug: "workforce",
    name: "Workforce agent",
    footerUse: "payroll and people cost",
    kicker: "Agent 06",
    headline: "People cost, explained",
    italic: "before it surprises you",
    sub: "Tracks payroll, statutory dues and headcount cost per function, and warns when a hiring plan pushes the runway past a threshold you set.",
    stats: [
      ["Monthly", "payroll variance"],
      ["PF, ESI, TDS", "due date tracking"],
      ["Per team", "cost breakdown"],
      ["Hiring", "impact simulation"],
    ],
    useCases: [
      { t: "Payroll variance", d: "Explains the month on month change by joiners, exits, increments and one time payouts." },
      { t: "Statutory dues", d: "PF, ESI and TDS obligations tracked against payment, with penalties avoided." },
      { t: "Hiring headroom", d: "Shows what a planned role does to runway before the offer goes out." },
    ],
    outputs: ["Payroll variance note", "Statutory dues tracker", "Cost per function"],
    inputs: ["Payroll register", "Employee master", "Bank debits"],
  },
  {
    slug: "investor",
    name: "Investor agent",
    footerUse: "board and lender packs",
    kicker: "Agent 07",
    headline: "A board pack",
    italic: "assembled from source",
    sub: "Builds the MIS, KPI sheet and commentary your investors and lenders ask for, with every figure one click from the transaction behind it.",
    stats: [
      ["Monthly", "MIS pack"],
      ["Traceable", "to bank line"],
      ["White label", "for your firm"],
      ["Share", "by revocable link"],
    ],
    useCases: [
      { t: "Monthly investor update", d: "Numbers, commentary and variance against plan, generated from closed books." },
      { t: "Lender reporting", d: "Covenant tracking and the schedules banks ask for, on the same source data." },
      { t: "Diligence readiness", d: "A consistent history of packs so diligence does not restart the accounting." },
    ],
    outputs: ["Board MIS pack", "KPI sheet", "Shareable report link"],
    inputs: ["Closed ledgers", "Budget or plan", "Cap table basics"],
  },
  {
    slug: "ask-fynny",
    name: "Ask Fynny",
    footerUse: "answers from your books",
    kicker: "Agent 08",
    headline: "Ask your books",
    italic: "a plain question",
    sub: "Answers in plain language and shows the lines behind the answer. If the data is not there, it says so rather than inventing a number.",
    stats: [
      ["Grounded", "in your ledger"],
      ["Cited", "line references"],
      ["No", "invented figures"],
      ["Scoped", "to your entity"],
    ],
    useCases: [
      { t: "Quick answers in a meeting", d: "Why did travel cost rise in August, answered with the entries that caused it." },
      { t: "Draft the commentary", d: "A first draft of the monthly note that a partner edits rather than writes." },
      { t: "Explain a variance", d: "Traces a variance to the handful of transactions that created it." },
    ],
    outputs: ["Cited answers", "Draft commentary", "Variance explanations"],
    inputs: ["Your posted ledger", "Reconciled bank data", "Prior period figures"],
  },
];

export const agentBySlug = (slug: string) => AGENTS.find((a) => a.slug === slug);
