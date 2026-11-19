import { Map as MapIcon } from "lucide-react"

import { MiniMapArt, type MiniDot } from "@/components/map/MiniMapArt"
import { markers } from "@/components/map/markers"
import { OpenMapButton } from "@/components/map/OpenMapButton"

const dots: MiniDot[] = markers.map((m) => ({ id: m.id, x: m.x, y: m.y, tone: m.kind }))

/** Phones: a small static map above the mission list; tapping it opens the full map. */
export function MapPreview() {
  return (
    <div className="px-4 pt-8 sm:px-6 lg:hidden">
      {/* No aria-label: the button is named by its visible text ("Open the full map", "12 markers"). */}
      <OpenMapButton className="group relative block aspect-[16/10] w-full sm:aspect-[21/9] overflow-hidden rounded-2xl border border-ink/12 bg-land text-left shadow-[0_20px_60px_-30px_rgb(255_79_163/0.5)] transition-colors hover:border-orange">
        <MiniMapArt viewBox="200 60 1400 875" idPrefix="preview" dots={dots} dotRadius={16} className="absolute inset-0 size-full transition-transform duration-500 group-hover:scale-105" />
        <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgb(11_15_26/0.85))]" />
        <span className="absolute top-3 left-3 font-mono text-[0.6875rem] tracking-[0.16em] text-ink/80 uppercase [text-shadow:0_1px_4px_rgb(0_0_0/0.9)]">Greater Tunis</span>
        <span className="absolute right-3 bottom-3 left-3 flex items-center justify-between gap-3">
          <span className="inline-flex h-11 items-center gap-2 rounded-xl bg-sunset px-4 text-[0.9375rem] font-semibold text-bg">
            <MapIcon aria-hidden="true" className="size-4" /> Open the full map
          </span>
          <span className="font-mono text-xs text-ink/80">{markers.length} markers</span>
        </span>
      </OpenMapButton>
    </div>
  )
}
