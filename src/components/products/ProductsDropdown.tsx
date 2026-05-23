import { motion, AnimatePresence } from "framer-motion";
import { Clock, Bot, Lightbulb, UserCheck, X, type LucideIcon } from "lucide-react";
import { SUITES } from "@/data/suiteStatus";

const COLORS = {
  panelBg: "#1A1008",
  panelBgAlt: "#1F0E07",
  border: "rgba(244,237,218,0.08)",
  text: "#F4EDDA",
  textDim: "rgba(244,237,218,0.55)",
  red: "#C41E1E",
  gold: "#8B6914",
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
          background: "rgba(8,40,24,0.85)",
          border: "1px solid rgba(26,158,100,0.4)",
          padding: "3px 9px 3px 8px",
          borderRadius: 999,
          fontFamily: "'Sora', sans-serif",
          fontSize: 10,
          fontWeight: 500,
          color: "rgba(26,158,100,0.95)",
          textTransform: "uppercase",
          letterSpacing: 0.8,
          lineHeight: 1,
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "rgba(26,158,100,0.95)",
            boxShadow: "0 0 6px rgba(26,158,100,0.7)",
            animation: "fyn-dropdown-pulse 1.4s ease-in-out infinite",
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
        background: "rgba(139,105,20,0.12)",
        border: "1px solid rgba(139,105,20,0.4)",
        padding: "3px 9px 3px 8px",
        borderRadius: 999,
        fontFamily: "'Sora', sans-serif",
        fontSize: 10,
        fontWeight: 500,
        color: "rgba(139,105,20,0.95)",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        lineHeight: 1,
      }}
    >
      <Clock size={10} />
      Soon
    </span>
  );
}

interface Row {
  id: string;
  name: string;
  description: string;
  status: "live" | "coming_soon";
  Icon: LucideIcon;
  onClick: () => void;
}

function ItemRow({ row, index }: { row: Row; index: number }) {
  return (
    <motion.button
      type="button"
      onClick={row.onClick}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.03, duration: 0.2, ease: "easeOut" }}
      className="fyn-intel-row"
    >
      <div className="fyn-intel-node">
        <row.Icon size={18} color={COLORS.text} strokeWidth={1.8} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0, flex: 1, textAlign: "left" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            fontFamily: "'Sora', sans-serif",
            fontWeight: 600,
            fontSize: 14,
            color: COLORS.text,
            letterSpacing: -0.1,
            lineHeight: 1.25,
          }}
        >
          <span>{row.name}</span>
          <StatusBadge status={row.status} />
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: "'Sora', sans-serif",
            fontWeight: 300,
            fontSize: 12.5,
            color: COLORS.textDim,
            lineHeight: 1.45,
          }}
        >
          {row.description}
        </p>
      </div>
    </motion.button>
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
  onSelectIntelligence,
  onSelectPlatform,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const intelRows: Row[] = intelligenceItems.map((it) => {
    const suite = SUITES.find((s) => s.id === it.id);
    return {
      ...it,
      Icon: suite?.Icon ?? Bot,
      onClick: () => onSelectIntelligence(it.id),
    };
  });
  const platRows: Row[] = platformItems.map((it) => ({
    ...it,
    Icon: PLATFORM_ICONS[it.id] ?? Bot,
    onClick: () => onSelectPlatform(it.id),
  }));

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            key="fyn-products-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="lg:hidden"
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 999,
            }}
          />

          {/* Desktop dropdown panel */}
          <motion.div
            key="fyn-products-dropdown"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="hidden lg:block"
            style={{
              position: "absolute",
              top: 72,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1000,
              width: "min(1080px, 95vw)",
            }}
            role="menu"
          >
            <div className="fyn-products-panel">
              <div className="fyn-dropdown-headers">
                <div className="fyn-dropdown-header">Intelligence Suites</div>
                <div className="fyn-dropdown-header">Platform Features</div>
              </div>
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
          </motion.div>

          {/* Mobile full-screen drawer */}
          <motion.div
            key="fyn-products-mobile"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: COLORS.panelBg,
              zIndex: 1000,
              overflowY: "auto",
              padding: "72px 20px 32px",
            }}
            role="menu"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                width: 40,
                height: 40,
                borderRadius: 999,
                border: `1px solid ${COLORS.border}`,
                background: "rgba(244,237,218,0.04)",
                color: COLORS.text,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={18} />
            </button>
            <div style={{ marginBottom: 20 }}>
              <div className="fyn-dropdown-header">Intelligence Suites</div>
            </div>
            <div className="fyn-dropdown-col">
              {intelRows.map((row, i) => (
                <ItemRow key={row.id} row={row} index={i} />
              ))}
            </div>
            <div style={{ margin: "28px 0 16px" }}>
              <div className="fyn-dropdown-header">Platform Features</div>
            </div>
            <div className="fyn-dropdown-col">
              {platRows.map((row, i) => (
                <ItemRow key={row.id} row={row} index={i + intelRows.length} />
              ))}
            </div>
          </motion.div>

          <style>{`
            .fyn-products-panel {
              position: relative;
              background: ${COLORS.panelBg};
              background-image: linear-gradient(180deg, ${COLORS.panelBgAlt} 0%, ${COLORS.panelBg} 100%);
              border: 1px solid ${COLORS.border};
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 24px 64px rgba(0,0,0,0.5);
            }
            .fyn-dropdown-headers {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 48px;
              padding: 24px 32px 16px;
            }
            .fyn-dropdown-header {
              font-family: 'Sora', sans-serif;
              font-weight: 600;
              font-size: 11px;
              letter-spacing: 1.5px;
              color: ${COLORS.textDim};
              text-transform: uppercase;
            }
            .fyn-dropdown-grid {
              position: relative;
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 32px;
              padding: 0 24px 24px;
            }
            .fyn-dropdown-col { display: flex; flex-direction: column; gap: 2px; }
            .fyn-dropdown-divider {
              position: absolute; top: 0; bottom: 16px; left: 50%;
              width: 1px;
              background: ${COLORS.border};
              pointer-events: none;
            }
            .fyn-intel-row {
              display: flex;
              align-items: flex-start;
              gap: 14px;
              width: 100%;
              padding: 12px 14px;
              border-radius: 10px;
              background: transparent;
              border: none;
              border-left: 2px solid transparent;
              cursor: pointer;
              transition: background 180ms ease, border-color 180ms ease;
            }
            .fyn-intel-row:hover {
              background: rgba(244,237,218,0.04);
              border-left-color: ${COLORS.red};
            }
            .fyn-intel-node {
              width: 36px; height: 36px;
              flex-shrink: 0;
              border-radius: 9px;
              background: rgba(244,237,218,0.04);
              border: 1px solid ${COLORS.border};
              display: flex; align-items: center; justify-content: center;
              transition: background 180ms ease, border-color 180ms ease;
            }
            .fyn-intel-row:hover .fyn-intel-node {
              background: rgba(196,30,30,0.12);
              border-color: rgba(196,30,30,0.4);
            }
            @keyframes fyn-dropdown-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.4); opacity: 0.5; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
