// Shared liquidity computation used by compute-liquidity (user-triggered),
// secure-data-import (post-import) and scheduled-insights-refresh (nightly).
// NULL means "cannot be computed" — never coerced to 0.
// deno-lint-ignore-file no-explicit-any

export type LiquidityResult = {
  business_id: string;
  cash_position: number | null;
  cash_source: "bank_balance" | "derived_balance" | "derived_cumulative" | "none";
  burn_rate_current: number | null;
  runway_months: number | null;
  runway_days: number | null;
  health_score: number | null;
  health_status: string;
  transactions_analyzed: number;
};

/** Today's calendar date in Asia/Kolkata as YYYY-MM-DD. */
export function istToday(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

function istDaysAgo(days: number): string {
  const [y, m, d] = istToday().split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - days);
  return dt.toISOString().slice(0, 10);
}

export async function computeAndStoreLiquidity(db: any, businessId: string): Promise<LiquidityResult> {
  const cutoff = istDaysAgo(30);

  const [{ data: accounts }, { data: latestBal }, { data: all, error: allErr }] = await Promise.all([
    db.from("bank_accounts").select("balance").eq("business_id", businessId).not("balance", "is", null),
    db.from("transactions").select("balance_after").eq("business_id", businessId)
      .not("balance_after", "is", null).order("date", { ascending: false })
      .order("created_at", { ascending: false }).limit(1),
    db.from("transactions").select("amount, direction, date").eq("business_id", businessId).limit(50000),
  ]);
  if (allErr) throw new Error(allErr.message);

  const txs = (all ?? []) as Array<{ amount: number; direction: string; date: string }>;
  let cash: number | null = null;
  let source: LiquidityResult["cash_source"] = "none";
  const accs = (accounts ?? []) as Array<{ balance: number | null }>;
  if (accs.length > 0) {
    cash = accs.reduce((s, a) => s + Number(a.balance ?? 0), 0);
    source = "bank_balance";
  } else if (latestBal?.[0]?.balance_after != null) {
    cash = Number(latestBal[0].balance_after);
    source = "derived_balance";
  } else if (txs.length > 0) {
    cash = txs.reduce((s, t) => s + (t.direction === "in" ? 1 : -1) * Number(t.amount), 0);
    source = "derived_cumulative";
  }

  const recent = txs.filter((t) => t.date >= cutoff);
  let burn: number | null = null;
  if (recent.length > 0) {
    const inn = recent.filter((t) => t.direction === "in").reduce((s, t) => s + Number(t.amount), 0);
    const out = recent.filter((t) => t.direction === "out").reduce((s, t) => s + Number(t.amount), 0);
    burn = Math.max(0, out - inn);
  }

  let runwayMonths: number | null = null;
  if (cash != null && burn != null && burn > 0) runwayMonths = Math.round((cash / burn) * 10) / 10;
  const runwayDays = runwayMonths != null ? Math.round(runwayMonths * 30) : null;

  let score: number | null = null;
  if (cash != null && burn != null) {
    if (burn === 0) score = cash > 0 ? 100 : 30;
    else if (runwayMonths! < 1) score = 10;
    else if (runwayMonths! < 3) score = 30;
    else if (runwayMonths! < 6) score = 60;
    else if (runwayMonths! < 12) score = 80;
    else score = 100;
  }
  const status = score == null ? "insufficient_data"
    : score >= 80 ? "healthy" : score >= 60 ? "watch" : score >= 30 ? "warning" : "critical";

  const result: LiquidityResult = {
    business_id: businessId,
    cash_position: cash,
    cash_source: source,
    burn_rate_current: burn,
    runway_months: runwayMonths,
    runway_days: runwayDays,
    health_score: score,
    health_status: status,
    transactions_analyzed: txs.length,
  };

  const now = new Date().toISOString();
  const { error } = await db.from("liquidity_metrics").upsert(
    { ...result, recorded_at: now, updated_at: now },
    { onConflict: "business_id" },
  );
  if (error) throw new Error(error.message);
  return result;
}
