import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Search, X } from "lucide-react";
import FYNIcon, { type FYNIconName } from "@/components/FYNIcon";

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
  downloads: string;
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
}

// ============================================================
// SEED DATA
// ============================================================
const VIDEOS: VideoItem[] = [
  { id: "v1", step: "DAY 1", title: "Connecting your bank account", description: "Link HDFC, ICICI, SBI and 50+ Indian banks securely via account aggregator.", duration: "5 min" },
  { id: "v2", step: "DAY 1", title: "Syncing Tally or accounting software", description: "One-click sync with Tally Prime, Zoho Books, QuickBooks and more.", duration: "15 min" },
  { id: "v3", step: "DAY 1", title: "Setting up GSTIN & compliance calendar", description: "Add your GSTIN and auto-populate every filing deadline for the year.", duration: "10 min" },
  { id: "v4", step: "WEEK 1", title: "Understanding your first dashboard", description: "Read your cash flow, runway, and receivables panels like a CFO.", duration: "20 min" },
  { id: "v5", step: "WEEK 1", title: "First conversation with CFO Fynny", description: "Ask questions in Hindi or English and get founder-grade answers.", duration: "10 min" },
  { id: "v6", step: "WEEK 2", title: "Running your first hiring simulation", description: "Model the impact of a new hire on burn, runway and breakeven.", duration: "15 min" },
  { id: "v7", step: "WEEK 2", title: "ITC reconciliation walkthrough", description: "Match GSTR-2B against your purchase register in minutes.", duration: "8 min" },
  { id: "v8", step: "MONTH 1", title: "WhatsApp alerts setup", description: "Get daily cash, GST and overdue invoice nudges on WhatsApp.", duration: "3 min" },
];

const ARTICLES: ArticleItem[] = [
  { id: "a1", title: "5 signs you need an AI CFO before your next funding round", excerpt: "Financial intelligence is no longer a luxury. Here's how to know it's time to upgrade from spreadsheets.", views: "1.2K", date: "May 1, 2026" },
  { id: "a2", title: "Section 43B(h): The MSME payment law every founder must know", excerpt: "How a small change in the Income Tax Act gives MSMEs unprecedented leverage over delayed payments.", views: "2.4K", date: "Apr 28, 2026" },
  { id: "a3", title: "How we cut DSO from 67 days to 41 in 90 days", excerpt: "A founder's playbook for tightening receivables without alienating your best customers.", views: "890", date: "Apr 22, 2026" },
  { id: "a4", title: "GST 2.0: What the new rate rationalisation means for you", excerpt: "The biggest GST overhaul in 5 years is here. Here's a clear breakdown for SME owners.", views: "3.1K", date: "Apr 15, 2026" },
  { id: "a5", title: "The compliance calendar every Indian SME should run", excerpt: "20+ filings, 12 months, 1 dashboard. The complete deadline map for FY 2026-27.", views: "1.8K", date: "Apr 8, 2026" },
  { id: "a6", title: "Why your CA shouldn't also be your CFO", excerpt: "Compliance and strategy are two different jobs. Here's why founders confuse them — and what it costs.", views: "1.4K", date: "Apr 1, 2026" },
];

