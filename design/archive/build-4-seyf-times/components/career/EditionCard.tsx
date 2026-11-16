import Link from "next/link"

import type { Job } from "@/data/career"
import { paper } from "@/data/profile"
import { cn } from "@/lib/utils"

type EditionCardProps = {
  job: Job
  /** Edition number, counted from the first job (oldest = No. 1). */
  edition: number
  className?: string
}

/**
 * One past job as a small front page: a mini masthead with the date range as the edition date, the
 * company as the section label, the role as the headline, the job's stories and its stack.
 */
export function EditionCard({ job, edition, className }: EditionCardProps) {
  const dates = `${job.start} – ${job.end}`
  return (
    <article
      className={cn(
        "border border-ink/25 bg-paper-2 px-5 py-5 shadow-[0_1px_0_color-mix(in_srgb,var(--ink)_12%,transparent),0_10px_24px_-18px_color-mix(in_srgb,var(--ink)_45%,transparent)] sm:px-7 sm:py-6",
        className
      )}
    >
      {/* Mini masthead */}
      <header className="text-center">
        <p className="font-headline text-[1.05rem] leading-none font-bold tracking-tight sm:text-[1.2rem]" aria-hidden="true">
          {paper.name}
        </p>
        <div className="rule-thin mt-2.5" aria-hidden="true" />
        <p className="label flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-1.5 text-ink/75">
          <span>No. {edition}</span>
          <span className="text-ink">
            <span className="sr-only">Edition dated </span>
            {dates}
          </span>
          <span>{job.location}</span>
        </p>
        <div className="rule-double" aria-hidden="true" />
      </header>

      <h2 className="mt-4 font-headline text-[1.6rem] leading-tight font-bold sm:text-[2rem]">
        <span className="kicker mb-1.5 block font-sans">{job.company}</span>
        {job.role}
      </h2>

      <ul className="mt-3 space-y-2.5">
        {job.stories.slice(0, 3).map((story) => (
          <li key={story} className="relative pl-5 text-[1.0625rem] leading-[1.6]">
            <span aria-hidden="true" className="absolute top-[0.62em] left-0 size-1.5 bg-accent" />
            {story}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-col gap-4 border-t border-ink/20 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <ul className="flex flex-wrap gap-1.5" aria-label={`Stack at ${job.company}`}>
          {job.stack.map((s) => (
            <li key={s} className="tag">
              {s}
            </li>
          ))}
        </ul>
        {job.slug ? (
          <Link
            href={`/projects/${job.slug}`}
            className="label shrink-0 self-start text-ink hover:text-accent-ink sm:self-auto"
            aria-label={`Read the story: ${job.role} at ${job.company}`}
          >
            <span className="headline-link">Read the story</span> <span aria-hidden="true">→</span>
          </Link>
        ) : null}
      </div>
    </article>
  )
}
