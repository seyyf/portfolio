"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useSyncExternalStore } from "react"

import { loadGsap } from "@/lib/gsapLazy"
import { cn } from "@/lib/utils"

const SUN = "M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"
const MOON = "M14.5 4.2a8 8 0 1 0 5.3 12.5A6.6 6.6 0 0 1 14.5 4.2Z"

const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

/**
 * "Morning / Night Edition" switch. Colours glide over 400ms and the sun morphs into a moon
 * (MorphSVG, loaded only when the edition is actually switched).
 */
export function ThemeToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = useMounted()
  const night = mounted && resolvedTheme === "dark"
  const path = useRef<SVGPathElement>(null)
  const rays = useRef<SVGGElement>(null)
  const shown = useRef<boolean | null>(null)

  useEffect(() => {
    const p = path.current
    const r = rays.current
    if (!p || !r || !mounted) return
    if (shown.current === null) {
      // First render on the client: set the icon directly, no animation.
      p.setAttribute("d", night ? MOON : SUN)
      r.style.opacity = night ? "0" : "1"
    } else if (shown.current !== night) {
      void loadGsap().then(({ gsap }) => {
        gsap.to(p, { morphSVG: night ? MOON : SUN, duration: 0.5, ease: "power2.inOut" })
        gsap.to(r, { opacity: night ? 0 : 1, scale: night ? 0.4 : 1, transformOrigin: "50% 50%", duration: 0.5 })
      })
    }
    shown.current = night
  }, [night, mounted])

  const toggle = () => {
    const root = document.documentElement
    root.classList.add("theme-transition")
    setTheme(night ? "light" : "dark")
    window.setTimeout(() => root.classList.remove("theme-transition"), 450)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      // The accessible name starts with the visible label, then says what pressing does.
      aria-label={night ? "Night Edition: switch to the Morning Edition (light)" : "Morning Edition: switch to the Night Edition (dark)"}
      className={cn("label inline-flex min-h-9 items-center gap-1.5 hover:text-accent-ink", className)}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path ref={path} d={SUN} fill="currentColor" stroke="none" />
        <g ref={rays}>
          <path d="M12 1.5v2.2M12 20.3v2.2M1.5 12h2.2M20.3 12h2.2M4.6 4.6l1.5 1.5M17.9 17.9l1.5 1.5M4.6 19.4l1.5-1.5M17.9 6.1l1.5-1.5" />
        </g>
      </svg>
      {!compact && <span suppressHydrationWarning>{mounted ? (night ? "Night Edition" : "Morning Edition") : "Edition"}</span>}
    </button>
  )
}
