"use client"

import { flushSync } from "react-dom"

import { useOS, type Theme } from "@/lib/store"

/**
 * Switches light/dark. With the View Transitions API, the new theme is revealed in a growing circle
 * from `origin` (e.g. the dark-mode tile); otherwise, or with reduced motion, it switches instantly.
 */
export function switchTheme(theme: Theme, origin?: { x: number; y: number }) {
  const apply = () => {
    document.documentElement.setAttribute("data-theme", theme)
    flushSync(() => useOS.getState().setTheme(theme))
  }
  const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } }
  if (!doc.startViewTransition || useOS.getState().reducedMotion) {
    apply()
    return
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))
  const t = doc.startViewTransition(apply)
  t.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", pseudoElement: "::view-transition-new(root)" }
      )
    })
    .catch(() => {})
}

/** Switches theme revealing from the centre of a clicked element. */
export function switchThemeFrom(el: Element | null, theme: Theme) {
  const r = el?.getBoundingClientRect()
  switchTheme(theme, r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined)
}
