import { useState } from "react";
import { Upload, Shield, Users } from "lucide-react";

/* ============================================================
   FynHelp — Integrations
   Inter only · backend stubbed with // BACKEND NEEDED comments
   ============================================================ */

const PAGE_WRAP: React.CSSProperties = {
  maxWidth: 900,
  margin: "0 auto",
  padding: "40px 48px",
  fontFamily: "'Inter', sans-serif",
};

const CARD: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #D4C9A8",
  borderRadius: 10,
  padding: 28,
  marginBottom: 24,
};

const SectionTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <>
    <h2 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 16, color: "#1A1008", marginBottom: 4 }}>{title}</h2>
    {sub && <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.55)", marginBottom: 24 }}>{sub}</p>}
  </>
);

const StatusChip = ({ kind }: { kind: "connected" | "disconnected" | "active" }) => {
  const styles = {
    connected: { bg: "#F0FDF4", color: "#166534", border: "#A7F3D0", dot: "#16A34A", label: "CONNECTED" },
    disconnected: { bg: "#FAF7F0", color: "rgba(26,16,8,0.45)", border: "#D4C9A8", dot: "transparent", label: "NOT CONNECTED" },
    active: { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE", dot: "#3B82F6", label: "ACTIVE" },
  }[kind];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`,
      borderRadius: 100, padding: "3px 10px",
      fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11,
    }}>
      {styles.dot !== "transparent" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: styles.dot }} />}
      {styles.label}
    </span>
  );
};

const ConnectBtn = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#C41E1E",
      background: "#FDF2F1", border: "1px solid rgba(196,30,30,0.20)",
      borderRadius: 6, padding: "7px 14px", cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, color = "#C41E1E" }: { children: React.ReactNode; onClick?: () => void; color?: string }) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, color,
      background: "transparent", border: "none", cursor: "pointer", padding: 0,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
  >
    {children}
  </button>
);

const Row = ({
  initial, initialBg, name, method, sub, status, action, isLast, expanded,
}: {
  initial: string; initialBg: string; name: string; method: string; sub?: string;
  status: React.ReactNode; action?: React.ReactNode; isLast?: boolean; expanded?: React.ReactNode;
}) => (
  <div style={{ borderBottom: isLast ? "none" : "1px solid #F0EBD8" }}>
    <div style={{ display: "flex", alignItems: "center", minHeight: 68, gap: 12 }}>
      <div style={{
        width: 28, height: 28, borderRadius: "50%", background: initialBg, color: "#FFFFFF",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 11, marginRight: 8, flexShrink: 0,
      }}>{initial}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#1A1008" }}>{name}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.50)" }}>{method}</div>
        {sub && <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 11, color: "rgba(26,16,8,0.45)", marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {status}
        {action}
      </div>
    </div>
    {expanded}
  </div>
);

const IntegrationsPage = () => {
  const [tallyExpanded, setTallyExpanded] = useState(false);
  const [busyExpanded, setBusyExpanded] = useState(false);
  const [tallyChecks, setTallyChecks] = useState([false, false, false]);

  // BACKEND NEEDED: SELECT COUNT(*) FROM integrations WHERE business_id = auth AND status = 'connected'
  const connectedCount = 3;
  const totalCount = 8;
  const pct = Math.round((connectedCount / totalCount) * 100);

  return (
    <div style={PAGE_WRAP}>
      {/* Page header */}
      <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Integrations</h1>
      <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 15, color: "rgba(26,16,8,0.60)", marginTop: 6 }}>
        Connect FynHelp to your banks, accounting software, payroll tools, and GST systems.
      </p>

      {/* Connected summary strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 8,
        padding: "14px 20px", margin: "24px 0 32px",
      }}>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#166534" }}>
          {connectedCount} of {totalCount} integrations connected
        </span>
        <div style={{ flex: 1, maxWidth: 200, height: 6, background: "#D1FAE5", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#16A34A", transition: "width 300ms" }} />
        </div>
        <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "#166534" }}>
          Add more to improve AI CFO Nidhi's accuracy
        </span>
      </div>

      {/* SECTION 1: BANKING */}
      <div style={CARD}>
        <SectionTitle title="Banking" sub="Connect your bank accounts via RBI's Account Aggregator. Your login credentials are never shared." />

        <Row
          initial="H" initialBg="#004C8F" name="HDFC Bank" method="Account Aggregator"
          sub="Last synced 12 min ago · ₹12.4L balance"
          status={<StatusChip kind="connected" />}
          action={<GhostBtn>Disconnect</GhostBtn>}
        />
        {/* BACKEND: POST /api/integrations/aa/initiate { bank_id: 'icici', business_id } */}
        <Row initial="I" initialBg="#F37920" name="ICICI Bank" method="Account Aggregator"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} />
        <Row initial="S" initialBg="#22409A" name="SBI" method="Account Aggregator"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} />
        <Row initial="A" initialBg="#97144D" name="Axis Bank" method="Account Aggregator"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} />
        <Row initial="K" initialBg="#003366" name="Kotak Mahindra Bank" method="Account Aggregator"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} isLast />

        <div style={{ marginTop: 16 }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer", padding: 0,
            fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 13, color: "#C41E1E",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            <Upload size={14} /> Upload PDF bank statement instead
          </button>
        </div>
      </div>

      {/* SECTION 2: ACCOUNTING */}
      <div style={CARD}>
        <SectionTitle title="Accounting Software" sub="Sync your invoices, bills, and ledger data automatically." />

        <Row
          initial="T" initialBg="#0078D4" name="Tally Prime" method="ODBC Agent"
          status={<StatusChip kind="disconnected" />}
          action={<ConnectBtn onClick={() => setTallyExpanded(!tallyExpanded)}>Set up Tally →</ConnectBtn>}
          expanded={tallyExpanded && (
            <div style={{ background: "#FAF7F0", borderTop: "1px solid #F0EBD8", padding: "16px 20px", marginTop: 4, borderRadius: 6 }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#1A1008", marginBottom: 10 }}>Requirements:</p>
              {["Tally Prime 2.0 or higher installed", "Administrator access on that computer", "Tally is currently open"].map((req, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={tallyChecks[i]} onChange={() => {
                    const c = [...tallyChecks]; c[i] = !c[i]; setTallyChecks(c);
                  }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1A1008" }}>{req}</span>
                </label>
              ))}
              {/* BACKEND: Supabase Storage signed URL — GET /api/resources/tally-agent-download */}
              <button style={{
                width: "100%", marginTop: 12, padding: "10px 14px",
                background: "#FFFFFF", border: "1px solid #D4C9A8", borderRadius: 6,
                fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13, color: "#1A1008", cursor: "pointer",
              }}>Download ODBC Agent (Windows · 2.3MB)</button>
              {/* BACKEND: POST /api/integrations/tally/test → { connected, version } */}
              <button style={{
                width: "100%", marginTop: 12, padding: "10px 14px",
                background: "#C41E1E", border: "none", borderRadius: 6,
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, color: "#FFFFFF", cursor: "pointer",
              }}>Test Connection</button>
            </div>
          )}
        />
        {/* BACKEND: GET /api/integrations/zoho/oauth-url */}
        <Row initial="Z" initialBg="#E42528" name="Zoho Books" method="OAuth 2.0"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect Zoho Books →</ConnectBtn>} />
        {/* BACKEND: GET /api/integrations/quickbooks/oauth-url */}
        <Row initial="Q" initialBg="#2CA01C" name="QuickBooks India" method="OAuth 2.0"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect QuickBooks →</ConnectBtn>} />
        <Row
          initial="B" initialBg="#1E40AF" name="Busy Accounting" method="CSV Upload"
          status={<StatusChip kind="disconnected" />}
          action={<ConnectBtn onClick={() => setBusyExpanded(!busyExpanded)}>Upload Busy export →</ConnectBtn>}
          isLast
          expanded={busyExpanded && (
            <div style={{ padding: "16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {["Ledger Report CSV", "Outstanding Report CSV"].map((label, i) => (
                <div key={i} style={{
                  border: "1.5px dashed #D4C9A8", borderRadius: 8, height: 70,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", background: "#FAF7F0",
                }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 12, color: "#1A1008" }}>{label}</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.40)", marginTop: 2 }}>Drop file or click to browse</span>
                </div>
              ))}
              {/* BACKEND: POST /api/integrations/busy/import */}
              <button disabled style={{
                gridColumn: "1 / -1", padding: "10px 14px", background: "#E0D9C8",
                border: "none", borderRadius: 6, color: "rgba(26,16,8,0.40)",
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14, cursor: "not-allowed",
              }}>Import data</button>
            </div>
          )}
        />
      </div>

      {/* SECTION 3: PAYROLL */}
      <div style={CARD}>
        <SectionTitle title="Payroll & HR" sub="Sync payroll data for HR Intelligence and payroll cash planning." />
        {/* BACKEND: GET /api/integrations/keka/oauth-url */}
        <Row initial="K" initialBg="#5E35B1" name="Keka HR" method="OAuth API"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} />
        <Row initial="G" initialBg="#16A34A" name="GreytHR" method="OAuth API"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} />
        <Row initial="R" initialBg="#0F172A" name="Razorpay Payroll" method="OAuth API"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} />
        <Row initial="M" initialBg="#8B6914" name="Manual Payroll Entry" method="Always available"
          sub="Enter payroll data manually each month from the Payroll Planner page"
          status={<StatusChip kind="active" />} isLast />
      </div>

      {/* SECTION 4: GST & COMPLIANCE */}
      <div style={CARD}>
        <SectionTitle title="GST & Compliance" />
        {/* BACKEND: show actual GSTIN from businesses table */}
        <Row initial="G" initialBg="#166534" name="GST Portal via GSP" method="Direct API"
          sub="Connected via Masters India GSP · GSTIN: 27AABCM1234F1Z5"
          status={<span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#F0FDF4", color: "#166534", border: "1px solid #A7F3D0",
            borderRadius: 100, padding: "3px 10px",
            fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 11,
          }}>● Active · GSP Partner</span>}
          action={<GhostBtn>Update GSTIN</GhostBtn>}
        />
        {/* BACKEND: POST /api/integrations/traces/connect */}
        <Row initial="T" initialBg="#1E40AF" name="TRACES (TDS)" method="Read-only"
          sub="Required for 26AS reconciliation"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} />
        <Row initial="M" initialBg="#7C2D12" name="MCA/ROC Portal" method="Read-only"
          sub="Required for governance intelligence"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn>Connect →</ConnectBtn>} isLast />
      </div>

      {/* SECTION 5: COMMUNICATION */}
      <div style={CARD}>
        <SectionTitle title="Alerts & Communication" />
        {/* BACKEND: POST /api/integrations/whatsapp/verify */}
        <Row initial="W" initialBg="#25D366" name="WhatsApp Business" method="Meta API"
          sub="+91-9876543210 · Briefs + alerts active"
          status={<StatusChip kind="connected" />} action={<GhostBtn>Disconnect</GhostBtn>} />
        <Row initial="E" initialBg="#1A1008" name="Email" method="Always active"
          sub="tarun@mehtatextile.com"
          status={<StatusChip kind="active" />} action={<GhostBtn>Change email</GhostBtn>} isLast />
      </div>
    </div>
  );
};

export default IntegrationsPage;
