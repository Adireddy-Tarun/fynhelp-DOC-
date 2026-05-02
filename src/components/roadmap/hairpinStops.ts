import type { WidgetKey } from "@/components/products/productMeta";

export interface HairpinStop {
  /** 1-indexed stop number, bottom→top */
  n: number;
  emoji: string;
  name: string;
  status: "live" | "coming_soon";
  color: string;            // chip icon background
  description: string;
  widget: WidgetKey;
  href: string;
  /** Position as percentage of the scene container (0-100). */
  xPct: number;
  yPct: number;
  /** Which side of the road the chip sits on. */
  side: "left" | "right";
}

/**
 * 12 stops arranged on a spiral that wraps around a wide mountain.
 * X oscillates left↔right, Y rises smoothly from base to summit.
 * Stops sit closer to mountain center to support the spiral illusion.
 */
export const HAIRPIN_STOPS: HairpinStop[] = [
  { n: 1,  emoji: "💧", name: "Liquidity Intelligence", status: "live",         color: "#3B82F6", description: "Cash flow tracking, runway forecast, burn rate alerts.", widget: "liquidity", href: "/dashboard/runway",      xPct: 26, yPct: 84, side: "left"  },
  { n: 2,  emoji: "🤖", name: "AI CFO Nidhi",            status: "live",         color: "#F43F5E", description: "Conversational AI — ask any financial question, instantly.", widget: "nidhi",     href: "/dashboard/nidhi",       xPct: 72, yPct: 77, side: "right" },
  { n: 3,  emoji: "📄", name: "CSV Upload",              status: "live",         color: "#10B981", description: "Bulk import bank statements, invoices, and ledgers.",      widget: "generic",   href: "/dashboard/data-import", xPct: 28, yPct: 69, side: "left"  },
  { n: 4,  emoji: "📊", name: "Revenue Intelligence",    status: "coming_soon",  color: "#14B8A6", description: "MRR/ARR dashboards, cohort analysis, churn signals.",       widget: "revenue",   href: "/roadmap#revenue",       xPct: 70, yPct: 62, side: "right" },
  { n: 5,  emoji: "💰", name: "Cost Intelligence",       status: "coming_soon",  color: "#F97316", description: "Expense categorization, vendor spend optimization.",        widget: "cost",      href: "/roadmap#cost",          xPct: 31, yPct: 55, side: "left"  },
  { n: 6,  emoji: "⚡", name: "Razorpay Sync",           status: "coming_soon",  color: "#6366F1", description: "Payment sync, settlement tracking, refund reconciliation.",  widget: "generic",   href: "/roadmap#razorpay",      xPct: 67, yPct: 48, side: "right" },
  { n: 7,  emoji: "🏛️", name: "GST & Tax Intelligence",  status: "coming_soon",  color: "#F59E0B", description: "GST/TDS compliance, audit readiness, deadline alerts.",     widget: "gst",       href: "/roadmap#gst",           xPct: 34, yPct: 42, side: "left"  },
  { n: 8,  emoji: "👥", name: "Workforce Intelligence",  status: "coming_soon",  color: "#8B5CF6", description: "Payroll analytics, cost-per-employee, headcount ROI.",      widget: "generic",   href: "/roadmap#hr",            xPct: 64, yPct: 36, side: "right" },
  { n: 9,  emoji: "📚", name: "Zoho Books Sync",         status: "coming_soon",  color: "#06B6D4", description: "Auto-pull invoices, expenses, and contacts from Zoho.",     widget: "generic",   href: "/roadmap#zoho",          xPct: 37, yPct: 30, side: "left"  },
  { n: 10, emoji: "🤝", name: "CA Partner Ecosystem",    status: "coming_soon",  color: "#EC4899", description: "800K CAs in India — partner portal & distribution.",        widget: "generic",   href: "/roadmap#ca-partner",    xPct: 61, yPct: 24, side: "right" },
  { n: 11, emoji: "🌍", name: "Market & Growth",         status: "coming_soon",  color: "#10B981", description: "Market intelligence, competitive benchmarking.",            widget: "generic",   href: "/roadmap#market",        xPct: 40, yPct: 18, side: "left"  },
  { n: 12, emoji: "🏦", name: "Banking & Fintech",       status: "coming_soon",  color: "#6366F1", description: "Account Aggregator, open banking, credit insights.",        widget: "generic",   href: "/roadmap#banking",       xPct: 56, yPct: 12, side: "right" },
];

/** Stop where the climber currently rests (1-indexed). */
export const CLIMBER_AT = 3;
