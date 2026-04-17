import { useNavigate } from "react-router-dom";
import { COLORS, PageWrap, PageHeader, Card, MetricCard, Chip, GhostLink, HealthScoreBadge } from "@/components/ca/ui";

const CLIENTS = [
  { name: "Mehta Textiles", gstin: "29ABCDE1234F1Z5", safe: "₹4.2L", risk: "₹3.2L", mismatches: 4, score: 68, last: "Apr 12" },
  { name: "Sharma & Sons", gstin: "27FGHIJ5678K2L9", safe: "₹2.1L", risk: "₹1.8L", mismatches: 3, score: 54, last: "Apr 10" },
  { name: "Patel Manufacturing", gstin: "24KLMNO9012P1Q4", safe: "₹8.5L", risk: "₹0.6L", mismatches: 1, score: 78, last: "Apr 14" },
  { name: "Delhi Distributors", gstin: "07RSTUV3456W7X2", safe: "₹3.8L", risk: "₹0.9L", mismatches: 2, score: 71, last: "Apr 11" },
];

const VENDOR_WATCH = [
  { gstin: "29AABCR1234X1Z2", name: "Raj Textiles", clients: 4, risk: "₹8.4L", filing: "8/12", level: "high" },
  { gstin: "27AABCM5678Y1Z3", name: "Mumbai Mills", clients: 3, risk: "₹4.2L", filing: "10/12", level: "medium" },
  { gstin: "24AABCS9012Z1Z1", name: "Surat Fabrics", clients: 2, risk: "₹2.8L", filing: "6/12", level: "high" },
];

export default function CAGstPortfolioPage() {
  const navigate = useNavigate();
  return (
    <PageWrap>
      <PageHeader title="GST Portfolio" sub="ITC and GST health across all your clients." />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard label="Total ITC" value="₹2.4Cr" sub="Portfolio combined" />
        <MetricCard label="ITC At Risk" value="₹68.4L" valueColor={COLORS.redSoft} sub="14 clients affected" />
        <MetricCard label="Mismatches" value="14" valueColor={COLORS.amberSoft} sub="Clients with issues" />
        <MetricCard label="Avg Notice Risk" value="42/100" valueColor={COLORS.amberSoft} sub="Across portfolio" />
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold">Client GST health</h3>
          <GhostLink>Export combined ITC report</GhostLink>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
            <th className="py-2"><input type="checkbox" /></th>
            <th className="py-2">Client</th><th className="py-2">GSTIN</th><th className="py-2">Safe</th>
            <th className="py-2">At Risk</th><th className="py-2">Mismatches</th><th className="py-2">Notice</th><th className="py-2">Last 2B</th><th className="py-2"></th>
          </tr></thead>
          <tbody>
            {CLIENTS.map((c, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                <td className="py-3"><input type="checkbox" /></td>
                <td className="py-3 font-medium">{c.name}</td>
                <td className="py-3 text-[12px] font-mono" style={{ color: "rgba(26,16,8,0.60)" }}>{c.gstin}</td>
                <td className="py-3" style={{ color: COLORS.green }}>{c.safe}</td>
                <td className="py-3 font-semibold" style={{ color: COLORS.red }}>{c.risk}</td>
                <td className="py-3">{c.mismatches}</td>
                <td className="py-3"><HealthScoreBadge score={c.score} /></td>
                <td className="py-3 text-[13px]">{c.last}</td>
                <td className="py-3 text-right"><button onClick={() => navigate(`/ca/client/${i + 1}?tab=GST%20%26%20ITC`)} className="text-xs font-medium" style={{ color: COLORS.red }}>Review →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h3 className="text-[15px] font-semibold mb-1">Vendor watch list</h3>
        <p className="text-[13px] mb-4" style={{ color: "rgba(26,16,8,0.60)" }}>
          Vendors causing ITC problems across multiple clients.
        </p>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
            <th className="py-2">GSTIN</th><th className="py-2">Vendor</th><th className="py-2">Clients</th><th className="py-2">ITC at risk</th><th className="py-2">Filing rate</th><th className="py-2">Risk</th>
          </tr></thead>
          <tbody>
            {VENDOR_WATCH.map((v, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                <td className="py-3 text-[12px] font-mono">{v.gstin}</td>
                <td className="py-3 font-medium">{v.name}</td>
                <td className="py-3">{v.clients}</td>
                <td className="py-3 font-semibold" style={{ color: COLORS.red }}>{v.risk}</td>
                <td className="py-3 text-[13px]">{v.filing}</td>
                <td className="py-3"><Chip tone={v.level === "high" ? "red" : "amber"}>{v.level}</Chip></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageWrap>
  );
}
