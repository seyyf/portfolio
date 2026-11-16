"use client"

import { ArrowRight, GraduationCap, MapPin, X } from "lucide-react"
import { useEffect, useRef } from "react"

import { StatusBadge } from "@/components/map/MissionCard"
import type { MarkerItem } from "@/components/map/markers"
import { ButtonLink } from "@/components/ui/Button"
import { ChipList } from "@/components/ui/Chip"
import { VisitLink } from "@/components/ui/VisitLink"
import { play } from "@/lib/sound"

/**
 * The briefing for a selected marker: objective + "Start mission". A non-modal dialog: a side
 * panel on desktop, a bottom sheet on phones. Focus moves to its title when it opens.
 */
export function Briefing({ m, onClose }: { m: Exclude<MarkerItem, { kind: "locked" }>; onClose: () => void }) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    title.current?.focus({ preventScroll: true })
  }, [m.id])

  const titleId = `briefing-${m.id}`
  const eyebrow = "font-mono text-xs tracking-[0.14em] uppercase"

  return (
    <div role="dialog" aria-modal="false" aria-labelledby={titleId} className="relative">
      <button
        type="button"
        onClick={() => {
          play("click")
          onClose()
        }}
        aria-label="Close briefing (Esc)"
        className="absolute -top-1 -right-1 grid size-11 cursor-pointer place-items-center rounded-lg text-ink/80 transition-colors hover:bg-ink/10 hover:text-gold"
      >
        <X aria-hidden="true" className="size-5" />
      </button>

      {m.kind === "mission" && (
        <>
          <p className={`${eyebrow} flex flex-wrap items-center gap-2 pr-12 text-muted`}>
            <span className="text-sunset font-bold">Mission {m.data.number}</span>
            <StatusBadge status={m.data.status} />
          </p>
          <h2 id={titleId} ref={title} tabIndex={-1} className="mt-2 font-display text-[2.5rem] text-ink outline-none">
            <span className="lean">{m.data.codename}</span>
          </h2>
          <p className="mt-3 font-semibold text-ink">
            {m.data.company} <span className="font-normal text-muted">· {m.data.role}</span>
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 font-mono text-sm text-muted">
            <span>{m.data.dates}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="size-3.5 text-orange" />
              {m.districtName}
            </span>
          </p>
          <h3 className={`${eyebrow} mt-5 text-gold`}>Objective</h3>
          <p className="mt-1.5 text-base leading-relaxed text-ink/90">{m.data.objective}</p>
          <ChipList items={m.data.gear.slice(0, 6)} label="Gear" className="mt-4" />
          <ButtonLink href={`/missions/${m.data.slug}`} onClick={() => play("click")} size="lg" className="mt-6 w-full">
            Start mission <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
          <VisitLink url={m.data.url} name={m.data.company} className="mt-4 text-sm" />
        </>
      )}

      {m.kind === "side" && (
        <>
          <p className={`${eyebrow} pr-12 text-gold`}>Side mission · {m.data.client}</p>
          <h2 id={titleId} ref={title} tabIndex={-1} className="mt-2 font-display text-[2.5rem] text-ink outline-none">
            <span className="lean">{m.data.name}</span>
          </h2>
          <h3 className={`${eyebrow} mt-5 text-gold`}>Objective</h3>
          <p className="mt-1.5 text-base leading-relaxed text-ink/90">{m.data.objective}</p>
          <p className="mt-2 text-base leading-relaxed text-muted">{m.data.description}</p>
          <ChipList items={m.data.tags} label="Tags" className="mt-4" />
          <ButtonLink href={`/missions/${m.data.slug}`} onClick={() => play("click")} size="lg" className="mt-6 w-full">
            Start mission <ArrowRight aria-hidden="true" className="size-4" />
          </ButtonLink>
          <VisitLink url={m.data.url} name={m.data.name} className="mt-4 text-sm" />
        </>
      )}

      {m.kind === "tutorial" && (
        <>
          <p className={`${eyebrow} flex items-center gap-1.5 pr-12 text-[#7fd3dc]`}>
            <GraduationCap aria-hidden="true" className="size-4" /> Tutorial {m.data.number} · Education
          </p>
          <h2 id={titleId} ref={title} tabIndex={-1} className="mt-3 text-2xl leading-snug font-semibold text-ink outline-none">
            {m.data.degree}
          </h2>
          <p className="mt-2 text-ink/90">{m.data.school}</p>
          <p className="font-mono text-sm text-muted">{m.data.dates}</p>
        </>
      )}
    </div>
  )
}
