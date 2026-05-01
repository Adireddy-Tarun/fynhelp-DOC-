import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import NeuralNetwork from "@/components/solutions/NeuralNetwork";
import ConnectionFlow from "@/components/solutions/ConnectionFlow";

const SolutionsPage = () => {
  const location = useLocation();

  // Smooth-scroll to anchored section when arriving via /solutions#slug
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    // Defer to next tick so the section is mounted
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return () => window.clearTimeout(t);
  }, [location.hash, location.key]);


  return (
    <Layout>
      <section className="bg-fyn-ink py-16">
        <div className="fyn-container text-center">
          <span className="fyn-label block mb-4 font-sans text-[#8e7343] text-base">HOW FYNHELP WORKS</span>
          <h1 className="text-3xl leading-tight text-white max-w-[900px] mx-auto mb-4 font-serif md:text-7xl font-bold">
            One platform. Every financial problem an Indian SME faces. Solved.
          </h1>
          <p className="text-white/60 text-lg max-w-[700px] mx-auto">
            FynHelp's intelligence suites are deeply interconnected — when AI CFO Nidhi spots a cash crunch, she simultaneously checks your receivables for quick wins, your GST for refunds due, your payables for deferral options, and your working capital marketplace for financing.
          </p>
        </div>
      </section>

      {/* Interactive Ecosystem Map */}
      <section style={{ background: "#FAFAF8", padding: "50px 12px 80px", overflowX: "hidden" }}>
        <div className="text-center" style={{ padding: "0 20px 40px" }}>
          <h2
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontWeight: 700,
              fontSize: 38,
              color: "#1A1A1A",
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            How the product ecosystem works together
          </h2>
          <p style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: 17,
            color: "#1A1A1A",
            opacity: 0.75,
            marginBottom: 0,
          }}>
            Hover over any module to see what's inside. Click to explore deeper.
          </p>
        </div>
        <div className="text-center">
          <NeuralNetwork />
          <p
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 18,
              lineHeight: 1.6,
              color: "#1A1A1A",
              maxWidth: 820,
              margin: "50px auto 0 auto",
              padding: "0 20px",
              textAlign: "center",
            }}
          >
            Every module feeds AI CFO Nidhi. AI CFO Nidhi connects everything. You get one coherent answer — not 6 separate dashboards.
          </p>
        </div>
      </section>

      {/* Animated connection flow illustration */}
      <ConnectionFlow />

    </Layout>
  );
};

export default SolutionsPage;
