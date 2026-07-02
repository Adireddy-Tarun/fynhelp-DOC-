import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";
import {
  IconRocket,
  IconFileDownload,
  IconBook,
  IconNews,
  IconMessages,
  IconBuildingBank,
  IconRefresh,
  IconMessageChatbot,
  IconChartArrowsVertical,
  IconCalendarEvent,
  IconGauge,
  IconMessage,
  IconBellRinging,
  IconFileSpreadsheet,
  IconPlayerPlayFilled,
  IconClock,
  IconEye,
  IconFileText,
  IconDownload,
  IconMessageCircle2,
  type IconProps,
} from "@tabler/icons-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const downloadHref = (id: string) =>
  `${SUPABASE_URL}/functions/v1/download-resource?id=${encodeURIComponent(id)}`;

// ============================================================
// BRAND
// ============================================================
const INK = "#1A1008";
const RED = "#C41E1E";
const BEIGE = "#F4EDDA";
const GOLD = "#8B6914";

type IconCmp = React.ComponentType<IconProps>;

// ============================================================
// TYPES
// ============================================================
type TabKey = "getting-started" | "templates" | "glossary" | "blog" | "community";

interface VideoItem {
  id: string;
  step: string;
  title: string;
  description: string;
  duration: string;
  icon: IconCmp;
  category: string;
}
interface ArticleItem {
  id: string;
  title: string;
  excerpt: string;
  views: string;
  date: string;
}
interface TemplateItem {
  id: string;
  title: string;
  description: string;
  format: string;
  downloads: string | null;
  href: string;
  icon?: string | null;
}
interface GlossaryItem {
  id: string;
  term: string;
  short: string;
  full: string;
}
interface CommunityItem {
  id: string;
  author: string;
  initials: string;
  color: string;
  title: string;
  preview: string;
  replies: number;
  ago: string;
  tags: string[];
}

// ============================================================
// SEED DATA
// ============================================================
const VIDEOS: VideoItem[] = [
  { id: "v1", step: "DAY 1", title: "Connecting your bank account", description: "Link HDFC, ICICI, SBI and 50+ Indian banks securely via account aggregator.", duration: "5 min", icon: IconBuildingBank, category: "Bank connection" },
  { id: "v2", step: "DAY 1", title: "Syncing Tally or accounting software", description: "One-click sync with Tally Prime, Zoho Books, QuickBooks and more.", duration: "15 min", icon: IconRefresh, category: "Sync" },
  { id: "v3", step: "DAY 1", title: "Setting up GSTIN & compliance calendar", description: "Add your GSTIN and auto-populate every filing deadline for the year.", duration: "10 min", icon: IconCalendarEvent, category: "Compliance" },
  { id: "v4", step: "WEEK 1", title: "Understanding your first dashboard", description: "Read your cash flow, runway, and receivables panels like a CFO.", duration: "20 min", icon: IconGauge, category: "Dashboard" },
  { id: "v5", step: "WEEK 1", title: "First conversation with CFO Fynny", description: "Ask questions in Hindi or English and get founder-grade answers.", duration: "10 min", icon: IconMessageChatbot, category: "AI CFO" },
  { id: "v6", step: "WEEK 2", title: "Running your first hiring simulation", description: "Model the impact of a new hire on burn, runway and breakeven.", duration: "15 min", icon: IconChartArrowsVertical, category: "Simulation" },
  { id: "v7", step: "WEEK 2", title: "ITC reconciliation walkthrough", description: "Match GSTR-2B against your purchase register in minutes.", duration: "8 min", icon: IconFileSpreadsheet, category: "GST" },
  { id: "v8", step: "MONTH 1", title: "WhatsApp alerts setup", description: "Get daily cash, GST and overdue invoice nudges on WhatsApp.", duration: "3 min", icon: IconBellRinging, category: "Alerts" },
];

