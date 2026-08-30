/**
 * CA portal design primitives — isolated from the SME dashboard.
 * Background #F8F7F4, ink #1A1A1A, teal accent #0F6E56.
 */
import { CSSProperties, ReactNode } from "react";

export const CA = {
  bg: "#F8F7F4",
  card: "#FFFFFF",
  ink: "#1A1A1A",
  muted: "rgba(26,26,26,0.55)",
  faint: "rgba(26,26,26,0.35)",
  line: "rgba(26,26,26,0.10)",
  teal: "#0F6E56",
  tealSoft: "rgba(15,110,86,0.08)",
  amber: "#B26B00",
  gold: "#8B6914",

  red: "#B3261E",
  green: "#1A7F3C",
  serif: "Georgia, 'Times New Roman', serif",
  sans: "Inter, system-ui, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
};

export const inr = (n: number | null | undefined) =>
  n === null || n === undefined || Number.isNaN(Number(n))
    ? "—"
    : `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const dateIN = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export function CACard({ children, style, className = "" }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: CA.card,
        border: `0.5px solid ${CA.line}`,
        borderRadius: 12,
        fontFamily: CA.sans,
        color: CA.ink,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function CAHeading({ children, size = 24, style }: { children: ReactNode; size?: number; style?: CSSProperties }) {
  return (
    <h1 style={{ fontFamily: CA.serif, fontSize: size, fontWeight: 700, color: CA.ink, letterSpacing: "-0.01em", ...style }}>
      {children}
    </h1>
  );
}

const TONES: Record<string, { bg: string; fg: string }> = {
  green: { bg: "rgba(26,127,60,0.10)", fg: "#1A7F3C" },
  teal: { bg: "rgba(15,110,86,0.10)", fg: "#0F6E56" },
  amber: { bg: "rgba(178,107,0,0.12)", fg: "#B26B00" },
  red: { bg: "rgba(179,38,30,0.10)", fg: "#B3261E" },
  grey: { bg: "rgba(26,26,26,0.06)", fg: "rgba(26,26,26,0.6)" },
};

export type Tone = keyof typeof TONES;

export function CABadge({ children, tone = "grey" }: { children: ReactNode; tone?: Tone }) {
  const t = TONES[tone] ?? TONES.grey;
  return (
    <span
      style={{
        display: "inline-block",
        background: t.bg,
        color: t.fg,
        fontFamily: CA.sans,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.02em",
        padding: "3px 9px",
        borderRadius: 999,
        textTransform: "capitalize",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export const healthTone = (status?: string | null): Tone => {
  const s = (status ?? "").toLowerCase();
  if (s.includes("critical")) return "red";
  if (s.includes("risk") || s.includes("warn")) return "amber";
  if (s.includes("healthy") || s.includes("good")) return "green";
  if (s.includes("stable")) return "teal";
  return "grey";
};

export const statusTone = (status?: string | null): Tone => {
  const s = (status ?? "").toLowerCase();
  if (["active", "filed", "matched", "accepted", "deposited", "completed"].includes(s)) return "green";
  if (["pending", "invited", "in_progress", "queued", "partial"].includes(s)) return "amber";
  if (["overdue", "mismatched", "expired", "declined", "failed", "inactive"].includes(s)) return "red";
  return "grey";
};

export function CAButton({
  children, onClick, type = "button", variant = "primary", disabled, style,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  disabled?: boolean;
  style?: CSSProperties;
}) {
  const variants: Record<string, CSSProperties> = {
    primary: { background: CA.teal, color: "#fff", border: "none" },
    ghost: { background: "#fff", color: CA.ink, border: `0.5px solid ${CA.line}` },
    danger: { background: "#fff", color: CA.red, border: `0.5px solid rgba(179,38,30,0.35)` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: CA.sans,
        fontSize: 13,
        fontWeight: 600,
        padding: "9px 16px",
        borderRadius: 9,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        transition: "opacity .15s",
        ...variants[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function CAField({
  label, children, error,
}: { label: string; children: ReactNode; error?: string | null }) {
  return (
    <label style={{ display: "block", fontFamily: CA.sans }}>
      <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: CA.ink, marginBottom: 6 }}>{label}</span>
      {children}
      {error && <span style={{ display: "block", fontSize: 11.5, color: CA.red, marginTop: 4 }}>{error}</span>}
    </label>
  );
}

export const caInputStyle: CSSProperties = {
  width: "100%",
  height: 42,
  padding: "0 12px",
  borderRadius: 9,
  border: `0.5px solid ${CA.line}`,
  background: "#fff",
  fontFamily: CA.sans,
  fontSize: 14,
  color: CA.ink,
  outline: "none",
};

export function CAEmpty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: CA.sans }}>
      <div style={{ fontFamily: CA.serif, fontSize: 16, color: CA.ink, marginBottom: 6 }}>{title}</div>
      {hint && <div style={{ fontSize: 13, color: CA.muted }}>{hint}</div>}
    </div>
  );
}

export const caTh: CSSProperties = {
  textAlign: "left",
  fontFamily: CA.sans,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  color: CA.faint,
  padding: "10px 12px",
  borderBottom: `0.5px solid ${CA.line}`,
  whiteSpace: "nowrap",
};

export const caTd: CSSProperties = {
  fontFamily: CA.sans,
  fontSize: 13,
  color: CA.ink,
  padding: "11px 12px",
  borderBottom: `0.5px solid ${CA.line}`,
  verticalAlign: "middle",
};

export const caNum: CSSProperties = { ...caTd, fontFamily: CA.mono, fontVariantNumeric: "tabular-nums", textAlign: "right" };

/* ---------------------------------------------------------------
   Responsive data table.
   Renders a normal table on desktop and a label/value card list on
   phones, so a CA list adapts everywhere by using this one primitive.
   --------------------------------------------------------------- */

export interface CAColumn<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** Right-align + mono on desktop (amounts, counts). */
  numeric?: boolean;
  /** Hidden in the phone card view (low-signal columns). */
  hideOnPhone?: boolean;
  /** Rendered as the card headline instead of a label/value row. */
  primary?: boolean;
}

export function CADataTable<T>({
  columns,
  rows,
  rowKey,
  onRowClick,
  empty,
  phone,
}: {
  columns: CAColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  /** Pass the result of useIsPhone() from the page. */
  phone?: boolean;
}) {
  if (!rows.length) return <>{empty ?? <CAEmpty title="Nothing here yet" />}</>;

  if (phone) {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        {rows.map((row) => {
          const head = columns.find((c) => c.primary) ?? columns[0];
          const rest = columns.filter((c) => c !== head && !c.hideOnPhone);
          return (
            <div
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{
                border: `0.5px solid ${CA.line}`,
                borderRadius: 10,
                padding: "12px 13px",
                background: CA.card,
                cursor: onRowClick ? "pointer" : "default",
              }}
            >
              <div style={{ fontFamily: CA.sans, fontSize: 14, fontWeight: 700, color: CA.ink, marginBottom: 8 }}>
                {head?.render(row)}
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {rest.map((c) => (
                  <div key={c.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <span
                      style={{
                        fontFamily: CA.sans, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
                        textTransform: "uppercase", color: CA.faint,
                      }}
                    >
                      {c.label}
                    </span>
                    <span
                      style={{
                        fontFamily: c.numeric ? CA.mono : CA.sans,
                        fontVariantNumeric: c.numeric ? "tabular-nums" : undefined,
                        fontSize: 13,
                        color: CA.ink,
                        textAlign: "right",
                      }}
                    >
                      {c.render(row)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.numeric ? { ...caTh, textAlign: "right" } : caTh}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={{ cursor: onRowClick ? "pointer" : "default" }}
            >
              {columns.map((c) => (
                <td key={c.key} style={c.numeric ? caNum : caTd}>{c.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
