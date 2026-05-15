/**
 * FynHelp CFO-grade design system.
 * Navy + Gold palette for trust, authority, and premium feel.
 */
import type { Variants } from "framer-motion";

// ─── Colors ──────────────────────────────────────────────────────────
export const colors = {
  // Primary: Deep Navy (Trust, Banking, Authority)
  primary: {
    50: "#E8EAF6",
    100: "#C5CAE9",
    300: "#7986CB",
    500: "#3949AB", // Main brand color
    700: "#283593",
    900: "#1A237E",
  },

  // Accent: Rich Gold (Premium, Value, CFO-level)
  accent: {
    50: "#FFF8E1",
    300: "#FFD54F",
    500: "#FFA726", // Main accent
    700: "#F57C00",
    900: "#E65100",
  },

  // Status colors
  success: { light: "#34D399", main: "#059669", dark: "#047857" },
  warning: { light: "#FBBF24", main: "#D97706", dark: "#B45309" },
  danger:  { light: "#F87171", main: "#DC2626", dark: "#B91C1C" },
  info:    { light: "#38BDF8", main: "#0284C7", dark: "#0369A1" },

  // Backgrounds
  bg: {
    primary:   "#0A0E27",
    secondary: "#1A1F3A",
    tertiary:  "#252B48",
    card:      "#1E2642",
  },

  // Text hierarchy
  text: {
    primary:   "#F8FAFC",
    secondary: "#CBD5E1",
    tertiary:  "#64748B",
    muted:     "#475569",
  },
} as const;

// ─── Framer Motion variants ──────────────────────────────────────────
export const cardHover: Variants = {
  rest:  { y: 0,  rotateX: 0, rotateY: 0, scale: 1,    transition: { duration: 0.3 } },
  hover: { y: -8, rotateX: 2, rotateY: 2, scale: 1.02, transition: { duration: 0.3, ease: "easeOut" } },
};

export const buttonRotate: Variants = {
  rest:  { rotateY: 0,  rotateX: 0,  scale: 1 },
  hover: { rotateY: 15, rotateX: -5, scale: 1.05, transition: { duration: 0.3, ease: "easeOut" } },
  tap:   { rotateY: 0,  rotateX: 0,  scale: 0.95 },
};

export const fadeInUp: Variants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const pulseGlow = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale:   [1, 1.05, 1],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
  },
};

export const shimmer = {
  animate: {
    x: ["-100%", "100%"],
    transition: { duration: 2, repeat: Infinity, ease: "linear" as const },
  },
};
