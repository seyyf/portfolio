import { ArrowUpRight } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { ArticleHeader } from "@/components/article/ArticleHeader"
import { Gallery } from "@/components/article/Gallery"
import { PullQuote } from "@/components/article/PullQuote"
import { SwipeDemo } from "@/components/article/SwipeDemo"
import { BeforeAfterSlider } from "@/components/shared/BeforeAfterSlider"
import { DropCap, TodoMetric } from "@/components/shared/DropCap"
import { PageTransition } from "@/components/shared/PageTransition"
import { Reveal } from "@/components/shared/Reveal"
import { Rule } from "@/components/shared/Rule"
import { paper } from "@/data/profile"
import { projects, type Project } from "@/data/projects"

const findIndex = (slug: string) => projects.findIndex((p) => p.slug === slug)

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params
  const project = projects[findIndex(slug)]
  if (!project) return { title: "Story not found" }
  const url = `/projects/${project.slug}`
  return {
    title: project.headline,
    description: project.deck,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      siteName: paper.name,
      title: project.headline,
      description: project.deck,
      url,
      authors: ["Seyf Mejri"],
    },
  }
}

const h2 = "font-headline text-2xl font-black tracking-tight break-after-avoid sm:text-[1.7rem]"

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="mt-10 first:mt-0">
      <h2 id={id} className={h2}>
        {title}
      </h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  )
}

function Points({ items }: { items: string[] }) {
  if (items.length === 0) return null
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="relative pl-5 before:absolute before:top-[0.7em] before:left-0 before:size-1.5 before:bg-accent">
          {t}
        </li>
      ))}
    </ul>
  )
}

/** The story body: The Problem, What I Built, The Result. Empty sections are skipped, never padded. */
function Body({ project }: { project: Project }) {
  const { problem, built, result } = project
  const leadIsProblem = problem.length > 0
  const length = [...problem, ...built, ...result].join(" ").length
  // Two newspaper columns only when there is enough copy to fill them.
  const twoColumns = length > 700

  return (
    <div
      className={
        twoColumns
          ? "lg:columns-2 lg:gap-12 lg:[column-rule:1px_solid_color-mix(in_srgb,var(--rule)_30%,transparent)]"
          : "max-w-[68ch]"
      }
    >
      {leadIsProblem && (
        <Section id="the-problem" title="The Problem">
          {problem.map((t, i) => (i === 0 ? <DropCap key={t}>{t}</DropCap> : <p key={t}>{t}</p>))}
        </Section>
      )}
      {built.length > 0 && (
        <Section id="what-i-built" title="What I Built">
          {leadIsProblem ? (
            <Points items={built} />
          ) : (
            <>
              <DropCap>{built[0]}</DropCap>
              <Points items={built.slice(1)} />
            </>
          )}
        </Section>
      )}
      {result.length > 0 && (
        <Section id="the-result" title="The Result">
          {result.map((t) => (
            <p key={t}>{t}</p>
          ))}
        </Section>
      )}
    </div>
  )
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params
  const index = findIndex(slug)
  if (index === -1) notFound()

  const project = projects[index]
  const prev = projects[(index - 1 + projects.length) % projects.length]
  const next = projects[(index + 1) % projects.length]
  const [before, after, ...restGallery] = project.gallery
  const hasBeforeAfter = project.extra === "beforeAfter" && Boolean(before && after)
  const gallery = hasBeforeAfter ? restGallery : project.gallery

  return (
    <PageTransition>
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-8 pb-16 sm:px-6 lg:pt-12 lg:pb-24">
        <article className="mx-auto max-w-[1100px]">
          <ArticleHeader project={project} />

          <div className="mt-10 text-[1.125rem] leading-[1.7] lg:mt-12">
            <Body project={project} />
            <TodoMetric items={project.todo} />
          </div>

          <PullQuote quote={project.pullQuote} className="my-14 lg:my-16" />

          {hasBeforeAfter && (
            <section aria-labelledby="before-and-after" className="mt-14">
              <Reveal as="h2" variant="words" id="before-and-after" className={`${h2} border-b border-rule pb-2`}>
                Before and after
              </Reveal>
              <BeforeAfterSlider before={before} after={after} beforeLabel="Old system" afterLabel="New system" className="mt-6" />
              <p className="mt-2 font-sans text-xs text-gray">
                {[before.caption, after.caption].filter(Boolean).join(" ")}
              </p>
            </section>
          )}

          {project.extra === "swipe" && (
            <div className="mt-14">
              <SwipeDemo />
            </div>
          )}

          <Gallery images={gallery} className="mt-14" />

          {project.stack.length > 0 && (
            <section aria-labelledby="under-the-hood" className="mt-14">
              <h2 id="under-the-hood" className={`${h2} border-b border-rule pb-2`}>
                Under the Hood
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tech stack">
                {project.stack.map((s) => (
                  <li key={s} className="tag">
                    {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.url && (
            <p className="mt-10">
              <a href={project.url} target="_blank" rel="noopener noreferrer" className="btn-ink">
                Visit the live site
                <ArrowUpRight size={16} aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </p>
          )}

          <Rule double className="mt-16" />
          <nav aria-label="More stories" className="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-12">
            <Link href={`/projects/${prev.slug}`} rel="prev" className="group block">
              <span className="label text-gray">← Previous story</span>
              <span className="mt-2 block font-headline text-xl leading-snug font-bold">
                <span className="headline-link">{prev.headline}</span>
              </span>
            </Link>
            <Link href={`/projects/${next.slug}`} rel="next" className="group block sm:text-right">
              <span className="label text-gray">Next story →</span>
              <span className="mt-2 block font-headline text-xl leading-snug font-bold">
                <span className="headline-link">{next.headline}</span>
              </span>
            </Link>
          </nav>
        </article>
      </div>
    </PageTransition>
  )
}
