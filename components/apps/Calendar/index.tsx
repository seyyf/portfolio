"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, Briefcase, GraduationCap } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { apps } from "@/data/apps"
import { career } from "@/data/projects"
import { fade, springs } from "@/lib/animations"
import { useOSNav } from "@/lib/nav"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

type Item = (typeof career)[number]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const yearOf = (d: string) => Number(d.slice(-4))
/** "Aug 2020" → months since year 0; a bare "2017" counts as its first month. */
const monthIndex = (d: string) => yearOf(d) * 12 + Math.max(0, MONTHS.indexOf(d.slice(0, 3)))

/** "1 yr 6 mos" for finished items; current roles just say they're ongoing. */
function duration(item: Item) {
  if (item.end === "Present") return null
  const m = monthIndex(item.end) - monthIndex(item.start)
  const y = Math.floor(m / 12)
  const r = m % 12
  return [y && `${y} ${y === 1 ? "yr" : "yrs"}`, r && `${r} ${r === 1 ? "mo" : "mos"}`].filter(Boolean).join(" ")
}

const isNow = (item: Item) => "now" in item && item.now === true

/** Grouped by the year each chapter started, oldest first. */
const years = [...new Set(career.map((c) => yearOf(c.start)))].map((year) => ({
  year,
  items: career.map((item, i) => ({ item, i })).filter(({ item }) => yearOf(item.start) === year),
}))
const nowYear = yearOf(career.find(isNow)?.start ?? career[career.length - 1].start)

/** Calendar: the career timeline, from university to today. */
export default function CalendarApp() {
  const { open } = useOSNav()
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const listRef = useRef<HTMLOListElement>(null)
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set())

  // Reveal items as they scroll into view inside the app's own scroll container.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const items = [...list.querySelectorAll<HTMLElement>("[data-reveal]")]
    const all = () => new Set(items.map((el) => Number(el.dataset.reveal)))
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setSeen(all()), 0)
      return () => window.clearTimeout(t)
    }
    const io = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((e) => e.isIntersecting).map((e) => Number((e.target as HTMLElement).dataset.reveal))
        if (!hits.length) return
        hits.forEach((n) => io.unobserve(items[n]))
        setSeen((s) => new Set([...s, ...hits]))
      },
      { root: list.closest(".app-scroll"), rootMargin: "0px 0px -8% 0px", threshold: 0.15 }
    )
    items.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  const jumpTo = (year: number) => {
    const el = document.getElementById(`year-${year}`)
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" })
    el?.focus({ preventScroll: true })
  }

  return (
    <AppScreen title="Calendar" subtitle="From university to today">
      {/* Year strip, like the month row of a calendar */}
      <nav aria-label="Jump to a year" className="-mt-1 mb-2 flex gap-2 overflow-x-auto overscroll-x-contain px-5 pt-1 pb-3 [scrollbar-width:none]">
        {years.map(({ year }) => (
          <button
            key={year}
            type="button"
            onClick={() => jumpTo(year)}
            className={cn(
              "relative flex min-h-11 shrink-0 flex-col items-center justify-center rounded-2xl px-3.5 font-display leading-none transition-transform active:scale-95",
              year === nowYear ? "bg-text text-bg" : "bg-surface text-text shadow-(--shadow)"
            )}
          >
            <span className="text-[0.95rem] font-semibold tabular-nums">{year}</span>
            {year === nowYear && (
              <span className="mt-0.5 flex items-center gap-1 font-sans text-[0.625rem] font-bold tracking-wide uppercase opacity-80">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-mint" />
                Now
              </span>
            )}
          </button>
        ))}
      </nav>

      <ol ref={listRef} className="relative px-5 pb-6" aria-label="Career timeline">
        {/* The rail */}
        <span aria-hidden="true" className="absolute top-3 bottom-10 left-[34px] w-0.5 rounded-full bg-line" />

        {years.map(({ year, items }) => (
          <li key={year} className="relative">
            <h2
              id={`year-${year}`}
              tabIndex={-1}
              className="relative flex scroll-mt-[calc(var(--status-h)+12px)] items-center gap-3 pt-3 pb-2 outline-none"
            >
              <span className="z-10 grid size-7.5 place-items-center rounded-full bg-bg">
                <span className="size-2.5 rounded-full bg-text/25" aria-hidden="true" />
              </span>
              <span className="font-display text-2xl font-semibold tabular-nums">{year}</span>
            </h2>
            <ol className="flex flex-col gap-3 pb-3 pl-10.5">
              {items.map(({ item, i }) => (
                <TimelineItem key={i} n={i} item={item} shown={seen.has(i)} reduce={reduce} onOpen={open} />
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </AppScreen>
  )
}

type TimelineItemProps = {
  n: number
  item: Item
  shown: boolean
  reduce: boolean
  onOpen: ReturnType<typeof useOSNav>["open"]
}

function TimelineItem({ n, item, shown, reduce, onOpen }: TimelineItemProps) {
  const now = isNow(item)
  const job = item.kind === "job"
  const Icon = job ? Briefcase : GraduationCap
  const span = duration(item)
  const app = "app" in item ? item.app : null

  return (
    <motion.li
      data-reveal={n}
      className="relative"
      initial={false}
      animate={shown ? "in" : "out"}
      variants={{
        out: reduce ? { opacity: 0 } : { opacity: 0, y: 26, scale: 0.96 },
        in: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={reduce ? fade : springs.bouncy}
    >
      {/* Dot on the rail */}
      <span aria-hidden="true" className="absolute top-5 -left-[34px] grid size-3.5 place-items-center">
        {now && <span className="absolute inset-0 animate-ping rounded-full bg-mint" />}
        <span className={cn("relative size-3.5 rounded-full ring-4 ring-bg", now ? "bg-mint" : job ? "bg-sky" : "bg-lavender")} />
      </span>

      <article
        className={cn("card p-4", now && "ring-2 ring-mint")}
        aria-labelledby={`event-${n}`}
      >
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold text-ink",
              job ? "bg-sky/60" : "bg-lavender/60"
            )}
          >
            <Icon size={13} aria-hidden="true" />
            {job ? "Work" : "Education"}
          </span>
          {now && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-ink">
              <span aria-hidden="true" className="size-2 rounded-full bg-ink" />
              Now
            </span>
          )}
        </div>

        <h3 id={`event-${n}`} className="mt-2.5 text-[1.05rem] leading-snug font-semibold">
          {item.title}
        </h3>
        <p className="text-[0.9375rem] font-medium text-text-soft">{item.place}</p>
        <p className="mt-1.5 text-sm text-text-soft tabular-nums">
          <time dateTime={String(yearOf(item.start))}>{item.start}</time> –{" "}
          {item.end === "Present" ? "today" : <time dateTime={String(yearOf(item.end))}>{item.end}</time>}
          {span && <span className="text-text-soft/80"> · {span}</span>}
        </p>

        {app && (
          <button
            type="button"
            onClick={() => onOpen(app)}
            className={cn("btn mt-3.5 w-full", now ? "btn-accent" : "btn-soft")}
          >
            Open {apps[app].name}
            <ArrowUpRight size={17} aria-hidden="true" />
          </button>
        )}
      </article>
    </motion.li>
  )
}