const GLOSSARY: GlossaryItem[] = [
  { id: "g-arr", term: "ARR", short: "Annual Recurring Revenue.", full: "Annual Recurring Revenue — the predictable subscription or contract revenue your business expects to earn over a 12-month period. ARR = MRR × 12." },
  { id: "g-burn", term: "Burn Rate", short: "Monthly cash spend rate.", full: "The speed at which your business spends its cash reserves. Net burn = cash out − cash in. Tracked monthly to project runway." },
  { id: "g-cac", term: "CAC", short: "Customer Acquisition Cost.", full: "Customer Acquisition Cost — total sales and marketing spend divided by the number of new customers acquired in the same period." },
  { id: "g-churn", term: "Churn", short: "Customer or revenue loss rate.", full: "The rate at which customers stop doing business with you, expressed as a percentage of your base per month or year. Revenue churn weights customers by their billing." },
  { id: "g-dso", term: "DSO", short: "Days Sales Outstanding.", full: "Days Sales Outstanding — the average number of days it takes to collect payment after a sale. Indian SME average is around 42 days." },
  { id: "g-ebitda", term: "EBITDA", short: "Earnings before interest, tax, depreciation, amortization.", full: "Earnings Before Interest, Taxes, Depreciation and Amortization — a proxy for operating cash profitability that strips out financing and accounting effects." },
  { id: "g-grossmargin", term: "Gross Margin", short: "Revenue minus cost of goods sold.", full: "Revenue minus the direct cost of producing what you sold, expressed as a percentage of revenue. A core measure of unit economics." },
  { id: "g-gstr1", term: "GSTR-1", short: "GST outward supply return.", full: "Monthly or quarterly return that lists every outward supply (sale) made by a registered taxpayer. Drives the buyer's GSTR-2B." },
  { id: "g-itc", term: "ITC", short: "Input Tax Credit (GST).", full: "Input Tax Credit — GST paid on business purchases that you can offset against the GST you owe on sales, subject to GSTR-2B matching." },
  { id: "g-ltv", term: "LTV", short: "Lifetime Value of customer.", full: "Lifetime Value — the total gross profit you expect from a customer over the entire relationship. LTV/CAC > 3 is a healthy benchmark." },
  { id: "g-mrr", term: "MRR", short: "Monthly Recurring Revenue.", full: "Monthly Recurring Revenue — the predictable revenue your business earns every month from active subscriptions or contracts." },
  { id: "g-nps", term: "NPS", short: "Net Promoter Score.", full: "Net Promoter Score — a customer satisfaction metric on a 0–10 scale. Promoters (9–10) minus Detractors (0–6), expressed as a percentage." },
  { id: "g-pl", term: "P&L", short: "Profit & Loss statement.", full: "Profit & Loss statement — a summary of revenue, costs and expenses over a period, ending with net profit or loss." },
  { id: "g-runway", term: "Runway", short: "Months until cash depletes.", full: "The number of months your business can operate at its current net burn before running out of cash. Runway = cash on hand ÷ monthly net burn." },
  { id: "g-wc", term: "Working Capital", short: "Current assets minus current liabilities.", full: "Current assets minus current liabilities — the short-term liquidity cushion your business operates with day to day." },
];

const COMMUNITY: CommunityItem[] = [
  { id: "c1", author: "Rajesh Kumar", initials: "R", color: GOLD, title: "How do I reconcile ITC mismatches in GSTR-2A vs 2B?", preview: "I'm seeing a ~₹40K gap between 2A and 2B for March. Some vendors filed late. Best way to handle this cleanly?", replies: 12, ago: "2h ago" },
  { id: "c2", author: "Priya Sharma", initials: "P", color: RED, title: "Best practices for tracking marketplace settlements?", preview: "Amazon and Flipkart settlements come in batched. How are folks reconciling fees, returns and TCS?", replies: 8, ago: "5h ago" },
  { id: "c3", author: "Ankit Mehta", initials: "A", color: "rgba(26,16,8,0.7)", title: "Should I hire full-time accountant or quarterly CA?", preview: "₹3 Cr ARR, 14 people. CA fees feel high but FT accountant feels overkill. What did you do at this stage?", replies: 15, ago: "1d ago" },
  { id: "c4", author: "Neha Gupta", initials: "N", color: GOLD, title: "Razorpay settlement reconciliation tips?", preview: "Settlement files don't tag back to invoice numbers. Anyone built a clean mapping or using a tool for it?", replies: 6, ago: "2d ago" },
  { id: "c5", author: "Vikram Singh", initials: "V", color: RED, title: "How to handle RCM (Reverse Charge Mechanism) entries?", preview: "Started using a freelance designer abroad. Do I need to self-invoice every payment under RCM?", replies: 9, ago: "3d ago" },
  { id: "c6", author: "Kavita Reddy", initials: "K", color: "rgba(26,16,8,0.7)", title: "Cash vs accrual accounting for small businesses?", preview: "Turnover ₹80L. Currently on cash basis. CA is pushing me to move to accrual. Worth the switch now?", replies: 4, ago: "4d ago" },
  { id: "c7", author: "Amit Patel", initials: "A", color: GOLD, title: "TDS deduction rates for FY 2026-27?", preview: "Looking for a clean updated table for 194C, 194J, 194Q. Some thresholds changed in the latest budget.", replies: 11, ago: "5d ago" },
  { id: "c8", author: "Deepak Jain", initials: "D", color: RED, title: "Invoice numbering best practices for GST compliance?", preview: "Multi-state ops, multiple GSTINs. How are you structuring invoice series so audit doesn't flag gaps?", replies: 7, ago: "1w ago" },
  { id: "c9", author: "Sanjay Kumar", initials: "S", color: "rgba(26,16,8,0.7)", title: "How to claim GST refund on exports?", preview: "First year of LUT-based exports. Refund stuck for 3 months. Anything I should pre-empt before filing?", replies: 13, ago: "1w ago" },
  { id: "c10", author: "Ritu Agarwal", initials: "R", color: GOLD, title: "Difference between GSTR-3B and GSTR-1?", preview: "Junior team keeps confusing the two. Looking for a 1-page explainer I can share internally.", replies: 5, ago: "2w ago" },
];

