import { GraduationCap, Lock } from "lucide-react"

import { markerTitle, type MarkerItem } from "@/components/map/markers"
import { cn } from "@/lib/utils"

/** IN PROGRESS (yellow, live dot) or COMPLETED (muted). */
export function StatusBadge({ status, className }: { status: "COMPLETED" | "IN PROGRESS" | "LOCKED"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 font-mono text-[0.6875rem] leading-4 lowercase",
        status === "IN PROGRESS" && "border-gold/50 text-gold",
        status === "COMPLETED" && "border-ink/20 text-ink/75",
        status === "LOCKED" && "border-dashed border-ink/30 text-ink/75",
        className
      )}
    >
      {status === "IN PROGRESS" && <span aria-hidden="true" className="size-1.5 rounded-full bg-gold" />}
      {status === "LOCKED" && <Lock aria-hidden="true" className="size-3" />}
      {status}
    </span>
  )
}

export type CardPlacement = { side: "left" | "right"; v: "center" | "top" | "bottom" }

/**
 * The hover / focus card next to a marker. Decorative for assistive tech (the marker's accessible
 * name already says the same), so aria-hidden; pointer-events off so it never blocks the map.
 */
export function MissionCard({ m, placement }: { m: MarkerItem; placement: CardPlacement }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "hud-panel cut-br pointer-events-none absolute z-10 w-64 rounded-xl p-3.5 text-left shadow-[0_18px_40px_-12px_rgb(0_0_0/0.8)]",
        placement.side === "right" ? "left-full ml-3" : "right-full mr-3",
        placement.v === "center" && "top-1/2 -translate-y-1/2",
        placement.v === "top" && "top-0",
        placement.v === "bottom" && "bottom-0"
      )}
    >
      {m.kind === "mission" && (
        <>
          <p className="font-display text-xl leading-tight text-ink">
            <span>
              <span className="text-pink">Mission {m.data.number}</span> — {m.data.codename}
            </span>
          </p>
          <p className="mt-1.5 text-sm font-semibold text-ink">{m.data.company}</p>
          <p className="font-mono text-xs text-muted">{m.data.dates}</p>
          <StatusBadge status={m.data.status} className="mt-2" />
        </>
      )}
      {m.kind === "locked" && (
        <>
          <p className="font-display text-xl leading-tight text-ink">
            <span>{markerTitle(m)}</span>
          </p>
          <p className="mt-1.5 text-sm leading-snug text-ink/85">{m.data.teaser}</p>
          <StatusBadge status="LOCKED" className="mt-2" />
        </>
      )}
      {m.kind === "side" && (
        <>
          <p className="font-mono text-[0.6875rem] text-pink lowercase">Side mission · {m.data.client}</p>
          <p className="mt-0.5 font-display text-xl leading-tight text-ink">
            <span>{m.data.name}</span>
          </p>
          <p className="mt-1 text-sm leading-snug text-ink/85">{m.data.description}</p>
        </>
      )}
      {m.kind === "tutorial" && (
        <>
          <p className="flex items-center gap-1.5 font-mono text-[0.6875rem] text-[#8adccb] lowercase">
            <GraduationCap aria-hidden="true" className="size-3.5" /> Tutorial {m.data.number}
          </p>
          <p className="mt-1 text-[0.9375rem] leading-snug font-semibold text-ink">{m.data.degree}</p>
          <p className="mt-1 text-sm text-ink/85">{m.data.school}</p>
          <p className="font-mono text-xs text-muted">{m.data.dates}</p>
        </>
      )}
    </div>
  )
}
