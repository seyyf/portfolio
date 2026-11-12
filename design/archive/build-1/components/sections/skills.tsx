import type { ReactNode } from "react"

import { container } from "@/components/site/primitives"
import { skills } from "@/lib/content"
import { cn } from "@/lib/utils"

function Pills({ items, inverse = false }: { items: string[]; inverse?: boolean }) {
  return (
    <ul translate="no" className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className={cn(
            "inline-flex h-8 items-center rounded-full px-3 text-body-sm",
            inverse ? "border border-body text-on-primary" : "bg-canvas-soft text-ink shadow-level-1"
          )}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}

function SkillCard({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  return (
    <li className={cn("rounded-lg bg-canvas p-6 shadow-level-1", className)}>
      <h3 className="mb-4 font-mono text-caption text-body">{title}</h3>
      {children}
    </li>
  )
}

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="bg-canvas-soft py-16 md:py-24">
      <div className={container}>
        <h2 id="skills-heading" data-reveal className="text-display-lg text-ink">
          Skills.
        </h2>
        <ul data-reveal className="mt-12 grid gap-6 md:grid-cols-12">
          <li className="rounded-lg bg-ink p-6 text-on-primary sm:p-8 md:col-span-7">
            <h3 className="mb-4 font-mono text-caption text-hairline-strong">Frontend</h3>
            <Pills items={skills.frontend} inverse />
          </li>
          <SkillCard title="Backend" className="md:col-span-5">
            <Pills items={skills.backend} />
          </SkillCard>
          <SkillCard title="Databases" className="md:col-span-3">
            <Pills items={skills.databases} />
          </SkillCard>
          <SkillCard title="DevOps" className="md:col-span-3">
            <Pills items={skills.devops} />
          </SkillCard>
          <SkillCard title="Tools" className="md:col-span-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {skills.tools.map((group) => (
                <div key={group.label}>
                  <p className="mb-3 text-body-sm font-medium text-ink">{group.label}</p>
                  <Pills items={group.items} />
                </div>
              ))}
            </div>
          </SkillCard>
        </ul>
      </div>
    </section>
  )
}
