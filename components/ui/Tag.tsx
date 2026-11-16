import type { ChangeTag } from "@/data/releases"
import { cn } from "@/lib/utils"

const styles: Record<ChangeTag, string> = {
  NEW: "bg-tag-new-bg text-tag-new",
  IMPROVED: "bg-tag-improved-bg text-tag-improved",
  FIXED: "bg-tag-fixed-bg text-tag-fixed",
  SECURITY: "bg-tag-security-bg text-tag-security",
  INFRA: "bg-tag-infra-bg text-tag-infra",
}

/** A change tag: small mono uppercase pill. Every colour pair is at least 6:1 in both themes. */
export function Tag({ tag, className }: { tag: ChangeTag; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[1.375rem] min-w-[5.75rem] shrink-0 items-center justify-center rounded-md px-2 font-mono text-[0.6875rem] font-semibold tracking-[0.06em]",
        styles[tag],
        className
      )}
    >
      {tag}
    </span>
  )
}
