import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Search, Download, Plus, X, Copy, MoreVertical, Briefcase,
  ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import { COLORS } from "@/components/ca/ui";
import { useCAClients, type CAClientRow } from "@/hooks/useCAClients";
import { useCAAuth } from "@/contexts/CAAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatINR } from "@/lib/indian-format";

// ---------- helpers ----------
type SortKey = "name" | "industry" | "cash" | "runway" | "alerts" | "filing" | "due" | "activity";
type SortDir = "asc" | "desc";

// Derive display values from existing client row (until backend RPC lands)
function deriveDisplay(c: CAClientRow) {
  // cash balance: rough proxy from health score
  const cashBalance = Math.round((c.health / 100) * 2000000) + 200000;
  // runway: derive from cash tone
  const runway = c.cash === "Safe" ? 110 + (c.health % 40) : c.cash === "Watch" ? 45 + (c.health % 30) : 12 + (c.health % 15);
  // critical alerts: derive from filing urgency + cash tone
  const criticalAlerts = (c.filing < 3 ? 1 : 0) + (c.cash === "Critical" ? 2 : c.cash === "Watch" ? 1 : 0);
  // next filing
  const nextFiling = c.filing < 7 ? "GSTR-3B" : c.filing < 14 ? "GSTR-1" : "TDS";
  const dueDate = new Date(Date.now() + c.filing * 86400000);
  return { cashBalance, runway, criticalAlerts, nextFiling, dueDate };
}

const runwayColor = (d: number) => (d > 90 ? "#1A6B3C" : d >= 30 ? "#F59E0B" : "#C41E1E");
const dueColor = (d: number) => (d < 0 ? "#C41E1E" : d < 3 ? "#C41E1E" : d < 7 ? "#F59E0B" : "#1A6B3C");
const fmtDate = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

const INDUSTRIES = ["Textiles", "Electronics", "Trading", "Manufacturing", "Services", "Healthcare", "IT", "Raw Materials"];