const ARTICLES: ArticleItem[] = [
  { id: "a1", title: "5 signs you need an AI CFO before your next funding round", excerpt: "Financial intelligence is no longer a luxury. Here's how to know it's time to upgrade from spreadsheets.", views: "1.2K", date: "May 1, 2026" },
  { id: "a2", title: "Section 43B(h): The MSME payment law every founder must know", excerpt: "How a small change in the Income Tax Act gives MSMEs unprecedented leverage over delayed payments.", views: "2.4K", date: "Apr 28, 2026" },
  { id: "a3", title: "How we cut DSO from 67 days to 41 in 90 days", excerpt: "A founder's playbook for tightening receivables without alienating your best customers.", views: "890", date: "Apr 22, 2026" },
  { id: "a4", title: "GST 2.0: What the new rate rationalisation means for you", excerpt: "The biggest GST overhaul in 5 years is here. Here's a clear breakdown for SME owners.", views: "3.1K", date: "Apr 15, 2026" },
  { id: "a5", title: "The compliance calendar every Indian SME should run", excerpt: "20+ filings, 12 months, 1 dashboard. The complete deadline map for FY 2026-27.", views: "1.8K", date: "Apr 8, 2026" },
  { id: "a6", title: "Why your CA shouldn't also be your CFO", excerpt: "Compliance and strategy are two different jobs. Here's why founders confuse them, and what it costs.", views: "1.4K", date: "Apr 1, 2026" },
];

type ArticleCategory = "GST" | "Cash flow" | "MSME" | "Startup finance" | "Compliance";
const ARTICLE_CATEGORY: Record<string, ArticleCategory> = {
  a1: "Startup finance",
  a2: "MSME",
  a3: "Cash flow",
  a4: "GST",
  a5: "Compliance",
  a6: "Startup finance",
};

const GLOSSARY: GlossaryItem[] = [
  { id: "g-arr", term: "ARR", short: "Annual Recurring Revenue.", full: "Annual Recurring Revenue, the predictable subscription or contract revenue your business expects to earn over a 12-month period. ARR = MRR × 12." },
  { id: "g-burn", term: "Burn Rate", short: "Monthly cash spend rate.", full: "The speed at which your business spends its cash reserves. Net burn = cash out − cash in. Tracked monthly to project runway." },
  { id: "g-cac", term: "CAC", short: "Customer Acquisition Cost.", full: "Customer Acquisition Cost, total sales and marketing spend divided by the number of new customers acquired in the same period." },
  { id: "g-churn", term: "Churn", short: "Customer or revenue loss rate.", full: "The rate at which customers stop doing business with you, expressed as a percentage of your base per month or year. Revenue churn weights customers by their billing." },
  { id: "g-dso", term: "DSO", short: "Days Sales Outstanding.", full: "Days Sales Outstanding, the average number of days it takes to collect payment after a sale. Indian SME average is around 42 days." },
  { id: "g-ebitda", term: "EBITDA", short: "Earnings before interest, tax, depreciation, amortization.", full: "Earnings Before Interest, Taxes, Depreciation and Amortization, a proxy for operating cash profitability that strips out financing and accounting effects." },
  { id: "g-grossmargin", term: "Gross Margin", short: "Revenue minus cost of goods sold.", full: "Revenue minus the direct cost of producing what you sold, expressed as a percentage of revenue. A core measure of unit economics." },
  { id: "g-gstr1", term: "GSTR-1", short: "GST outward supply return.", full: "Monthly or quarterly return that lists every outward supply (sale) made by a registered taxpayer. Drives the buyer's GSTR-2B." },
  { id: "g-itc", term: "ITC", short: "Input Tax Credit (GST).", full: "Input Tax Credit, GST paid on business purchases that you can offset against the GST you owe on sales, subject to GSTR-2B matching." },
  { id: "g-ltv", term: "LTV", short: "Lifetime Value of customer.", full: "Lifetime Value, the total gross profit you expect from a customer over the entire relationship. LTV/CAC > 3 is a healthy benchmark." },
  { id: "g-mrr", term: "MRR", short: "Monthly Recurring Revenue.", full: "Monthly Recurring Revenue, the predictable revenue your business earns every month from active subscriptions or contracts." },
  { id: "g-nps", term: "NPS", short: "Net Promoter Score.", full: "Net Promoter Score, a customer satisfaction metric on a 0–10 scale. Promoters (9–10) minus Detractors (0–6), expressed as a percentage." },
  { id: "g-pl", term: "P&L", short: "Profit & Loss statement.", full: "Profit & Loss statement, a summary of revenue, costs and expenses over a period, ending with net profit or loss." },
  { id: "g-runway", term: "Runway", short: "Months until cash depletes.", full: "The number of months your business can operate at its current net burn before running out of cash. Runway = cash on hand ÷ monthly net burn." },
  { id: "g-wc", term: "Working Capital", short: "Current assets minus current liabilities.", full: "Current assets minus current liabilities, the short-term liquidity cushion your business operates with day to day." },
];