// ============================================================
// TABS CONFIG
// ============================================================
const TABS: { key: TabKey; label: string; shortLabel: string; icon: FYNIconName; badge: string; placeholder: string }[] = [
  { key: "getting-started", label: "Getting Started", shortLabel: "Getting Started", icon: "getting-started", badge: `${VIDEOS.length} videos`, placeholder: "Search videos..." },
  { key: "templates", label: "Templates & Downloads", shortLabel: "Templates", icon: "templates", badge: "5 files", placeholder: "Search templates..." },
  { key: "glossary", label: "Financial Glossary", shortLabel: "Glossary", icon: "glossary", badge: `${GLOSSARY.length}+ terms`, placeholder: "Search terms..." },
  { key: "blog", label: "Blog", shortLabel: "Blog", icon: "blog", badge: "New", placeholder: "Search articles..." },
  { key: "community", label: "Community", shortLabel: "Community", icon: "community", badge: `${COMMUNITY.length} discussions`, placeholder: "Search discussions..." },
];

const STEP_ORDER = ["DAY 1", "WEEK 1", "WEEK 2", "WEEK 3", "MONTH 1"];

// ============================================================
// CARD STYLES
// ============================================================
const cardBase: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 20,
  border: "1px solid rgba(26,16,8,0.08)",
  boxShadow: "0 6px 20px rgba(26,16,8,0.10), 0 2px 6px rgba(26,16,8,0.06)",
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
};
const onCardEnter = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(-4px)";
  el.style.boxShadow = "0 16px 40px rgba(26,16,8,0.16), 0 4px 12px rgba(139,105,20,0.12)";
  el.style.border = "1px solid rgba(139,105,20,0.3)";
};
const onCardLeave = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "";
  el.style.boxShadow = "0 6px 20px rgba(26,16,8,0.10), 0 2px 6px rgba(26,16,8,0.06)";
  el.style.border = "1px solid rgba(26,16,8,0.08)";
};

const StepBadge = ({ step }: { step: string }) => (
  <span
    style={{
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: 700,
      fontSize: 11,
      textTransform: "uppercase",
      letterSpacing: 1,
      color: GOLD,
      background: "rgba(139,105,20,0.12)",
      padding: "6px 12px",
      borderRadius: 8,
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      lineHeight: 1,
    }}
  >
    <FYNIcon name="getting-started" size={14} animated={false} />
    {step}
  </span>
);

