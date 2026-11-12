"use client"

import { FileText } from "lucide-react"
import Link from "next/link"
import { useRef, type ReactNode } from "react"

import { AmbientBackground } from "@/components/desktop/AmbientBackground"
import { SeyfOSLogo } from "@/components/os/icons"
import { apps } from "@/data/apps"
import { profile } from "@/data/profile"
import { gsap, SplitText, useGSAP } from "@/lib/gsap"
import { useCurrentApp } from "@/lib/nav"
import { useOS } from "@/lib/store"

const DEFAULT_ACCENTS = { accent: "#C3B1E1", accent2: "#A0D2EB" }

/**
 * Phone on a stage. On phones (< 768px) the phone IS the screen: full screen, no frame, and the
 * side panels are hidden. On tablet/desktop a framed phone floats in the centre and tilts with the
 * mouse (but never while the pointer is inside it).
 */
export function DesktopStage({ children }: { children: ReactNode }) {
  const app = useCurrentApp()
  const { accent, accent2 } = app ? apps[app] : DEFAULT_ACCENTS
  const stage = useRef<HTMLDivElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const reduced = useOS((s) => s.reducedMotion)

  // Tilt: GSAP quickTo towards the pointer; flat while the pointer is over the phone.
  useGSAP(
    () => {
      const el = frame.current
      if (!el || reduced) return
      const mq = window.matchMedia("(min-width: 768px) and (pointer: fine)")
      if (!mq.matches) return
      gsap.set(el, { transformPerspective: 1400 })
      const rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "os.out" })
      const ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "os.out" })
      const onMove = (e: PointerEvent) => {
        if (el.contains(e.target as Node)) {
          rx(0)
          ry(0)
          return
        }
        const nx = e.clientX / window.innerWidth - 0.5
        const ny = e.clientY / window.innerHeight - 0.5
        ry(nx * 10)
        rx(-ny * 8)
      }
      const reset = () => {
        rx(0)
        ry(0)
      }
      window.addEventListener("pointermove", onMove, { passive: true })
      document.addEventListener("pointerleave", reset)
      return () => {
        window.removeEventListener("pointermove", onMove)
        document.removeEventListener("pointerleave", reset)
      }
    },
    { dependencies: [reduced], revertOnUpdate: true }
  )

  // Side text reveal.
  useGSAP(
    (_, contextSafe) => {
      if (reduced || !contextSafe) return
      const title = stage.current?.querySelector<HTMLElement>("[data-split]")
      if (!title || getComputedStyle(title).display === "none") return
      let cancelled = false
      // contextSafe keeps the async tweens in this context, so cleanup reverts them (text stays visible).
      const reveal = contextSafe(() => {
        if (cancelled) return
        const split = SplitText.create(title, { type: "chars,words", charsClass: "inline-block" })
        gsap.from(split.chars, { yPercent: 110, opacity: 0, stagger: 0.025, duration: 0.8, ease: "os.spring", delay: 0.3 })
        gsap.from(stage.current!.querySelectorAll("[data-fade]"), { opacity: 0, y: 14, stagger: 0.08, duration: 0.7, ease: "os.out", delay: 0.7 })
      })
      document.fonts.ready.then(reveal)
      return () => {
        cancelled = true
      }
    },
    { scope: stage, dependencies: [reduced], revertOnUpdate: true }
  )

  return (
    <div ref={stage} className="absolute inset-0 flex items-center justify-center overflow-clip md:p-6">
      <div className="hidden md:block">
        <AmbientBackground accent={accent} accent2={accent2} />
      </div>

      <aside className="absolute top-1/2 left-[max(2.5rem,calc(50%-560px))] hidden w-[min(300px,calc(50%-245px-3rem))] -translate-y-1/2 xl:block" aria-label="About this site">
        <p data-fade className="flex items-center gap-2 text-[13px] font-semibold text-text-soft">
          <SeyfOSLogo size={22} /> SeyfOS
        </p>
        <h2 data-split className="mt-3 font-display text-[3.2rem] leading-[1] font-semibold text-text">
          {profile.name}
        </h2>
        <p data-fade className="mt-3 text-lg font-semibold text-text">
          {profile.title}
        </p>
        <p data-fade className="mt-2 text-[15px] leading-relaxed text-text-soft">
          My portfolio is a phone. Every app on it is something I built: open one.
        </p>
      </aside>

      <div ref={frame} className="relative h-full w-full will-change-transform md:h-[min(844px,calc(100dvh-48px))] md:w-[390px]">
        <div className="h-full w-full md:rounded-[56px] md:bg-[#0B0C16] md:p-[11px] md:shadow-[0_50px_100px_-30px_rgba(20,20,40,0.55),0_0_0_1.5px_#2a2d42,inset_0_0_0_1px_rgba(255,255,255,0.08)]">
          <div className="relative h-full w-full overflow-clip md:rounded-[45px]">
            {children}
            {/* Subtle glass reflection on desktop. */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[96] hidden bg-[linear-gradient(115deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0)_32%)] md:block" />
          </div>
        </div>
      </div>

      <aside className="absolute top-1/2 right-[max(2.5rem,calc(50%-560px))] hidden w-[min(260px,calc(50%-245px-3rem))] -translate-y-1/2 xl:block" aria-label="Tips">
        <h2 data-fade className="text-[13px] font-semibold text-text-soft">
          Try this
        </h2>
        <ul className="mt-3 space-y-2.5 text-[15px] text-text">
          {[
            "Long-press an icon (or right-click it)",
            "Swipe down from the top right for the control center",
            "Esc goes home, ← and → switch pages",
            "Tap the battery when it runs low",
          ].map((t) => (
            <li key={t} data-fade className="glass rounded-2xl px-4 py-2.5 shadow-[var(--shadow)]">
              {t}
            </li>
          ))}
        </ul>
        <Link data-fade href="/resume" className="btn mt-5">
          <FileText size={18} aria-hidden="true" />
          Skip to résumé
        </Link>
      </aside>
    </div>
  )
}
