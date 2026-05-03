import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
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
type ContentType = "video" | "article" | "template" | "glossary" | "community";
type Category = "getting-started" | "templates" | "glossary" | "blog" | "community";

interface BaseCard {
  id: string;
  type: ContentType;
  category: Category;
  title: string;
}
interface VideoCard extends BaseCard {
  type: "video";
  category: "getting-started";
  step: string;
  duration: string;
}
interface ArticleCard extends BaseCard {
  type: "article";
  category: "blog";
  excerpt: string;
  views: string;
  date: string;
}
interface TemplateCard extends BaseCard {
  type: "template";
  category: "templates";
  format: string;
  downloads: string;
  href: string;
  icon?: string | null;
  description?: string;
}
interface GlossaryCard extends BaseCard {
  type: "glossary";
  category: "glossary";
  short: string;
}
interface CommunityCard extends BaseCard {
  type: "community";
  category: "community";
  author: string;
  initials: string;
  preview: string;
  replies: number;
  ago: string;
  color: string;
}
type AnyCard = VideoCard | ArticleCard | TemplateCard | GlossaryCard | CommunityCard;

interface TemplateRow {
  id: string;
  title: string;
  description: string;
  format: string;
  icon_url: string | null;
}

// ============================================================
// SAMPLE / SEED DATA
// ============================================================
const videoSeed: Omit<VideoCard, "id" | "type" | "category">[] = [
  { step: "DAY 1", title: "Connecting your bank account", duration: "5 minutes" },
  { step: "DAY 1", title: "Syncing Tally or accounting software", duration: "15 minutes" },
  { step: "DAY 1", title: "Setting up GSTIN & compliance calendar", duration: "10 minutes" },
  { step: "WEEK 1", title: "Understanding your first dashboard", duration: "20 minutes" },
  { step: "WEEK 1", title: "First conversation with AI CFO Nidhi", duration: "10 minutes" },
  { step: "WEEK 2", title: "Running your first hiring simulation", duration: "15 minutes" },
  { step: "WEEK 2", title: "ITC reconciliation walkthrough", duration: "8 minutes" },
  { step: "WEEK 3", title: "WhatsApp alerts setup", duration: "3 minutes" },
];

const blogSeed: Omit<ArticleCard, "id" | "type" | "category">[] = [
  { title: "5 signs you need an AI CFO before your next funding round", excerpt: "Financial intelligence is no longer a luxury. Here's how to know it's time to upgrade from spreadsheets.", views: "1.2K", date: "May 1" },
  { title: "Section 43B(h): The MSME payment law every founder must know", excerpt: "How a small change in the Income Tax Act gives MSMEs unprecedented leverage over delayed payments.", views: "2.4K", date: "Apr 28" },
  { title: "How we cut DSO from 67 days to 41 in 90 days", excerpt: "A founder's playbook for tightening receivables without alienating your best customers.", views: "890", date: "Apr 22" },
  { title: "GST 2.0: What the new rate rationalisation means for you", excerpt: "The biggest GST overhaul in 5 years is here. Here's a clear breakdown for SME owners.", views: "3.1K", date: "Apr 15" },
  { title: "The compliance calendar every Indian SME should run", excerpt: "20+ filings, 12 months, 1 dashboard. The complete deadline map for FY 2025-26.", views: "1.8K", date: "Apr 8" },
];

const communitySeed: Omit<CommunityCard, "id" | "type" | "category">[] = [
  { author: "Rajesh Kumar", initials: "R", color: GOLD, title: "How do I reconcile GSTR-2B mismatches across 40+ vendors?", preview: "I'm having trouble with vendor invoices that don't match my purchase register. Some vendors haven't filed yet…", replies: 12, ago: "2 hours ago" },
  { author: "Neha Sharma", initials: "N", color: RED, title: "Best practice for advance tax planning under new regime", preview: "We're a service business pivoting in Q2. Should I revise my advance tax estimate now or wait for September?", replies: 8, ago: "5 hours ago" },
  { author: "Anil Patel", initials: "A", color: "rgba(26,16,8,0.7)", title: "Anyone running Tally Prime 4.0 with FynHelp on Windows 11?", preview: "Connector keeps timing out at the second sync. Tried reinstalling, ran as admin, no luck.", replies: 5, ago: "1 day ago" },
  { author: "Priya Iyer", initials: "P", color: GOLD, title: "Section 43B(h): how do I generate the demand letter?", preview: "I have 6 invoices over 45 days with a large customer. Walkthrough would help.", replies: 17, ago: "1 day ago" },
  { author: "Mohammed Khan", initials: "M", color: RED, title: "Working capital loan from CGTMSE — anyone done it through FynHelp?", preview: "Looking at ₹50L. What's the realistic turnaround and which banks respond fastest?", replies: 9, ago: "2 days ago" },
];

