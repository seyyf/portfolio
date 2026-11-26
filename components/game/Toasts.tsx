"use client"

import { useEffect, useState } from "react"

import { profile } from "@/data/profile"
import { useGame, type Toast } from "@/lib/game"
import { motionReduced } from "@/lib/prefs"

/**
 * Game notifications (cheat activated, door found, interest level up), top centre. A polite live
 * region, so screen readers hear them too. Each one leaves on its own after a few seconds.
 */
export function Toasts() {
  const { live } = useGame()
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-[4.75rem] left-1/2 z-[60] grid w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 gap-2 lg:top-4"
    >
      {live.toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  )
}

function ToastCard({ toast }: { toast: Toast }) {
  return (
    <div className="game-toast hud-panel relative !bg-bg/95 overflow-hidden rounded-xl px-4 py-3 shadow-[0_18px_40px_-18px_rgb(0_0_0/0.9)]">
      <span aria-hidden="true" className="bg-sunset absolute inset-y-0 left-0 w-1" />
      <p className="font-display text-xl leading-none text-ink">
        <span>{toast.title}</span>
      </p>
      {toast.kind === "loot" ? (
        <>
          <p className="mt-1 font-mono text-xs text-gold">{toast.detail}</p>
          <ul className="mt-2 grid grid-cols-4 gap-2">
            {profile.careerStats.map((s) => (
              <li key={s.label} className="text-center">
                <span className="block font-mono text-2xl leading-none font-semibold text-gold tabular-nums">
                  +<CountUp to={Number(s.value)} />
                </span>
                <span className="mt-1 block font-mono text-[0.625rem] text-ink/80 lowercase">{s.label}</span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        toast.detail && <p className="mt-1 font-mono text-xs text-gold">{toast.detail}</p>
      )}
    </div>
  )
}

/** Rolls a number up from 0 (straight to the value with reduced motion). */
function CountUp({ to, ms = 1100 }: { to: number; ms?: number }) {
  // Toasts only ever render in the browser, so reading the setting here is safe.
  const [n, setN] = useState(() => (motionReduced() ? to : 0))
  useEffect(() => {
    if (motionReduced()) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms)
      setN(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, ms])
  return <>{n}</>
}
