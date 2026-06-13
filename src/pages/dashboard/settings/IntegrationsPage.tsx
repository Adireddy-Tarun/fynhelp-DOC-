import { useState, ComponentType } from "react";
import {
  Upload, Landmark, CreditCard, FileSpreadsheet, Users, FileText, Mail,
} from "lucide-react";
import { toast } from "sonner";

/* ============================================================
   FynHelp · Integrations
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
    <h2 style={{ fontWeight: 600, fontSize: 16, color: "#1A1008", marginBottom: 4 }}>{title}</h2>
    {sub && <p style={{ fontWeight: 400, fontSize: 13, color: "rgba(26,16,8,0.55)", marginBottom: 24 }}>{sub}</p>}
  </>
);

const StatusChip = ({ kind }: { kind: "connected" | "disconnected" | "active" | "soon" }) => {
  const styles = {
    connected: { bg: "#F0FDF4", color: "#166534", border: "#A7F3D0", dot: "#16A34A", label: "CONNECTED" },
    disconnected: { bg: "#FAF7F0", color: "rgba(26,16,8,0.45)", border: "#D4C9A8", dot: "transparent", label: "NOT CONNECTED" },
    active: { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE", dot: "#3B82F6", label: "ACTIVE" },
    soon: { bg: "#FEF3E2", color: "#8B5A00", border: "#FCD9A8", dot: "transparent", label: "COMING SOON" },
  }[kind];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`,
      borderRadius: 100, padding: "3px 10px",
      fontWeight: 500, fontSize: 11,
    }}>
      {styles.dot !== "transparent" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: styles.dot }} />}
      {styles.label}
    </span>
  );
};

const ConnectBtn = ({
  children, onClick, primary = false,
}: { children: React.ReactNode; onClick?: () => void; primary?: boolean }) => (
  <button
    onClick={onClick}
    style={{
      fontWeight: primary ? 600 : 500,
      fontSize: primary ? 14 : 13,
      color: primary ? "#FFFFFF" : "#C41E1E",
      background: primary ? "#C41E1E" : "#FDF2F1",
      border: primary ? "1px solid #A91818" : "1px solid rgba(196,30,30,0.20)",
      borderRadius: 6, padding: primary ? "9px 18px" : "7px 14px", cursor: "pointer",
      boxShadow: primary ? "0 1px 2px rgba(196,30,30,0.20)" : "none",
    }}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, color = "rgba(26,16,8,0.50)" }: { children: React.ReactNode; onClick?: () => void; color?: string }) => (
  <button
    onClick={onClick}
    style={{
      fontWeight: 500, fontSize: 12, color,
      background: "transparent", border: "none", cursor: "pointer", padding: 0,
    }}
    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
  >
    {children}
  </button>
);

/* ---------- Logo box ---------- */
type LogoSpec =
  | { kind: "img"; slug: string; color: string; alt: string }
  | { kind: "icon"; Icon: ComponentType<{ size?: number; color?: string }>; color: string };

const LogoBox = ({ logo }: { logo: LogoSpec }) => (
  <div style={{
    width: 40, height: 40, borderRadius: 8,
    border: "0.5px solid rgba(26,16,8,0.08)",
    background: "#FFFFFF", padding: 6, flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginRight: 8,
  }}>
    {logo.kind === "img" ? (
      <img
        src={`https://cdn.simpleicons.org/${logo.slug}/${logo.color}`}
        alt={logo.alt}
        width={28} height={28}
        style={{ width: 28, height: 28, objectFit: "contain" }}
        loading="lazy"
      />
    ) : (
      <logo.Icon size={24} color={logo.color} />
    )}
  </div>
);

