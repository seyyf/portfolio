import Image from "next/image"
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import { Badge } from "@/components/ui/badge"
import { container } from "@/components/site/primitives"
import { PLACEHOLDER, projects, type Project } from "@/lib/content"
import { cn } from "@/lib/utils"

function ProjectCard({ project, featured }: { project: Project; featured: boolean }) {
  const hasLink = project.url.length > 0

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-lg bg-canvas p-4 shadow-level-2",
        hasLink && "transition-shadow duration-300 focus-within:shadow-level-4 hover:shadow-level-4"
      )}
    >
      <div
        className={cn(
          "relative flex aspect-video items-center justify-center overflow-hidden rounded-md bg-canvas-soft-2 shadow-level-1",
          featured && "md:aspect-auto md:min-h-[320px] md:flex-1"
        )}
      >
        {project.image ? (
          <Image
            src={project.image}
            alt={`Screenshot of the ${project.name} website`}
            fill
            sizes={featured ? "(min-width: 960px) 660px, 100vw" : "(min-width: 960px) 460px, 100vw"}
            className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <span className="font-mono text-caption text-body">{PLACEHOLDER.screenshot}</span>
        )}
      </div>

      <div className="px-2 pt-5 pb-2">
        <h3 className={cn("text-ink", featured ? "text-display-md" : "text-display-sm")}>{project.name}</h3>
        <p className="mt-2 text-body-sm text-body">{project.description}</p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Badge variant="soft">{project.kind}</Badge>
          {hasLink ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-body-sm font-medium text-link-deep after:absolute after:inset-0 after:rounded-lg hover:text-ink"
            >
              Visit site
              <ArrowUpRightIcon aria-hidden className="size-4" />
              <span className="sr-only">: {project.name} (opens in a new tab)</span>
            </a>
          ) : (
            <span className="font-mono text-caption text-body">{PLACEHOLDER.link}</span>
          )}
        </div>
      </div>
    </article>
  )
}

export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-heading" className="bg-canvas py-16 md:py-24">
      <div className={container}>
        <h2 id="projects-heading" data-reveal className="text-display-lg text-ink">
          Selected projects.
        </h2>
        <ul data-reveal className="mt-12 grid gap-6 md:grid-cols-12 md:grid-rows-2">
          {projects.map((project, i) => (
            <li key={project.name} className={i === 0 ? "md:col-span-7 md:row-span-2" : "md:col-span-5"}>
              <ProjectCard project={project} featured={i === 0} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
