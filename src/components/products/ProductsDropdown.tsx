import { motion, AnimatePresence } from "framer-motion";
import { Clock, Bot, Lightbulb, UserCheck, type LucideIcon } from "lucide-react";
import { SUITES } from "@/data/suiteStatus";

const COLORS = {
  terracotta: "#C41E1E",
  terracottaLight: "#E85D5D",
  darkBrown: "#3D2817",
  deepBrown: "#1a1412",
};

const PLATFORM_ICONS: Record<string, LucideIcon> = {
  nidhi: Bot,
  "decision-simulator": Lightbulb,
  "ca-partner-feature": UserCheck,
};

export function StatusBadge({ status }: { status: "live" | "coming_soon"; small?: boolean }) {
  if (status === "live") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "rgba(0,0,0,0.85)",
          border: `1px solid ${COLORS.terracotta}66`,
          padding: "4px 10px 4px 8px",
          borderRadius: 6,
          boxShadow: `0 0 8px ${COLORS.terracotta}4D`,
          fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
          fontSize: 10,
          fontWeight: 700,
          color: "#fff",
          textTransform: "uppercase",
          letterSpacing: 0.5,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: COLORS.terracotta,
            animation: "fyn-dropdown-pulse 0.8s ease-in-out infinite",
          }}
        />
        Live
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "rgba(0,0,0,0.7)",
        border: "1px solid rgba(255,255,255,0.15)",
        padding: "4px 10px 4px 8px",
        borderRadius: 6,
        fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
        fontSize: 10,
        fontWeight: 700,
        color: "rgba(255,255,255,0.7)",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        lineHeight: 1,
      }}
    >
      <Clock size={10} style={{ opacity: 0.7 }} />
      Soon
    </span>
  );
}

function IntelNode({ Icon }: { Icon: LucideIcon }) {
  return (
    <div className="fyn-intel-node">
      <div className="fyn-intel-node-glow" />
      <div className="fyn-intel-node-base">
        <div className="fyn-intel-node-scan" />
        <Icon
          size={22}
          color="#fff"
          strokeWidth={2}
          style={{
            position: "relative",
            zIndex: 2,
            filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
          }}
        />
      </div>
      <div className="fyn-intel-node-orbit">
        <span style={{ ["--i" as never]: 0 }} />
        <span style={{ ["--i" as never]: 1 }} />
        <span style={{ ["--i" as never]: 2 }} />
      </div>
    </div>
  );
}

interface Row {
  id: string;
  name: string;
  description: string;
  status: "live" | "coming_soon";
  Icon: LucideIcon;
}

