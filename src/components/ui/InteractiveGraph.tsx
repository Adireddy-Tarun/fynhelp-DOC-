import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { colors } from '@/lib/design-system'

interface DataPoint {
  label: string
  value: number
}

interface InteractiveGraphProps {
  data: DataPoint[]
  height?: number
  formatValue?: (value: number) => string
}

export function InteractiveGraph({
  data,
  height = 200,
  formatValue = (v) => `₹${(v / 1000).toFixed(0)}K`,
}: InteractiveGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="relative w-full" style={{ paddingTop: 40, paddingBottom: 32 }}>
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {data.map((point, idx) => {
          const barHeight = (point.value / maxValue) * height
          const isHovered = hoveredIndex === idx
          const isAdjacent = hoveredIndex !== null && Math.abs(hoveredIndex - idx) === 1

          return (
            <div key={idx} className="relative flex-1 flex flex-col items-center justify-end" style={{ height }}>
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-10"
                    style={{ background: colors.bg.tertiary, border: `1px solid ${colors.primary[500]}` }}
                  >
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: colors.text.tertiary }}>
                      {point.label}
                    </div>
                    <div className="text-sm font-semibold" style={{ color: colors.text.primary }}>
                      {formatValue(point.value)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                onHoverStart={() => setHoveredIndex(idx)}
                onHoverEnd={() => setHoveredIndex(null)}
                className="relative w-full rounded-t-md cursor-pointer"
                initial={{ height: 0 }}
                animate={{
                  height: barHeight,
                  scale: isHovered ? 1.05 : isAdjacent ? 0.98 : 1,
                  opacity: hoveredIndex === null || isHovered ? 1 : 0.6,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{
                  background: `linear-gradient(180deg, ${colors.primary[300]} 0%, ${colors.primary[500]} 100%)`,
                }}
              >
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 rounded-t-md pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      background: `linear-gradient(180deg, ${colors.accent[300]} 0%, ${colors.accent[500]} 100%)`,
                      boxShadow: `0 0 24px ${colors.accent[500]}80`,
                    }}
                  />
                )}
              </motion.div>

              <div
                className="absolute -bottom-6 text-[11px] font-medium"
                style={{ color: isHovered ? colors.accent[500] : colors.text.tertiary }}
              >
                {point.label}
              </div>
            </div>
          )
        })}
      </div>

      <div className="absolute bottom-8 left-0 right-0 h-px" style={{ background: colors.text.muted, opacity: 0.3 }} />
    </div>
  )
}
