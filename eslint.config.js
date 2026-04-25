import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import fynSpacing from "./eslint-rules/fyn-spacing.js";

/**
 * Forbidden Tailwind COLOR tokens inside /dashboard files.
 *
 * Why: dashboard pages must use the Fyn design-system tokens
 * (text-fyn-ink / bg-fyn-beige-card / fyn-red etc.).
 *
 * Banned: black, white-as-bg, generic gray/zinc/slate/neutral,
 * blue/indigo/purple/violet/sky (anything that drifts from the warm
 * beige + ink + fyn-red palette).
 *
 * Spacing (gap-3..gap-7) is handled separately by the auto-fixable
 * `fyn-spacing/dashboard-gap-scale` rule below.
 */
const FORBIDDEN_DASHBOARD_TOKENS = [
  "\\bbg-black\\b",
  "\\btext-black\\b",
  "\\bborder-black\\b",
  "\\bbg-white\\b",
  "\\b(text|bg|border|ring|from|to|via)-(gray|zinc|slate|neutral|stone)-(50|100|200|300|400|500|600|700|800|900)\\b",
  "\\b(text|bg|border|ring|from|to|via)-(blue|indigo|violet|purple|sky|cyan|teal|emerald|lime|amber|orange|rose|pink|fuchsia)-(50|100|200|300|400|500|600|700|800|900)\\b",
];

const dashboardForbiddenRegex = new RegExp(FORBIDDEN_DASHBOARD_TOKENS.join("|"));

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Brand-system enforcement for every dashboard surface.
    files: [
      "src/pages/dashboard/**/*.{ts,tsx}",
      "src/components/dashboard/**/*.{ts,tsx}",
    ],
    plugins: {
      "fyn-spacing": fynSpacing,
    },
    rules: {
      // Auto-fixable: gap-3..gap-7 (and gap-x/y-3..7) → gap-fyn-sm|md|lg|xl.
      "fyn-spacing/dashboard-gap-scale": "error",
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${dashboardForbiddenRegex.source}/]`,
          message:
            "Forbidden Tailwind class in /dashboard files. " +
            "Use design-system tokens: text-fyn-ink / bg-fyn-beige-card / border-fyn-ink-10 / text-fyn-red. " +
            "See src/components/dashboard/ui.tsx for the shared primitives (FynCard, FynButton, FynBadge, FynInput…).",
        },
        {
          // Template literals (e.g. cn(`text-gray-500 ${x}`)) — same regex on TemplateElement.value.raw.
          selector: `TemplateElement[value.raw=/${dashboardForbiddenRegex.source}/]`,
          message:
            "Forbidden Tailwind class in /dashboard files. " +
            "Use design-system tokens (text-fyn-ink / bg-fyn-beige-card / fyn-red).",
        },
      ],
    },
  },
);
