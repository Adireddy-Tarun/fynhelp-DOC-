import { COLORS, PageWrap, PageHeader, Card, MetricCard, Chip } from "@/components/ca/ui";
import { GspLimitationBanner } from "@/components/ca/GspLimitationBanner";

export default function CATdsTrackerPage() {
  return (
    <PageWrap>
      <PageHeader title="TDS Tracker" sub="TDS deposits and returns across your portfolio." />
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard label="TDS Due This Month" value="₹4.8L" valueColor={COLORS.amberSoft} sub="Across 12 clients" />
        <MetricCard label="Filed YTD" value="₹38.2L" valueColor={COLORS.greenSoft} />
        <MetricCard label="Late Deposits" value="2" valueColor={COLORS.redSoft} sub="Penalty risk" />
        <MetricCard label="Q4 Returns Due" value="May 31" sub="14 clients" />
      </div>
      <Card>
        <h3 className="text-[15px] font-semibold mb-4">Client TDS status</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
            <th className="py-2">Client</th><th className="py-2">TAN</th><th className="py-2">Due</th><th className="py-2">Amount</th><th className="py-2">Status</th>
          </tr></thead>
          <tbody>
            {[["Mehta Textiles", "BLRM12345E", "Apr 30", "₹86K", "Pending"], ["Sharma & Sons", "DELS67890F", "Apr 30", "₹42K", "Pending"], ["Patel Mfg", "MUMP24680G", "Apr 7", "₹1.2L", "Filed"]].map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                <td className="py-3 font-medium">{r[0]}</td><td className="py-3 text-[12px] font-mono">{r[1]}</td><td className="py-3 text-[13px]">{r[2]}</td>
                <td className="py-3 font-semibold">{r[3]}</td><td className="py-3"><Chip tone={r[4] === "Filed" ? "green" : "amber"}>{r[4]}</Chip></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageWrap>
  );
}
