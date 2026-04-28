// Shared password policy: rules, weak-password set, and strength scoring.
// Kept in sync between SignUp and ResetPassword to avoid policy drift.

export type PasswordRuleKey =
  | "length"
  | "upper"
  | "lower"
  | "digit"
  | "symbol"
  | "noSpaces";

export interface PasswordRule {
  key: PasswordRuleKey;
  label: string;
  test: (pw: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { key: "length", label: "At least 10 characters", test: (p) => p.length >= 10 },
  { key: "upper", label: "An uppercase letter (A–Z)", test: (p) => /[A-Z]/.test(p) },
  { key: "lower", label: "A lowercase letter (a–z)", test: (p) => /[a-z]/.test(p) },
  { key: "digit", label: "A number (0–9)", test: (p) => /\d/.test(p) },
  { key: "symbol", label: "A symbol (e.g. ! @ # $ %)", test: (p) => /[^A-Za-z0-9]/.test(p) },
  { key: "noSpaces", label: "No leading or trailing spaces", test: (p) => p.length === 0 || p === p.trim() },
];

export const COMMON_WEAK_PASSWORDS = new Set<string>([
  "password", "password1", "password123", "qwerty", "qwerty123",
  "12345678", "123456789", "1234567890", "letmein", "welcome",
  "admin", "iloveyou", "abc12345", "monkey", "dragon",
]);

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  /** Tailwind background-color class for the strength bar segments. */
  color: string;
}

export const evaluatePasswordStrength = (
  pw: string,
  passedCount: number,
): PasswordStrength => {
  if (!pw) return { score: 0, label: "", color: "bg-fyn-ink-10" };
  if (COMMON_WEAK_PASSWORDS.has(pw.toLowerCase())) {
    return { score: 1, label: "Too common", color: "bg-fyn-red" };
  }
  let score = passedCount;
  if (pw.length >= 14) score += 1;
  if (pw.length >= 18) score += 1;
  if (score <= 2) return { score: 1, label: "Weak", color: "bg-fyn-red" };
  if (score <= 4) return { score: 2, label: "Fair", color: "bg-fyn-gold" };
  if (score <= 6) return { score: 3, label: "Strong", color: "bg-fyn-success" };
  return { score: 4, label: "Excellent", color: "bg-fyn-success" };
};

export interface PasswordPolicyResult {
  rules: Array<PasswordRule & { passed: boolean }>;
  passedCount: number;
  allRulesPassed: boolean;
  isCommonWeak: boolean;
  strength: PasswordStrength;
}

export const evaluatePasswordPolicy = (pw: string): PasswordPolicyResult => {
  const rules = PASSWORD_RULES.map((r) => ({ ...r, passed: r.test(pw) }));
  const passedCount = rules.filter((r) => r.passed).length;
  return {
    rules,
    passedCount,
    allRulesPassed: passedCount === PASSWORD_RULES.length,
    isCommonWeak: !!pw && COMMON_WEAK_PASSWORDS.has(pw.toLowerCase()),
    strength: evaluatePasswordStrength(pw, passedCount),
  };
};
