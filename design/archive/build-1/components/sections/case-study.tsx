import type { ReactNode } from "react"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { container } from "@/components/site/primitives"
import { caseStudy } from "@/lib/content"

function StoryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div data-reveal className="grid gap-3 border-t border-body py-8 md:grid-cols-12 md:gap-6">
      <h3 className="font-mono text-caption text-hairline-strong md:col-span-3 md:pt-1.5">{label}</h3>
      <div className="md:col-span-9">{children}</div>
    </div>
  )
}

export function CaseStudy() {
  const { migration, stats, actions } = caseStudy

  return (
    <section
      id="case-study"
      aria-labelledby="case-study-heading"
      className="bg-ink py-16 text-on-primary md:py-24"
    >
      <div className={container}>
        <div data-reveal className="max-w-[894px]">
          <h2 id="case-study-heading" className="text-display-lg">
            {caseStudy.heading}
          </h2>
          <p className="mt-4 max-w-[690px] text-body-lg text-hairline-strong">{caseStudy.lead}</p>
        </div>

        <div
          data-reveal
          className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-body py-8 md:mt-16 md:grid-cols-12"
        >
          <div className="col-span-2 md:col-span-6">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-display-md sm:text-display-lg">
              <span className="text-hairline-strong">{migration.from}</span>
              <ArrowRightIcon aria-hidden className="size-6 text-hairline-strong sm:size-7" />
              <span className="sr-only">migrated to</span>
              <span>{migration.to}</span>
            </p>
            <p className="mt-2 font-mono text-caption text-hairline-strong">{migration.caption}</p>
          </div>
          {stats.map((stat) => (
            <div key={stat.label} className="md:col-span-3">
              <p className="text-display-xl">{stat.value}</p>
              <p className="mt-2 text-body-sm text-hairline-strong">{stat.label}</p>
            </div>
          ))}
        </div>

        <div>
          <StoryRow label="Problem">
            <p className="max-w-[690px] text-body-lg">{caseStudy.problem}</p>
          </StoryRow>
          <StoryRow label="What I did">
            <ul className="grid gap-6 sm:grid-cols-2">
              {actions.map((action, i) => (
                <li key={action.title} className={i === actions.length - 1 ? "sm:col-span-2" : undefined}>
                  <p className="text-body-md font-medium">{action.title}</p>
                  <p className="mt-1 max-w-[560px] text-body-md text-hairline-strong">{action.body}</p>
                </li>
              ))}
            </ul>
          </StoryRow>
          <StoryRow label="Result">
            <p className="max-w-[690px] text-body-lg">{caseStudy.result}</p>
            <ul aria-label="Tech stack" className="mt-6 flex flex-wrap gap-2">
              {caseStudy.stack.map((tech) => (
                <li key={tech}>
                  <Badge variant="inverse" translate="no">{tech}</Badge>
                </li>
              ))}
            </ul>
          </StoryRow>
        </div>
      </div>
    </section>
  )
}
