import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

/**
 * Wraps a dashboard page for the public /demo/* routes.
 * Shows a top "demo mode" strip; underlying page renders as-is and
 * uses the seeded demo business via the data hook fallback.
 */
export default function DemoModeBanner({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="sticky top-0 z-40 bg-fyn-red text-white text-fyn-tiny px-fyn-md py-2 flex items-center justify-between gap-fyn-sm">
        <div className="flex items-center gap-2">
          <Eye size={14} />
          <span>
            <strong>Demo mode</strong> — read-only preview with sample Indian SME data.
          </span>
        </div>
        <Link
          to="/waitlist"
          className="underline underline-offset-2 hover:no-underline font-medium"
        >
          Get your own dashboard →
        </Link>
      </div>
      {children}
    </div>
  );
}
