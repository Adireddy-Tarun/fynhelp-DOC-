// Roadmap mountain data — maps Intelligence Suites & Platform Features
// to mountain milestones, with per-product 3D icon gradients & graphics.

import { SUITES } from "@/data/suiteStatus";
import type { WidgetKey } from "@/components/products/productMeta";
import { NIDHI_ITEM, PLATFORM_FEATURES } from "@/components/products/productMeta";

export type GraphicKey =
  | "droplet"
  | "trend-up"
  | "coins"
  | "doc-stamp"
  | "shield-scales"
  | "people"
  | "brain-circuit"
  | "globe-rocket"
  | "bank-nodes"
  | "handshake"
  | "chat-spark"
  | "wallet"
  | "branching"
  | "briefcase";

export interface RoadmapProduct {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  longDescription: string;
  status: "live" | "coming_soon";
  quarter: string;
  href: string;
  widget: WidgetKey;
  gradient: [string, string];
  graphic: GraphicKey;
}

export interface Milestone {
  id: "base" | "mid" | "ridge" | "summit";
  label: string;
  quarter: string;
  /** Position on the mountain SVG viewBox 1000x700, percentage-based for layout */
  position: { xPct: number; yPct: number };
  /** Side to render the label */
  labelSide: "left" | "right";
  products: RoadmapProduct[];
}

const productMap: Record<
  string,
  { gradient: [string, string]; graphic: GraphicKey; longDescription?: string }
> = {
  liquidity: {
    gradient: ["#3B82F6", "#06B6D4"],
    graphic: "droplet",
    longDescription:
      "Track every rupee in real time. Predict cash crunches weeks ahead and extend runway with AI-driven recommendations.",
  },
  revenue: {
    gradient: ["#10B981", "#059669"],
    graphic: "trend-up",
    longDescription:
      "Monitor MRR, ARR and churn. Spot at-risk accounts early and forecast growth with confidence.",
  },
  cost: {
    gradient: ["#F59E0B", "#8B6914"],
    graphic: "coins",
    longDescription:
      "Categorize every expense automatically. Find the spend you can cut without hurting growth.",
  },
  gst: {
    gradient: ["#8B5CF6", "#7C3AED"],
    graphic: "doc-stamp",
    longDescription:
      "Never miss a filing. Reconcile GSTR-2B in seconds, recover ITC, stay audit-ready 24/7.",
  },
  governance: {
    gradient: ["#EAB308", "#8B6914"],
    graphic: "shield-scales",
    longDescription:
      "Real-time risk scoring, audit trails, and proactive alerts across every regulator.",
  },
  hr: {
    gradient: ["#EC4899", "#DB2777"],
    graphic: "people",
    longDescription:
      "Headcount ROI, payroll analytics, and attrition signals built for growing Indian teams.",
  },
  simulator: {
    gradient: ["#14B8A6", "#0891B2"],
    graphic: "brain-circuit",
    longDescription:
      "Model any business decision in seconds. Adjust hires, prices, or spend and see the runway impact instantly.",
  },
  market: {
    gradient: ["#6366F1", "#4F46E5"],
    graphic: "globe-rocket",
    longDescription:
      "Benchmark against your industry. Spot growth opportunities before competitors do.",
  },
  banking: {
    gradient: ["#059669", "#047857"],
    graphic: "bank-nodes",
    longDescription:
      "One view across every bank account. Smarter working capital, integrated lending, real-time reconciliation.",
  },
  "ca-partner": {
    gradient: ["#C41E1E", "#991B1B"],
    graphic: "handshake",
    longDescription:
      "Built for India's CAs. White-label workflows, client portfolios, and shared compliance in one place.",
  },
};

const buildSuiteProduct = (id: string): RoadmapProduct | null => {
  const s = SUITES.find((x) => x.id === id);
  const meta = productMap[id];
  if (!s || !meta) return null;
  const widget: WidgetKey =
    (["liquidity", "revenue", "cost", "gst", "simulator"] as WidgetKey[]).includes(
      id as WidgetKey,
    )
      ? (id as WidgetKey)
      : "generic";
  return {
    id: s.id,
    name: s.name,
    shortLabel: s.shortLabel,
    description: s.description,
    longDescription: meta.longDescription ?? s.description,
    status: s.status,
    quarter: s.quarter,
    href: s.href,
    widget,
    gradient: meta.gradient,
    graphic: meta.graphic,
  };
};

