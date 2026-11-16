import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * A mission page section: a mono index + Anton heading (sticky on the left on desktop), content on
 * the right. `id` must be unique per page (prefix it with the slug: hidden routes stay in the DOM).
 */
export function Section({ id, index, title, children, className }: { id: string; index: number; title: string; children: ReactNode; className?: string }) {
  return (
    <section aria-labelledby={id} data-mm-section className={cn("border-t border-line py-10 md:py-14 lg:grid lg:grid-cols-[12rem_minmax(0,1fr)] lg:gap-12", className)}>
      <div className="lg:sticky lg:top-[calc(var(--hud-top)+1.5rem)] lg:self-start">
        <p aria-hidden="true" data-mm-index className="font-mono text-xs tracking-[0.2em] text-muted">
          {String(index).padStart(2, "0")}
        </p>
        <h2 id={id} data-mm-heading className="mt-1 font-display text-[2rem] text-ink md:text-[2.5rem]">
          <span className="lean">{title}</span>
        </h2>
      </div>
      <div data-mm-body className="mt-5 min-w-0 lg:mt-0">{children}</div>
    </section>
  )
}

/** The objective: one sentence, big, right under the header. */
export function Objective({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} data-mm-objective className="relative py-8 pl-5 md:py-12 md:pl-7">
      <span aria-hidden="true" data-mm-bar className="absolute top-8 bottom-8 left-0 w-1 -skew-y-[10deg] bg-sunset md:top-12 md:bottom-12 md:w-1.5" />
      <h2 id={id} className="font-mono text-xs tracking-[0.22em] text-gold uppercase">
        Objective
      </h2>
      <p data-mm-objtext className="mt-2 max-w-[40ch] text-[1.375rem] leading-snug font-semibold text-ink md:text-[1.875rem]">{children}</p>
    </section>
  )
}

/** Briefing bullets with slanted sunset markers. */
export function Briefing({ items }: { items: string[] }) {
  return (
    <ul className="grid max-w-[68ch] gap-4">
      {items.map((b) => (
        <li key={b} data-mm-bullet className="relative pl-8">
          <span aria-hidden="true" data-mm-marker className="absolute top-[0.6em] left-0 h-2 w-4 -skew-x-[24deg] bg-sunset" />
          {b}
        </li>
      ))}
    </ul>
  )
}
