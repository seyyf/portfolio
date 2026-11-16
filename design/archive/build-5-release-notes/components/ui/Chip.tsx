import { cn } from "@/lib/utils"

/** A stack chip: quiet, mono, hairline border. */
export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border border-border bg-surface px-2 py-0.5 font-mono text-[0.8125rem] leading-5 text-muted", className)}>
      {children}
    </span>
  )
}

export function ChipList({ items, label, className }: { items: readonly string[]; label: string; className?: string }) {
  return (
    <ul aria-label={label} className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((s) => (
        <li key={s}>
          <Chip>{s}</Chip>
        </li>
      ))}
    </ul>
  )
}
