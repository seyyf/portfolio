"use client"

import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { RecruiterView } from "@/components/recruiter/RecruiterView"
import { labelsPortal } from "@/components/city/labelsPortal"
import { Cursor } from "@/components/ui/Cursor"
import { Header } from "@/components/ui/Header"
import { InfoPanel } from "@/components/ui/InfoPanel"
import { Loader } from "@/components/ui/Loader"
import { RoadProgress } from "@/components/ui/RoadProgress"
import { Tour } from "@/components/ui/Tour"
import { animateTimeOfDay, FINALE_RIG } from "@/lib/animations"
import { Flip, ScrollTrigger } from "@/lib/gsap"
import { getLenis, lockScroll, scrollToTarget, startLenis, stopLenis } from "@/lib/scroll"
import { setAmbientNight, setSoundEnabled } from "@/lib/sound"
import { readStoredOverride, useCity } from "@/lib/store"
import { world } from "@/lib/world"

let markCodeLoaded: () => void = () => {}
const Scene = dynamic(
  () =>
    import("@/components/city/Scene").then((m) => {
      markCodeLoaded()
      return m
    }),
  { ssr: false }
)

function webglAvailable() {
  try {
    const c = document.createElement("canvas")
    return !!(c.getContext("webgl2") || c.getContext("webgl"))
  } catch {
    return false
  }
}

export function CityShell() {
  const pathname = usePathname()
  const recruiter = pathname === "/recruiter"
  const mode = useCity((s) => s.mode)
  const setMode = useCity((s) => s.setMode)
  const isNight = useCity((s) => s.isNight)
  const sound = useCity((s) => s.sound)
  const reduced = useCity((s) => s.reducedMotion)
  const [codeLoaded, setCodeLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [webgl, setWebgl] = useState(true)
  const [capture, setCapture] = useState<"day" | "night" | null>(null)
  /** Reduced-motion visitors see the simple page first and can opt into the 3D city. */
  const [cityOptIn, setCityOptIn] = useState(false)
  const pendingFlip = useRef<Flip.FlipState | null>(null)
  const savedScroll = useRef(0)

  // One-time setup: preferences, quality tier, smooth scroll, remembered day/night.
  useEffect(() => {
    markCodeLoaded = () => setCodeLoaded(true)
    const s = useCity.getState()
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    s.setReducedMotion(rm)
    const weak =
      (window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 900) ||
      (navigator.hardwareConcurrency ?? 8) <= 4 ||
      ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 4
    if (weak) s.setQuality("low")
    // One-time read of browser-only capabilities after hydration (not derivable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(webglAvailable())

    const params = new URLSearchParams(window.location.search)
    const cap = params.get("capture")
    if (cap === "day" || cap === "night") {
      setCapture(cap)
      useCity.setState({ capture: true, quality: "high" })
      world.assembleFloor = 1
      world.rig = { ...FINALE_RIG, zoom: 1.02 }
      animateTimeOfDay(cap, true)
    } else {
      const stored = readStoredOverride()
      const initial = stored ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "night" : null)
      if (initial) {
        s.setTimeOverride(initial)
        animateTimeOfDay(initial, true)
      }
    }
    if (!rm) startLenis()
    setMounted(true)
    return () => stopLenis()
  }, [])

  // Keep the page theme and ambient sound in step with the sky.
  useEffect(() => {
    if (isNight) document.documentElement.setAttribute("data-night", "true")
    else document.documentElement.removeAttribute("data-night")
    setAmbientNight(isNight)
  }, [isNight])
  useEffect(() => {
    setSoundEnabled(sound)
  }, [sound])

  // Explore mode: freeze page scroll, make sure the city is fully built.
  useEffect(() => {
    if (mode === "explore") {
      lockScroll(true)
      world.assembleFloor = 1
      useCity.getState().closePanel()
    } else {
      lockScroll(false)
    }
  }, [mode])

  const showCity = !recruiter && webgl && (!reduced || cityOptIn)

  // Reduced motion + opted in: the city opens straight into explore mode (no camera flights).
  useEffect(() => {
    if (reduced && cityOptIn) setMode("explore")
  }, [reduced, cityOptIn, setMode])

  // Recruiter mode toggles the URL (so /recruiter is shareable) and morphs the house badge with Flip.
  const toggleRecruiter = useCallback(() => {
    pendingFlip.current = Flip.getState('[data-flip-id="brand-badge"]')
    useCity.getState().closePanel()
    if (!recruiter) {
      savedScroll.current = window.scrollY
      window.history.pushState(null, "", "/recruiter")
    } else {
      window.history.pushState(null, "", "/")
    }
  }, [recruiter])

  useLayoutEffect(() => {
    useCity.getState().setRecruiter(recruiter)
    if (recruiter) {
      if (useCity.getState().mode === "explore") setMode("tour")
      getLenis()?.scrollTo(0, { immediate: true, force: true })
      window.scrollTo(0, 0)
    }
    const state = pendingFlip.current
    pendingFlip.current = null
    if (state && !useCity.getState().reducedMotion) {
      Flip.from(state, {
        targets: '[data-flip-id="brand-badge"]',
        duration: 0.8,
        ease: "power3.inOut",
        scale: true,
        absolute: true,
        zIndex: 80,
      })
    }
    if (!recruiter && savedScroll.current) {
      // The tour remounted in this same commit (child layout effects run first), so re-measure and
      // jump straight back to where the visitor was.
      const y = savedScroll.current
      savedScroll.current = 0
      getLenis()?.resize()
      ScrollTrigger.refresh()
      scrollToTarget(y, { immediate: true })
    }
  }, [recruiter, setMode])

  if (capture) {
    return (
      <div className="fixed inset-0">
        <Scene />
      </div>
    )
  }

  const simplePage = recruiter || !showCity

  return (
    <>
      {!simplePage && <Header onRecruiter={toggleRecruiter} />}
      {simplePage ? (
          <motion.main
            key="recruiter"
            id="main"
            tabIndex={-1}
            className="relative z-10 min-h-dvh px-4 py-6 outline-none sm:px-6 sm:py-10 print:p-0"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            {!recruiter && mounted && (
              <StaticCityBanner canOpen={webgl} onOpen={() => setCityOptIn(true)} />
            )}
            <RecruiterView onBackToCity={recruiter ? toggleRecruiter : webgl ? () => setCityOptIn(true) : undefined} />
          </motion.main>
        ) : (
          <motion.main
            key="city"
            id="main"
            tabIndex={-1}
            className="outline-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Tour hidden={mode === "explore"} />
          </motion.main>
        )}

      {/* The canvas stays mounted (paused) in recruiter mode so going back is instant. */}
      {mounted && webgl && (!reduced || cityOptIn) && (
        <>
          <div className={`fixed inset-0 z-0 ${simplePage ? "invisible" : ""}`}>
            <Scene paused={simplePage} />
          </div>
          {/* Building labels (drei <Html>) render here, above the canvas and below the tour cards. */}
          <div
            ref={(el) => {
              labelsPortal.current = el
            }}
            className={`pointer-events-none fixed inset-0 z-[1] overflow-hidden ${simplePage ? "invisible" : ""}`}
          />
        </>
      )}

      {!simplePage && (
        <>
          {mode === "tour" ? <RoadProgress /> : <ExploreHud onBack={() => (reduced ? setCityOptIn(false) : setMode("tour"))} reduced={reduced} />}
          <InfoPanel />
          <Loader codeLoaded={codeLoaded} />
        </>
      )}
      {mounted && <Cursor />}
    </>
  )
}

