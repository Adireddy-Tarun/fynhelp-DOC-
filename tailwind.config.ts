import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "-apple-system", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        fyn: {
          ink: "hsl(var(--fyn-ink))",
          red: "hsl(var(--fyn-red))",
          beige: "hsl(var(--fyn-beige))",
          gold: "hsl(var(--fyn-gold))",
          "beige-dark": "hsl(var(--fyn-beige-dark))",
          "beige-deep": "hsl(var(--fyn-beige-deep))",
          "beige-card": "hsl(var(--fyn-beige-card))",
          "red-dark": "hsl(var(--fyn-red-dark))",
          "red-light": "hsl(var(--fyn-red-light))",
          "red-tint": "hsl(var(--fyn-red-tint))",
          "gold-dark": "hsl(var(--fyn-gold-dark))",
          "gold-mid": "hsl(var(--fyn-gold-mid))",
          "gold-light": "hsl(var(--fyn-gold-light))",
          success: "hsl(var(--fyn-success))",
          "success-bg": "hsl(var(--fyn-success-bg))",
          warning: "hsl(var(--fyn-warning))",
          "warning-bg": "hsl(var(--fyn-warning-bg))",
          danger: "hsl(var(--fyn-danger))",
          "danger-bg": "hsl(var(--fyn-danger-bg))",
          info: "hsl(var(--fyn-info))",
          "info-bg": "hsl(var(--fyn-info-bg))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
