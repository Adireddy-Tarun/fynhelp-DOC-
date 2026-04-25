import { PageWrap, PageHeader } from "@/components/ca/ui";
import {
  FynCard,
  FynTable,
  FynTH,
  FynTR,
  FynTD,
  FynBadge,
} from "@/components/dashboard/ui";

type Row = [string, number, number, number, number];

const ROWS: Row[] = [
  ["GST", 47, 38, 7, 2],
  ["TDS", 42, 35, 6, 1],
  ["ROC / MCA", 30, 26, 4, 0],
  ["PF / ESIC", 28, 22, 5, 1],
  ["Income Tax", 47, 41, 6, 0],
  ["Labour", 18, 14, 4, 0],
  ["FEMA", 6, 5, 1, 0],
];

export default function CACompliancePage() {
  return (
    <PageWrap>
      <PageHeader title="Compliance Matrix" sub="All regulatory frameworks across your portfolio." />
      <FynCard>
        <FynTable>
          <thead>
            <FynTR className="hover:bg-transparent">
              <FynTH>Framework</FynTH>
              <FynTH align="right">Clients</FynTH>
              <FynTH align="right">Up to date</FynTH>
              <FynTH align="right">Pending</FynTH>
              <FynTH align="right">Late</FynTH>
            </FynTR>
          </thead>
          <tbody>
            {ROWS.map(([framework, clients, upToDate, pending, late]) => (
              <FynTR key={framework}>
                <FynTD className="text-fyn-ink font-medium">{framework}</FynTD>
                <FynTD align="right" mono>{clients}</FynTD>
                <FynTD align="right">
                  <FynBadge tone="success">{upToDate}</FynBadge>
                </FynTD>
                <FynTD align="right">
                  <FynBadge tone="warning">{pending}</FynBadge>
                </FynTD>
                <FynTD align="right">
                  <FynBadge tone={late === 0 ? "neutral" : "danger"}>{late}</FynBadge>
                </FynTD>
              </FynTR>
            ))}
          </tbody>
        </FynTable>
      </FynCard>
    </PageWrap>
  );
}