// ============================================================
// VIDEO ROW (horizontal list)
// ============================================================
const VideoRow = ({ v, onPlay }: { v: VideoItem; onPlay: () => void }) => (
  <article
    style={{
      ...cardBase,
      display: "flex",
      flexDirection: "row",
      cursor: "pointer",
    }}
    className="resource-video-row"
    onMouseEnter={onCardEnter}
    onMouseLeave={onCardLeave}
    onClick={onPlay}
  >
    <div
      style={{
        width: 220,
        minWidth: 220,
        height: 150,
        background: "linear-gradient(135deg, rgba(139,105,20,0.25) 0%, rgba(196,30,30,0.25) 100%)",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(196,30,30,0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(196,30,30,0.4)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
          <path d="M3 1.5l9 5.5-9 5.5z" fill="white" />
        </svg>
      </div>
      <span
        style={{
          position: "absolute",
          right: 10,
          bottom: 10,
          background: "rgba(26,16,8,0.85)",
          color: "#fff",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          padding: "3px 8px",
          borderRadius: 6,
        }}
      >
        {v.duration}
      </span>
    </div>
    <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
      <StepBadge step={v.step} />
      <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 19, color: INK, lineHeight: 1.3, margin: 0 }}>
        {v.title}
      </h3>
      <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.7)", lineHeight: 1.5, margin: 0 }}>
        {v.description}
      </p>
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "rgba(26,16,8,0.55)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <FYNIcon name="video" size={14} animated={false} /> {v.duration}
        </span>
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 13,
            color: "#FFFFFF",
            background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`,
            padding: "8px 16px",
            borderRadius: 8,
          }}
        >
          ▶ Watch
        </span>
      </div>
    </div>
  </article>
);

// ============================================================
// TEMPLATE CARD (grid)
// ============================================================
const TemplateCardView = ({ t }: { t: TemplateItem }) => (
  <article style={{ ...cardBase, display: "flex", flexDirection: "column" }} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
    <div
      style={{
        height: 160,
        background: "linear-gradient(135deg, rgba(139,105,20,0.12) 0%, rgba(196,30,30,0.06) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {t.icon ? (
        <img src={t.icon} alt="" style={{ width: 64, height: 64 }} />
      ) : (
        <FYNIcon name="template" size={64} />
      )}
    </div>
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 18, color: INK, margin: 0, lineHeight: 1.3 }}>{t.title}</h3>
      {t.description && (
        <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.65)", lineHeight: 1.5, margin: 0 }}>{t.description}</p>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "rgba(26,16,8,0.55)", marginTop: 4 }}>
        <span>{t.format}</span>
        <span>↓ {t.downloads}</span>
      </div>
      <a
        href={t.href}
        download
        rel="noopener noreferrer"
        style={{
          marginTop: "auto",
          display: "block",
          padding: "12px 20px",
          background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`,
          color: "#FFFFFF",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 14,
          borderRadius: 10,
          textAlign: "center",
          textDecoration: "none",
          boxShadow: "0 4px 12px rgba(196,30,30,0.25)",
        }}
      >
        Download
      </a>
    </div>
  </article>
);

// ============================================================
// GLOSSARY ROW
// ============================================================
const GlossaryRow = ({ g, onOpen }: { g: GlossaryItem; onOpen: () => void }) => (
  <article
    style={{ ...cardBase, padding: 24, cursor: "pointer", display: "flex", gap: 20, alignItems: "flex-start" }}
    onMouseEnter={onCardEnter}
    onMouseLeave={onCardLeave}
    onClick={onOpen}
  >
    <div
      style={{
        width: 56,
        height: 56,
        minWidth: 56,
        borderRadius: 12,
        background: "rgba(139,105,20,0.12)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FYNIcon name="glossary" size={32} />
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 700, fontSize: 20, color: INK, margin: "0 0 6px 0" }}>{g.term}</h3>
      <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.7)", lineHeight: 1.55, margin: 0 }}>{g.short}</p>
    </div>
    <span
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: 13,
        color: GOLD,
        whiteSpace: "nowrap",
        alignSelf: "center",
      }}
    >
      Read more →
    </span>
  </article>
);