// Special platform-feature products
const NIDHI: RoadmapProduct = {
  id: NIDHI_ITEM.id,
  name: NIDHI_ITEM.name,
  shortLabel: NIDHI_ITEM.shortLabel,
  description: NIDHI_ITEM.description,
  longDescription: NIDHI_ITEM.longDescription,
  status: NIDHI_ITEM.status,
  quarter: NIDHI_ITEM.quarter,
  href: NIDHI_ITEM.href,
  widget: "nidhi",
  gradient: ["#C41E1E", "#8B6914"],
  graphic: "chat-spark",
};

const WORKING_CAPITAL: RoadmapProduct = {
  id: "working-capital",
  name: "Working Capital Marketplace",
  shortLabel: "Capital",
  description: "Smart credit lines & invoice financing",
  longDescription:
    "Tap into pre-approved credit lines and invoice financing. Manage working capital from a single, unified view.",
  status: "live",
  quarter: "Live",
  href: "/dashboard/banking",
  widget: "generic",
  gradient: ["#10B981", "#047857"],
  graphic: "wallet",
};

const SIMULATOR_FEATURE: RoadmapProduct = {
  id: "decision-simulator-feature",
  name: "Decision Simulator",
  shortLabel: "Simulator",
  description: "Model any business scenario",
  longDescription:
    "Drag a slider, see the future. Test hires, price changes, and capital decisions in seconds.",
  status: "coming_soon",
  quarter: "Q4 2026",
  href: "/roadmap#simulator",
  widget: "simulator",
  gradient: ["#14B8A6", "#0891B2"],
  graphic: "branching",
};

const CA_PROGRAM: RoadmapProduct = {
  id: "ca-partner-program",
  name: "CA Partner Program",
  shortLabel: "CA Program",
  description: "White label for accountants",
  longDescription:
    "Manage your entire client portfolio from one dashboard. Compliance, GST, and reports — co-branded.",
  status: "coming_soon",
  quarter: "Q2 2027",
  href: "/roadmap#ca-partner",
  widget: "generic",
  gradient: ["#8B5CF6", "#7C3AED"],
  graphic: "briefcase",
};

const safe = (id: string) => buildSuiteProduct(id) as RoadmapProduct;

export const MILESTONES: Milestone[] = [
  {
    id: "base",
    label: "Base Camp",
    quarter: "Q2 2026",
    position: { xPct: 22, yPct: 88 },
    labelSide: "left",
    products: [safe("liquidity"), NIDHI, WORKING_CAPITAL],
  },
  {
    id: "mid",
    label: "Mid Slope",
    quarter: "Q3 2026",
    position: { xPct: 38, yPct: 64 },
    labelSide: "right",
    products: [safe("revenue"), safe("cost"), SIMULATOR_FEATURE],
  },
  {
    id: "ridge",
    label: "High Ridge",
    quarter: "Q4 2026",
    position: { xPct: 55, yPct: 42 },
    labelSide: "left",
    products: [safe("gst"), safe("governance"), safe("hr")],
  },
  {
    id: "summit",
    label: "Summit",
    quarter: "Q1 2027",
    position: { xPct: 72, yPct: 16 },
    labelSide: "right",
    products: [safe("market"), safe("banking"), CA_PROGRAM],
  },
];

/** SVG path for the golden trail – winds from base camp up to summit. */
export const PATH_D =
  "M 220 620 C 180 560 320 520 380 460 C 440 400 320 360 420 300 C 520 240 600 320 560 260 C 600 200 660 220 720 120";

/** Determine where the climber should rest: highest milestone with a LIVE product. */
export function getClimberMilestoneIndex(): number {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (MILESTONES[i].products.some((p) => p.status === "live")) return i;
  }
  return 0;
}
