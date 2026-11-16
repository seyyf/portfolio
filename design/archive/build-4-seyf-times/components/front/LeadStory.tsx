import Link from "next/link"

import { Byline, DropCap } from "@/components/shared/DropCap"
import { Halftone } from "@/components/shared/Halftone"
import { Reveal } from "@/components/shared/Reveal"
import { leadStory } from "@/data/projects"

/** The front page's lead story: the Educaro CRM rebuild. */
export function LeadStory() {
  const role = leadStory.roles[0]
  const href = `/projects/${leadStory.slug}`

  return (
    <article aria-labelledby="lead-headline">
      <p className="kicker">{leadStory.kicker}</p>
      <Reveal
        as="h1"
        variant="words"
        id="lead-headline"
        className="mt-3 font-headline text-[2.25rem] leading-[1.05] font-black tracking-tight sm:text-5xl lg:text-[3.5rem] xl:text-[3.9rem]"
      >
        {leadStory.headline}
      </Reveal>
      <Reveal as="p" className="mt-5 max-w-[60ch] text-xl leading-snug text-ink/80 italic sm:text-[1.4rem]">
        {leadStory.deck}
      </Reveal>
      {role && (
        <Byline className="mt-4">
          By Seyf Mejri · {role.title}, {role.company}
        </Byline>
      )}

      <figure className="mt-7">
        <Halftone
          src={leadStory.hero.src}
          alt={leadStory.hero.alt}
          width={leadStory.hero.width}
          height={leadStory.hero.height}
          sizes="(min-width: 1400px) 900px, (min-width: 1024px) 64vw, 100vw"
          priority
          className="aspect-[16/10]"
        />
        {leadStory.hero.caption && (
          <figcaption className="mt-2 border-b border-rule/30 pb-2 font-sans text-xs text-gray">{leadStory.hero.caption}</figcaption>
        )}
      </figure>

      <div className="prose-news mt-7">
        <DropCap>
          Seyf Mejri led the rebuild of Educaro&apos;s internal CRM from scratch, moving it from AngularJS to React and TypeScript. The
          new system was redesigned mobile-first, resolved the legacy app&apos;s recurring bugs and shipped features the old one
          couldn&apos;t support. It is now used every day across admissions, sales, support, recruiting, finance and teaching.
        </DropCap>
      </div>

      <Link
        href={href}
        className="group mt-6 inline-flex min-h-11 items-center gap-2 font-sans text-sm font-bold tracking-[0.12em] uppercase"
      >
        <span className="headline-link">Read the full story</span>
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </Link>
    </article>
  )
}
