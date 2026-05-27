/**
 * FYNHelp demo dashboard — locked brand tokens.
 * Only these hex values + opacity variants are allowed anywhere
 * under src/components/demo/* and src/pages/demo/*.
 */

export const C = {
  ink:        "#1A1008",
  inkCard:    "#1F0E07",
  inkRaised:  "#2A1209",
  red:        "#C41E1E",
  redHover:   "#a51818",
  beige:      "#F4EDDA",
  gold:       "#8B6914",
  goldL:      "#C9A84C",
  // status green — reserved for "Online" + positive compliance only
  green:      "#1a9e67",
  greenBg:    "rgba(15,120,70,0.12)",
  greenBorder:"rgba(15,120,70,0.25)",
} as const;

export const A = {
  // beige opacity scale (text hierarchy)
  beige82: "rgba(244,237,218,0.82)",
  beige78: "rgba(244,237,218,0.78)",
  beige72: "rgba(244,237,218,0.72)",
  beige65: "rgba(244,237,218,0.65)",
  beige55: "rgba(244,237,218,0.55)",
  beige50: "rgba(244,237,218,0.50)",
  beige45: "rgba(244,237,218,0.45)",
  beige42: "rgba(244,237,218,0.42)",
  beige40: "rgba(244,237,218,0.40)",
  beige35: "rgba(244,237,218,0.35)",
  beige30: "rgba(244,237,218,0.30)",
  beige28: "rgba(244,237,218,0.28)",
  beige20: "rgba(244,237,218,0.20)",
  beige15: "rgba(244,237,218,0.15)",
  beige10: "rgba(244,237,218,0.10)",
  beige08: "rgba(244,237,218,0.08)",
  beige07: "rgba(244,237,218,0.07)",
  beige06: "rgba(244,237,218,0.06)",
  beige05: "rgba(244,237,218,0.05)",
  beige04: "rgba(244,237,218,0.04)",
  beige03: "rgba(244,237,218,0.03)",
  // red tints
  red35: "rgba(196,30,30,0.35)",
  red30: "rgba(196,30,30,0.30)",
  red20: "rgba(196,30,30,0.20)",
  red15: "rgba(196,30,30,0.15)",
  red12: "rgba(196,30,30,0.12)",
  red08: "rgba(196,30,30,0.08)",
  red06: "rgba(196,30,30,0.06)",
  red45: "rgba(196,30,30,0.45)",
  red40: "rgba(196,30,30,0.40)",
  red80: "rgba(196,30,30,0.80)",
  // gold tints
  gold45: "rgba(139,105,20,0.45)",
  gold30: "rgba(139,105,20,0.30)",
  gold25: "rgba(139,105,20,0.25)",
  gold20: "rgba(139,105,20,0.20)",
  gold15: "rgba(139,105,20,0.15)",
  gold12: "rgba(139,105,20,0.12)",
  gold08: "rgba(139,105,20,0.08)",
  gold06: "rgba(139,105,20,0.06)",
  gold05: "rgba(139,105,20,0.05)",
} as const;

export const FONT = "'Sora', system-ui, sans-serif";

export const T = {
  display: { fontFamily: FONT, fontWeight: 800, fontSize: "clamp(28px, 3vw, 44px)", letterSpacing: "-1.5px", color: C.beige, lineHeight: 1.05 },
  displaySm:{ fontFamily: FONT, fontWeight: 800, fontSize: "clamp(24px, 2.5vw, 36px)", letterSpacing: "-1px",  color: C.beige, lineHeight: 1.05 },
  section: { fontFamily: FONT, fontWeight: 700, fontSize: "18px", letterSpacing: "-0.3px", color: C.beige },
  eyebrow: { fontFamily: FONT, fontWeight: 600, fontSize: "9px",  letterSpacing: "3px",   textTransform: "uppercase" as const, color: C.gold },
  body:    { fontFamily: FONT, fontWeight: 300, fontSize: "14px", lineHeight: 1.85,        color: A.beige78 },
  th:      { fontFamily: FONT, fontWeight: 600, fontSize: "9px",  letterSpacing: "2.5px", textTransform: "uppercase" as const, color: C.gold },
  td:      { fontFamily: FONT, fontWeight: 400, fontSize: "13px", color: A.beige78 },
  sub:     { fontFamily: FONT, fontWeight: 300, fontSize: "12px", color: A.beige45 },
  alert:   { fontFamily: FONT, fontWeight: 600, fontSize: "13px", color: C.red },
  ts:      { fontFamily: FONT, fontWeight: 300, fontSize: "10px", letterSpacing: "1px", color: A.beige28 },
} as const;

export const SURF = {
  page: C.ink,
  card: {
    background: C.inkCard,
    border: `1px solid ${A.beige07}`,
    borderRadius: 6,
  },
  raised: {
    background: C.inkRaised,
    border: `1px solid ${A.beige05}`,
    borderRadius: 6,
  },
  divider: `1px solid ${A.beige07}`,
  vDivider: `1px solid ${A.beige08}`,
} as const;

export const CHART = {
  series1: C.red,
  series1Op: 0.80,
  series2: C.gold,
  series2Op: 0.70,
  series3: A.red40,
  grid:    A.beige04,
  axis:    A.beige35,
  tooltipBg: C.inkRaised,
  tooltipBorder: A.beige10,
  tooltipText: C.beige,
} as const;
