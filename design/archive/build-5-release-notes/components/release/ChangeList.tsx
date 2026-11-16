import { Tag } from "@/components/ui/Tag"
import type { Change } from "@/data/releases"
import { cn } from "@/lib/utils"

/** Tagged change lines: the pill on the left, the change in plain English on the right. */
export function ChangeList({ changes, className, size = "md" }: { changes: Change[]; className?: string; size?: "md" | "lg" }) {
  return (
    <ul className={cn("grid", size === "lg" ? "gap-4" : "gap-3", className)}>
      {changes.map((c) => (
        <li key={c.text} className="flex flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-4">
          <Tag tag={c.tag} className="self-start sm:translate-y-[-1px]" />
          <span className={cn("max-w-[68ch]", size === "lg" ? "text-[1.0625rem] md:text-lg" : "text-[1.0625rem]")}>
            {c.text}
          </span>
        </li>
      ))}
    </ul>
  )
}
