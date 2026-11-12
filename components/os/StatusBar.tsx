"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useRef } from "react"

import { LivePill } from "@/components/os/LivePill"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { formatTime, useNow } from "@/lib/time"

/** Tunis time, live pill, signal, Wi-Fi and battery. Drag down on the right side opens the control center. */
export function StatusBar() {
  const now = useNow()
  const setControlCenter = useOS((s) => s.setControlCenter)
  const start = useRef<{ y: number } | null>(null)

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-40 pt-[env(safe-area-inset-top)]">
      <div className="relative flex h-[var(--status-h)] items-center justify-between px-6 text-[15px] font-semibold text-text">
        <span className="pointer-events-auto w-16 tabular-nums" aria-label={now ? `Time in Tunis ${formatTime(now)}` : undefined}>
          {now ? formatTime(now) : ""}
        </span>
        <LivePill />
        <div className="pointer-events-auto flex items-center gap-1.5">
          {/* Signal and Wi-Fi double as the control center button; dragging down here opens it too. */}
          <button
            type="button"
            aria-label="Open control center"
            onClick={() => setControlCenter(true)}
            onPointerDown={(e) => (start.current = { y: e.clientY })}
            onPointerMove={(e) => {
              if (start.current && e.clientY - start.current.y > 24) {
                start.current = null
                setControlCenter(true)
              }
            }}
            onPointerUp={() => (start.current = null)}
            className="flex h-9 items-center gap-1.5 rounded-full px-1.5 touch-none"
          >
            <Signal />
            <Wifi />
          </button>
          <Battery />
        </div>
      </div>
    </div>
  )
}

function Signal() {
  return (
    <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" fill="currentColor">
      <rect x="0" y="8" width="3" height="4" rx="1" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
      <rect x="10" y="3" width="3" height="9" rx="1" />
      <rect x="15" y="0" width="3" height="12" rx="1" />
    </svg>
  )
}

function Wifi() {
  return (
    <svg width="16" height="12" viewBox="0 0 16 12" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M1.5 4.5a9.5 9.5 0 0 1 13 0" />
      <path d="M4 7.2a6 6 0 0 1 8 0" />
      <circle cx="8" cy="10" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Tap to recharge. Turns coral when low and shows a bolt while charging. */
function Battery() {
  const battery = useOS((s) => s.battery)
  const charging = useOS((s) => s.charging)
  const recharge = useOS((s) => s.recharge)
  const reduced = useReducedMotion()
  const low = battery <= 10 && !charging
  return (
    <button
      type="button"
      onClick={() => {
        playSfx("pop")
        recharge()
      }}
      aria-label={`Battery ${battery}%${charging ? ", charging" : ""}. Tap to recharge`}
      className="flex h-9 items-center gap-1 rounded-full px-1"
    >
      <span className="text-[12px] tabular-nums">{battery}</span>
      <span className="relative flex h-[13px] w-[25px] items-center rounded-[4px] border-[1.5px] border-current p-[1.5px]" aria-hidden="true">
        <motion.span
          className="h-full rounded-[2px]"
          style={{ background: low ? "var(--color-coral)" : charging ? "var(--color-mint)" : "currentColor" }}
          animate={{ width: `${battery}%` }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
        />
        <span className="absolute -right-[4px] h-[5px] w-[2px] rounded-r-sm bg-current" />
        {charging && (
          <svg className="absolute inset-0 m-auto" width="9" height="11" viewBox="0 0 9 11" aria-hidden="true">
            <path d="M5 0 0 6.2h3.6L3 11l6-6.6H5.3Z" fill="var(--text)" stroke="var(--bg)" strokeWidth="0.8" />
          </svg>
        )}
      </span>
    </button>
  )
}
