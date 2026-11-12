"use client"

import { Info } from "lucide-react"
import { useState, type ReactNode } from "react"

import { AboutSheet } from "@/components/shared/AboutSheet"
import type { ProjectId } from "@/data/projects"
import { cn } from "@/lib/utils"

type AppScreenProps = {
  /** Large title at the top of the app. Rendered as the app's <h1>. */
  title: string
  /** Small line under the title (role, dates, subtitle). */
  subtitle?: string
  /** Shows the "About this project" button and sheet. */
  project?: ProjectId
  /** Extra buttons in the title row (right side). */
  actions?: ReactNode
  /** Set false when the app manages its own scrolling (e.g. a full-screen chat). */
  scroll?: boolean
  className?: string
  children: ReactNode
}

/**
 * Standard app layout inside the phone: clears the status bar and the home indicator, large title,
 * optional About sheet, and a natively scrolling, overscroll-contained body.
 */
export function AppScreen({ title, subtitle, project, actions, scroll = true, className, children }: AppScreenProps) {
  const [about, setAbout] = useState(false)
  return (
    <div className="relative flex h-full flex-col bg-bg text-text">
      {/* Frosted strip behind the status bar, so content scrolling up never shows through the clock and pill. */}
      <div
        aria-hidden="true"
        className="glass-strong pointer-events-none absolute inset-x-0 top-0 z-30 h-[calc(var(--status-h)+env(safe-area-inset-top))] [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
      />
      <div
        className={cn(
          "min-h-0 flex-1 pt-[calc(var(--status-h)+env(safe-area-inset-top))] pb-[calc(var(--home-h)+env(safe-area-inset-bottom)+12px)]",
          scroll ? "app-scroll" : "flex flex-col overflow-hidden",
          className
        )}
      >
        <header className="flex shrink-0 items-end justify-between gap-3 px-5 pt-3 pb-3">
          <div className="min-w-0">
            <h1 className="font-display text-[1.9rem] leading-tight font-semibold">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm font-medium text-text-soft">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            {project && (
              <button
                type="button"
                onClick={() => setAbout(true)}
                className="grid size-11 place-items-center rounded-full bg-surface-2 text-text transition-transform active:scale-90"
                aria-label="About this project"
              >
                <Info size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        </header>
        {children}
      </div>
      {project && <AboutSheet project={project} open={about} onOpenChange={setAbout} />}
    </div>
  )
}
