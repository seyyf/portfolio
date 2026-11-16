"use client"

import { useLayoutEffect, type DependencyList } from "react"

// GSAP (with ScrollTrigger, SplitText, DrawSVG, MorphSVG) is loaded after the page is interactive
// instead of in the first bundle, so it never delays the first paint of the largest text or image.
// Once loaded it's cached: later page turns animate immediately.

export type GsapModule = typeof import("@/lib/gsap")

let mod: GsapModule | null = null
let loading: Promise<GsapModule> | null = null

export function loadGsap(): Promise<GsapModule> {
  if (mod) return Promise.resolve(mod)
  if (!loading) {
    loading = import("@/lib/gsap").then((m) => {
      mod = m
      return m
    })
  }
  return loading
}

let wake: Promise<void> | null = null

/**
 * Resolves on the visitor's first scroll, touch, key press or mouse move. Nothing below the fold can
 * be seen before that, so no animation is lost, and GSAP + Lenis never compete with the first paint
 * or hydration (they cost nothing to a visitor who only reads the top of the page).
 */
function whenFirstInteraction(): Promise<void> {
  if (!wake) {
    wake = new Promise((resolve) => {
      const events = ["scroll", "wheel", "pointerdown", "pointermove", "keydown", "touchstart"] as const
      const go = () => {
        for (const e of events) window.removeEventListener(e, go)
        resolve()
      }
      for (const e of events) window.addEventListener(e, go, { passive: true })
    })
  }
  return wake
}

/** True once GSAP has loaded (i.e. not the very first render of the visit). */
export const gsapReady = () => mod !== null

/**
 * Runs `setup` with GSAP inside a gsap.context, after GSAP is available. Everything the setup creates
 * (tweens, ScrollTriggers, SplitText) is reverted on cleanup or when `deps` change.
 */
export function useGsapEffect(setup: (g: GsapModule) => void | (() => void), deps: DependencyList) {
  useLayoutEffect(() => {
    let cancelled = false
    let ctx: { revert: () => void } | null = null
    let extra: void | (() => void)
    const ready = mod ? Promise.resolve() : whenFirstInteraction()
    ready
      .then(() => loadGsap())
      .then((g) => {
        if (cancelled) return
        ctx = g.gsap.context(() => {
          extra = setup(g)
        })
      })
    return () => {
      cancelled = true
      if (typeof extra === "function") extra()
      ctx?.revert()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Loads GSAP on the first interaction (see whenFirstInteraction). */
export function loadGsapOnInteract(): Promise<GsapModule> {
  return whenFirstInteraction().then(() => loadGsap())
}
