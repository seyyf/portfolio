"use client"

import { useEffect } from "react"

import { INTRO_SEEN_KEY } from "@/lib/headScripts"
import { motionReduced } from "@/lib/prefs"

// Drives the loading screen once React has hydrated. CSS already plays the whole timeline and
// hides the screen at 3s; this adds skip-on-any-input and remembers the visit for the session.
// (No GSAP here on purpose: loading it during the first seconds cost up to 2s of main-thread time
// on mobile. The CSS timeline is the whole sequence.) A hard timer always ends it.

const TOTAL = 2500 // the CSS timeline ends at 2.5s too (styles.ts); never longer
const CLASSES = ["intro-pending", "intro-js-title", "intro-js-exit"]
const MODIFIERS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "Fn"])


export function IntroController() {
  useEffect(() => {
    const html = document.documentElement
    const root = document.getElementById("ow-intro")
    if (!root || !html.classList.contains("intro-pending")) return

    let done = false
    let exiting = false
    const timers: number[] = []
    const skipButton = root.querySelector<HTMLButtonElement>("[data-intro-skip]")

    // Time since the CSS timeline started (the root's exit animation starts at first paint).
    const cssClock = root.getAnimations().find((a) => (a as CSSAnimation).animationName === "ow-out")
    const elapsed = () => (typeof cssClock?.currentTime === "number" ? cssClock.currentTime : performance.now())

    const removeListeners = () => {
      window.removeEventListener("keydown", onKey, true)
      window.removeEventListener("pointerdown", skip, true)
      skipButton?.removeEventListener("click", skip)
    }

    const finish = () => {
      if (done) return
      done = true
      removeListeners()
      // Remembered for good: returning visitors go straight to the map (see lib/headScripts.ts).
      try {
        localStorage.setItem(INTRO_SEEN_KEY, "1")
      } catch {}
      // Keep the map's landing flight (normal or skip) running for a moment after the screen is gone.
      html.classList.add("intro-landing")
      html.classList.remove(...CLASSES)
      window.setTimeout(() => {
        html.classList.remove("intro-landing", "intro-skip")
      }, 1100)
    }

    function skip() {
      if (done || exiting) return
      exiting = true
      html.classList.add("intro-skip")
      timers.push(window.setTimeout(finish, 300))
    }

    function onKey(e: KeyboardEvent) {
      if (MODIFIERS.has(e.key)) return
      // Esc would otherwise also open the pause menu.
      if (e.key === "Escape") e.preventDefault()
      skip()
    }

    if (motionReduced() || elapsed() >= TOTAL) {
      finish()
      return
    }

    window.addEventListener("keydown", onKey, true)
    window.addEventListener("pointerdown", skip, true)
    skipButton?.addEventListener("click", skip)
    // The CSS exit ends at 3s; never let the screen outlive it.
    timers.push(window.setTimeout(finish, TOTAL - elapsed() + 80))

    return () => {
      removeListeners()
      timers.forEach(clearTimeout)
      // Strict mode remounts right away; a real unmount (navigating away mid-intro) ends the intro.
      window.setTimeout(() => {
        if (!document.getElementById("ow-intro")) finish()
      }, 0)
    }
  }, [])

  return null
}