// ============================================================
// ARTICLE CARD
// ============================================================
const ArticleCardView = ({ a }: { a: ArticleItem }) => (
  <article style={{ ...cardBase, display: "flex", flexDirection: "column", cursor: "pointer" }} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
    <div
      style={{
        height: 200,
        background: "linear-gradient(135deg, rgba(196,30,30,0.18) 0%, rgba(139,105,20,0.25) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FYNIcon name="article" size={64} />
    </div>
    <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: GOLD,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <FYNIcon name="blog" size={14} animated={false} /> Blog
      </span>
      <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 19, color: INK, lineHeight: 1.35, margin: 0 }}>{a.title}</h3>
      <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.7)", lineHeight: 1.55, margin: 0 }}>{a.excerpt}</p>
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8 }}>
        <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "rgba(26,16,8,0.5)" }}>
          {a.views} views · {a.date}
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: GOLD }}>Read more →</span>
      </div>
    </div>
  </article>
);

// ============================================================
// COMMUNITY ROW
// ============================================================
const CommunityRow = ({ c }: { c: CommunityItem }) => (
  <article style={{ ...cardBase, padding: 24, cursor: "pointer", display: "flex", gap: 16 }} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
    <div
      style={{
        width: 44,
        height: 44,
        minWidth: 44,
        borderRadius: "50%",
        background: c.color,
        color: "#FFFFFF",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        fontSize: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {c.initials}
    </div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 6, flexWrap: "wrap" }}>
        <span style={{ fontFamily: "Roboto, sans-serif", fontWeight: 600, fontSize: 14, color: "rgba(26,16,8,0.85)" }}>{c.author}</span>
        <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "rgba(26,16,8,0.5)" }}>{c.ago}</span>
      </div>
      <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 17, color: INK, lineHeight: 1.35, margin: "0 0 8px 0" }}>{c.title}</h3>
      <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.65)", lineHeight: 1.5, margin: "0 0 12px 0" }}>{c.preview}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "rgba(26,16,8,0.55)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <FYNIcon name="discussion" size={14} animated={false} /> {c.replies} replies
        </span>
        <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13, color: GOLD }}>View discussion →</span>
      </div>
    </div>
  </article>
);

