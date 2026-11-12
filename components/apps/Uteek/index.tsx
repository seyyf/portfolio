"use client"

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion"
import { CalendarDays, ChevronLeft, MapPin, Ticket as TicketIcon } from "lucide-react"
import { useRef, useState, type KeyboardEvent } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { Sheet } from "@/components/shared/Sheet"
import { Ticket } from "@/components/shared/Ticket"
import { projectById } from "@/data/projects"
import { springs } from "@/lib/animations"
import { useBackLayer } from "@/lib/backStack"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

import { EVENTS, ROWS, SEATS_PER_ROW, isTaken, type DemoEvent } from "./events"

const project = projectById.uteek
const role = project.roles[0]

type Seat = { row: number; seat: number }
const seatName = (s: Seat) => `Row ${ROWS[s.row]}, seat ${s.seat + 1}`

export default function UteekApp() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [openId, setOpenId] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [booked, setBooked] = useState<Seat | null>(null)
  const event = EVENTS.find((e) => e.id === openId) ?? null
  const layout = reduce ? { duration: 0 } : springs.smooth

  const openEvent = (id: string) => {
    setOpenId(id)
    setBooked(null)
    playSfx("tap")
  }

  const closeEvent = () => {
    setOpenId(null)
    setBooked(null)
  }
  // The phone's back button returns from an event to the list before closing the app.
  useBackLayer(openId !== null, closeEvent)

  const confirm = (seat: Seat) => {
    setPicking(false)
    setBooked(seat)
    playSfx("ping")
  }

  return (
    <AppScreen title={project.name} subtitle={`${role.title} at ${role.company}, ${role.start} – ${role.end}`} project="uteek">
      <p className="px-5 text-[0.95rem] leading-relaxed text-text-soft">{project.tagline}</p>

      <section aria-labelledby="uteek-events" className="mt-6 px-5">
        <div className="flex items-baseline justify-between">
          <h2 id="uteek-events" className="font-display text-xl font-semibold">
            {event ? "Event" : "This week"}
          </h2>
          <span className="chip text-text-soft">Demo events</span>
        </div>

        <LayoutGroup id="uteek">
          <div className="mt-3">
            {!event ? (
              <ul className="space-y-3">
                {EVENTS.map((e) => (
                  <li key={e.id}>
                    <motion.button
                      type="button"
                      layoutId={`uteek-card-${e.id}`}
                      transition={layout}
                      onClick={() => openEvent(e.id)}
                      className="card flex w-full items-center gap-3.5 p-3 text-left"
                      style={{ borderRadius: 24 }}
                      whileTap={reduce ? undefined : { scale: 0.98 }}
                    >
                      <motion.span
                        layoutId={`uteek-art-${e.id}`}
                        transition={layout}
                        aria-hidden="true"
                        className={cn("grid size-[72px] shrink-0 place-items-center text-4xl", e.accent)}
                        style={{ borderRadius: 18 }}
                      >
                        {e.emoji}
                      </motion.span>
                      <span className="min-w-0 flex-1">
                        <motion.span layoutId={`uteek-title-${e.id}`} transition={layout} className="block font-display text-lg leading-tight font-semibold">
                          {e.title}
                        </motion.span>
                        <span className="mt-1 block text-sm text-text-soft">
                          {e.when}, {e.place}
                        </span>
                      </span>
                      <span className="shrink-0 self-start rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold tabular-nums">{e.price}</span>
                    </motion.button>
                  </li>
                ))}
              </ul>
            ) : (
              <EventDetail
                key={event.id}
                event={event}
                booked={booked}
                reduce={reduce}
                layout={layout}
                onBack={closeEvent}
                onBook={() => setPicking(true)}
              />
            )}
          </div>
        </LayoutGroup>
      </section>

      <section aria-labelledby="uteek-story" className="mt-9 px-5">
        <h2 id="uteek-story" className="font-display text-xl font-semibold">
          What I did
        </h2>
        <ul className="mt-3 space-y-3">
          {project.story.map((line) => (
            <li key={line} className="flex gap-3 leading-relaxed">
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-lavender" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="uteek-stack" className="mt-9 px-5 pb-4">
        <h2 id="uteek-stack" className="font-display text-xl font-semibold">
          Stack
        </h2>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {project.stack.map((s) => (
            <li key={s} className="chip">
              {s}
            </li>
          ))}
        </ul>
      </section>

      {event && (
        <Sheet open={picking} onOpenChange={setPicking} title="Pick a seat" description={`${event.title}, ${event.when}. Grey seats are taken.`}>
          <SeatMap key={event.id} event={event} onConfirm={confirm} />
        </Sheet>
      )}
    </AppScreen>
  )
}

// ---------------------------------------------------------------------------------------------

type Layout = typeof springs.smooth

function EventDetail({
  event,
  booked,
  reduce,
  layout,
  onBack,
  onBook,
}: {
  event: DemoEvent
  booked: Seat | null
  reduce: boolean
  layout: Layout
  onBack: () => void
  onBook: () => void
}) {
  const [torn, setTorn] = useState(false)
  const [prevBooked, setPrevBooked] = useState(booked)
  if (prevBooked !== booked) {
    setPrevBooked(booked)
    setTorn(false)
  }

  return (
    <motion.article layoutId={`uteek-card-${event.id}`} layoutDependency={event.id} transition={layout} className="card overflow-hidden p-3" style={{ borderRadius: 28 }}>
      <motion.div
        layoutId={`uteek-art-${event.id}`}
        layoutDependency={event.id}
        transition={layout}
        aria-hidden="true"
        className={cn("relative grid h-44 place-items-center text-[5rem]", event.accent)}
        style={{ borderRadius: 22 }}
      >
        {event.emoji}
      </motion.div>

      <motion.div
        className="px-2 pt-4 pb-2"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={reduce ? { duration: 0.15 } : { ...springs.smooth, delay: 0.1 }}
      >
        <motion.h3 layoutId={`uteek-title-${event.id}`} layoutDependency={event.id} transition={layout} className="font-display text-2xl leading-tight font-semibold">
          {event.title}
        </motion.h3>
        <ul className="mt-2 space-y-1 text-sm text-text-soft">
          <li className="flex items-center gap-2">
            <CalendarDays size={16} aria-hidden="true" />
            {event.when}
          </li>
          <li className="flex items-center gap-2">
            <MapPin size={16} aria-hidden="true" />
            {event.place}
          </li>
        </ul>
        <p className="mt-3 leading-relaxed">{event.blurb}</p>

        <AnimatePresence mode="wait" initial={false}>
          {!booked ? (
            <motion.div key="actions" className="mt-5 flex items-center justify-between gap-3" exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <button type="button" className="btn btn-soft" onClick={onBack}>
                <ChevronLeft size={18} aria-hidden="true" />
                All events
              </button>
              <button type="button" className="btn" onClick={onBook}>
                <TicketIcon size={18} aria-hidden="true" />
                Book a seat
              </button>
            </motion.div>
          ) : (
            <motion.div key="ticket" className="mt-5 flex flex-col items-center" initial={{ opacity: 1 }}>
              <p className="w-full font-semibold" role="status">
                You are in. {seatName(booked)}.
              </p>
              {/* The ticket slides out of the "printer", then the stub tears off. */}
              <div className="relative mt-3 w-full overflow-hidden px-1 pt-1 pb-10">
                <motion.div
                  className="flex justify-center"
                  initial={reduce ? { opacity: 0 } : { y: -260, rotate: -2 }}
                  animate={reduce ? { opacity: 1 } : { y: 0, rotate: 0 }}
                  transition={reduce ? { duration: 0.2, delay: 0.2 } : { type: "spring", stiffness: 160, damping: 17, delay: 0.35 }}
                  onAnimationComplete={() => setTorn(true)}
                >
                  <Ticket
                    eyebrow="Uteek Events"
                    title={event.title}
                    details={`${event.when}, ${event.place}`}
                    fields={[
                      { label: "Row", value: ROWS[booked.row] },
                      { label: "Seat", value: String(booked.seat + 1) },
                      { label: "Price", value: event.price },
                    ]}
                    code={`UTK-${event.code}-${ROWS[booked.row]}${booked.seat + 1}`}
                    accentClassName={event.accent}
                    torn={torn}
                  />
                </motion.div>
              </div>
              <button type="button" className="btn btn-soft self-start" onClick={onBack}>
                <ChevronLeft size={18} aria-hidden="true" />
                All events
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.article>
  )
}

// ---------------------------------------------------------------------------------------------
// Seat map: a keyboard-navigable grid (arrow keys move, Enter or Space picks).

function SeatMap({ event, onConfirm }: { event: DemoEvent; onConfirm: (s: Seat) => void }) {
  const [focus, setFocus] = useState<Seat>({ row: 2, seat: 3 })
  const [picked, setPicked] = useState<Seat | null>(null)
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const moveFocus = (row: number, seat: number) => {
    const next = { row: Math.min(ROWS.length - 1, Math.max(0, row)), seat: Math.min(SEATS_PER_ROW - 1, Math.max(0, seat)) }
    setFocus(next)
    refs.current[next.row * SEATS_PER_ROW + next.seat]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const { row, seat } = focus
    const moves: Record<string, [number, number]> = {
      ArrowRight: [row, seat + 1],
      ArrowLeft: [row, seat - 1],
      ArrowDown: [row + 1, seat],
      ArrowUp: [row - 1, seat],
      Home: [row, 0],
      End: [row, SEATS_PER_ROW - 1],
    }
    if (!(e.key in moves)) return
    e.preventDefault()
    moveFocus(...moves[e.key])
  }

  const pick = (s: Seat) => {
    if (isTaken(event.id, s.row, s.seat)) return
    setFocus(s)
    setPicked(s)
    playSfx("tap")
  }

  return (
    <div>
      <div aria-hidden="true" className="mx-auto mb-4 h-2 w-3/4 rounded-b-full bg-gradient-to-r from-lavender via-sky to-lavender opacity-80" />
      <p aria-hidden="true" className="-mt-2 mb-3 text-center text-[0.65rem] font-bold tracking-[0.2em] text-text-soft uppercase">
        Stage
      </p>

      <div role="grid" aria-label="Seats" onKeyDown={onKeyDown} className="mx-auto w-fit space-y-1.5">
        {ROWS.map((r, ri) => (
          <div role="row" key={r} className="flex items-center gap-1">
            <span aria-hidden="true" className="w-4 text-center text-[0.7rem] font-bold text-text-soft">
              {r}
            </span>
            {Array.from({ length: SEATS_PER_ROW }, (_, si) => {
              const taken = isTaken(event.id, ri, si)
              const selected = picked?.row === ri && picked?.seat === si
              const focused = focus.row === ri && focus.seat === si
              return (
                <div role="gridcell" key={si} aria-selected={selected} className={cn(si === SEATS_PER_ROW / 2 && "ml-3")}>
                  <motion.button
                    ref={(el) => {
                      refs.current[ri * SEATS_PER_ROW + si] = el
                    }}
                    type="button"
                    tabIndex={focused ? 0 : -1}
                    aria-label={`${seatName({ row: ri, seat: si })}${taken ? ", taken" : ""}`}
                    aria-disabled={taken || undefined}
                    aria-pressed={selected}
                    onClick={() => pick({ row: ri, seat: si })}
                    onFocus={() => setFocus({ row: ri, seat: si })}
                    whileTap={taken ? { x: [0, -3, 3, 0] } : { scale: 0.85 }}
                    animate={{ scale: selected ? 1.12 : 1 }}
                    transition={springs.bouncy}
                    className={cn(
                      "grid size-[clamp(30px,8.6vw,36px)] place-items-center rounded-t-[12px] rounded-b-md text-[0.65rem] font-bold transition-colors",
                      taken ? "cursor-not-allowed bg-text/15 text-transparent" : selected ? "bg-lavender text-ink shadow-[0_4px_10px_rgba(31,34,51,0.25)]" : "bg-surface text-text-soft ring-1 ring-line hover:bg-lavender/40"
                    )}
                  >
                    {si + 1}
                  </motion.button>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <ul className="mt-4 flex justify-center gap-4 text-xs text-text-soft" aria-hidden="true">
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-surface ring-1 ring-line" />
          Free
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-text/15" />
          Taken
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-lavender" />
          Yours
        </li>
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold" aria-live="polite">
          {picked ? seatName(picked) : "No seat picked yet"}
        </p>
        <button type="button" className="btn disabled:opacity-50" disabled={!picked} onClick={() => picked && onConfirm(picked)}>
          Confirm seat
        </button>
      </div>
    </div>
  )
}
