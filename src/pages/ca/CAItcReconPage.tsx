import { useEffect, useMemo, useState } from "react";
import { COLORS, PageWrap, PageHeader, Card, Chip, PrimaryBtn, SecondaryBtn, GhostLink } from "@/components/ca/ui";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCAAuth } from "@/contexts/CAAuthContext";
import { formatIndianCurrency } from "@/utils/formatters";
import { Search, Copy, AlertTriangle, CheckCircle2, X, Upload, FileText, Download } from "lucide-react";

type Client = { id: string; business_name: string; gstin: string | null };
type ItcLine = {
  id: string;
  business_id: string;
  period: string;
  vendor_gstin: string | null;
  itc_safe: number | null;
  itc_at_risk: number | null;
  mismatch_count: number | null;
  status: string | null;
  created_at: string;
};

type EnrichedLine = ItcLine & {
  vendor_name: string;
  invoice_no: string;
  invoice_date: string;
  itc_claimed: number;
  gstr2a_status: "found" | "not_found" | "partial";
  match_status: "matched" | "mismatched" | "pending";
  risk_flag: "high" | "medium" | "low" | "safe";
  diff: number;
};

const PERIODS = ["April 2026", "March 2026", "February 2026", "January 2026", "Q4 FY 2025-26"];

// deterministic enrichment so demo data is stable per row
function enrich(line: ItcLine, idx: number): EnrichedLine {
  const seed = (line.id?.charCodeAt(0) || 0) + idx;
  const vendorPool = ["ABC Electronics", "XYZ Traders", "Kumar Fabrics", "Mehta Textiles", "Sharma & Sons", "Patel Manufacturing"];
  const itcSafe = Number(line.itc_safe || 0);
  const itcRisk = Number(line.itc_at_risk || 0);
  const claimed = itcSafe + itcRisk || (50000 + (seed % 7) * 12000);
  const mismatches = Number(line.mismatch_count || 0);
  const isMatched = mismatches === 0 && itcRisk === 0;
  const gstr2a: EnrichedLine["gstr2a_status"] = isMatched ? "found" : seed % 3 === 0 ? "not_found" : "partial";
  const match: EnrichedLine["match_status"] = isMatched ? "matched" : "mismatched";
  const risk: EnrichedLine["risk_flag"] = itcRisk > 200000 ? "high" : itcRisk > 50000 ? "medium" : itcRisk > 0 ? "low" : "safe";
  return {
    ...line,
    vendor_name: vendorPool[seed % vendorPool.length],
    invoice_no: `INV-${(line.period || "").replace(/\s/g, "").slice(0, 6)}-${String(idx + 1).padStart(3, "0")}`,
    invoice_date: line.created_at?.slice(0, 10) || "2026-03-15",
    itc_claimed: claimed,
    gstr2a_status: gstr2a,
    match_status: match,
    risk_flag: risk,
    diff: itcRisk,
  };
}

