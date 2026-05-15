import { motion } from 'framer-motion'
import { ReactNode, useState } from 'react'
import { colors } from '@/lib/design-system'

interface GalaxyButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'success'
  className?: string
}

export function GalaxyButton({
  children,
  onClick,
  variant = 'primary',
  className = '',
}: GalaxyButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  const variantColors = {
    primary: { base: colors.primary[500], glow: colors.primary[300], particles: colors.accent[500] },
    secondary: { base: colors.accent[500], glow: colors.accent[300], particles: colors.primary[500] },
    success: { base: colors.success.main, glow: colors.success.light, particles: colors.accent[500] },
  }

  const colorScheme = variantColors[variant]

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={`relative px-8 py-4 rounded-2xl font-semibold overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colorScheme.base} 0%, ${colorScheme.glow} 100%)`,
        color: 'white',
        border: 'none',
        cursor: 'pointer',
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${colorScheme.glow}60 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: isHovered ? [1, 1.5, 1.3] : 1,
          opacity: isHovered ? [0.5, 1, 0.8] : 0.3,
        }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {isHovered &&
        Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{ background: colorScheme.particles, left: '50%', top: '50%' }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
            animate={{
              scale: [0, 1.5, 0],
              x: [0, Math.cos((i / 12) * Math.PI * 2) * 80],
              y: [0, Math.sin((i / 12) * Math.PI * 2) * 80],
              opacity: [0, 1, 0],
            }}
            transition={{ duration: 1.2, delay: i * 0.05, ease: 'easeOut' }}
          />
        ))}

      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>

      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `linear-gradient(90deg, ${colorScheme.glow}, ${colorScheme.particles}, ${colorScheme.glow})`,
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
        animate={{ backgroundPosition: isHovered ? ['0% 0%', '200% 0%'] : '0% 0%' }}
        transition={{ duration: 2, repeat: isHovered ? Infinity : 0, ease: 'linear' }}
      />
    </motion.button>
  )
}
