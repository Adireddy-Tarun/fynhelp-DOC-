import { ReactNode } from "react";
import { Link } from "@/lib/router-compat";
import { Eye } from "lucide-react";
import { IntelligenceProvider } from "@/components/intelligence/DataSource";

/**
 * Wraps a dashboard page for the public /demo/* routes.
 *
 * Two jobs:
 *  1. Renders the sticky "demo mode" strip.
 *  2. Provides IntelligenceProvider mode="demo" so every descendant —
 *     including LiveCockpitPanel, ListPageShell, CustomerDetail,
 *     VendorDetail, and the EmptyState CTA inside _primitives — can
 *     call useMode() to pick /demo vs /dashboard for navigation.
 *
 *  Without this provider, those components would default to "live"
 *  mode and route demo visitors out of /demo/* into the authenticated
 *  /dashboard/* tree.
 */
export default function DemoModeBanner({ children }: { children: ReactNode }) {
  return (
    <IntelligenceProvider mode="demo">
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
    </IntelligenceProvider>
  );
}
