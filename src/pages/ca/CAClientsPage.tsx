import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { COLORS, PageWrap, PageHeader, Card, Chip, PrimaryBtn, SecondaryBtn, GhostLink, HealthScoreBadge } from "@/components/ca/ui";
import { toast } from "sonner";

const ALL_CLIENTS = [
  { id: "1", name: "Mehta Textiles", industry: "Textile", turnover: "₹12Cr", health: 38, cash: "Critical", filing: 3, itc: "₹3.2L", report: "Never" },
  { id: "2", name: "Sharma & Sons", industry: "Trading", turnover: "₹8Cr", health: 42, cash: "Critical", filing: 2, itc: "₹1.8L", report: "12 days ago" },
  { id: "3", name: "Patel Manufacturing", industry: "Manufacturing", turnover: "₹24Cr", health: 71, cash: "Watch", filing: 5, itc: "₹0.6L", report: "3 days ago" },
  { id: "4", name: "Delhi Distributors", industry: "Trading", turnover: "₹18Cr", health: 64, cash: "Watch", filing: 2, itc: "₹0.9L", report: "8 days ago" },
  { id: "5", name: "Anand Trading Co.", industry: "Trading", turnover: "₹6Cr", health: 78, cash: "Safe", filing: 12, itc: "₹0.3L", report: "Yesterday" },
  { id: "6", name: "Surat Fabrics", industry: "Textile", turnover: "₹15Cr", health: 82, cash: "Safe", filing: 6, itc: "₹0.2L", report: "2 days ago" },
  { id: "7", name: "Nair Healthcare", industry: "Healthcare", turnover: "₹10Cr", health: 75, cash: "Safe", filing: 4, itc: "₹0.4L", report: "5 days ago" },
  { id: "8", name: "Iyer Consulting", industry: "IT", turnover: "₹4Cr", health: 88, cash: "Safe", filing: 8, itc: "₹0.1L", report: "Yesterday" },
];

export default function CAClientsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  return (
    <PageWrap>
      <PageHeader
        title="Client Portfolio"
        sub={`${ALL_CLIENTS.length} active clients`}
        right={<div className="flex gap-2"><GhostLink>Export</GhostLink><PrimaryBtn size="sm" onClick={() => navigate("/ca/clients/add")}>+ Add client</PrimaryBtn></div>}
      />

      <Card className="mb-4">
        <div className="flex flex-wrap gap-3">
          <input type="text" placeholder="Search client name or GSTIN..." className="flex-1 min-w-[200px] h-9 px-3 rounded text-sm" style={{ border: `1px solid ${COLORS.caBorder}` }} />
          <select className="h-9 px-3 rounded text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            <option>All Industries</option><option>Textile</option><option>Trading</option><option>Manufacturing</option><option>Healthcare</option><option>IT</option>
          </select>
          <select className="h-9 px-3 rounded text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
            <option>Sort: Health</option><option>Sort: Name</option><option>Sort: Revenue</option>
          </select>
        </div>
      </Card>

      <Card>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
            <th className="py-2 w-8"></th><th className="py-2">Client</th><th className="py-2">Industry</th><th className="py-2">Turnover</th>
            <th className="py-2">Health</th><th className="py-2">Cash</th><th className="py-2">Next Filing</th><th className="py-2">ITC Risk</th><th className="py-2">Last Report</th><th className="py-2"></th>
          </tr></thead>
          <tbody>
            {ALL_CLIENTS.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-[#F8F6F1]" style={{ borderTop: `1px solid ${COLORS.divider}` }} onClick={() => navigate(`/ca/client/${c.id}`)}>
                <td className="py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggle(c.id)} /></td>
                <td className="py-3 font-medium">{c.name}</td>
                <td className="py-3 text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>{c.industry}</td>
                <td className="py-3 text-[13px]">{c.turnover}</td>
                <td className="py-3"><HealthScoreBadge score={c.health} /></td>
                <td className="py-3"><Chip tone={c.cash === "Safe" ? "green" : c.cash === "Watch" ? "amber" : "red"}>{c.cash}</Chip></td>
                <td className="py-3 text-[13px] font-medium" style={{ color: c.filing < 3 ? COLORS.red : c.filing < 7 ? COLORS.amber : "rgba(26,16,8,0.60)" }}>{c.filing}d</td>
                <td className="py-3 text-[13px] font-semibold">{c.itc}</td>
                <td className="py-3 text-[13px]" style={{ color: c.report === "Never" ? COLORS.red : "rgba(26,16,8,0.60)" }}>{c.report}</td>
                <td className="py-3 text-right"><span className="text-xs font-medium" style={{ color: COLORS.red }}>Open →</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-[260px] right-0 h-14 px-6 flex items-center gap-4 z-30" style={{ background: COLORS.ink }}>
          <span className="text-white text-sm font-medium">{selected.length} clients selected</span>
          <button onClick={() => { toast.success(`Generating reports for ${selected.length} clients`); }} className="h-8 px-3 rounded text-xs font-medium bg-white" style={{ color: COLORS.ink }}>Generate reports</button>
          <button onClick={() => toast.success("Export started")} className="h-8 px-3 rounded text-xs font-medium bg-white" style={{ color: COLORS.ink }}>Export data</button>
          <button onClick={() => toast.success(`Reminders sent to ${selected.length} clients`)} className="h-8 px-3 rounded text-xs font-medium bg-white" style={{ color: COLORS.ink }}>Send reminders</button>
          <button onClick={() => setSelected([])} className="text-xs ml-auto" style={{ color: "rgba(255,255,255,0.50)" }}>Deselect all</button>
        </div>
      )}
    </PageWrap>
  );
}
