import { motion } from "framer-motion";
import { FYN } from "./widgets/Shared";

export function StatusBadge({ status, small = false }: { status: "live" | "coming_soon"; small?: boolean }) {
  const isLive = status === "live";
  return (
    <span
      className={isLive ? "fyn-badge-live" : ""}
      style={{
        background: isLive ? FYN.green : FYN.grayDev,
        color: FYN.white,
        padding: small ? "2px 6px" : "3px 9px",
        borderRadius: 12,
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 700,
        fontSize: small ? 9 : 10,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {isLive ? "Live" : "Soon"}
    </span>
  );
}

interface ItemProps {
  name: string;
  description?: string;
  status: "live" | "coming_soon";
  onSelect: () => void;
}

function Item({ name, description, status, onSelect }: ItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="fyn-product-item"
      style={{
        display: "block",
        width: "100%",
        textAlign: "left",
        padding: "10px 14px",
        borderRadius: 8,
        background: "transparent",
        border: "none",
        borderLeft: "3px solid transparent",
        cursor: "pointer",
        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span
          style={{
            fontFamily: "'Raleway', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: FYN.ink,
            flex: 1,
            lineHeight: 1.3,
          }}
        >
          {name}
        </span>
        <StatusBadge status={status} small />
      </div>
      {description && (
        <p
          style={{
            margin: "4px 0 0",
            fontFamily: "'Roboto', sans-serif",
            fontSize: 12,
            color: FYN.gray,
            lineHeight: 1.45,
          }}
        >
          {description}
        </p>
      )}
    </button>
  );
}

interface Props {
  open: boolean;
  intelligenceItems: { id: string; name: string; description: string; status: "live" | "coming_soon" }[];
  businessItems: { name: string; status: "live" | "coming_soon" }[];
  platformItems: { id: string; name: string; description: string; status: "live" | "coming_soon" }[];
  onSelectIntelligence: (id: string) => void;
  onSelectBusiness: (idx: number) => void;
  onSelectPlatform: (id: string) => void;
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export default function ProductsDropdown({
  open,
  intelligenceItems,
  businessItems,
  platformItems,
  onSelectIntelligence,
  onSelectBusiness,
  onSelectPlatform,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  return (
    <motion.div
      initial={false}
      animate={
        open
          ? { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" as const }
          : { opacity: 0, y: -10, scale: 0.98, pointerEvents: "none" as const }
      }
      transition={
        open
          ? { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }
          : { duration: 0.2, ease: [0.4, 0, 1, 1] }
      }
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="hidden lg:block"
      style={{
        position: "absolute",
        top: 72,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        width: "min(960px, calc(100vw - 48px))",
      }}
      aria-hidden={!open}
      role="menu"
    >
      <div
        style={{
          background: FYN.white,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(196,30,30,0.2)",
          padding: 28,
          border: "1px solid rgba(196,30,30,0.08)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr", gap: 28 }}>
          <div>
            <ColHeader>Intelligence Suites</ColHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {intelligenceItems.map((m) => (
                <Item
                  key={m.id}
                  name={m.name}
                  description={m.description}
                  status={m.status}
                  onSelect={() => onSelectIntelligence(m.id)}
                />
              ))}
            </div>
          </div>

          <div>
            <ColHeader>Platform Features</ColHeader>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {platformItems.map((f) => (
                <Item
                  key={f.id}
                  name={f.name}
                  description={f.description}
                  status={f.status}
                  onSelect={() => onSelectPlatform(f.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "'Raleway', sans-serif",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: 1.4,
        textTransform: "uppercase",
        color: FYN.gray,
        margin: "0 0 14px 0",
      }}
    >
      {children}
    </p>
  );
}
