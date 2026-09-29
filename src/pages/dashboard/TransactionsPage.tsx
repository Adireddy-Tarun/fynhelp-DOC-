import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Upload } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { fmtINR } from "@/components/intelligence/_primitives";

const PAGE = 50;

type Txn = {
  id: string;
  date: string;
  description: string | null;
  category: string | null;
  amount: number;
  direction: string;
  balance_after: number | null;
  counterparty: string | null;
  bank_account_id: string | null;
};

export default function TransactionsPage() {
  const { businessId } = useAuth();
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [dir, setDir] = useState<"all" | "in" | "out">("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => { setQ(search.trim()); setPage(0); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["sme-transactions", businessId, q, from, to, dir, page],
    enabled: !!businessId,
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("id, date, description, category, amount, direction, balance_after, counterparty, bank_account_id", { count: "exact" })
        .eq("business_id", businessId!)
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .range(page * PAGE, page * PAGE + PAGE - 1);
      if (q) query = query.ilike("description", `%${q.replace(/[%_]/g, "")}%`);
      if (from) query = query.gte("date", from);
      if (to) query = query.lte("date", to);
      if (dir !== "all") query = query.eq("direction", dir);
      const { data, error, count } = await query;
      if (error) throw error;
      return { rows: (data ?? []) as Txn[], count: count ?? 0 };
    },
  });

  const rows = data?.rows ?? [];
  const total = data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const filtered = !!(q || from || to || dir !== "all");

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold text-fyn-ink">Transactions</h1>
            <p className="text-sm text-fyn-ink/60">Every transaction imported for your business.</p>
          </div>
          <Link to="/dashboard/import" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-fyn-red">
            <Upload className="w-4 h-4" /> Upload statement
          </Link>
        </div>

        <div className="bg-white rounded-lg p-4 flex flex-wrap gap-3 items-end border border-fyn-ink/10">
          <label className="text-xs text-fyn-ink/60 flex flex-col gap-1 flex-1 min-w-[200px]">
            Search description
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="e.g. rent, salary"
              className="border border-fyn-ink/15 rounded-md px-3 py-2 text-sm text-fyn-ink" />
          </label>
          <label className="text-xs text-fyn-ink/60 flex flex-col gap-1">
            From
            <input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} className="border border-fyn-ink/15 rounded-md px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-fyn-ink/60 flex flex-col gap-1">
            To
            <input type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(0); }} className="border border-fyn-ink/15 rounded-md px-3 py-2 text-sm" />
          </label>
          <label className="text-xs text-fyn-ink/60 flex flex-col gap-1">
            Type
            <select value={dir} onChange={(e) => { setDir(e.target.value as "all" | "in" | "out"); setPage(0); }} className="border border-fyn-ink/15 rounded-md px-3 py-2 text-sm">
              <option value="all">All</option>
              <option value="in">Credits (money in)</option>
              <option value="out">Debits (money out)</option>
            </select>
          </label>
        </div>

        <div className="bg-white rounded-lg border border-fyn-ink/10 overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-sm text-fyn-ink/60">Loading transactions…</div>
          ) : error ? (
            <div className="p-8 text-sm text-fyn-red">Could not load transactions. Please refresh.</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="text-base font-semibold text-fyn-ink">{filtered ? "No transactions match these filters" : "No transactions yet"}</div>
              {!filtered && (
                <Link to="/dashboard/import" className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold text-white bg-fyn-red">
                  <Upload className="w-4 h-4" /> Upload
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs uppercase text-fyn-ink/50 border-b border-fyn-ink/10">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-right p-3">Debit</th>
                  <th className="text-right p-3">Credit</th>
                  <th className="text-right p-3">Balance</th>
                  <th className="text-left p-3">Source</th>
                </tr>
              </thead>
              <tbody className="font-mono tabular-nums">
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-fyn-ink/5">
                    <td className="p-3 whitespace-nowrap">{new Date(`${t.date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                    <td className="p-3 font-sans">{t.description || "—"}</td>
                    <td className="p-3 font-sans text-fyn-ink/70">{t.category || "—"}</td>
                    <td className="p-3 text-right text-fyn-red">{t.direction === "out" ? fmtINR(Number(t.amount)) : ""}</td>
                    <td className="p-3 text-right text-emerald-700">{t.direction === "in" ? fmtINR(Number(t.amount)) : ""}</td>
                    <td className="p-3 text-right">{t.balance_after == null ? "—" : fmtINR(Number(t.balance_after))}</td>
                    <td className="p-3 font-sans text-fyn-ink/60">{t.bank_account_id ? "Bank feed" : "Statement upload"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {total > 0 && (
          <div className="flex items-center justify-between text-sm text-fyn-ink/70">
            <span className="font-mono tabular-nums">{page * PAGE + 1}–{Math.min(total, (page + 1) * PAGE)} of {total}</span>
            <div className="flex gap-2">
              <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="px-3 py-1.5 rounded-md border border-fyn-ink/15 disabled:opacity-40">Previous</button>
              <button disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1.5 rounded-md border border-fyn-ink/15 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
