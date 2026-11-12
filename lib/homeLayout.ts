import { dock, homePage1, homePage2, type HomeIcon } from "@/data/apps"

// Where each home-screen icon lives: two pages and the dock, as ordered lists of icon keys.
// The visitor can rearrange them in edit mode; the arrangement is saved in localStorage.

export type HomeLayout = { pages: string[][]; dock: string[] }
export type Area = { kind: "page"; page: number } | { kind: "dock" }

/** Two rows of four on a page (they fit even on short phones), four in the dock. */
export const PAGE_CAPACITY = 8
export const DOCK_CAPACITY = 4

const ALL_ICONS = [...homePage1, ...homePage2, ...dock]
export const iconByKey: Record<string, HomeIcon> = Object.fromEntries(ALL_ICONS.map((i) => [i.key, i]))

export const DEFAULT_LAYOUT: HomeLayout = {
  pages: [homePage1.map((i) => i.key), homePage2.map((i) => i.key)],
  dock: dock.map((i) => i.key),
}

const listOf = (l: HomeLayout, area: Area) => (area.kind === "dock" ? l.dock : l.pages[area.page])
const capacityOf = (area: Area) => (area.kind === "dock" ? DOCK_CAPACITY : PAGE_CAPACITY)
const sameArea = (a: Area, b: Area) => a.kind === b.kind && (a.kind === "dock" || a.page === (b as { page: number }).page)

export function locate(l: HomeLayout, key: string): { area: Area; index: number } | null {
  const d = l.dock.indexOf(key)
  if (d !== -1) return { area: { kind: "dock" }, index: d }
  for (let p = 0; p < l.pages.length; p++) {
    const i = l.pages[p].indexOf(key)
    if (i !== -1) return { area: { kind: "page", page: p }, index: i }
  }
  return null
}

/**
 * Moves `key` to `index` in `area` (index is clamped). Returns the new layout, or null when nothing
 * changes or the move isn't allowed (the target page or dock is full).
 */
export function moveIcon(l: HomeLayout, key: string, area: Area, index: number): HomeLayout | null {
  const from = locate(l, key)
  if (!from) return null
  const same = sameArea(from.area, area)
  const target = listOf(l, area)
  if (!same && target.length >= capacityOf(area)) return null
  const next: HomeLayout = { pages: l.pages.map((p) => [...p]), dock: [...l.dock] }
  listOf(next, from.area).splice(from.index, 1)
  const list = listOf(next, area)
  const at = Math.max(0, Math.min(index, list.length))
  if (same && at === from.index) return null
  list.splice(at, 0, key)
  return next
}

export const canAccept = (l: HomeLayout, key: string, area: Area) => {
  const from = locate(l, key)
  return !!from && (sameArea(from.area, area) || listOf(l, area).length < capacityOf(area))
}

const STORAGE_KEY = "seyfos-layout-v1"

/** The saved arrangement, if it still matches the icons that exist (otherwise it is ignored). */
export function loadLayout(): HomeLayout | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as HomeLayout
    const keys = [...(v.dock ?? []), ...(v.pages ?? []).flat()]
    const valid =
      Array.isArray(v.pages) &&
      v.pages.length === DEFAULT_LAYOUT.pages.length &&
      v.pages.every((p) => Array.isArray(p) && p.length <= PAGE_CAPACITY) &&
      Array.isArray(v.dock) &&
      v.dock.length <= DOCK_CAPACITY &&
      keys.length === ALL_ICONS.length &&
      new Set(keys).size === keys.length &&
      keys.every((k) => k in iconByKey)
    return valid ? v : null
  } catch {
    return null
  }
}

export function saveLayout(l: HomeLayout | null) {
  try {
    if (l) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(l))
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage blocked: the arrangement simply isn't remembered.
  }
}
