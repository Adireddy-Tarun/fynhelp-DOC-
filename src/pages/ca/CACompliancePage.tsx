import { COLORS, PageWrap, PageHeader, Card, Chip } from "@/components/ca/ui";

export default function CACompliancePage() {
  return (
    <PageWrap>
      <PageHeader title="Compliance Matrix" sub="All regulatory frameworks across your portfolio." />
      <Card>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
            <th className="py-2">Framework</th><th className="py-2">Clients</th><th className="py-2">Up to date</th><th className="py-2">Pending</th><th className="py-2">Late</th>
          </tr></thead>
          <tbody>
            {[
              ["GST", 47, 38, 7, 2],
              ["TDS", 42, 35, 6, 1],
              ["ROC / MCA", 30, 26, 4, 0],
              ["PF / ESIC", 28, 22, 5, 1],
              ["Income Tax", 47, 41, 6, 0],
              ["Labour", 18, 14, 4, 0],
              ["FEMA", 6, 5, 1, 0],
            ].map((r, i) => (
              <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                <td className="py-3 font-medium">{r[0]}</td>
                <td className="py-3">{r[1]}</td>
                <td className="py-3"><Chip tone="green">{r[2]}</Chip></td>
                <td className="py-3"><Chip tone="amber">{r[3]}</Chip></td>
                <td className="py-3"><Chip tone={r[4] === 0 ? "gray" : "red"}>{r[4]}</Chip></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageWrap>
  );
}
