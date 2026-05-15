import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import CountUp from "react-countup";
import { colors, shimmer, pulseGlow } from "@/lib/design-system";

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
      initial={{ y: 0 }}
      whileHover={{
        y: -8,
        boxShadow:
          "0 16px 48px rgba(57, 73, 171, 0.25), 0 8px 24px rgba(0,0,0,0.5)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{
        boxShadow:
          "0 8px 32px rgba(57, 73, 171, 0.15), 0 4px 16px rgba(0, 0, 0, 0.4)",
        borderRadius: 16,
      }}
      className="relative group"
    >
      {/* Main card */}
      <div
        className="relative rounded-2xl border overflow-hidden"
        style={{
          background: "#1E2642",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Inner gradient overlay */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 100%)",
          }}
        />
        {/* Animated accent glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 30% 0%, rgba(57,73,171,0.20), transparent 60%), radial-gradient(circle at 80% 100%, rgba(255,167,38,0.10), transparent 60%)",
          }}
          {...pulseGlow}
        />

        {/* Content */}
        <div className="relative z-10" style={{ padding: 32 }}>
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-5">
            <span
              className="font-inter font-semibold uppercase"
              style={{
                fontSize: 12,
                letterSpacing: "0.08em",
                color: "#CBD5E1",
              }}
            >
              {title}
            </span>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.15 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: "linear-gradient(135deg, #3949AB 0%, #283593 100%)",
                color: "#F8FAFC",
              }}
            >
              <Icon size={18} />
            </motion.div>
          </div>

          {/* Value with count-up */}
          <div className="mb-2">
            <div
              className="font-mono font-bold leading-tight"
              style={{ fontSize: 48, color: "#F8FAFC" }}
            >
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
            <div className="text-sm mb-2" style={{ color: "#CBD5E1" }}>
              {subtitle}
            </div>
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
                {status === "warning" && "→"}
                {status === "neutral" && "→"}
              </span>
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Bottom accent line (shimmer) */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
          <motion.div
            className="h-full w-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, #FFA726, transparent)",
            }}
            {...shimmer}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default CFOCard;
