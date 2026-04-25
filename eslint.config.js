import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/**
 * Forbidden Tailwind tokens inside /dashboard files.
 *
 * Why: dashboard pages must use the Fyn design-system tokens
 * (text-fyn-ink / bg-fyn-beige-card / fyn-red etc.) and the
 * fyn-* spacing scale (gap-fyn-sm / gap-fyn-md / gap-fyn-lg).
 *
 * Banned colors: black, white-as-bg, generic gray/zinc/slate/neutral,
 * blue/indigo/purple/violet/sky (anything that drifts from the warm
 * beige + ink + fyn-red palette).
 *
 * Banned spacing: gap-3 / gap-4 / gap-5 / gap-6 / gap-7
 * (use gap-fyn-sm | gap-fyn-md | gap-fyn-lg | gap-fyn-xl instead).
 */
const FORBIDDEN_DASHBOARD_TOKENS = [
  // colors
  "\\bbg-black\\b",
  "\\btext-black\\b",
  "\\bborder-black\\b",
  "\\bbg-white\\b",
  "\\b(text|bg|border|ring|from|to|via)-(gray|zinc|slate|neutral|stone)-(50|100|200|300|400|500|600|700|800|900)\\b",
  "\\b(text|bg|border|ring|from|to|via)-(blue|indigo|violet|purple|sky|cyan|teal|emerald|lime|amber|orange|rose|pink|fuchsia)-(50|100|200|300|400|500|600|700|800|900)\\b",
  // spacing — block raw gap-3..gap-7 (px / rem variants and arbitrary values still allowed,
  // but the common ad-hoc 12-28px gaps must come from the fyn-* scale).
  "\\bgap-[3-7]\\b",
  "\\b(gap-x|gap-y)-[3-7]\\b",
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
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: `Literal[value=/${dashboardForbiddenRegex.source}/]`,
          message:
            "Forbidden Tailwind class in /dashboard files. " +
            "Use design-system tokens: text-fyn-ink / bg-fyn-beige-card / border-fyn-ink-10 / text-fyn-red, " +
            "and the fyn-* spacing scale (gap-fyn-sm | gap-fyn-md | gap-fyn-lg | gap-fyn-xl) instead of gap-3..gap-7. " +
            "See src/components/dashboard/ui.tsx for the shared primitives (FynCard, FynButton, FynBadge, FynInput…).",
        },
        {
          // Template literals (e.g. cn(`gap-4 ${x}`)) — same regex on TemplateElement.value.raw.
          selector: `TemplateElement[value.raw=/${dashboardForbiddenRegex.source}/]`,
          message:
            "Forbidden Tailwind class in /dashboard files. " +
            "Use design-system tokens (text-fyn-ink / bg-fyn-beige-card / fyn-red) and the fyn-* spacing scale.",
        },
      ],
    },
  },
);
