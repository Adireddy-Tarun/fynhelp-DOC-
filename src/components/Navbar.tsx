import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  Store,
  Briefcase,
  PlayCircle,
  Droplet,
  TrendingUp,
  Receipt,
  Sparkles,
  Rocket,
  ShoppingBag,
  Factory,
  ShieldCheck,
  LayoutDashboard,
  FileStack,
  MessageSquare,
  Tag,
} from "lucide-react";
import FynLogo from "@/components/FynLogo";

/* ────────────────────────────────────────────────────────────────
   Data
──────────────────────────────────────────────────────────────── */

import type { LucideIcon } from "lucide-react";
type IconType = LucideIcon;

type ModuleKey = "liquidity" | "revenue" | "gst" | "fynny";

type ModuleStat = { label: string; value: string; sub?: string; tone?: "healthy" | "warning" | "critical" | "neutral" };
type ModulePreview = { title: string; sub: string; stats: ModuleStat[]; footer?: string };

const PRODUCT_MODULES: { key: ModuleKey; icon: IconType; label: string; href: string; desc: string; preview: ModulePreview }[] = [
  {
    key: "liquidity",
    icon: Droplet,
    label: "Liquidity intelligence",
    href: "/demo/liquidity",
    desc: "Cash, runway, forecasts",
    preview: {
      title: "Liquidity",
      sub: "Live cash position",
      stats: [
        { label: "Cash Balance", value: "₹42.1L", sub: "Operating ₹38.7L", tone: "healthy" },
        { label: "Runway",       value: "8.2 mo", sub: "Zero by Mar 2027", tone: "warning" },
        { label: "Net Burn",     value: "₹5.1L/mo", sub: "Gross ₹9.8L", tone: "warning" },
        { label: "Working Cap.", value: "₹18.4L", sub: "Quick ratio 2.14", tone: "healthy" },
      ],
      footer: "13-week forecast · CCC · AR aging",
    },
  },
  {
    key: "revenue",
    icon: TrendingUp,
    label: "Revenue intelligence",
    href: "/demo/revenue",
    desc: "MRR, churn, growth",
    preview: {
      title: "Revenue",
      sub: "Last 30 days",
      stats: [
        { label: "MRR",       value: "₹18.2L", sub: "+8.4% MoM", tone: "healthy" },
        { label: "NRR",       value: "112%",  sub: "+3.2% QoQ", tone: "healthy" },
        { label: "Churn",     value: "3.2%",  sub: "Below benchmark", tone: "healthy" },
        { label: "LTV:CAC",   value: "3.8x",  sub: "Healthy", tone: "healthy" },
      ],
      footer: "ARPA · Rule of 40 · Cohort retention",
    },
  },
  {
    key: "gst",
    icon: Receipt,
    label: "GST intelligence",
    href: "/demo/gst",
    desc: "Filings, ITC, 2B recon",
    preview: {
      title: "GST",
      sub: "Current period",
      stats: [
        { label: "Net Payable",  value: "₹2.4L", sub: "Due 20 Nov",     tone: "warning" },
        { label: "ITC Gap",      value: "4.1%",  sub: "Reconcile 2B",   tone: "warning" },
        { label: "Output GST",   value: "₹6.8L", sub: "Collected",      tone: "neutral" },
        { label: "Input GST",    value: "₹4.4L", sub: "Est · verify",   tone: "neutral" },
      ],
      footer: "GSTR-1 · GSTR-3B · 2B match rate",
    },
  },
  {
    key: "fynny",
    icon: Sparkles,
    label: "Fynny, the AI CFO",
    href: "/demo/fynny",
    desc: "Ask anything about your books",
    preview: {
      title: "Fynny",
      sub: "AI CFO briefing",
      stats: [
        { label: "Today's alerts",   value: "3",   sub: "1 critical",       tone: "critical" },
        { label: "Insights",         value: "12",  sub: "Reviewed 4",       tone: "neutral" },
        { label: "Recommendations",  value: "5",   sub: "Reviewed w/ CA",   tone: "warning" },
        { label: "Model",            value: "Gemini 2.5", sub: "Grounded on your data", tone: "healthy" },
      ],
      footer: "Ask anything · Auto-briefings · Scenario planning",
    },
  },
];

const PRODUCT_USECASES: { icon: IconType; label: string; href: string }[] = [
  { icon: Rocket,      label: "Startups & founders",       href: "/use-cases" },
  { icon: ShoppingBag, label: "D2C brands",                href: "/use-cases" },
  { icon: Factory,     label: "Trading & manufacturing",   href: "/use-cases" },
  { icon: ShieldCheck, label: "Security & compliance",     href: "/security" },
];

