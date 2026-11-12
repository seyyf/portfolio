"use client"

import { useRef } from "react"

import { buildingById, tourOrder } from "@/data/city"
import { SECTION_COUNT } from "@/lib/animations"
import { gsap, useGSAP } from "@/lib/gsap"
import { scrollToTarget } from "@/lib/scroll"
import { useCity } from "@/lib/store"
import { world } from "@/lib/world"

const STOPS = [
  { id: "intro", label: "Sunrise", emoji: "🌅" },
  ...tourOrder.map((id) => ({ id: `stop-${id}`, label: buildingById[id].name, emoji: buildingById[id].emoji })),
  { id: "finale", label: "Night", emoji: "🌙" },
]

/** Tour progress as a little road: a car drives along it with the scroll; each dot jumps to a stop. */
export function RoadProgress() {
  const root = useRef<HTMLElement>(null)
  const car = useRef<HTMLDivElement>(null)
  const section = useCity((s) => s.section)

  useGSAP(
    () => {
      gsap.from("[data-road-line]", { drawSVG: "0%", duration: 1.4, ease: "power2.inOut", delay: 0.4 })
      gsap.from("[data-road-dot]", { scale: 0, autoAlpha: 0, stagger: 0.05, duration: 0.4, ease: "back.out(3)", delay: 0.9 })
      const setX = gsap.quickSetter(car.current, "left", "%")
      let last = -1
      const tick = () => {
        const p = Math.round(world.progress * 1000) / 10
        if (p !== last) {
          setX(p)
          last = p
        }
      }
      gsap.ticker.add(tick)
      return () => gsap.ticker.remove(tick)
    },
    { scope: root }
  )

  return (
    <nav ref={root} aria-label="Tour stops" className="no-print pointer-events-auto fixed bottom-3 left-1/2 z-30 w-[min(720px,calc(100vw-1.5rem))] -translate-x-1/2">
      <div className="relative h-12 rounded-full border-2 border-ink bg-[#C9C6D9] shadow-[0_4px_0_var(--color-ink)]">
        <svg className="absolute inset-x-5 top-1/2 h-1 w-[calc(100%-2.5rem)] -translate-y-1/2 overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 2" aria-hidden="true">
          <line data-road-line x1="0" y1="1" x2="100" y2="1" stroke="#FFFDF8" strokeWidth="1.6" strokeDasharray="3 2.4" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className="absolute inset-x-5 inset-y-0">
          {STOPS.map((s, i) => {
            const active = i === section
            return (
              <li key={s.id} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(i / (SECTION_COUNT - 1)) * 100}%` }}>
                <button
                  data-road-dot
                  type="button"
                  aria-label={`Go to ${s.label}`}
                  aria-current={active ? "step" : undefined}
                  title={s.label}
                  onClick={() => {
                    const el = document.getElementById(s.id)
                    if (el) scrollToTarget(el, { duration: 1.8 })
                  }}
                  className={`group relative grid place-items-center rounded-full border-2 border-ink transition-[width,height,background-color] duration-300 ${
                    active ? "size-7 bg-butter text-sm" : "size-3.5 bg-cream hover:size-6 hover:bg-butter"
                  }`}
                >
                  <span aria-hidden="true" className={active ? "" : "hidden group-hover:inline text-[11px]"}>
                    {s.emoji}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-5 -top-5 h-7">
          <div ref={car} className="absolute top-0 left-0">
            <span className="block text-xl" style={{ transform: "translateX(-50%) scaleX(-1)" }}>
              🚗
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}
