"use client"

import { LazyMotion, MotionConfig } from "framer-motion"
import type { ReactNode } from "react"

import { useMotionReduced } from "@/lib/prefs"

/**
 * Framer Motion's animation features (domAnimation, the small set) download once the browser is
 * idle or the visitor first interacts, so they never compete with the first paint. Everything
 * that animates with Framer appears on interaction (phone, pause menu, briefings) or animates in
 * anyway (stats bars). The Fripa swipe demo adds drag (domMax) with its own LazyMotion.
 */
const loadFeatures = () =>
  new Promise<void>((resolve) => {
    const events = ["pointerdown", "keydown", "touchstart", "scroll", "wheel"] as const
    const go = () => {
      for (const e of events) window.removeEventListener(e, go)
      resolve()
    }
    for (const e of events) window.addEventListener(e, go, { passive: true, once: true })
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 2500 })
    else window.setTimeout(go, 1500)
  })
    .then(() => import("@/lib/motionAnimation"))
    .then((mod) => mod.domAnimation)

/** Framer follows both the OS setting and the in-site "Reduce motion" setting. */
export function Providers({ children }: { children: ReactNode }) {
  const reduced = useMotionReduced()
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion={reduced ? "always" : "user"}>{children}</MotionConfig>
    </LazyMotion>
  )
}
