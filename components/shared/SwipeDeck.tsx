"use client"

import { Heart, X } from "lucide-react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from "framer-motion"
import { useImperativeHandle, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from "react"

import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

export type SwipeDecision = "keep" | "pass"

type SwipeDeckProps<T extends { id: string }> = {
  items: T[]
  renderCard: (item: T) => ReactNode
  onDecision: (item: T, decision: SwipeDecision) => void
  /** Called once the last card has been swiped. */
  onEmpty?: () => void
  /** Short spoken name of a card, e.g. "Vintage denim jacket, size M, 45 TND". */
  getLabel?: (item: T) => string
  /** Size of the card stack. Defaults to 360px tall, up to 300px wide. */
  className?: string
}

const THRESHOLD = 110
const VISIBLE = 3
const FLY = 560

type TopCardHandle = { fling: (dir: 1 | -1, velocity?: number) => void }

/**
 * A Tinder-style card stack: drag the top card (tilt follows the finger), let go past the threshold
 * or flick it to decide, otherwise it springs back. Buttons and arrow keys do the same.
 * Pass a new `items` array to start over.
 */
export function SwipeDeck<T extends { id: string }>({ items, renderCard, onDecision, onEmpty, getLabel, className }: SwipeDeckProps<T>) {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const [announcement, setAnnouncement] = useState("")
  const topRef = useRef<TopCardHandle>(null)

  // A new deck (e.g. "Shuffle again") starts from the first card.
  const [prevItems, setPrevItems] = useState(items)
  if (prevItems !== items) {
    setPrevItems(items)
    setIndex(0)
    setLeaving(false)
  }

  const current = items[index]
  const label = (item: T) => (getLabel ? getLabel(item) : item.id)

  const decide = (dir: 1 | -1) => topRef.current?.fling(dir)

  const onGone = (item: T, dir: 1 | -1) => {
    const decision: SwipeDecision = dir > 0 ? "keep" : "pass"
    onDecision(item, decision)
    setAnnouncement(`${decision === "keep" ? "Kept" : "Passed on"} ${label(item)}.`)
    setLeaving(false)
    const next = index + 1
    setIndex(next)
    if (next >= items.length) onEmpty?.()
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

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {current ? (
        <>
          <div
            tabIndex={0}
            role="group"
            aria-roledescription="card stack"
            aria-label={`${label(current)}. ${items.length - index} left. Right arrow keeps it, left arrow passes.`}
            onKeyDown={onKeyDown}
            className={cn("relative h-[360px] w-full max-w-[300px] rounded-[28px]", className)}
          >
            {items
              .slice(index, index + VISIBLE)
              .map((item, i) => {
                const depth = Math.max(0, i - (leaving ? 1 : 0))
                return (
                  <motion.div
                    key={item.id}
                    className="absolute inset-0"
                    style={{ zIndex: VISIBLE - i }}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.84, y: 44 }}
                    animate={{ opacity: 1, scale: reduce ? 1 : 1 - depth * 0.05, y: reduce ? 0 : depth * 14 }}
                    transition={{ type: "spring", stiffness: 380, damping: 26 }}
                    aria-hidden={i > 0 || undefined}
                  >
                    {i === 0 ? (
                      <TopCard
                        ref={topRef}
                        reduce={reduce}
                        onStart={() => {
                          setLeaving(true)
                          playSfx("pop")
                        }}
                        onGone={(dir) => onGone(item, dir)}
                      >
                        {renderCard(item)}
                      </TopCard>
                    ) : (
                      <div className="h-full w-full">{renderCard(item)}</div>
                    )}
                  </motion.div>
                )
              })
              .reverse()}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="btn min-w-[120px] bg-coral text-ink"
              onClick={() => decide(-1)}
              aria-label={`Pass on ${label(current)}`}
            >
              <X size={18} strokeWidth={3} aria-hidden="true" />
              Pass
            </button>
            <button
              type="button"
              className="btn min-w-[120px] bg-mint text-ink"
              onClick={() => decide(1)}
              aria-label={`Keep ${label(current)}`}
            >
              <Heart size={18} strokeWidth={2.6} fill="currentColor" aria-hidden="true" />
              Keep
            </button>
          </div>
          <p className="text-center text-xs text-text-soft">Swipe right to keep, left to pass. Or focus the card and use the arrow keys.</p>
        </>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  )
}

/** The draggable top card. Owns its own motion values, so the next card starts fresh at x = 0. */
function TopCard({
  ref,
  reduce,
  onStart,
  onGone,
  children,
}: {
  ref: Ref<TopCardHandle>
  reduce: boolean
  onStart: () => void
  onGone: (dir: 1 | -1) => void
  children: ReactNode
}) {
  const x = useMotionValue(0)
  const opacity = useMotionValue(1)
  const rotate = useTransform(x, [-260, 260], [-16, 16])
  const keepOpacity = useTransform(x, [24, THRESHOLD], [0, 1])
  const passOpacity = useTransform(x, [-THRESHOLD, -24], [1, 0])
  const keepScale = useTransform(x, [24, THRESHOLD], [1.25, 1])
  const passScale = useTransform(x, [-THRESHOLD, -24], [1, 1.25])
  const flinging = useRef(false)

  const fling = (dir: 1 | -1, velocity = 0) => {
    if (flinging.current) return
    flinging.current = true
    onStart()
    if (reduce) {
      animate(opacity, 0, { duration: 0.18, ease: "easeOut", onComplete: () => onGone(dir) })
      return
    }
    // Faster flicks leave faster; the curve keeps the release velocity and decelerates.
    const speed = Math.max(Math.abs(velocity), 1100)
    const remaining = Math.abs(dir * FLY - x.get())
    animate(x, dir * FLY, {
      duration: Math.min(0.42, Math.max(0.2, remaining / speed)),
      ease: [0.25, 0.8, 0.4, 1],
      onComplete: () => onGone(dir),
    })
  }

  useImperativeHandle(ref, () => ({ fling }))

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const push = info.offset.x + info.velocity.x * 0.2
    if (push > THRESHOLD) fling(1, info.velocity.x)
    else if (push < -THRESHOLD) fling(-1, info.velocity.x)
    else animate(x, 0, { type: "spring", stiffness: 520, damping: 24 })
  }

  return (
    <motion.div
      className="relative h-full w-full cursor-grab touch-pan-y will-change-transform active:cursor-grabbing"
      style={{ x, rotate: reduce ? 0 : rotate, opacity }}
      drag="x"
      dragMomentum={false}
      onDragEnd={onDragEnd}
      whileTap={reduce ? undefined : { scale: 1.02 }}
    >
      {children}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute top-6 left-5 -rotate-12 rounded-xl border-[3px] border-ink bg-mint px-3 py-0.5 font-display text-2xl font-bold text-ink"
        style={{ opacity: keepOpacity, scale: keepScale }}
      >
        Keep
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute top-6 right-5 rotate-12 rounded-xl border-[3px] border-ink bg-coral px-3 py-0.5 font-display text-2xl font-bold text-ink"
        style={{ opacity: passOpacity, scale: passScale }}
      >
        Pass
      </motion.span>
    </motion.div>
  )
}
