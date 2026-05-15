/**
 * FynHelp CFO-grade design system tokens.
 * Bloomberg-meets-Indian-fintech: serious, monochrome ink with a single
 * red accent and editorial serif typography.
 *
 * Use these constants in JS/TS (e.g. inline styles, framer-motion, charts)
 * where Tailwind tokens aren't ergonomic. For markup, prefer Tailwind
 * classes backed by the same tokens in `tailwind.config.ts` / `index.css`.
 */

import type { Variants, Transition } from "framer-motion";

/* ------------------------------------------------------------------ */
/* Colors                                                              */
/* ------------------------------------------------------------------ */

export const colors = {
  // Brand
  ink: "#1A1008",        // deep brand ink (near-black w/ warmth)
  red: "#C41E1E",        // signature red accent
  redDeep: "#8B0000",    // hover / pressed
  redSoft: "#E85D5D",    // gradient pair / highlights
  beige: "#F4EDDA",      // warm paper background
  gold: "#8B6914",       // editorial accent

  // Surfaces (dark CFO theme)
  bg: "#0A0B0D",
  bgElevated: "#111214",
  surface: "rgba(255,255,255,0.04)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.16)",

  // Text
  text: "#F5F0E8",
  textMuted: "rgba(245,240,232,0.65)",
  textDim: "rgba(245,240,232,0.45)",
  textFaint: "rgba(245,240,232,0.25)",

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#C41E1E",
  info: "#3B82F6",
} as const;

export const gradients = {
  redAccent: `linear-gradient(135deg, ${colors.red} 0%, ${colors.redDeep} 100%)`,
  inkSurface: `linear-gradient(180deg, ${colors.bgElevated} 0%, ${colors.bg} 100%)`,
  goldEditorial: `linear-gradient(135deg, ${colors.gold} 0%, #B8902A 100%)`,
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.25)",
  md: "0 4px 12px rgba(0,0,0,0.35)",
  lg: "0 12px 32px rgba(0,0,0,0.45)",
  glowRed: `0 0 24px ${colors.red}55`,
} as const;

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

export const fonts = {
  serif: "'Instrument Serif', Georgia, serif",
  sans: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', 'SF Mono', monospace",
} as const;

/* ------------------------------------------------------------------ */
/* Motion                                                              */
/* ------------------------------------------------------------------ */

// Cubic-bezier tuple typed for framer-motion's `Easing`.
export const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const easeInOut: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const transitions = {
  fast: { duration: 0.25, ease: easeOutExpo } satisfies Transition,
  base: { duration: 0.45, ease: easeOutExpo } satisfies Transition,
  slow: { duration: 0.7, ease: easeOutExpo } satisfies Transition,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitions.base },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: transitions.base },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transitions.base },
};

/* ------------------------------------------------------------------ */
/* Spacing & radii (numeric mirrors of Tailwind tokens)               */
/* ------------------------------------------------------------------ */

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const designSystem = {
  colors,
  gradients,
  shadows,
  fonts,
  transitions,
  radius,
  space,
} as const;

export default designSystem;
