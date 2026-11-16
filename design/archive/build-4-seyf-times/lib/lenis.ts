"use client"

import type Lenis from "lenis"

import { loadGsap } from "@/lib/gsapLazy"

// Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger and Lenis share one clock.
// Both are loaded after the page is interactive (they never delay first paint).

let lenis: Lenis | null = null
let tick: ((time: number) => void) | null = null
let stopped = false

export async function startLenis() {
  stopped = false
  if (lenis) return lenis
  const [{ default: LenisCtor }, { gsap, ScrollTrigger }] = await Promise.all([import("lenis"), loadGsap()])
  if (stopped || lenis) return lenis
  lenis = new LenisCtor({ lerp: 0.1, wheelMultiplier: 0.9, autoRaf: false })
  lenis.on("scroll", ScrollTrigger.update)
  tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return lenis
}

export function stopLenis() {
  stopped = true
  if (tick) void loadGsap().then(({ gsap }) => tick && gsap.ticker.remove(tick))
  lenis?.destroy()
  lenis = null
  tick = null
}

export const getLenis = () => lenis

/** Scroll to an element or pixel offset, smoothly when Lenis is running. */
export function scrollToTarget(target: HTMLElement | number, opts: { immediate?: boolean; duration?: number } = {}) {
  if (lenis) {
    lenis.scrollTo(target, { immediate: opts.immediate, duration: opts.duration ?? 1.4, force: true })
    return
  }
  const top = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY
  window.scrollTo({ top, behavior: opts.immediate ? "instant" : "smooth" })
}
