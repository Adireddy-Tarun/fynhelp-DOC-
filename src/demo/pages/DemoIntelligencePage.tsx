/**
 * Demo Intelligence page — fully isolated from /dashboard.
 * Mounts demo-only shell + demo-only detail drawer.
 */
import { Helmet } from "react-helmet-async";
import DemoShell, { TabId } from "@/demo/components/DemoShell";
import { IntelligenceProvider } from "@/demo/components/DemoDataSource";
import DemoModeBanner from "@/components/demo/DemoModeBanner";

interface Props {
  tab?: TabId;
}

export default function DemoIntelligencePage({ tab = "liquidity" }: Props) {
  return (
    <DemoModeBanner>
      <IntelligenceProvider mode="demo">
        <Helmet>
          <title>FynHelp Demo — See AI CFO in Action</title>
          <meta name="description" content="Explore FynHelp's live demo. See liquidity intelligence, revenue tracking, GST compliance, and AI-powered financial insights for Indian businesses." />
          <link rel="canonical" href={`https://fynhelp.com/demo/${tab}`} />
          <meta property="og:title" content="FynHelp Demo — See AI CFO in Action" />
          <meta property="og:description" content="Live demo of FynHelp's AI CFO for Indian SMEs." />
          <meta property="og:url" content={`https://fynhelp.com/demo/${tab}`} />
          <meta name="robots" content="index, follow" />
        </Helmet>
        <div className="min-h-screen bg-fyn-beige" data-source="demo">
          <DemoShell initialTab={tab} />
        </div>
      </IntelligenceProvider>
    </DemoModeBanner>
  );
}
