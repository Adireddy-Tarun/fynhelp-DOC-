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
  // PRIMARY — Deep Navy (trust, authority, banking)
  primary: {
    50: "#E8EAF6",
    100: "#C5CAE9",
    500: "#3949AB",
    700: "#283593",
    900: "#1A237E",
  },

  // ACCENT — Rich Gold (premium, CFO-level)
  accent: {
    50: "#FFF8E1",
    500: "#FFA726",
    700: "#F57C00",
  },

  // STATUS
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  info: "#0284C7",

  // SURFACES — Deep navy-black
  background: {
    primary: "#0A0E27",
    secondary: "#1A1F3A",
    tertiary: "#252B48",
  },

  // TEXT
  text: {
    primary: "#F8FAFC",
    secondary: "#CBD5E1",
    tertiary: "#64748B",
  },

  // Borders
  border: "rgba(248,250,252,0.08)",
  borderStrong: "rgba(248,250,252,0.16)",
} as const;


export const gradients = {
  primaryAccent: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[900]} 100%)`,
  surface: `linear-gradient(180deg, ${colors.background.secondary} 0%, ${colors.background.primary} 100%)`,
  goldPremium: `linear-gradient(135deg, ${colors.accent[500]} 0%, ${colors.accent[700]} 100%)`,
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(0,0,0,0.25)",
  md: "0 4px 12px rgba(0,0,0,0.35)",
  lg: "0 12px 32px rgba(0,0,0,0.45)",
  glowPrimary: `0 0 24px ${colors.primary[500]}55`,
  glowGold: `0 0 24px ${colors.accent[500]}55`,
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
