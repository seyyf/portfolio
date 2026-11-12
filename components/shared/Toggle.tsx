"use client"

import { motion, useReducedMotion } from "framer-motion"

import { fade } from "@/lib/animations"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

type ToggleProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Accessible name (visually hidden). Use `labelledBy` instead when a visible label exists. */
  label: string
  id?: string
  disabled?: boolean
  /** id of an element with the visible label; overrides `label` for screen readers. */
  labelledBy?: string
  /** id of an element with secondary text (e.g. the row's detail). */
  describedBy?: string
  className?: string
}

// A knob that travels with a little overshoot and stretches while pressed, like a real switch.
const travel = { type: "spring", stiffness: 640, damping: 26, mass: 0.7 } as const

/**
 * Accessible on/off switch. A native <button role="switch">, so Space and Enter both toggle it.
 * The visible track is 51x31 but the hit area is padded out to 44px tall.
 */
export function Toggle({ checked, onChange, label, id, disabled, labelledBy, describedBy, className }: ToggleProps) {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  return (
    <motion.button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      whileTap={disabled || reduce ? undefined : "press"}
      initial={false}
      animate={checked ? "on" : "off"}
      className={cn(
        "relative inline-flex h-7.75 w-12.75 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300",
        // Bigger invisible hit area (44px tall) without changing the layout.
        "before:absolute before:-inset-x-1.5 before:-inset-y-1.75 before:content-['']",
        checked ? "bg-mint" : "bg-text/15",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <motion.span
        aria-hidden="true"
        className="block size-6.75 rounded-full bg-white shadow-[0_2px_6px_rgba(31,34,51,0.25),0_0_0_0.5px_rgba(31,34,51,0.06)]"
        style={{ originX: checked ? 1 : 0 }}
        variants={{
          off: { x: 0, scaleX: 1 },
          on: { x: 20, scaleX: 1 },
          press: { scaleX: 1.18 },
        }}
        transition={reduce ? fade : travel}
      />
    </motion.button>
  )
}
