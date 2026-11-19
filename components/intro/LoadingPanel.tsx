import Image from "next/image"

import { cn } from "@/lib/utils"

/**
 * One slanted illustration panel of the loading screen. Decorative (the whole panel strip is
 * aria-hidden). The art is counter-skewed inside the slanted frame and drifts slowly (CSS).
 * `tint` paints the frame while the image loads.
 */
export function LoadingPanel({
  src,
  tint,
  sizes,
  first = false,
  position = "50% 50%",
  className,
}: {
  src: string
  tint: string
  /** The panel's on-screen width, so phones download a small version. */
  sizes: string
  /** The first panel is fetched with high priority; the others load lazily (skipped entirely by returning visitors, who never see the loader). */
  first?: boolean
  position?: string
  className?: string
}) {
  return (
    <div className={cn("ow-panel relative min-h-0 flex-1 overflow-hidden rounded-[3px] shadow-[0_24px_60px_-24px_rgb(0_0_0/0.8)] ring-1 ring-ink/15", className)} style={{ background: tint }}>
      <div className="ow-panel-art absolute -inset-[14%]">
        <Image
          src={src}
          alt=""
          fill
          sizes={sizes}
          loading={first ? "eager" : "lazy"}
          fetchPriority={first ? "high" : "auto"}
          className="object-cover"
          style={{ objectPosition: position }}
        />
      </div>
    </div>
  )
}
