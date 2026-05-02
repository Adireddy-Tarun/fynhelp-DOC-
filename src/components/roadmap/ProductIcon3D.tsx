import IconGraphic from "./IconGraphics";
import type { RoadmapProduct } from "./roadmapData";

interface Props {
  product: RoadmapProduct;
  size?: number;
  onClick: (p: RoadmapProduct) => void;
}

/**
 * Premium 3D glassmorphic product icon with status badge + tooltip.
 */
export default function ProductIcon3D({ product, size, onClick }: Props) {
  const [from, to] = product.gradient;
  const isLive = product.status === "live";
  const sizeStyle =
    size != null ? { width: size, height: size, borderRadius: size * 0.25 } : undefined;

  return (
    <div
      className="roadmap-icon-wrap"
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        type="button"
        onClick={() => onClick(product)}
        className="roadmap-icon"
        aria-label={`${product.name} — ${isLive ? "Live" : `Coming ${product.quarter}`}`}
        style={{
          background: `linear-gradient(145deg, ${from} 0%, ${to} 100%)`,
          ...sizeStyle,
        }}
      >
        <IconGraphic kind={product.graphic} />
        <span className={isLive ? "roadmap-badge-live" : "roadmap-badge-soon"}>
          {isLive ? "LIVE" : "SOON"}
        </span>
      </button>
      <div className="roadmap-tooltip" role="tooltip">
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: "#F4EDDA",
            marginBottom: 4,
          }}
        >
          {product.name}
        </div>
        <div
          style={{
            fontFamily: "'Roboto', sans-serif",
            fontSize: 12,
            color: "rgba(244,237,218,0.8)",
            lineHeight: 1.4,
            marginBottom: 6,
          }}
        >
          {product.description}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            fontSize: 11,
            color: "#D9A441",
            letterSpacing: 0.4,
            textTransform: "uppercase",
          }}
        >
          {isLive ? "Live now" : `Coming ${product.quarter}`}
        </div>
      </div>
    </div>
  );
}
