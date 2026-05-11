import { useEffect, useMemo, useState } from "react";
import {
  Users, UserPlus, Calendar, CalendarRange, Search, Download, RefreshCw,
  CheckCircle2, RotateCcw, Trash2, ChevronUp, ChevronDown, X,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type WaitlistRow = {
  id: string;
  email: string | null;
  name: string | null;
  company_name: string | null;
  phone: string | null;
  company_type: string | null;
  company_size: string | null;
  location: string | null;
  position: number | null;
  is_converted: boolean | null;
  created_at: string;
};

type SortKey = keyof WaitlistRow;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

function convertedBadge(c: boolean | null) {
  const cfg = c
    ? { bg: "rgba(15,123,79,0.15)",  fg: "#0F7B4F", label: "Converted" }
    : { bg: "rgba(139,105,20,0.15)", fg: "#8B6914", label: "Pending" };
  return (
    <span style={{
      background: cfg.bg, color: cfg.fg,
      padding: "3px 10px", borderRadius: 6,
      fontFamily: "DM Sans, sans-serif", fontWeight: 700, fontSize: 11,
      whiteSpace: "nowrap",
    }}>{cfg.label}</span>
  );
}

function fmtDate(s: string) {
  try {
    const d = new Date(s);
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return s; }
}

function csvEscape(v: unknown) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function AdminWaitlistPage() {
  const [rows, setRows] = useState<WaitlistRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [convertedFilter, setConvertedFilter] = useState<"all" | "converted" | "pending">("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  async function load() {
    setLoading(true); setError(null);
    const { data, error } = await supabase
      .from("waitlist")
      .select("id,email,name,company_name,phone,company_type,company_size,location,position,is_converted,created_at")
      .order("created_at", { ascending: false });
    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      setRows((data ?? []) as WaitlistRow[]);
    }
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // Stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0,0,0,0);
    const startOfWeek = new Date(startOfDay);
    const dow = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - dow);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let today = 0, week = 0, month = 0, converted = 0;
    for (const r of rows) {
      const t = new Date(r.created_at).getTime();
      if (t >= startOfDay.getTime()) today++;
      if (t >= startOfWeek.getTime()) week++;
      if (t >= startOfMonth.getTime()) month++;
      if (r.is_converted) converted++;
    }
    return { total: rows.length, today, week, month, converted };
  }, [rows]);

  // Distinct dropdown options
  const companyOptions = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => { const v = (r.company_name ?? "").trim(); if (v) s.add(v); });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const locationOptions = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => { const v = (r.location ?? "").trim(); if (v) s.add(v); });
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // Filter — search matches name OR email; dropdowns narrow by converted/company/location.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (convertedFilter === "converted" && !r.is_converted) return false;
      if (convertedFilter === "pending" && r.is_converted) return false;
      if (companyFilter !== "all" && (r.company_name ?? "").trim() !== companyFilter) return false;
      if (locationFilter !== "all" && (r.location ?? "").trim() !== locationFilter) return false;
      if (!q) return true;
      return [r.name, r.email].some(
        (v) => (v ?? "").toString().toLowerCase().includes(q)
      );
    });
  }, [rows, search, convertedFilter, companyFilter, locationFilter]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let av: unknown, bv: unknown;
      if (sortKey === "created_at") {
        av = new Date(a.created_at).getTime(); bv = new Date(b.created_at).getTime();
      } else if (sortKey === "position") {
        av = a.position ?? 0; bv = b.position ?? 0;
      } else if (sortKey === "is_converted") {
        av = a.is_converted ? 1 : 0; bv = b.is_converted ? 1 : 0;
      } else {
        av = (a[sortKey] ?? "") as string; bv = (b[sortKey] ?? "") as string;
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase(), bs = String(bv).toLowerCase();
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, convertedFilter, companyFilter, locationFilter]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  }

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleAllOnPage() {
    const allSelected = pageRows.every((r) => selected.has(r.id));
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) pageRows.forEach((r) => next.delete(r.id));
      else pageRows.forEach((r) => next.add(r.id));
      return next;
    });
  }

  async function setConverted(ids: string[], value: boolean) {
    if (!ids.length) return;
    const { error } = await supabase
      .from("waitlist")
      .update({ is_converted: value })
      .in("id", ids);
    if (error) { toast.error(`Update failed: ${error.message}`); return; }
    setRows((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, is_converted: value } : r));
    toast.success(`${value ? "Marked" : "Unmarked"} ${ids.length} as converted`);
  }

  async function deleteRows(ids: string[]) {
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} waitlist ${ids.length === 1 ? "entry" : "entries"}? This cannot be undone.`)) return;
    const { error } = await supabase
      .from("waitlist")
      .delete()
      .in("id", ids);
    if (error) { toast.error(`Delete failed: ${error.message}`); return; }
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    toast.success(`Deleted ${ids.length} ${ids.length === 1 ? "entry" : "entries"}`);
  }

  function exportCsv() {
    const cols: { key: keyof WaitlistRow | "converted"; label: string }[] = [
      { key: "position", label: "Position" },
      { key: "email", label: "Email" },
      { key: "name", label: "Name" },
      { key: "company_name", label: "Company" },
      { key: "phone", label: "Phone" },
      { key: "company_type", label: "Type" },
      { key: "company_size", label: "Size" },
      { key: "location", label: "Location" },
      { key: "converted", label: "Converted" },
      { key: "created_at", label: "Created At" },
    ];
    const header = cols.map((c) => csvEscape(c.label)).join(",");
    const lines = sorted.map((r) =>
      cols.map((c) => {
        if (c.key === "converted") return csvEscape(r.is_converted ? "yes" : "no");
        return csvEscape((r as any)[c.key]);
      }).join(",")
    );
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `waitlist-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${sorted.length} rows`);
  }

  function clearFilters() {
    setSearch("");
    setConvertedFilter("all");
    setCompanyFilter("all");
    setLocationFilter("all");
  }

  const allOnPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const selectedIds = Array.from(selected);
  const hasFilters = search || convertedFilter !== "all" || companyFilter !== "all" || locationFilter !== "all";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 32, color: "hsl(var(--fyn-ink))", letterSpacing: -0.5 }}>
            Waitlist
          </h1>
          <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.6)", marginTop: 4 }}>
            Manage early-access signups from the public waitlist form.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} disabled={loading} style={btnGhost} aria-label="Refresh">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={exportCsv} disabled={!sorted.length} style={btnPrimary}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard icon={<Users size={20} color="#8B6914" />} label="Total Signups" value={stats.total} />
        <StatCard icon={<CheckCircle2 size={20} color="#0F7B4F" />} label="Converted" value={stats.converted} />
        <StatCard icon={<UserPlus size={20} color="#8B6914" />} label="Today" value={stats.today} />
        <StatCard icon={<Calendar size={20} color="#8B6914" />} label="This Week" value={stats.week} />
        <StatCard icon={<CalendarRange size={20} color="#8B6914" />} label="This Month" value={stats.month} />
      </div>

      {/* Toolbar */}
      <div style={cardStyle} className="mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px]" style={{
            background: "#fff", border: "1px solid rgba(26,16,8,0.12)",
            borderRadius: 10, padding: "8px 12px",
          }}>
            <Search size={16} color="hsl(var(--fyn-ink) / 0.5)" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              style={{ flex: 1, border: "none", outline: "none", fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink))", background: "transparent" }}
            />
            {search && (
              <button onClick={() => setSearch("")} aria-label="Clear search" style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2 }}>
                <X size={14} color="hsl(var(--fyn-ink) / 0.5)" />
              </button>
            )}
          </div>

          <select value={convertedFilter} onChange={(e) => setConvertedFilter(e.target.value as any)} style={selectStyle}>
            <option value="all">All status</option>
            <option value="converted">Converted</option>
            <option value="pending">Pending</option>
          </select>

          <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} style={selectStyle}>
            <option value="all">All companies ({companyOptions.length})</option>
            {companyOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} style={selectStyle}>
            <option value="all">All locations ({locationOptions.length})</option>
            {locationOptions.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearFilters} style={btnGhost}>
              <X size={14} /> Clear
            </button>
          )}

          <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 13, color: "hsl(var(--fyn-ink) / 0.6)" }}>
            {sorted.length} {sorted.length === 1 ? "result" : "results"}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 pt-3" style={{ borderTop: "1px dashed rgba(26,16,8,0.12)" }}>
            <span style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, color: "hsl(var(--fyn-ink))" }}>
              {selectedIds.length} selected
            </span>
            <button onClick={() => setConverted(selectedIds, true)} style={btnGhost}>
              <CheckCircle2 size={14} /> Mark converted
            </button>
            <button onClick={() => setConverted(selectedIds, false)} style={btnGhost}>
              <RotateCcw size={14} /> Mark pending
            </button>
            <button onClick={() => deleteRows(selectedIds)} style={{ ...btnGhost, color: "#C41E1E", borderColor: "rgba(196,30,30,0.3)" }}>
              <Trash2 size={14} /> Delete
            </button>
            <button onClick={() => setSelected(new Set())} style={btnGhost}>Clear</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={cardStyle}>
        {error ? (
          <div className="py-12 text-center">
            <p style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "#C41E1E" }}>
              Failed to load waitlist: {error}
            </p>
          </div>
        ) : loading ? (
          <div className="py-12 text-center" style={{ fontFamily: "Roboto, sans-serif", fontSize: 14, color: "hsl(var(--fyn-ink) / 0.6)" }}>
            Loading…
          </div>
        ) : sorted.length === 0 ? (
          <div className="py-16 text-center">
            <UserPlus size={36} color="hsl(var(--fyn-ink) / 0.3)" style={{ margin: "0 auto 12px" }} />
            <p style={{ fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 16, color: "hsl(var(--fyn-ink))" }}>
              {rows.length === 0 ? "No waitlist signups yet" : "No matches for your filters"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Roboto, sans-serif", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(26,16,8,0.1)" }}>
                    <Th>
                      <input type="checkbox" checked={allOnPageSelected} onChange={toggleAllOnPage} aria-label="Select all on page" />
                    </Th>
                    <SortableTh label="Email" k="email" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Name" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Company" k="company_name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Phone" k="phone" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Type" k="company_type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Size" k="company_size" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Location" k="location" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Position" k="position" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Status" k="is_converted" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <SortableTh label="Created" k="created_at" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                    <Th>Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.id} style={{
                      borderBottom: "1px solid rgba(26,16,8,0.06)",
                      background: selected.has(r.id) ? "rgba(139,105,20,0.06)" : "transparent",
                    }}>
                      <Td>
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleRow(r.id)} aria-label={`Select ${r.email}`} />
                      </Td>
                      <Td><span style={{ color: "hsl(var(--fyn-ink))", fontWeight: 500 }}>{r.email ?? "—"}</span></Td>
                      <Td>{r.name ?? "—"}</Td>
                      <Td>{r.company_name ?? "—"}</Td>
                      <Td>{r.phone ?? "—"}</Td>
                      <Td>{r.company_type ?? "—"}</Td>
                      <Td>{r.company_size ?? "—"}</Td>
                      <Td>{r.location ?? "—"}</Td>
                      <Td><span style={{ fontFamily: "JetBrains Mono, monospace", color: "#8B6914", fontWeight: 600 }}>{r.position != null ? `#${r.position}` : "—"}</span></Td>
                      <Td>{convertedBadge(r.is_converted)}</Td>
                      <Td><span style={{ color: "hsl(var(--fyn-ink) / 0.7)", whiteSpace: "nowrap" }}>{fmtDate(r.created_at)}</span></Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          {r.is_converted ? (
                            <button onClick={() => setConverted([r.id], false)} title="Mark pending" style={iconBtn}>
                              <RotateCcw size={15} color="#8B6914" />
                            </button>
                          ) : (
                            <button onClick={() => setConverted([r.id], true)} title="Mark converted" style={iconBtn}>
                              <CheckCircle2 size={15} color="#0F7B4F" />
                            </button>
                          )}
                          <button onClick={() => deleteRows([r.id])} title="Delete" style={iconBtn}>
                            <Trash2 size={15} color="#C41E1E" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid rgba(26,16,8,0.06)" }}>
              <span style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)" }}>
                Page {safePage} of {totalPages} · {sorted.length} total
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} style={btnGhost}>Prev</button>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={btnGhost}>Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────── helpers ───────── */

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid hsl(var(--fyn-ink) / 0.08)",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 2px 8px hsl(var(--fyn-ink) / 0.04)",
};