const Row = ({
  logo, name, method, sub, status, action, isLast, expanded, note,
}: {
  logo: LogoSpec; name: string; method: string; sub?: string;
  status: React.ReactNode; action?: React.ReactNode; isLast?: boolean;
  expanded?: React.ReactNode; note?: string;
}) => (
  <div style={{ borderBottom: isLast ? "none" : "1px solid #F0EBD8" }}>
    <div style={{ display: "flex", alignItems: "center", minHeight: 72, gap: 12 }}>
      <LogoBox logo={logo} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: "#1A1008" }}>{name}</div>
        <div style={{ fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.50)" }}>{method}</div>
        {sub && <div style={{ fontWeight: 400, fontSize: 11, color: "rgba(26,16,8,0.45)", marginTop: 2 }}>{sub}</div>}
        {note && <div style={{ fontWeight: 500, fontSize: 11, color: "#8B6914", marginTop: 4 }}>{note}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        {status}
        {action}
      </div>
    </div>
    {expanded}
  </div>
);

/* ---------- Toast helpers ---------- */
const comingSoon = () => toast("Integration coming soon — we'll notify you when ready");
const waitlist = () => toast("Connect flow launching soon — join waitlist for early API access");

/* ---------- Logo specs ---------- */
const bankLogo = (alt: string): LogoSpec => ({ kind: "icon", Icon: Landmark, color: "#1A1008" });
const L = {
  razorpay: { kind: "img", slug: "razorpay", color: "3395FF", alt: "Razorpay" } as LogoSpec,
  stripe:   { kind: "img", slug: "stripe", color: "635BFF", alt: "Stripe" } as LogoSpec,
  payu:     { kind: "icon", Icon: CreditCard, color: "#0A6E3A" } as LogoSpec,
  cashfree: { kind: "icon", Icon: CreditCard, color: "#6933FF" } as LogoSpec,
  phonepe:  { kind: "icon", Icon: CreditCard, color: "#5F259F" } as LogoSpec,
  shopify:  { kind: "img", slug: "shopify", color: "7AB55C", alt: "Shopify" } as LogoSpec,
  woo:      { kind: "img", slug: "woocommerce", color: "96588A", alt: "WooCommerce" } as LogoSpec,
  amazon:   { kind: "img", slug: "amazon", color: "FF9900", alt: "Amazon" } as LogoSpec,
  zoho:     { kind: "img", slug: "zoho", color: "E42527", alt: "Zoho" } as LogoSpec,
  hubspot:  { kind: "img", slug: "hubspot", color: "FF7A59", alt: "HubSpot" } as LogoSpec,
  qb:       { kind: "img", slug: "quickbooks", color: "2CA01C", alt: "QuickBooks" } as LogoSpec,
  tally:    { kind: "icon", Icon: FileSpreadsheet, color: "#0078D4" } as LogoSpec,
  keka:     { kind: "icon", Icon: Users, color: "#5E35B1" } as LogoSpec,
  greythr:  { kind: "icon", Icon: Users, color: "#16A34A" } as LogoSpec,
  slack:    { kind: "img", slug: "slack", color: "4A154B", alt: "Slack" } as LogoSpec,
  whatsapp: { kind: "img", slug: "whatsapp", color: "25D366", alt: "WhatsApp" } as LogoSpec,
  email:    { kind: "icon", Icon: Mail, color: "#1A1008" } as LogoSpec,
  upload:   { kind: "icon", Icon: Upload, color: "#8B6914" } as LogoSpec,
  doc:      { kind: "icon", Icon: FileText, color: "#1E40AF" } as LogoSpec,
  busy:     { kind: "icon", Icon: FileSpreadsheet, color: "#1E40AF" } as LogoSpec,
  gst:      { kind: "icon", Icon: FileText, color: "#166534" } as LogoSpec,
  traces:   { kind: "icon", Icon: FileText, color: "#1E40AF" } as LogoSpec,
  mca:      { kind: "icon", Icon: FileText, color: "#7C2D12" } as LogoSpec,
};

const IntegrationsPage = () => {
  const [tallyExpanded, setTallyExpanded] = useState(false);
  const [busyExpanded, setBusyExpanded] = useState(false);
  const [tallyChecks, setTallyChecks] = useState([false, false, false]);

  const connectedCount = 3;
  const totalCount = 8;
  const pct = Math.round((connectedCount / totalCount) * 100);

  return (
    <div style={PAGE_WRAP}>
      <h1 style={{ fontWeight: 700, fontSize: 28, color: "#1A1008" }}>Integrations</h1>
      <p style={{ fontWeight: 400, fontSize: 15, color: "rgba(26,16,8,0.60)", marginTop: 6 }}>
        Connect FynHelp to your banks, accounting software, payroll tools, and GST systems.
      </p>

      {/* Summary strip */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        background: "#F0FDF4", border: "1px solid #A7F3D0", borderRadius: 8,
        padding: "14px 20px", margin: "24px 0 32px",
      }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: "#166534" }}>
          {connectedCount} of {totalCount} integrations connected
        </span>
        <div style={{ flex: 1, maxWidth: 200, height: 6, background: "#D1FAE5", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, height: "100%", background: "#16A34A", transition: "width 300ms" }} />
        </div>
        <span style={{ fontWeight: 400, fontSize: 13, color: "#166534" }}>
          Add more to improve CFO Fynny's accuracy
        </span>
      </div>

      {/* SECTION: PAYMENTS */}
      <div style={CARD}>
        <SectionTitle title="Payments" sub="Sync payment collections, settlements and refunds automatically." />
        <Row
          logo={L.razorpay} name="Razorpay" method="API Key + Secret"
          note="⭐ Recommended — most used by Indian startups"
          status={<StatusChip kind="disconnected" />}
          action={<ConnectBtn primary onClick={waitlist}>Connect Razorpay →</ConnectBtn>}
        />
        <Row
          logo={L.stripe} name="Stripe" method="OAuth 2.0"
          note="For international payments in USD/EUR"
          status={<StatusChip kind="disconnected" />}
          action={<ConnectBtn onClick={comingSoon}>Connect Stripe →</ConnectBtn>}
        />
        <Row logo={L.payu} name="PayU" method="API Key"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={L.cashfree} name="Cashfree" method="API Key"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={L.phonepe} name="PhonePe Business" method="API Key"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} isLast />
      </div>

      {/* SECTION: E-COMMERCE */}
      <div style={CARD}>
        <SectionTitle title="E-Commerce" sub="Import orders, returns and revenue from your online store." />
        <Row logo={L.shopify} name="Shopify" method="OAuth 2.0"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect Shopify →</ConnectBtn>} />
        <Row logo={L.woo} name="WooCommerce" method="API Key"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={L.amazon} name="Amazon Seller Central" method="MWS API"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} isLast />
      </div>

      {/* SECTION: CRM & SALES */}
      <div style={CARD}>
        <SectionTitle title="CRM & Sales" sub="Sync customer data, deals and revenue pipeline." />
        <Row logo={L.zoho} name="Zoho CRM" method="OAuth 2.0"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={L.hubspot} name="HubSpot" method="OAuth 2.0"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} isLast />
      </div>

      {/* SECTION: BANKING */}
      <div style={CARD}>
        <SectionTitle title="Banking" sub="Connect your bank accounts via RBI's Account Aggregator. Your login credentials are never shared." />

        <Row
          logo={bankLogo("HDFC")} name="HDFC Bank" method="Account Aggregator"
          sub="Last synced 12 min ago · ₹12.4L balance"
          status={<StatusChip kind="connected" />}
          action={<GhostBtn>Disconnect</GhostBtn>}
        />
        <Row logo={bankLogo("ICICI")} name="ICICI Bank" method="Account Aggregator"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={bankLogo("SBI")} name="SBI" method="Account Aggregator"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={bankLogo("Axis")} name="Axis Bank" method="Account Aggregator"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={bankLogo("Kotak")} name="Kotak Mahindra Bank" method="Account Aggregator"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} isLast />

        <div style={{ marginTop: 16 }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "transparent", border: "none", cursor: "pointer", padding: 0,
            fontWeight: 400, fontSize: 13, color: "#C41E1E",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
          >
            <Upload size={14} /> Upload PDF bank statement instead
          </button>
        </div>
      </div>

      {/* SECTION: ACCOUNTING */}
      <div style={CARD}>
        <SectionTitle title="Accounting Software" sub="Sync your invoices, bills, and ledger data automatically." />

        <Row
          logo={L.tally} name="Tally Prime" method="ODBC Agent"
          status={<StatusChip kind="disconnected" />}
          action={<ConnectBtn onClick={() => setTallyExpanded(!tallyExpanded)}>Set up Tally →</ConnectBtn>}
          expanded={tallyExpanded && (
            <div style={{ background: "#FAF7F0", borderTop: "1px solid #F0EBD8", padding: "16px 20px", marginTop: 4, borderRadius: 6 }}>
              <p style={{ fontWeight: 500, fontSize: 13, color: "#1A1008", marginBottom: 10 }}>Requirements:</p>
              {["Tally Prime 2.0 or higher installed", "Administrator access on that computer", "Tally is currently open"].map((req, i) => (
                <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={tallyChecks[i]} onChange={() => {
                    const c = [...tallyChecks]; c[i] = !c[i]; setTallyChecks(c);
                  }} />
                  <span style={{ fontSize: 13, color: "#1A1008" }}>{req}</span>
                </label>
              ))}
              <button style={{
                width: "100%", marginTop: 12, padding: "10px 14px",
                background: "#FFFFFF", border: "1px solid #D4C9A8", borderRadius: 6,
                fontWeight: 500, fontSize: 13, color: "#1A1008", cursor: "pointer",
              }}>Download ODBC Agent (Windows · 2.3MB)</button>
              <button style={{
                width: "100%", marginTop: 12, padding: "10px 14px",
                background: "#C41E1E", border: "none", borderRadius: 6,
                fontWeight: 600, fontSize: 14, color: "#FFFFFF", cursor: "pointer",
              }}>Test Connection</button>
            </div>
          )}
        />
        <Row logo={L.zoho} name="Zoho Books" method="OAuth 2.0"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={waitlist}>Connect Zoho Books →</ConnectBtn>} />
        <Row logo={L.qb} name="QuickBooks India" method="OAuth 2.0"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect QuickBooks →</ConnectBtn>} />
        <Row
          logo={L.busy} name="Busy Accounting" method="CSV Upload"
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
                  <span style={{ fontWeight: 500, fontSize: 12, color: "#1A1008" }}>{label}</span>
                  <span style={{ fontWeight: 400, fontSize: 12, color: "rgba(26,16,8,0.40)", marginTop: 2 }}>Drop file or click to browse</span>
                </div>
              ))}
              <button disabled style={{
                gridColumn: "1 / -1", padding: "10px 14px", background: "#E0D9C8",
                border: "none", borderRadius: 6, color: "rgba(26,16,8,0.40)",
                fontWeight: 600, fontSize: 14, cursor: "not-allowed",
              }}>Import data</button>
            </div>
          )}
        />
      </div>

      {/* SECTION: PAYROLL */}
      <div style={CARD}>
        <SectionTitle title="Payroll & HR" sub="Sync payroll data for HR Intelligence and payroll cash planning." />
        <Row logo={L.keka} name="Keka HR" method="OAuth API"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={L.greythr} name="GreytHR" method="OAuth API"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={L.razorpay} name="Razorpay Payroll" method="OAuth API"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={{ kind: "icon", Icon: Users, color: "#8B6914" }} name="Manual Payroll Entry" method="Always available"
          sub="Enter payroll data manually each month from the Payroll Planner page"
          status={<StatusChip kind="active" />} isLast />
      </div>

      {/* SECTION: GST & COMPLIANCE */}
      <div style={CARD}>
        <SectionTitle title="GST & Compliance" />
        <Row logo={L.gst} name="GST Portal via GSP" method="Direct API"
          sub="Connected via Masters India GSP · GSTIN: 27AABCM1234F1Z5"
          status={<span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#F0FDF4", color: "#166534", border: "1px solid #A7F3D0",
            borderRadius: 100, padding: "3px 10px",
            fontWeight: 500, fontSize: 11,
          }}>● Active · GSP Partner</span>}
          action={<GhostBtn color="#C41E1E">Update GSTIN</GhostBtn>}
        />
        <Row logo={L.traces} name="TRACES (TDS)" method="Read-only"
          sub="Required for 26AS reconciliation"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} />
        <Row logo={L.mca} name="MCA/ROC Portal" method="Read-only"
          sub="Required for governance intelligence"
          status={<StatusChip kind="disconnected" />} action={<ConnectBtn onClick={comingSoon}>Connect →</ConnectBtn>} isLast />
      </div>

      {/* SECTION: ALERTS & COMMUNICATION */}
      <div style={CARD}>
        <SectionTitle title="Alerts & Communication" sub="Get financial alerts and Fynny AI on your favourite channels." />
        <Row
          logo={L.whatsapp} name="WhatsApp Business (via Gupshup)" method="API Key"
          note="Get daily briefs and alerts on WhatsApp"
          status={<StatusChip kind="disconnected" />}
          action={<ConnectBtn onClick={comingSoon}>Connect WhatsApp →</ConnectBtn>}
        />
        <Row
          logo={L.slack} name="Slack" method="OAuth 2.0"
          note="Get FynHelp alerts in your Slack workspace"
          status={<StatusChip kind="disconnected" />}
          action={<ConnectBtn onClick={comingSoon}>Connect Slack →</ConnectBtn>}
        />
        <Row logo={L.email} name="Email" method="Always active"
          sub="tarun@mehtatextile.com"
          status={<StatusChip kind="active" />} action={<GhostBtn color="#C41E1E">Change email</GhostBtn>} isLast />
      </div>

      {/* SECTION: DATA IMPORT */}
      <div style={CARD}>
        <SectionTitle title="Data Import" sub="No integration? Upload your data manually." />
        <Row logo={L.upload} name="CSV Upload — Bank Statement" method="File Upload"
          status={<StatusChip kind="active" />}
          action={<ConnectBtn onClick={comingSoon}>Upload CSV →</ConnectBtn>} />
        <Row logo={L.upload} name="Excel Upload — Invoices/Expenses" method="File Upload"
          status={<StatusChip kind="active" />}
          action={<ConnectBtn onClick={comingSoon}>Upload Excel →</ConnectBtn>} />
        <Row logo={L.doc} name="PDF Bank Statement" method="File Upload + OCR"
          status={<StatusChip kind="active" />}
          action={<ConnectBtn onClick={comingSoon}>Upload PDF →</ConnectBtn>} isLast />
      </div>
    </div>
  );
};

export default IntegrationsPage;
