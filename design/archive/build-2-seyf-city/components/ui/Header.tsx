"use client"

import { useEffect, useRef } from "react"

import { BrandBadge } from "@/components/ui/BrandBadge"
import { Magnetic } from "@/components/ui/Magnetic"
import { animateTimeOfDay } from "@/lib/animations"
import { gsap, useGSAP } from "@/lib/gsap"
import { scrollToTarget } from "@/lib/scroll"
import { playSfx } from "@/lib/sound"
import { storeOverride, useCity } from "@/lib/store"

export function Header({ onRecruiter }: { onRecruiter: () => void }) {
  const mode = useCity((s) => s.mode)
  const setMode = useCity((s) => s.setMode)
  return (
    <header className="no-print pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-3 pt-3 sm:px-6 sm:pt-5">
      <button
        type="button"
        onClick={() => scrollToTarget(0)}
        className="pointer-events-auto flex items-center gap-3 rounded-2xl"
        aria-label="Seyf City, back to the start of the tour"
      >
        <BrandBadge />
        <span className="hidden font-display text-xl font-semibold text-text sm:inline">Seyf City</span>
      </button>
      <nav aria-label="Site controls" className="pointer-events-auto flex items-center gap-1.5 sm:gap-2.5">
        <DayNightToggle />
        <SoundToggle />
        <button
          type="button"
          className="btn btn-mint btn-icon sm:w-auto sm:px-4"
          aria-pressed={mode === "explore"}
          onClick={() => {
            playSfx("click")
            setMode(mode === "explore" ? "tour" : "explore")
          }}
        >
          <span aria-hidden="true">{mode === "explore" ? "🧭" : "🗺️"}</span>
          <span className="sr-only sm:not-sr-only">{mode === "explore" ? "Back to the tour" : "Explore freely"}</span>
        </button>
        <Magnetic strength={0.25}>
          <button type="button" className="btn btn-coral max-sm:gap-1.5 max-sm:px-3" onClick={onRecruiter}>
            <span aria-hidden="true">👔</span>
            <span>
              Recruiter<span className="hidden sm:inline"> Mode</span>
            </span>
          </button>
        </Magnetic>
      </nav>
    </header>
  )
}

// Sun with eight rays, and a crescent moon. MorphSVG morphs one path into the other.
const SUN = (() => {
  const pts: string[] = []
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2
    const r = i % 2 === 0 ? 10.5 : 6.6
    pts.push(`${(12 + Math.cos(a) * r).toFixed(2)} ${(12 + Math.sin(a) * r).toFixed(2)}`)
  }
  return `M${pts.join(" L")} Z`
})()
const MOON = "M15.2 3.2 C10.2 3.6 6.4 7.8 6.4 12.9 C6.4 18.2 10.7 22.4 16 22.4 C17.5 22.4 18.9 22.1 20.2 21.4 C15.6 20.7 12.2 16.8 12.2 12.1 C12.2 8.4 14.3 5.1 17.4 3.6 C16.7 3.3 15.9 3.2 15.2 3.2 Z"

function DayNightToggle() {
  const isNight = useCity((s) => s.isNight)
  const setTimeOverride = useCity((s) => s.setTimeOverride)
  const path = useRef<SVGPathElement>(null)
  const first = useRef(true)

  useGSAP(
    () => {
      if (!path.current) return
      gsap.to(path.current, {
        morphSVG: isNight ? MOON : SUN,
        rotate: isNight ? 0 : 90,
        transformOrigin: "50% 50%",
        duration: first.current ? 0 : 0.7,
        ease: "back.out(1.6)",
      })
      first.current = false
    },
    { dependencies: [isNight] }
  )

  return (
    <button
      type="button"
      className="btn btn-sky btn-icon"
      aria-label={isNight ? "Switch to day" : "Switch to night"}
      onClick={() => {
        const target = isNight ? "day" : "night"
        playSfx("click")
        setTimeOverride(target)
        storeOverride(target)
        animateTimeOfDay(target)
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path ref={path} d={SUN} fill={isNight ? "var(--color-cream)" : "var(--color-butter)"} stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </button>
  )
}

function SoundToggle() {
  const sound = useCity((s) => s.sound)
  const toggle = useCity((s) => s.toggleSound)
  const waves = useRef<SVGGElement>(null)
  useEffect(() => {
    if (!waves.current) return
    gsap.to(waves.current, { autoAlpha: sound ? 1 : 0, scale: sound ? 1 : 0.5, transformOrigin: "0% 50%", duration: 0.35, ease: "back.out(2)" })
  }, [sound])
  return (
    <button type="button" className="btn btn-lavender btn-icon" aria-pressed={sound} aria-label="Ambient sound" onClick={toggle}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="var(--color-cream)" />
        <g ref={waves} style={{ opacity: 0 }}>
          <path d="M15.5 9a4 4 0 0 1 0 6" />
          <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
        </g>
        {!sound && <path d="M15.5 9.5l5 5M20.5 9.5l-5 5" />}
      </svg>
    </button>
  )
}
