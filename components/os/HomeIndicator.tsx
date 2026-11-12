"use client"

import { animate, motion, type MotionValue } from "framer-motion"

import { springs } from "@/lib/animations"

/**
 * The bar at the bottom of every app. Swipe it up (or tap it) to go home. While dragging, it feeds
 * `dragY` so the app window can shrink under the finger.
 */
export function HomeIndicator({ dragY, onHome }: { dragY: MotionValue<number>; onHome: () => void }) {
  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex h-[calc(var(--home-h)+env(safe-area-inset-bottom))] items-start justify-center pt-2.5">
      <motion.button
        type="button"
        aria-label="Go to the home screen"
        onClick={onHome}
        className="group flex h-7 w-40 touch-none items-center justify-center"
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 1, bottom: 0 }}
        dragSnapToOrigin
        onDrag={(_, info) => dragY.set(Math.min(0, info.offset.y))}
        onDragEnd={(_, info) => {
          if (info.offset.y < -60 || info.velocity.y < -500) onHome()
          else animate(dragY, 0, springs.snappy)
        }}
      >
        <span className="h-[5px] w-32 rounded-full bg-text/70 transition-[width] group-hover:w-36" />
      </motion.button>
    </div>
  )
}
