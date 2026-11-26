"use client"

import { AnimatePresence, m } from "framer-motion"
import { ArrowLeft, GraduationCap, Lock, LocateFixed, Minus, Plus } from "lucide-react"
import { useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type PointerEvent, type ReactNode } from "react"

import { Briefing } from "@/components/map/Briefing"
import { MissionCard, type CardPlacement } from "@/components/map/MissionCard"
import { MissionMarker } from "@/components/map/MissionMarker"
import { markerById, markers, nextMarker, type Direction, type MarkerItem } from "@/components/map/markers"
import { MAX_SCALE, MIN_SCALE, PanZoom, type Rect } from "@/components/map/panzoom"
import { closeBriefing, isDesktop, selectMarker, setFullMap, takeOpener, useMapState } from "@/components/map/store"
import { missions } from "@/data/missions"
import { motionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { getUI, openPhone } from "@/lib/ui"
import { cn } from "@/lib/utils"

const FOCUS_SCALE = 1.6
const ARROWS: Record<string, Direction> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" }

/** The part of the map that isn't covered by the intro card, the HUD or the briefing. */
function safeRect(vp: HTMLElement, briefing: boolean): Rect {
  const W = vp.clientWidth
  const H = vp.clientHeight
  if (isDesktop()) {
    const card = document.getElementById("map-intro")
    let left = card ? card.getBoundingClientRect().right - vp.getBoundingClientRect().left + 32 : 32
    const right = W - (briefing ? 440 : 110)
    if (right - left < 240) left = 32
    return { left, top: 110, right, bottom: H - 130 }
  }
  return { left: 24, top: 150, right: W - 72, bottom: briefing ? H * 0.36 : H - 100 }
}

function MapButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={() => {
        play("click")
        onClick()
      }}
      className="grid size-11 cursor-pointer place-items-center rounded-xl border border-ink/15 bg-bg/80 text-ink backdrop-blur-md transition-colors hover:border-orange hover:text-blue disabled:opacity-40"
    >
      {children}
    </button>
  )
}

/**
 * The interactive layer of the full map: pan / zoom, mission markers with hover cards, the
 * briefing panel, zoom controls and the legend. `children` is the server-rendered map art.
 * Desktop: fills the hub section. Phones: hidden until the full map is opened, then full screen.
 */