const btnGhost: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "#fff", border: "1px solid rgba(26,16,8,0.15)",
  borderRadius: 8, padding: "8px 12px",
  fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13,
  color: "hsl(var(--fyn-ink))", cursor: "pointer",
};

const btnPrimary: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 6,
  background: "linear-gradient(135deg, #C41E1E 0%, #8B6914 100%)",
  color: "#fff", border: "none", borderRadius: 8, padding: "10px 16px",
  fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13,
  cursor: "pointer", boxShadow: "0 2px 8px rgba(196,30,30,0.25)",
};

const selectStyle: React.CSSProperties = {
  background: "#fff", border: "1px solid rgba(26,16,8,0.12)", borderRadius: 10,
  padding: "10px 14px", fontFamily: "Roboto, sans-serif", fontSize: 14,
  color: "hsl(var(--fyn-ink))", outline: "none", maxWidth: 240,
};

const iconBtn: React.CSSProperties = {
  background: "transparent", border: "none", cursor: "pointer",
  padding: 6, borderRadius: 6, display: "grid", placeItems: "center",
};

type SortKey2 = SortKey;
type SortDir2 = SortDir;

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={cardStyle}>
      <div className="flex items-center justify-between mb-2">{icon}</div>
      <div style={{ fontFamily: "Oswald, sans-serif", fontWeight: 700, fontSize: 32, color: "hsl(var(--fyn-ink))", lineHeight: 1 }}>
        {value.toLocaleString("en-IN")}
      </div>
      <div style={{ fontFamily: "Roboto, sans-serif", fontSize: 12, color: "hsl(var(--fyn-ink) / 0.6)", marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      textAlign: "left", padding: "10px 12px",
      fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 11,
      color: "hsl(var(--fyn-ink) / 0.6)", textTransform: "uppercase", letterSpacing: 0.5,
    }}>{children}</th>
  );
}

function SortableTh({
  label, k, sortKey, sortDir, onSort,
}: { label: string; k: SortKey2; sortKey: SortKey2; sortDir: SortDir2; onSort: (k: SortKey2) => void }) {
  const active = sortKey === k;
  return (
    <th style={{ textAlign: "left", padding: "10px 12px" }}>
      <button
        onClick={() => onSort(k)}
        style={{
          background: "transparent", border: "none", cursor: "pointer",
          display: "inline-flex", alignItems: "center", gap: 4,
          fontFamily: "Raleway, sans-serif", fontWeight: 600, fontSize: 11,
          color: active ? "hsl(var(--fyn-ink))" : "hsl(var(--fyn-ink) / 0.6)",
          textTransform: "uppercase", letterSpacing: 0.5, padding: 0,
        }}
      >
        {label}
        {active && (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />)}
      </button>
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "12px", color: "hsl(var(--fyn-ink) / 0.85)", verticalAlign: "middle" }}>{children}</td>;
}
