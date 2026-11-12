"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useState } from "react"

import { useCity } from "@/lib/store"
import { playSfx } from "@/lib/sound"

type Phase = "idle" | "scanning" | "menu" | "paid"

const MENU = [
  { id: "croissant", emoji: "🥐", name: "Croissant", price: 2.5 },
  { id: "cappuccino", emoji: "☕", name: "Cappuccino", price: 4.5 },
  { id: "juice", emoji: "🍊", name: "Fresh orange juice", price: 5 },
  { id: "cake", emoji: "🍰", name: "Chocolate cake", price: 6 },
] as const

type ItemId = (typeof MENU)[number]["id"]

const tnd = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)} TND`

// ---- Decorative QR-like pattern (deterministic, so server and client render the same thing) ----

const QR_SIZE = 21
const FINDERS: [number, number][] = [
  [0, 0],
  [QR_SIZE - 7, 0],
  [0, QR_SIZE - 7],
]

function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Dark data modules as [x, y]; finder squares (and the gap around them) are drawn separately. */
const QR_MODULES: [number, number][] = (() => {
  const rand = mulberry32(2022)
  const inFinderZone = (x: number, y: number) => FINDERS.some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7)
  const cells: [number, number][] = []
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      const r = rand()
      if (inFinderZone(x, y)) continue
      const timing = (x === 6 || y === 6) && (x + y) % 2 === 0
      if (timing || ((x !== 6 && y !== 6) && r > 0.52)) cells.push([x, y])
    }
  }
  return cells
})()

function QrPattern() {
  return (
    <svg viewBox="-2 -2 25 25" className="h-full w-full" aria-hidden>
      <rect x="-2" y="-2" width="25" height="25" rx="2" fill="#fffbf5" />
      <g fill="#2b2d42">
        {QR_MODULES.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x + 0.07} y={y + 0.07} width="0.86" height="0.86" rx="0.28" />
        ))}
      </g>
      {FINDERS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x + 0.5} y={y + 0.5} width="6" height="6" rx="1.6" fill="none" stroke="#2b2d42" strokeWidth="1" />
          <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.8" fill="#ff8b94" stroke="#2b2d42" strokeWidth="0.5" />
        </g>
      ))}
    </svg>
  )
}

/** Opus Lab: scan a table QR code, pick from the menu and pay online. */
export function QrMenu() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useCity((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [phase, setPhase] = useState<Phase>("idle")
  const [picked, setPicked] = useState<ItemId[]>(["croissant", "cappuccino"])
  const total = MENU.filter((i) => picked.includes(i.id)).reduce((sum, i) => sum + i.price, 0)
  const paid = phase === "paid"

  const scan = () => {
    playSfx("click")
    setPhase("scanning")
  }

  const scanned = () => {
    if (phase !== "scanning") return
    setPhase("menu")
    playSfx("pop")
  }

  const toggle = (id: ItemId) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }

  const pay = () => {
    setPhase("paid")
    playSfx("ding")
  }

  const reset = () => {
    setPhase("idle")
    setPicked(["croissant", "cappuccino"])
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      {/* Table tent */}
      <div className="flex flex-col items-center">
        <div className="relative w-[214px] rounded-[26px] border-2 border-ink bg-[#fffbf5] px-5 pt-4 pb-5 text-ink shadow-[0_6px_0_#2b2d42]">
          <div aria-hidden className="absolute -top-[2px] left-1/2 h-3 w-24 -translate-x-1/2 rounded-b-xl border-2 border-t-0 border-ink bg-lavender" />
          <p className="text-center text-[11px] font-bold tracking-wide text-ink-soft">Table 4</p>
          <p className="mb-3 text-center font-display text-base font-semibold">Scan for the menu</p>

          <div className="relative mx-auto aspect-square w-[164px] overflow-hidden rounded-2xl border-2 border-ink">
            <QrPattern />
            <span className="sr-only">A decorative QR code. Use the button below to open the menu.</span>

            {/* Viewfinder corners */}
            <AnimatePresence>
              {phase === "scanning" && (
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute inset-1.5"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.25 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 380, damping: 22 }}
                >
                  <span className="absolute top-0 left-0 h-6 w-6 rounded-tl-xl border-t-4 border-l-4 border-mint" />
                  <span className="absolute top-0 right-0 h-6 w-6 rounded-tr-xl border-t-4 border-r-4 border-mint" />
                  <span className="absolute bottom-0 left-0 h-6 w-6 rounded-bl-xl border-b-4 border-l-4 border-mint" />
                  <span className="absolute right-0 bottom-0 h-6 w-6 rounded-br-xl border-r-4 border-b-4 border-mint" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Light sweep */}
            <AnimatePresence>
              {phase === "scanning" &&
                (reduce ? (
                  <motion.div
                    key="flash"
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-mint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.55, 0] }}
                    transition={{ duration: 0.6 }}
                    onAnimationComplete={scanned}
                  />
                ) : (
                  <motion.div
                    key="sweep"
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 h-7"
                    style={{
                      background: "linear-gradient(180deg, transparent, rgba(168,230,207,0.55) 70%, #a8e6cf)",
                      boxShadow: "0 6px 18px 2px rgba(168,230,207,0.95)",
                      borderBottom: "3px solid #6fd3ad",
                    }}
                    initial={{ top: "-20%" }}
                    animate={{ top: "100%" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    onAnimationComplete={scanned}
                  />
                ))}
            </AnimatePresence>
          </div>
        </div>
        <div aria-hidden className="h-2.5 w-[250px] rounded-full bg-ink/15" />
      </div>

      {phase === "idle" || phase === "scanning" ? (
        <button type="button" className="btn btn-sky disabled:opacity-70" onClick={scan} disabled={phase === "scanning"} aria-busy={phase === "scanning"}>
          {phase === "scanning" ? "Scanning…" : "Scan the code"}
        </button>
      ) : null}

      {/* Menu */}
      <AnimatePresence>
        {(phase === "menu" || paid) && (
          <motion.section
            key="menu"
            aria-label="Café menu"
            className="card w-full max-w-[340px] origin-top p-4"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: -40, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 20 }}
          >
            <h3 className="font-display text-lg font-semibold">Today&apos;s menu</h3>
            <p className="mb-3 text-xs text-text-soft">{paid ? "Thanks! Your order is on its way." : "Tap to add or remove items."}</p>
            <ul className="flex flex-col gap-2">
              {MENU.map((item, i) => {
                const on = picked.includes(item.id)
                return (
                  <motion.li
                    key={item.id}
                    initial={reduce ? false : { opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduce ? 0 : 0.12 + i * 0.06 }}
                  >
                    <button
                      type="button"
                      aria-pressed={on}
                      disabled={paid}
                      onClick={() => toggle(item.id)}
                      className={`flex min-h-11 w-full items-center gap-3 rounded-2xl border-2 px-3 py-2 text-left transition-colors ${
                        on ? "border-ink bg-butter text-ink" : "border-line/30 bg-surface text-text"
                      } disabled:cursor-default`}
                    >
                      <span aria-hidden className="text-xl">
                        {item.emoji}
                      </span>
                      <span className="flex-1 text-sm font-bold">{item.name}</span>
                      <span className="text-sm tabular-nums">{tnd(item.price)}</span>
                      <span
                        aria-hidden
                        className={`grid h-5 w-5 place-items-center rounded-full border-2 ${on ? "border-ink bg-mint" : "border-current opacity-40"}`}
                      >
                        {on && (
                          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="#2b2d42" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        )}
                      </span>
                    </button>
                  </motion.li>
                )
              })}
            </ul>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm">
                Total <span className="font-display text-base font-semibold tabular-nums">{tnd(total)}</span>
              </p>
              <AnimatePresence mode="wait" initial={false}>
                {paid ? (
                  <motion.p
                    key="paid"
                    role="status"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-ink bg-mint px-4 font-display font-semibold text-ink shadow-[0_4px_0_#2b2d42]"
                    initial={reduce ? { opacity: 0 } : { scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#2b2d42" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round">
                      <motion.path
                        d="M5 12.5l4.5 4.5L19 7.5"
                        initial={reduce ? false : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, delay: 0.15 }}
                      />
                    </svg>
                    Paid
                  </motion.p>
                ) : (
                  <motion.button
                    key="pay"
                    type="button"
                    className="btn btn-coral disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={pay}
                    disabled={total === 0}
                    exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0, transition: { duration: 0.12 } }}
                  >
                    Pay online
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            {total === 0 && !paid && <p className="mt-2 text-xs text-text-soft">Pick at least one item to pay.</p>}

            {paid && (
              <button type="button" className="btn btn-plain btn-sm mt-4" onClick={reset}>
                Scan again
              </button>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
