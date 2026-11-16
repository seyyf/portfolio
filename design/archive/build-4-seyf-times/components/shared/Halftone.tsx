import Image from "next/image"

import { Reveal } from "@/components/shared/Reveal"
import { cn } from "@/lib/utils"

type HalftoneProps = {
  src: string
  alt: string
  width: number
  height: number
  sizes?: string
  /** Above the fold: load eagerly with high priority. */
  priority?: boolean
  className?: string
  /** Unmask top to bottom when it scrolls into view (default true). */
  reveal?: boolean
}

/**
 * Newsprint image: grayscale with a dot screen, turning into full colour on hover/focus/tap
 * (on the image itself, or on any ancestor with the `halftone-trigger` class, e.g. a story card).
 */
export function Halftone({ src, alt, width, height, sizes = "(min-width: 1024px) 50vw, 100vw", priority, className, reveal = true }: HalftoneProps) {
  const img = (
    <div className={cn("halftone", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        unoptimized={src.endsWith(".svg")}
        className="h-auto w-full"
      />
    </div>
  )
  return reveal ? <Reveal variant="unmask">{img}</Reveal> : img
}
