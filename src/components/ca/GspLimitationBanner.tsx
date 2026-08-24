import { useEffect, useState } from "react";
import { CA } from "@/components/ca/portalUi";

const KEY = "fyn_gsp_banner_dismissed";

/**
 * Honest limitation notice on every CA surface that offers GST filing actions.
 * Dismissal is remembered for the browser session.
 */
export function GspLimitationBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(KEY) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="note"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: "rgba(178,107,0,0.10)",
        border: `0.5px solid rgba(178,107,0,0.35)`,
        borderRadius: 10,
        padding: "12px 14px",
        marginBottom: 16,
        fontFamily: CA.sans,
        fontSize: 13,
        color: CA.ink,
        lineHeight: 1.5,
      }}
    >
      <span style={{ color: CA.amber, fontWeight: 700 }}>Note</span>
      <span style={{ flex: 1 }}>
        FynHelp prepares your return data. Direct GST portal submission requires your DSC/EVC login at gstn.gov.in.
        One-click GSP filing is on our roadmap.
      </span>
      <button
        type="button"
        onClick={() => {
          try {
            window.localStorage.setItem(KEY, "1");
          } catch {
            /* storage unavailable — dismiss for this view only */
          }
          setVisible(false);
        }}
        style={{
          background: "transparent",
          border: "none",
          color: CA.muted,
          cursor: "pointer",
          fontSize: 12,
          fontWeight: 600,
          padding: 0,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}

export default GspLimitationBanner;