const CA_PRACTICE: { icon: IconType; label: string; href: string; desc: string }[] = [
  { icon: LayoutDashboard, label: "Portfolio dashboard",             href: "/ca-firms", desc: "All clients, one view" },
  { icon: FileStack,       label: "Bulk filing & ITC reconciliation", href: "/ca-firms", desc: "GSTR filing in batches" },
  { icon: MessageSquare,   label: "Client messaging",                 href: "/ca-firms", desc: "In-context, per client" },
  { icon: Tag,             label: "Partner pricing",                  href: "/ca-firms", desc: "Volume discounts for firms" },
];

const CA_PREVIEW_STATS: ModuleStat[] = [
  { label: "Active Clients",       value: "48",     sub: "↑ 3 new this month", tone: "neutral" },
  { label: "Filings Due This Week",value: "12",     sub: "GSTR-3B 8 · GSTR-1 4", tone: "warning" },
  { label: "Critical Alerts",      value: "5",      sub: "Across 4 clients", tone: "critical" },
  { label: "ITC at Risk",          value: "₹8.4L",  sub: "Across 6 clients", tone: "warning" },
];

const TOP_LINKS: { label: string; href: string }[] = [
  { label: "Pricing",   href: "/pricing" },
  { label: "Resources", href: "/resources" },
  { label: "About",     href: "/about" },
];

/* ────────────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────────────── */

type MenuKey = "products" | "ca" | "signin" | null;

