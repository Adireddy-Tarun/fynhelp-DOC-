import NeuralNetwork from "@/components/solutions/NeuralNetwork";

/**
 * ProductEcosystemSection
 * Homepage section that replaces the previous "What FYNHelp Does" suites section.
 * Mirrors the Solutions page neural network + connection flow exactly so that
 * all hover states, animations, responsive behavior and click handlers are
 * preserved (the components themselves are reused — not rebuilt).
 */
export default function ProductEcosystemSection() {
  return (
    <div id="product-ecosystem" style={{ background: "#FAFAF8" }}>
      {/* Page intro */}
      <section style={{ background: "#FAFAF8", padding: "50px 12px 0", overflowX: "hidden" }}>
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
          <p
            style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 17,
              color: "#1A1A1A",
              opacity: 0.75,
              marginBottom: 0,
            }}
          >
            Hover over any module to see what's inside. Click to explore deeper.
          </p>
        </div>

        {/* Neural network diagram */}
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

    </div>
  );
}
