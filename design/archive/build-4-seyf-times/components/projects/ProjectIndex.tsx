"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useState } from "react"

import { StoryCard } from "@/components/front/StoryCard"
import { categories, projects, type Category } from "@/data/projects"
import { cn } from "@/lib/utils"

type Filter = Category | "all"

const countFor = (id: Filter) => (id === "all" ? projects.length : projects.filter((p) => p.categories.includes(id)).length)

/** Every project as a story card, filterable by beat. The grid reorders with a layout animation. */
export function ProjectIndex() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState<Filter>("all")
  const visible = active === "all" ? projects : projects.filter((p) => p.categories.includes(active))
  const activeLabel = categories.find((c) => c.id === active)?.label ?? "All"

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div role="group" aria-label="Filter projects by category" className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const pressed = active === c.id
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => setActive(c.id)}
                className={cn(
                  "tag min-h-11 gap-1.5 px-4 transition-colors duration-200",
                  pressed ? "border-ink bg-ink text-paper" : "hover:border-ink hover:bg-paper-2"
                )}
              >
                {c.label}
                <span className="font-mono text-[0.68rem] opacity-60">{countFor(c.id)}</span>
              </button>
            )
          })}
        </div>
        <p className="label text-gray" aria-live="polite">
          {visible.length} {visible.length === 1 ? "story" : "stories"}
          {active !== "all" && <span className="sr-only"> in {activeLabel}</span>}
        </p>
      </div>

      <ul className="relative mt-10 grid gap-y-12 md:grid-cols-2 md:gap-x-12 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((project, i) => (
            <motion.li
              key={project.slug}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
              transition={{ duration: reduce ? 0.15 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <StoryCard project={project} index={i} headingLevel="h2" />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
