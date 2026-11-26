"use client"

import { useRef, useState, type KeyboardEvent } from "react"

import type { StatTab } from "@/data/skills"
import { useMotionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { cn } from "@/lib/utils"

import { StatRow } from "./StatRow"

/**
 * The skills menu: ARIA tabs (←/→, Home/End move and select; the tab panel is next in Tab order).
 * Every panel is rendered (hidden when inactive) so the full list is in the HTML.
 */
export function StatsMenu({ tabs }: { tabs: StatTab[] }) {
  const [active, setActive] = useState(tabs[0]?.id)
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const reduced = useMotionReduced()

  const select = (i: number) => {
    const t = tabs[i]
    if (!t) return
    if (t.id !== active) play("tap")
    setActive(t.id)
    refs.current[i]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === active)
    const n = tabs.length
    let next: number | null = null
    if (e.key === "ArrowRight") next = (i + 1) % n
    else if (e.key === "ArrowLeft") next = (i - 1 + n) % n
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = n - 1
    if (next === null) return
    e.preventDefault()
    select(next)
  }

  return (
    <div>
      <div role="tablist" aria-label="Skill categories" onKeyDown={onKeyDown} className="grid grid-cols-3 gap-1.5 md:grid-cols-6">
        {tabs.map((t, i) => {
          const selected = t.id === active
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="tab"
              id={`stats-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`stats-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(i)}
              className={cn(
                "relative flex h-12 items-center justify-center rounded-lg border px-2 font-display text-lg transition-colors md:text-xl",
                selected ? "border-orange/60 bg-surface-2 text-ink" : "border-ink/10 bg-surface/60 text-muted hover:border-ink/25 hover:text-ink"
              )}
            >
              <span className={cn(selected && "lean")}>{t.label}</span>
              <span aria-hidden="true" className={cn("bg-pink absolute inset-x-3 -bottom-px h-[3px] rounded-full transition-opacity", selected ? "opacity-100" : "opacity-0")} />
            </button>
          )
        })}
      </div>
      <p aria-hidden="true" className="mt-2 hidden text-right font-mono text-xs text-muted lowercase md:block">
        ← → to switch
      </p>

      {tabs.map((t) => {
        const selected = t.id === active
        return (
          <div
            key={t.id}
            role="tabpanel"
            id={`stats-panel-${t.id}`}
            aria-labelledby={`stats-tab-${t.id}`}
            tabIndex={0}
            hidden={!selected}
            className="hud-panel cut-br mt-3 rounded-t-xl pb-6 md:mt-2"
          >
            <dl className="divide-y divide-ink/[0.08]">
              {t.skills.map((s, i) => (
                <StatRow key={s.name} skill={s} index={i} active={selected} reduced={reduced} />
              ))}
            </dl>
          </div>
        )
      })}
    </div>
  )
}
