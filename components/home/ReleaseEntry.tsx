import { ArrowRight, GraduationCap } from "lucide-react"
import Link from "next/link"

import { ChangeList } from "@/components/release/ChangeList"
import { ChipList } from "@/components/ui/Chip"
import { Reveal } from "@/components/ui/Reveal"
import { anchorFor, type Release } from "@/data/releases"
import { profile } from "@/data/profile"
import { cn } from "@/lib/utils"

const metaCol = "md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-8"

/** One changelog entry: an upcoming release (call to action), a job, or education (quieter). */
export function ReleaseEntry({ release: r }: { release: Release }) {
  const id = anchorFor(r.version)

  if (r.kind === "upcoming") {
    return (
      <li id={id} className="pb-12">
        <Reveal>
          <Link
            href="/#contact"
            className="group block rounded-[var(--radius-card)] border border-dashed border-ink/25 p-5 transition-[border-color,box-shadow] hover:border-accent hover:shadow-[var(--shadow-hover)] sm:p-7"
          >
            <div className={metaCol}>
              <p className="font-mono text-2xl font-semibold text-muted">{r.version}</p>
              <div className="mt-2 md:mt-0">
                <h3 className="text-2xl font-semibold sm:text-[1.75rem]">{r.title}</h3>
                <p className="mt-2 text-muted">{profile.availability}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-medium text-accent">
                  Plan the next release together
                  <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        </Reveal>
      </li>
    )
  }

  if (r.kind === "education") {
    return (
      <li id={id} className="border-t border-border py-6">
        <Reveal className={metaCol}>
          <p className="font-mono text-lg text-muted">{r.version}</p>
          <div className="mt-1 flex gap-3 md:mt-0">
            <GraduationCap aria-hidden="true" className="mt-1 size-[18px] shrink-0 text-muted" />
            <div>
              <h3 className="text-lg font-medium tracking-tight">{r.degree}</h3>
              <p className="font-mono text-sm text-muted">
                {r.school} · {r.dates}
              </p>
            </div>
          </div>
        </Reveal>
      </li>
    )
  }

  const current = r.version === profile.currentVersion
  return (
    <li id={id} className="border-t border-border py-10 md:py-12">
      <Reveal>
        <article aria-labelledby={`${id}-title`} className={metaCol}>
          <div className="flex items-baseline gap-3 md:block">
            <p className={cn("font-mono text-2xl font-semibold", current ? "text-accent" : "text-ink")}>{r.version}</p>
            <p className="font-mono text-[0.8125rem] text-muted md:mt-1">{r.dates}</p>
            {current && <p className="font-mono text-xs text-tag-improved md:mt-2">current stable</p>}
          </div>
          <div className="mt-3 md:mt-0">
            <h3 id={`${id}-title`} className="text-2xl font-semibold sm:text-[1.75rem]">
              {r.company}
            </h3>
            <p className="mt-1 text-muted">
              {r.role} · {r.location}
            </p>
            <ChangeList changes={r.highlights.map((i) => r.changes[i])} className="mt-5" />
            <ChipList items={r.stack} label={`Stack for ${r.version}`} className="mt-5" />
            <Link href={`/releases/${r.slug}`} className="mt-5 inline-flex items-center gap-1 font-medium text-accent underline-offset-4 hover:underline">
              Read full release notes<span className="sr-only">: {r.version} {r.company}</span> →
            </Link>
          </div>
        </article>
      </Reveal>
    </li>
  )
}
