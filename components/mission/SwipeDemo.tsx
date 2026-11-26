"use client"

import { AnimatePresence, LazyMotion, m, useMotionValue, useTransform, type PanInfo } from "framer-motion"
import { Heart, RotateCcw, X } from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"

import { play } from "@/lib/sound"
import { cn } from "@/lib/utils"

// A tiny version of Fripa's swipe-to-shop. Placeholder items, drawn for this demo (no photos).
type Item = { id: string; name: string; meta: string; bg: string; art: ReactNode }

const ITEMS: Item[] = [
  {
    id: "jacket",
    name: "Denim jacket",
    meta: "Size M · demo item",
    bg: "#123a5a",
    art: (
      <g>
        <path d="M62 44 L88 32 L100 46 L112 32 L138 44 L168 120 L148 128 L134 92 L134 172 L66 172 L66 92 L52 128 L32 120 Z" fill="#5b8fc7" />
        <path d="M88 32 L100 60 L112 32 L104 30 L100 40 L96 30 Z" fill="#3f6f9f" />
        <path d="M100 60 V172" stroke="#2c5278" strokeWidth="3" />
        <rect x="74" y="96" width="18" height="14" rx="2" fill="#3f6f9f" />
        <rect x="108" y="96" width="18" height="14" rx="2" fill="#3f6f9f" />
        {[78, 104, 130, 156].map((y) => (
          <circle key={y} cx="106" cy={y} r="2.6" fill="#f2b544" />
        ))}
      </g>
    ),
  },
  {
    id: "tee",
    name: "Striped tee",
    meta: "Size S · demo item",
    bg: "#3a1f4f",
    art: (
      <g>
        <defs>
          <clipPath id="swipe-tee">
            <path d="M60 46 L84 34 Q100 48 116 34 L140 46 L166 74 L146 92 L134 84 L134 170 L66 170 L66 84 L54 92 L34 74 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#swipe-tee)">
          <rect x="30" y="30" width="140" height="145" fill="#eef2f5" />
          {[50, 72, 94, 116, 138, 160].map((y) => (
            <rect key={y} x="30" y={y} width="140" height="10" fill="#ff6b6b" />
          ))}
        </g>
      </g>
    ),
  },
  {
    id: "sweater",
    name: "Knit sweater",
    meta: "Size L · demo item",
    bg: "#123a3a",
    art: (
      <g>
        <path d="M62 44 L86 34 Q100 44 114 34 L138 44 L164 140 L146 146 L134 96 L134 166 L66 166 L66 96 L54 146 L36 140 Z" fill="#ff9a5c" />
        <path d="M66 156 H134 V168 H66 Z M36 136 L54 142 L52 150 L34 144 Z M164 136 L146 142 L148 150 L166 144 Z" fill="#c47a45" />
        <path d="M70 100 l10 10 l10 -10 l10 10 l10 -10 l10 10 l10 -10" stroke="#f2b544" strokeWidth="4" fill="none" strokeLinejoin="round" />
        <path d="M70 124 l10 10 l10 -10 l10 10 l10 -10 l10 10 l10 -10" stroke="#f2b544" strokeWidth="4" fill="none" strokeLinejoin="round" />
      </g>
    ),
  },
  {
    id: "hat",
    name: "Bucket hat",
    meta: "One size · demo item",
    bg: "#4a2a14",
    art: (
      <g>
        <ellipse cx="100" cy="132" rx="70" ry="18" fill="#f2b544" />
        <path d="M58 130 Q60 70 100 68 Q140 70 142 130 Z" fill="#f7cd7a" />
        <rect x="59" y="108" width="82" height="10" fill="#ff9a5c" />
      </g>
    ),
  },
  {
    id: "trousers",
    name: "Wide-leg trousers",
    meta: "Size 38 · demo item",
    bg: "#1c3048",
    art: (
      <g>
        <path d="M68 36 H132 L146 172 H108 L100 84 L92 172 H54 Z" fill="#93a4b8" />
        <rect x="68" y="36" width="64" height="12" fill="#6f7891" />
        <path d="M100 48 V80" stroke="#6f7891" strokeWidth="3" />
      </g>
    ),
  },
]

type Dir = -1 | 1
const THRESHOLD = 110

function Card({ item, depth, onDecide }: { item: Item; depth: number; onDecide: (d: Dir) => void }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-16, 16])
  const keep = useTransform(x, [24, THRESHOLD], [0, 1])
  const pass = useTransform(x, [-THRESHOLD, -24], [1, 0])
  const top = depth === 0

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > THRESHOLD || info.velocity.x > 650) onDecide(1)
    else if (info.offset.x < -THRESHOLD || info.velocity.x < -650) onDecide(-1)
  }

  return (
    <m.div
      aria-hidden={!top}
      className={cn("absolute inset-0 flex flex-col overflow-hidden rounded-2xl border border-ink/15 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.8)]", top && "cursor-grab touch-pan-y active:cursor-grabbing")}
      style={{ x, rotate, zIndex: 10 - depth, backgroundColor: item.bg }}
      initial={{ scale: 0.86, y: 36, opacity: 0 }}
      animate={{ scale: 1 - depth * 0.05, y: depth * 14, opacity: depth > 2 ? 0 : 1 }}
      exit="gone"
      variants={{ gone: (d: Dir) => ({ x: d * 460, opacity: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } }) }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      drag={top ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={top ? onDragEnd : undefined}
      whileDrag={{ scale: 1.03 }}
    >
      <svg viewBox="0 0 200 200" aria-hidden="true" className="pointer-events-none mx-auto mt-2 w-[78%] flex-1">
        {item.art}
      </svg>
      <div className="bg-bg/80 px-4 py-3">
        <p className="font-semibold text-ink">{item.name}</p>
        <p className="font-mono text-xs text-muted">{item.meta}</p>
      </div>
      <m.span style={{ opacity: keep }} className="pointer-events-none absolute top-4 left-4 -rotate-12 rounded-md border-2 border-pink px-2 font-display text-2xl text-pink">
        Keep
      </m.span>
      <m.span style={{ opacity: pass }} className="pointer-events-none absolute top-4 right-4 rotate-12 rounded-md border-2 border-red px-2 font-display text-2xl text-red">
        Pass
      </m.span>
    </m.div>
  )
}