export function WorldMap({ children }: { children: ReactNode }) {
  const { selected, nonce, fullMap } = useMapState()
  const rootRef = useRef<HTMLDivElement>(null)
  const vpRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const pz = useRef<PanZoom | null>(null)
  const buttons = useRef(new Map<string, HTMLButtonElement>())
  const hintTimer = useRef(0)
  const hintShown = useRef(0)
  const lastSelected = useRef<string | null>(null)

  const [roving, setRoving] = useState(missions[0].slug)
  const [hover, setHover] = useState<string | null>(null)
  const [kbd, setKbd] = useState<string | null>(null)
  const [placement, setPlacement] = useState<CardPlacement>({ side: "right", v: "center" })
  const [scale, setScale] = useState(1)
  const [hint, setHint] = useState(false)

  const cardId = hover ?? kbd
  const briefing = markerById(selected)
  const activeDistrict = (briefing ?? markerById(cardId))?.district

  // Pan / zoom engine.
  useEffect(() => {
    const vp = vpRef.current
    const world = worldRef.current
    if (!vp || !world) return
    const engine = new PanZoom(vp, world, {
      reduced: motionReduced,
      cooperative: isDesktop,
      onWheelHint: () => {
        // Scrolling the page over the map: say how to zoom, at most every 8s.
        if (performance.now() - hintShown.current < 8000) return
        hintShown.current = performance.now()
        setHint(true)
        window.clearTimeout(hintTimer.current)
        hintTimer.current = window.setTimeout(() => setHint(false), 1800)
      },
      onSettle: (v) => setScale(v.s),
    })
    pz.current = engine
    return () => {
      engine.destroy()
      pz.current = null
      window.clearTimeout(hintTimer.current)
    }
  }, [])

  // A selection (marker click, "Start the story", "Show on map") flies the map to that marker.
  useEffect(() => {
    const item = markerById(selected)
    const vp = vpRef.current
    if (!item || !vp) return
    const frame = requestAnimationFrame(() => {
      const engine = pz.current
      if (engine) engine.centerOn(item.x, item.y, safeRect(vp, true), Math.max(engine.v.s, FOCUS_SCALE))
    })
    return () => cancelAnimationFrame(frame)
  }, [selected, nonce])

  // Briefing closed: give focus back to its marker.
  useEffect(() => {
    const prev = lastSelected.current
    lastSelected.current = selected
    if (selected || !prev || (!isDesktop() && !fullMap)) return
    const ui = getUI()
    if (ui.phone || ui.pause) return
    const active = document.activeElement
    if (!active || active === document.body || rootRef.current?.contains(active)) buttons.current.get(prev)?.focus({ preventScroll: true })
  }, [selected, fullMap])

  // Phones: opening the full map moves focus into it; closing returns focus to the opener.
  useEffect(() => {
    if (isDesktop()) return
    if (fullMap) {
      const frame = requestAnimationFrame(() => {
        if (!rootRef.current?.contains(document.activeElement)) closeRef.current?.focus({ preventScroll: true })
      })
      return () => cancelAnimationFrame(frame)
    }
    takeOpener()?.focus({ preventScroll: true })
  }, [fullMap])

  // Arriving on /#map on a phone (the HUD minimap from another page) opens the full map.
  useEffect(() => {
    if (window.location.hash !== "#map" || isDesktop()) return
    setFullMap(true)
    // Drop the hash so a reload doesn't reopen it (keeps the router's history state).
    window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search)
  }, [])

  // Esc closes, in order: the briefing, a marker card, the phone full map. preventDefault() tells
  // the global pause-menu handler to ignore this Esc. Capture phase so it runs first.
  const latest = useRef({ selected, card: false, fullMap })
  useEffect(() => {
    latest.current = { selected, card: cardId !== null, fullMap }
  })
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return
      const ui = getUI()
      if (ui.pause || ui.phone || document.querySelector("dialog[open]")) return
      const s = latest.current
      if (s.selected) {
        e.preventDefault()
        closeBriefing()
      } else if (s.card) {
        e.preventDefault()
        setHover(null)
        setKbd(null)
      } else if (s.fullMap && !isDesktop()) {
        e.preventDefault()
        setFullMap(false)
      }
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [])

  const place = (item: MarkerItem) => {
    const vp = vpRef.current
    const engine = pz.current
    if (!vp || !engine) return
    const p = engine.screen(item.x, item.y)
    setPlacement({ side: p.x > vp.clientWidth - 340 ? "left" : "right", v: p.y < 160 ? "top" : p.y > vp.clientHeight - 160 ? "bottom" : "center" })
  }

  const onMarkerClick = (item: MarkerItem) => {
    setRoving(item.id)
    setHover(null)
    setKbd(null)
    if (item.kind === "locked") {
      play("pop")
      closeBriefing()
      openPhone("messages")
      return
    }
    play("tap")
    selectMarker(item.id)
  }

  const onMarkerFocus = (e: FocusEvent<HTMLButtonElement>, item: MarkerItem) => {
    setRoving(item.id)
    if (!e.currentTarget.matches(":focus-visible")) return
    place(item)
    setKbd(item.id)
    // Keep the focused marker in the visible part of the map.
    const vp = vpRef.current
    const engine = pz.current
    if (!vp || !engine) return
    const r = safeRect(vp, selected !== null)
    const p = engine.screen(item.x, item.y)
    if (p.x < r.left || p.x > r.right || p.y < r.top || p.y > r.bottom) engine.centerOn(item.x, item.y, r)
  }

  const onMarkerKey = (e: KeyboardEvent<HTMLButtonElement>, item: MarkerItem) => {
    let next: MarkerItem | undefined
    if (ARROWS[e.key]) next = nextMarker(item, ARROWS[e.key])
    else if (e.key === "Home") next = markers[0]
    else if (e.key === "End") next = markers[markers.length - 1]
    else if (e.key === "+" || e.key === "=") pz.current?.zoomBy(1.4)
    else if (e.key === "-" || e.key === "_") pz.current?.zoomBy(1 / 1.4)
    else return
    e.preventDefault()
    if (next) buttons.current.get(next.id)?.focus({ preventScroll: true })
  }

  const onPointerEnter = (e: PointerEvent<HTMLButtonElement>, item: MarkerItem) => {
    if (e.pointerType !== "mouse") return
    place(item)
    setHover(item.id)
  }

  return (
    <div ref={rootRef} className={cn("bg-land", fullMap ? "fixed inset-0 z-40 lg:absolute lg:z-0" : "hidden lg:absolute lg:inset-0 lg:block")}>
      <div ref={vpRef} className="ow-map-viewport absolute inset-0 cursor-grab touch-none overflow-clip select-none lg:touch-pan-y">
        <div data-intro-flight className="absolute inset-0">
          <div ref={worldRef} data-active-district={activeDistrict} className="ow-map-world">
            {children}
            <div role="group" aria-label="Mission markers on the map of Greater Tunis" aria-describedby="map-help">
              {markers.map((item, i) => {
                const card = cardId === item.id && selected !== item.id
                return (
                  <div
                    key={item.id}
                    className={cn("absolute", card ? "z-20" : item.kind === "mission" ? "z-10" : "z-[5]")}
                    style={{ left: `${item.x / 16}%`, top: `${item.y / 10}%` }}
                  >
                    <div className="ow-marker relative">
                      <MissionMarker
                        m={item}
                        active={selected === item.id}
                        tabIndex={roving === item.id ? 0 : -1}
                        pingDelay={(i % 5) * 0.45}
                        buttonRef={(el) => {
                          if (el) buttons.current.set(item.id, el)
                          else buttons.current.delete(item.id)
                        }}
                        onClick={() => onMarkerClick(item)}
                        onFocus={(e) => onMarkerFocus(e, item)}
                        onBlur={() => setKbd((k) => (k === item.id ? null : k))}
                        onPointerEnter={(e) => onPointerEnter(e, item)}
                        onPointerLeave={() => setHover((h) => (h === item.id ? null : h))}
                        onKeyDown={(e) => onMarkerKey(e, item)}
                      />
                      {card && <MissionCard m={item} placement={placement} />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <p id="map-help" className="sr-only">
        Arrow keys move between markers, Enter opens a briefing, Escape closes it, plus and minus zoom. The mission list below has the same content.
      </p>

      {/* Phones: back to the list */}
      <button
        ref={closeRef}
        type="button"
        onClick={() => {
          play("click")
          setFullMap(false)
        }}
        className="absolute top-[4.5rem] left-4 z-10 inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-ink/15 bg-bg/85 px-4 text-sm font-semibold text-ink backdrop-blur-md transition-colors hover:border-orange hover:text-blue lg:hidden"
      >
        <ArrowLeft aria-hidden="true" className="size-4" /> Mission list
      </button>

      {/* Zoom */}
      <div className="absolute right-4 bottom-[5.5rem] z-10 flex flex-col gap-2 lg:right-[6.5rem] lg:bottom-6 lg:flex-row">
        <MapButton label="Zoom in" onClick={() => pz.current?.zoomBy(1.5)} disabled={scale >= MAX_SCALE - 0.01}>
          <Plus aria-hidden="true" className="size-5" />
        </MapButton>
        <MapButton label="Zoom out" onClick={() => pz.current?.zoomBy(1 / 1.5)} disabled={scale <= MIN_SCALE + 0.01}>
          <Minus aria-hidden="true" className="size-5" />
        </MapButton>
        <MapButton label="Reset the map view" onClick={() => pz.current?.reset()}>
          <LocateFixed aria-hidden="true" className="size-5" />
        </MapButton>
      </div>

      {/* Legend */}
      <div className="pointer-events-none absolute top-[7.75rem] right-4 left-4 z-10 lg:top-auto lg:right-auto lg:bottom-6 lg:left-40">
        <ul className="inline-flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-ink/12 bg-bg/80 px-3 py-2 font-mono text-[0.6875rem] text-ink/90 lowercase backdrop-blur-md">
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="bg-blue size-3 rounded-full p-[2px]">
              <span className="block size-full rounded-full bg-bg" />
            </span>
            Mission
          </li>
          <li className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rotate-45 rounded-[2px] border-2 border-yellow" />
            Side mission
          </li>
          <li className="inline-flex items-center gap-1.5">
            <GraduationCap aria-hidden="true" className="size-3.5 text-[#b4dca3]" />
            Education
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Lock aria-hidden="true" className="size-3 text-ink/80" />
            Locked
          </li>
        </ul>
        <p className="mt-1.5 text-xs text-ink/70 [text-shadow:0_1px_4px_rgb(0_0_0/0.9)]">Marker positions are illustrative</p>
      </div>

      {/* Wheel hint (desktop: a plain wheel scrolls the page) */}
      <div role="status" className="pointer-events-none absolute bottom-28 left-1/2 z-10 -translate-x-1/2">
        {hint && <p className="rounded-lg border border-ink/15 bg-bg/90 px-4 py-2 text-sm text-ink backdrop-blur-md">Hold Ctrl or ⌘ while scrolling to zoom — or use + and −</p>}
      </div>

      <AnimatePresence>
        {briefing && briefing.kind !== "locked" && (
          <m.div
            key="briefing"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[72svh] overflow-y-auto overscroll-contain rounded-t-2xl border border-ink/12 bg-bg/95 p-5 pb-8 shadow-[0_-20px_60px_-20px_rgb(0_0_0/0.9)] backdrop-blur-md lg:absolute lg:inset-x-auto lg:top-[6.5rem] lg:right-6 lg:bottom-auto lg:z-20 lg:max-h-[calc(100%-14rem)] lg:w-[23rem] lg:rounded-2xl lg:p-6"
          >
            <div aria-hidden="true" className="bg-blue absolute inset-x-0 top-0 h-1" />
            <Briefing m={briefing} onClose={closeBriefing} />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
