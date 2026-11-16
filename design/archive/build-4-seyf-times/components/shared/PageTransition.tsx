import { ViewTransition, type ReactNode } from "react"

/**
 * Quick page turn between sections (< 500ms). React's <ViewTransition> runs it during route
 * navigations with the browser's View Transitions API; browsers without it simply switch pages.
 * Wrap each page's content (not the layout: layouts persist, so enter/exit never fire there).
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-turn" exit="page-turn" default="none">
      {children}
    </ViewTransition>
  )
}