/**
 * Fripa's swipe-to-shop, in miniature: drag the top card right to keep it, left to pass (with
 * tilt), or use the buttons or ←/→ when the demo has focus. Results are announced politely.
 */
// Drag needs Framer's full feature set (domMax); only this demo loads it, on the visitor's first
// scroll, touch or key press (the demo sits below the fold, so it's ready before it's reached).
const loadDrag = () =>
  new Promise<void>((resolve) => {
    const events = ["scroll", "wheel", "pointerdown", "touchstart", "keydown"] as const
    const go = () => {
      for (const e of events) window.removeEventListener(e, go)
      resolve()
    }
    for (const e of events) window.addEventListener(e, go, { passive: true, once: true })
  })
    .then(() => import("@/lib/motionDrag"))
    .then((mod) => mod.domMax)

export function SwipeDemo() {
  return (
    <LazyMotion features={loadDrag} strict>
      <SwipeDemoInner />
    </LazyMotion>
  )
}

function SwipeDemoInner() {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState<Dir>(1)
  const [kept, setKept] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const root = useRef<HTMLDivElement>(null)
  const resetBtn = useRef<HTMLButtonElement>(null)
  const refocus = useRef(false)
  const empty = index >= ITEMS.length

  const decide = (d: Dir) => {
    const item = ITEMS[index]
    if (!item) return
    const nextKept = d === 1 ? [...kept, item.name] : kept
    play(d === 1 ? "pop" : "tap")
    setDir(d)
    setKept(nextKept)
    setIndex(index + 1)
    const left = ITEMS.length - index - 1
    // The buttons disable when the stack runs out: hand focus to Reset if the reader was in here.
    refocus.current = left === 0 && !!root.current?.contains(document.activeElement)
    setMessage(
      `${d === 1 ? "Kept" : "Passed"}: ${item.name}.` +
        (left > 0 ? ` ${left} left.` : ` Stack empty: you kept ${nextKept.length} of ${ITEMS.length}.`)
    )
  }

  const reset = () => {
    setIndex(0)
    setKept([])
    setMessage(`Stack reset: ${ITEMS.length} items.`)
    play("click")
  }

  useEffect(() => {
    if (!empty || !refocus.current) return
    refocus.current = false
    resetBtn.current?.focus()
  }, [empty])

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    if (e.key === "ArrowRight") decide(1)
    else if (e.key === "ArrowLeft") decide(-1)
    else return
    e.preventDefault()
  }

  const visible = ITEMS.slice(index, index + 3)

  return (
    <div className="max-w-md">
      <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-dashed border-pink/50 px-2 py-1 font-mono text-xs text-pink lowercase">Demo · placeholder items</p>
      <div
        ref={root}
        role="group"
        aria-label="Swipe demo. Right arrow keeps the top item, left arrow passes it."
        aria-keyshortcuts="ArrowLeft ArrowRight"
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="rounded-2xl p-1"
      >
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[18rem]">
          <AnimatePresence custom={dir} initial={false}>
            {visible
              .map((item, i) => <Card key={item.id} item={item} depth={i} onDecide={decide} />)
              .reverse()}
          </AnimatePresence>
          {empty && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-ink/20 p-6 text-center">
              <p className="text-ink">
                That&apos;s the stack. You kept {kept.length} of {ITEMS.length}.
              </p>
              <button
                ref={resetBtn}
                type="button"
                onClick={reset}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-ink/25 px-4 font-semibold text-ink transition-colors hover:border-orange hover:text-pink"
              >
                <RotateCcw aria-hidden="true" className="size-4" />
                Reset the stack
              </button>
            </div>
          )}
        </div>

        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => decide(-1)}
            disabled={empty}
            aria-keyshortcuts="ArrowLeft"
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-red/70 px-5 font-semibold text-ink transition-colors hover:bg-red/10 disabled:opacity-40"
          >
            <X aria-hidden="true" className="size-5 text-red" />
            Pass
          </button>
          <button
            type="button"
            onClick={() => decide(1)}
            disabled={empty}
            aria-keyshortcuts="ArrowRight"
            className="inline-flex h-12 items-center gap-2 rounded-full border-2 border-pink/70 px-5 font-semibold text-ink transition-colors hover:bg-pink/10 disabled:opacity-40"
          >
            <Heart aria-hidden="true" className="size-5 text-pink" />
            Keep
          </button>
        </div>
      </div>
      <p aria-live="polite" className="mt-3 min-h-[1.65em] text-center font-mono text-sm text-muted">
        {message}
      </p>
    </div>
  )
}
