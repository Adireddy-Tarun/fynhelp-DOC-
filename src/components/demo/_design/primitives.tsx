/**
 * Shared primitives for the FYNHelp demo dashboard.
 * Every module composes these so the visual language stays consistent.
 */
import { type ReactNode, type CSSProperties } from "react";
import { C, A, T, SURF, FONT } from "./tokens";

// ─── Ledger Strip ─────────────────────────────────────────────────────
export function LedgerStrip({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        ...SURF.card,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function LedgerMetric({
  label,
  value,
  context,
  status,
  statusColor,
  valueColor,
  small,
}: {
  label: string;
  value: ReactNode;
  context?: string;
  status?: string;
  statusColor?: string;
  valueColor?: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        padding: "24px 28px",
        borderRight: SURF.vDivider,
        borderBottom: SURF.vDivider,
        minWidth: 0,
      }}
    >
      <div style={{ ...T.eyebrow, marginBottom: 10 }}>{label}</div>
      <div style={{ ...(small ? T.displaySm : T.displaySm), color: valueColor ?? C.beige }}>{value}</div>
      {(context || status) && (
        <div style={{ ...T.sub, marginTop: 6, lineHeight: 1.5 }}>
          {context}
          {status && (
            <span style={{ color: statusColor ?? C.beige, fontWeight: 600 }}>{status}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CFO Briefing Panel ───────────────────────────────────────────────
export function CFOBriefing({
  verdict,
  updatedAt = "Updated 14 minutes ago",
}: {
  verdict: ReactNode;
  updatedAt?: string;
}) {
  return (
    <div
      style={{
        background: A.red06,
        borderLeft: `3px solid ${C.red}`,
        border: `1px solid ${A.red15}`,
        borderRadius: 6,
        padding: "16px 20px",
        marginBottom: 28,
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ ...T.eyebrow, color: C.red, marginBottom: 8 }}>CFO BRIEFING</div>
        <div style={{ fontFamily: FONT, fontWeight: 300, fontSize: 14, lineHeight: 1.8, color: A.beige82 }}>
          {verdict}
        </div>
      </div>
      <div style={T.ts}>{updatedAt}</div>
    </div>
  );
}

// ─── Recommended Action Footer ────────────────────────────────────────
export function RecommendedAction({ action, onDone }: { action: ReactNode; onDone?: () => void }) {
  return (
    <div
      style={{
        background: A.gold06,
        border: `1px solid ${A.gold15}`,
        borderRadius: 6,
        padding: "16px 20px",
        marginTop: 32,
        display: "flex",
        gap: 20,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: 1, minWidth: 280 }}>
        <div style={{ ...T.eyebrow, marginBottom: 6 }}>THIS WEEK'S PRIORITY ACTION</div>
        <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, color: C.beige, lineHeight: 1.55 }}>
          {action}
        </div>
      </div>
      <SecondaryBtn onClick={onDone}>Mark as Done</SecondaryBtn>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────
export function SectionHeader({
  children,
  rightLink,
  onRightClick,
}: {
  children: ReactNode;
  rightLink?: string;
  onRightClick?: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
        margin: "32px 0 14px",
      }}
    >
      <h2 style={{ ...T.section, margin: 0 }}>{children}</h2>
      {rightLink && (
        <button
          onClick={onRightClick}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 12,
            color: C.gold,
          }}
        >
          {rightLink}
        </button>
      )}
    </div>
  );
}

// ─── Buttons (the only two allowed) ───────────────────────────────────
export function PrimaryBtn({
  children,
  onClick,
  style,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      style={{
        background: C.red,
        color: C.beige,
        border: "none",
        borderRadius: 4,
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: 12,
        padding: "7px 16px",
        cursor: "pointer",
        transition: "background 0.15s ease",
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.redHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = C.red)}
    >
      {children}
    </button>
  );
}

export function SecondaryBtn({
  children,
  onClick,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        color: A.beige65,
        border: `1px solid ${A.beige15}`,
        borderRadius: 4,
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: 12,
        padding: "7px 16px",
        cursor: "pointer",
        transition: "border-color 0.15s ease, color 0.15s ease",
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = A.beige35;
        e.currentTarget.style.color = C.beige;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = A.beige15;
        e.currentTarget.style.color = A.beige65;
      }}
    >
      {children}
    </button>
  );
}

// ─── Badges (5 variants only) ─────────────────────────────────────────
export type BadgeVariant = "high" | "medium" | "low" | "positive" | "online";

const BADGE_STYLES: Record<BadgeVariant, { bg: string; border: string; color: string }> = {
  high:     { bg: A.red15,         border: A.red35,                  color: C.red },
  medium:   { bg: A.gold15,        border: A.gold30,                 color: C.goldL },
  low:      { bg: A.beige06,       border: A.beige15,                color: A.beige55 },
  positive: { bg: A.gold12,        border: A.gold25,                 color: C.gold },
  online:   { bg: C.greenBg,       border: C.greenBorder,            color: C.green },
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  const s = BADGE_STYLES[variant];
  return (
    <span
      style={{
        display: "inline-block",
        background: s.bg,
        border: `1px solid ${s.border}`,
        color: s.color,
        borderRadius: 20,
        padding: "3px 10px",
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 9,
        letterSpacing: 1,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

// ─── Pill (filter pill group item) ────────────────────────────────────
export function Pill({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? C.red : A.beige06,
        border: active ? "1px solid transparent" : `1px solid ${A.beige10}`,
        color: active ? C.beige : A.beige45,
        borderRadius: 20,
        padding: "5px 12px",
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: 11,
        cursor: "pointer",
        transition: "all 0.15s ease",
      }}
    >
      {children}
    </button>
  );
}

// ─── Plain English explainer (GST module) ─────────────────────────────
export function PlainEnglish({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        background: A.gold05,
        borderLeft: `2px solid ${C.gold}`,
        padding: "12px 16px",
        marginBottom: 16,
        fontFamily: FONT,
        fontWeight: 300,
        fontSize: 13,
        lineHeight: 1.65,
        color: A.beige72,
        borderRadius: "0 4px 4px 0",
      }}
    >
      {children}
    </div>
  );
}

// ─── Card surface (when a single card is needed) ──────────────────────
export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...SURF.card, padding: "24px 28px", ...style }}>{children}</div>;
}
