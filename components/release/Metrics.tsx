import type { Metric } from "@/data/releases"

/**
 * Real figures as a small stat row. Metrics without a value are "TODO: add metric" placeholders,
 * shown only in development so the live site never displays an empty or invented number.
 */
export function Metrics({ metrics }: { metrics: Metric[] }) {
  const real = metrics.filter((m) => m.value)
  const todo = process.env.NODE_ENV === "production" ? [] : metrics.filter((m) => !m.value)
  if (!real.length && !todo.length) return null

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {real.map((m) => (
        <div key={m.label} className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
          <p className="font-mono text-2xl font-semibold tracking-tight">{m.value}</p>
          <p className="mt-1 text-sm text-muted">{m.label}</p>
        </div>
      ))}
      {todo.map((m) => (
        <div key={m.label} className="rounded-[var(--radius-card)] border border-dashed border-tag-fixed/50 bg-tag-fixed-bg/40 p-4">
          <p className="font-mono text-xs font-semibold text-tag-fixed">TODO: add metric</p>
          <p className="mt-1 text-sm">{m.label}</p>
        </div>
      ))}
    </div>
  )
}