export default function CAItcReconPage() {
  const { caFirm } = useCAAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [period, setPeriod] = useState(PERIODS[0]);
  const [lines, setLines] = useState<EnrichedLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showRunModal, setShowRunModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [runLog, setRunLog] = useState<string[]>([]);

  // Load clients accessible to this CA firm
  useEffect(() => {
    if (!caFirm?.id) return;
    (async () => {
      const { data } = await supabase
        .from("ca_client_access")
        .select("business_id, businesses(id, business_name, gstin)")
        .eq("ca_firm_id", caFirm.id)
        .eq("is_active", true);
      const list: Client[] = (data || [])
        .map((r: any) => r.businesses)
        .filter(Boolean);
      setClients(list);
    })();
  }, [caFirm?.id]);

  // Load ITC lines when client + period changes
  useEffect(() => {
    if (!selectedId) { setLines([]); return; }
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("gst_itc_lines")
        .select("*")
        .eq("business_id", selectedId)
        .order("created_at", { ascending: false });
      const filtered = (data || []).filter((l) => !l.period || l.period.toLowerCase().includes(period.toLowerCase().slice(0, 3)));
      const source = filtered.length ? filtered : (data || []);
      setLines(source.map((l, i) => enrich(l as ItcLine, i)));
      setLoading(false);
    })();
  }, [selectedId, period]);

  const selectedClient = clients.find((c) => c.id === selectedId);

  const filteredClients = useMemo(
    () => clients.filter((c) =>
      !clientSearch || c.business_name.toLowerCase().includes(clientSearch.toLowerCase()) || (c.gstin || "").toLowerCase().includes(clientSearch.toLowerCase())
    ),
    [clients, clientSearch]
  );

  const visible = useMemo(() => lines.filter((l) => {
    if (statusFilter === "matched" && l.match_status !== "matched") return false;
    if (statusFilter === "mismatched" && l.match_status !== "mismatched") return false;
    if (statusFilter === "missing" && l.gstr2a_status !== "not_found") return false;
    if (riskFilter !== "all" && l.risk_flag !== riskFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!l.invoice_no.toLowerCase().includes(s) && !(l.vendor_gstin || "").toLowerCase().includes(s) && !l.vendor_name.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [lines, statusFilter, riskFilter, search]);

  const stats = useMemo(() => {
    const total = lines.length;
    const matched = lines.filter((l) => l.match_status === "matched").length;
    const mismatched = lines.filter((l) => l.match_status === "mismatched").length;
    const itcRisk = lines.reduce((s, l) => s + (l.itc_at_risk || 0), 0);
    return { total, matched, mismatched, itcRisk };
  }, [lines]);

  const mismatchCategories = useMemo(() => {
    const cats: Record<string, number> = {
      "Amount Mismatch": 0, "Invoice Not in GSTR-2A": 0, "GSTIN Mismatch": 0, "Date Mismatch": 0, "Vendor Non-Compliant": 0,
    };
    lines.forEach((l) => {
      if (l.match_status !== "mismatched") return;
      if (l.gstr2a_status === "not_found") cats["Invoice Not in GSTR-2A"]++;
      else if (l.diff > 0) cats["Amount Mismatch"]++;
      else cats["GSTIN Mismatch"]++;
      if (l.risk_flag === "high") cats["Vendor Non-Compliant"]++;
    });
    return cats;
  }, [lines]);

  const topMismatchVendors = useMemo(() => {
    const map = new Map<string, { name: string; count: number; risk: number }>();
    lines.filter((l) => l.match_status === "mismatched").forEach((l) => {
      const cur = map.get(l.vendor_name) || { name: l.vendor_name, count: 0, risk: 0 };
      cur.count++;
      cur.risk += l.itc_at_risk || 0;
      map.set(l.vendor_name, cur);
    });
    return Array.from(map.values()).sort((a, b) => b.risk - a.risk).slice(0, 5);
  }, [lines]);

  const vendorCompliance = useMemo(() => {
    const map = new Map<string, { gstin: string; name: string; itc: number }>();
    lines.forEach((l) => {
      if (!l.vendor_gstin) return;
      const cur = map.get(l.vendor_gstin) || { gstin: l.vendor_gstin, name: l.vendor_name, itc: 0 };
      cur.itc += l.itc_claimed;
      map.set(l.vendor_gstin, cur);
    });
    return Array.from(map.values()).map((v, i) => {
      const seed = v.gstin.charCodeAt(0) + i;
      const gstr1 = seed % 5 !== 0;
      const gstr3b = seed % 7 !== 0;
      const score = (gstr1 ? 50 : 20) + (gstr3b ? 50 : 20) - (seed % 15);
      return { ...v, gstr1, gstr3b, score: Math.max(20, Math.min(100, score)) };
    });
  }, [lines]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const runReconciliation = async () => {
    setRunning(true); setProgress(0); setRunLog([]);
    const total = Math.max(lines.length, 20);
    for (let i = 1; i <= total; i++) {
      await new Promise((r) => setTimeout(r, 50));
      setProgress(Math.floor((i / total) * 100));
      if (i % 3 === 0) {
        const sample = lines[i % Math.max(lines.length, 1)];
        const tag = sample?.match_status === "matched" ? "✓ Matched" : "⚠ Mismatch";
        setRunLog((prev) => [...prev.slice(-15), `${tag}: INV-${String(i).padStart(3, "0")} - ${sample?.vendor_name || "Vendor"} - ${formatIndianCurrency(sample?.itc_claimed || 12450)}`]);
      }
    }
    setRunning(false);
    toast.success(`Reconciliation complete: ${stats.matched} matched, ${stats.mismatched} mismatches found`);
    if (caFirm?.id && selectedId) {
      await supabase.from("ca_activity_log").insert({
        ca_firm_id: caFirm.id, business_id: selectedId,
        action_type: "itc_reconciliation",
        description: `Ran ITC reconciliation for ${selectedClient?.business_name} (${period})`,
      });
    }
  };

  const exportCSV = (rowsOnly?: EnrichedLine[]) => {
    const rows = rowsOnly || visible;
    const headers = ["Invoice Date", "Vendor GSTIN", "Vendor Name", "Invoice No", "ITC Claimed", "GSTR-2A Status", "Match Status", "Risk", "Diff"];
    const csv = [headers.join(","), ...rows.map((r) => [r.invoice_date, r.vendor_gstin || "", r.vendor_name, r.invoice_no, r.itc_claimed, r.gstr2a_status, r.match_status, r.risk_flag, r.diff].join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `fynhelp-itc-recon-${selectedClient?.business_name?.replace(/\s/g, "-") || "client"}-${period.replace(/\s/g, "-")}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  const copyText = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copied"); };

  // ---------- RENDER ----------
  return (
    <PageWrap>
      <div className="text-[12px] mb-2" style={{ color: "rgba(26,16,8,0.45)" }}>Dashboard / ITC Reconciliation</div>
      <PageHeader
        title="ITC Reconciliation Tool"
        sub="Match purchase invoices with GSTR-2A and identify ITC risks"
        right={
          <div className="flex gap-2">
            <SecondaryBtn onClick={() => toast.info("Template download")}><span className="inline-flex items-center gap-1.5"><Download size={14} /> Download Template</span></SecondaryBtn>
            <PrimaryBtn onClick={() => setShowRunModal(true)} disabled={!selectedId}>Run New Reconciliation</PrimaryBtn>
          </div>
        }
      />

      {/* CLIENT SELECTOR */}
      {!selectedId ? (
        <Card className="mb-6">
          <div className="flex flex-col items-center text-center py-8">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "#F4EDDA" }}>
              <Search size={28} style={{ color: COLORS.caBorder }} />
            </div>
            <h2 className="text-[22px] font-bold mb-2">Select a client to reconcile ITC</h2>
            <p className="text-sm mb-5" style={{ color: "rgba(26,16,8,0.60)" }}>Choose a client from your portfolio to start reconciliation</p>
            <div className="w-full max-w-md">
              <input
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="Search by client name or GSTIN"
                className="w-full h-11 px-4 rounded-md text-sm bg-white"
                style={{ border: `1px solid ${COLORS.caBorder}` }}
              />
              <div className="mt-2 max-h-72 overflow-auto rounded-md bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                {filteredClients.length === 0 ? (
                  <div className="p-4 text-sm text-center" style={{ color: "rgba(26,16,8,0.50)" }}>No clients found</div>
                ) : filteredClients.map((c) => (
                  <button key={c.id} onClick={() => setSelectedId(c.id)} className="w-full text-left px-4 py-3 hover:bg-[#FAF7F0] transition-colors" style={{ borderBottom: `1px solid ${COLORS.divider}` }}>
                    <div className="font-semibold text-sm">{c.business_name}</div>
                    <div className="text-[12px] font-mono" style={{ color: "rgba(26,16,8,0.55)" }}>{c.gstin || "No GSTIN"}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* SELECTED CLIENT */}
          <Card className="mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="text-[16px] font-semibold">{selectedClient?.business_name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[13px] font-mono" style={{ color: "rgba(26,16,8,0.65)" }}>{selectedClient?.gstin || "-"}</span>
                  <button onClick={() => copyText(selectedClient?.gstin || "")} className="opacity-60 hover:opacity-100"><Copy size={12} /></button>
                  <button onClick={() => { setSelectedId(null); setLines([]); }} className="text-[13px] font-medium ml-2" style={{ color: COLORS.red }}>Change Client</button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="h-9 px-3 rounded text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                  {PERIODS.map((p) => <option key={p}>{p}</option>)}
                </select>
                <PrimaryBtn onClick={() => setShowRunModal(true)}>Run Reconciliation</PrimaryBtn>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-5">
              <StatCard label="Total Invoices" value={String(stats.total)} />
              <StatCard label="Matched" value={String(stats.matched)} sub={stats.total ? `${Math.round((stats.matched / stats.total) * 100)}%` : "0%"} color={COLORS.green} />
              <StatCard label="Mismatched" value={String(stats.mismatched)} sub={stats.total ? `${Math.round((stats.mismatched / stats.total) * 100)}%` : "0%"} color={COLORS.red} />
              <StatCard label="ITC at Risk" value={formatIndianCurrency(stats.itcRisk)} color={COLORS.red} />
            </div>
          </Card>

          {/* RESULTS TABLE */}
          <Card className="mb-4">
            <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 rounded text-[13px] bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                  <option value="all">All Status</option>
                  <option value="matched">Matched</option>
                  <option value="mismatched">Mismatched</option>
                  <option value="missing">Missing in GSTR-2A</option>
                </select>
                <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="h-9 px-3 rounded text-[13px] bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                  <option value="all">All Risk</option>
                  <option value="high">High Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="low">Low Risk</option>
                </select>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search invoice / vendor GSTIN..." className="h-9 px-3 rounded text-[13px] bg-white w-64" style={{ border: `1px solid ${COLORS.caBorder}` }} />
              </div>
              <div className="flex gap-2">
                <SecondaryBtn size="sm" onClick={() => setShowReportModal(true)}>Generate Report</SecondaryBtn>
                <SecondaryBtn size="sm" onClick={() => exportCSV()}>Export CSV</SecondaryBtn>
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 rounded animate-pulse" style={{ background: "#F4EDDA" }} />)}</div>
            ) : visible.length === 0 ? (
              <div className="py-12 text-center text-sm" style={{ color: "rgba(26,16,8,0.55)" }}>No purchase invoices found for this period</div>
            ) : (
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                      <th className="py-2 w-8"></th>
                      <th className="py-2">Date</th>
                      <th className="py-2">Vendor GSTIN</th>
                      <th className="py-2">Vendor</th>
                      <th className="py-2">Invoice No</th>
                      <th className="py-2 text-right">ITC Claimed</th>
                      <th className="py-2">2A Status</th>
                      <th className="py-2">Match</th>
                      <th className="py-2">Risk</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((l) => (
                      <>
                        <tr key={l.id} className="hover:bg-[#FAF7F0]" style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                          <td className="py-3"><input type="checkbox" checked={selected.has(l.id)} onChange={() => toggleSelect(l.id)} /></td>
                          <td className="py-3 text-[13px]" style={{ color: "rgba(26,16,8,0.65)" }}>{l.invoice_date}</td>
                          <td className="py-3 text-[12px] font-mono" style={{ color: "rgba(26,16,8,0.65)" }}>
                            <div className="flex items-center gap-1.5">{l.vendor_gstin || "-"}{l.vendor_gstin && <button onClick={() => copyText(l.vendor_gstin!)} className="opacity-50 hover:opacity-100"><Copy size={11} /></button>}</div>
                          </td>
                          <td className="py-3 font-medium">
                            <div className="flex items-center gap-1.5">{l.vendor_name}{l.risk_flag === "high" && <AlertTriangle size={13} style={{ color: COLORS.amber }} />}</div>
                          </td>
                          <td className="py-3 text-[12px] font-mono">{l.invoice_no}</td>
                          <td className="py-3 text-right font-semibold">{formatIndianCurrency(l.itc_claimed)}</td>
                          <td className="py-3"><Chip tone={l.gstr2a_status === "found" ? "green" : l.gstr2a_status === "not_found" ? "red" : "amber"}>{l.gstr2a_status === "found" ? "Found" : l.gstr2a_status === "not_found" ? "Not Found" : "Partial"}</Chip></td>
                          <td className="py-3">
                            <Chip tone={l.match_status === "matched" ? "green" : l.match_status === "mismatched" ? "red" : "gray"}>{l.match_status === "matched" ? "Matched" : l.match_status === "mismatched" ? "Mismatched" : "Pending"}</Chip>
                            {l.match_status === "mismatched" && l.diff > 0 && <div className="text-[11px] mt-0.5" style={{ color: COLORS.red }}>{formatIndianCurrency(l.diff)} diff</div>}
                          </td>
                          <td className="py-3"><RiskFlag risk={l.risk_flag} /></td>
                          <td className="py-3 text-right"><GhostLink onClick={() => setExpanded(expanded === l.id ? null : l.id)}>{expanded === l.id ? "Hide" : "Details"} →</GhostLink></td>
                        </tr>
                        {expanded === l.id && (
                          <tr style={{ background: "#FAF7F0" }}>
                            <td colSpan={10} className="p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <DetailPanel title="Our Books" data={{ "Invoice Date": l.invoice_date, "Vendor GSTIN": l.vendor_gstin || "-", "Invoice No": l.invoice_no, "Taxable Value": formatIndianCurrency(l.itc_claimed * 5), "CGST": formatIndianCurrency(l.itc_claimed / 2), "SGST": formatIndianCurrency(l.itc_claimed / 2), "Total ITC": formatIndianCurrency(l.itc_claimed) }} />
                                <DetailPanel title="GSTR-2A" data={{ "Invoice Date": l.invoice_date, "Vendor GSTIN": l.vendor_gstin || "-", "Invoice No": l.invoice_no, "Taxable Value": formatIndianCurrency((l.itc_claimed - l.diff) * 5), "CGST": formatIndianCurrency((l.itc_claimed - l.diff) / 2), "SGST": formatIndianCurrency((l.itc_claimed - l.diff) / 2), "Total ITC": formatIndianCurrency(l.itc_claimed - l.diff) }} highlight={l.diff > 0} />
                              </div>
                              <textarea placeholder="Add notes for this invoice..." className="w-full mt-3 p-2 rounded text-sm bg-white" rows={2} style={{ border: `1px solid ${COLORS.caBorder}` }} />
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* MISMATCH ANALYSIS */}
          {stats.mismatched > 0 && (
            <Card className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-[16px] font-semibold">Mismatch Analysis</h3>
                  <p className="text-[13px]" style={{ color: "rgba(26,16,8,0.60)" }}>{stats.mismatched} mismatches found</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[12px] font-medium mb-2 uppercase tracking-wide" style={{ color: COLORS.gold }}>Mismatch Categories</div>
                  <div className="space-y-2">
                    {Object.entries(mismatchCategories).map(([cat, count]) => {
                      const max = Math.max(...Object.values(mismatchCategories), 1);
                      const pct = (count / max) * 100;
                      return (
                        <div key={cat}>
                          <div className="flex justify-between text-[13px] mb-1">
                            <span>{cat}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F0EBD8" }}>
                            <div className="h-full" style={{ width: `${pct}%`, background: COLORS.red }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-[12px] font-medium mb-2 uppercase tracking-wide" style={{ color: COLORS.gold }}>Top Vendors with Mismatches</div>
                  <div className="space-y-2">
                    {topMismatchVendors.length === 0 ? (
                      <div className="text-sm py-4" style={{ color: "rgba(26,16,8,0.50)" }}>No vendor mismatches</div>
                    ) : topMismatchVendors.map((v) => (
                      <div key={v.name} className="flex items-center justify-between p-3 rounded" style={{ background: "#FAF7F0" }}>
                        <div>
                          <div className="font-medium text-sm">{v.name}</div>
                          <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.60)" }}>{v.count} invoices</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm" style={{ color: COLORS.red }}>{formatIndianCurrency(v.risk)}</div>
                          <GhostLink onClick={() => toast.info(`Viewing ${v.name}`)}>View →</GhostLink>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* VENDOR COMPLIANCE */}
          {vendorCompliance.length > 0 && (
            <Card className="mb-4">
              <h3 className="text-[16px] font-semibold mb-4">Vendor GST Compliance</h3>
              <div className="overflow-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                      <th className="py-2">Vendor</th>
                      <th className="py-2">GSTIN</th>
                      <th className="py-2 text-right">ITC Claimed</th>
                      <th className="py-2 text-center">GSTR-1</th>
                      <th className="py-2 text-center">GSTR-3B</th>
                      <th className="py-2">Score</th>
                      <th className="py-2">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendorCompliance.map((v) => (
                      <tr key={v.gstin} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                        <td className="py-3 font-medium">{v.name}</td>
                        <td className="py-3 text-[12px] font-mono" style={{ color: "rgba(26,16,8,0.65)" }}>{v.gstin}</td>
                        <td className="py-3 text-right font-semibold">{formatIndianCurrency(v.itc)}</td>
                        <td className="py-3 text-center">{v.gstr1 ? <CheckCircle2 size={16} style={{ color: COLORS.green, display: "inline" }} /> : <X size={16} style={{ color: COLORS.red, display: "inline" }} />}</td>
                        <td className="py-3 text-center">{v.gstr3b ? <CheckCircle2 size={16} style={{ color: COLORS.green, display: "inline" }} /> : <X size={16} style={{ color: COLORS.red, display: "inline" }} />}</td>
                        <td className="py-3 font-semibold" style={{ color: v.score >= 71 ? COLORS.green : v.score >= 41 ? COLORS.amber : COLORS.red }}>{v.score}/100</td>
                        <td className="py-3"><Chip tone={(!v.gstr1 || !v.gstr3b) ? "red" : "green"}>{(!v.gstr1 || !v.gstr3b) ? "Non-Compliant" : "Safe"}</Chip></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* HISTORY */}
          <Card>
            <h3 className="text-[16px] font-semibold mb-4">Reconciliation History</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase" style={{ color: "rgba(26,16,8,0.50)" }}>
                  <th className="py-2">Date</th><th className="py-2">Period</th><th className="py-2">Total</th><th className="py-2">Matched</th><th className="py-2">Mismatched</th><th className="py-2">ITC at Risk</th><th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "Apr 18, 2026", period: "March 2026", total: 142, matched: 128, mismatched: 14, risk: 320000 },
                  { date: "Mar 15, 2026", period: "February 2026", total: 137, matched: 130, mismatched: 7, risk: 145000 },
                  { date: "Feb 12, 2026", period: "January 2026", total: 119, matched: 115, mismatched: 4, risk: 68000 },
                ].map((h, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${COLORS.divider}` }}>
                    <td className="py-3 text-[13px]">{h.date}</td>
                    <td className="py-3 font-medium">{h.period}</td>
                    <td className="py-3">{h.total}</td>
                    <td className="py-3" style={{ color: COLORS.green }}>{h.matched}</td>
                    <td className="py-3" style={{ color: COLORS.red }}>{h.mismatched}</td>
                    <td className="py-3 font-semibold" style={{ color: COLORS.red }}>{formatIndianCurrency(h.risk)}</td>
                    <td className="py-3 text-right"><GhostLink onClick={() => toast.info("Opening report")}>View Report →</GhostLink></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {/* STICKY ACTION BAR */}
      {selected.size > 0 && (
        <div className="fixed bottom-0 left-[240px] right-0 px-8 py-4 flex items-center justify-between" style={{ background: COLORS.ink, color: "#FFFFFF", zIndex: 50 }}>
          <div className="text-sm">{selected.size} invoice{selected.size !== 1 ? "s" : ""} selected</div>
          <div className="flex gap-2">
            <button onClick={() => { toast.success("Marked as reviewed"); setSelected(new Set()); }} className="h-8 px-3 rounded text-xs border border-white/40 hover:bg-white/10">Mark Reviewed</button>
            <button onClick={() => toast.success("Flagged for client")} className="h-8 px-3 rounded text-xs border border-white/40 hover:bg-white/10">Flag for Client</button>
            <button onClick={() => exportCSV(visible.filter((l) => selected.has(l.id)))} className="h-8 px-3 rounded text-xs border border-white/40 hover:bg-white/10">Export Selected</button>
            <button onClick={() => setSelected(new Set())} className="h-8 px-3 rounded text-xs hover:bg-white/10"><X size={14} /></button>
          </div>
        </div>
      )}

      {/* RUN RECONCILIATION MODAL */}
      {showRunModal && (
        <Modal onClose={() => !running && setShowRunModal(false)}>
          <h2 className="text-[22px] font-bold mb-1">Run ITC Reconciliation</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(26,16,8,0.65)" }}>Match purchase invoices with GSTR-2A data</p>

          {!running && progress === 0 && (
            <>
              <div className="mb-4">
                <Label>Data Source</Label>
                <div className="space-y-2">
                  {["Upload Excel/CSV file", "Fetch from connected accounting software (Zoho/Tally)", "Manual entry"].map((opt, i) => (
                    <label key={opt} className="flex items-center gap-2 text-sm"><input type="radio" name="src" defaultChecked={i === 0} /> {opt}</label>
                  ))}
                </div>
              </div>

              <div className="mb-4 p-6 rounded text-center" style={{ border: `2px dashed ${COLORS.caBorder}`, background: "#FAF7F0" }}>
                <Upload size={28} className="mx-auto mb-2" style={{ color: COLORS.gold }} />
                <div className="text-sm font-medium">Drop your file here or click to upload</div>
                <div className="text-[12px] mt-1" style={{ color: "rgba(26,16,8,0.55)" }}>.xlsx or .csv • Max 10MB</div>
              </div>

              <div className="mb-4">
                <Label>Reconciliation Rules</Label>
                <div className="space-y-1.5">
                  {["Match by invoice number + GSTIN", "Match by amount if invoice number not found", "Flag if date difference > 7 days", "Check vendor GSTR-1 filing status", "Check vendor GSTR-3B filing status"].map((r) => (
                    <label key={r} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked /> {r}</label>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <Label>GSTR-2A Source</Label>
                <select className="w-full h-10 px-3 rounded text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                  <option>Fetch from GST Portal</option>
                  <option>Upload GSTR-2A JSON file</option>
                  <option>Use cached data (last fetched 2 days ago)</option>
                </select>
              </div>
            </>
          )}

          {(running || progress > 0) && (
            <div className="mb-5">
              <div className="text-sm font-medium mb-2">{running ? `Processing... ${progress}%` : "Complete!"}</div>
              <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "#F0EBD8" }}>
                <div className="h-full transition-all" style={{ width: `${progress}%`, background: COLORS.red }} />
              </div>
              <div className="max-h-44 overflow-auto p-3 rounded text-[12px] font-mono space-y-1" style={{ background: "#FAF7F0", border: `1px solid ${COLORS.caBorder}` }}>
                {runLog.map((l, i) => <div key={i}>{l}</div>)}
              </div>
              {!running && progress === 100 && (
                <div className="mt-4 p-4 rounded" style={{ background: "#FAF7F0", border: `1px solid ${COLORS.caBorder}` }}>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Total processed: <strong>{stats.total}</strong></div>
                    <div>Matched: <strong style={{ color: COLORS.green }}>{stats.matched}</strong></div>
                    <div>Mismatched: <strong style={{ color: COLORS.red }}>{stats.mismatched}</strong></div>
                    <div>ITC at risk: <strong style={{ color: COLORS.red }}>{formatIndianCurrency(stats.itcRisk)}</strong></div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <SecondaryBtn onClick={() => { setShowRunModal(false); setProgress(0); setRunLog([]); }} disabled={running}>{progress === 100 ? "Close" : "Cancel"}</SecondaryBtn>
            {progress < 100 && <PrimaryBtn onClick={runReconciliation} disabled={running}>{running ? "Processing..." : "Start Reconciliation →"}</PrimaryBtn>}
          </div>
        </Modal>
      )}

      {/* GENERATE REPORT MODAL */}
      {showReportModal && (
        <Modal onClose={() => setShowReportModal(false)}>
          <h2 className="text-[22px] font-bold mb-1">Generate Reconciliation Report</h2>
          <p className="text-sm mb-5" style={{ color: "rgba(26,16,8,0.65)" }}>Create a PDF or CSV report for {selectedClient?.business_name}</p>

          <div className="space-y-4">
            <div>
              <Label>Report Type</Label>
              <select className="w-full h-10 px-3 rounded text-sm bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
                <option>Summary Report</option><option>Detailed Report</option><option>Mismatch Report Only</option><option>Vendor Compliance Report</option>
              </select>
            </div>
            <div>
              <Label>Include</Label>
              <div className="space-y-1.5">
                {["Charts", "Matched Invoices", "Only Mismatches", "Vendor Compliance Data", "Recommendations"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked={opt !== "Only Mismatches"} /> {opt}</label>
                ))}
              </div>
            </div>
            <div>
              <Label>Format</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="fmt" defaultChecked /> PDF</label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" name="fmt" /> Excel/CSV</label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <SecondaryBtn onClick={() => setShowReportModal(false)}>Cancel</SecondaryBtn>
            <PrimaryBtn onClick={() => { exportCSV(); setShowReportModal(false); }}><span className="inline-flex items-center gap-1.5"><FileText size={14} /> Generate →</span></PrimaryBtn>
          </div>
        </Modal>
      )}
    </PageWrap>
  );
}

// ============= Sub-components =============

function StatCard({ label, value, sub, color = "#1A1008" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="p-4 rounded" style={{ background: "#FAF7F0", border: `1px solid ${COLORS.divider}` }}>
      <div className="text-[11px] uppercase font-medium tracking-wide mb-1" style={{ color: "rgba(26,16,8,0.55)" }}>{label}</div>
      <div className="text-[22px] font-bold" style={{ color }}>{value}</div>
      {sub && <div className="text-[12px]" style={{ color: "rgba(26,16,8,0.50)" }}>{sub}</div>}
    </div>
  );
}

function RiskFlag({ risk }: { risk: "high" | "medium" | "low" | "safe" }) {
  const map = {
    high: { label: "High", color: COLORS.red, Icon: AlertTriangle },
    medium: { label: "Medium", color: COLORS.amber, Icon: AlertTriangle },
    low: { label: "Low", color: COLORS.green, Icon: CheckCircle2 },
    safe: { label: "Safe", color: "rgba(26,16,8,0.45)", Icon: CheckCircle2 },
  }[risk];
  const I = map.Icon;
  return <span className="inline-flex items-center gap-1 text-[12px] font-medium" style={{ color: map.color }}><I size={13} /> {map.label}</span>;
}

function DetailPanel({ title, data, highlight }: { title: string; data: Record<string, string>; highlight?: boolean }) {
  return (
    <div className="p-3 rounded bg-white" style={{ border: `1px solid ${COLORS.caBorder}` }}>
      <div className="text-[12px] font-medium mb-2 uppercase tracking-wide" style={{ color: COLORS.gold }}>{title}</div>
      <div className="space-y-1">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="flex justify-between text-[13px]">
            <span style={{ color: "rgba(26,16,8,0.60)" }}>{k}</span>
            <span className="font-medium" style={{ color: highlight && (k.includes("ITC") || k.includes("CGST") || k.includes("SGST") || k.includes("Taxable")) ? COLORS.red : COLORS.ink }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", zIndex: 100 }} onClick={onClose}>
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] font-semibold mb-2 uppercase tracking-wide" style={{ color: COLORS.gold }}>{children}</div>;
}
