"use client"

import { RotateCcw } from "lucide-react"
import { useState } from "react"

import { SwipeDeck, type SwipeDecision } from "@/components/shared/SwipeDeck"

type Piece = { id: string; emoji: string; name: string; size: string; price: number }

/** Demo rack: made-up pieces to show the interaction, not real Fripa listings. */
const RACK: Piece[] = [
  { id: "coat", emoji: "🧥", name: "Winter overcoat", size: "L", price: 65 },
  { id: "dress", emoji: "👗", name: "Summer dress", size: "S", price: 35 },
  { id: "jeans", emoji: "👖", name: "Straight-leg jeans", size: "32", price: 40 },
  { id: "sneakers", emoji: "👟", name: "Retro sneakers", size: "42", price: 55 },
  { id: "scarf", emoji: "🧣", name: "Knit scarf", size: "One size", price: 15 },
  { id: "tee", emoji: "👕", name: "Cotton T-shirt", size: "M", price: 12 },
]

const describe = (p: Piece) => `${p.name}, size ${p.size}, ${p.price} TND`

/** A small, working version of Fripa's swipe-to-shop interaction, embedded in the story. */
export function SwipeDemo() {
  const [deck, setDeck] = useState(RACK)
  const [kept, setKept] = useState<Piece[]>([])
  const [done, setDone] = useState(false)

  const onDecision = (item: Piece, decision: SwipeDecision) => {
    if (decision === "keep") setKept((k) => [...k, item])
  }

  const restart = () => {
    setDeck([...RACK])
    setKept([])
    setDone(false)
  }

  const total = kept.reduce((sum, p) => sum + p.price, 0)

  return (
    <section aria-labelledby="swipe-demo" className="border border-rule bg-paper-2 p-5 sm:p-8">
      <div className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:gap-12">
        <div>
          <p className="label inline-block bg-ink px-2 py-1 text-paper">Demo</p>
          <h2 id="swipe-demo" className="mt-4 font-headline text-2xl font-black tracking-tight sm:text-3xl">
            Try it: swipe the rack
          </h2>
          <p className="mt-3 max-w-[50ch] leading-relaxed">
            Fripa&apos;s shop works one piece at a time: right to keep, left to pass. These six cards are demo items, not real
            listings.
          </p>
          <p className="mt-5 font-sans text-sm font-semibold">
            <span className="font-mono text-2xl text-accent-ink">{kept.length}</span> kept
            {kept.length > 0 && <span className="text-gray"> · {total} TND</span>}
          </p>
        </div>

        <div className="flex min-h-[460px] flex-col items-center justify-center">
          {done ? (
            <div className="w-full max-w-[300px] border border-rule bg-paper p-6 text-center">
              <p className="label text-gray">That&apos;s the whole rack</p>
              <p className="mt-3 font-headline text-xl font-bold">
                {kept.length === 0 ? "Nothing kept this time." : `You kept ${kept.length} ${kept.length === 1 ? "piece" : "pieces"}.`}
              </p>
              {kept.length > 0 && (
                <ul className="mt-3 space-y-1 text-left font-sans text-sm">
                  {kept.map((p) => (
                    <li key={p.id} className="flex justify-between gap-3 border-b border-rule/20 py-1">
                      <span>
                        <span aria-hidden="true">{p.emoji} </span>
                        {p.name}
                      </span>
                      <span className="shrink-0 font-mono">{p.price} TND</span>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" onClick={restart} className="btn-ink mt-5">
                <RotateCcw size={16} aria-hidden="true" />
                Shuffle again
              </button>
            </div>
          ) : null}
          {/* Stays mounted after the last card so its live region can announce the final decision. */}
          <div className="w-full">
            <SwipeDeck
              items={deck}
              getLabel={describe}
              onDecision={onDecision}
              onEmpty={() => setDone(true)}
              className="rounded-none"
              renderCard={(p) => (
                <div className="flex h-full w-full flex-col overflow-hidden border border-rule bg-paper shadow-[0_14px_30px_-18px_rgba(0,0,0,0.45)]">
                  <div className="flex flex-1 items-center justify-center bg-paper-2 text-[5.5rem] leading-none select-none" aria-hidden="true">
                    {p.emoji}
                  </div>
                  <div className="border-t border-rule p-4">
                    <p className="font-headline text-xl leading-tight font-bold">{p.name}</p>
                    <p className="mt-1 flex items-center justify-between font-sans text-sm text-gray">
                      <span>Size {p.size}</span>
                      <span className="font-mono font-semibold text-ink">{p.price} TND</span>
                    </p>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
