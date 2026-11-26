import type { ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Display title: Martian Mono, condensed and heavy, in the primary blue unless `accent` is false. */
export function DisplayTitle({ as: Tag = "h1", children, className, accent = true }: { as?: ElementType; children: ReactNode; className?: string; accent?: boolean }) {
  return <Tag className={cn("font-display", accent && "text-blue", className)}>{children}</Tag>
}
