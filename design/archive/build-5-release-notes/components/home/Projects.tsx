"use client"

import { AnimatePresence, m } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

import { projectFilters, projects, type ProjectFilter } from "@/data/projects"
import { cn } from "@/lib/utils"

/** Side releases: project cards, filterable (All, E-commerce, Personal, Client). */
export function Projects() {
  const [filter, setFilter] = useState<ProjectFilter>("All")
  const shown = filter === "All" ? projects : projects.filter((p) => p.tags.includes(filter))

  return (
    <section id="projects" aria-labelledby="projects-title" className="border-t border-border bg-surface/60">
      <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 md:py-28">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 id="projects-title" className="text-3xl font-semibold sm:text-4xl">
              Side releases
            </h2>
            <p className="mt-3 max-w-[56ch] text-muted">Projects shipped outside the main line: client sites, stores and a personal app.</p>
          </div>

          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-2">
            {projectFilters.map((f) => {
              const on = f === filter
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "h-9 rounded-full border px-3.5 text-sm transition-colors",
                    on ? "border-ink bg-ink text-bg" : "border-border bg-surface text-muted hover:border-ink/30 hover:text-ink"
                  )}
                >
                  {f}
                </button>
              )
            })}
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {shown.length} {shown.length === 1 ? "project" : "projects"} shown
        </p>

        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence initial={false} mode="popLayout">
            {shown.map((p) => (
              <m.li
                key={p.slug}
                id={`project-${p.slug}`}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
                className="scroll-mt-28 target:[&>article]:ring-2 target:[&>article]:ring-accent"
              >
                <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]">
                  <div className="border-b border-border bg-bg p-3">
                    <Image
                      src={p.image.src}
                      alt={p.image.alt}
                      width={p.image.width}
                      height={p.image.height}
                      unoptimized
                      loading="lazy"
                      className="dim-at-night h-auto w-full rounded-md"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-xl font-semibold">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0 after:content-['']">
                          {p.name}
                        </a>
                      ) : (
                        p.name
                      )}
                    </h3>
                    <p className="mt-2 flex-1 text-muted">{p.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <ul aria-label="Tags" className="flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <li key={t} className="rounded-md bg-tag-infra-bg px-2 py-0.5 font-mono text-xs text-tag-infra">
                            {t}
                          </li>
                        ))}
                      </ul>
                      {p.url && (
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                          Visit
                          <ArrowUpRight aria-hidden="true" className="size-4" />
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </section>
  )
}
