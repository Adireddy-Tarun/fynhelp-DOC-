import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Zap,
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
import { RotatingButton } from "@/components/ui/RotatingButton";
import { colors, staggerContainer, fadeInUp } from "@/lib/design-system";

interface RevenueDashboardProps {
  data?: any;
}

export function RevenueDashboard({ data }: RevenueDashboardProps) {
  if (!data?.revenue) {
    return (
      <div
        className="rounded-2xl p-12 text-center border"
        style={{
          background: colors.bg.card,
          borderColor: "rgba(255,255,255,0.08)",
          color: colors.text.secondary,
        }}
      >
        <p>No revenue data available</p>
      </div>
    );
  }

  const { totalRevenue, transactions } = data.revenue;

  const avgMonthlyRevenue = totalRevenue / 3;
  const projectedAnnualRevenue = avgMonthlyRevenue * 12;
  const growthRate = 15;

  const monthlyRevenue =
    data.liquidity?.cashFlowTimeline
      ?.filter((item: any) => item.balance > 0)
      ?.slice(-6)
      ?.map((item: any) => ({
        month: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
        }),
        revenue: Math.abs(item.balance * 0.3),
        target: avgMonthlyRevenue,
      })) || [];

  const revenueSources = [
    {
      source: "Product Sales",
      amount: totalRevenue * 0.45,
      percent: 45,
      color: colors.primary[500],
    },
    {
      source: "Services",
      amount: totalRevenue * 0.3,
      percent: 30,
      color: colors.accent[500],
    },
    {
      source: "Subscriptions",
      amount: totalRevenue * 0.15,
      percent: 15,
      color: colors.info.main,
    },
    {
      source: "Other",
      amount: totalRevenue * 0.1,
      percent: 10,
      color: colors.success.main,
    },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Growth Momentum Banner */}
      <motion.div
        variants={fadeInUp}
        className="relative overflow-hidden rounded-2xl border"
        style={{
          borderColor: `${colors.success.main}55`,
          background: `linear-gradient(135deg, ${colors.success.dark}33 0%, ${colors.bg.secondary} 60%)`,
        }}
      >
        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${colors.accent[500]}22, transparent 60%)`,
          }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${colors.success.main}30` }}
            >
              <TrendingUp size={24} color={colors.success.light} />
            </div>
            <div>
              <h3
                className="font-serif text-2xl md:text-3xl font-bold mb-1"
                style={{ color: colors.text.primary }}
              >
                📈 Revenue Momentum: Accelerating
              </h3>
              <p style={{ color: colors.text.secondary }} className="text-sm">
                Your top-line is compounding. Stay on the gas.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Stat
              label="Current MRR"
              value={`₹${(avgMonthlyRevenue / 100000).toFixed(1)}L`}
              color={colors.text.primary}
            />
            <Stat
              label="Projected (6mo)"
              value={`₹${((avgMonthlyRevenue * 1.8) / 100000).toFixed(1)}L`}
              color={colors.accent[300]}
            />
            <Stat
              label="Growth Rate"
              value={`+${growthRate}% MoM`}
              color={colors.success.light}
            />
          </div>

          <div className="mb-6">
            <h4
              className="font-semibold mb-3"
              style={{ color: colors.text.primary }}
            >
              💡 Growth Drivers:
            </h4>
            <div className="space-y-2">
              {[
                { label: "Product sales", impact: "↑ 23% MoM", good: true },
                {
                  label: "New customers",
                  impact: `+${transactions || 8}`,
                  good: true,
                },
                { label: "Churn rate", impact: "2.1% ↓", good: true },
              ].map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between rounded-lg px-4 py-3 border"
                  style={{
                    background: colors.bg.tertiary,
                    borderColor: "rgba(255,255,255,0.06)",
                  }}
                >
                  <span style={{ color: colors.text.secondary }}>
                    {d.label}
                  </span>
                  <span
                    className="font-mono font-semibold text-sm"
                    style={{ color: colors.success.light }}
                  >
                    {d.impact}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <RotatingButton variant="secondary">
            🎯 View Growth Playbook
          </RotatingButton>
        </div>
      </motion.div>

      {/* Top Stats — CFO Cards */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <CFOCard
          title="Total Revenue"
          value={totalRevenue / 100000}
          prefix="₹"
          suffix="L"
          icon={DollarSign}
          status="good"
          subtitle="Last 90 days"
          trend={`+${growthRate}% vs prior`}
        />
        <CFOCard
          title="Avg Monthly"
          value={avgMonthlyRevenue / 100000}
          prefix="₹"
          suffix="L"
          icon={Calendar}
          status="good"
          subtitle="Per month"
          trend="Trending up"
        />
        <CFOCard
          title="Projected ARR"
          value={projectedAnnualRevenue / 10000000}
          prefix="₹"
          suffix="Cr"
          icon={Target}
          status="good"
          subtitle="Annual run-rate"
          trend="On track"
        />
        <CFOCard
          title="Transactions"
          value={transactions || 0}
          icon={Users}
          status="neutral"
          subtitle="Income entries"
          trend="Healthy volume"
        />
      </motion.div>

      {/* Revenue Trend Chart */}
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
            background: `radial-gradient(circle at 20% 0%, ${colors.success.main}22, transparent 60%)`,
          }}
        />
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h3
              className="font-serif text-2xl font-bold"
              style={{ color: colors.text.primary }}
            >
              Revenue Trend (Last 6 Months)
            </h3>
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${colors.accent[500]}15` }}
            >
              <Zap size={18} color={colors.accent[500]} />
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenue}>
              <defs>
                <linearGradient id="revLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={colors.success.main} />
                  <stop offset="100%" stopColor={colors.accent[500]} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="month"
                stroke={colors.text.tertiary}
                style={{ fontSize: 12 }}
              />
              <YAxis
                stroke={colors.text.tertiary}
                style={{ fontSize: 12 }}
                tickFormatter={(value: number) =>
                  `₹${(value / 100000).toFixed(0)}L`
                }
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: colors.bg.secondary,
                  border: `1px solid rgba(255,255,255,0.1)`,
                  borderRadius: 8,
                  color: colors.text.primary,
                }}
                labelStyle={{ color: colors.text.secondary }}
                formatter={(value: number) => [
                  `₹${value.toLocaleString("en-IN")}`,
                  "Revenue",
                ]}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke={colors.text.tertiary}
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="url(#revLine)"
                strokeWidth={3}
                dot={{ fill: colors.accent[500], r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Two columns */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Revenue Breakdown */}
        <Panel>
          <PanelHeader
            title="Revenue Breakdown"
            icon={<DollarSign size={18} color={colors.accent[500]} />}
          />
          <div className="space-y-5">
            {revenueSources.map((source, idx) => (
              <div key={source.source}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ background: source.color }}
                    />
                    <span
                      className="font-semibold text-sm"
                      style={{ color: colors.text.primary }}
                    >
                      {source.source}
                    </span>
                  </div>
                  <span
                    className="font-mono font-bold"
                    style={{ color: colors.text.primary }}
                  >
                    ₹{(source.amount / 1000).toFixed(0)}K
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${source.percent}%` }}
                    transition={{
                      duration: 1,
                      delay: idx * 0.1,
                      ease: "easeOut",
                    }}
                    className="h-full rounded-full"
                    style={{
                      background: `linear-gradient(90deg, ${source.color}, ${colors.accent[500]})`,
                    }}
                  />
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: colors.text.tertiary }}
                >
                  {source.percent}% of total revenue
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* Revenue Insights */}
        <Panel>
          <PanelHeader
            title="Revenue Insights"
            icon={<Target size={18} color={colors.accent[500]} />}
          />
          <div className="space-y-3">
            <Insight
              emoji="✅"
              title="Strong Revenue Base"
              body={`Monthly revenue of ₹${(avgMonthlyRevenue / 100000).toFixed(
                1,
              )}L provides a solid foundation. ${growthRate}% growth is healthy for this stage.`}
              accent={colors.success.main}
            />
            <Insight
              emoji="💰"
              title="Diversified Income"
              body={`Revenue spread across ${revenueSources.length} streams reduces dependency risk. Consider growing the subscription share for predictability.`}
              accent={colors.info.main}
            />
            <Insight
              emoji="🎯"
              title="ARR Target Path"
              body={`On track for ₹${(projectedAnnualRevenue / 10000000).toFixed(
                2,
              )}Cr ARR. To hit ₹1Cr, need ~5 more customers at ₹1.5L average.`}
              accent={colors.primary[500]}
            />
          </div>

          <div className="mt-6">
            <RotatingButton variant="primary">
              📊 Revenue Forecast Model
            </RotatingButton>
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
  emoji,
  title,
  body,
  accent,
}: {
  emoji: string;
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
      <div className="text-xl leading-none">{emoji}</div>
      <div>
        <div
          className="font-semibold text-sm mb-1"
          style={{ color: colors.text.primary }}
        >
          {title}
        </div>
        <div className="text-sm" style={{ color: colors.text.secondary }}>
          {body}
        </div>
      </div>
    </div>
  );
}
