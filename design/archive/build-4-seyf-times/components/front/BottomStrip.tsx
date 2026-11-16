import Link from "next/link"
import type { ReactNode } from "react"

import { jobs } from "@/data/career"
import { profile } from "@/data/profile"
import { topSkills } from "@/data/skills"
import { cn } from "@/lib/utils"

/** Small seeded PRNG so each skill always gets the same (decorative) sparkline. */
function seeded(name: string) {
  let h = 2166136261
  for (let i = 0; i < name.length; i++) h = Math.imul(h ^ name.charCodeAt(i), 16777619)
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Decorative rising line, deterministic per name. */
function Sparkline({ seed }: { seed: string }) {
  const rand = seeded(seed)
  const n = 10
  const points = Array.from({ length: n }, (_, i) => {
    const trend = 17 - (i / (n - 1)) * 13
    const y = Math.min(19, Math.max(1, trend + (rand() - 0.5) * 7))
    return `${((i / (n - 1)) * 62 + 1).toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox="0 0 64 20" className="h-5 w-16 shrink-0 text-market" aria-hidden="true">
      <polyline points={points.join(" ")} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Column({ id, title, children, more, className }: { id: string; title: string; children: ReactNode; more: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} className={cn("relative flex flex-col", className)}>
      <h2 id={id} className="border-b border-rule pb-2 font-headline text-2xl font-black tracking-tight">
        {title}
      </h2>
      <div className="flex-1">{children}</div>
      <div className="mt-5">{more}</div>
    </section>
  )
}

function More({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="label group inline-flex min-h-11 items-center gap-1.5">
      <span className="headline-link">{children}</span>
      <span aria-hidden="true">→</span>
    </Link>
  )
}

const columnRule = "md:before:absolute md:before:inset-y-0 md:before:-left-6 md:before:w-px md:before:bg-rule/30"

/** Bottom band of the front page: Markets (skills), From the Archive (career), Classifieds (contact). */
export function BottomStrip() {
  const latest = jobs.slice(0, 2)

  return (
    <div className="grid gap-12 md:grid-cols-3 md:gap-x-12">
      <Column id="strip-markets" title="Markets" more={<More href="/skills">Full market report</More>}>
        <ul className="mt-1">
          {topSkills.map((skill) => (
            <li key={skill.name} className="flex items-center gap-3 border-b border-rule/20 py-2.5">
              <span className="min-w-0 flex-1 font-sans text-sm font-semibold">{skill.name}</span>
              <Sparkline seed={skill.name} />
              <span className="shrink-0 font-mono text-xs text-ink/80">
                <span aria-hidden="true" className="text-market">▲ </span>
                in {skill.roles} {skill.roles === 1 ? "role" : "roles"}
              </span>
            </li>
          ))}
        </ul>
      </Column>

      <Column id="strip-archive" title="From the Archive" className={columnRule} more={<More href="/career">Browse the archive</More>}>
        <ul>
          {latest.map((job) => (
            <li key={job.company} className="border-b border-rule/20 py-4">
              <p className="label text-gray">
                {job.start} – {job.end}
              </p>
              <h3 className="mt-1 font-headline text-xl leading-snug font-bold">
                {job.role}, {job.company}
              </h3>
              <p className="mt-1.5 leading-snug text-ink/80">{job.stories[0]}</p>
            </li>
          ))}
        </ul>
      </Column>

      <Column id="strip-classifieds" title="Classifieds" className={columnRule} more={<More href="/contact">Reply to this ad</More>}>
        <div className="mt-4 border border-dashed border-rule p-5">
          <p className="label">Situation wanted</p>
          <p className="mt-2 leading-snug">
            {profile.title}, {profile.yearsExperience} years of experience with React, Next.js and Node.js. Based in {profile.city}.
            Open to new opportunities.
          </p>
          <p className="mt-3 font-sans text-sm">
            Write to{" "}
            <a href={`mailto:${profile.email}`} className="font-semibold break-all underline decoration-accent decoration-2 underline-offset-4">
              {profile.email}
            </a>
          </p>
        </div>
      </Column>
    </div>
  )
}
