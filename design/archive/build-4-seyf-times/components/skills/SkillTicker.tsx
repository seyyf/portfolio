"use client"

import { Pause, Play } from "lucide-react"
import { useState, type CSSProperties } from "react"

import { cn } from "@/lib/utils"

type SkillTickerProps = {
  /** Entries like "React ▲ 4" (see `skillTicker` in data/skills.ts). */
  items: string[]
  className?: string
}

/** "React ▲ 4" → name and count. */
function parse(entry: string) {
  const [name, count] = entry.split("▲").map((p) => p.trim())
  return { name, count }
}

function Entries({ items, hidden = false }: { items: string[]; hidden?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((entry) => {
        const { name, count } = parse(entry)
        return (
          <li key={entry} className="flex items-center gap-2 px-5 whitespace-nowrap">
            <span className="font-semibold">{name}</span>
            <span aria-hidden="true" className="text-[0.7em] text-market">
              ▲
            </span>
            {count ? (
              <span className="tabular-nums">
                {count}
                <span className="sr-only"> {count === "1" ? "role" : "roles"}</span>
              </span>
            ) : null}
            <span aria-hidden="true" className="pl-3 text-gray">
              ·
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Stock-ticker strip of skills (CSS marquee via the global `.ticker` / `.ticker-track`). The list is
 * rendered twice so the -50% loop is seamless; the copy is hidden from assistive tech. It pauses on
 * hover or focus, with the pause button, and stays still for reduced motion.
 */
export function SkillTicker({ items, className }: SkillTickerProps) {
  const [paused, setPaused] = useState(false)

  return (
    <section aria-label="Skills ticker: how many roles used each skill" className={cn("ticker flex items-stretch border-y border-ink bg-paper-2", className)}>
      <div className="min-w-0 flex-1 overflow-hidden py-2 font-mono text-[0.9rem]">
        <div className="ticker-track flex w-max" style={{ "--ticker-duration": "55s", animationPlayState: paused ? "paused" : undefined } as CSSProperties}>
          <Entries items={items} />
          <Entries items={items} hidden />
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label="Pause the ticker"
        className="no-print grid w-11 shrink-0 motion-reduce:hidden place-items-center border-l border-ink text-ink hover:bg-ink hover:text-paper"
      >
        {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>
    </section>
  )
}
