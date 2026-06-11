/**
 * Shared intelligence-tab primitives. All beige theme, white cards.
 */
import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/indian-format";
import { useMode } from "./DataSource";

export const ACCENT = {
  red: "#A93838",
  redLight: "#C94848",
  gold: "#8B6914",
  goldLight: "#D4AF37",
  green: "#10B981",
  amber: "#F59E0B",
  gray: "#6B6B6B",
  ink: "#1A1008",
} as const;

/* ── Page shell ─────────────────────────────────────────── */
export function IntelPage({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("max-w-[1440px] mx-auto p-6 space-y-6", className)}>{children}</div>;
}

export function IntelHeader({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <header className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="font-serif text-3xl text-fyn-ink font-bold tracking-tight">{title}</h1>
        {sub && <p className="text-sm text-[#6B6B6B] mt-1 max-w-2xl">{sub}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ── Card ───────────────────────────────────────────────── */
export function IntelCard({
  children,
  className,
  title,
  sub,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  sub?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className={cn("bg-white rounded-lg p-5", className)}
      style={{ border: "1px solid rgba(26,16,8,0.08)", boxShadow: "0 2px 8px rgba(26,16,8,0.06)" }}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-4 gap-3">
          <div>
            {title && <h3 className="font-serif text-base text-fyn-ink font-semibold">{title}</h3>}
            {sub && <p className="text-xs text-[#6B6B6B] mt-0.5">{sub}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── KPI ────────────────────────────────────────────────── */
export function KPI({
  label,
  value,
  delta,
  deltaTone = "neutral",
  sub,
  href,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  sub?: string;
  href?: string;
}) {
  const deltaColor = deltaTone === "up" ? ACCENT.green : deltaTone === "down" ? ACCENT.red : ACCENT.gray;
  const Wrap: any = href ? Link : "div";
  return (
    <Wrap
      to={href}
      className={cn(
        "block bg-white rounded-lg p-4 group transition-all",
        href && "hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
      )}
      style={{ border: "1px solid rgba(26,16,8,0.08)", boxShadow: "0 2px 8px rgba(26,16,8,0.06)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-[0.12em] text-[#6B6B6B] font-medium">{label}</p>
        {href && <ArrowUpRight className="w-3.5 h-3.5 text-[#6B6B6B] opacity-0 group-hover:opacity-100 transition-opacity" />}
      </div>
      <p className="font-mono text-2xl text-fyn-ink font-semibold tabular-nums">{value}</p>
      <div className="flex items-center gap-2 mt-1.5">
        {delta && <span className="text-xs font-medium" style={{ color: deltaColor }}>{delta}</span>}
        {sub && <span className="text-xs text-[#6B6B6B]">{sub}</span>}
      </div>
    </Wrap>
  );
}

/* ── Badge ──────────────────────────────────────────────── */
export type BadgeTone = "green" | "red" | "amber" | "gold" | "gray" | "orange";
export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: BadgeTone }) {
  const styles: Record<BadgeTone, string> = {
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    orange: "bg-orange-50 text-orange-700",
    gold: "bg-yellow-50 text-yellow-700",
    gray: "bg-slate-100 text-slate-700",
  };
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium", styles[tone])}>
      {children}
    </span>
  );
}

/* ── Empty state ────────────────────────────────────────── */
export function EmptyState({
  title = "No data yet",
  description = "Upload a CSV or connect your books to see insights here.",
  icon = <Upload className="w-5 h-5" />,
  cta = { label: "Upload CSV", href: "/dashboard/data-import" },
}: {
  title?: string;
  description?: string;
  icon?: ReactNode;
  cta?: { label: string; href: string } | null;
}) {
  return (
    <div className="text-center py-10 px-4">
      <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-3 text-[#6B6B6B]" style={{ background: "rgba(26,16,8,0.04)" }}>
        {icon}
      </div>
      <p className="font-serif text-sm text-fyn-ink font-semibold">{title}</p>
      <p className="text-xs text-[#6B6B6B] mt-1 max-w-xs mx-auto">{description}</p>
      {cta && (
        <Link
          to={cta.href}
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium px-3 py-1.5 rounded-md text-white transition-colors"
          style={{ background: ACCENT.red }}
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
}

/* Use this to wrap any chart/section. Shows empty state in live mode without data. */
export function WithData<T>({
  data,
  isLoading,
  emptyTitle,
  emptyDescription,
  cta,
  children,
}: {
  data: T[] | undefined;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  cta?: { label: string; href: string } | null;
  children: (data: T[]) => ReactNode;
}) {
  if (isLoading) return <div className="h-40 bg-slate-50 animate-pulse rounded-md" />;
  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} cta={cta} />;
  }
  return <>{children(data)}</>;
}

/* ── Money formatters ────────────────────────────────────── */
export const fmtINR = (n: number) => formatINR(n);
export const fmtCompact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 10000000) return `₹${(n / 10000000).toFixed(2)}Cr`;
  if (abs >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  if (abs >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n.toFixed(0)}`;
};
export const fmtPct = (n: number, digits = 1) => `${n.toFixed(digits)}%`;

/* ── Mode banner ────────────────────────────────────────── */
export function ModeBanner() {
  const mode = useMode();
  if (mode !== "demo") return null;
  return (
    <div className="rounded-md px-4 py-2 text-xs flex items-center justify-between gap-3" style={{ background: "rgba(169,56,56,0.08)", border: "1px solid rgba(169,56,56,0.2)" }}>
      <span className="text-fyn-ink"><strong>Demo data.</strong> Showing a fully-loaded FYNHelp account. Sign up to import your own data.</span>
      <Link to="/waitlist" className="font-medium text-white px-3 py-1 rounded" style={{ background: ACCENT.red }}>Get Started</Link>
    </div>
  );
}

/* ── Chart palette ───────────────────────────────────────── */
export const CHART = {
  redGrad: { id: "redGrad", from: ACCENT.redLight, to: ACCENT.red },
  goldGrad: { id: "goldGrad", from: ACCENT.goldLight, to: ACCENT.gold },
  axis: "#9B9B9B",
  grid: "rgba(26,16,8,0.06)",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "rgba(26,16,8,0.1)",
} as const;

export function ChartGradients() {
  return (
    <defs>
      <linearGradient id={CHART.redGrad.id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CHART.redGrad.from} />
        <stop offset="100%" stopColor={CHART.redGrad.to} />
      </linearGradient>
      <linearGradient id={CHART.goldGrad.id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={CHART.goldGrad.from} />
        <stop offset="100%" stopColor={CHART.goldGrad.to} />
      </linearGradient>
    </defs>
  );
}
