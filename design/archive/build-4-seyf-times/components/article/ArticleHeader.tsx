import { Byline } from "@/components/shared/DropCap"
import { Halftone } from "@/components/shared/Halftone"
import { Reveal } from "@/components/shared/Reveal"
import type { Project } from "@/data/projects"

/** Kicker, headline, deck, byline (one line per role) and the hero image of a project story. */
export function ArticleHeader({ project }: { project: Project }) {
  const roleLine = (r: Project["roles"][number]) => [`${r.title}, ${r.company}`, r.period].filter(Boolean).join(" · ")

  return (
    <header>
      <div className="max-w-4xl">
        <p className="kicker">{project.kicker}</p>
        <Reveal
          as="h1"
          variant="words"
          className="mt-3 font-headline text-[2.25rem] leading-[1.05] font-black tracking-tight sm:text-5xl lg:text-[3.75rem]"
        >
          {project.headline}
        </Reveal>
        <Reveal as="p" className="mt-5 max-w-[60ch] text-xl leading-snug text-ink/80 italic sm:text-[1.4rem]">
          {project.deck}
        </Reveal>
        <div className="mt-5 border-t border-rule/30 pt-3">
          {project.roles.length === 0 ? (
            <Byline>By Seyf Mejri</Byline>
          ) : (
            project.roles.map((r, i) => <Byline key={`${r.company}-${r.title}`}>{i === 0 ? `By Seyf Mejri · ${roleLine(r)}` : roleLine(r)}</Byline>)
          )}
        </div>
      </div>

      <figure className="mt-8">
        <Halftone
          src={project.hero.src}
          alt={project.hero.alt}
          width={project.hero.width}
          height={project.hero.height}
          sizes="(min-width: 1180px) 1100px, 100vw"
          priority
          className="aspect-[16/10]"
        />
        {project.hero.caption && (
          <figcaption className="mt-2 border-b border-rule/30 pb-2 font-sans text-xs text-gray">{project.hero.caption}</figcaption>
        )}
      </figure>
    </header>
  )
}
