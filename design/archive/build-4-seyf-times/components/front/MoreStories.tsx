import Link from "next/link"

import { StoryCard } from "@/components/front/StoryCard"
import { Reveal } from "@/components/shared/Reveal"
import { moreStories } from "@/data/projects"

/** "More Stories": the rest of the projects as a ruled 1/2/3-column grid. */
export function MoreStories() {
  return (
    <section aria-labelledby="more-stories">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <Reveal as="h2" variant="words" id="more-stories" className="font-headline text-3xl font-black tracking-tight sm:text-4xl">
          More Stories
        </Reveal>
        <Link href="/projects" className="label group inline-flex min-h-11 items-center gap-1.5">
          <span className="headline-link">All projects</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ul className="mt-8 grid gap-y-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-3">
        {moreStories.map((project, i) => (
          <li key={project.slug}>
            <StoryCard project={project} index={i} />
          </li>
        ))}
      </ul>
    </section>
  )
}
