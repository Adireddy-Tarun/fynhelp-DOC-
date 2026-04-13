export default function TickerStrip() {
  const items = [
    "10,000+ Businesses trusting FynHelp",
    "₹2,400 Crore cash runway monitored daily",
    "₹180 Crore ITC recovered",
    "98.7% metric accuracy rate",
    "63 Million Indian SMEs we're building for",
    "4-minute average time to first insight",
  ];

  const tickerContent = items.join(" · ");

  return (
    <section className="bg-fyn-red py-3 overflow-hidden">
      <div className="ticker-scroll whitespace-nowrap">
        <span className="text-white font-medium text-sm">
          {tickerContent} · {tickerContent} · {tickerContent} ·&nbsp;
        </span>
      </div>
    </section>
  );
}
