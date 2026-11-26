import { Check } from "lucide-react"
import type { ReactNode } from "react"

import { Palm } from "@/components/ui/Palm"
import { VisitLink } from "@/components/ui/VisitLink"
import type { Mission, SideMission } from "@/data/missions"
import { cn } from "@/lib/utils"

/**
 * The establishing shot: kicker, status, the title in Martian Mono, then who /
 * when. Behind it (decorative): a dusk glow, the mission number in outline, a striped sun setting
 * on a slanted horizon and two palms. Text never sits on the sun.
 */
function Shell({ ghost, children }: { ghost: string; children: ReactNode }) {
  return (
    <header data-mm-header className="relative isolate mt-[calc(var(--hud-top)*-1)] overflow-hidden bg-surface [clip-path:polygon(0_0,100%_0,100%_100%,0_calc(100%-3rem))] md:[clip-path:polygon(0_0,100%_0,100%_100%,0_calc(100%-5rem))]">
      <div aria-hidden="true" data-mm-bg className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(70%_90%_at_88%_0%,rgb(255_92_147/0.08),transparent_70%),linear-gradient(180deg,#0e1b2b,#15263a)]" />
        <span data-mm-ghost className="absolute top-[calc(var(--hud-top)+0.5rem)] -right-3 font-display text-[11rem] leading-none text-transparent [-webkit-text-stroke:2px_rgb(238_242_245/0.07)] md:-right-6 md:text-[20rem]">
          {ghost}
        </span>
        {/* Striped sun, half below the horizon. */}
        <div data-mm-sun className="absolute right-[6%] bottom-0 size-36 translate-y-[30%] rounded-full bg-gold opacity-90 [mask-image:linear-gradient(#000_52%,transparent_52%,transparent_58%,#000_58%,#000_66%,transparent_66%,transparent_71%,#000_71%,#000_78%,transparent_78%,transparent_82%,#000_82%)] md:right-[10%] md:size-72" />
        <Palm className="absolute right-[2%] bottom-0 h-40 w-auto text-bg md:right-[6%] md:h-80" lean={0.9} />
        <Palm className="absolute right-[24%] bottom-0 h-24 w-auto text-bg/90 md:right-[28%] md:h-48" lean={-0.7} />
        <div className="absolute inset-x-0 bottom-0 h-px bg-pink opacity-60" />
      </div>
      <div data-mm-headtext className="mx-auto max-w-[1120px] px-4 pt-[calc(var(--hud-top)+2rem)] pb-36 sm:px-6 md:pt-[calc(var(--hud-top)+3.5rem)] md:pb-44 lg:pb-48">{children}</div>
    </header>
  )
}

function Kicker({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <p className="font-mono text-sm text-pink lowercase">{label}</p>
      {children}
    </div>
  )
}

function Title({ children }: { children: ReactNode }) {
  return (
    <h1 className="mt-3 max-w-[14ch] font-display text-[clamp(3.25rem,15vw,8.5rem)] text-ink">
      {children}
    </h1>
  )
}

export function StatusBadge({ status }: { status: Mission["status"] }) {
  const done = status === "COMPLETED"
  return (
    <p
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs lowercase",
        done ? "border-green/50 bg-green/10 text-green" : "border-gold/60 bg-gold/10 text-gold"
      )}
    >
      {done ? (
        <Check aria-hidden="true" className="size-3.5" />
      ) : (
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-gold opacity-70" />
          <span className="relative size-2 rounded-full bg-gold" />
        </span>
      )}
      <span className="sr-only">Status: </span>
      {status}
    </p>
  )
}

export function MissionHeader({ mission }: { mission: Mission }) {
  return (
    <Shell ghost={mission.number}>
      <Kicker label={`MISSION ${mission.number}`}>
        <StatusBadge status={mission.status} />
      </Kicker>
      <Title>{mission.codename}</Title>
      <p className="mt-5 text-lg font-semibold text-ink md:text-xl">
        {mission.company} <span aria-hidden="true" className="text-muted">·</span> {mission.role}
      </p>
      <p className="mt-1 font-mono text-sm text-ink/75">
        {mission.dates} <span aria-hidden="true">·</span> {mission.location}
      </p>
      <VisitLink url={mission.url} name={mission.company} className="mt-4" />
    </Shell>
  )
}

export function SideMissionHeader({ mission }: { mission: SideMission }) {
  return (
    <Shell ghost="SM">
      <Kicker label="SIDE MISSION">
        <p className="rounded-md border border-ink/25 px-2 py-0.5 font-mono text-xs text-ink/85">{mission.client.toUpperCase()}</p>
      </Kicker>
      <Title>{mission.name}</Title>
      <ul aria-label="Tags" className="mt-5 flex flex-wrap gap-2">
        {mission.tags.map((t) => (
          <li key={t} className="rounded-full border border-ink/20 bg-bg/50 px-3 py-0.5 text-sm text-ink/90">
            {t}
          </li>
        ))}
      </ul>
      <VisitLink url={mission.url} name={mission.name} className="mt-4" />
    </Shell>
  )
}
