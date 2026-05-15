import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

export type CFOCardStatus = "good" | "warning" | "bad";

interface CFOCardProps {
  title: string;
  value: ReactNode;
  icon: ReactNode;
  trend: string;
  status: CFOCardStatus;
}

const TrendIcon = ({ status }: { status: CFOCardStatus }) => {
  if (status === "good") return <TrendingUp size={16} />;
  if (status === "warning") return <Minus size={16} />;
  return <TrendingDown size={16} />;
};

export const CFOCard = ({ title, value, icon, trend, status }: CFOCardProps) => {
  const statusColor =
    status === "good"
      ? "text-[#059669]"
      : status === "warning"
      ? "text-[#D97706]"
      : "text-[#DC2626]";

  return (
    <motion.div
      whileHover={{
        y: -8,
        rotateX: 2,
        rotateY: 2,
        transition: { duration: 0.3 },
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className="relative group"
    >
      {/* Main card */}
      <div className="relative bg-gradient-to-br from-[#1A1F3A] to-[#252B48] rounded-2xl border border-white/10 overflow-hidden">
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-[#3949AB]/20 via-transparent to-[#FFA726]/10 pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* Content */}
        <div className="relative z-10 p-6" style={{ transform: "translateZ(20px)" }}>
          {/* Header with icon */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[#CBD5E1] text-xs font-semibold uppercase tracking-wider">
              {title}
            </span>
            <motion.div
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3949AB] to-[#283593] flex items-center justify-center text-white"
              style={{ transform: "translateZ(10px)" }}
            >
              {icon}
            </motion.div>
          </div>

          {/* Value */}
          <div className="mb-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-bold text-white font-mono"
            >
              {value}
            </motion.div>
          </div>

          {/* Trend indicator */}
          <div className={`flex items-center gap-2 text-sm ${statusColor}`}>
            <TrendIcon status={status} />
            <span className="font-semibold">{trend}</span>
          </div>
        </div>

        {/* Bottom accent line */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3949AB] via-[#FFA726] to-[#3949AB]"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Shadow layer */}
      <div
        className="absolute inset-0 bg-[#3949AB]/20 rounded-2xl blur-2xl -z-10 group-hover:bg-[#3949AB]/40 transition-all"
        style={{ transform: "translateZ(-20px)" }}
      />
    </motion.div>
  );
};

export default CFOCard;
