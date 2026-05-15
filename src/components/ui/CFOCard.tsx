import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import CountUp from "react-countup";
import { colors, cardHover, shimmer, pulseGlow } from "@/lib/design-system";

interface CFOCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  trend?: string;
  status?: "good" | "warning" | "danger" | "neutral";
  subtitle?: string;
  animated?: boolean;
}

export function CFOCard({
  title,
  value,
  prefix = "",
  suffix = "",
  icon: Icon,
  trend,
  status = "neutral",
  subtitle,
  animated = true,
}: CFOCardProps) {
  const statusColors: Record<NonNullable<CFOCardProps["status"]>, string> = {
    good: colors.success.main,
    warning: colors.warning.main,
    danger: colors.danger.main,
    neutral: colors.text.tertiary,
  };

  const numericValue =
    typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]/g, "")) : value;

  return (
    <motion.div
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      animate="rest"
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className="relative group"
    >
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-[#1A1F3A] to-[#252B48] rounded-2xl border border-white/10 overflow-hidden">
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#3949AB]/20 via-transparent to-[#FFA726]/10 pointer-events-none"
          {...pulseGlow}
        />

        {/* Content */}
        <div className="relative z-10 p-6" style={{ transform: "translateZ(20px)" }}>
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#CBD5E1] text-xs font-semibold uppercase tracking-wider">
              {title}
            </span>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.15 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3949AB] to-[#283593] flex items-center justify-center text-white shadow-lg"
              style={{ transform: "translateZ(10px)" }}
            >
              <Icon size={18} />
            </motion.div>
          </div>

          {/* Value with count-up */}
          <div className="mb-2">
            <div className="text-4xl md:text-5xl font-bold text-white font-mono leading-tight">
              {prefix}
              {animated && !isNaN(numericValue) ? (
                <CountUp
                  end={numericValue}
                  duration={2}
                  separator=","
                  decimals={Number.isInteger(numericValue) ? 0 : 2}
                  preserveValue
                />
              ) : (
                value
              )}
              {suffix}
            </div>
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div className="text-[#CBD5E1] text-sm mb-2">{subtitle}</div>
          )}

          {/* Trend indicator */}
          {trend && (
            <div
              className="flex items-center gap-2 text-sm font-semibold"
              style={{ color: statusColors[status] }}
            >
              <span className="text-base leading-none">
                {status === "good" && "↑"}
                {status === "danger" && "↓"}
                {status === "warning" && "⚠"}
                {status === "neutral" && "→"}
              </span>
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Bottom accent line (shimmer) */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <motion.div
            className="h-full w-full bg-gradient-to-r from-transparent via-[#FFA726] to-transparent"
            {...shimmer}
          />
        </div>
      </div>

      {/* Shadow layer */}
      <div
        className="absolute inset-0 bg-[#3949AB]/20 rounded-2xl blur-2xl -z-10 group-hover:bg-[#3949AB]/40 transition-all duration-300"
        style={{ transform: "translateZ(-20px)" }}
      />
    </motion.div>
  );
}

export default CFOCard;
