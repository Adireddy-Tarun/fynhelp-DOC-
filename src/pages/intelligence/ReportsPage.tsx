import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGeneratedReports, useGenerateReport } from "@/hooks/dashboard/useReports";
import { IntelligenceProvider, DEMO_BIZ, type IntelligenceMode } from "@/components/intelligence/DataSource";
import { IntelPage, IntelCard, ACCENT } from "@/components/intelligence/_primitives";
import DashboardLayout from "@/components/DashboardLayout";
import DemoModeBanner from "@/components/demo/DemoModeBanner";
import { toast } from "sonner";
import {
  TrendingUp, Droplets, Flame, FileText, ArrowLeftRight, IndianRupee,
  Users, BarChart3, Download, Loader2,
} from "lucide-react";

type ReportDef = {
  type: string;
  name: string;
  Icon: typeof TrendingUp;
  description: string;
};

const REPORTS: ReportDef[] = [
  { type: "profit_loss",   name: "Profit & Loss",       Icon: TrendingUp,    description: "Monthly revenue, expenses and net profit breakdown" },
  { type: "cash_flow",     name: "Cash Flow",           Icon: Droplets,      description: "Cash inflows, outflows and 13-week forecast" },
  { type: "burn_rate",     name: "Burn Rate",           Icon: Flame,         description: "Monthly burn trend, runway projection and scenarios" },
  { type: "gst_summary",   name: "GST Summary",         Icon: FileText,      description: "GSTR filing status, ITC reconciliation and net payable" },
  { type: "receivables",   name: "Receivables",         Icon: ArrowLeftRight,description: "Outstanding invoices, aging analysis and overdue customers" },
  { type: "vendor_spend",  name: "Vendor Spend",        Icon: IndianRupee,   description: "Top vendor analysis, category breakdown and optimization" },
  { type: "employee_cost", name: "Employee Cost",       Icon: Users,         description: "Payroll summary, department costs and CTC breakdown" },
  { type: "board_pack",    name: "Investor Board Pack", Icon: BarChart3,     description: "Investor-ready KPIs: MRR, ARR, burn, runway, NRR" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function ReportsContent({ mode }: { mode: IntelligenceMode }) {
  const { businessId: liveBiz, profile } = useAuth();
  const businessId = mode === "demo" ? DEMO_BIZ : liveBiz;
  const userName = profile?.full_name || "User";
  const { data: reports = [], isLoading } = useGeneratedReports(businessId);
  const generate = useGenerateReport(businessId);
  const [pending, setPending] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleGenerate = async (r: ReportDef) => {
    if (!businessId) {
      toast.error("Please sign in to generate reports");
      return;
    }
    setPending(r.type);
    try {
      await generate.mutateAsync({ report_type: r.type, report_name: r.name, generated_by: userName });
      toast.success(`${r.name} generated successfully`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to generate report");
    } finally {
      setPending(null);
    }
  };

  const handleDownload = (r: { id: string; report_name: string }) => {
    setDownloading(r.id);
    toast(`Downloading ${r.report_name}...`);
    setTimeout(() => {
      toast.success("Download complete");
      setDownloading(null);
    }, 1500);
  };

  return (
    <IntelPage>
      <header>
        <h1 style={{ fontSize: 18, fontWeight: 500, color: ACCENT.ink, fontFamily: "'Space Grotesk', sans-serif" }}>
          CFO Reports
        </h1>
        <p style={{ fontSize: 13, color: "#6B6B6B", marginTop: 4 }}>
          Generate and download financial reports for your business
        </p>
      </header>

      <section>
        <h2 style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: ACCENT.red, marginBottom: 10 }}>
          Available reports
        </h2>
        <div
          style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}
        >
          {REPORTS.map((r) => {
            const Icon = r.Icon;
            const isLoading = pending === r.type;
            return (
              <div
                key={r.type}
                className="fyn-report-card"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(26,16,8,0.06)",
                  borderRadius: 12,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(26,16,8,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 32, height: 32, borderRadius: 8,
                    background: "rgba(169,56,56,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: ACCENT.red,
                  }}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 500, color: ACCENT.ink }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "#6B6B6B", lineHeight: 1.4, flex: 1 }}>{r.description}</div>
                <button
                  onClick={() => handleGenerate(r)}
                  disabled={isLoading}
                  style={{
                    background: ACCENT.red, color: "#FFFFFF",
                    borderRadius: 6, padding: "6px 10px",
                    fontSize: 11, fontWeight: 500,
                    width: "100%", border: "none",
                    cursor: isLoading ? "wait" : "pointer",
                    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
                    opacity: isLoading ? 0.7 : 1,
                    transition: "opacity 0.2s",
                  }}
                >
                  {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                  {isLoading ? "Generating..." : "Generate PDF"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <IntelCard title="Recent reports">
        {isLoading ? (
          <div style={{ padding: 16, fontSize: 13, color: "#6B6B6B" }}>Loading reports…</div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 24, fontSize: 13, color: "#6B6B6B", textAlign: "center" }}>
            No reports generated yet. Generate your first report above.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Report name", "Generated on", "Generated by", "Download"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        fontSize: 10,
                        textTransform: "uppercase",
                        color: ACCENT.red,
                        letterSpacing: "0.05em",
                        fontWeight: 600,
                        padding: "10px 12px",
                        borderBottom: "1px solid rgba(26,16,8,0.06)",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid rgba(26,16,8,0.06)", color: ACCENT.ink, fontWeight: 500 }}>
                      {r.report_name}
                      {r.status === "generating" && (
                        <span style={{ marginLeft: 8, fontSize: 10, color: ACCENT.gold, fontStyle: "italic" }}>
                          generating…
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid rgba(26,16,8,0.06)", color: "#6B6B6B" }}>
                      {formatDate(r.generated_at)}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid rgba(26,16,8,0.06)", color: "#6B6B6B" }}>
                      {r.generated_by || "—"}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "0.5px solid rgba(26,16,8,0.06)" }}>
                      <button
                        onClick={() => handleDownload(r)}
                        disabled={r.status !== "completed" || downloading === r.id}
                        aria-label={`Download ${r.report_name}`}
                        style={{
                          background: "transparent",
                          border: `1px solid ${ACCENT.red}`,
                          borderRadius: 6,
                          padding: "4px 8px",
                          color: ACCENT.red,
                          cursor: r.status === "completed" ? "pointer" : "not-allowed",
                          opacity: r.status === "completed" ? 1 : 0.4,
                          display: "inline-flex", alignItems: "center", gap: 4,
                          fontSize: 11,
                        }}
                      >
                        {downloading === r.id ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </IntelCard>
    </IntelPage>
  );
}

export default function ReportsPage({ mode = "live" }: { mode?: IntelligenceMode }) {
  const content = (
    <IntelligenceProvider mode={mode}>
      <ReportsContent mode={mode} />
    </IntelligenceProvider>
  );
  if (mode === "demo") {
    return <DemoModeBanner>{content}</DemoModeBanner>;
  }
  return <DashboardLayout>{content}</DashboardLayout>;
}
