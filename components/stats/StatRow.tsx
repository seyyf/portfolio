"use client"

import { m } from "framer-motion"

import { segmentsFor, type Skill, type SkillStatus } from "@/data/skills"
import { cn } from "@/lib/utils"

const STATUS_COLOR: Record<SkillStatus, string> = {
  "Daily use": "text-gold",
  Production: "text-orange",
  Experienced: "text-ink/80",
  Native: "text-gold",
  C1: "text-orange",
  B2: "text-ink/80",
}

const SEGMENTS = 5

/**
 * One skill: name, status label and a decorative 5-segment bar. The label carries the meaning; the
 * bar (aria-hidden) mirrors it and fills segment by segment whenever its tab is opened.
 */
export function StatRow({ skill, index, active, reduced }: { skill: Skill; index: number; active: boolean; reduced: boolean }) {
  const lit = segmentsFor[skill.status]
  return (
    <div className="group relative grid gap-x-6 gap-y-2 px-3 py-3.5 transition-colors hover:bg-surface md:grid-cols-[minmax(0,1fr)_auto] md:items-center md:px-4">
      <span aria-hidden="true" className="bg-sunset absolute inset-y-2 left-0 w-1 rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
      <dt className="min-w-0 font-semibold text-ink">{skill.name}</dt>
      <dd className="flex items-center justify-between gap-4 md:justify-end">
        <span className={cn("w-28 font-mono text-[0.8125rem] lowercase md:text-right", STATUS_COLOR[skill.status])}>{skill.status}</span>
        <span aria-hidden="true" className="flex w-40 shrink-0 gap-1 sm:w-48">
          {Array.from({ length: SEGMENTS }, (_, i) => {
            const on = i < lit
            return (
              <span key={i} className="relative h-3 flex-1 -skew-x-[18deg] overflow-hidden rounded-[2px] bg-ink/12">
                {on && (
                  <m.span
                    className="absolute inset-0 origin-left"
                    style={{ backgroundImage: "var(--sunset-h)", backgroundSize: `${SEGMENTS * 100}% 100%`, backgroundPosition: `${(i / (SEGMENTS - 1)) * 100}% 0` }}
                    initial="off"
                    animate={active ? "on" : "off"}
                    variants={{
                      off: { scaleX: 0, opacity: 0, transition: { duration: 0 } },
                      on: {
                        scaleX: 1,
                        opacity: 1,
                        transition: reduced ? { duration: 0 } : { delay: 0.08 + index * 0.05 + i * 0.07, duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                      },
                    }}
                  />
                )}
              </span>
            )
          })}
        </span>
      </dd>
    </div>
  )
}
