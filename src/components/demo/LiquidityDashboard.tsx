import { useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  Lightbulb,
  Target,
  Calendar,
  Droplet,
  DollarSign,
  Clock,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CFOCard } from "@/components/ui/CFOCard";
import { GalaxyButton } from "@/components/ui/GalaxyButton";
import { RollingText } from "@/components/ui/RollingText";
import { InteractiveGraph } from "@/components/ui/InteractiveGraph";
import { colors, staggerContainer, fadeInUp } from "@/lib/design-system";

interface LiquidityDashboardProps {
  data?: any;
}

export function LiquidityDashboard({ data }: LiquidityDashboardProps) {
  // Use fallback data if none provided
  const liquidityData = data?.liquidity || {
    currentCash: 380000,
    monthlyBurn: 210000,
    runway: 1.8,
    topExpenses: [
      { category: "salary", amount: 180000 },
      { category: "rent", amount: 45000 },
      { category: "vendor", amount: 85000 },
      { category: "software", amount: 32000 },
      { category: "marketing", amount: 28000 },
    ],
    cashFlowTimeline: [
      { date: "2026-03-01", balance: 850000 },
      { date: "2026-03-15", balance: 780000 },
      { date: "2026-04-01", balance: 650000 },
      { date: "2026-04-15", balance: 520000 },
      { date: "2026-05-01", balance: 450000 },
      { date: "2026-05-15", balance: 380000 },
    ],
  };

  const { currentCash, monthlyBurn, runway, topExpenses, cashFlowTimeline } =
    liquidityData;

  const daysToZero = Math.floor(runway * 30);
  const zeroCashDate = new Date();
  zeroCashDate.setDate(zeroCashDate.getDate() + daysToZero);

  const topExpensesSum =
    topExpenses?.slice(0, 3).reduce(
      (sum: number, cat: any) => sum + cat.amount,
      0,
    ) ?? 0;

  // Cash Conversion Cycle (simplified for demo)
  const dso = 45; // Days Sales Outstanding
  const dio = 30; // Days Inventory Outstanding
  const dpo = 60; // Days Payable Outstanding
  const ccc = dso + dio - dpo;

  // Scenario planning
  const [scenario, setScenario] = useState<"base" | "best" | "worst">("base");
  const avgMonthlyRevenue = data?.revenue?.totalRevenue
    ? data.revenue.totalRevenue / 3
    : 140000;

  const scenarios = {
    base: {
      revenue: avgMonthlyRevenue,
      expenses: monthlyBurn,
      runway,
    },
    best: {
      revenue: avgMonthlyRevenue * 1.2,
      expenses: monthlyBurn * 0.95,
      runway: currentCash / Math.max(monthlyBurn * 0.95 - avgMonthlyRevenue * 0.2, 1),
    },
    worst: {
      revenue: avgMonthlyRevenue * 0.8,
      expenses: monthlyBurn * 1.1,
      runway: currentCash / Math.max(monthlyBurn * 1.1 - avgMonthlyRevenue * 0.8 * 0.5, 1),
    },
  };

  // Burn Multiple = monthly burn / net new ARR (simplified: 70% of revenue)
  const burnMultiple = monthlyBurn / Math.max(avgMonthlyRevenue * 0.7, 1);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Critical Alert Banner */}
      {runway < 3 && (
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden rounded-2xl border"
          style={{
            borderColor: `${colors.danger.main}55`,
            background: `linear-gradient(135deg, ${colors.danger.dark}33 0%, ${colors.bg.secondary} 60%)`,
          }}
        >
          <motion.div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: `${colors.danger.main}15` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative z-10 p-6 md:p-8">
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${colors.danger.main}30` }}
              >
                <AlertCircle size={24} color={colors.danger.light} />
              </div>
              <div>
                <h3
                  className="font-serif text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2"
                  style={{ color: colors.text.primary }}
                >
                  <AlertCircle size={22} color={colors.danger.light} />
                  URGENT: Cash Crisis in {daysToZero} Days
                </h3>
                <p style={{ color: colors.text.secondary }} className="text-sm">
                  Runway is below 3 months. Take action now.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Stat
                label="Current Position"
                value={`₹${(currentCash / 100000).toFixed(1)}L`}
                color={colors.text.primary}
              />
              <Stat
                label="Monthly Burn"
                value={`-₹${(monthlyBurn / 100000).toFixed(1)}L`}
                color={colors.danger.light}
              />
              <Stat
                label="Zero Cash Date"
                value={zeroCashDate.toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
                color={colors.warning.light}
              />
            </div>

            {/* Countdown */}
            <div
              className="rounded-xl p-5 mb-6 text-center border"
              style={{
                background: `${colors.danger.main}15`,
                borderColor: `${colors.danger.main}40`,
              }}
            >
              <div
                className="font-mono text-4xl md:text-5xl font-bold tracking-wider"
                style={{ color: colors.danger.light }}
              >
                {daysToZero} DAYS
              </div>
              <div
                style={{ color: colors.text.secondary }}
                className="text-xs uppercase tracking-widest mt-2"
              >
                Until cash runs out
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6">
              <h4
                className="font-semibold mb-3 flex items-center gap-2"
                style={{ color: colors.text.primary }}
              >
                <BarChart3 size={18} color={colors.accent[500]} />
                3 Actions to Extend Runway:
              </h4>
              <div className="space-y-2">
                {[
                  { label: "Delay vendor payments", impact: "+15 days" },
                  { label: "Accelerate receivables", impact: "+22 days" },
                  { label: "Cut marketing 50%", impact: "+18 days" },
                ].map((a) => (
                  <div
                    key={a.label}
                    className="flex items-center justify-between rounded-lg px-4 py-3 border"
                    style={{
                      background: colors.bg.tertiary,
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <span style={{ color: colors.text.secondary }}>
                      {a.label}
                    </span>
                    <span
                      className="font-mono font-semibold text-sm"
                      style={{ color: colors.success.light }}
                    >
                      {a.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <GalaxyButton variant="danger">
              <Target size={18} className="inline mr-2" />
              <RollingText text="Generate Action Plan" />
            </GalaxyButton>
          </div>
        </motion.div>
      )}

      {/* Top Stats — CFO Cards */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6"
      >
        <CFOCard
          title="Current Cash"
          value={currentCash / 100000}
          prefix="₹"
          suffix="L"
          icon={Droplet}
          status={runway < 3 ? "danger" : runway < 6 ? "warning" : "good"}
          subtitle="Available liquidity"
          trend={`${runway.toFixed(1)} months runway`}
        />
        <CFOCard
          title="Monthly Burn"
          value={monthlyBurn / 100000}
          prefix="₹"
          suffix="L"
          icon={TrendingDown}
          status="warning"
          subtitle="Avg outflow per month"
          trend="Trending up vs Q1"
        />
        <CFOCard
          title="Runway"
          value={runway}
          suffix=" mo"
          icon={Clock}
          status={runway < 3 ? "danger" : runway < 6 ? "warning" : "good"}
          subtitle="At current burn rate"
          trend={
            runway < 3
              ? "Critical — act now"
              : runway < 6
              ? "Caution"
              : "Healthy"
          }
        />
        <CFOCard
          title="Cash Conversion Cycle"
          value={ccc}
          suffix=" days"
          icon={Clock}
          status={ccc < 30 ? "good" : ccc < 60 ? "warning" : "danger"}
          subtitle="Cash tied up in operations"
          trend={ccc < 30 ? "Efficient" : ccc < 60 ? "Moderate" : "Needs improvement"}
        />
        <CFOCard
          title="Burn Multiple"
          value={burnMultiple.toFixed(2)}
          suffix="x"
          icon={TrendingDown}
          status={burnMultiple < 1 ? "good" : burnMultiple < 2 ? "warning" : "danger"}
          subtitle="Burn per ₹ of revenue"
          trend={burnMultiple < 1 ? "Capital efficient" : burnMultiple < 2 ? "Moderate" : "High burn"}
        />
      </motion.div>

      {/* CCC Breakdown */}
      <motion.div
        variants={fadeInUp}
        className="rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${colors.bg.secondary} 0%, ${colors.bg.tertiary} 100%)`,
          border: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <h4
          className="text-lg font-bold font-serif mb-4"
          style={{ color: colors.text.primary }}
        >
          Cash Conversion Cycle Breakdown
        </h4>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-xl" style={{ background: colors.bg.tertiary }}>
            <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>DSO</p>
            <p className="text-3xl font-bold font-mono mb-1" style={{ color: colors.info.main }}>
              {dso}
            </p>
            <p className="text-xs" style={{ color: colors.text.tertiary }}>Days to collect revenue</p>
          </div>

          <div className="text-center p-4 rounded-xl" style={{ background: colors.bg.tertiary }}>
            <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>DIO</p>
            <p className="text-3xl font-bold font-mono mb-1" style={{ color: colors.warning.main }}>
              {dio}
            </p>
            <p className="text-xs" style={{ color: colors.text.tertiary }}>Inventory holding period</p>
          </div>

          <div className="text-center p-4 rounded-xl" style={{ background: colors.bg.tertiary }}>
            <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>DPO</p>
            <p className="text-3xl font-bold font-mono mb-1" style={{ color: colors.success.main }}>
              {dpo}
            </p>
            <p className="text-xs" style={{ color: colors.text.tertiary }}>Days to pay vendors</p>
          </div>
        </div>

        <div
          className="mt-4 p-4 rounded-xl"
          style={{
            background: `${colors.info.main}15`,
            border: `1px solid ${colors.info.main}40`,
          }}
        >
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            <strong style={{ color: colors.text.primary }}>CCC Formula:</strong> {dso} (DSO) + {dio} (DIO) - {dpo} (DPO) ={" "}
            <strong style={{ color: colors.info.main }}>{ccc} days</strong>
          </p>
          <p className="text-xs mt-2" style={{ color: colors.text.tertiary }}>
            {ccc < 30
              ? "Excellent! Cash cycles quickly through operations."
              : ccc < 60
              ? "Moderate efficiency. Consider accelerating collections or extending payables."
              : "Slow cycle. Cash is tied up too long - prioritize working capital optimization."}
          </p>
        </div>
      </motion.div>

      {/* Cash Flow Chart */}
      <motion.div
        variants={fadeInUp}
        className="relative rounded-2xl border overflow-hidden"
        style={{
          background: colors.bg.card,
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 20% 0%, ${colors.primary[500]}22, transparent 60%)`,
          }}
        />
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3
              className="font-serif text-2xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Cash Flow Timeline
            </h3>
            <div className="flex gap-2">
              {["30 Days", "90 Days"].map((p) => (
                <button
                  key={p}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                  style={{
                    background: colors.bg.tertiary,
                    borderColor: "rgba(255,255,255,0.08)",
                    color: colors.text.secondary,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <InteractiveGraph
            data={cashFlowTimeline.map((item: { date: string; balance: number }) => ({
              label: new Date(item.date).toLocaleDateString('en-US', { month: 'short' }),
              value: item.balance,
            }))}
            height={320}
            formatValue={(v) => `₹${(v / 100000).toFixed(1)}L`}
          />
        </div>
      </motion.div>

      {/* 13-Week Cash Forecast */}
      {(() => {
        const forecast13Week = Array.from({ length: 13 }, (_, i) => {
          const weekDate = new Date();
          weekDate.setDate(weekDate.getDate() + i * 7);
          return {
            week: `W${i + 1}`,
            date: weekDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
            projected: currentCash - (monthlyBurn / 4) * i,
            actual: i < 2 ? currentCash - (monthlyBurn / 4) * i : null,
          };
        });
        return (
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl p-6"
            style={{
              background: `linear-gradient(135deg, ${colors.bg.secondary} 0%, ${colors.bg.tertiary} 100%)`,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <h3 className="text-2xl font-bold font-serif mb-6" style={{ color: colors.text.primary }}>
              13-Week Cash Forecast
            </h3>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={forecast13Week}>
                <defs>
                  <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.accent[500]} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={colors.accent[500]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  stroke={colors.text.tertiary}
                  style={{ fontSize: "11px", fontFamily: "JetBrains Mono" }}
                />
                <YAxis
                  stroke={colors.text.tertiary}
                  style={{ fontSize: "11px", fontFamily: "JetBrains Mono" }}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  contentStyle={{
                    background: colors.bg.tertiary,
                    border: `1px solid ${colors.accent[500]}`,
                    borderRadius: "12px",
                    fontFamily: "JetBrains Mono",
                  }}
                  formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Balance"]}
                />
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke={colors.accent[500]}
                  strokeWidth={3}
                  strokeDasharray="5 5"
                  dot={false}
                  fill="url(#forecastGradient)"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke={colors.primary[500]}
                  strokeWidth={3}
                  dot={{ fill: colors.primary[500], r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div
              className="mt-4 p-4 rounded-xl"
              style={{
                background: `${colors.accent[500]}15`,
                border: `1px solid ${colors.accent[500]}40`,
              }}
            >
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                Dotted line = projection at current burn. Week 8 shows cash below ₹2L (alert threshold). Plan capital raise or cut burn by W6.
              </p>
            </div>
          </motion.div>
        );
      })()}

      {/* Scenario Planning */}
      <motion.div
        variants={fadeInUp}
        className="rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${colors.bg.secondary} 0%, ${colors.bg.tertiary} 100%)`,
          border: `1px solid rgba(255, 255, 255, 0.1)`,
        }}
      >
        <h3
          className="text-2xl font-bold font-serif mb-6"
          style={{ color: colors.text.primary }}
        >
          Scenario Planning
        </h3>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {(["base", "best", "worst"] as const).map((s) => {
            const active = scenario === s;
            const accent =
              s === "best"
                ? colors.success.main
                : s === "worst"
                ? colors.danger.main
                : colors.primary[500];
            const accentDark =
              s === "best"
                ? colors.success.dark
                : s === "worst"
                ? colors.danger.dark
                : colors.primary[700];
            const Icon =
              s === "best" ? TrendingUp : s === "worst" ? AlertTriangle : BarChart3;
            const label =
              s === "base" ? "Base Case" : s === "best" ? "Best Case" : "Worst Case";
            return (
              <button
                key={s}
                onClick={() => setScenario(s)}
                className="flex-1 px-6 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`
                    : colors.bg.tertiary,
                  color: colors.text.primary,
                  boxShadow: active ? `0 0 0 2px ${accent}66` : "none",
                }}
              >
                <Icon size={18} />
                {label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl" style={{ background: colors.bg.tertiary }}>
            <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
              Monthly Revenue
            </p>
            <p
              className="text-3xl font-bold font-mono"
              style={{ color: colors.success.main }}
            >
              ₹{(scenarios[scenario].revenue / 100000).toFixed(1)}L
            </p>
            {scenario !== "base" && (
              <p className="text-sm mt-2" style={{ color: colors.text.tertiary }}>
                {scenario === "best" ? "+20%" : "-20%"} vs base
              </p>
            )}
          </div>

          <div className="p-6 rounded-xl" style={{ background: colors.bg.tertiary }}>
            <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
              Monthly Expenses
            </p>
            <p
              className="text-3xl font-bold font-mono"
              style={{ color: colors.danger.main }}
            >
              ₹{(scenarios[scenario].expenses / 100000).toFixed(1)}L
            </p>
            {scenario !== "base" && (
              <p className="text-sm mt-2" style={{ color: colors.text.tertiary }}>
                {scenario === "best" ? "-5%" : "+10%"} vs base
              </p>
            )}
          </div>

          <div className="p-6 rounded-xl" style={{ background: colors.bg.tertiary }}>
            <p className="text-sm mb-2" style={{ color: colors.text.secondary }}>
              New Runway
            </p>
            <p
              className="text-3xl font-bold font-mono"
              style={{
                color:
                  scenarios[scenario].runway > 3
                    ? colors.success.main
                    : colors.danger.main,
              }}
            >
              {scenarios[scenario].runway.toFixed(1)} mo
            </p>
            {scenario !== "base" && (
              <p className="text-sm mt-2" style={{ color: colors.text.tertiary }}>
                {scenarios[scenario].runway > runway ? "↑" : "↓"}{" "}
                {Math.abs(scenarios[scenario].runway - runway).toFixed(1)} months
              </p>
            )}
          </div>
        </div>

        <div
          className="mt-6 p-4 rounded-xl"
          style={{
            background: `${
              scenario === "best"
                ? colors.success.main
                : scenario === "worst"
                ? colors.danger.main
                : colors.info.main
            }15`,
            border: `1px solid ${
              scenario === "best"
                ? colors.success.main
                : scenario === "worst"
                ? colors.danger.main
                : colors.info.main
            }40`,
          }}
        >
          <p className="text-sm leading-relaxed" style={{ color: colors.text.secondary }}>
            {scenario === "base" &&
              "Current trajectory assuming no major changes in revenue or expenses."}
            {scenario === "best" &&
              "Optimistic scenario: 20% revenue growth + 5% cost reduction. Achieve this by closing 2-3 enterprise deals and optimizing vendor contracts."}
            {scenario === "worst" &&
              "Conservative scenario: 20% revenue drop + 10% cost increase. Prepare contingency plans if market conditions worsen or churn accelerates."}
          </p>
        </div>
      </motion.div>

      {/* AR Aging Buckets */}
      {(() => {
        const arAging = [
          { bucket: "0-30 days", amount: 125000, percent: 45, status: "good" as const },
          { bucket: "31-60 days", amount: 85000, percent: 30, status: "warning" as const },
          { bucket: "61-90 days", amount: 45000, percent: 16, status: "danger" as const },
          { bucket: "90+ days", amount: 25000, percent: 9, status: "danger" as const },
        ];
        const colorFor = (s: "good" | "warning" | "danger") =>
          s === "good" ? colors.success.main : s === "warning" ? colors.warning.main : colors.danger.main;
        return (
          <motion.div
            variants={fadeInUp}
            className="rounded-2xl p-6"
            style={{
              background: `linear-gradient(135deg, ${colors.bg.secondary} 0%, ${colors.bg.tertiary} 100%)`,
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold font-serif" style={{ color: colors.text.primary }}>
                Accounts Receivable Aging
              </h3>
              <Calendar size={24} style={{ color: colors.accent[500] }} />
            </div>

            <div className="space-y-4">
              {arAging.map((bucket, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold" style={{ color: colors.text.primary }}>
                      {bucket.bucket}
                    </span>
                    <span className="font-bold font-mono" style={{ color: colorFor(bucket.status) }}>
                      ₹{(bucket.amount / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: colors.bg.primary }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: colorFor(bucket.status) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${bucket.percent}%` }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                    {bucket.percent}% of receivables
                  </p>
                </motion.div>
              ))}
            </div>

            <div
              className="mt-6 p-4 rounded-xl"
              style={{
                background: `${colors.warning.main}15`,
                border: `1px solid ${colors.warning.main}40`,
              }}
            >
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                <strong style={{ color: colors.text.primary }}>Collection Priority:</strong> 25% overdue 60+ days. Focus on ₹70K in aging buckets. Consider 2% early payment discount.
              </p>
            </div>
          </motion.div>
        );
      })()}

      {/* Two columns */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top Expenses */}
        <Panel>
          <PanelHeader title="Top Expense Categories" icon={<DollarSign size={18} color={colors.accent[500]} />} />
          <div className="space-y-5">
            {topExpenses?.map((expense: any, idx: number) => {
              const percent = (expense.amount / monthlyBurn) * 100;
              return (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="capitalize font-semibold text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {expense.category}
                    </span>
                    <span
                      className="font-mono font-bold"
                      style={{ color: colors.text.primary }}
                    >
                      ₹{(expense.amount / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percent, 100)}%` }}
                      transition={{ duration: 1, delay: idx * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${colors.primary[500]}, ${colors.accent[500]})`,
                      }}
                    />
                  </div>
                  <div
                    className="text-xs mt-1"
                    style={{ color: colors.text.tertiary }}
                  >
                    {percent.toFixed(1)}% of total burn
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>

        {/* CFO Insights */}
        <Panel>
          <PanelHeader title="CFO Recommendations" icon={<Calendar size={18} color={colors.accent[500]} />} />
          <div className="space-y-3">
            <Insight
              icon={<AlertTriangle size={18} color={colors.warning.main} />}
              title="Prioritize Cash Collection"
              body={`With ${runway.toFixed(
                1,
              )} months runway, focus on accelerating receivables. Consider offering 2% early payment discounts.`}
              accent={colors.warning.main}
            />
            <Insight
              icon={<Lightbulb size={18} color={colors.info.main} />}
              title="Optimize Working Capital"
              body={`Negotiate extended payment terms with top 3 vendors. Could free up ₹${(
                (topExpensesSum * 0.5) /
                1000
              ).toFixed(0)}K in cash.`}
              accent={colors.info.main}
            />
            <Insight
              icon={<Target size={18} color={colors.primary[500]} />}
              title="Revenue Acceleration Needed"
              body={`Current burn requires ₹${(monthlyBurn / 100000).toFixed(
                1,
              )}L/month in new revenue to reach break-even. Consider upselling existing customers.`}
              accent={colors.primary[500]}
            />
          </div>

          <div className="mt-6">
            <GalaxyButton variant="primary">
              <BarChart3 size={18} className="inline mr-2" />
              <RollingText text="Run Cash Flow Scenarios" />
            </GalaxyButton>
          </div>
        </Panel>
      </motion.div>
    </motion.div>
  );
}

/* ─── Local sub-components ──────────────────────────────────────── */

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 border"
      style={{
        background: colors.bg.tertiary,
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div
        className="text-xs uppercase tracking-wider mb-1"
        style={{ color: colors.text.tertiary }}
      >
        {label}
      </div>
      <div className="font-mono text-xl font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        background: colors.bg.card,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </div>
  );
}

function PanelHeader({
  title,
  icon,
}: {
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3
        className="font-serif text-xl font-bold"
        style={{ color: colors.text.primary }}
      >
        {title}
      </h3>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: `${colors.accent[500]}15` }}
      >
        {icon}
      </div>
    </div>
  );
}

function Insight({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-4 border flex gap-3"
      style={{
        background: colors.bg.tertiary,
        borderColor: `${accent}33`,
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${accent}15` }}
      >
        {icon}
      </div>
      <div>
        <div
          className="font-semibold mb-1"
          style={{ color: colors.text.primary }}
        >
          {title}
        </div>
        <div
          className="text-sm leading-relaxed"
          style={{ color: colors.text.secondary }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

export default LiquidityDashboard;
