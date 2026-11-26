import { ArrowRight, GraduationCap, Lock, MapPin } from "lucide-react"
import Link from "next/link"

import { Door } from "@/components/game/Door"
import { LocateButton, UnlockButton } from "@/components/map/ListActions"
import { StoryMotion } from "@/components/map/StoryMotion"
import { StatusBadge } from "@/components/map/MissionCard"
import { ButtonLink } from "@/components/ui/Button"
import { ChipList } from "@/components/ui/Chip"
import { VisitLink } from "@/components/ui/VisitLink"
import { districts, lockedMission, missions, sideMissions, tutorials } from "@/data/missions"
import { cn } from "@/lib/utils"

const eyebrow = "font-mono text-xs lowercase"

/** A route node on the story line, echoing the map markers. */
function Node({ number, current, locked }: { number: string; current?: boolean; locked?: boolean }) {
  return (
    <span
      aria-hidden="true"
      data-story-node
      className={cn(
        "relative z-10 grid size-10 place-items-center rounded-full font-mono text-sm font-bold lg:size-14 lg:text-base",
        locked ? "border-2 border-dashed border-ink/40 bg-violet/60 text-ink" : "bg-sunset p-[3px] text-ink"
      )}
    >
      {locked ? (
        <Lock className="size-4 lg:size-5" />
      ) : (
        <span className={cn("grid size-full place-items-center rounded-full", current ? "bg-transparent text-bg" : "bg-bg")}>{number}</span>
      )}
    </span>
  )
}

/**
 * Every mission as a designed list: the phone version of the map, and a section under the full
 * map on desktop (#missions; the pause menu links here). Same content as the map, no hover needed.
 */
