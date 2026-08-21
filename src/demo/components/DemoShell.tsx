/**
 * Tab navigation shell for the 8 intelligence tabs.
 * Used by /demo/* and /demo/* via IntelligenceProvider mode.
 */
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { Droplets, TrendingUp, DollarSign, FileText, Shield, Users, BarChart3, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import LiquidityTab from "./tabs/LiquidityTab";
import RevenueTab from "./tabs/RevenueTab";
import CostTab from "./tabs/CostTab";
import GstTab from "./tabs/GstTab";
import GovernanceTab from "./tabs/GovernanceTab";
import HrTab from "./tabs/HrTab";
import InvestorTab from "./tabs/InvestorTab";
import AskFynnyTab from "./tabs/AskFynnyTab";
import { IntelPage, ModeBanner, ACCENT, LiveTimestamp, ChartGradients } from "@/demo/components/DemoPrimitives";
import { useMode } from "@/demo/components/DemoDataSource";
import { HeaderToolbar } from "@/demo/components/DemoActions";

const TABS = [
  { id: "liquidity",  label: "Liquidity",      icon: Droplets,       Comp: LiquidityTab },
  { id: "revenue",    label: "Revenue",        icon: TrendingUp,     Comp: RevenueTab },
  { id: "cost",       label: "Cost",           icon: DollarSign,     Comp: CostTab },
  { id: "gst",        label: "GST & Tax",      icon: FileText,       Comp: GstTab },
  { id: "governance", label: "Governance",     icon: Shield,         Comp: GovernanceTab },
  { id: "hr",         label: "HR & Workforce", icon: Users,          Comp: HrTab },
  { id: "investor",   label: "Investor",       icon: BarChart3,      Comp: InvestorTab },
  { id: "fynny",      label: "Ask Fynny",      icon: MessageSquare,  Comp: AskFynnyTab },

] as const;

export type TabId = typeof TABS[number]["id"];

export default function IntelligenceShell({ initialTab = "liquidity" }: { initialTab?: TabId }) {
  const [active, setActive] = useState<TabId>(initialTab);
  const Active = TABS.find((t) => t.id === active)?.Comp ?? LiquidityTab;
  const mode = useMode();

  return (
    <IntelPage>
      <ChartGradients />
      <ModeBanner />

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <nav className="flex items-center gap-1 bg-white rounded-lg p-1 overflow-x-auto" style={{ border: "1px solid rgba(26,16,8,0.08)" }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = active === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                  isActive ? "text-white" : "text-[#6B6B6B] hover:text-fyn-ink hover:bg-[rgba(26,16,8,0.04)]",
                )}
                style={isActive ? { background: ACCENT.red } : undefined}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <LiveTimestamp />
          <HeaderToolbar />
        </div>
      </div>

      <div key={active}>
        <Active />
      </div>

      {mode === "demo" && (
        <footer
          className="mt-10 pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs"
          style={{ borderTop: "1px solid rgba(26,16,8,0.08)", color: "#6B6B6B" }}
        >
          <span>Exploring the FynHelp demo. No sign-in needed.</span>
          <Link to="/demo/login" className="hover:text-fyn-ink transition-colors underline-offset-4 hover:underline">
            Preview Login Flow →
          </Link>
          <Link to="/demo/onboarding" className="hover:text-fyn-ink transition-colors underline-offset-4 hover:underline">
            Preview Onboarding →
          </Link>
        </footer>
      )}
    </IntelPage>
  );
}

