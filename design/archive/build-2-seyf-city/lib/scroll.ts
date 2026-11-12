"use client"

import Lenis from "lenis"

import { gsap, ScrollTrigger } from "@/lib/gsap"

// Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger and Lenis share one clock.

let lenis: Lenis | null = null
let tick: ((time: number) => void) | null = null

export function startLenis() {
  if (lenis) return lenis
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, autoRaf: false })
  lenis.on("scroll", ScrollTrigger.update)
  tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function stopLenis() {
  if (tick) gsap.ticker.remove(tick)
  lenis?.destroy()
  lenis = null
  tick = null
}

export const getLenis = () => lenis

/** Scroll to an element or pixel offset, smoothly when Lenis is running. */
export function scrollToTarget(target: HTMLElement | number, opts: { immediate?: boolean; duration?: number } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate: opts.immediate, duration: opts.duration ?? 1.6, force: true })
    return
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: opts.immediate ? "instant" : "smooth" })
}

/** Pause page scrolling (panel open, explore mode). */
export function lockScroll(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.classList.toggle("scroll-locked", locked)
}