const COMMUNITY: CommunityItem[] = [
  { id: "c1", author: "Rajesh Kumar", initials: "R", color: GOLD, title: "How do I reconcile ITC mismatches in GSTR-2A vs 2B?", preview: "I'm seeing a ~₹40K gap between 2A and 2B for March. Some vendors filed late. Best way to handle this cleanly?", replies: 12, ago: "2h ago", tags: ["GST", "Compliance"] },
  { id: "c2", author: "Priya Sharma", initials: "P", color: RED, title: "Best practices for tracking marketplace settlements?", preview: "Amazon and Flipkart settlements come in batched. How are folks reconciling fees, returns and TCS?", replies: 8, ago: "5h ago", tags: ["Cash Flow", "Taxes"] },
  { id: "c3", author: "Ankit Mehta", initials: "A", color: "rgba(26,16,8,0.7)", title: "Should I hire full-time accountant or quarterly CA?", preview: "₹3 Cr ARR, 14 people. CA fees feel high but FT accountant feels overkill. What did you do at this stage?", replies: 15, ago: "1d ago", tags: ["Funding", "Runway"] },
  { id: "c4", author: "Neha Gupta", initials: "N", color: GOLD, title: "Razorpay settlement reconciliation tips?", preview: "Settlement files don't tag back to invoice numbers. Anyone built a clean mapping or using a tool for it?", replies: 6, ago: "2d ago", tags: ["Cash Flow"] },
  { id: "c5", author: "Vikram Singh", initials: "V", color: RED, title: "How to handle RCM (Reverse Charge Mechanism) entries?", preview: "Started using a freelance designer abroad. Do I need to self-invoice every payment under RCM?", replies: 9, ago: "3d ago", tags: ["GST", "Compliance"] },
  { id: "c6", author: "Kavita Reddy", initials: "K", color: "rgba(26,16,8,0.7)", title: "Cash vs accrual accounting for small businesses?", preview: "Turnover ₹80L. Currently on cash basis. CA is pushing me to move to accrual. Worth the switch now?", replies: 4, ago: "4d ago", tags: ["MSME", "Forecasting"] },
  { id: "c7", author: "Amit Patel", initials: "A", color: GOLD, title: "TDS deduction rates for FY 2026-27?", preview: "Looking for a clean updated table for 194C, 194J, 194Q. Some thresholds changed in the latest budget.", replies: 11, ago: "5d ago", tags: ["Taxes", "Compliance"] },
  { id: "c8", author: "Deepak Jain", initials: "D", color: RED, title: "Invoice numbering best practices for GST compliance?", preview: "Multi-state ops, multiple GSTINs. How are you structuring invoice series so audit doesn't flag gaps?", replies: 7, ago: "1w ago", tags: ["GST", "MSME"] },
  { id: "c9", author: "Sanjay Kumar", initials: "S", color: "rgba(26,16,8,0.7)", title: "How to claim GST refund on exports?", preview: "First year of LUT-based exports. Refund stuck for 3 months. Anything I should pre-empt before filing?", replies: 13, ago: "1w ago", tags: ["GST", "Cash Flow"] },
  { id: "c10", author: "Ritu Agarwal", initials: "R", color: GOLD, title: "Difference between GSTR-3B and GSTR-1?", preview: "Junior team keeps confusing the two. Looking for a 1-page explainer I can share internally.", replies: 5, ago: "2w ago", tags: ["GST"] },
];

