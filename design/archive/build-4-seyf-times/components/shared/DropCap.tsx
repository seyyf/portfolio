import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Lead paragraph with a drop cap (first letter rendered large in the headline face). */
export function DropCap({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("drop-cap text-[1.125rem] leading-[1.65]", className)}>{children}</p>
}

/** "By Seyf Mejri · Role · Dates" in small caps. */
export function Byline({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("byline text-[0.95rem]", className)}>{children}</p>
}

/**
 * Editor's note for a missing real number. Visible in development only, so the live site never shows
 * placeholder text. Add the metric to data/projects.ts (the `todo` list says which).
 */
export function TodoMetric({ items }: { items: string[] }) {
  if (process.env.NODE_ENV === "production" || items.length === 0) return null
  return (
    <aside className="my-6 border border-dashed border-accent p-4 font-sans text-sm" aria-label="Editor's note (development only)">
      <p className="font-bold text-accent-ink">TODO: add metric (only visible in development)</p>
      <ul className="mt-2 list-disc pl-5">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </aside>
  )
}
