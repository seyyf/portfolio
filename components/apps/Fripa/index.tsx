"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Shuffle, ShoppingBag } from "lucide-react"
import { useState } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { SwipeDeck, type SwipeDecision } from "@/components/shared/SwipeDeck"
import { projectById } from "@/data/projects"
import { springs } from "@/lib/animations"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

const project = projectById.fripa

type Piece = { id: string; emoji: string; name: string; size: string; price: number; bg: string; note: string }

// Demo pieces for the swipe game.
const PIECES: Piece[] = [
  { id: "jacket", emoji: "🧥", name: "Vintage jacket", size: "M", price: 45, bg: "bg-sky", note: "A classic, gently worn" },
  { id: "dress", emoji: "👗", name: "Floral summer dress", size: "S", price: 30, bg: "bg-coral", note: "Light cotton" },
  { id: "sneakers", emoji: "👟", name: "Retro running sneakers", size: "42", price: 60, bg: "bg-mint", note: "Barely worn" },
  { id: "scarf", emoji: "🧣", name: "Chunky wool scarf", size: "One size", price: 15, bg: "bg-butter", note: "Hand knitted" },
  { id: "tee", emoji: "👕", name: "Faded band t-shirt", size: "L", price: 18, bg: "bg-lavender", note: "Soft and loose" },
  { id: "cap", emoji: "🧢", name: "Corduroy cap", size: "One size", price: 12, bg: "bg-glow", note: "Adjustable strap" },
]

const pieceLabel = (p: Piece) => `${p.name}, size ${p.size}, ${p.price} TND`
const bagCount = (n: number) => `${n} ${n === 1 ? "item" : "items"} in your bag`

export default function FripaApp() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [deck, setDeck] = useState(PIECES)
  const [kept, setKept] = useState<Piece[]>([])
  const [finished, setFinished] = useState(false)

  const onDecision = (piece: Piece, decision: SwipeDecision) => {
    if (decision === "keep") setKept((k) => [...k, piece])
  }

  const shuffle = () => {
    const next = [...PIECES]
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[next[i], next[j]] = [next[j], next[i]]
    }
    setDeck(next)
    setKept([])
    setFinished(false)
    playSfx("tap")
  }

  const total = kept.reduce((sum, p) => sum + p.price, 0)

  return (
    <AppScreen title={project.name} subtitle="Personal project" project="fripa">
      <p className="px-5 text-[0.95rem] leading-relaxed text-text-soft">{project.tagline} Give it a try.</p>

      <section aria-labelledby="fripa-play" className="mt-6 px-5">
        <div className="flex items-center justify-between gap-3">
          <h2 id="fripa-play" className="font-display text-xl font-semibold">
            {finished ? "Your bag" : "New in today"}
          </h2>
          <span className="chip bg-butter text-ink">
            <ShoppingBag size={15} strokeWidth={2.4} aria-hidden="true" />
            <motion.span
              key={kept.length}
              className="inline-block tabular-nums"
              initial={reduce || kept.length === 0 ? false : { scale: 1.9, y: -4 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 13 }}
            >
              {kept.length}
            </motion.span>
            <span>{kept.length === 1 ? "item" : "items"} in your bag</span>
          </span>
        </div>

        <div className="-mx-5 mt-5 overflow-x-clip px-5 pb-2">
          <AnimatePresence mode="wait" initial={false}>
            {!finished ? (
              <motion.div
                key="deck"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                transition={reduce ? { duration: 0.15 } : springs.smooth}
              >
                <SwipeDeck
                  items={deck}
                  renderCard={(p) => <PieceCard piece={p} />}
                  onDecision={onDecision}
                  onEmpty={() => setFinished(true)}
                  getLabel={pieceLabel}
                />
              </motion.div>
            ) : (
              <motion.div
                key="bag"
                className="card mx-auto w-full max-w-[320px] p-5"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={reduce ? { duration: 0.15 } : springs.bouncy}
              >
                <h3 className="font-display text-lg font-semibold">
                  {kept.length === 0 ? "Nothing caught your eye" : bagCount(kept.length)}
                </h3>
                {kept.length > 0 ? (
                  <>
                    <ul className="mt-3 space-y-2">
                      {kept.map((p, i) => (
                        <motion.li
                          key={p.id}
                          className="flex items-center gap-3"
                          initial={reduce ? false : { opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ...springs.smooth, delay: reduce ? 0 : 0.12 + i * 0.06 }}
                        >
                          <span aria-hidden="true" className={cn("grid size-11 shrink-0 place-items-center rounded-xl text-2xl", p.bg)}>
                            {p.emoji}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{p.name}</span>
                            <span className="block text-xs text-text-soft">Size {p.size}</span>
                          </span>
                          <span className="text-sm font-semibold tabular-nums">{p.price} TND</span>
                        </motion.li>
                      ))}
                    </ul>
                    <p className="mt-4 flex items-baseline justify-between border-t border-dashed border-line pt-3 text-sm">
                      <span className="text-text-soft">Total</span>
                      <span className="font-display text-xl font-semibold tabular-nums">{total} TND</span>
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-text-soft">Fair enough. New pieces come in every week.</p>
                )}
                <button type="button" className="btn mt-5 w-full" onClick={shuffle}>
                  <Shuffle size={17} aria-hidden="true" />
                  Shuffle again
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section aria-labelledby="fripa-story" className="mt-9 px-5 pb-4">
        <h2 id="fripa-story" className="font-display text-xl font-semibold">
          The idea
        </h2>
        <ul className="mt-3 space-y-3">
          {project.story.map((line) => (
            <li key={line} className="flex gap-3 leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-coral" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>
    </AppScreen>
  )
}

function PieceCard({ piece }: { piece: Piece }) {
  return (
    <article className={cn("relative flex h-full w-full flex-col overflow-hidden rounded-[28px] text-ink shadow-[var(--shadow)] select-none", piece.bg)}>
      <div
        aria-hidden="true"
        className="relative grid flex-1 place-items-center"
        style={{ backgroundImage: "radial-gradient(rgba(31,34,51,0.1) 1.5px, transparent 1.5px)", backgroundSize: "16px 16px" }}
      >
        <span className="absolute size-40 rounded-full bg-white/40 blur-2xl" />
        <span className="relative text-[6rem] leading-none drop-shadow-[0_10px_12px_rgba(31,34,51,0.2)]">{piece.emoji}</span>
      </div>
      <div className="m-2 rounded-[22px] bg-white/90 px-4 py-3">
        <p className="font-display text-lg leading-tight font-semibold">{piece.name}</p>
        <p className="mt-0.5 text-xs text-ink/60">{piece.note}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="rounded-full bg-ink/8 px-2.5 py-0.5 text-xs font-bold">Size {piece.size}</span>
          <span className="font-display text-base font-semibold tabular-nums">{piece.price} TND</span>
        </div>
      </div>
    </article>
  )
}
