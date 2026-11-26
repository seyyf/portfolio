import { ArrowLeft, ArrowRight, Map as MapIcon } from "lucide-react"
import Link from "next/link"

import { LockedNext } from "@/components/mission/LockedNext"
import { lockedMission, missions, sideMissions, type Mission, type SideMission } from "@/data/missions"
import { cn } from "@/lib/utils"

type Item = { href: string; kicker: string; title: string }

const navCardClass =
  "glow-hover cut-br group relative flex min-h-28 flex-col justify-center gap-1 rounded-xl border border-ink/12 bg-surface px-5 py-4 transition-colors hover:border-orange/60"

function NavCard({ item, dir }: { item: Item; dir: "prev" | "next" }) {
  const Arrow = dir === "prev" ? ArrowLeft : ArrowRight
  return (
    <Link href={item.href} rel={dir} className={cn(navCardClass, dir === "next" && "sm:items-end sm:text-right")}>
      <span className="flex items-center gap-2 font-mono text-xs text-muted lowercase">
        {dir === "prev" && <Arrow aria-hidden="true" className="size-4 transition-transform group-hover:-translate-x-1" />}
        {dir === "prev" ? "Previous" : "Next"} · {item.kicker}
        {dir === "next" && <Arrow aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1" />}
      </span>
      <span className="font-display text-[1.75rem] text-ink md:text-[2rem]">
        <span>{item.title}</span>
      </span>
    </Link>
  )
}

const asMain = (m: Mission): Item => ({ href: `/missions/${m.slug}`, kicker: `Mission ${m.number}`, title: m.codename })
const asSide = (m: SideMission): Item => ({ href: `/missions/${m.slug}`, kicker: "Side mission", title: m.name })

/** Neighbours in story order (main missions) or among the side missions. */
export function neighbours(page: Mission | SideMission): { prev?: Item; next?: Item } {
  if (page.kind === "mission") {
    const i = missions.findIndex((m) => m.slug === page.slug)
    return { prev: missions[i - 1] && asMain(missions[i - 1]), next: missions[i + 1] && asMain(missions[i + 1]) }
  }
  const i = sideMissions.findIndex((m) => m.slug === page.slug)
  return { prev: sideMissions[i - 1] && asSide(sideMissions[i - 1]), next: sideMissions[i + 1] && asSide(sideMissions[i + 1]) }
}

/**
 * Previous / next. After the last main mission comes Mission 06, locked: it opens the phone on
 * Messages. Always ends with a way back to the map.
 */
export function MissionNav({ page }: { page: Mission | SideMission }) {
  const { prev, next } = neighbours(page)
  const lastMain = page.kind === "mission" && !next
  return (
    <nav aria-label={page.kind === "mission" ? "Missions" : "Side missions"} className="border-t border-line pt-10 md:pt-14">
      <div className="grid gap-3 sm:grid-cols-2">
        {prev ? <NavCard item={prev} dir="prev" /> : <span className="hidden sm:block" />}
        {next ? (
          <NavCard item={next} dir="next" />
        ) : lastMain ? (
          <LockedNext number={lockedMission.number} codename={lockedMission.codename} teaser={lockedMission.teaser} />
        ) : null}
      </div>
      <Link
        href="/#missions"
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg font-mono text-sm text-ink/85 lowercase transition-colors hover:text-blue"
      >
        <MapIcon aria-hidden="true" className="size-4" />
        Back to the map
      </Link>
    </nav>
  )
}
