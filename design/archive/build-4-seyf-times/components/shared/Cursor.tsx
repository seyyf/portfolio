"use client"

import { useEffect, useRef } from "react"

import { loadGsapOnInteract } from "@/lib/gsapLazy"

const INTERACTIVE = "a, button, [role='slider'], label, summary, input, textarea, [data-cursor]"

/**
 * Desktop detail: a small ink dot that follows the pointer (GSAP quickTo) and grows over links.
 * It sits on top of the normal cursor rather than replacing it. Never loaded on touch devices.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = dot.current
    if (!el || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let cleanup = () => {}
    let cancelled = false
    void loadGsapOnInteract().then(({ gsap }) => {
      if (cancelled) return
      gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 })
      const xTo = gsap.quickTo(el, "x", { duration: 0.25, ease: "power3.out" })
      const yTo = gsap.quickTo(el, "y", { duration: 0.25, ease: "power3.out" })
      let big = false
      const move = (e: PointerEvent) => {
        xTo(e.clientX)
        yTo(e.clientY)
        gsap.to(el, { autoAlpha: 1, duration: 0.2, overwrite: "auto" })
        const over = !!(e.target as Element | null)?.closest(INTERACTIVE)
        if (over !== big) {
          big = over
          gsap.to(el, { scale: over ? 3.2 : 1, opacity: over ? 0.25 : 1, duration: 0.3, ease: "power3.out" })
        }
      }
      const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.2 })
      window.addEventListener("pointermove", move, { passive: true })
      document.addEventListener("pointerleave", leave)
      cleanup = () => {
        window.removeEventListener("pointermove", move)
        document.removeEventListener("pointerleave", leave)
      }
    })
    return () => {
      cancelled = true
      cleanup()
    }
  }, [])
  return <div ref={dot} aria-hidden="true" className="no-print pointer-events-none fixed top-0 left-0 z-[99] size-2.5 rounded-full bg-ink opacity-0" />
}
