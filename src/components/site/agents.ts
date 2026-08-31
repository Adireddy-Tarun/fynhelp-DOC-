export type Agent = {
  slug: string;
  name: string;
  /** Short use-case shown next to the module name in the footer. */
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

/**
 * The four modules FynHelp ships today, matching the home page Products menu.
 * Do not add modules here unless they are live in the product.
 */
export const AGENTS: Agent[] = [
  {
    slug: "liquidity",
    name: "Liquidity intelligence",
    footerUse: "cash and runway",
    kicker: "Module 01",
    headline: "Know your cash position",
    italic: "before the month closes",
    sub: "Reads bank feeds and payables daily, rebuilds the 13 week forecast every morning, and tells you the date cash runs short instead of the balance you already knew.",
    stats: [
      ["13 wk", "rolling cash forecast"],
      ["Daily", "bank feed refresh"],
      ["AR", "ageing with CCC"],
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
    name: "Revenue intelligence",
    footerUse: "MRR and growth",
    kicker: "Module 02",
    headline: "See revenue the way",
    italic: "a CFO reads it",
    sub: "Tracks MRR, NRR and churn, splits growth into new, retained and lost, and flags customers whose payment behaviour is drifting before it becomes a write off.",
    stats: [
      ["MoM", "growth decomposition"],
      ["NRR", "tracked per cohort"],
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
    slug: "gst",
    name: "GST intelligence",
    footerUse: "filings and input credit",
    kicker: "Module 03",
    headline: "Claim every rupee",
    italic: "of input credit you earned",
    sub: "Matches purchase registers with GSTR 2B, flags blocked credit, and keeps a calendar of every filing due date with the working papers already attached.",
    stats: [
      ["2B", "reconciliation each cycle"],
      ["GSTR 1 and 3B", "due dates tracked"],
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
    slug: "fynny",
    name: "Fynny, the AI CFO",
    footerUse: "answers from your books",
    kicker: "Module 04",
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
      { t: "Auto briefings", d: "A morning note on what changed, what went overdue, and the three things worth your attention today." },
      { t: "Scenario planning", d: "What a hire, a price change, or a slower collections month does to runway, computed from your books." },
    ],
    outputs: ["Cited answers", "Daily briefings", "Scenario notes"],
    inputs: ["Your posted ledger", "Reconciled bank data", "Prior period figures"],
  },
];

export const agentBySlug = (slug: string) => AGENTS.find((a) => a.slug === slug);
