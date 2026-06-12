/**
 * Single intelligence dashboard page — used for both /demo/* and /dashboard/*.
 * The mode prop switches the data source between seeded demo data and the
 * authenticated user's live data.
 */
import IntelligenceShell, { TabId } from "@/components/intelligence/IntelligenceShell";
import { IntelligenceProvider, IntelligenceMode } from "@/components/intelligence/DataSource";
import DetailDrawer from "@/components/dashboard/DetailDrawer";

interface Props {
  mode: IntelligenceMode;
  tab?: TabId;
}

export default function IntelligencePage({ mode, tab = "liquidity" }: Props) {
  return (
    <IntelligenceProvider mode={mode}>
      <div className="min-h-screen bg-fyn-beige">
        <IntelligenceShell initialTab={tab} />
        <DetailDrawer />
      </div>
    </IntelligenceProvider>
  );
}
