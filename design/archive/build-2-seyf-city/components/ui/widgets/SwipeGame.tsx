"use client"

import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion"
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react"

import { useCity } from "@/lib/store"
import { playSfx } from "@/lib/sound"

type Item = { id: string; emoji: string; name: string; size: string; price: number; bg: string }

const ITEMS: Item[] = [
  { id: "denim", emoji: "🧥", name: "Vintage denim jacket", size: "M", price: 45, bg: "bg-sky" },
  { id: "dress", emoji: "👗", name: "Floral summer dress", size: "S", price: 30, bg: "bg-coral" },
  { id: "sneakers", emoji: "👟", name: "Retro running sneakers", size: "42", price: 60, bg: "bg-mint" },
  { id: "scarf", emoji: "🧣", name: "Chunky wool scarf", size: "One size", price: 15, bg: "bg-butter" },
  { id: "tee", emoji: "👕", name: "Faded band t-shirt", size: "L", price: 18, bg: "bg-lavender" },
  { id: "cap", emoji: "🧢", name: "Corduroy cap", size: "One size", price: 12, bg: "bg-cream-deep" },
]

const SWIPE_THRESHOLD = 110
const VISIBLE = 3

/** Fripa: a swipe-to-shop card stack. Right keeps, left passes. */
export function SwipeGame() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useCity((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [deck, setDeck] = useState<Item[]>(ITEMS)
  const [index, setIndex] = useState(0)
  const [kept, setKept] = useState<Item[]>([])
  const [leaving, setLeaving] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const busy = useRef(false)

  // Motion values for the top card only.
  const x = useMotionValue(0)
  const opacity = useMotionValue(1)
  const rotate = useTransform(x, [-240, 240], [-18, 18])
  const keepOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1])
  const passOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0])

  const current = deck[index]
  const done = index >= deck.length

  const decide = (dir: 1 | -1, velocity = 0) => {
    if (busy.current || !current) return
    busy.current = true
    setLeaving(true)
    playSfx("pop")

    const finish = () => {
      if (dir > 0) setKept((k) => [...k, current])
      setAnnouncement(dir > 0 ? `Kept the ${current.name.toLowerCase()}.` : `Passed on the ${current.name.toLowerCase()}.`)
      x.jump(0)
      opacity.jump(1)
      setLeaving(false)
      setIndex((i) => i + 1)
      busy.current = false
    }

    if (reduce) {
      animate(opacity, 0, { duration: 0.18, onComplete: finish })
    } else {
      const speed = Math.max(Math.abs(velocity), 900)
      const distance = 520
      animate(x, dir * distance, { duration: Math.min(0.45, distance / speed + 0.12), ease: [0.2, 0.7, 0.4, 1], onComplete: finish })
    }
  }

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const push = info.offset.x + info.velocity.x * 0.18
    if (push > SWIPE_THRESHOLD) decide(1, info.velocity.x)
    else if (push < -SWIPE_THRESHOLD) decide(-1, info.velocity.x)
    else animate(x, 0, { type: "spring", stiffness: 520, damping: 28 })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault()
      decide(1)
    } else if (e.key === "ArrowLeft") {
      e.preventDefault()
      decide(-1)
    }
  }

  const shuffle = () => {
    const next = [...ITEMS]
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
    x.jump(0)
    opacity.jump(1)
    setDeck(next)
    setKept([])
    setIndex(0)
    setAnnouncement("Shuffled. Six new pieces to look at.")
    playSfx("click")
  }

  const total = kept.reduce((sum, i) => sum + i.price, 0)

  return (
    <div className="flex w-full flex-col items-center gap-4 overflow-x-clip">
      <div className="flex w-full max-w-[300px] items-center justify-between text-sm">
        <span className="text-text-soft tabular-nums">{done ? "All done" : `${index + 1} of ${deck.length}`}</span>
        <span className="chip bg-butter text-ink">
          <span aria-hidden>🛍️</span>
          <motion.span
            key={kept.length}
            className="inline-block tabular-nums"
            initial={reduce || kept.length === 0 ? false : { scale: 1.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 600, damping: 14 }}
          >
            {kept.length}
          </motion.span>
          in your bag
        </span>
      </div>

      {!done ? (
        <>
          <div
            tabIndex={0}
            role="group"
            aria-roledescription="card stack"
            aria-label={`${current.name}, size ${current.size}, ${current.price} TND. Press the right arrow to keep it or the left arrow to pass.`}
            onKeyDown={onKeyDown}
            className="relative h-[330px] w-full max-w-[280px] rounded-[28px]"
          >
            {deck
              .slice(index, index + VISIBLE)
              .map((item, i) => {
                const depth = Math.max(0, i - (leaving ? 1 : 0))
                const isTop = i === 0
                return (
                  <motion.div
                    key={item.id}
                    className="absolute inset-0"
                    style={{ zIndex: VISIBLE - i }}
                    initial={false}
                    animate={{ scale: 1 - depth * 0.06, y: depth * 16 }}
                    transition={{ type: "spring", stiffness: 380, damping: 24 }}
                  >
                    {isTop ? (
                      <motion.div
                        className="h-full w-full cursor-grab touch-pan-y active:cursor-grabbing"
                        style={{ x, rotate: reduce ? 0 : rotate, opacity }}
                        drag="x"
                        dragMomentum={false}
                        onDragEnd={onDragEnd}
                        whileTap={reduce ? undefined : { scale: 1.02 }}
                      >
                        <Card item={item}>
                          <motion.span
                            aria-hidden
                            className="absolute top-5 left-4 -rotate-12 rounded-xl border-[3px] border-ink bg-mint px-3 py-0.5 font-display text-2xl font-bold text-ink"
                            style={{ opacity: keepOpacity }}
                          >
                            Keep
                          </motion.span>
                          <motion.span
                            aria-hidden
                            className="absolute top-5 right-4 rotate-12 rounded-xl border-[3px] border-ink bg-coral px-3 py-0.5 font-display text-2xl font-bold text-ink"
                            style={{ opacity: passOpacity }}
                          >
                            Pass
                          </motion.span>
                        </Card>
                      </motion.div>
                    ) : (
                      <Card item={item} />
                    )}
                  </motion.div>
                )
              })
              .reverse()}
          </div>

          <div className="flex gap-3">
            <button type="button" className="btn btn-coral" onClick={() => decide(-1)} aria-label={`Pass on the ${current.name.toLowerCase()}`}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
              Pass
            </button>
            <button type="button" className="btn btn-mint" onClick={() => decide(1)} aria-label={`Keep the ${current.name.toLowerCase()}`}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.1 5.2 3 1.6-1.9 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
              </svg>
              Keep
            </button>
          </div>
          <p className="text-xs text-text-soft">Swipe the card, or focus it and use the arrow keys.</p>
        </>
      ) : (
        <motion.div
          className="card w-full max-w-[300px] p-5 text-center"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.85, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 360, damping: 20 }}
        >
          <h3 className="font-display text-xl font-semibold">
            {kept.length === 0 ? "Nothing caught your eye" : kept.length === 1 ? "One piece in your bag" : `${kept.length} pieces in your bag`}
          </h3>
          {kept.length > 0 ? (
            <>
              <ul className="mt-3 flex flex-col gap-1.5 text-left text-sm">
                {kept.map((item, i) => (
                  <motion.li
                    key={item.id}
                    className="flex items-center gap-2"
                    initial={reduce ? false : { opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: reduce ? 0 : 0.15 + i * 0.07 }}
                  >
                    <span aria-hidden className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 border-ink ${item.bg}`}>
                      {item.emoji}
                    </span>
                    <span className="flex-1">{item.name}</span>
                    <span className="tabular-nums">{item.price} TND</span>
                  </motion.li>
                ))}
              </ul>
              <p className="mt-3 border-t-2 border-dashed border-line/30 pt-3 text-sm">
                Total <span className="font-display text-base font-semibold tabular-nums">{total} TND</span>
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-text-soft">Fair enough. New pieces come in every week.</p>
          )}
          <button type="button" className="btn btn-coral mt-4" onClick={shuffle}>
            Shuffle again
          </button>
        </motion.div>
      )}

      <p className="sr-only" aria-live="polite">
        {announcement} {kept.length} in your bag.
      </p>
    </div>
  )
}

function Card({ item, children }: { item: Item; children?: ReactNode }) {
  return (
    <article
      className={`relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border-2 border-ink text-ink shadow-[0_6px_0_#2b2d42] select-none ${item.bg}`}
    >
      <div
        aria-hidden
        className="relative grid flex-1 place-items-center"
        style={{ backgroundImage: "radial-gradient(rgba(43,45,66,0.12) 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }}
      >
        <span className="text-[5.5rem] leading-none drop-shadow-[0_6px_0_rgba(43,45,66,0.18)]">{item.emoji}</span>
      </div>
      <div className="border-t-2 border-ink bg-[#fffbf5] px-4 py-3">
        <p className="font-display text-lg leading-tight font-semibold">{item.name}</p>
        <div className="mt-1.5 flex items-center justify-between text-sm">
          <span className="rounded-full border-2 border-ink/20 px-2 text-xs font-bold">Size {item.size}</span>
          <span className="font-display font-semibold tabular-nums">{item.price} TND</span>
        </div>
      </div>
      {children}
    </article>
  )
}
