import { GraduationCap, Lock } from "lucide-react"
import type { ComponentProps, Ref } from "react"

import { markerLabel, type MarkerItem } from "@/components/map/markers"
import { cn } from "@/lib/utils"

type Props = Omit<ComponentProps<"button">, "children"> & { m: MarkerItem; active: boolean; pingDelay?: number; buttonRef?: Ref<HTMLButtonElement> }

/**
 * A map marker: a real button. Missions are numbered sunset rings that pulse (static under
 * reduced motion), the locked mission has a padlock, side missions are small gold diamonds and
 * education ("tutorials") small teal caps.
 */
export function MissionMarker({ m, active, pingDelay = 0, buttonRef, className, ...props }: Props) {
  const base =
    "relative grid cursor-pointer touch-manipulation place-items-center rounded-full transition-transform duration-200 ease-out hover:scale-110 focus-visible:scale-110 focus-visible:outline-offset-4"
  return (
    <button
      ref={buttonRef}
      type="button"
      data-map-marker={m.id}
      aria-label={markerLabel(m)}
      aria-haspopup={m.kind === "locked" ? undefined : "dialog"}
      aria-expanded={m.kind === "locked" ? undefined : active}
      className={cn(base, m.kind === "mission" || m.kind === "locked" ? "size-10 lg:size-11" : "size-8", active && "scale-115", className)}
      {...props}
    >
      {m.kind === "mission" && (
        <>
          <span aria-hidden="true" className="ow-ping bg-sunset absolute inset-0 rounded-full" style={{ animationDelay: `${pingDelay}s` }} />
          <span aria-hidden="true" className="bg-sunset absolute inset-0 rounded-full p-[3px] shadow-[0_0_22px_rgb(255_79_163/0.55)]">
            <span className={cn("block size-full rounded-full transition-colors", active ? "bg-transparent" : "bg-bg")} />
          </span>
          <span aria-hidden="true" className={cn("relative font-mono text-sm font-bold", active ? "text-bg" : "text-ink")}>
            {m.data.number}
          </span>
          {m.data.status === "IN PROGRESS" && <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-gold ring-2 ring-bg" />}
        </>
      )}
      {m.kind === "locked" && (
        <>
          <span aria-hidden="true" className={cn("absolute inset-0 rounded-full border-2 border-dashed border-ink/55", active ? "bg-violet" : "bg-violet/70")} />
          <Lock aria-hidden="true" className="relative size-4 text-ink" />
          <span aria-hidden="true" className="absolute -bottom-2 rounded bg-bg px-1 font-mono text-[0.625rem] leading-3.5 font-bold text-ink ring-1 ring-ink/30">
            {m.data.number}
          </span>
        </>
      )}
      {m.kind === "side" && (
        <>
          <span aria-hidden="true" className={cn("absolute inset-[5px] rotate-45 rounded-[4px] border-2 border-gold shadow-[0_0_14px_rgb(255_201_74/0.45)]", active ? "bg-gold" : "bg-bg")} />
          <span aria-hidden="true" className={cn("relative size-1.5 rounded-full", active ? "bg-bg" : "bg-gold")} />
        </>
      )}
      {m.kind === "tutorial" && (
        <>
          <span aria-hidden="true" className={cn("absolute inset-0.5 rounded-lg border border-[#4fb7c4]/80", active ? "bg-[#4fb7c4]" : "bg-teal")} />
          <GraduationCap aria-hidden="true" className={cn("relative size-4", active ? "text-bg" : "text-[#bfe9ee]")} />
        </>
      )}
    </button>
  )
}
