import { useEffect } from "react";
import { X, Check, Lightbulb } from "lucide-react";

export interface UseCaseContent {
  title: string;
  useCases: string[];
  exampleScenario: string;
}

interface Props {
  content: UseCaseContent | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UseCaseBubble({ content, isOpen, onClose }: Props) {
  // ESC to close + lock body scroll while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !content) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="usecase-title"
      >
        <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
            <h3
              id="usecase-title"
              className="text-2xl font-bold text-fyn-ink"
              style={{ fontFamily: "'Oswald', sans-serif" }}
            >
              {content.title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-fyn-ink/60 hover:text-fyn-ink transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-fyn-ink mb-3">
                What You Can Do:
              </h4>
              <ul className="space-y-2">
                {content.useCases.map((u, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-fyn-success mt-0.5 flex-shrink-0" />
                    <span className="text-fyn-ink/75">{u}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-fyn-gold/10 border border-fyn-gold/20 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-fyn-gold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Real-World Example:
              </h4>
              <p className="text-sm text-fyn-ink leading-relaxed">
                {content.exampleScenario}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full bg-fyn-red text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Got it! Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const USE_CASE_CONTENT: Record<string, UseCaseContent> = {
  liquidity: {
    title: "Cash Flow & Runway Tracking",
    useCases: [
      "Monitor real-time cash position across all bank accounts",
      "Get alerted when runway drops below 3 months",
      "Forecast cash flow for next 6 months based on burn rate",
      "Track monthly burn rate trends and anomalies",
    ],
    exampleScenario:
      "Startup with ₹25L in bank, burning ₹4.5L/month. Fynny alerts: 'Cash runway is 5.5 months. Consider reducing burn or raising funds by July.'",
  },
  revenue: {
    title: "Revenue Analytics & Growth",
    useCases: [
      "Track MRR/ARR growth month-over-month",
      "Analyze customer cohorts and retention rates",
      "Predict revenue trajectory for next quarter",
      "Identify churn risks and expansion opportunities",
    ],
    exampleScenario:
      "SaaS with ₹12L MRR growing 8% MoM. Fynny predicts: 'At current growth, you'll hit ₹1Cr ARR in 4.5 months. Top 3 customers contribute 42% of MRR — diversification recommended.'",
  },
  cost: {
    title: "Expense Management & Optimization",
    useCases: [
      "Auto-categorize expenses by vendor and type",
      "Detect unusual spending patterns and anomalies",
      "Identify top cost centers and optimization opportunities",
      "Track vendor spend concentration and negotiate better rates",
    ],
    exampleScenario:
      "D2C brand spending ₹18L/month. Fynny flags: 'AWS costs up 40% this month (₹2.4L → ₹3.4L). Review unused resources. Marketing spend with Google concentrated at 35% — consider diversifying channels.'",
  },
  gst: {
    title: "Compliance & Tax Management",
    useCases: [
      "Track GST liability and ITC claims in real-time",
      "Get deadline alerts for GSTR-1, GSTR-3B, ITR filings",
      "Reconcile invoices with GSTR-2A automatically",
      "Flag mismatches and compliance risks before filing",
    ],
    exampleScenario:
      "SME with ₹2.8Cr quarterly sales. Fynny alerts: 'GSTR-3B due in 6 days. Output GST: ₹5.04L, ITC available: ₹1.82L, Net liability: ₹3.22L. 3 invoices unmatched in GSTR-2A — review before filing.'",
  },
};
