import type { ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Sunset gradient text. Falls back to a readable solid orange where background-clip: text isn't
 * supported, and to the system text colour in forced-colors mode (see .text-sunset in globals.css).
 */
export function GradientText({ as: Tag = "span", children, className }: { as?: ElementType; children: ReactNode; className?: string }) {
  return <Tag className={cn("text-sunset", className)}>{children}</Tag>
}

/** Display title: Martian Mono, condensed and heavy, optionally in the sunset gradient. */
export function DisplayTitle({ as: Tag = "h1", children, className, gradient = true }: { as?: ElementType; children: ReactNode; className?: string; gradient?: boolean }) {
  return (
    <Tag className={cn("font-display", className)}>
      <span className={cn(gradient && "text-sunset")}>{children}</span>
    </Tag>
  )
}