function ExploreHud({ onBack, reduced }: { onBack: () => void; reduced: boolean }) {
  return (
    <div className="no-print pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-3">
      <div className="card pointer-events-auto flex items-center gap-3 rounded-full py-2 pr-2 pl-5">
        <p className="hidden text-sm font-semibold sm:block">Drag to move, scroll or pinch to zoom, click a building to step inside.</p>
        <p className="text-sm font-semibold sm:hidden">Drag, pinch, tap a building.</p>
        <button type="button" className="btn btn-mint btn-sm" onClick={onBack}>
          {reduced ? "Back to the page" : "Back to the tour"}
        </button>
      </div>
    </div>
  )
}

/** Reduced-motion entry: a still render of the city instead of the scroll tour. */
function StaticCityBanner({ canOpen, onOpen }: { canOpen: boolean; onOpen: () => void }) {
  return (
    <div className="mx-auto mb-8 max-w-[880px]">
      <figure className="card print-plain no-print overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- static render; next/image adds nothing here */}
        <img
          src="/images/city-static.png"
          alt="Seyf City at night: a small low-poly island town with glowing windows, where every building is a project Seyf built."
          width={1600}
          height={900}
          className="block h-auto w-full"
        />
        <figcaption className="flex flex-wrap items-center justify-between gap-3 p-4">
          <span className="font-semibold">This is Seyf City, the interactive version of this page.</span>
          {canOpen && (
            <button type="button" className="btn btn-sky btn-sm" onClick={onOpen}>
              Explore the 3D city
            </button>
          )}
        </figcaption>
      </figure>
    </div>
  )
}
