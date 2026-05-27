/**
 * Circuit Ledger animated background for the FYNHelp demo page.
 * Purely decorative — fixed, full viewport, pointer-events: none.
 * Brand colors only: #1A1008, #C41E1E, #F4EDDA, #8B6914.
 */
export default function CircuitLedgerBackground() {
  const goldNode = (cx: number, cy: number, opacity = 1) => (
    <g key={`g-${cx}-${cy}`} opacity={opacity}>
      <circle cx={cx} cy={cy} r={4} stroke="rgba(139,105,20,0.30)" strokeWidth={1} fill="none" />
      <circle cx={cx} cy={cy} r={2} fill="rgba(139,105,20,0.40)" />
    </g>
  );
  const redNode = (cx: number, cy: number) => (
    <g key={`r-${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={4} stroke="rgba(196,30,30,0.40)" strokeWidth={1} fill="none" />
      <circle cx={cx} cy={cy} r={2} fill="rgba(196,30,30,0.50)" />
    </g>
  );

  return (
    <>
      {/* Layer 0: base color + scanlines */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(244,237,218,0.012) 3px, rgba(244,237,218,0.012) 4px), #1A1008",
        }}
      />

      {/* Layer 1: SVG circuit board */}
      <svg
        aria-hidden
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <defs>
          <filter id="circuitGlow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal ledger tracks */}
        <line x1={0} y1={180} x2={1440} y2={180} stroke="rgba(139,105,20,0.08)" strokeWidth={1} />
        <line x1={0} y1={260} x2={1440} y2={260} stroke="rgba(139,105,20,0.06)" strokeWidth={1} />
        <line x1={0} y1={370} x2={1440} y2={370} stroke="rgba(139,105,20,0.10)" strokeWidth={1.5} />
        <line x1={0} y1={480} x2={1440} y2={480} stroke="rgba(139,105,20,0.06)" strokeWidth={1} />
        <line x1={0} y1={560} x2={1440} y2={560} stroke="rgba(139,105,20,0.08)" strokeWidth={1} />

        {/* Vertical connector tracks */}
        <line x1={180} y1={0} x2={180} y2={900} stroke="rgba(139,105,20,0.05)" strokeWidth={1} />
        <line x1={440} y1={0} x2={440} y2={900} stroke="rgba(139,105,20,0.05)" strokeWidth={1} />
        <line x1={720} y1={0} x2={720} y2={900} stroke="rgba(139,105,20,0.07)" strokeWidth={1} />
        <line x1={1000} y1={0} x2={1000} y2={900} stroke="rgba(139,105,20,0.05)" strokeWidth={1} />
        <line x1={1260} y1={0} x2={1260} y2={900} stroke="rgba(139,105,20,0.05)" strokeWidth={1} />

        {/* Routing traces */}
        <path d="M 0 180 L 180 180 L 180 370 L 440 370" fill="none" stroke="rgba(139,105,20,0.18)" strokeWidth={1.5} />
        <path d="M 0 560 L 180 560 L 180 480 L 440 480" fill="none" stroke="rgba(139,105,20,0.14)" strokeWidth={1.2} />
        <path d="M 1440 260 L 1260 260 L 1260 370 L 1000 370" fill="none" stroke="rgba(139,105,20,0.18)" strokeWidth={1.5} />
        <path d="M 1440 480 L 1260 480 L 1260 560 L 1000 560" fill="none" stroke="rgba(139,105,20,0.14)" strokeWidth={1.2} />
        <path d="M 440 370 L 720 370" fill="none" stroke="rgba(196,30,30,0.25)" strokeWidth={1.5} />
        <path d="M 720 370 L 1000 370" fill="none" stroke="rgba(196,30,30,0.25)" strokeWidth={1.5} />

        {/* Junction nodes */}
        {goldNode(180, 180)}
        {goldNode(180, 370)}
        {redNode(440, 370)}
        {/* Intelligence hub */}
        <g filter="url(#circuitGlow)">
          <circle cx={720} cy={370} r={6} stroke="rgba(196,30,30,0.50)" strokeWidth={1.5} fill="none" />
          <circle cx={720} cy={370} r={3} fill="rgba(196,30,30,0.80)" />
        </g>
        {redNode(1000, 370)}
        {goldNode(1260, 260)}
        {goldNode(180, 560, 0.3)}
        {goldNode(440, 480, 0.3)}
        {goldNode(1260, 480, 0.3)}
        {goldNode(1000, 560, 0.3)}

        {/* Particle 1 — red, main rail */}
        <circle r={3} fill="rgba(196,30,30,0.9)" filter="url(#circuitGlow)">
          <animateMotion dur="4s" repeatCount="indefinite" path="M 0,370 L 440,370 L 720,370 L 1000,370 L 1440,370" />
          <animate attributeName="opacity" values="0;1;1;1;0" dur="4s" repeatCount="indefinite" />
        </circle>

        {/* Particle 2 — gold, left branch */}
        <circle r={2.5} fill="rgba(139,105,20,0.9)" filter="url(#circuitGlow)">
          <animateMotion dur="6s" repeatCount="indefinite" path="M 0,180 L 180,180 L 180,370 L 440,370" />
          <animate attributeName="opacity" values="0;0;1;1;1;0" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* Particle 3 — gold, right branch */}
        <circle r={2.5} fill="rgba(139,105,20,0.80)" filter="url(#circuitGlow)">
          <animateMotion dur="5s" begin="2s" repeatCount="indefinite" path="M 1440,260 L 1260,260 L 1260,370 L 1000,370" />
          <animate attributeName="opacity" values="0;1;1;1;0" dur="5s" begin="2s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Layer 2: vignette */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 60% 80% at 50% 50%, transparent 0%, rgba(16,8,6,0.70) 100%), linear-gradient(90deg, rgba(16,8,6,0.90) 0%, transparent 15%, transparent 85%, rgba(16,8,6,0.90) 100%), linear-gradient(180deg, rgba(16,8,6,0.80) 0%, transparent 18%, transparent 82%, rgba(16,8,6,0.95) 100%)",
        }}
      />

      {/* Layer 3: grain */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          opacity: 0.022,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px",
        }}
      />
    </>
  );
}
