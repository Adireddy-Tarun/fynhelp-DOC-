import { useState, useMemo, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { IntelCard, ACCENT, Badge } from "../_primitives";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import {
  useMode, DEMO_BIZ,
  useBankTxns, useInvoices, useExpenses, useCustomers, useVendors,
  useGstFilings, useEmployees, useCAC, useSalesPipeline,
} from "../DataSource";

const QUICK_PROMPTS = [
  "What's my runway?",
  "Show me revenue trends",
  "Who are my top 3 overdue customers?",
  "Where should I cut costs?",
  "Am I GST compliant?",
];

const WELCOME = "Hi, I'm FYNNY — your virtual CFO. Ask me anything about your cash, revenue, costs, taxes, or growth. I see your financial data in real time.";

type Msg = { role: "user" | "assistant"; text: string };

function inr(n: number) {
  if (!isFinite(n) || n === 0) return "₹0";
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export default function AskFynnyTab() {
  const mode = useMode();
  const { data: bank } = useBankTxns();
  const { data: invoices } = useInvoices();
  const { data: expenses } = useExpenses();
  const { data: customers } = useCustomers();
  const { data: vendors } = useVendors();
  const { data: gst } = useGstFilings();
  const { data: emps } = useEmployees();
  const { data: cac } = useCAC();
  const { data: pipeline } = useSalesPipeline();

  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: WELCOME }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Build a compact context payload from the same data the dashboard renders.
  const context = useMemo(() => {
    const now = Date.now();
    const c30 = new Date(now - 30 * 86400000);
    const today = new Date().toISOString().slice(0, 10);
    const inv = invoices ?? [];
    const exp = expenses ?? [];

    const cash = bank?.[0]?.balance ?? 0;
    const burn = exp.filter((e) => new Date(e.date) >= c30).reduce((s, e) => s + Number(e.amount), 0);
    const revenue30 = inv.filter((i) => i.status === "paid" && i.payment_date && new Date(i.payment_date) >= c30).reduce((s, i) => s + Number(i.paid_amount), 0);
    const netBurn = Math.max(0, burn - revenue30);
    const runway = netBurn > 0 ? cash / netBurn : null;

    const totalRevenue = inv.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.paid_amount), 0);
    const outstanding = inv.reduce((s, i) => s + Number(i.outstanding_amount), 0);

    const overdue = inv
      .filter((i) => i.outstanding_amount > 0 && i.due_date && new Date(i.due_date) < new Date())
      .map((i) => ({
        customer: customers?.find((c) => c.id === i.customer_id)?.customer_name ?? "—",
        invoice: i.invoice_number,
        outstanding: Number(i.outstanding_amount),
        days_overdue: Math.floor((now - new Date(i.due_date!).getTime()) / 86400000),
      }))
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 5);

    const costsByCategory = (() => {
      const m = new Map<string, number>();
      exp.forEach((e) => m.set(e.category ?? "Other", (m.get(e.category ?? "Other") || 0) + Number(e.amount)));
      return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => ({ category: k, amount: v }));
    })();

    const nextGst = (gst ?? []).filter((g) => g.status !== "filed" && g.due_date && g.due_date >= today)[0];
    const filedGst = (gst ?? []).filter((g) => g.status === "filed").length;
    const pendingGst = (gst ?? []).filter((g) => g.status !== "filed").length;

    const activeEmps = (emps ?? []).filter((e) => e.status === "Active").length;
    const payroll = (emps ?? []).filter((e) => e.status === "Active").reduce((s, e) => s + Number(e.cost_to_company), 0);

    const latestCac = (cac ?? []).at(-1);
    const openDeals = (pipeline ?? []).filter((d) => !d.is_won && !d.is_lost);
    const pipelineValue = openDeals.reduce((s, d) => s + Number(d.deal_value), 0);

    return {
      cash_on_hand: { value: cash, pretty: inr(cash) },
      monthly_burn: { value: burn, pretty: inr(burn) },
      net_burn: { value: netBurn, pretty: inr(netBurn) },
      runway_months: runway ? Number(runway.toFixed(1)) : null,
      total_revenue: { value: totalRevenue, pretty: inr(totalRevenue) },
      revenue_last_30d: { value: revenue30, pretty: inr(revenue30) },
      receivables_outstanding: { value: outstanding, pretty: inr(outstanding) },
      top_overdue_customers: overdue,
      top_cost_categories: costsByCategory,
      gst: {
        next_due: nextGst ? { type: nextGst.filing_type, period: nextGst.period, due_date: nextGst.due_date, amount: Number(nextGst.net_payable) } : null,
        filed_count: filedGst,
        pending_count: pendingGst,
      },
      headcount: activeEmps,
      monthly_payroll: { value: payroll, pretty: inr(payroll) },
      cac: latestCac ? { value: Number(latestCac.cac), ltv_cac: Number(latestCac.ltv_cac_ratio), payback_months: Number(latestCac.payback_months) } : null,
      sales_pipeline: { open_deals: openDeals.length, total_value: inr(pipelineValue) },
      vendor_count: vendors?.length ?? 0,
      customer_count: customers?.length ?? 0,
    };
  }, [bank, invoices, expenses, customers, vendors, gst, emps, cac, pipeline]);

  // Lightweight on-device fallback used when the edge function is unavailable.
  function offlineAnswer(q: string): string {
    const t = q.toLowerCase();
    if (/runway|cash|how long/.test(t)) {
      return context.runway_months
        ? `Your cash on hand is **${context.cash_on_hand.pretty}** with net burn of **${context.net_burn.pretty}/mo** — that's **${context.runway_months} months** of runway. ${context.runway_months < 6 ? "Below 6 months: start raising or cut burn." : "Healthy buffer."}`
        : `Cash on hand is **${context.cash_on_hand.pretty}** and you're cash-flow positive — no burn to model runway against.`;
    }
    if (/revenue|sales|growth|mrr|arr/.test(t)) {
      return `Total paid revenue is **${context.total_revenue.pretty}**, with **${context.revenue_last_30d.pretty}** collected in the last 30 days across ${context.customer_count} customers. Open pipeline: **${context.sales_pipeline.total_value}** across ${context.sales_pipeline.open_deals} deals.`;
    }
    if (/overdue|receiv|collect|chase/.test(t)) {
      if (!context.top_overdue_customers.length) return "No overdue invoices right now — all receivables are on track.";
      const top = context.top_overdue_customers.slice(0, 3).map((o, i) => `${i + 1}. **${o.customer}** — ${inr(o.outstanding)} (${o.days_overdue}d overdue)`).join("\n");
      return `Top overdue customers:\n${top}\n\nTotal outstanding: **${context.receivables_outstanding.pretty}**.`;
    }
    if (/cost|spend|cut|expense|opex/.test(t)) {
      const top = context.top_cost_categories.slice(0, 3).map((c, i) => `${i + 1}. ${c.category} — **${inr(c.amount)}**`).join("\n");
      return `Your biggest cost categories:\n${top}\n\nQuick wins: audit SaaS subscriptions and consolidate vendors — typical SMEs save 8-12%.`;
    }
    if (/gst|tax|compliance|filing/.test(t)) {
      const next = context.gst.next_due;
      return `GST status: **${context.gst.filed_count} filed**, **${context.gst.pending_count} pending**. ${next ? `Next due: **${next.type}** for ${next.period} on ${next.due_date} (${inr(next.amount)}).` : "No upcoming filings due."}`;
    }
    if (/raise|fundrais|invest|round/.test(t)) {
      return `Quick read: runway ${context.runway_months ?? "∞"} mo, revenue ${context.revenue_last_30d.pretty}/mo, pipeline ${context.sales_pipeline.total_value}. ${context.runway_months && context.runway_months < 9 ? "Start conversations now — 6-9 month raise cycle." : "You have time; focus on growth metrics before approaching investors."}`;
    }
    if (/team|hire|payroll|employee|headcount/.test(t)) {
      return `Headcount: **${context.headcount} active employees**, monthly payroll **${context.monthly_payroll.pretty}**. That's ${context.revenue_last_30d.value > 0 ? `${((context.monthly_payroll.value / context.revenue_last_30d.value) * 100).toFixed(0)}% of monthly revenue` : "without revenue cover"}.`;
    }
    return `I can answer questions about cash, revenue, costs, receivables, GST, payroll, and fundraising. Try "What's my runway?" or "Where should I cut costs?"`;
  }

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: q }]);
    setLoading(true);

    try {
      track("ai_cfo_query_sent", { query_length: q.length });
      const { data, error } = await supabase.functions.invoke("fynny-chat", {
        body: { org_id: mode === "demo" ? DEMO_BIZ : "live", message: q, context },
      });
      const reply = (data as any)?.response;
      if (error || !reply) throw error || new Error("No response");
      track("ai_cfo_query_received", { response_length: String(reply).length });
      setMessages((m) => [...m, { role: "assistant", text: String(reply) }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: offlineAnswer(q) }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const renderText = (s: string) =>
    s.split("\n").map((line, i) => (
      <p key={i} className={i > 0 ? "mt-1" : ""}>
        {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j} className="font-mono tabular-nums">{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        )}
      </p>
    ));

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-4">
      <IntelCard className="!p-0" title={undefined}>
        <div className="px-5 py-3 border-b border-[rgba(26,16,8,0.08)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${ACCENT.red}, ${ACCENT.redLight})` }}>
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-serif text-base font-semibold text-fyn-ink">FYNNY — Virtual CFO</p>
              <p className="text-[11px] text-[#6B6B6B]">Powered by FYNNY · All data encrypted</p>
            </div>
          </div>
          <Badge tone="green">● ONLINE</Badge>
        </div>

        <div ref={scrollRef} className="p-5 space-y-3 min-h-[420px] max-h-[520px] overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-lg text-sm leading-relaxed ${m.role === "user" ? "text-white" : "text-fyn-ink"}`}
                style={m.role === "user" ? { background: ACCENT.red } : { background: "rgba(26,16,8,0.04)" }}
              >
                {renderText(m.text)}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-3.5 py-2.5 rounded-lg text-sm text-fyn-ink flex items-center gap-2" style={{ background: "rgba(26,16,8,0.04)" }}>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking…
              </div>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-[rgba(26,16,8,0.08)] flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Ask FYNNY anything…"
            disabled={loading}
            className="flex-1 px-3 py-2 text-sm bg-white rounded-md focus:outline-none focus:ring-2 disabled:opacity-60"
            style={{ border: "1px solid rgba(26,16,8,0.12)" }}
          />
          <button onClick={() => send(input)} disabled={loading || !input.trim()} className="px-3 rounded-md text-white disabled:opacity-50" style={{ background: ACCENT.red }}>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </IntelCard>

      <div className="space-y-3">
        <IntelCard title="Quick Actions">
          <div className="space-y-2">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => send(p)}
                disabled={loading}
                className="w-full text-left text-xs px-3 py-2 rounded-md text-fyn-ink transition-colors disabled:opacity-60"
                style={{ background: "rgba(26,16,8,0.04)" }}
              >
                {p}
              </button>
            ))}
          </div>
        </IntelCard>

        <IntelCard title="Today's Briefing">
          <ul className="space-y-2 text-xs text-fyn-ink">
            <li>• Cash: {context.cash_on_hand.pretty} {context.runway_months ? `(${context.runway_months} mo runway)` : "(profitable)"}</li>
            <li>• {context.top_overdue_customers.length} overdue invoices, {context.receivables_outstanding.pretty} outstanding</li>
            {context.gst.next_due && <li>• {context.gst.next_due.type} due {context.gst.next_due.due_date}</li>}
            <li>• Headcount: {context.headcount} · Payroll {context.monthly_payroll.pretty}/mo</li>
          </ul>
        </IntelCard>
      </div>
    </div>
  );
}