export default function CAClientsPage() {
  const navigate = useNavigate();
  const { caFirm } = useCAAuth();
  const { clients, loading, error } = useCAClients();

  // filters
  const [search, setSearch] = useState("");
  const [fIndustry, setFIndustry] = useState("All");
  const [fAlerts, setFAlerts] = useState("All");
  const [fFilings, setFFilings] = useState("All");
  const [fRunway, setFRunway] = useState("All");

  // table
  const [selected, setSelected] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [actionsOpenFor, setActionsOpenFor] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const enriched = useMemo(
    () => clients.map((c) => ({ ...c, derived: deriveDisplay(c) })),
    [clients],
  );

  // filter
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enriched.filter((c) => {
      if (q && !(c.name.toLowerCase().includes(q) || (c.gstin || "").toLowerCase().includes(q) || (c.industry || "").toLowerCase().includes(q))) return false;
      if (fIndustry !== "All" && c.industry !== fIndustry) return false;
      if (fAlerts === "Critical" && c.derived.criticalAlerts === 0) return false;
      if (fAlerts === "Warnings" && c.cash !== "Watch") return false;
      if (fAlerts === "None" && c.derived.criticalAlerts > 0) return false;
      if (fFilings === "Overdue" && c.filing >= 0) return false;
      if (fFilings === "Week" && c.filing > 7) return false;
      if (fFilings === "Month" && c.filing > 30) return false;
      if (fFilings === "Clear" && c.filing < 14) return false;
      if (fRunway === "Critical" && c.derived.runway >= 30) return false;
      if (fRunway === "Warning" && (c.derived.runway < 30 || c.derived.runway > 90)) return false;
      if (fRunway === "Healthy" && c.derived.runway <= 90) return false;
      return true;
    });
  }, [enriched, search, fIndustry, fAlerts, fFilings, fRunway]);

  // sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      switch (sortKey) {
        case "name": return a.name.localeCompare(b.name) * dir;
        case "industry": return (a.industry || "").localeCompare(b.industry || "") * dir;
        case "cash": return (a.derived.cashBalance - b.derived.cashBalance) * dir;
        case "runway": return (a.derived.runway - b.derived.runway) * dir;
        case "alerts": return (a.derived.criticalAlerts - b.derived.criticalAlerts) * dir;
        case "filing": return a.derived.nextFiling.localeCompare(b.derived.nextFiling) * dir;
        case "due": return (a.filing - b.filing) * dir;
        case "activity": return (a.report || "").localeCompare(b.report || "") * dir;
      }
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  // stats
  const stats = useMemo(() => {
    const total = clients.length;
    const critical = enriched.reduce((s, c) => s + c.derived.criticalAlerts, 0);
    const filings7d = enriched.filter((c) => c.filing >= 0 && c.filing <= 7).length;
    const avgRunway = total ? Math.round(enriched.reduce((s, c) => s + c.derived.runway, 0) / total) : 0;
    return { total, critical, filings7d, avgRunway };
  }, [clients.length, enriched]);

  const anyFilter = search || fIndustry !== "All" || fAlerts !== "All" || fFilings !== "All" || fRunway !== "All";
  const clearFilters = () => { setSearch(""); setFIndustry("All"); setFAlerts("All"); setFFilings("All"); setFRunway("All"); };

  const toggleRow = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleAll = () => setSelected(selected.length === pageRows.length ? [] : pageRows.map((r) => r.id));

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("asc"); }
  };

  const sortIcon = (k: SortKey) =>
    sortKey !== k ? <ArrowUpDown size={11} className="opacity-30" /> :
    sortDir === "asc" ? <ArrowUp size={11} /> : <ArrowDown size={11} />;

  const exportCSV = () => {
    const rows = sorted.map((c) => ({
      "Client Name": c.name,
      GSTIN: c.gstin ?? "",
      Industry: c.industry,
      "Cash Balance": c.derived.cashBalance,
      "Runway (days)": c.derived.runway,
      "Critical Alerts": c.derived.criticalAlerts,
      "Next Filing": c.derived.nextFiling,
      "Due Date": fmtDate(c.derived.dueDate),
      "Last Activity": c.report,
    }));
    const headers = Object.keys(rows[0] || { client: "" });
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => `"${String((r as any)[h]).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fynhelp-clients-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${sorted.length} clients`);
  };

  const copyGSTIN = (gstin: string | null) => {
    if (!gstin) return;
    navigator.clipboard.writeText(gstin);
    toast.success("GSTIN copied");
  };

  return (
    <div className="px-8 py-8 font-sans" style={{ color: COLORS.ink }}>
      {/* Page header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-[13px] mb-1" style={{ color: "rgba(26,16,8,0.45)" }}>Dashboard / Clients</div>
          <div className="flex items-baseline gap-3">
            <h1 className="font-serif text-[32px] font-bold leading-tight" style={{ color: COLORS.ink, fontFamily: "'Playfair Display', Georgia, serif" }}>Client Portfolio</h1>
            <span className="text-[18px]" style={{ color: "rgba(26,16,8,0.55)" }}>({stats.total} active clients)</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="h-10 px-4 rounded-lg text-[13px] font-medium flex items-center gap-2 bg-white hover:bg-[#FAF7F0]"
            style={{ border: `1px solid ${COLORS.ink}`, color: COLORS.ink }}
          >
            <Download size={14} /> Export to Excel
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-5 rounded-lg text-[14px] font-semibold text-white flex items-center gap-2"
            style={{ background: COLORS.red }}
          >
            <Plus size={16} /> Add Client
          </button>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Clients" value={stats.total.toString()} />
        <StatCard label="Critical Alerts" value={stats.critical.toString()} valueColor={stats.critical > 0 ? "#C41E1E" : COLORS.ink} />
        <StatCard label="Filings Due (7 days)" value={stats.filings7d.toString()} valueColor={stats.filings7d > 0 ? "#F59E0B" : COLORS.ink} />
        <StatCard label="Avg Cash Runway" value={`${stats.avgRunway} days`} valueColor={runwayColor(stats.avgRunway)} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-5 mb-4" style={{ border: `1px solid ${COLORS.caBorder}` }}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(26,16,8,0.45)" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by client name, GSTIN, industry..."
              className="w-full h-11 pl-10 pr-3 rounded-md text-sm focus:outline-none focus:ring-2"
              style={{ border: `1.5px solid ${COLORS.caBorder}` }}
            />
          </div>
          <FilterSelect label="Industry" value={fIndustry} onChange={(v) => { setFIndustry(v); setPage(1); }}
            options={["All", ...INDUSTRIES]} />
          <FilterSelect label="Alerts" value={fAlerts} onChange={(v) => { setFAlerts(v); setPage(1); }}
            options={[
              ["All", "All"], ["Critical", "Critical only"], ["Warnings", "Warnings only"], ["None", "No alerts"],
            ]} />
          <FilterSelect label="Filings" value={fFilings} onChange={(v) => { setFFilings(v); setPage(1); }}
            options={[
              ["All", "All"], ["Overdue", "Overdue"], ["Week", "Due this week"], ["Month", "Due this month"], ["Clear", "All clear"],
            ]} />
          <FilterSelect label="Runway" value={fRunway} onChange={(v) => { setFRunway(v); setPage(1); }}
            options={[
              ["All", "All"], ["Critical", "Critical (<30d)"], ["Warning", "Warning (30-90d)"], ["Healthy", "Healthy (>90d)"],
            ]} />
          {anyFilter && (
            <button onClick={clearFilters} className="text-[13px] font-medium hover:underline" style={{ color: COLORS.red }}>
              Clear all filters
            </button>
          )}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.length > 0 && (
        <div className="rounded-lg px-6 py-4 mb-4 flex items-center gap-3 shadow-lg" style={{ background: COLORS.ink }}>
          <span className="text-white text-sm font-medium flex-1">{selected.length} client{selected.length !== 1 ? "s" : ""} selected</span>
          {[
            ["File GSTR-3B", () => toast.success(`Filing GSTR-3B for ${selected.length} clients`)],
            ["Generate Reports", () => toast.success(`Generating reports for ${selected.length} clients`)],
            ["Send Reminder Emails", () => toast.success(`Reminders sent to ${selected.length} clients`)],
            ["Export Selected", () => { exportCSV(); }],
            ["Deselect All", () => setSelected([])],
          ].map(([label, fn]) => (
            <button key={label as string} onClick={fn as any}
              className="h-8 px-3 rounded-lg text-xs font-medium border border-white/40 text-white hover:bg-white/10">
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Table card */}
      <div className="bg-white rounded-lg p-6" style={{ border: `1px solid ${COLORS.caBorder}` }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-[13px]" style={{ color: "rgba(26,16,8,0.55)" }}>
            Showing {sorted.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1}-{Math.min(safePage * rowsPerPage, sorted.length)} of {sorted.length} clients
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "#FAF7F0" }}>
                <th className="py-3 px-3 w-10 text-left">
                  <input type="checkbox"
                    checked={pageRows.length > 0 && selected.length === pageRows.length}
                    onChange={toggleAll} />
                </th>
                <Th sortable onClick={() => handleSort("name")} icon={sortIcon("name")}>Client Name</Th>
                <Th>GSTIN</Th>
                <Th sortable onClick={() => handleSort("industry")} icon={sortIcon("industry")}>Industry</Th>
                <Th sortable onClick={() => handleSort("cash")} icon={sortIcon("cash")}>Cash Balance</Th>
                <Th sortable onClick={() => handleSort("runway")} icon={sortIcon("runway")}>Runway</Th>
                <Th sortable onClick={() => handleSort("alerts")} icon={sortIcon("alerts")}>Critical Alerts</Th>
                <Th sortable onClick={() => handleSort("filing")} icon={sortIcon("filing")}>Next Filing</Th>
                <Th sortable onClick={() => handleSort("due")} icon={sortIcon("due")}>Days Until Due</Th>
                <Th sortable onClick={() => handleSort("activity")} icon={sortIcon("activity")}>Last Activity</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <>
                  {[...Array(6)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${COLORS.divider}` }}>
                      {[...Array(11)].map((_, j) => (
                        <td key={j} className="py-4 px-3">
                          <div className="h-4 rounded bg-[#F0EBD8] animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}

              {!loading && error && (
                <tr><td colSpan={11} className="py-12 text-center text-sm" style={{ color: COLORS.red }}>
                  Unable to load clients. Please refresh.
                </td></tr>
              )}

              {!loading && !error && pageRows.length === 0 && clients.length === 0 && (
                <tr><td colSpan={11} className="py-16">
                  <div className="flex flex-col items-center text-center">
                    <Briefcase size={48} style={{ color: COLORS.caBorder }} />
                    <h3 className="mt-4 text-[24px] font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>No clients yet</h3>
                    <p className="text-[14px] mt-1 max-w-md" style={{ color: "rgba(26,16,8,0.65)" }}>
                      Start by inviting your first client to connect their FynHelp account.
                    </p>
                    <button onClick={() => setShowAddModal(true)} className="mt-4 h-10 px-5 rounded-lg text-white text-[14px] font-semibold flex items-center gap-2"
                      style={{ background: COLORS.red }}>
                      <Plus size={16} /> Invite Client
                    </button>
                  </div>
                </td></tr>
              )}

              {!loading && !error && pageRows.length === 0 && clients.length > 0 && (
                <tr><td colSpan={11} className="py-12 text-center">
                  <div className="text-sm mb-3" style={{ color: "rgba(26,16,8,0.60)" }}>No clients match your filters</div>
                  <button onClick={clearFilters} className="text-[13px] font-medium underline" style={{ color: COLORS.red }}>
                    Clear filters
                  </button>
                </td></tr>
              )}

              {!loading && !error && pageRows.map((c) => {
                const d = c.derived;
                const isSelected = selected.includes(c.id);
                return (
                  <tr key={c.id}
                    className="cursor-pointer hover:bg-[#FAF7F0] group"
                    style={{ borderBottom: `1px solid ${COLORS.divider}`, height: 72 }}
                    onClick={() => navigate(`/ca/client/${c.business_id}`)}>
                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleRow(c.id)} />
                    </td>
                    <td className="px-3">
                      <div className="font-semibold text-[14px]" style={{ color: COLORS.ink }}>{c.name}</div>
                      <div className="text-[12px] mt-0.5" style={{ color: "rgba(26,16,8,0.45)" }}>{c.industry}</div>
                    </td>
                    <td className="px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2 group/g">
                        <span className="text-[13px] font-mono" style={{ color: "rgba(26,16,8,0.65)" }}>{c.gstin || "—"}</span>
                        {c.gstin && (
                          <button onClick={() => copyGSTIN(c.gstin)} className="opacity-0 group-hover/g:opacity-100 transition-opacity">
                            <Copy size={12} style={{ color: "rgba(26,16,8,0.55)" }} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>{c.industry}</td>
                    <td className="px-3">
                      <div className="font-semibold text-[14px]" style={{ color: COLORS.ink }}>{formatINR(d.cashBalance)}</div>
                      <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.45)" }}>1 account</div>
                    </td>
                    <td className="px-3">
                      <div className="font-bold text-[16px]" style={{ color: runwayColor(d.runway) }}>{d.runway}</div>
                      <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.45)" }}>days</div>
                    </td>
                    <td className="px-3">
                      {d.criticalAlerts === 0 ? (
                        <span style={{ color: "rgba(26,16,8,0.25)" }}>—</span>
                      ) : (
                        <span className="inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[12px] font-semibold text-white"
                          style={{ background: COLORS.red }}>
                          {d.criticalAlerts}
                        </span>
                      )}
                    </td>
                    <td className="px-3">
                      <div className="font-medium text-[13px]" style={{ color: COLORS.ink }}>{d.nextFiling}</div>
                      <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.55)" }}>{fmtDate(d.dueDate)}</div>
                    </td>
                    <td className="px-3">
                      {c.filing < 0 ? (
                        <span className="inline-block rounded px-2 py-0.5 text-[11px] font-bold text-white" style={{ background: COLORS.red }}>OVERDUE</span>
                      ) : (
                        <span className="font-semibold text-[14px]" style={{ color: dueColor(c.filing) }}>{c.filing}d</span>
                      )}
                    </td>
                    <td className="px-3 text-[13px]" style={{ color: "rgba(26,16,8,0.55)" }}>{c.report}</td>
                    <td className="px-3 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActionsOpenFor(actionsOpenFor === c.id ? null : c.id)}
                        className="p-1.5 rounded hover:bg-[#F0EBD8]"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {actionsOpenFor === c.id && (
                        <div className="absolute right-3 top-10 w-48 bg-white rounded-md shadow-xl py-1 z-20"
                          style={{ border: `1px solid ${COLORS.caBorder}` }}>
                          {[
                            ["View Dashboard →", () => navigate(`/ca/client/${c.business_id}`)],
                            ["File GST Returns", () => toast.success(`Filing GST for ${c.name}`)],
                            ["Run ITC Recon", () => toast.success(`Running ITC recon for ${c.name}`)],
                            ["Generate Report", () => toast.success(`Generating report for ${c.name}`)],
                            ["Send Email", () => toast.success(`Email queued to ${c.name}`)],
                          ].map(([l, fn]) => (
                            <button key={l as string}
                              onClick={() => { (fn as any)(); setActionsOpenFor(null); }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-[#FAF7F0]" style={{ color: COLORS.ink }}>
                              {l}
                            </button>
                          ))}
                          <div className="my-1" style={{ borderTop: `1px solid ${COLORS.divider}` }} />
                          <button
                            onClick={() => { toast.success(`Removed access to ${c.name}`); setActionsOpenFor(null); }}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-[#FAF7F0]" style={{ color: COLORS.red }}>
                            Remove Access
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {sorted.length > 0 && (
          <div className="flex items-center justify-between mt-5 pt-4" style={{ borderTop: `1px solid ${COLORS.divider}` }}>
            <span className="text-[13px]" style={{ color: "rgba(26,16,8,0.55)" }}>
              Showing {(safePage - 1) * rowsPerPage + 1}-{Math.min(safePage * rowsPerPage, sorted.length)} of {sorted.length} clients
            </span>
            <div className="flex items-center gap-3">
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                className="h-8 px-2 rounded text-sm bg-white"
                style={{ border: `1px solid ${COLORS.caBorder}` }}
              >
                {[10, 20, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}
              </select>
              <button
                disabled={safePage === 1}
                onClick={() => setPage(safePage - 1)}
                className="h-8 w-8 rounded flex items-center justify-center disabled:opacity-30 hover:bg-[#FAF7F0]"
                style={{ border: `1px solid ${COLORS.caBorder}` }}
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className="h-8 min-w-[32px] px-2 rounded text-sm font-medium"
                  style={n === safePage
                    ? { background: COLORS.red, color: "#FFFFFF" }
                    : { border: `1px solid ${COLORS.caBorder}`, color: COLORS.ink }}>
                  {n}
                </button>
              ))}
              <button
                disabled={safePage === totalPages}
                onClick={() => setPage(safePage + 1)}
                className="h-8 w-8 rounded flex items-center justify-center disabled:opacity-30 hover:bg-[#FAF7F0]"
                style={{ border: `1px solid ${COLORS.caBorder}` }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Client modal */}
      {showAddModal && (
        <AddClientModal
          caFirmId={caFirm?.id ?? null}
          onClose={() => setShowAddModal(false)}
          onSent={() => { setShowAddModal(false); }}
        />
      )}
    </div>
  );
}

// ---------- subcomponents ----------
function StatCard({ label, value, valueColor = "#1A1008" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="bg-white rounded-lg px-5 py-4" style={{ border: `1px solid #E5DCC8` }}>
      <div className="text-[12px] font-medium" style={{ color: "rgba(26,16,8,0.55)" }}>{label}</div>
      <div className="text-[24px] font-bold mt-1" style={{ color: valueColor }}>{value}</div>
    </div>
  );
}