function ItemRow({ row, index }: { row: Row; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.04, duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
      className="fyn-intel-row"
    >
      <IntelNode Icon={row.Icon} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            fontFamily: "'Inter', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: COLORS.deepBrown,
            letterSpacing: -0.2,
            lineHeight: 1.2,
          }}
        >
          <span>{row.name}</span>
          <StatusBadge status={row.status} />
        </div>
        <p
          className="fyn-intel-desc"
          style={{
            margin: 0,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 400,
            fontSize: 13,
            color: "rgba(26,20,18,0.65)",
            lineHeight: 1.5,
            maxWidth: 420,
          }}
        >
          {row.description}
        </p>
      </div>
    </motion.div>
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
  platformItems,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const intelRows: Row[] = intelligenceItems.map((it) => {
    const suite = SUITES.find((s) => s.id === it.id);
    return { ...it, Icon: suite?.Icon ?? Bot };
  });
  const platRows: Row[] = platformItems.map((it) => ({
    ...it,
    Icon: PLATFORM_ICONS[it.id] ?? Bot,
  }));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="fyn-products-dropdown"
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -6 }}
          transition={{ duration: 0.28, ease: [0.34, 1.56, 0.64, 1] }}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="hidden lg:block"
          style={{
            position: "absolute",
            top: 72,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            width: "min(1100px, 95vw)",
          }}
          role="menu"
        >
          <div className="fyn-products-panel">
            {/* Top accent bar */}
            <div className="fyn-accent-bar">
              <span style={{ animationDelay: "0s" }} />
              <span style={{ animationDelay: "1s" }} />
              <span style={{ animationDelay: "2s" }} />
            </div>

            {/* Headers */}
            <div className="fyn-dropdown-headers">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.2 }}
                className="fyn-dropdown-header"
              >
                Intelligence Suites
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
                className="fyn-dropdown-header"
              >
                Platform Features
              </motion.div>
            </div>

            {/* Content grid */}
            <div className="fyn-dropdown-grid">
              <div className="fyn-dropdown-col">
                {intelRows.map((row, i) => (
                  <ItemRow key={row.id} row={row} index={i} />
                ))}
              </div>
              <div className="fyn-dropdown-col">
                {platRows.map((row, i) => (
                  <ItemRow key={row.id} row={row} index={i} />
                ))}
              </div>
              <div className="fyn-dropdown-divider" aria-hidden />
            </div>
          </div>

          <style>{`
            .fyn-products-panel {
              position: relative;
              background: rgba(255,255,255,0.97);
              backdrop-filter: blur(24px) saturate(110%);
              -webkit-backdrop-filter: blur(24px) saturate(110%);
              border: 1px solid rgba(61,40,23,0.08);
              border-radius: 20px;
              overflow-x: hidden;
              overflow-y: auto;
              max-height: calc(100vh - 120px);
              scroll-behavior: smooth;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: thin;
              scrollbar-color: rgba(196,30,30,0.3) rgba(61,40,23,0.05);
              overscroll-behavior: contain;
              contain: layout style paint;
              box-shadow:
                inset 0 2px 0 rgba(0,0,0,0.02),
                0 8px 16px rgba(0,0,0,0.08),
                0 20px 40px rgba(0,0,0,0.12),
                0 40px 80px rgba(61,40,23,0.06);
              background-image:
                radial-gradient(circle, rgba(61,40,23,0.04) 1px, transparent 1px);
              background-size: 20px 20px;
              background-position: 0 0;
              background-color: rgba(255,255,255,0.97);
            }
            .fyn-products-panel::-webkit-scrollbar { width: 8px; }
            .fyn-products-panel::-webkit-scrollbar-track {
              background: rgba(61,40,23,0.05);
              border-radius: 4px;
            }
            .fyn-products-panel::-webkit-scrollbar-thumb {
              background: rgba(196,30,30,0.3);
              border-radius: 4px;
              transition: background 0.2s ease;
            }
            .fyn-products-panel::-webkit-scrollbar-thumb:hover {
              background: rgba(196,30,30,0.5);
            }
            @media (max-height: 899px) {
              .fyn-products-panel { max-height: calc(100vh - 100px); }
            }
            @media (max-height: 699px) {
              .fyn-products-panel { max-height: calc(100vh - 80px); }
            }
            @media (prefers-reduced-motion: reduce) {
              .fyn-products-panel { scroll-behavior: auto; }
            }
            .fyn-accent-bar {
              position: absolute; top: 0; left: 0; right: 0; height: 3px;
              background: linear-gradient(90deg, ${COLORS.terracotta} 0%, ${COLORS.terracottaLight} 50%, ${COLORS.terracotta} 100%);
              overflow: hidden;
            }
            .fyn-accent-bar span {
              position: absolute; top: 50%; transform: translateY(-50%);
              width: 4px; height: 4px; border-radius: 50%;
              background: rgba(255,255,255,0.85);
              animation: fyn-accent-stream 3s linear infinite;
            }
            @keyframes fyn-accent-stream {
              0% { left: -10px; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { left: calc(100% + 10px); opacity: 0; }
            }
            .fyn-dropdown-headers {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 80px;
              padding: 32px 40px 24px;
            }
            .fyn-dropdown-header {
              position: relative;
              font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
              font-weight: 700;
              font-size: 11px;
              letter-spacing: 1.5px;
              color: rgba(61,40,23,0.6);
              text-transform: uppercase;
              padding-bottom: 8px;
            }
            .fyn-dropdown-header::after {
              content: '';
              position: absolute; bottom: 0; left: 0;
              width: 40px; height: 2px;
              background: ${COLORS.terracotta};
            }
            .fyn-dropdown-grid {
              position: relative;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 80px;
              padding: 0 40px 40px;
            }
            .fyn-dropdown-col { display: flex; flex-direction: column; }
            .fyn-dropdown-divider {
              position: absolute; top: 8px; bottom: 16px; left: 50%;
              width: 1px;
              transform: translateX(-50%);
              background: linear-gradient(180deg, transparent 0%, rgba(61,40,23,0.1) 20%, rgba(61,40,23,0.1) 80%, transparent 100%);
              pointer-events: none;
            }
            .fyn-intel-row {
              display: flex;
              align-items: flex-start;
              padding: 14px 16px;
              border-radius: 12px;
              transition: background 0.3s ease;
              cursor: default;
            }
            .fyn-intel-row + .fyn-intel-row { margin-top: 4px; }
            .fyn-intel-row:hover {
              background: rgba(196,30,30,0.03);
            }
            .fyn-intel-row:hover .fyn-intel-desc { opacity: 1; }
            .fyn-intel-row:hover .fyn-intel-node-glow { opacity: 1; }
            .fyn-intel-row:hover .fyn-intel-node-base { transform: scale(1.05); }
            .fyn-intel-row:hover .fyn-intel-node-scan { opacity: 1; animation: fyn-scan 1.6s ease-in-out infinite; }
            .fyn-intel-row:hover .fyn-intel-node-orbit { animation-duration: 2s; }

            .fyn-intel-desc { opacity: 0.85; transition: opacity 0.3s ease; }

            .fyn-intel-node {
              position: relative;
              width: 50px; height: 50px;
              flex-shrink: 0;
              margin-right: 16px;
              display: flex; align-items: center; justify-content: center;
            }
            .fyn-intel-node-glow {
              position: absolute; inset: -12px;
              background: radial-gradient(circle, rgba(196,30,30,0.18), transparent 70%);
              filter: blur(14px);
              opacity: 0.6;
              transition: opacity 0.4s ease;
              z-index: 0;
            }
            .fyn-intel-node-base {
              position: relative;
              width: 50px; height: 50px;
              border-radius: 12px;
              background: linear-gradient(135deg, rgba(61,40,23,0.96) 0%, rgba(26,20,18,0.96) 100%);
              border: 1px solid rgba(196,30,30,0.35);
              display: flex; align-items: center; justify-content: center;
              transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
              z-index: 1;
              overflow: hidden;
              box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.08),
                0 4px 10px rgba(26,20,18,0.4);
            }
            .fyn-intel-node-base::before {
              content: '';
              position: absolute; inset: -1px;
              border-radius: 13px;
              background: linear-gradient(135deg, ${COLORS.terracotta} 0%, ${COLORS.terracottaLight} 100%);
              opacity: 0.4;
              z-index: -1;
            }
            .fyn-intel-node-scan {
              position: absolute; left: 0; right: 0; top: 0;
              height: 1px;
              background: linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent);
              opacity: 0;
              z-index: 3;
            }
            @keyframes fyn-scan {
              0% { transform: translateY(0); }
              100% { transform: translateY(50px); }
            }
            .fyn-intel-node-orbit {
              position: absolute; inset: -6px;
              animation: fyn-orbit 4s linear infinite;
              z-index: 1;
              pointer-events: none;
            }
            .fyn-intel-node-orbit span {
              position: absolute;
              top: 50%; left: 50%;
              width: 2px; height: 2px; border-radius: 50%;
              background: rgba(196,30,30,0.7);
              transform: rotate(calc(var(--i) * 120deg)) translate(31px) rotate(calc(var(--i) * -120deg));
              transform-origin: 0 0;
              margin: -1px 0 0 -1px;
            }
            @keyframes fyn-orbit {
              from { transform: rotate(0); }
              to { transform: rotate(360deg); }
            }
            @keyframes fyn-dropdown-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.3); opacity: 0.6; }
            }

            @media (max-width: 1199px) {
              .fyn-dropdown-headers, .fyn-dropdown-grid { gap: 48px; }
              .fyn-intel-node, .fyn-intel-node-base { width: 44px; height: 44px; }
            }
            @media (max-width: 767px) {
              .fyn-dropdown-headers, .fyn-dropdown-grid {
                grid-template-columns: 1fr;
                gap: 24px;
                padding-left: 24px; padding-right: 24px;
              }
              .fyn-dropdown-divider { display: none; }
              .fyn-intel-node, .fyn-intel-node-base { width: 40px; height: 40px; }
              .fyn-intel-node-orbit { display: none; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
