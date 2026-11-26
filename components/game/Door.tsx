"use client"

import { doors, type DoorId } from "@/data/game"
import { findDoor, useGame } from "@/lib/game"
import { cn } from "@/lib/utils"

/**
 * A hidden collectible: a small Sidi Bou Said door, half-faded into the page. Clicking it collects
 * it (saved in the browser). Found doors stay, open and lit. The BLUEDOOR cheat makes them glow.
 */
export function Door({ id, className }: { id: DoorId; className?: string }) {
  const { save } = useGame()
  const found = save.doors.includes(id)
  const n = doors.findIndex((d) => d.id === id) + 1

  return (
    <button
      type="button"
      data-door
      aria-label={found ? `Blue door ${n}: found` : "A blue door (hidden collectible)"}
      aria-pressed={found}
      onClick={() => findDoor(id)}
      className={cn(
        "no-print group inline-flex size-11 shrink-0 items-center justify-center rounded-lg transition-[opacity,transform] duration-300",
        found ? "opacity-80" : "opacity-35 hover:scale-110 hover:opacity-100 focus-visible:opacity-100",
        className
      )}
    >
      <DoorIcon open={found} className="h-7 w-auto" />
    </button>
  )
}

/** A Sidi Bou Said door: blue, arched, studded. Open (warm light inside) once found. */
export function DoorIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 32" aria-hidden="true" className={className}>
      <path d="M2 31V11a10 10 0 0 1 20 0v20Z" fill="#eef2f5" fillOpacity="0.9" />
      {open ? (
        <>
          <path d="M4.5 31V11.5a7.5 7.5 0 0 1 15 0V31Z" fill="#f2b544" />
          <path d="M4.5 31V11.5a7.5 7.5 0 0 1 3.2-6.1V29l-3.2 2Z" fill="#2f6db5" />
        </>
      ) : (
        <>
          <path d="M4.5 31V11.5a7.5 7.5 0 0 1 15 0V31Z" fill="#2f6db5" />
          <path d="M12 4v27" stroke="#0e1b2b" strokeOpacity="0.35" strokeWidth="0.8" />
          <g fill="#0e1b2b" fillOpacity="0.45">
            <circle cx="8" cy="14" r="0.9" />
            <circle cx="8" cy="19" r="0.9" />
            <circle cx="8" cy="24" r="0.9" />
            <circle cx="16" cy="14" r="0.9" />
            <circle cx="16" cy="19" r="0.9" />
            <circle cx="16" cy="24" r="0.9" />
          </g>
          <circle cx="13.6" cy="19.5" r="0.9" fill="#f2b544" />
        </>
      )}
    </svg>
  )
}
