"use client"

import { Disc3, MessageSquare, Trophy } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/Button"
import { cheats, doors } from "@/data/game"
import { missionPages } from "@/data/missions"
import { completion, starsOf, useGame, visitedMissions } from "@/lib/game"
import { openPhone, openWheel } from "@/lib/ui"
import { cn } from "@/lib/utils"

import { DoorIcon } from "./Door"

/**
 * The Stats page's game progress: completion %, interest level, the ten blue doors (hints for the
 * missing ones), cheats found and mission pages visited. 100% unlocks a message from Seyf.
 */
export function Progress() {
  const { save } = useGame()
  const { percent } = completion(save)
  const stars = starsOf(save)
  const visited = visitedMissions(save).length

  return (
    <section id="progress" aria-labelledby="progress-heading" className="mt-12 scroll-mt-[var(--hud-top)]">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="progress-heading" className="font-display text-4xl text-ink lg:text-5xl">
          <span>Game progress</span>
        </h2>
        <Button variant="outline" size="sm" onClick={() => openWheel()}>
          <Disc3 aria-hidden="true" className="size-4" />
          Skills wheel
          <kbd className="hidden rounded border border-ink/25 px-1 font-mono text-[0.625rem] lg:inline">Q</kbd>
        </Button>
      </div>

      <div className="hud-panel cut-br mt-6 rounded-t-2xl px-5 pt-5 pb-8 sm:px-7">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="font-mono text-xs text-gold lowercase">Completion</p>
            <p className="mt-1 font-mono text-6xl leading-none font-semibold text-ink tabular-nums lg:text-7xl">
              {percent}
              <span className="text-3xl text-muted">%</span>
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-gold lowercase">Interest level</p>
            <p className="mt-1 font-mono text-2xl text-gold" aria-label={`${stars} of 5 stars`}>
              {"★".repeat(stars)}
              <span className="text-ink/25">{"★".repeat(5 - stars)}</span>
            </p>
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Game completion"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          className="mt-4 h-2.5 overflow-hidden rounded-full bg-ink/10"
        >
          <div className="bg-sunset-h h-full rounded-full transition-[width] duration-700" style={{ width: `${percent}%` }} />
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-mono text-xs text-muted lowercase">
              Blue doors · {save.doors.length}/{doors.length}
            </h3>
            <ul className="mt-3 grid gap-1.5">
              {doors.map((d) => {
                const found = save.doors.includes(d.id)
                return (
                  <li key={d.id} className="flex items-center gap-2.5 text-[0.9375rem]">
                    <DoorIcon open={found} className={cn("h-5 w-auto shrink-0", !found && "opacity-40")} />
                    <span className={found ? "text-ink" : "text-muted"}>{found ? `${d.hint} · found` : d.hint}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs text-muted lowercase">
              Cheats · {save.cheats.length}/{cheats.length}
            </h3>
            <ul className="mt-3 grid gap-2">
              {cheats.map((c) => {
                const found = save.cheats.includes(c.id)
                return (
                  <li key={c.id} className="text-[0.9375rem] leading-snug">
                    {found ? (
                      <>
                        <span className="font-mono font-semibold text-gold">{c.code}</span>
                        <span className="block text-sm text-ink/80">{c.effect}</span>
                      </>
                    ) : (
                      <>
                        <span className="font-mono text-muted">{Array(c.code.length).fill("_").join(" ")}</span>
                        <span className="block text-sm text-muted">Hint: {c.hint}</span>
                      </>
                    )}
                  </li>
                )
              })}
            </ul>
            <p className="mt-3 text-sm text-muted">Type a code anywhere on the site, or enter it in the phone&apos;s Codes app.</p>
          </div>

          <div>
            <h3 className="font-mono text-xs text-muted lowercase">
              Missions visited · {visited}/{missionPages.length}
            </h3>
            <ul className="mt-3 grid gap-1.5">
              {missionPages.map((m) => {
                const seen = save.heat.includes(`visit:${m.slug}`)
                return (
                  <li key={m.slug} className={cn("flex items-center gap-2 text-[0.9375rem]", seen ? "text-ink" : "text-muted")}>
                    <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", seen ? "bg-gold" : "bg-ink/20")} />
                    <Link href={`/missions/${m.slug}`} className="underline-offset-4 hover:text-gold hover:underline">
                      {m.kind === "mission" ? `${m.number} · ${m.codename}` : m.name}
                    </Link>
                    <span className="sr-only">{seen ? "(visited)" : "(not visited yet)"}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {percent === 100 && (
          <div className="mt-8 flex flex-col gap-4 rounded-xl border border-gold/40 bg-gold/[0.07] p-5 sm:flex-row sm:items-center">
            <Trophy aria-hidden="true" className="size-10 shrink-0 text-gold" />
            <div className="flex-1">
              <p className="font-display text-2xl text-ink">
                <span className="text-sunset">100% complete</span>
              </p>
              <p className="mt-1 text-ink/85">You found everything. That kind of thoroughness is exactly what I look for in a team. Let&apos;s talk.</p>
            </div>
            <Button onClick={() => openPhone("messages")}>
              <MessageSquare aria-hidden="true" className="size-4" />
              Message Seyf
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
