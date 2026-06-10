import { ReactNode } from "react";
import { FynBadge, FynLabel } from "@/components/dashboard/ui";
import { cn } from "@/lib/utils";

export function DrawerHeader({
  title,
  subtitle,
  badges,
  meta,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  meta?: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="p-fyn-lg border-b border-fyn-ink-10 space-y-fyn-sm">
      <h2 className="font-serif text-fyn-h2 text-fyn-ink">{title}</h2>
      {subtitle && <p className="text-fyn-body text-fyn-ink-60">{subtitle}</p>}
      {badges && <div className="flex gap-2 flex-wrap">{badges}</div>}
      {meta && meta.length > 0 && (
        <dl className="grid grid-cols-1 gap-fyn-xs pt-fyn-xs">
          {meta.map((m) => (
            <div key={m.label} className="flex gap-2 text-fyn-small">
              <dt className="text-fyn-ink-45 min-w-[80px]">{m.label}</dt>
              <dd className="text-fyn-ink-60 font-medium break-all">{m.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export function DrawerSection({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("p-fyn-lg border-b border-fyn-ink-10 space-y-fyn-sm", className)}>
      {title && <h3 className="font-serif text-fyn-h3 text-fyn-ink">{title}</h3>}
      {children}
    </section>
  );
}

export function DrawerMetricRow({
  items,
}: {
  items: { label: string; value: ReactNode; sub?: ReactNode }[];
}) {
  return (
    <div className="grid grid-cols-3 gap-fyn-sm">
      {items.map((m) => (
        <div
          key={m.label}
          className="bg-fyn-beige-card border border-fyn-ink-10 rounded-md p-fyn-sm"
        >
          <FynLabel>{m.label}</FynLabel>
          <p className="font-mono text-fyn-h3 text-fyn-ink mt-1">{m.value}</p>
          {m.sub && <p className="text-fyn-tiny text-fyn-ink-40 mt-1">{m.sub}</p>}
        </div>
      ))}
    </div>
  );
}

export function StatusBadgeFor({
  kind,
  value,
}: {
  kind: "invoice" | "expense";
  value: string;
}) {
  if (kind === "invoice") {
    const map: Record<string, { tone: "success" | "danger" | "warning" | "neutral"; label: string }> = {
      paid: { tone: "success", label: "Paid" },
      overdue: { tone: "danger", label: "Overdue" },
      sent: { tone: "warning", label: "Sent" },
      draft: { tone: "neutral", label: "Draft" },
      partially_paid: { tone: "warning", label: "Partial" },
      cancelled: { tone: "neutral", label: "Cancelled" },
    };
    const m = map[value] || { tone: "neutral" as const, label: value };
    return <FynBadge tone={m.tone}>{m.label}</FynBadge>;
  }
  return (
    <FynBadge tone={value === "Paid" ? "success" : "warning"}>{value}</FynBadge>
  );
}
