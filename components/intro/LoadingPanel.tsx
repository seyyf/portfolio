import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * One slanted illustration panel of the loading screen. Decorative (the whole panel strip is
 * aria-hidden). The art is counter-skewed inside the slanted frame and drifts slowly (CSS).
 * `tint` paints the frame while the image loads.
 */
export function LoadingPanel({ src, tint, position = "50% 50%", className }: { src: string; tint: string; position?: string; className?: string }) {
  return (
    <div className={cn("ow-panel relative min-h-0 flex-1 overflow-hidden rounded-[3px] shadow-[0_24px_60px_-24px_rgb(0_0_0/0.8)] ring-1 ring-ink/15", className)} style={{ background: tint }}>
      <div className="ow-panel-art absolute -inset-[14%]">
        {/* Eager: on a first visit these panels are the first thing on screen (and the LCP). */}
        <Image src={src} alt="" fill loading="eager" sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" style={{ objectPosition: position }} />
      </div>
    </div>
  )
}