export function MissionList() {
  return (
    // overflow-x-clip: the story cards slide in from the right (StoryMotion); without it they widen
    // the page mid-animation and phones get a horizontal scroll. Clip (not hidden) keeps it from
    // becoming a scroll container.
    <section id="missions" aria-label="Mission list" className="relative overflow-x-clip px-4 pt-14 pb-[calc(var(--hud-bottom)+3rem)] sm:px-6 lg:px-10 lg:pt-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgb(91_42_158/0.28),transparent)]" />
      <StoryMotion />
      <div data-story className="relative mx-auto max-w-5xl">
        <header>
          <p className={`${eyebrow} text-gold`}>Mission list</p>
          <h2 className="mt-2 font-display text-5xl text-ink lg:text-7xl">
            <span>Story missions</span>
          </h2>
          <p className="mt-3 max-w-[60ch] text-ink/80">Every job is a mission, in order. Each one opens a full briefing.</p>
        </header>

        <div data-story-route className="relative mt-10 lg:mt-14">
          <span aria-hidden="true" className="absolute top-5 bottom-10 left-5 w-0.5 -translate-x-1/2 lg:top-7 lg:left-7">
            <span data-story-line className="block size-full origin-top bg-[linear-gradient(#ff4fa3,#ff8a3d_60%,rgb(255_241_230/0.2))]" />
          </span>
          <ol className="relative">
            {missions.map((m) => {
              const current = m.status === "IN PROGRESS"
              return (
                <li key={m.slug} data-story-item className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 pb-6 lg:grid-cols-[3.5rem_minmax(0,1fr)] lg:gap-8 lg:pb-8">
                  <Node number={m.number} current={current} />
                  <article
                    data-story-card
                    className={cn(
                      "cut-br rounded-2xl border bg-surface/85 p-5 sm:p-6 lg:p-8",
                      current ? "border-orange/45 shadow-[0_20px_60px_-30px_rgb(255_138_61/0.6)]" : "border-line"
                    )}
                  >
                    <p data-story-part className="flex flex-wrap items-center gap-2">
                      <span className={`${eyebrow} text-sunset font-bold`}>Mission {m.number}</span>
                      <StatusBadge status={m.status} />
                    </p>
                    <h3 data-story-part className="mt-2 font-display text-[2.125rem] text-ink lg:text-5xl">
                      <span>{m.codename}</span>
                    </h3>
                    <p data-story-part className="mt-3 font-semibold text-ink">
                      {m.company} <span className="font-normal text-muted">· {m.role}</span>
                    </p>
                    <p data-story-part className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-sm text-muted">
                      <span>{m.dates}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1">
                        <MapPin aria-hidden="true" className="size-3.5 text-orange" />
                        {districts[m.map.district].name}
                      </span>
                    </p>
                    <p data-story-part className="mt-4 max-w-[62ch] text-ink/85">{m.objective}</p>
                    <div data-story-part>
                      <ChipList items={m.gear} label={`Gear for ${m.codename}`} className="mt-4" />
                    </div>
                    <div data-story-part className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                      <ButtonLink href={`/missions/${m.slug}`}>
                        Start mission <ArrowRight aria-hidden="true" className="size-4" />
                      </ButtonLink>
                      <LocateButton id={m.slug} name={`Mission ${m.number}, ${m.codename}`} />
                      <VisitLink url={m.url} name={m.company} className="text-sm" />
                    </div>
                  </article>
                </li>
              )
            })}
            <li data-story-item className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-4 lg:grid-cols-[3.5rem_minmax(0,1fr)] lg:gap-8">
              <Node number={lockedMission.number} locked />
              <article data-story-card className="rounded-2xl border-2 border-dashed border-ink/20 bg-violet/10 p-5 sm:p-6 lg:p-8">
                <p className="flex flex-wrap items-center gap-2">
                  <span className={`${eyebrow} font-bold text-ink/80`}>Mission {lockedMission.number}</span>
                  <StatusBadge status="LOCKED" />
                </p>
                <h3 className="mt-2 font-display text-[2.125rem] text-ink lg:text-5xl">
                  <span>{lockedMission.codename}</span>
                </h3>
                <p className="mt-3 max-w-[62ch] text-ink/85">{lockedMission.teaser}</p>
                <div className="mt-5">
                  <UnlockButton />
                </div>
              </article>
            </li>
          </ol>
        </div>

        <div className="mt-20 lg:mt-28">
          <h2 className="font-display text-4xl text-ink lg:text-6xl">
            <span>Side missions</span>
          </h2>
          <p className="mt-3 max-w-[60ch] text-ink/80">Client and personal builds.</p>
          <ul data-story-grid className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sideMissions.map((s) => (
              <li key={s.slug}>
                <article className="glow-hover relative flex h-full flex-col rounded-2xl border border-line bg-surface/85 p-5 hover:border-gold/50 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-3 has-[a:focus-visible]:outline-gold">
                  <span aria-hidden="true" className="grid size-8 place-items-center">
                    <span className="size-5 rotate-45 rounded-[4px] border-2 border-gold" />
                  </span>
                  <h3 className="mt-3 font-display text-[1.75rem] text-ink">
                    <Link href={`/missions/${s.slug}`} className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none">
                      <span>{s.name}</span>
                    </Link>
                  </h3>
                  <p className="mt-2 text-base leading-relaxed text-ink/85">{s.objective}</p>
                  <ChipList items={s.tags} label={`${s.name} tags`} className="mt-4" />
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-5">
                    <p aria-hidden="true" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                      Start mission <ArrowRight className="size-4" />
                    </p>
                    <VisitLink url={s.url} name={s.name} className="text-sm text-ink/90 decoration-ink/30 hover:text-gold" />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-20 lg:mt-28">
          <h2 className="font-display text-4xl text-ink lg:text-6xl">
            <span>Tutorials</span>
          </h2>
          <p className="mt-3 max-w-[60ch] text-ink/80">Education, before and alongside the first mission.</p>
          <ul data-story-grid className="mt-8 grid gap-4 sm:grid-cols-2">
            {tutorials.map((t) => (
              <li key={t.slug}>
                <article className="flex h-full gap-4 rounded-2xl border border-[#4fb7c4]/25 bg-teal/25 p-5 sm:p-6">
                  <span aria-hidden="true" className="grid size-11 shrink-0 place-items-center rounded-xl border border-[#4fb7c4]/60 bg-teal text-[#bfe9ee]">
                    <GraduationCap className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <p className={`${eyebrow} text-[#7fd3dc]`}>Tutorial {t.number}</p>
                    <h3 className="mt-1 text-lg leading-snug font-semibold text-ink">{t.degree}</h3>
                    <p className="mt-1 text-ink/85">{t.school}</p>
                    <p className="font-mono text-sm text-muted">{t.dates}</p>
                    <div className="mt-3 -ml-3">
                      <LocateButton id={t.slug} name={`Tutorial ${t.number}`} />
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Door id="mission-list" className="absolute right-4 bottom-[calc(var(--hud-bottom)+0.5rem)] sm:right-6 lg:right-10" />
    </section>
  )
}
