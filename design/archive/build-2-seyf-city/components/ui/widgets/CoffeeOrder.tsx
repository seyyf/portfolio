"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useState } from "react"

import { useCity } from "@/lib/store"
import { playSfx } from "@/lib/sound"

type DrinkId = "espresso" | "cappuccino" | "mint"
type Phase = "menu" | "walking" | "served"

const MENU: { id: DrinkId; name: string; note: string }[] = [
  { id: "espresso", name: "Espresso", note: "Short and strong" },
  { id: "cappuccino", name: "Cappuccino", note: "Milky, extra foam" },
  { id: "mint", name: "Mint tea", note: "Fresh mint, sweet" },
]

const WALK_SECONDS = 2.6

/** Global ENR: order from a tiny PWA and watch the waiter bring it over. */
export function CoffeeOrder() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useCity((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [phase, setPhase] = useState<Phase>("menu")
  const [drink, setDrink] = useState<DrinkId>("cappuccino")
  const drinkName = MENU.find((d) => d.id === drink)?.name ?? "Your drink"

  const order = (id: DrinkId) => {
    setDrink(id)
    playSfx("click")
    if (reduce) {
      setPhase("served")
      playSfx("ding")
    } else {
      setPhase("walking")
    }
  }

  // Fires when the walk finishes (also after the exit fade, where it does nothing).
  const arrive = () => {
    if (phase !== "walking") return
    setPhase("served")
    playSfx("ding")
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Phone */}
      <div className="relative w-[214px] rounded-[36px] border-2 border-ink bg-ink p-2 shadow-[0_6px_0_rgba(43,45,66,0.9)]">
        <div className="relative h-[292px] overflow-hidden rounded-[28px] bg-cream text-ink">
          <div aria-hidden className="absolute top-2 left-1/2 h-4 w-20 -translate-x-1/2 rounded-full bg-ink" />
          <div aria-hidden className="flex justify-between px-5 pt-2 text-[10px] font-bold">
            <span>9:41</span>
            <span className="mt-0.5 h-2 w-4 rounded-[3px] border border-ink p-px">
              <span className="block h-full w-2/3 rounded-[1px] bg-ink" />
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {phase === "menu" ? (
              <motion.div
                key="menu"
                className="px-3 pt-4"
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
                transition={{ duration: 0.22 }}
              >
                <p className="font-display text-base leading-tight font-semibold">Drinks</p>
                <p className="mb-3 text-[11px] text-ink-soft">Order from your seat.</p>
                <ul className="flex flex-col gap-2">
                  {MENU.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 rounded-2xl border-2 border-ink bg-[#fffbf5] p-1.5 pr-2">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream-deep">
                        <Cup drink={item.id} className="h-7 w-7" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-[13px] leading-tight font-semibold">{item.name}</span>
                        <span className="block truncate text-[10px] text-ink-soft">{item.note}</span>
                      </span>
                      <motion.button
                        type="button"
                        onClick={() => order(item.id)}
                        aria-label={`Order a ${item.name.toLowerCase()}`}
                        className="min-h-8 rounded-full border-2 border-ink bg-coral px-2.5 font-display text-xs font-semibold text-ink shadow-[0_2px_0_#2b2d42]"
                        whileTap={reduce ? undefined : { scale: 0.9, y: 2 }}
                      >
                        Order
                      </motion.button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="sent"
                className="flex h-[250px] flex-col items-center justify-center px-5 text-center"
                initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              >
                <motion.span
                  className="grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-mint shadow-[0_3px_0_#2b2d42]"
                  initial={reduce ? false : { scale: 0, rotate: -40 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.1 }}
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="#2b2d42" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                    <motion.path
                      d="M5 12.5l4.5 4.5L19 7.5"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    />
                  </svg>
                </motion.span>
                <p className="mt-4 font-display text-lg font-semibold">Order sent</p>
                <p className="mt-1 text-xs text-ink-soft" aria-live="polite">
                  {phase === "served" ? `${drinkName} served. Enjoy!` : `${drinkName} is on its way.`}
                </p>
                {phase === "walking" && !reduce && (
                  <span aria-hidden className="mt-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full bg-ink"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* The restaurant floor */}
      <div
        className="relative h-[124px] w-full max-w-[360px] overflow-hidden rounded-2xl border-2 border-line bg-surface-2"
        aria-hidden
      >
        <div className="absolute inset-x-0 bottom-0 h-5 border-t-2 border-ink/80 bg-cream-deep" />
        {/* Kitchen door */}
        <div className="absolute bottom-5 left-3 h-[80px] w-12 rounded-t-xl border-2 border-b-0 border-ink bg-coral">
          <div className="mx-auto mt-2.5 h-5 w-5 rounded-full border-2 border-ink bg-sky" />
          <div className="absolute top-11 right-1.5 h-1.5 w-1.5 rounded-full bg-ink" />
        </div>
        {/* Table */}
        <svg viewBox="0 0 84 44" className="absolute right-4 bottom-5 h-11 w-[84px]">
          <rect x="2" y="2" width="80" height="8" rx="4" fill="#ffd97d" stroke="#2b2d42" strokeWidth="2.5" />
          <path d="M14 10v34M70 10v34" stroke="#2b2d42" strokeWidth="4" strokeLinecap="round" />
        </svg>

        {/* The cup, once it lands on the table */}
        <AnimatePresence>
          {phase === "served" && (
            <motion.div
              key="cup"
              className="absolute right-[48px] bottom-[64px] h-6 w-6"
              initial={reduce ? { opacity: 0 } : { y: -18, x: -10, opacity: 1 }}
              animate={{ y: 0, x: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 520, damping: 16 }}
            >
              <Cup drink={drink} className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* "Served!" bubble */}
        <AnimatePresence>
          {phase === "served" && (
            <motion.div
              key="bubble"
              className="absolute top-2 right-6 origin-bottom-left rounded-full border-2 border-ink bg-butter px-2.5 py-0.5 font-display text-xs font-semibold text-ink shadow-[0_2px_0_#2b2d42]"
              initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -12, opacity: 1 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 500, damping: 13, delay: 0.15 }}
            >
              Served!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Waiter walks from the door to the table */}
        <div className="absolute right-[126px] bottom-5 left-10 h-[84px]">
          <AnimatePresence>
            {phase !== "menu" && (
              <motion.div
                key="waiter"
                className="absolute bottom-0 h-[78px] w-[60px]"
                style={{ x: "-50%" }}
                initial={reduce ? { left: "100%", opacity: 0 } : { left: "0%", opacity: 0 }}
                animate={{ left: "100%", opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={
                  reduce
                    ? { duration: 0.2 }
                    : { left: { duration: WALK_SECONDS, ease: [0.45, 0, 0.4, 1] }, opacity: { duration: 0.25 } }
                }
                onAnimationComplete={arrive}
              >
                <Waiter walking={phase === "walking" && !reduce} carrying={phase === "walking"} drink={drink} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {phase === "served" && (
          <motion.button
            type="button"
            className="btn btn-mint btn-sm"
            onClick={() => setPhase("menu")}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            Order another
          </motion.button>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-text-soft">The real one served about 120 people.</p>
    </div>
  )
}

function Waiter({ walking, carrying, drink }: { walking: boolean; carrying: boolean; drink: DrinkId }) {
  const step = walking
    ? { rotate: [16, -16, 16], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const } }
    : { rotate: 0 }
  const stepBack = walking
    ? { rotate: [-16, 16, -16], transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const } }
    : { rotate: 0 }

  return (
    <motion.div
      className="h-full w-full"
      animate={walking ? { y: [0, -3, 0] } : { y: 0, rotate: carrying ? 0 : [0, 8, 0] }}
      transition={walking ? { duration: 0.25, repeat: Infinity, ease: "easeOut" } : { duration: 0.6, delay: 0.2 }}
    >
      <svg viewBox="0 0 60 78" className="h-full w-full overflow-visible">
        {/* legs */}
        <motion.g style={{ originX: 0.5, originY: 0 }} animate={stepBack}>
          <rect x="21" y="52" width="7" height="24" rx="3.5" fill="#2b2d42" />
        </motion.g>
        <motion.g style={{ originX: 0.5, originY: 0 }} animate={step}>
          <rect x="30" y="52" width="7" height="24" rx="3.5" fill="#55576e" />
        </motion.g>
        {/* body */}
        <rect x="16" y="28" width="26" height="30" rx="10" fill="#2b2d42" />
        <path d="M22 36h14v20a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4z" fill="#fffbf5" />
        <path d="M26 30l3 3 3-3-3 3z" fill="#ff8b94" stroke="#ff8b94" strokeWidth="3" strokeLinejoin="round" />
        {/* arm holding the tray */}
        <path d="M38 34l10-6" stroke="#2b2d42" strokeWidth="6" strokeLinecap="round" />
        <circle cx="49" cy="27" r="3" fill="#f5c9a5" />
        <rect x="40" y="22" width="20" height="3.5" rx="1.75" fill="#a0d2eb" stroke="#2b2d42" strokeWidth="1.5" />
        {carrying && (
          <g transform="translate(43 8)">
            <Cup drink={drink} size={14} />
          </g>
        )}
        {/* head */}
        <circle cx="29" cy="15" r="11" fill="#f5c9a5" stroke="#2b2d42" strokeWidth="2" />
        <path d="M18 14a11 11 0 0 1 22 0c-4-3-9-4-13-2-3 1-6 1-9 2z" fill="#2b2d42" />
        <circle cx="33" cy="16" r="1.4" fill="#2b2d42" />
        <path d="M31 21q3 2 5 0" stroke="#2b2d42" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}

/** A small cup drawn per drink. Use `size` inside another SVG, or `className` as a standalone icon. */
function Cup({ drink, className, size }: { drink: DrinkId; className?: string; size?: number }) {
  const shapes =
    drink === "mint" ? (
      <>
        <path d="M6 7h12l-1.5 13a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8z" fill="#c8f0dd" stroke="#2b2d42" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M7 11h10l-1 8.5H8z" fill="#7fcf9f" opacity="0.8" />
        <path d="M13 3c3 0 5 2 5 4-3 0-5-1.5-5-4z" fill="#5bbf85" stroke="#2b2d42" strokeWidth="1.2" />
      </>
    ) : (
      <>
        <path d="M18 11h1.5a2.5 2.5 0 0 1 0 5H18" fill="none" stroke="#2b2d42" strokeWidth="1.6" />
        <path
          d={drink === "espresso" ? "M6 11h12v4a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" : "M5 8h14v7a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6z"}
          fill="#fffbf5"
          stroke="#2b2d42"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {drink === "cappuccino" ? (
          <ellipse cx="12" cy="8" rx="7" ry="2.4" fill="#f7e4cd" stroke="#2b2d42" strokeWidth="1.4" />
        ) : (
          <ellipse cx="12" cy="11" rx="6" ry="1.6" fill="#6b4226" />
        )}
        <path d="M4 22h16" stroke="#2b2d42" strokeWidth="1.6" strokeLinecap="round" />
      </>
    )

  if (size) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" overflow="visible">
        {shapes}
      </svg>
    )
  }
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={className} overflow="visible">
      {shapes}
    </svg>
  )
}
