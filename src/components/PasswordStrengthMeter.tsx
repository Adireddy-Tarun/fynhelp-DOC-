import { Check, X } from "lucide-react";
import { evaluatePasswordPolicy } from "@/lib/passwordPolicy";

interface PasswordStrengthMeterProps {
  password: string;
  /** When true (e.g. after blur or submit attempt), unmet rules turn red. */
  showFailures?: boolean;
  /** Optional id used by aria-describedby on the password input. */
  rulesId?: string;
  strengthId?: string;
  className?: string;
}

/**
 * Live password strength meter + checklist. Brand-aligned with the
 * fyn-* design tokens (no white cards, no gray-500 text).
 */
export const PasswordStrengthMeter = ({
  password,
  showFailures = false,
  rulesId,
  strengthId,
  className,
}: PasswordStrengthMeterProps) => {
  const { rules, strength, isCommonWeak } = evaluatePasswordPolicy(password);

  return (
    <div className={className}>
      {password && (
        <div id={strengthId} className="mt-2" aria-live="polite">
          <div className="flex gap-1" aria-hidden="true">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= strength.score ? strength.color : "bg-fyn-ink-10"
                }`}
              />
            ))}
          </div>
          <p
            className="mt-1 text-fyn-ink-60"
            style={{ fontSize: "var(--fyn-type-tiny)" }}
          >
            Strength:{" "}
            <span
              className={`font-medium ${
                strength.score >= 3
                  ? "text-fyn-success"
                  : strength.score === 2
                  ? "text-fyn-gold"
                  : "text-fyn-red"
              }`}
            >
              {strength.label}
            </span>
            {isCommonWeak && (
              <span className="text-fyn-red"> — this is a commonly used password.</span>
            )}
          </p>
        </div>
      )}

      <ul id={rulesId} className="mt-3 space-y-1">
        {rules.map((r) => (
          <li
            key={r.key}
            className={`flex items-center gap-2 ${
              r.passed
                ? "text-fyn-success"
                : showFailures
                ? "text-fyn-red"
                : "text-fyn-ink-60"
            }`}
            style={{ fontSize: "var(--fyn-type-tiny)" }}
          >
            {r.passed ? (
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
              <X className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
            )}
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordStrengthMeter;