// ============================================================
// TABS CONFIG
// ============================================================
const TABS: { key: TabKey; label: string; shortLabel: string; icon: IconCmp; badge: string; placeholder: string }[] = [
  { key: "getting-started", label: "Getting Started", shortLabel: "Getting Started", icon: IconRocket, badge: `${VIDEOS.length} videos`, placeholder: "Search videos..." },
  { key: "templates", label: "Templates & Downloads", shortLabel: "Templates", icon: IconFileDownload, badge: "5 files", placeholder: "Search templates..." },
  { key: "glossary", label: "Financial Glossary", shortLabel: "Glossary", icon: IconBook, badge: `${GLOSSARY.length}+ terms`, placeholder: "Search terms..." },
  { key: "blog", label: "Blog", shortLabel: "Blog", icon: IconNews, badge: "New", placeholder: "Search articles..." },
  { key: "community", label: "Community", shortLabel: "Community", icon: IconMessages, badge: `${COMMUNITY.length} discussions`, placeholder: "Search discussions..." },
];

const STEP_ORDER = ["DAY 1", "WEEK 1", "WEEK 2", "WEEK 3", "MONTH 1"];

// ============================================================
// CARD STYLES — flat dashboard look
// ============================================================
const cardBase: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 12,
  border: "1px solid rgba(26,16,8,0.08)",
  overflow: "hidden",
  transition: "border-color 0.2s ease, transform 0.2s ease",
};
const onCardEnter = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "rgba(139,105,20,0.35)";
};
const onCardLeave = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.borderColor = "rgba(26,16,8,0.08)";
};

// Compact 48px metadata header used across cards
const MetaHeader = ({
  Icon,
  category,
  meta,
}: {
  Icon: IconCmp;
  category: string;
  meta?: string;
}) => (
  <div
    style={{
      height: 48,
      background: BEIGE,
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "0 14px",
      borderBottom: "1px solid rgba(26,16,8,0.06)",
    }}
  >
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        background: "#FFFFFF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: INK,
        flexShrink: 0,
      }}
    >
      <Icon size={18} stroke={1.75} />
    </div>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: 0.8,
        textTransform: "uppercase",
        color: GOLD,
        flex: 1,
        minWidth: 0,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {category}
    </span>
    {meta && (
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: "rgba(26,16,8,0.6)",
          flexShrink: 0,
        }}
      >
        {meta}
      </span>
    )}
  </div>
);

// ============================================================
// VIDEO ROW
// ============================================================
const VideoRow = ({ v, onPlay }: { v: VideoItem; onPlay: () => void }) => (
  <article
    style={{ ...cardBase, cursor: "pointer" }}
    onMouseEnter={onCardEnter}
    onMouseLeave={onCardLeave}
    onClick={onPlay}
  >
    <MetaHeader Icon={v.icon} category={v.category} meta={v.duration} />
    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          fontWeight: 600,
          color: GOLD,
          letterSpacing: 0.8,
        }}
      >
        {v.step}
      </span>
      <h3
        style={{
          fontFamily: "Georgia, serif",
          fontWeight: 600,
          fontSize: 18,
          color: INK,
          lineHeight: 1.3,
          margin: 0,
        }}
      >
        {v.title}
      </h3>
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 13.5,
          color: "rgba(26,16,8,0.65)",
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {v.description}
      </p>
      <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: "rgba(26,16,8,0.55)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <IconClock size={13} stroke={1.75} /> {v.duration}
        </span>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: "#FFFFFF",
            background: RED,
            padding: "7px 14px",
            borderRadius: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <IconPlayerPlayFilled size={12} /> Watch
        </span>
      </div>
    </div>
  </article>
);

// ============================================================
// TEMPLATE CARD
// ============================================================
const TemplateCardView = ({ t }: { t: TemplateItem }) => (
  <article
    style={{ ...cardBase, display: "flex", flexDirection: "column" }}
    onMouseEnter={onCardEnter}
    onMouseLeave={onCardLeave}
  >
    <MetaHeader Icon={IconFileText} category={t.format} meta={t.downloads ? `↓ ${t.downloads}` : "—"} />
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 600, fontSize: 17, color: INK, margin: 0, lineHeight: 1.3 }}>
        {t.title}
      </h3>
      {t.description && (
        <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: "rgba(26,16,8,0.65)", lineHeight: 1.55, margin: 0 }}>
          {t.description}
        </p>
      )}
      <a
        href={t.href}
        download
        rel="noopener noreferrer"
        style={{
          marginTop: "auto",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          padding: "10px 16px",
          background: RED,
          color: "#FFFFFF",
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 13.5,
          borderRadius: 8,
          textDecoration: "none",
        }}
      >
        <IconDownload size={15} stroke={2} /> Download
      </a>
    </div>
  </article>
);

