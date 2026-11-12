import type { Transition } from "framer-motion"

// Shared Framer Motion springs. Everything physical: springs with a little overshoot, never linear.

export const springs = {
  /** Icon presses, toggles, small pops. */
  snappy: { type: "spring", stiffness: 520, damping: 30, mass: 0.8 } as Transition,
  /** Windows, sheets, pages. */
  smooth: { type: "spring", stiffness: 300, damping: 32, mass: 1 } as Transition,
  /** Playful entrances with visible overshoot. */
  bouncy: { type: "spring", stiffness: 380, damping: 18, mass: 0.9 } as Transition,
  /** The live pill morphing between sizes. */
  pill: { type: "spring", stiffness: 420, damping: 34 } as Transition,
}

/** Reduced-motion replacement: a quick fade. */
export const fade: Transition = { duration: 0.18, ease: "easeOut" }
