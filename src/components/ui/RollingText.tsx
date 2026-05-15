import { motion } from 'framer-motion'
import { useState } from 'react'
import { colors } from '@/lib/design-system'

interface RollingTextProps {
  text: string
  className?: string
}

export function RollingText({ text, className = '' }: RollingTextProps) {
  const [isHovered, setIsHovered] = useState(false)
  const letters = text.split('')

  return (
    <span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`inline-flex overflow-hidden cursor-pointer ${className}`}
      style={{ color: colors.text.primary }}
    >
      {letters.map((letter, idx) => (
        <span key={idx} className="relative inline-block overflow-hidden" style={{ height: '1em', lineHeight: 1 }}>
          <motion.span
            className="inline-block"
            animate={{ y: isHovered ? '-100%' : '0%' }}
            transition={{ duration: 0.4, delay: idx * 0.03, ease: [0.6, 0.01, 0.05, 0.95] }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
          <motion.span
            className="absolute left-0 top-full inline-block"
            animate={{ y: isHovered ? '-100%' : '0%' }}
            transition={{ duration: 0.4, delay: idx * 0.03, ease: [0.6, 0.01, 0.05, 0.95] }}
            style={{ color: colors.accent[500] }}
          >
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
