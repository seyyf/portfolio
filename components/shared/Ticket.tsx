"use client"

import { useReducedMotion } from "framer-motion"
import { useRef, type CSSProperties } from "react"

import { gsap, useGSAP } from "@/lib/gsap"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

type TicketProps = {
  /** Event name, the big line on the ticket. */
  title: string
  /** Small line above the title, e.g. the organiser. */
  eyebrow?: string
  /** Date, time and place. */
  details?: string
  /** Short label/value pairs in a row, e.g. Row C, Seat 5. */
  fields?: { label: string; value: string }[]
  /** Booking code. Printed on the stub and used to draw the (decorative) QR code. */
  code: string
  /** Small note on the stub. */
  stubNote?: string
  /** When it turns true, the stub tears off along the perforation. */
  torn?: boolean
  onTorn?: () => void
  /** Background of the main part (a Tailwind class). Text on it is dark ink. */
  accentClassName?: string
  className?: string
}

const NOTCH = 12

/** Half-circle notches cut into the two corners on one edge, so the perforation looks punched. */
function notchMask(edge: "top" | "bottom"): CSSProperties {
  const y = edge === "bottom" ? "100%" : "0"
  const m = `radial-gradient(circle ${NOTCH}px at 0 ${y}, transparent 97%, #000 100%), radial-gradient(circle ${NOTCH}px at 100% ${y}, transparent 97%, #000 100%)`
  return { maskImage: m, WebkitMaskImage: m, maskComposite: "intersect", WebkitMaskComposite: "source-in" }
}

const shadow: CSSProperties = { filter: "drop-shadow(0 10px 18px rgba(31, 34, 51, 0.18)) drop-shadow(0 1px 2px rgba(31, 34, 51, 0.12))" }

/**
 * A paper ticket: main part, perforated edge and a stub with a decorative QR code.
 * Set `torn` to play the tear: a tug, then the stub rips off along the perforation.
 */
export function Ticket({
  title,
  eyebrow,
  details,
  fields = [],
  code,
  stubNote = "Show this at the door",
  torn = false,
  onTorn,
  accentClassName = "bg-lavender",
  className,
}: TicketProps) {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!torn) return
      if (reduce) {
        gsap.set(".ticket-stub", { y: 12 })
        gsap.fromTo(".ticket-stub", { opacity: 0.4 }, { opacity: 1, duration: 0.2, onComplete: () => onTorn?.() })
        return
      }
      const tl = gsap.timeline({ onComplete: () => onTorn?.() })
      tl.to(".ticket-stub", { y: 2, rotation: 1.2, transformOrigin: "0% 0%", duration: 0.1, ease: "power2.out" })
        .to(".ticket-stub", { y: 1, rotation: -0.8, transformOrigin: "100% 0%", duration: 0.09, ease: "power2.inOut" })
        .addLabel("rip")
        .to(".ticket-main", { y: -5, duration: 0.14, ease: "power3.out", yoyo: true, repeat: 1 }, "rip")
        .to(".ticket-stub", { y: 22, x: -3, rotation: -4.5, transformOrigin: "100% 0%", duration: 0.75, ease: "os.spring" }, "rip")
        .fromTo(
          ".ticket-fiber",
          { opacity: 1, x: 0, y: 0, scale: 1 },
          {
            opacity: 0,
            scale: 0.4,
            x: (i: number) => (i % 2 === 0 ? -1 : 1) * (6 + ((i * 7) % 14)),
            y: (i: number) => 10 + ((i * 11) % 22),
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.02,
          },
          "rip"
        )
    },
    { scope: root, dependencies: [torn, reduce], revertOnUpdate: true }
  )

  return (
    <div ref={root} className={cn("relative w-full max-w-[300px]", className)}>
      <article aria-label={`Ticket: ${title}`}>
        {/* Main part */}
        <div className="ticket-main relative" style={shadow}>
          <div className={cn("relative overflow-hidden rounded-t-[22px] px-5 pt-5 pb-4 text-ink", accentClassName)} style={notchMask("bottom")}>
            <div
              aria-hidden="true"
              className="absolute -top-10 -right-10 size-36 rounded-full opacity-40"
              style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
            />
            {eyebrow && <p className="relative text-[0.7rem] font-bold tracking-[0.12em] uppercase opacity-70">{eyebrow}</p>}
            <p className="relative mt-1 font-display text-[1.45rem] leading-tight font-semibold">{title}</p>
            {details && <p className="relative mt-1 text-sm font-medium opacity-80">{details}</p>}
            {fields.length > 0 && (
              <dl className="relative mt-4 flex gap-5">
                {fields.map((f) => (
                  <div key={f.label}>
                    <dt className="text-[0.65rem] font-bold tracking-[0.1em] uppercase opacity-60">{f.label}</dt>
                    <dd className="font-display text-xl font-semibold tabular-nums">{f.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>

        {/* Paper fibers that fly off when it tears */}
        <div aria-hidden="true" className="pointer-events-none relative z-10 h-0">
          {Array.from({ length: 8 }, (_, i) => (
            <span
              key={i}
              className="ticket-fiber absolute top-0 size-1 rounded-full bg-text/40 opacity-0"
              style={{ left: `${10 + i * 11}%` }}
            />
          ))}
        </div>

        {/* Stub */}
        <div className="ticket-stub relative will-change-transform" style={shadow}>
          <div className="relative flex items-center gap-4 rounded-b-[22px] bg-surface px-5 pt-4 pb-4 text-text" style={notchMask("top")}>
            <span aria-hidden="true" className="absolute inset-x-4 top-0 border-t-2 border-dashed border-text/20" />
            <div className="size-[76px] shrink-0 overflow-hidden rounded-xl bg-white p-1.5">
              <QrCode seed={code} />
            </div>
            <span className="sr-only">Decorative QR code for booking {code}.</span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-bold tracking-[0.1em] text-text-soft uppercase">Booking</p>
              <p className="font-mono text-base font-semibold tracking-wide">{code}</p>
              <p className="mt-1 text-xs text-text-soft">{stubNote}</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

// ---- Decorative QR-like pattern. Deterministic per seed, so server and client render the same. ----

const QR = 21
const FINDERS: [number, number][] = [
  [0, 0],
  [QR - 7, 0],
  [0, QR - 7],
]

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function qrModules(seed: string) {
  const rand = mulberry32(hash(seed))
  const inFinder = (x: number, y: number) => FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7)
  let d = ""
  for (let y = 0; y < QR; y++) {
    for (let x = 0; x < QR; x++) {
      const r = rand()
      if (inFinder(x, y)) continue
      const timing = (x === 6 || y === 6) && (x + y) % 2 === 0
      if (timing || (x !== 6 && y !== 6 && r > 0.5)) d += `M${x} ${y}h1v1h-1z`
    }
  }
  return d
}

/** A QR-looking square. Purely decorative: it encodes nothing. */
export function QrCode({ seed, className }: { seed: string; className?: string }) {
  return (
    <svg viewBox="0 0 21 21" className={cn("block h-full w-full", className)} aria-hidden="true" shapeRendering="crispEdges">
      <path d={qrModules(seed)} fill="#1f2233" />
      {FINDERS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x + 0.5} y={y + 0.5} width="6" height="6" fill="none" stroke="#1f2233" strokeWidth="1" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#1f2233" />
        </g>
      ))}
    </svg>
  )
}
