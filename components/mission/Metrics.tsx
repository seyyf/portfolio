import type { Metric } from "@/data/missions"

const isDev = process.env.NODE_ENV !== "production"

/**
 * Metrics with a real value, plus (in development only) the `TODO: add metric` placeholders so the
 * missing numbers stay visible while editing. Production never shows a placeholder.
 */
export function shownMetrics(metrics: Metric[]) {
  return metrics.filter((m) => m.value !== undefined || isDev)
}

export function Metrics({ metrics }: { metrics: Metric[] }) {
  const shown = shownMetrics(metrics)
  if (shown.length === 0) return null
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {shown.map((m) =>
        m.value !== undefined ? (
          <li key={m.label} className="cut-br relative overflow-hidden rounded-xl border border-ink/12 bg-surface p-5">
            <span aria-hidden="true" className="absolute inset-x-0 top-0 h-0.5 bg-blue" />
            <p className="font-display text-[2.75rem] text-ink md:text-[3.25rem]">
              <span className="text-blue">{m.value}</span>
            </p>
            <p className="mt-2 text-[0.9375rem] leading-snug text-muted">{m.label}</p>
          </li>
        ) : (
          <li key={m.label} className="rounded-xl border-2 border-dashed border-blue/60 p-5 font-mono text-sm">
            <p className="font-semibold text-blue">TODO: add metric</p>
            <p className="mt-1 text-ink/80">{m.label}</p>
          </li>
        )
      )}
    </ul>
  )
}
