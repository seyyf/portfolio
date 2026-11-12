import { ArrowUpIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { container } from "@/components/site/primitives"
import { experience } from "@/lib/content"
import { cn } from "@/lib/utils"

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="bg-canvas-soft py-16 md:py-24">
      <div className={container}>
        <h2 id="experience-heading" data-reveal className="text-display-lg text-ink">
          Experience.
        </h2>

        <ol className="mt-12">
          {experience.map((job, i) => {
            const isLast = i === experience.length - 1
            return (
              <li key={`${job.company}-${job.start}`} data-reveal className="grid gap-3 md:grid-cols-12 md:gap-6">
                <div className="md:col-span-3 md:pt-1">
                  <p className="text-body-sm font-medium text-ink tabular-nums">
                    {job.start} - {job.end}
                  </p>
                  <p className="text-body-sm text-body">{job.location}</p>
                </div>

                <div
                  className={cn(
                    "relative border-l border-hairline-strong pl-6 md:col-span-9",
                    isLast ? "pb-0" : "pb-12"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-[9px] -left-[6px] size-[11px] rounded-full",
                      job.current ? "bg-ink" : "border border-hairline-strong bg-canvas-soft"
                    )}
                  />
                  <h3 className="text-display-sm text-ink">
                    {job.role} <span className="text-body">at {job.company}</span>
                    {job.current && <span className="sr-only"> (current role)</span>}
                  </h3>
                  <ul className="mt-3 max-w-[690px] space-y-2">
                    {job.points.map((point) => (
                      <li
                        key={point}
                        className="relative pl-4 text-body-md text-body before:absolute before:top-[11px] before:left-0 before:h-px before:w-1.5 before:bg-hairline-strong"
                      >
                        {point}
                      </li>
                    ))}
                  </ul>
                  {job.caseStudyLink && (
                    <a
                      href="#case-study"
                      className="mt-3 inline-flex items-center gap-1 text-body-md text-link-deep underline underline-offset-4 transition-colors hover:text-ink"
                    >
                      Read the case study
                      <ArrowUpIcon aria-hidden className="size-4" />
                    </a>
                  )}
                  <ul aria-label={`Tech stack at ${job.company}`} className="mt-4 flex flex-wrap gap-2">
                    {job.stack.map((tech) => (
                      <li key={tech}>
                        <Badge translate="no">{tech}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