// ============================================================
// EMPTY STATE
// ============================================================
const EmptyState = ({ label }: { label: string }) => (
  <div style={{ textAlign: "center", padding: "80px 20px" }}>
    <div style={{ display: "inline-flex", padding: 20, borderRadius: "50%", background: "rgba(139,105,20,0.1)", marginBottom: 16 }}>
      <Search size={32} color={GOLD} />
    </div>
    <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 22, color: INK, marginBottom: 8 }}>No {label} found</h3>
    <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 15, color: "rgba(26,16,8,0.6)" }}>Try different keywords or switch tabs.</p>
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

  // Ensure ?tab= is always set in URL
  useEffect(() => {
    const cur = params.get("tab");
    if (cur !== activeTab) {
      const next = new URLSearchParams(params);
      next.set("tab", activeTab);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Sync URL → tab (back/forward, dropdown clicks)
  useEffect(() => {
    const next = (params.get("tab") as TabKey | null) ?? "getting-started";
    const safe: TabKey = TABS.find((t) => t.key === next) ? next : "getting-started";
    if (safe !== activeTab) {
      setActiveTab(safe);
      setSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 200);
    return () => clearTimeout(t);
  }, [search]);

  // Reset search when switching tabs
  useEffect(() => {
    setSearch("");
    setDebounced("");
  }, [activeTab]);

  // Load templates from Lovable Cloud
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
          downloads: `${(Math.floor(Math.random() * 30) + 5) / 10}K`,
          href: downloadHref(row.id),
          icon: row.icon_url,
        }));
        setTemplates(rows);
      });
  }, []);

  const matchesSearch = (haystack: string) => !debounced || haystack.toLowerCase().includes(debounced);

  // Filtered + grouped data per tab
  const filteredVideos = useMemo(
    () => VIDEOS.filter((v) => matchesSearch(`${v.title} ${v.description} ${v.step}`)),
    [debounced],
  );
  const groupedVideos = useMemo(() => {
    const groups: { step: string; items: VideoItem[] }[] = STEP_ORDER.map((step) => ({
      step,
      items: filteredVideos.filter((v) => v.step === step),
    })).filter((g) => g.items.length > 0);
    return groups;
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
  const filteredArticles = useMemo(
    () => ARTICLES.filter((a) => matchesSearch(`${a.title} ${a.excerpt}`)),
    [debounced],
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
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .resource-anim { animation: fade-card 350ms ease-out both; }
        .fyn-tabs-row::-webkit-scrollbar { display: none; }
        .fyn-tabs-row { scrollbar-width: none; -ms-overflow-style: none; }
        .fyn-tab-badge-mobile { display: inline-flex; }
        @media (max-width: 768px) {
          .resource-video-row { flex-direction: column !important; }
          .resource-video-row > div:first-child { width: 100% !important; min-width: 0 !important; height: 200px !important; }
          .fyn-resources-hero { padding: 40px 20px 32px !important; }
          .fyn-resources-tabs-wrap { padding: 16px 16px !important; }
          .fyn-resources-content { padding: 32px 16px 56px !important; }
          .fyn-tab-btn { min-width: 0 !important; padding: 12px 16px !important; font-size: 14px !important; }
          .fyn-tab-badge-mobile { display: none !important; }
          .fyn-resources-grid-tpl { grid-template-columns: 1fr !important; gap: 16px !important; }
          .fyn-resources-grid-blog { grid-template-columns: 1fr !important; gap: 16px !important; }
          .fyn-resources-search { height: 48px !important; font-size: 15px !important; }
        }
      `}</style>

      {/* HERO */}
      <section
        className="fyn-resources-hero"
        style={{
          background: "linear-gradient(135deg, #1A1008 0%, rgba(26,16,8,0.95) 100%)",
          padding: "72px 32px 56px",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontFamily: "Oswald, sans-serif",
            fontWeight: 700,
            fontSize: "clamp(28px, 5.5vw, 52px)",
            color: "#FFFFFF",
            lineHeight: 1.15,
            letterSpacing: "-0.5px",
            marginBottom: 14,
          }}
        >
          FynHelp Resource Centre
        </h1>
        <p
          style={{
            fontFamily: "Raleway, sans-serif",
            fontSize: "clamp(14px, 1.7vw, 19px)",
            color: "rgba(244,237,218,0.9)",
            maxWidth: 660,
            margin: "0 auto",
            lineHeight: 1.55,
          }}
        >
          Everything you need to get maximum value from your AI CFO.
        </p>
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
        <div className="fyn-resources-tabs-wrap" style={{ maxWidth: 1300, margin: "0 auto", padding: "20px 24px", position: "relative" }}>
          <div
            className="fyn-tabs-row"
            style={{
              display: "flex",
              gap: 8,
              overflowX: "auto",
              overflowY: "hidden",
              paddingBottom: 4,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
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
                    minWidth: 160,
                    padding: "12px 20px",
                    borderRadius: 12,
                    fontFamily: "Raleway, sans-serif",
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    whiteSpace: "nowrap",
                    border: isActive ? "none" : "1px solid transparent",
                    background: isActive
                      ? `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`
                      : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(26,16,8,0.75)",
                    boxShadow: isActive ? "0 4px 16px rgba(196,30,30,0.28)" : "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(139,105,20,0.1)";
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
                  <FYNIcon name={t.icon} size={20} animated={false} />
                  <span className="fyn-tab-label-full" style={{ display: "inline" }}>
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.shortLabel}</span>
                  </span>
                  <span
                    className="fyn-tab-badge-mobile"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 6,
                      background: isActive ? "rgba(255,255,255,0.22)" : "rgba(139,105,20,0.15)",
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
          <div style={{ marginTop: 16, maxWidth: 520 }}>
            <div style={{ position: "relative" }}>
              <Search
                size={20}
                color={GOLD}
                style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={currentTabConfig.placeholder}
                aria-label={currentTabConfig.placeholder}
                className="fyn-resources-search"
                style={{
                  width: "100%",
                  height: 52,
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,16,8,0.15)",
                  borderRadius: 12,
                  padding: "0 16px 0 48px",
                  fontFamily: "Roboto, sans-serif",
                  fontSize: 15,
                  color: INK,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.border = `2px solid ${GOLD}`;
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(139,105,20,0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1px solid rgba(26,16,8,0.15)";
                  e.currentTarget.style.boxShadow = "none";
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
          background:
            "repeating-linear-gradient(45deg, transparent, transparent 60px, rgba(139,105,20,0.02) 60px, rgba(139,105,20,0.02) 61px), #F4EDDA",
          padding: "40px 24px 80px",
          minHeight: 400,
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* GETTING STARTED — vertical learning path */}
          {activeTab === "getting-started" && (
            <>
              {filteredVideos.length === 0 ? (
                <EmptyState label="videos" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  {groupedVideos.map((g) => (
                    <div key={g.step}>
                      <h2
                        style={{
                          fontFamily: "Oswald, sans-serif",
                          fontWeight: 700,
                          fontSize: 22,
                          letterSpacing: 1,
                          color: INK,
                          margin: "0 0 16px 0",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${RED}, ${GOLD})`,
                          }}
                        />
                        {g.step}
                      </h2>
                      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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

          {/* TEMPLATES — grid */}
          {activeTab === "templates" && (
            <>
              {filteredTemplates.length === 0 ? (
                <EmptyState label="templates" />
              ) : (
                <div
                  className="fyn-resources-grid-tpl"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: 20,
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

          {/* GLOSSARY — alphabetical list */}
          {activeTab === "glossary" && (
            <>
              {filteredGlossary.length === 0 ? (
                <EmptyState label="terms" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 900, margin: "0 auto" }}>
                  {filteredGlossary.map((g, i) => (
                    <div key={g.id} className="resource-anim" style={{ animationDelay: `${i * 25}ms` }}>
                      <GlossaryRow g={g} onOpen={() => setGlossaryModal(g)} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* BLOG — 2 column grid */}
          {activeTab === "blog" && (
            <>
              {filteredArticles.length === 0 ? (
                <EmptyState label="articles" />
              ) : (
                <div
                  className="fyn-resources-grid-blog"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                    gap: 24,
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

          {/* COMMUNITY — list (newest first; already ordered) */}
          {activeTab === "community" && (
            <>
              {filteredCommunity.length === 0 ? (
                <EmptyState label="discussions" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 900, margin: "0 auto" }}>
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
            className="bg-fyn-ink rounded-xl max-w-[800px] w-full mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-serif text-xl text-white">{videoModal.title}</h3>
              <button
                onClick={() => setVideoModal(null)}
                className="text-white/40 hover:text-white"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-white/70 text-sm mb-1">This tutorial is being recorded.</p>
                <p className="text-white/40 text-xs mb-4">Estimated availability: May 2026</p>
                <p className="text-fyn-gold text-sm">In the meantime, browse our written guides and templates above.</p>
              </div>
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
              borderRadius: 16,
              maxWidth: 560,
              width: "calc(100% - 32px)",
              padding: 32,
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setGlossaryModal(null)}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "rgba(26,16,8,0.5)",
              }}
            >
              <X size={20} />
            </button>
            <div style={{ display: "inline-flex", padding: 12, borderRadius: 12, background: "rgba(139,105,20,0.12)", marginBottom: 16 }}>
              <FYNIcon name="glossary" size={36} />
            </div>
            <h3 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 28, color: INK, margin: "0 0 12px 0" }}>
              {glossaryModal.term}
            </h3>
            <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 15, color: "rgba(26,16,8,0.8)", lineHeight: 1.65, margin: 0 }}>
              {glossaryModal.full}
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ResourcesPage;
