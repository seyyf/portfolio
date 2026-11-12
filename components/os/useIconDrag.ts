"use client"

import { useMotionValue } from "framer-motion"
import { useCallback, useEffect, useRef, useState } from "react"

import type { HomeIcon } from "@/data/apps"
import type { Area } from "@/lib/homeLayout"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"

const PAGES = 2
/** Hold an icon this close to the left/right edge to flip to the neighbouring page. */
const EDGE_PX = 26
const EDGE_HOLD_MS = 550
/** Ignore new targets briefly after a move, while the other icons slide (prevents jitter). */
const SETTLE_MS = 110

/** Which slot (area + index) the pointer is over, or null if it's not over somewhere an icon can go. */
function hitTest(screen: HTMLElement, cx: number, cy: number): { area: Area; index: number } | null {
  const inside = (r: DOMRect) => cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom
  const dockEl = screen.querySelector<HTMLElement>("[data-dock]")
  const inDock = !!dockEl && inside(dockEl.getBoundingClientRect())
  const page = useOS.getState().homePage
  const area: Area = inDock ? { kind: "dock" } : { kind: "page", page }
  const selector = inDock ? '[data-slot][data-area="dock"]' : `[data-slot][data-area="page"][data-page="${page}"]`
  const slots = Array.from(screen.querySelectorAll<HTMLElement>(selector))
  for (const el of slots) {
    if (inside(el.getBoundingClientRect())) return { area, index: Number(el.dataset.index) }
  }
  // Empty space after the icons (below the grid's top, or anywhere in the dock): drop at the end.
  if (inDock) return { area, index: slots.length }
  const grid = screen.querySelector<HTMLElement>(`[data-grid-page="${page}"]`)
  const viewport = screen.querySelector<HTMLElement>(".home-viewport")
  if (grid && viewport && cy >= grid.getBoundingClientRect().top && inside(viewport.getBoundingClientRect())) {
    return { area, index: slots.length }
  }
  return null
}

/**
 * Drag-to-rearrange for home-screen icons in edit mode: a floating copy follows the pointer while the
 * real slots reorder live (the layout animation slides the others out of the way). Holding the icon
 * at a screen edge flips the page; the dock accepts icons until it's full.
 */
export function useIconDrag(screen: HTMLElement | null) {
  const [dragKey, setDragKey] = useState<string | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const cleanup = useRef<(() => void) | null>(null)

  useEffect(() => () => cleanup.current?.(), [])

  const start = useCallback(
    (icon: HomeIcon, e: PointerEvent, el: HTMLElement) => {
      if (!screen) return
      cleanup.current?.()
      const s = screen.getBoundingClientRect()
      const r = el.getBoundingClientRect()
      const grab = { x: e.clientX - r.left, y: e.clientY - r.top }
      x.set(r.left - s.left)
      y.set(r.top - s.top)
      setDragKey(icon.key)
      playSfx("pop")

      let edgeDir = 0
      let edgeTimer: ReturnType<typeof setTimeout> | undefined
      let settledAt = 0

      const move = (ev: PointerEvent) => {
        const sr = screen.getBoundingClientRect()
        x.set(ev.clientX - sr.left - grab.x)
        y.set(ev.clientY - sr.top - grab.y)

        const dir = ev.clientX < sr.left + EDGE_PX ? -1 : ev.clientX > sr.right - EDGE_PX ? 1 : 0
        if (dir !== edgeDir) {
          clearTimeout(edgeTimer)
          edgeDir = dir
          if (dir) {
            edgeTimer = setTimeout(() => {
              const os = useOS.getState()
              const p = os.homePage + dir
              if (p >= 0 && p < PAGES) os.setHomePage(p)
              edgeDir = 0
            }, EDGE_HOLD_MS)
          }
        }

        const now = performance.now()
        if (now - settledAt < SETTLE_MS) return
        const target = hitTest(screen, ev.clientX, ev.clientY)
        if (target && useOS.getState().moveIcon(icon.key, target.area, target.index)) settledAt = now
      }

      const end = () => {
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", end)
        window.removeEventListener("pointercancel", end)
        clearTimeout(edgeTimer)
        cleanup.current = null
        setDragKey(null)
      }
      cleanup.current = end
      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", end)
      window.addEventListener("pointercancel", end)
    },
    [screen, x, y]
  )

  return { dragKey, x, y, start }
}
