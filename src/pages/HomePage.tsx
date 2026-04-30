import HeroSection from "@/components/home/HeroSection";
import TickerStrip from "@/components/home/TickerStrip";
import ProblemSection from "@/components/home/ProblemSection";
import SuitesSection from "@/components/home/SuitesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import SimulatorSection from "@/components/home/SimulatorSection";

import SocialProofSection from "@/components/home/SocialProofSection";
import IntegrationsSection from "@/components/home/IntegrationsSection";
import FinalCTASection from "@/components/home/FinalCTASection";

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <TickerStrip />
      <ProblemSection />
      <SuitesSection />
      <HowItWorksSection />
      <SimulatorSection />

      <SocialProofSection />
      <IntegrationsSection />
      <FinalCTASection />
    </div>
  );
};

export default HomePage;