// ============================================================
// GLOSSARY ROW — table-row layout
// ============================================================
const GlossaryRow = ({ g, onOpen }: { g: GlossaryItem; onOpen: () => void }) => (
  <div
    onClick={onOpen}
    style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 16,
      padding: "14px 16px",
      background: "#FFFFFF",
      border: "1px solid rgba(26,16,8,0.08)",
      borderRadius: 12,
      cursor: "pointer",
      transition: "border-color 0.2s ease",
    }}
    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(139,105,20,0.35)")}
    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = "rgba(26,16,8,0.08)")}
  >
    <div
      style={{
        width: 80,
        minWidth: 80,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 14,
        color: INK,
        fontWeight: 600,
      }}
    >
      {g.term}
    </div>
    <div
      style={{
        flex: 1,
        fontFamily: "Inter, sans-serif",
        fontSize: 13,
        color: "rgba(26,16,8,0.75)",
        lineHeight: 1.55,
      }}
    >
      {g.short}
    </div>
    <span
      style={{
        fontFamily: "Inter, sans-serif",
        fontWeight: 600,
        fontSize: 12.5,
        color: GOLD,
        whiteSpace: "nowrap",
        alignSelf: "center",
      }}
    >
      Expand →
    </span>
  </div>
);

// ============================================================
// ARTICLE CARD
// ============================================================
const readingTime = (text: string) => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
};

const ArticleCardView = ({ a }: { a: ArticleItem }) => {
  const category = ARTICLE_CATEGORY[a.id] ?? "Startup finance";
  const isRed = category === "GST" || category === "Compliance";
  const dot = isRed ? RED : GOLD;
  const rt = readingTime(a.excerpt);
  return (
    <article
      style={{ ...cardBase, display: "flex", flexDirection: "column", cursor: "pointer" }}
      onMouseEnter={onCardEnter}
      onMouseLeave={onCardLeave}
    >
      <MetaHeader Icon={IconNews} category={category} meta={`${rt} min read`} />
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <h3
          style={{
            fontFamily: "Georgia, serif",
            fontWeight: 600,
            fontSize: 18,
            color: INK,
            lineHeight: 1.35,
            margin: 0,
          }}
        >
          {a.title}
        </h3>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13.5,
            color: "rgba(26,16,8,0.65)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {a.excerpt}
        </p>
        <div
          style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: 8,
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "Inter, sans-serif",
              fontSize: 12.5,
              color: "rgba(26,16,8,0.7)",
            }}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot }} />
            {category} · {rt} min read
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: "rgba(26,16,8,0.5)",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <IconEye size={13} stroke={1.75} /> {a.views}
          </span>
        </div>
      </div>
    </article>
  );
};

// ============================================================
// COMMUNITY ROW
// ============================================================
const CommunityRow = ({ c }: { c: CommunityItem }) => (
  <article
    style={{ ...cardBase, padding: 20, cursor: "pointer", display: "flex", gap: 14 }}
    onMouseEnter={onCardEnter}
    onMouseLeave={onCardLeave}
  >
    <div
      style={{
        width: 40,
        height: 40,
        minWidth: 40,
        borderRadius: "50%",
        background: c.color,
        color: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        fontSize: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {c.initials}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: 13.5, color: "rgba(26,16,8,0.85)" }}>
          {c.author}
        </span>
        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "rgba(26,16,8,0.5)" }}>
          {c.ago}
        </span>
      </div>
      <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 600, fontSize: 16, color: INK, lineHeight: 1.35, margin: "0 0 6px 0" }}>
        {c.title}
      </h3>
      <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: "rgba(26,16,8,0.65)", lineHeight: 1.5, margin: "0 0 10px 0" }}>
        {c.preview}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {c.tags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: GOLD,
                background: "rgba(139,105,20,0.12)",
                padding: "3px 8px",
                borderRadius: 999,
                fontWeight: 600,
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 12.5,
            color: "rgba(26,16,8,0.55)",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <IconMessageCircle2 size={13} stroke={1.75} /> {c.replies} replies
        </span>
      </div>
    </div>
  </article>
);