const glossarySeed: Omit<GlossaryCard, "id" | "type" | "category">[] = [
  { title: "MRR", short: "Monthly Recurring Revenue — predictable revenue your business earns every month from subscriptions or contracts." },
  { title: "Burn Rate", short: "The speed at which your business spends its cash reserves, measured per month or per day." },
  { title: "Runway", short: "The number of days your business can operate at its current burn before running out of cash." },
  { title: "DSO", short: "Days Sales Outstanding — average days to collect payment after a sale. Indian SME average: 42 days." },
  { title: "ITC", short: "Input Tax Credit — GST paid on purchases that you can offset against GST owed on sales." },
  { title: "GSTR-2B", short: "Auto-generated statement on the 14th showing ITC available based on your suppliers' filings." },
  { title: "Section 43B(h)", short: "Tax Act amendment that disallows expense deductions if MSME suppliers aren't paid within 45 days." },
  { title: "CGTMSE", short: "Government scheme providing collateral-free loans up to ₹5 Cr to MSMEs, covering 75–85%." },
];

// ============================================================
// MASONRY CARD COMPONENTS
// ============================================================
const cardBase: React.CSSProperties = {
  background: "#FFFFFF",
  borderRadius: 20,
  border: "1px solid rgba(26,16,8,0.08)",
  boxShadow: "0 4px 16px rgba(26,16,8,0.06)",
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  display: "flex",
  flexDirection: "column",
};

const onCardEnter = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "translateY(-4px)";
  el.style.boxShadow = "0 12px 32px rgba(26,16,8,0.12)";
  el.style.border = "1px solid rgba(139,105,20,0.3)";
};
const onCardLeave = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget as HTMLElement;
  el.style.transform = "";
  el.style.boxShadow = "0 4px 16px rgba(26,16,8,0.06)";
  el.style.border = "1px solid rgba(26,16,8,0.08)";
};

const CategoryBadge = ({ children }: { children: React.ReactNode }) => (
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
      borderRadius: 6,
      display: "inline-block",
      marginBottom: 12,
    }}
  >
    {children}
  </span>
);

const VideoCardView = ({ c, onClick }: { c: VideoCard; onClick: () => void }) => (
  <article style={cardBase} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave} onClick={onClick}>
    <div
      style={{
        height: 200,
        background: "linear-gradient(135deg, rgba(139,105,20,0.2) 0%, rgba(196,30,30,0.2) 100%)",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(196,30,30,0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 24px rgba(196,30,30,0.4)",
        }}
      >
        <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
          <path d="M3 1.5l9 5.5-9 5.5z" fill="white" />
        </svg>
      </div>
    </div>
    <div style={{ padding: 20 }}>
      <CategoryBadge>{c.step}</CategoryBadge>
      <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 18, color: INK, lineHeight: 1.4, marginBottom: 12 }}>
        {c.title}
      </h3>
      <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.6)", display: "flex", alignItems: "center", gap: 8 }}>
        <FYNIcon name="video" size={16} animated={false} /> {c.duration}
      </div>
    </div>
  </article>
);

const ArticleCardView = ({ c }: { c: ArticleCard }) => (
  <article style={cardBase} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
    <div
      style={{
        height: 180,
        background: "linear-gradient(135deg, rgba(196,30,30,0.18) 0%, rgba(139,105,20,0.25) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FYNIcon name="blog" size={64} />
    </div>
    <div style={{ padding: 20 }}>
      <CategoryBadge>Blog</CategoryBadge>
      <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 18, color: INK, lineHeight: 1.4, marginBottom: 10 }}>
        {c.title}
      </h3>
      <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.7)", lineHeight: 1.6, marginBottom: 12 }}>
        {c.excerpt}
      </p>
      <div style={{ display: "flex", gap: 16, fontFamily: "Roboto, sans-serif", fontSize: 13, color: "rgba(26,16,8,0.5)" }}>
        <span>👁️ {c.views}</span>
        <span>📅 {c.date}</span>
      </div>
    </div>
  </article>
);