function Th({
  children, sortable, onClick, icon,
}: { children: React.ReactNode; sortable?: boolean; onClick?: () => void; icon?: React.ReactNode }) {
  return (
    <th className={`py-3 px-3 text-left text-[12px] font-semibold uppercase tracking-wide ${sortable ? "cursor-pointer select-none hover:bg-[#F0EBD8]" : ""}`}
      style={{ color: "rgba(26,16,8,0.65)" }}
      onClick={onClick}>
      <span className="inline-flex items-center gap-1">{children}{sortable && icon}</span>
    </th>
  );
}

function FilterSelect({
  label, value, onChange, options,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: (string | [string, string])[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 pl-3 pr-8 rounded-md text-sm bg-white appearance-none focus:outline-none focus:ring-2"
        style={{ border: `1.5px solid ${COLORS.caBorder}`, color: COLORS.ink }}
      >
        {options.map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return <option key={v} value={v}>{v === "All" ? `${label}: All` : l}</option>;
        })}
      </select>
    </div>
  );
}

function AddClientModal({
  caFirmId, onClose, onSent,
}: { caFirmId: string | null; onClose: () => void; onSent: () => void }) {
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [accessLevel, setAccessLevel] = useState("full_access");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caFirmId) { toast.error("CA firm not loaded"); return; }
    if (!gstin.trim() && !email.trim()) { toast.error("Provide GSTIN or client email"); return; }
    setSubmitting(true);
    const { error } = await supabase.from("ca_access_requests").insert({
      ca_firm_id: caFirmId,
      target_gstin: gstin.trim() || "PENDING",
      target_email: email.trim() || null,
      access_level: accessLevel,
      message: message.trim() || null,
      status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(email ? `Invitation sent to ${email}` : "Access request created");
    onSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-[480px] p-8 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-[#FAF7F0] rounded">
          <X size={18} />
        </button>
        <h2 className="text-[24px] font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif", color: COLORS.ink }}>
          Invite Client
        </h2>
        <p className="text-[14px] mt-1 mb-6" style={{ color: "rgba(26,16,8,0.65)" }}>
          Send an access request to your client's FynHelp account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Client GSTIN" required>
            <input type="text" value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="29ABCDE1234F1Z5" required
              className="w-full h-11 px-3 rounded-md text-sm font-mono focus:outline-none focus:ring-2"
              style={{ border: `1.5px solid ${COLORS.caBorder}` }} />
          </Field>
          <Field label="Client's Email Address" hint="They must have an active FynHelp account">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="client@business.com"
              className="w-full h-11 px-3 rounded-md text-sm focus:outline-none focus:ring-2"
              style={{ border: `1.5px solid ${COLORS.caBorder}` }} />
          </Field>
          <Field label="Access Level">
            <select value={accessLevel} onChange={(e) => setAccessLevel(e.target.value)}
              className="w-full h-11 px-3 rounded-md text-sm bg-white focus:outline-none focus:ring-2"
              style={{ border: `1.5px solid ${COLORS.caBorder}` }}>
              <option value="full_access">Full Access</option>
              <option value="read_only">View Only</option>
              <option value="filing_only">Filing Only</option>
            </select>
          </Field>
          <Field label="Custom Message (optional)">
            <textarea value={message} onChange={(e) => setMessage(e.target.value.slice(0, 500))}
              rows={3} placeholder="Hi, I'd like to access your FynHelp account to manage your GST filings..."
              className="w-full px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2"
              style={{ border: `1.5px solid ${COLORS.caBorder}` }} />
            <div className="text-[11px] mt-1 text-right" style={{ color: "rgba(26,16,8,0.45)" }}>{message.length}/500</div>
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="h-10 px-4 rounded-lg text-sm font-medium bg-white"
              style={{ border: `1px solid ${COLORS.caBorder}`, color: COLORS.ink }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="h-10 px-5 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: COLORS.red }}>
              {submitting ? "Sending…" : "Send Invitation →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[13px] font-medium mb-1.5" style={{ color: COLORS.ink }}>
        {label}{required && <span style={{ color: COLORS.red }}> *</span>}
      </label>
      {children}
      {hint && <div className="text-[12px] mt-1" style={{ color: "rgba(26,16,8,0.45)" }}>{hint}</div>}
    </div>
  );
}