const NAV_HEIGHT = 76;

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [mProducts, setMProducts] = useState(false);
  const [mCA, setMCA] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 220);
  };
  const openNow = (key: MenuKey) => {
    clearTimeout(closeTimer.current);
    setOpenMenu(key);
  };

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const isActive = (href: string) => location.pathname === href;

  // Top-level trigger button
  const Trigger = ({
    label,
    menuKey,
    active,
  }: {
    label: string;
    menuKey: Exclude<MenuKey, null>;
    active?: boolean;
  }) => {
    const isOpen = openMenu === menuKey;
    return (
      <button
        onMouseEnter={() => openNow(menuKey)}
        onMouseLeave={scheduleClose}
        onClick={() => setOpenMenu(isOpen ? null : menuKey)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="relative flex items-center gap-1.5 py-6 text-[15.5px] font-medium text-white/75 hover:text-white transition-colors"
      >
        <span className={active || isOpen ? "text-white" : ""}>{label}</span>
        <ChevronDown
          size={13}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
        <span
          className={`absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-all duration-200 ${
            active || isOpen ? "bg-fyn-red opacity-100" : "opacity-0"
          }`}
        />
      </button>
    );
  };

  const PlainLink = ({ href, label }: { href: string; label: string }) => (
    <Link
      to={href}
      className="relative py-6 text-[15.5px] font-medium text-white/75 hover:text-white transition-colors"
    >
      <span className={isActive(href) ? "text-white" : ""}>{label}</span>
      <span
        className={`absolute left-0 right-0 -bottom-[1px] h-[2px] rounded-full transition-all duration-200 ${
          isActive(href) ? "bg-fyn-red opacity-100" : "opacity-0"
        }`}
      />
    </Link>
  );

  /* ── Mega menu shells ─────────────────────────────────────── */

  const ProductsMenu = (
    <div
      onMouseEnter={() => openNow("products")}
      onMouseLeave={scheduleClose}
      className="absolute inset-x-0 top-full"
      style={{
        background: "hsl(var(--fyn-beige))",
        borderTop: "1px solid rgba(26,16,8,0.08)",
        boxShadow: "0 24px 48px -12px rgba(26,16,8,0.18)",
        animation: "fade-in 180ms ease-out",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-14 py-10 grid grid-cols-[1fr_1fr_360px] gap-14">
        {/* Column 1 */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fyn-ink/50 mb-4">
            By module
          </div>
          <div className="flex flex-col gap-1.5">
            {PRODUCT_MODULES.map((m) => (
              <Link
                key={m.label}
                to={m.href}
                className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-fyn-ink/5 transition-colors"
              >
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-fyn-red/10 text-fyn-red">
                  <m.icon size={16} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold text-fyn-ink">{m.label}</span>
                  <span className="text-[13.5px] text-fyn-ink/60">{m.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 2 */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fyn-ink/50 mb-4">
            By use case
          </div>
          <div className="flex flex-col gap-1.5">
            {PRODUCT_USECASES.map((u) => (
              <Link
                key={u.label}
                to={u.href}
                className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-fyn-ink/5 transition-colors"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-fyn-gold/15 text-fyn-gold">
                  <u.icon size={16} />
                </span>
                <span className="text-[15px] font-medium text-fyn-ink">{u.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3 — conversion card */}
        <Link
          to="/demo/login"
          className="group flex flex-col justify-between rounded-xl p-6 transition-all"
          style={{
            background: "linear-gradient(145deg, #1A1008 0%, #2A180D 100%)",
            border: "1px solid rgba(196,30,30,0.35)",
          }}
        >
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-fyn-red/15 text-fyn-red mb-4">
              <PlayCircle size={22} />
            </span>
            <div className="text-[20px] font-bold text-white leading-tight mb-2">
              See it live
            </div>
            <p className="text-[14px] text-white/65 leading-relaxed">
              No signup needed — explore real data in a demo account.
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-fyn-red group-hover:gap-2.5 transition-all">
            Demo login <span aria-hidden>→</span>
          </div>
        </Link>
      </div>
    </div>
  );

  const CAMenu = (
    <div
      onMouseEnter={() => openNow("ca")}
      onMouseLeave={scheduleClose}
      className="absolute inset-x-0 top-full"
      style={{
        background: "hsl(var(--fyn-beige))",
        borderTop: "1px solid rgba(26,16,8,0.08)",
        boxShadow: "0 24px 48px -12px rgba(26,16,8,0.18)",
        animation: "fade-in 180ms ease-out",
      }}
    >
      <div className="max-w-[1400px] mx-auto px-14 py-10 grid grid-cols-[1fr_400px] gap-14">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-fyn-ink/50 mb-4">
            For your practice
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {CA_PRACTICE.map((c) => (
              <Link
                key={c.label}
                to={c.href}
                className="flex items-start gap-3 rounded-lg px-3 py-3 hover:bg-fyn-ink/5 transition-colors"
              >
                <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-md bg-fyn-red/10 text-fyn-red">
                  <c.icon size={16} />
                </span>
                <span className="flex flex-col">
                  <span className="text-[15px] font-semibold text-fyn-ink">{c.label}</span>
                  <span className="text-[13.5px] text-fyn-ink/60">{c.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/ca/register"
          className="group flex flex-col justify-between rounded-xl p-6"
          style={{
            background: "linear-gradient(145deg, #1A1008 0%, #2A180D 100%)",
            border: "1px solid rgba(196,30,30,0.35)",
          }}
        >
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-fyn-red/15 text-fyn-red mb-4">
              <Briefcase size={22} />
            </span>
            <div className="text-[20px] font-bold text-white leading-tight mb-2">
              Bring your clients
            </div>
            <p className="text-[14px] text-white/65 leading-relaxed">
              One firm, dozens of clients, one relationship.
            </p>
          </div>
          <div className="mt-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-fyn-red group-hover:gap-2.5 transition-all">
            Register as CA <span aria-hidden>→</span>
          </div>
        </Link>
      </div>
    </div>
  );

  const SignInMenu = (
    <div
      onMouseEnter={() => openNow("signin")}
      onMouseLeave={scheduleClose}
      className="absolute right-0 top-full"
      style={{
        width: 300,
        marginTop: 10,
        background: "#FFFFFF",
        border: "1px solid rgba(26,16,8,0.08)",
        borderRadius: 14,
        boxShadow: "0 20px 48px -12px rgba(26,16,8,0.28)",
        padding: 8,
        animation: "fade-in 180ms ease-out",
        zIndex: 60,
      }}
    >
      <Link
        to="/login"
        className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-fyn-ink/5 transition-colors"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-fyn-red/10 text-fyn-red">
          <Store size={16} />
        </span>
        <span className="flex flex-col">
          <span className="text-[15px] font-semibold text-fyn-ink">Client login</span>
          <span className="text-[12.5px] text-fyn-ink/60">Business owners & founders</span>
        </span>
      </Link>
      <div className="my-1 h-px bg-fyn-ink/8" />
      <Link
        to="/ca/login"
        className="flex items-center gap-3 rounded-lg px-3 py-3 hover:bg-fyn-ink/5 transition-colors"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-fyn-gold/15 text-fyn-gold">
          <Briefcase size={16} />
        </span>
        <span className="flex flex-col">
          <span className="text-[15px] font-semibold text-fyn-ink">CA login</span>
          <span className="text-[12.5px] text-fyn-ink/60">Chartered accountants & firms</span>
        </span>
      </Link>
    </div>
  );

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <>
      <nav
        className="fixed top-0 inset-x-0 z-50 bg-fyn-ink border-b border-white/10"
        style={{ minHeight: NAV_HEIGHT }}
      >
        <div
          ref={containerRef}
          className="relative w-full flex items-center justify-between px-6 md:px-10 lg:px-14"
          style={{ minHeight: NAV_HEIGHT }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0 mr-6 lg:mr-10 group">
            <FynLogo variant="light" size="md" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10 flex-1">
            <Trigger label="Products"    menuKey="products" />
            <Trigger label="CA partners" menuKey="ca" />
            {TOP_LINKS.map((l) => (
              <PlainLink key={l.href} href={l.href} label={l.label} />
            ))}
          </div>

          {/* Right cluster */}
          <div className="hidden lg:flex items-center gap-4 shrink-0">
            <div className="relative">
              <button
                onMouseEnter={() => openNow("signin")}
                onMouseLeave={scheduleClose}
                onClick={() => setOpenMenu(openMenu === "signin" ? null : "signin")}
                aria-haspopup="true"
                aria-expanded={openMenu === "signin"}
                className="flex items-center gap-1.5 text-[15px] font-medium text-white/85 hover:text-white transition-colors py-2"
              >
                Sign in
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${openMenu === "signin" ? "rotate-180" : ""}`}
                />
              </button>
              {openMenu === "signin" && SignInMenu}
            </div>
            <Link
              to="/waitlist"
              className="bg-fyn-red hover:bg-fyn-red-dark text-white text-[15px] font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              Join waitlist
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Mega menus */}
          {openMenu === "products" && ProductsMenu}
          {openMenu === "ca" && CAMenu}
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: NAV_HEIGHT, background: "#1A1008" }} />

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
        <div
          className={`absolute right-0 top-0 bottom-0 w-[320px] bg-fyn-ink overflow-y-auto transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col gap-1 pt-24 px-6 pb-10">
            {/* Products accordion */}
            <button
              onClick={() => setMProducts((v) => !v)}
              className="flex items-center justify-between py-3 border-b border-white/10 text-white text-base font-medium"
              aria-expanded={mProducts}
            >
              Products
              <ChevronDown
                size={18}
                className={`transition-transform ${mProducts ? "rotate-180" : ""}`}
              />
            </button>
            {mProducts && (
              <div className="pl-3 pb-2 border-b border-white/5 flex flex-col">
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40 mt-3 mb-1">
                  By module
                </div>
                {PRODUCT_MODULES.map((m) => (
                  <Link
                    key={m.label}
                    to={m.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 text-white/80 text-[14px]"
                  >
                    <m.icon size={16} className="text-fyn-red" />
                    {m.label}
                  </Link>
                ))}
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-white/40 mt-3 mb-1">
                  By use case
                </div>
                {PRODUCT_USECASES.map((u) => (
                  <Link
                    key={u.label}
                    to={u.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 text-white/80 text-[14px]"
                  >
                    <u.icon size={16} className="text-fyn-gold" />
                    {u.label}
                  </Link>
                ))}
                <Link
                  to="/demo/login"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 mb-1 flex items-center gap-2 text-fyn-red text-[13.5px] font-semibold"
                >
                  <PlayCircle size={16} /> Demo login →
                </Link>
              </div>
            )}

            {/* CA partners accordion */}
            <button
              onClick={() => setMCA((v) => !v)}
              className="flex items-center justify-between py-3 border-b border-white/10 text-white text-base font-medium"
              aria-expanded={mCA}
            >
              CA partners
              <ChevronDown
                size={18}
                className={`transition-transform ${mCA ? "rotate-180" : ""}`}
              />
            </button>
            {mCA && (
              <div className="pl-3 pb-2 border-b border-white/5 flex flex-col">
                {CA_PRACTICE.map((c) => (
                  <Link
                    key={c.label}
                    to={c.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2.5 py-2.5 text-white/80 text-[14px]"
                  >
                    <c.icon size={16} className="text-fyn-red" />
                    {c.label}
                  </Link>
                ))}
                <Link
                  to="/ca/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-3 mb-1 flex items-center gap-2 text-fyn-red text-[13.5px] font-semibold"
                >
                  <Briefcase size={16} /> Register as CA →
                </Link>
              </div>
            )}

            {TOP_LINKS.map((l) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className="py-3 border-b border-white/10 text-white text-base font-medium"
              >
                {l.label}
              </Link>
            ))}

            <div className="mt-6 space-y-3">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/20 text-white text-[14px] font-semibold"
              >
                <Store size={16} /> Client login
              </Link>
              <Link
                to="/ca/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 py-3 rounded-lg border border-white/20 text-white text-[14px] font-semibold"
              >
                <Briefcase size={16} /> CA login
              </Link>
              <Link
                to="/waitlist"
                onClick={() => setMobileOpen(false)}
                className="block bg-fyn-red text-white text-center py-3 rounded-lg font-semibold"
              >
                Join waitlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