const TemplateCardView = ({ c }: { c: TemplateCard }) => (
  <article style={cardBase} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
    <div
      style={{
        height: 140,
        background: "linear-gradient(135deg, rgba(139,105,20,0.1) 0%, rgba(196,30,30,0.05) 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {c.icon ? (
        <img src={c.icon} alt="" style={{ width: 64, height: 64 }} />
      ) : (
        <FYNIcon name="template" size={64} />
      )}
    </div>
    <div style={{ padding: 20 }}>
      <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 18, color: INK, textAlign: "center", marginBottom: 10 }}>
        {c.title}
      </h3>
      <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.6)", textAlign: "center", marginBottom: 16 }}>
        {c.format} · ⬇️ {c.downloads}
      </p>
      <a
        href={c.href}
        download
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "block",
          width: "100%",
          padding: "12px 24px",
          background: `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`,
          color: "#FFFFFF",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 600,
          fontSize: 15,
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

const GlossaryCardView = ({ c }: { c: GlossaryCard }) => (
  <article style={{ ...cardBase, padding: 24 }} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
    <div style={{ marginBottom: 12 }}><FYNIcon name="glossary" size={36} /></div>
    <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 20, color: INK, marginBottom: 8 }}>
      {c.title}
    </h3>
    <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.7)", lineHeight: 1.6, marginBottom: 12 }}>
      {c.short}
    </p>
    <span
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: 14,
        color: GOLD,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
      }}
    >
      Read more <span>→</span>
    </span>
  </article>
);

