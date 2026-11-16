"use client"

import type { ReactNode } from "react"

import { setFullMap, useMapState } from "@/components/map/store"
import { play } from "@/lib/sound"
import { cn } from "@/lib/utils"

/** Phones: opens the full-screen map. */
export function OpenMapButton({ className, label, children }: { className?: string; label?: string; children: ReactNode }) {
  const { fullMap } = useMapState()
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={fullMap}
      onClick={() => {
        play("click")
        setFullMap(true)
      }}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </button>
  )
}
