import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * GlobalMascot
 * A fixed fox mascot that idles in the bottom-right corner, detects user
 * inactivity, runs to the cursor, and offers help via a speech bubble.
 */

const MASCOT_SRC = '/lovable-uploads/fox-mascot.png'
const MASCOT_SIZE = 150
const EDGE_OFFSET = 20
const IDLE_MS = 15_000
const COOLDOWN_MS = 2 * 60 * 1000
const MAX_INTERVENTIONS = 3
const SS_COUNT_KEY = 'fyn_mascot_count'
const SS_LAST_KEY = 'fyn_mascot_last'

type Phase = 'idle' | 'running' | 'talking' | 'waving' | 'returning'

export default function GlobalMascot() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null)
  const [angle, setAngle] = useState(0)

  const cursorRef = useRef<{ x: number; y: number } | null>(null)
  const idleTimerRef = useRef<number | null>(null)

  // Corner anchor (in viewport coords)
  const cornerPos = useCallback(
    () => ({
      x: window.innerWidth - EDGE_OFFSET - MASCOT_SIZE,
      y: window.innerHeight - EDGE_OFFSET - MASCOT_SIZE,
    }),
    []
  )

  // ── Frequency control ──────────────────────────────────────────────
  const canIntervene = () => {
    const count = Number(sessionStorage.getItem(SS_COUNT_KEY) || '0')
    const last = Number(sessionStorage.getItem(SS_LAST_KEY) || '0')
    if (count >= MAX_INTERVENTIONS) return false
    if (last && Date.now() - last < COOLDOWN_MS) return false
    return true
  }

  const recordIntervention = () => {
    const count = Number(sessionStorage.getItem(SS_COUNT_KEY) || '0')
    sessionStorage.setItem(SS_COUNT_KEY, String(count + 1))
    sessionStorage.setItem(SS_LAST_KEY, String(Date.now()))
  }

  // ── Idle detection ─────────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
    idleTimerRef.current = window.setTimeout(() => {
      if (phase !== 'idle') return
      if (!canIntervene()) return
      triggerRunToCursor()
    }, IDLE_MS)
  }, [phase])

  const triggerRunToCursor = () => {
    const from = cornerPos()
    // Fallback to viewport center if cursor was never tracked
    const cursor =
      cursorRef.current ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const to = {
      x: Math.min(
        Math.max(cursor.x - MASCOT_SIZE / 2, 8),
        window.innerWidth - MASCOT_SIZE - 8
      ),
      y: Math.min(
        // Leave room above the mascot for the speech bubble (~150px)
        Math.max(cursor.y - MASCOT_SIZE - 20, 180),
        window.innerHeight - MASCOT_SIZE - 8
      ),
    }
    const dx = to.x - from.x
    const dy = to.y - from.y
    setAngle(Math.max(-15, Math.min(15, (Math.atan2(dy, dx) * 180) / Math.PI / 4)))
    setTarget(to)
    setPhase('running')
    recordIntervention()
  }

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY }
      if (phase === 'idle') resetIdleTimer()
    }
    const onActivity = () => {
      if (phase === 'idle') resetIdleTimer()
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('scroll', onActivity, { passive: true })
    window.addEventListener('click', onActivity)
    window.addEventListener('keydown', onActivity)
    resetIdleTimer()
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', onActivity)
      window.removeEventListener('click', onActivity)
      window.removeEventListener('keydown', onActivity)
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
    }
  }, [phase, resetIdleTimer])

  // ── Handlers ───────────────────────────────────────────────────────
  const handleYes = () => {
    console.log('[GlobalMascot] User requested help')
    returnToCorner()
  }

  const handleNo = () => {
    setPhase('waving')
    window.setTimeout(() => returnToCorner(), 900)
  }

  const returnToCorner = () => {
    setTarget(null)
    setAngle(0)
    setPhase('returning')
    window.setTimeout(() => {
      setPhase('idle')
      resetIdleTimer()
    }, 1500)
  }

  // ── Position computation ───────────────────────────────────────────
  const corner = typeof window !== 'undefined' ? cornerPos() : { x: 0, y: 0 }
  const pos =
    phase === 'running' && target
      ? target
      : phase === 'talking' && target
      ? target
      : corner

  // Bezier-ish curved path via mid waypoint
  const animateProps =
    phase === 'running' && target
      ? {
          x: [corner.x, (corner.x + target.x) / 2, target.x],
          y: [corner.y, Math.min(corner.y, target.y) - 80, target.y],
          rotate: [0, angle, 0],
        }
      : phase === 'returning'
      ? {
          x: [cursorRef.current.x - MASCOT_SIZE / 2, (corner.x + cursorRef.current.x) / 2, corner.x],
          y: [
            cursorRef.current.y - MASCOT_SIZE - 20,
            Math.min(corner.y, cursorRef.current.y) - 80,
            corner.y,
          ],
          rotate: [0, -angle, 0],
        }
      : { x: pos.x, y: pos.y, rotate: 0 }

  const transition =
    phase === 'running' || phase === 'returning'
      ? { duration: 1.5, ease: [0.45, 0, 0.55, 1] as [number, number, number, number] }
      : { duration: 0.4 }

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: MASCOT_SIZE,
        zIndex: 1000,
        pointerEvents: phase === 'talking' ? 'auto' : 'none',
      }}
      animate={animateProps}
      transition={transition}
      onAnimationComplete={() => {
        if (phase === 'running') setPhase('talking')
      }}
    >
      {/* Idle float + subtle wave when waving */}
      <motion.div
        animate={
          phase === 'idle'
            ? { y: [0, -10, 0], rotate: [-2, 2, -2] }
            : phase === 'waving'
            ? { rotate: [0, -15, 15, -10, 10, 0] }
            : { y: 0, rotate: 0 }
        }
        transition={
          phase === 'idle'
            ? { duration: 3, repeat: Infinity, ease: 'easeInOut' }
            : phase === 'waving'
            ? { duration: 0.9 }
            : { duration: 0.3 }
        }
        style={{ width: MASCOT_SIZE, position: 'relative' }}
      >
        <img
          src={MASCOT_SRC}
          alt="FynHelp mascot"
          width={MASCOT_SIZE}
          style={{ width: MASCOT_SIZE, height: 'auto', display: 'block', userSelect: 'none' }}
          draggable={false}
        />

        {/* Speech bubble */}
        <AnimatePresence>
          {phase === 'talking' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              style={{
                position: 'absolute',
                bottom: '100%',
                right: -10,
                marginBottom: 12,
                background: '#FFFFFF',
                border: '2px solid #1A237E',
                borderRadius: 16,
                padding: '14px 16px',
                width: 240,
                boxShadow: '0 12px 32px rgba(26, 35, 126, 0.18)',
                pointerEvents: 'auto',
                transformOrigin: 'bottom right',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 14,
                  color: '#1A237E',
                  fontWeight: 500,
                  lineHeight: 1.4,
                }}
              >
                Need help understanding this?
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={handleYes}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#3949AB',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#283593'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3949AB'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Yes, help me!
                </button>
                <button
                  onClick={handleNo}
                  style={{
                    flex: 1,
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #CBD5E1',
                    background: '#fff',
                    color: '#475569',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.15s, background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F1F5F9'
                    e.currentTarget.style.transform = 'translateY(-1px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fff'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  No, just browsing
                </button>
              </div>
              {/* tail */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -10,
                  right: 28,
                  width: 16,
                  height: 16,
                  background: '#FFFFFF',
                  borderRight: '2px solid #1A237E',
                  borderBottom: '2px solid #1A237E',
                  transform: 'rotate(45deg)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
