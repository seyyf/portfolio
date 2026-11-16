import { cn } from "@/lib/utils"

/** A gear / stack chip: mono, hairline, slightly slanted corner. */
export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-ink/15 bg-surface px-2.5 py-1 font-mono text-[0.8125rem] leading-5 text-ink/90",
        className
      )}
    >
      {children}
    </span>
  )
}

export function ChipList({ items, label, className }: { items: readonly string[]; label: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-2", className)}>
      {items.map((s) => (
        <li key={s}>
          <Chip>{s}</Chip>
        </li>
      ))}
    </ul>
  )
}
