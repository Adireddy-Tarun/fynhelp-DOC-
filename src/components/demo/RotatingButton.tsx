import { motion } from "framer-motion";
import type { ReactNode, MouseEventHandler } from "react";

interface RotatingButtonProps {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

export const RotatingButton = ({ children, onClick, className = "" }: RotatingButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{
        rotateY: 15,
        rotateX: -5,
        scale: 1.05,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      whileTap={{
        scale: 0.95,
        rotateY: 0,
        rotateX: 0,
      }}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
      }}
      className={`relative px-8 py-4 bg-gradient-to-br from-[#8B6914] to-[#8B6914] text-white font-semibold rounded-xl shadow-2xl ${className}`}
    >
      {/* Inner glow layer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl pointer-events-none"
        style={{ transform: "translateZ(10px)" }}
      />

      {/* Text layer */}
      <span className="relative z-10" style={{ transform: "translateZ(20px)" }}>
        {children}
      </span>

      {/* Shadow layer */}
      <motion.div
        className="absolute inset-0 bg-black/50 rounded-xl blur-xl pointer-events-none"
        style={{ transform: "translateZ(-10px)" }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.button>
  );
};

export default RotatingButton;
