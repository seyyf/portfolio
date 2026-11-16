import Link from "next/link"

import { Halftone } from "@/components/shared/Halftone"
import type { Project } from "@/data/projects"
import { cn } from "@/lib/utils"

type StoryCardProps = {
  project: Project
  /** Position in the grid: draws the vertical column rule left of every card that isn't first in its row. */
  index?: number
  /** Heading level of the headline (h3 under a "More Stories" h2, h2 on the Projects page). */
  headingLevel?: "h2" | "h3"
  className?: string
}

// Column rules sit in the middle of the 3rem grid gap (md: 2 columns, lg: 3 columns).
const RULE =
  "before:absolute before:inset-y-0 before:-left-6 before:hidden before:w-px before:bg-rule/30"
const mdRule = ["", "md:before:block"]
const lgRule = ["lg:before:hidden", "lg:before:block", "lg:before:block"]

/** A front-page story: the whole card is one link; the image turns to colour and the card lifts on hover. */
export function StoryCard({ project, index = 0, headingLevel: Heading = "h3", className }: StoryCardProps) {
  const tags = project.stack.slice(0, 4)

  return (
    // CSS hover lift (no animation library needed on the front page).
    <article
      className={cn(
        "relative h-full border-t border-rule pt-5 transition-transform duration-300 ease-[var(--ease-ink)] hover:-translate-y-[3px] motion-reduce:hover:translate-y-0",
        RULE,
        mdRule[index % 2],
        lgRule[index % 3],
        className
      )}
    >
      <Link href={`/projects/${project.slug}`} className="halftone-trigger group block">
        <Halftone
          src={project.hero.src}
          alt={project.hero.alt}
          width={project.hero.width}
          height={project.hero.height}
          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
          className="aspect-[16/10] transition-shadow duration-300 group-hover:shadow-[0_18px_32px_-20px_rgba(0,0,0,0.55)] group-focus-visible:shadow-[0_18px_32px_-20px_rgba(0,0,0,0.55)]"
        />
        <p className="kicker mt-4">{project.kicker}</p>
        <Heading className="mt-2 font-headline text-[1.4rem] leading-[1.18] font-bold sm:text-[1.5rem]">
          <span className="headline-link">{project.headline}</span>
        </Heading>
        <p className="mt-2 line-clamp-2 text-[1.0625rem] leading-snug text-ink/80">{project.summary}</p>
        {tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Stack">
            {tags.map((s) => (
              <li key={s} className="tag">
                {s}
              </li>
            ))}
          </ul>
        )}
      </Link>
    </article>
  )
}
