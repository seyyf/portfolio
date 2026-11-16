"use client"

import { useEffect, useState } from "react"

export const INTRO_KEY = "seyftimes-printed"
const INTRO_MS = 1300

/**
 * "Printing" intro, first visit of the session only, ~1.3s and skippable: the masthead inks in from
 * left to right and the double rule draws across. It is pure CSS (class `intro-pending`, set by an
 * inline script before the first paint), so it starts with the very first frame and never waits for
 * JavaScript; the page content itself is never hidden. This component only remembers that the intro
 * played and offers a Skip button.
 */
export function IntroPrint() {
  const [running, setRunning] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    if (!root.classList.contains("intro-pending")) return
    try {
      sessionStorage.setItem(INTRO_KEY, "1")
    } catch {
      // Not remembered: the intro may play again next visit, which is harmless.
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- shows the Skip button while the intro plays
    setRunning(true)
    const done = () => {
      root.classList.remove("intro-pending")
      setRunning(false)
    }
    const t = window.setTimeout(done, INTRO_MS)
    const skip = () => {
      window.clearTimeout(t)
      done()
    }
    window.addEventListener("keydown", skip, { once: true })
    window.addEventListener("pointerdown", skip, { once: true })
    return () => {
      window.clearTimeout(t)
      window.removeEventListener("keydown", skip)
      window.removeEventListener("pointerdown", skip)
    }
  }, [])

  if (!running) return null
  return (
    <button
      type="button"
      onClick={() => document.documentElement.classList.remove("intro-pending")}
      className="label no-print fixed right-4 bottom-4 z-[95] border border-rule bg-paper px-3 py-2 hover:text-accent-ink"
    >
      Skip intro
    </button>
  )
}

/** Inline script (runs before first paint): marks the page for the intro on the first visit of the session. */
export const introScript = `(function(){try{if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;if(sessionStorage.getItem(${JSON.stringify(
  INTRO_KEY
)}))return;document.documentElement.classList.add("intro-pending")}catch(e){}})()`
