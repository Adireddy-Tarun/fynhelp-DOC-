import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Zap,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CFOCard } from "@/components/ui/CFOCard";
import { colors, staggerContainer, fadeInUp } from "@/lib/design-system";

export function RevenueDashboard({ data }: { data: any }) {
  const revenueData = data?.revenue || {
    totalRevenue: 420000,
    transactions: 8,
  };

  const { totalRevenue, transactions } = revenueData;

  // Core metrics
  const avgMonthlyRevenue = totalRevenue / 3;
  const mrr = avgMonthlyRevenue * 0.7;
  const arr = mrr * 12;
  const growthRate = 15;

  // SaaS metrics
  const arpu = avgMonthlyRevenue / Math.max(transactions || 10, 1);
  const grossMargin = 0.75;
  const churnRate = 0.021;
  const ltv = (arpu * grossMargin) / churnRate;
  const cac = 45000;
  const ltvCacRatio = ltv / cac;
  const paybackMonths = cac / (arpu * grossMargin);

  // Magic Number
  const netNewArr = arr * 0.25;
  const salesMarketingSpend = 180000;
  const magicNumber = netNewArr / salesMarketingSpend;

  // Rule of 40
  const profitMargin = -15;
  const ruleOf40 = growthRate + profitMargin;

  // Churn breakdown
  const logoChurn = 2.1;
  const revenueChurn = 1.8;

  // Trend
  const monthlyRevenue = [
    { month: "Oct", revenue: avgMonthlyRevenue * 0.65, target: avgMonthlyRevenue * 0.7 },
    { month: "Nov", revenue: avgMonthlyRevenue * 0.75, target: avgMonthlyRevenue * 0.8 },
    { month: "Dec", revenue: avgMonthlyRevenue * 0.85, target: avgMonthlyRevenue * 0.9 },
    { month: "Jan", revenue: avgMonthlyRevenue * 0.92, target: avgMonthlyRevenue * 0.95 },
    { month: "Feb", revenue: avgMonthlyRevenue * 0.98, target: avgMonthlyRevenue },
    { month: "Mar", revenue: avgMonthlyRevenue, target: avgMonthlyRevenue * 1.05 },
  ];

  // Cohort retention
  const cohortData = [
    { cohort: "Jan 2026", values: [100, 92, 87, 85] as (number | null)[] },
    { cohort: "Feb 2026", values: [100, 94, 89, null] as (number | null)[] },
    { cohort: "Mar 2026", values: [100, 95, null, null] as (number | null)[] },
  ];

  // Revenue sources
  const revenueSources = [
    { source: "Product Sales", amount: totalRevenue * 0.45, percent: 45, color: colors.primary[500] },
    { source: "Services", amount: totalRevenue * 0.3, percent: 30, color: colors.accent[500] },
    { source: "Subscriptions", amount: totalRevenue * 0.15, percent: 15, color: colors.info.main },
    { source: "Other", amount: totalRevenue * 0.1, percent: 10, color: colors.success.main },
  ];

  const sectionPanel = {
    background: `linear-gradient(135deg, ${colors.bg.secondary} 0%, ${colors.bg.tertiary} 100%)`,
    border: "1px solid rgba(255, 255, 255, 0.1)",
  } as const;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      {/* Growth Momentum Banner */}
      <motion.div
        variants={fadeInUp}
        className="rounded-2xl p-8"
        style={{
          background: `linear-gradient(135deg, ${colors.primary[700]} 0%, ${colors.primary[900]} 100%)`,
          border: `1px solid ${colors.accent[500]}40`,
        }}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp size={28} style={{ color: colors.accent[500] }} />
              <h2 className="text-2xl font-bold font-serif" style={{ color: colors.text.primary }}>
                Revenue Momentum: Accelerating
              </h2>
            </div>
            <div className="grid grid-cols-3 gap-8 mt-4">
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Current MRR</p>
                <p className="text-3xl font-mono font-bold mt-1" style={{ color: colors.text.primary }}>
                  ₹{(mrr / 100000).toFixed(1)}L
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Annual Run Rate</p>
                <p className="text-3xl font-mono font-bold mt-1" style={{ color: colors.text.primary }}>
                  ₹{(arr / 10000000).toFixed(2)}Cr
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: colors.text.tertiary }}>Growth Rate</p>
                <p className="text-3xl font-mono font-bold mt-1" style={{ color: colors.success.main }}>
                  +{growthRate}% MoM
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 min-w-[200px]">
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: colors.text.secondary }}>Product sales</span>
              <span className="font-mono font-semibold" style={{ color: colors.success.main }}>↑ 23% MoM</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: colors.text.secondary }}>New customers</span>
              <span className="font-mono font-semibold" style={{ color: colors.text.primary }}>+{transactions}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span style={{ color: colors.text.secondary }}>Churn rate</span>
              <span className="font-mono font-semibold" style={{ color: colors.success.main }}>{(churnRate * 100).toFixed(1)}% ↓</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Stats - 5 CFO Cards */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6"
      >
        <CFOCard
          title="Total Revenue"
          value={totalRevenue / 100000}
          prefix="₹"
          suffix="L"
          icon={DollarSign}
          status="good"
          subtitle="Last 3 months"
          trend={`+${growthRate}% MoM`}
        />
        <CFOCard
          title="ARPU"
          value={arpu / 1000}
          prefix="₹"
          suffix="K"
          icon={Users}
          status="good"
          subtitle="Avg revenue per user"
          trend="Per customer/month"
        />
        <CFOCard
          title="LTV : CAC"
          value={`${ltvCacRatio.toFixed(1)}:1`}
          icon={Target}
          status={ltvCacRatio > 3 ? "good" : "warning"}
          subtitle="Unit economics"
          trend={ltvCacRatio > 3 ? "Efficient" : "Needs work"}
        />
        <CFOCard
          title="Magic Number"
          value={magicNumber.toFixed(2)}
          icon={Zap}
          status={magicNumber > 0.75 ? "good" : "warning"}
          subtitle="Sales efficiency"
          trend={magicNumber > 0.75 ? "Efficient" : "Invest more"}
        />
        <CFOCard
          title="Rule of 40"
          value={`${ruleOf40}%`}
          icon={Award}
          status={ruleOf40 > 40 ? "good" : "danger"}
          subtitle="Growth + Profit"
          trend={ruleOf40 > 40 ? "Healthy" : "Below target"}
        />
      </motion.div>

      {/* METRIC 1: LTV:CAC Breakdown */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-8" style={sectionPanel}>
        <h3 className="text-2xl font-bold font-serif mb-6" style={{ color: colors.text.primary }}>
          Unit Economics Breakdown
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LTV */}
          <div
            className="p-6 rounded-xl"
            style={{ background: colors.bg.primary, border: `1px solid ${colors.success.main}30` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Award size={20} style={{ color: colors.success.main }} />
              <h4 className="font-semibold" style={{ color: colors.text.primary }}>Lifetime Value (LTV)</h4>
            </div>
            <p className="text-4xl font-mono font-bold mb-4" style={{ color: colors.success.main }}>
              ₹{(ltv / 1000).toFixed(0)}K
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: colors.text.tertiary }}>ARPU (monthly)</span>
                <span className="font-mono" style={{ color: colors.text.primary }}>₹{(arpu / 1000).toFixed(0)}K</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.text.tertiary }}>Gross Margin</span>
                <span className="font-mono" style={{ color: colors.text.primary }}>{(grossMargin * 100).toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.text.tertiary }}>Churn Rate</span>
                <span className="font-mono" style={{ color: colors.text.primary }}>{(churnRate * 100).toFixed(1)}%</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-mono" style={{ color: colors.text.tertiary }}>
                Formula: (₹{(arpu / 1000).toFixed(0)}K × {(grossMargin * 100).toFixed(0)}%) ÷ {(churnRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* CAC */}
          <div
            className="p-6 rounded-xl"
            style={{ background: colors.bg.primary, border: `1px solid ${colors.warning.main}30` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} style={{ color: colors.warning.main }} />
              <h4 className="font-semibold" style={{ color: colors.text.primary }}>Customer Acquisition Cost (CAC)</h4>
            </div>
            <p className="text-4xl font-mono font-bold mb-4" style={{ color: colors.warning.main }}>
              ₹{(cac / 1000).toFixed(0)}K
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: colors.text.tertiary }}>Sales & Marketing</span>
                <span className="font-mono" style={{ color: colors.text.primary }}>₹{(salesMarketingSpend / 1000).toFixed(0)}K/qtr</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.text.tertiary }}>New Customers</span>
                <span className="font-mono" style={{ color: colors.text.primary }}>{Math.ceil(salesMarketingSpend / cac)}/qtr</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.text.tertiary }}>Payback Period</span>
                <span className="font-mono" style={{ color: colors.text.primary }}>{paybackMonths.toFixed(1)} months</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
              <p className="text-xs font-mono" style={{ color: colors.text.tertiary }}>
                Payback: ₹{(cac / 1000).toFixed(0)}K ÷ (₹{(arpu / 1000).toFixed(0)}K × {(grossMargin * 100).toFixed(0)}%)
              </p>
            </div>
          </div>
        </div>

        <div
          className="mt-6 p-4 rounded-xl"
          style={{
            background: `${ltvCacRatio > 3 ? colors.success.main : colors.danger.main}15`,
            border: `1px solid ${ltvCacRatio > 3 ? colors.success.main : colors.danger.main}40`,
          }}
        >
          <p className="font-semibold mb-1" style={{ color: colors.text.primary }}>
            LTV:CAC = {ltvCacRatio.toFixed(1)}:1 — {ltvCacRatio > 3 ? "Healthy" : "Needs Improvement"}
          </p>
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            {ltvCacRatio > 3
              ? `Strong unit economics. Each customer generates ₹${ltvCacRatio.toFixed(1)} for every ₹1 spent acquiring them.`
              : "Weak unit economics. Target >3:1 ratio. Either increase LTV (reduce churn, upsell more) or reduce CAC (optimize channels)."}
          </p>
        </div>
      </motion.div>

      {/* METRIC 2: Magic Number */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-8" style={sectionPanel}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold font-serif" style={{ color: colors.text.primary }}>
            Sales & Marketing Efficiency
          </h3>
          <Zap size={24} style={{ color: colors.accent[500] }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl" style={{ background: colors.bg.primary }}>
            <p className="text-sm uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Net New ARR (Quarterly)</p>
            <p className="text-3xl font-mono font-bold" style={{ color: colors.text.primary }}>
              ₹{(netNewArr / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="p-6 rounded-xl" style={{ background: colors.bg.primary }}>
            <p className="text-sm uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>S&M Spend (Quarterly)</p>
            <p className="text-3xl font-mono font-bold" style={{ color: colors.text.primary }}>
              ₹{(salesMarketingSpend / 100000).toFixed(1)}L
            </p>
          </div>
          <div className="p-6 rounded-xl" style={{ background: colors.bg.primary }}>
            <p className="text-sm uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>Magic Number</p>
            <p
              className="text-3xl font-mono font-bold"
              style={{ color: magicNumber > 0.75 ? colors.success.main : colors.warning.main }}
            >
              {magicNumber.toFixed(2)}
            </p>
          </div>
        </div>

        <div
          className="mt-6 p-4 rounded-xl"
          style={{
            background: `${magicNumber > 0.75 ? colors.success.main : colors.warning.main}15`,
            border: `1px solid ${magicNumber > 0.75 ? colors.success.main : colors.warning.main}40`,
          }}
        >
          <p className="text-sm" style={{ color: colors.text.secondary }}>
            <strong style={{ color: colors.text.primary }}>Interpretation:</strong>{" "}
            {magicNumber > 1.0
              ? "Exceptional efficiency. Every ₹1 in S&M generates >₹1 in ARR quarterly."
              : magicNumber > 0.75
              ? "Good efficiency. Sustainable growth with reasonable CAC payback."
              : "Low efficiency. Consider optimizing channels or increasing deal sizes before scaling spend."}
          </p>
        </div>
      </motion.div>

      {/* Revenue Trend + Cohort Retention */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="rounded-2xl p-6" style={sectionPanel}>
          <h3 className="text-xl font-bold font-serif mb-4" style={{ color: colors.text.primary }}>
            Revenue Trend (6 Months)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyRevenue}>
              <XAxis
                dataKey="month"
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
                formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke={colors.text.tertiary}
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke={colors.accent[500]}
                strokeWidth={3}
                dot={{ fill: colors.accent[500], r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* METRIC 3: Cohort Retention */}
        <div className="rounded-2xl p-6" style={sectionPanel}>
          <h3 className="text-xl font-bold font-serif mb-4" style={{ color: colors.text.primary }}>
            Cohort Retention
          </h3>
          <div className="space-y-4">
            {cohortData.map((cohort, idx) => (
              <div key={idx}>
                <p className="text-sm font-semibold mb-2" style={{ color: colors.text.secondary }}>
                  {cohort.cohort}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {cohort.values.map((val, i) => {
                    if (val === null) {
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-lg text-center"
                          style={{ background: colors.bg.primary, border: "1px dashed rgba(255,255,255,0.08)" }}
                        >
                          <p className="text-xs" style={{ color: colors.text.muted }}>M{i}</p>
                          <p className="text-sm font-mono" style={{ color: colors.text.muted }}>—</p>
                        </div>
                      );
                    }
                    const c =
                      val >= 90 ? colors.success.main : val >= 80 ? colors.warning.main : colors.danger.main;
                    return (
                      <div
                        key={i}
                        className="p-3 rounded-lg text-center"
                        style={{ background: `${c}15`, border: `1px solid ${c}40` }}
                      >
                        <p className="text-xs" style={{ color: colors.text.tertiary }}>M{i}</p>
                        <p className="text-base font-mono font-bold" style={{ color: c }}>{val}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 p-4 rounded-xl"
            style={{ background: `${colors.success.main}15`, border: `1px solid ${colors.success.main}40` }}
          >
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Mar cohort retaining 95% after 1 month (excellent). Target: keep M3 retention &gt;85%.
            </p>
          </div>
        </div>
      </motion.div>

      {/* METRIC 4: Rule of 40 + METRIC 5: Churn Breakdown */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule of 40 */}
        <div className="rounded-2xl p-6" style={sectionPanel}>
          <h3 className="text-xl font-bold font-serif mb-4" style={{ color: colors.text.primary }}>
            Rule of 40 Analysis
          </h3>

          <div className="text-center py-6">
            <p className="text-sm uppercase tracking-wider mb-2" style={{ color: colors.text.tertiary }}>
              Growth + Profit Margin
            </p>
            <p
              className="text-6xl font-mono font-bold"
              style={{
                color:
                  ruleOf40 >= 40
                    ? colors.success.main
                    : ruleOf40 >= 20
                    ? colors.warning.main
                    : colors.danger.main,
              }}
            >
              {ruleOf40}%
            </p>
            <p className="text-sm mt-2" style={{ color: colors.text.secondary }}>
              {ruleOf40 >= 40 ? "Excellent" : ruleOf40 >= 20 ? "Below Target" : "Critical"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl" style={{ background: colors.bg.primary }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Growth Rate</p>
              <p className="text-2xl font-mono font-bold" style={{ color: colors.success.main }}>+{growthRate}%</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: colors.bg.primary }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Profit Margin</p>
              <p className="text-2xl font-mono font-bold" style={{ color: colors.danger.main }}>{profitMargin}%</p>
            </div>
          </div>

          <div
            className="mt-4 p-4 rounded-xl"
            style={{
              background: `${ruleOf40 >= 40 ? colors.success.main : colors.warning.main}15`,
              border: `1px solid ${ruleOf40 >= 40 ? colors.success.main : colors.warning.main}40`,
            }}
          >
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              {ruleOf40 >= 40
                ? "Strong balance between growth and profitability. Continue current trajectory."
                : "Below 40% threshold. Either accelerate growth or improve margins. Focus on reducing burn while maintaining MoM growth."}
            </p>
          </div>
        </div>

        {/* Churn Breakdown */}
        <div className="rounded-2xl p-6" style={sectionPanel}>
          <h3 className="text-xl font-bold font-serif mb-4" style={{ color: colors.text.primary }}>
            Churn Analysis
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl" style={{ background: colors.bg.primary }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Logo Churn</p>
              <p className="text-3xl font-mono font-bold" style={{ color: colors.warning.main }}>{logoChurn}%</p>
              <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>Customers leaving monthly</p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: colors.bg.primary }}>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: colors.text.tertiary }}>Revenue Churn</p>
              <p className="text-3xl font-mono font-bold" style={{ color: colors.success.main }}>{revenueChurn}%</p>
              <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>Revenue lost monthly</p>
            </div>
          </div>

          <div
            className="p-4 rounded-xl mb-4"
            style={{ background: `${colors.success.main}15`, border: `1px solid ${colors.success.main}40` }}
          >
            <p className="font-semibold mb-1" style={{ color: colors.success.main }}>Positive Signal</p>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Revenue churn ({revenueChurn}%) lower than logo churn ({logoChurn}%) means higher-value customers are staying. Losing smaller accounts is acceptable.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg flex items-center justify-between" style={{ background: colors.bg.primary }}>
              <span className="text-xs" style={{ color: colors.text.tertiary }}>Target Logo Churn</span>
              <span className="font-mono font-bold" style={{ color: colors.text.primary }}>&lt;3%</span>
            </div>
            <div className="p-3 rounded-lg flex items-center justify-between" style={{ background: colors.bg.primary }}>
              <span className="text-xs" style={{ color: colors.text.tertiary }}>Target Rev Churn</span>
              <span className="font-mono font-bold" style={{ color: colors.text.primary }}>&lt;2%</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Revenue Sources */}
      <motion.div variants={fadeInUp} className="rounded-2xl p-6" style={sectionPanel}>
        <h3 className="text-xl font-bold font-serif mb-6" style={{ color: colors.text.primary }}>
          Revenue Breakdown
        </h3>
        <div className="space-y-4">
          {revenueSources.map((source, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: source.color }}
                  />
                  <span className="font-semibold" style={{ color: colors.text.primary }}>
                    {source.source}
                  </span>
                </div>
                <span className="font-mono font-bold" style={{ color: colors.text.primary }}>
                  ₹{(source.amount / 1000).toFixed(0)}K
                </span>
              </div>
              <div className="h-3 rounded-full overflow-hidden" style={{ background: colors.bg.primary }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: source.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${source.percent}%` }}
                  transition={{ duration: 1, delay: idx * 0.1 }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
                {source.percent}% of total revenue
              </p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RevenueDashboard;