const CommunityCardView = ({ c }: { c: CommunityCard }) => (
  <article style={{ ...cardBase, padding: 20 }} onMouseEnter={onCardEnter} onMouseLeave={onCardLeave}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: c.color,
          color: "#FFFFFF",
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 700,
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {c.initials}
      </div>
      <span style={{ fontFamily: "Roboto, sans-serif", fontWeight: 500, fontSize: 14, color: "rgba(26,16,8,0.8)" }}>
        {c.author}
      </span>
    </div>
    <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 17, color: INK, lineHeight: 1.4, marginBottom: 10 }}>
      {c.title}
    </h3>
    <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "rgba(26,16,8,0.65)", lineHeight: 1.5, marginBottom: 12 }}>
      {c.preview}
    </p>
    <div style={{ display: "flex", gap: 12, fontFamily: "Roboto, sans-serif", fontSize: 13, color: "rgba(26,16,8,0.5)" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><FYNIcon name="discussion" size={14} animated={false} /> {c.replies} replies</span>
      <span>🕒 {c.ago}</span>
    </div>
  </article>
);

const SkeletonCard = () => (
  <div
    style={{
      ...cardBase,
      cursor: "default",
      height: 280,
      background:
        "linear-gradient(90deg, rgba(26,16,8,0.04) 0%, rgba(26,16,8,0.08) 50%, rgba(26,16,8,0.04) 100%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
    }}
  />
);

// ============================================================
// TABS / FILTERS CONFIG
// ============================================================
const TABS: { key: "all" | Category; label: string }[] = [
  { key: "all", label: "All" },
  { key: "getting-started", label: "📚 Getting Started" },
  { key: "templates", label: "📄 Templates" },
  { key: "glossary", label: "📖 Glossary" },
  { key: "blog", label: "✍️ Blog" },
  { key: "community", label: "👥 Community" },
];

const FILTERS: { key: ContentType; label: string }[] = [
  { key: "video", label: "📹 Video" },
  { key: "article", label: "📄 Article" },
  { key: "template", label: "📊 Template" },
  { key: "community", label: "💬 Discussion" },
];

// ============================================================
// MAIN PAGE
// ============================================================
const ResourcesPage = () => {
  const [params, setParams] = useSearchParams();
  const tabParam = (params.get("tab") as "all" | Category | null) ?? "all";
  const validTab = TABS.find((t) => t.key === tabParam) ? tabParam : "all";

  const [activeTab, setActiveTab] = useState<"all" | Category>(validTab);
  const [activeFilters, setActiveFilters] = useState<Set<ContentType>>(new Set());
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [visible, setVisible] = useState(20);
  const [loading, setLoading] = useState(false);
  const [videoModal, setVideoModal] = useState<string | null>(null);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);

  // Sync tab → URL
  useEffect(() => {
    const cur = params.get("tab") ?? "all";
    if (cur !== activeTab) {
      const next = new URLSearchParams(params);
      if (activeTab === "all") next.delete("tab");
      else next.set("tab", activeTab);
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Sync URL → tab (back/forward, dropdown clicks)
  useEffect(() => {
    const next = (params.get("tab") as "all" | Category | null) ?? "all";
    const safe = TABS.find((t) => t.key === next) ? next : "all";
    if (safe !== activeTab) {
      setActiveTab(safe);
      setVisible(20);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim().toLowerCase()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Load templates
  useEffect(() => {
    supabase
      .from("resources")
      .select("id, title, description, format, icon_url")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => setTemplates(data ?? []));
  }, []);

  // Build all cards (mixed)
  const allCards: AnyCard[] = useMemo(() => {
    const v: AnyCard[] = videoSeed.map((x, i) => ({
      ...x,
      id: `v-${i}`,
      type: "video",
      category: "getting-started",
    }));
    const a: AnyCard[] = blogSeed.map((x, i) => ({
      ...x,
      id: `a-${i}`,
      type: "article",
      category: "blog",
    }));
    const t: AnyCard[] = templates.map((row) => ({
      id: `t-${row.id}`,
      type: "template",
      category: "templates",
      title: row.title,
      format: row.format,
      downloads: `${(Math.floor(Math.random() * 30) + 5) / 10}K`,
      href: downloadHref(row.id),
      icon: row.icon_url,
      description: row.description,
    }));
    const g: AnyCard[] = glossarySeed.map((x, i) => ({
      ...x,
      id: `g-${i}`,
      type: "glossary",
      category: "glossary",
    }));
    const c: AnyCard[] = communitySeed.map((x, i) => ({
      ...x,
      id: `c-${i}`,
      type: "community",
      category: "community",
    }));

    // Interleave types for visual variety
    const max = Math.max(v.length, a.length, t.length, g.length, c.length);
    const mixed: AnyCard[] = [];
    for (let i = 0; i < max; i++) {
      if (v[i]) mixed.push(v[i]);
      if (g[i]) mixed.push(g[i]);
      if (a[i]) mixed.push(a[i]);
      if (t[i]) mixed.push(t[i]);
      if (c[i]) mixed.push(c[i]);
    }
    return mixed;
  }, [templates]);

  // Filter cards
  const filtered = useMemo(() => {
    return allCards.filter((card) => {
      if (activeTab !== "all" && card.category !== activeTab) return false;
      if (activeFilters.size > 0 && !activeFilters.has(card.type)) return false;
      if (debounced) {
        const hay = (card.title + " " + (("excerpt" in card && card.excerpt) || ("preview" in card && card.preview) || ("short" in card && card.short) || "")).toLowerCase();
        if (!hay.includes(debounced)) return false;
      }
      return true;
    });
  }, [allCards, activeTab, activeFilters, debounced]);

  const visibleCards = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setLoading(true);
          setTimeout(() => {
            setVisible((v) => v + 12);
            setLoading(false);
          }, 400);
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [hasMore, loading, visible, filtered.length]);

  // Reset visible on filter change
  useEffect(() => {
    setVisible(20);
  }, [activeTab, activeFilters, debounced]);

  const toggleFilter = useCallback((k: ContentType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }, []);

  const renderCard = (c: AnyCard) => {
    switch (c.type) {
      case "video":
        return <VideoCardView key={c.id} c={c} onClick={() => setVideoModal(c.title)} />;
      case "article":
        return <ArticleCardView key={c.id} c={c} />;
      case "template":
        return <TemplateCardView key={c.id} c={c} />;
      case "glossary":
        return <GlossaryCardView key={c.id} c={c} />;
      case "community":
        return <CommunityCardView key={c.id} c={c} />;
    }
  };

  return (
    <Layout>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes float-up {
          0% { transform: translate(0,0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate(40px,-120px); opacity: 0; }
        }
        @keyframes fade-card {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .resource-card-anim { animation: fade-card 350ms ease-out both; }
      `}</style>

      {/* HERO */}
      <section
        style={{
          background: "linear-gradient(135deg, #1A1008 0%, rgba(26,16,8,0.95) 100%)",
          position: "relative",
          overflow: "hidden",
          padding: "80px 40px 60px",
        }}
      >
        {/* Sparkles */}
        {Array.from({ length: 10 }).map((_, i) => (
          <span
            key={i}
            aria-hidden
            style={{
              position: "absolute",
              left: `${(i * 11 + 5) % 95}%`,
              bottom: `${(i * 7) % 40}px`,
              width: 4 + (i % 3),
              height: 4 + (i % 3),
              borderRadius: "50%",
              background: "rgba(139,105,20,0.45)",
              boxShadow: "0 0 8px rgba(139,105,20,0.6)",
              animation: `float-up 12s ease-in-out ${i * 0.8}s infinite`,
            }}
          />
        ))}
        <div style={{ position: "relative", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
          <h1
            style={{
              fontFamily: "Oswald, sans-serif",
              fontWeight: 700,
              fontSize: "clamp(36px, 6vw, 56px)",
              color: "#FFFFFF",
              lineHeight: 1.2,
              letterSpacing: "-0.5px",
              marginBottom: 16,
              textShadow: "0 4px 16px rgba(0,0,0,0.5)",
            }}
          >
            FynHelp Resource Centre
          </h1>
          <p
            style={{
              fontFamily: "Raleway, sans-serif",
              fontWeight: 400,
              fontSize: "clamp(16px, 2vw, 20px)",
              color: "rgba(244,237,218,0.95)",
              maxWidth: 700,
              margin: "0 auto",
              lineHeight: 1.6,
              textShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            Everything you need to get maximum value from your AI CFO.
          </p>
        </div>
      </section>

      {/* TABS + FILTERS */}
      <div
        style={{
          background: BEIGE,
          borderBottom: "1px solid rgba(26,16,8,0.1)",
          position: "sticky",
          top: 72,
          zIndex: 30,
          padding: "32px 40px",
        }}
      >
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Row 1: Tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "center",
              flexWrap: "wrap",
              overflowX: "auto",
            }}
          >
            {TABS.map((t) => {
              const isActive = activeTab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: 12,
                    fontFamily: "Raleway, sans-serif",
                    fontWeight: 500,
                    fontSize: 15,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                    whiteSpace: "nowrap",
                    border: isActive ? "none" : "1px solid transparent",
                    background: isActive
                      ? `linear-gradient(135deg, ${RED} 0%, ${GOLD} 100%)`
                      : "transparent",
                    color: isActive ? "#FFFFFF" : "rgba(26,16,8,0.7)",
                    boxShadow: isActive ? "0 4px 16px rgba(196,30,30,0.3)" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(139,105,20,0.1)";
                      (e.currentTarget as HTMLElement).style.color = INK;
                      (e.currentTarget as HTMLElement).style.border = "1px solid rgba(139,105,20,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(26,16,8,0.7)";
                      (e.currentTarget as HTMLElement).style.border = "1px solid transparent";
                    }
                  }}
                  aria-pressed={isActive}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Row 2: Search + Filters */}
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flex: "1 1 280px", maxWidth: 400 }}>
              <Search
                size={20}
                color={GOLD}
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources..."
                aria-label="Search resources"
                style={{
                  width: "100%",
                  height: 48,
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

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {FILTERS.map((f) => {
                const active = activeFilters.has(f.key);
                return (
                  <button
                    key={f.key}
                    onClick={() => toggleFilter(f.key)}
                    aria-pressed={active}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 20,
                      fontFamily: "Roboto, sans-serif",
                      fontWeight: 500,
                      fontSize: 14,
                      background: active ? GOLD : "#FFFFFF",
                      color: active ? "#FFFFFF" : "rgba(26,16,8,0.7)",
                      border: active ? `1px solid ${GOLD}` : "1px solid rgba(26,16,8,0.2)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.border = `1px solid ${GOLD}`;
                        (e.currentTarget as HTMLElement).style.color = GOLD;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLElement).style.border = "1px solid rgba(26,16,8,0.2)";
                        (e.currentTarget as HTMLElement).style.color = "rgba(26,16,8,0.7)";
                      }
                    }}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* MASONRY GRID */}
      <section style={{ background: BEIGE, padding: "60px 40px 100px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px" }}>
              <div style={{ fontSize: 48, color: "rgba(26,16,8,0.3)", marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 22, color: INK, marginBottom: 8 }}>
                No resources found
              </h3>
              <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 15, color: "rgba(26,16,8,0.6)" }}>
                Try different keywords or browse by category.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: 24,
                alignItems: "start",
              }}
            >
              {visibleCards.map((c, i) => (
                <div key={c.id} className="resource-card-anim" style={{ animationDelay: `${(i % 12) * 30}ms` }}>
                  {renderCard(c)}
                </div>
              ))}
              {loading &&
                Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
            </div>
          )}

          {hasMore && <div ref={sentinelRef} style={{ height: 40 }} />}

          {!hasMore && filtered.length > 0 && (
            <p
              style={{
                textAlign: "center",
                marginTop: 60,
                fontFamily: "Raleway, sans-serif",
                fontWeight: 500,
                fontSize: 16,
                color: "rgba(26,16,8,0.5)",
              }}
            >
              You've reached the end.
            </p>
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
            style={{ animation: "scale-in 250ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-serif text-xl text-white">{videoModal}</h3>
              <button
                onClick={() => setVideoModal(null)}
                className="text-white/40 hover:text-white text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <div className="text-center p-8">
                <p className="text-white/70 text-sm mb-1">This tutorial is being recorded.</p>
                <p className="text-white/40 text-xs mb-4">Estimated availability: May 2026</p>
                <p className="text-fyn-gold text-sm">
                  In the meantime, browse our written guides and templates above.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ResourcesPage;