// ============================================================
// EMPTY STATE
// ============================================================
const EmptyState = ({ label }: { label: string }) => (
  <div style={{ textAlign: "center", padding: "72px 20px" }}>
    <div style={{ display: "inline-flex", padding: 16, borderRadius: 12, background: "rgba(139,105,20,0.1)", marginBottom: 14 }}>
      <Search size={28} color={GOLD} />
    </div>
    <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 600, fontSize: 20, color: INK, marginBottom: 6 }}>
      No {label} found
    </h3>
    <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.6)" }}>
      Try different keywords or switch tabs.
    </p>
  </div>
);

// ============================================================
// MAIN PAGE
// ============================================================
const ResourcesPage = () => {
  const [params, setParams] = useSearchParams();
  const rawTab = params.get("tab") as TabKey | null;
  const initialTab: TabKey = TABS.find((t) => t.key === rawTab) ? (rawTab as TabKey) : "getting-started";

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [videoModal, setVideoModal] = useState<VideoItem | null>(null);
  const [glossaryModal, setGlossaryModal] = useState<GlossaryItem | null>(null);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);

  useEffect(() => {
    const cur = params.get("tab");
    if (cur !== activeTab) {
      const next = new URLSearchParams(params);
      next.set("tab", activeTab);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    const next = (params.get("tab") as TabKey | null) ?? "getting-started";
    const safe: TabKey = TABS.find((t) => t.key === next) ? next : "getting-started";
    if (safe !== activeTab) {
      setActiveTab(safe);
      setSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setSearch("");
    setDebounced("");
  }, [activeTab]);

  useEffect(() => {
    supabase
      .from("resources")
      .select("id, title, description, format, icon_url")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        const rows = (data ?? []).map((row): TemplateItem => ({
          id: row.id,
          title: row.title,
          description: row.description ?? "",
          format: row.format ?? "PDF",
          downloads: null,
          href: downloadHref(row.id),
          icon: row.icon_url,
        }));
        setTemplates(rows);
      });
  }, []);

  const matchesSearch = (haystack: string) => !debounced || haystack.toLowerCase().includes(debounced);

  const filteredVideos = useMemo(
    () => VIDEOS.filter((v) => matchesSearch(`${v.title} ${v.description} ${v.step}`)),
    [debounced],
  );
  const groupedVideos = useMemo(() => {
    return STEP_ORDER.map((step) => ({
      step,
      items: filteredVideos.filter((v) => v.step === step),
    })).filter((g) => g.items.length > 0);
  }, [filteredVideos]);

  const filteredTemplates = useMemo(
    () => templates.filter((t) => matchesSearch(`${t.title} ${t.description} ${t.format}`)),
    [templates, debounced],
  );
  const filteredGlossary = useMemo(
    () =>
      [...GLOSSARY]
        .sort((a, b) => a.term.localeCompare(b.term))
        .filter((g) => matchesSearch(`${g.term} ${g.short} ${g.full}`)),
    [debounced],
  );
  const filteredBlogPosts = useMemo(
    () => blogPosts.filter((a: any) => matchesSearch(`${a.title} ${a.excerpt} ${a.category}`)),
    [blogPosts, debounced],
  );
  const filteredCommunity = useMemo(
    () => COMMUNITY.filter((c) => matchesSearch(`${c.title} ${c.preview} ${c.author}`)),
    [debounced],
  );

  const currentTabConfig = TABS.find((t) => t.key === activeTab)!;

  return (
    <Layout>
      <style>{`
        @keyframes fade-card {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .resource-anim { animation: fade-card 300ms ease-out both; }
        .fyn-tabs-row::-webkit-scrollbar { display: none; }
        .fyn-tabs-row { scrollbar-width: none; -ms-overflow-style: none; }
        @media (max-width: 768px) {
          .fyn-resources-hero { padding: 32px 20px 28px !important; }
          .fyn-resources-tabs-wrap { padding: 14px 16px !important; }
          .fyn-resources-content { padding: 28px 16px 56px !important; }
          .fyn-tab-btn { min-width: 0 !important; padding: 10px 14px !important; font-size: 13px !important; }
          .fyn-resources-grid-tpl { grid-template-columns: 1fr !important; gap: 14px !important; }
          .fyn-resources-grid-blog { grid-template-columns: 1fr !important; gap: 14px !important; }
          .fyn-resources-stats { flex-direction: column !important; }
          .fyn-resources-stats > div { width: 100% !important; }
        }
      `}</style>

      {/* HERO */}
      <section
        className="fyn-resources-hero"
        style={{
          background: BEIGE,
          padding: "56px 32px 44px",
          borderBottom: "1px solid rgba(26,16,8,0.08)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 11,
              letterSpacing: 1.5,
              textTransform: "uppercase",
              color: GOLD,
              marginBottom: 10,
            }}
          >
            Resource centre
          </div>
          <h1
            style={{
              fontFamily: "Georgia, serif",
              fontWeight: 700,
              fontSize: 32,
              color: INK,
              lineHeight: 1.2,
              margin: "0 0 24px 0",
            }}
          >
            Learn, reference, and connect
          </h1>
          <div
            className="fyn-resources-stats"
            style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            {[
              { value: VIDEOS.length, label: "video guides" },
              { value: GLOSSARY.length, label: "glossary terms" },
              { value: COMMUNITY.length, label: "community threads" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,16,8,0.08)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: 8,
                  minWidth: 180,
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    fontSize: 22,
                    color: RED,
                  }}
                >
                  {s.value}
                </span>
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 13,
                    color: "rgba(26,16,8,0.7)",
                  }}
                >
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TABS */}
      <div
        style={{
          background: BEIGE,
          borderBottom: "1px solid rgba(26,16,8,0.1)",
          position: "sticky",
          top: 72,
          zIndex: 30,
        }}
      >
        <div className="fyn-resources-tabs-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 24px" }}>
          <div
            className="fyn-tabs-row"
            style={{
              display: "flex",
              gap: 6,
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: 2,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
              const TabIcon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={(e) => {
                    setActiveTab(t.key);
                    (e.currentTarget as HTMLElement).scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                  }}
                  aria-pressed={isActive}
                  className="fyn-tab-btn"
                  style={{
                    flex: "0 0 auto",
                    padding: "10px 16px",
                    borderRadius: 8,
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 13.5,
                    cursor: "pointer",
                    transition: "background 0.15s ease, color 0.15s ease",
                    whiteSpace: "nowrap",
                    border: "none",
                    background: isActive ? RED : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(26,16,8,0.75)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(26,16,8,0.05)";
                      (e.currentTarget as HTMLElement).style.color = INK;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(26,16,8,0.75)";
                    }
                  }}
                >
                  <TabIcon size={16} stroke={1.75} />
                  <span>
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.shortLabel}</span>
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: 5,
                      background: isActive ? "rgba(255,255,255,0.22)" : "rgba(139,105,20,0.14)",
                      color: isActive ? "#FFFFFF" : GOLD,
                    }}
                  >
                    {t.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ marginTop: 14, maxWidth: 520 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={18}
                color={GOLD}
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={currentTabConfig.placeholder}
                aria-label={currentTabConfig.placeholder}
                style={{
                  width: "100%",
                  height: 44,
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,16,8,0.12)",
                  borderRadius: 10,
                  padding: "0 14px 0 42px",
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: INK,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = `1px solid ${GOLD}`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(26,16,8,0.12)";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <section
        className="fyn-resources-content"
        style={{
          background: BEIGE,
          padding: "32px 24px 72px",
          minHeight: 400,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {activeTab === "getting-started" && (
            <>
              {filteredVideos.length === 0 ? (
                <EmptyState label="videos" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {groupedVideos.map((g) => (
                    <div key={g.step}>
                      <h2
                        style={{
                          fontFamily: "Georgia, serif",
                          fontWeight: 700,
                          fontSize: 18,
                          letterSpacing: 0.5,
                          color: INK,
                          margin: "0 0 14px 0",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: RED }} />
                        {g.step}
                      </h2>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                          gap: 16,
                        }}
                      >
                        {g.items.map((v, i) => (
                          <div key={v.id} className="resource-anim" style={{ animationDelay: `${i * 40}ms` }}>
                            <VideoRow v={v} onPlay={() => setVideoModal(v)} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "templates" && (
            <>
              {filteredTemplates.length === 0 ? (
                <EmptyState label="templates" />
              ) : (
                <div
                  className="fyn-resources-grid-tpl"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                    gap: 16,
                  }}
                >
                  {filteredTemplates.map((t, i) => (
                    <div key={t.id} className="resource-anim" style={{ animationDelay: `${i * 40}ms` }}>
                      <TemplateCardView t={t} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "glossary" && (
            <>
              {filteredGlossary.length === 0 ? (
                <EmptyState label="terms" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 900, margin: "0 auto" }}>
                  {filteredGlossary.map((g, i) => (
                    <div key={g.id} className="resource-anim" style={{ animationDelay: `${i * 20}ms` }}>
                      <GlossaryRow g={g} onOpen={() => setGlossaryModal(g)} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "blog" && (
            <>
              {filteredArticles.length === 0 ? (
                <EmptyState label="articles" />
              ) : (
                <div
                  className="fyn-resources-grid-blog"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                    gap: 18,
                  }}
                >
                  {filteredArticles.map((a, i) => (
                    <div key={a.id} className="resource-anim" style={{ animationDelay: `${i * 40}ms` }}>
                      <ArticleCardView a={a} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "community" && (
            <>
              {filteredCommunity.length === 0 ? (
                <EmptyState label="discussions" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 900, margin: "0 auto" }}>
                  {filteredCommunity.map((c, i) => (
                    <div key={c.id} className="resource-anim" style={{ animationDelay: `${i * 30}ms` }}>
                      <CommunityRow c={c} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Video modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(26,16,8,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setVideoModal(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              maxWidth: 640,
              width: "calc(100% - 32px)",
              overflow: "hidden",
              border: "1px solid rgba(26,16,8,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 18px",
                borderBottom: "1px solid rgba(26,16,8,0.08)",
              }}
            >
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 17, color: INK, margin: 0 }}>{videoModal.title}</h3>
              <button
                onClick={() => setVideoModal(null)}
                style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(26,16,8,0.5)" }}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: 32, textAlign: "center", background: BEIGE }}>
              <div
                style={{
                  display: "inline-flex",
                  padding: 14,
                  borderRadius: 12,
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,16,8,0.08)",
                  marginBottom: 14,
                  color: GOLD,
                }}
              >
                <IconMessage size={22} stroke={1.75} />
              </div>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: "rgba(26,16,8,0.75)",
                  lineHeight: 1.6,
                  margin: 0,
                  maxWidth: 460,
                  marginInline: "auto",
                }}
              >
                Our tutorial library is being recorded and will be published here. In the meantime, explore our written
                guides and templates in the tabs above.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Glossary modal */}
      {glossaryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(26,16,8,0.85)", backdropFilter: "blur(8px)" }}
          onClick={() => setGlossaryModal(null)}
        >
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              maxWidth: 560,
              width: "calc(100% - 32px)",
              padding: 28,
              position: "relative",
              border: "1px solid rgba(26,16,8,0.08)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setGlossaryModal(null)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(26,16,8,0.5)",
              }}
            >
              <X size={18} />
            </button>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                letterSpacing: 1,
                color: GOLD,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Glossary term
            </div>
            <h3 style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: 24, color: INK, margin: "0 0 12px 0" }}>
              {glossaryModal.term}
            </h3>
            <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: "rgba(26,16,8,0.8)", lineHeight: 1.65, margin: 0 }}>
              {glossaryModal.full}
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ResourcesPage;
