"use client"

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion"
import { useState, type CSSProperties } from "react"

import { useCity } from "@/lib/store"
import { playSfx } from "@/lib/sound"

type TicketData = { id: number; row: string; seat: number }

const ROWS = "ABCDEFGH"
const MAIN_HEIGHT = 124
const INK = "#2b2d42"

// Half-circle notches on both sides of the perforation, cut with a mask.
const notchMask: CSSProperties = {
  maskImage: `radial-gradient(circle 11px at 0 ${MAIN_HEIGHT}px, transparent 98%, #000 100%), radial-gradient(circle 11px at 100% ${MAIN_HEIGHT}px, transparent 98%, #000 100%)`,
  WebkitMaskImage: `radial-gradient(circle 11px at 0 ${MAIN_HEIGHT}px, transparent 98%, #000 100%), radial-gradient(circle 11px at 100% ${MAIN_HEIGHT}px, transparent 98%, #000 100%)`,
  maskComposite: "intersect",
  WebkitMaskComposite: "source-in",
}

// An outline that follows the masked shape, plus the site's chunky drop shadow.
const outline: CSSProperties = {
  filter: `drop-shadow(2px 0 0 ${INK}) drop-shadow(-2px 0 0 ${INK}) drop-shadow(0 2px 0 ${INK}) drop-shadow(0 -2px 0 ${INK}) drop-shadow(0 4px 0 rgba(43,45,66,0.9))`,
}

const printVariants: Variants = {
  hidden: { y: "-105%", rotate: 0, x: 0, opacity: 1 },
  shown: {
    y: ["-105%", "-66%", "-62%", "-24%", "-20%", "0%"],
    rotate: [0, 0, 0, 0, 0, 0, 4.5, -3.2, 1.8, -0.8, 0],
    opacity: 1,
    transition: {
      y: { duration: 0.85, times: [0, 0.28, 0.4, 0.68, 0.78, 1], ease: "easeOut" },
      rotate: { duration: 1.9, ease: "easeOut" },
    },
  },
  gone: {
    x: 360,
    y: -30,
    rotate: 24,
    opacity: 0,
    transition: { duration: 0.5, ease: [0.5, 0, 0.75, 0] },
  },
}

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.25 } },
  gone: { opacity: 0, transition: { duration: 0.15 } },
}

/** Uteek: a box office that prints a ticket with a random seat. */
export function Ticket() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useCity((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [ticket, setTicket] = useState<TicketData | null>(null)

  const print = () => {
    const row = ROWS[Math.floor(Math.random() * ROWS.length)]
    const seat = 1 + Math.floor(Math.random() * 24)
    setTicket((prev) => ({ id: (prev?.id ?? 0) + 1, row, seat }))
    playSfx("click")
  }

  return (
    <div className="flex w-full flex-col items-center gap-4 overflow-x-clip">
      <div className="relative w-full max-w-[300px]">
        {/* The printer */}
        <div className="relative z-10 flex h-14 items-center gap-3 rounded-2xl border-2 border-ink bg-lavender px-4 text-ink shadow-[0_4px_0_#2b2d42]">
          <motion.span
            key={ticket?.id ?? 0}
            aria-hidden
            className="h-3 w-3 shrink-0 rounded-full border-2 border-ink"
            initial={{ backgroundColor: "#a8e6cf" }}
            animate={
              ticket && !reduce
                ? { backgroundColor: ["#a8e6cf", "#ffd97d", "#a8e6cf", "#ffd97d", "#a8e6cf"] }
                : { backgroundColor: "#a8e6cf" }
            }
            transition={{ duration: 0.9 }}
          />
          <span className="font-display text-sm font-semibold">Box office</span>
          <span aria-hidden className="ml-auto flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-ink/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-ink/60" />
            <span className="h-1.5 w-1.5 rounded-full bg-ink/60" />
          </span>
          {/* Slot */}
          <span aria-hidden className="absolute inset-x-5 -bottom-[5px] h-2.5 rounded-full border-2 border-ink bg-night" />
        </div>

        {/* Ticket stage: clipped at the top so tickets come out from behind the slot. */}
        <div className="relative h-[214px]" style={{ clipPath: "inset(0 -480px -480px -480px)" }}>
          <AnimatePresence initial={false}>
            {ticket ? (
              <motion.div
                key={ticket.id}
                className="absolute inset-x-5 top-0 origin-top"
                variants={reduce ? fadeVariants : printVariants}
                initial="hidden"
                animate="shown"
                exit="gone"
              >
                <TicketCard ticket={ticket} />
              </motion.div>
            ) : (
              <motion.p
                key="empty"
                className="absolute inset-x-5 top-6 rounded-[18px] border-2 border-dashed border-line/40 px-4 py-10 text-center text-sm text-text-soft"
                exit={{ opacity: 0 }}
              >
                Your ticket prints here.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button type="button" className="btn btn-coral" onClick={print}>
        {ticket ? "Book another seat" : "Book a seat"}
      </button>

      <p className="sr-only" aria-live="polite">
        {ticket ? `Ticket printed. Row ${ticket.row}, seat ${ticket.seat}.` : ""}
      </p>
    </div>
  )
}

function TicketCard({ ticket }: { ticket: TicketData }) {
  return (
    <div style={outline}>
      <div className="relative bg-butter text-ink" style={{ ...notchMask, borderRadius: 18 }}>
        <div className="relative flex flex-col justify-between overflow-hidden px-5 pt-4 pb-3" style={{ height: MAIN_HEIGHT }}>
          {/* Soft stripes for a printed look */}
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 w-16 opacity-60"
            style={{
              background: "repeating-linear-gradient(135deg, #ff8b94 0 8px, transparent 8px 16px)",
              maskImage: "linear-gradient(90deg, transparent, #000)",
              WebkitMaskImage: "linear-gradient(90deg, transparent, #000)",
            }}
          />
          <div className="relative">
            <p className="font-display text-[1.4rem] leading-tight font-bold">Seyf City Live</p>
            <p className="mt-1 inline-block rounded-full border-2 border-ink bg-cream px-2 text-xs font-bold">Admit one</p>
          </div>
          <p className="relative font-display text-lg font-semibold">
            Row {ticket.row} · Seat {ticket.seat}
          </p>
        </div>

        <div aria-hidden className="mx-4 border-t-[3px] border-dashed border-ink/35" />

        <div className="flex h-[62px] items-center justify-between gap-3 px-5">
          <p className="text-[0.7rem] leading-snug font-bold text-ink-soft">Booking UI by Seyf · Uteek 2024</p>
          <div
            aria-hidden
            className="h-8 w-16 shrink-0"
            style={{
              background:
                "repeating-linear-gradient(90deg, #2b2d42 0 2px, transparent 2px 4px, #2b2d42 4px 5px, transparent 5px 8px, #2b2d42 8px 11px, transparent 11px 13px)",
            }}
          />
        </div>
      </div>
    </div>
  )
}
