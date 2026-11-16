"use client"

import { useSyncExternalStore } from "react"

import { motionReduced } from "@/lib/prefs"

// Map hub state shared by the intro card, the map, the mission list and the HUD minimap:
// which briefing is open, and (on phones) whether the full map is showing.

export type MapState = {
  /** Marker whose briefing is open. */
  selected: string | null
  /** Bumped on every selection so the map flies even when the same marker is picked again. */
  nonce: number
  /** Phones: the full-screen map is open (on desktop the map is always on screen). */
  fullMap: boolean
}

let state: MapState = { selected: null, nonce: 0, fullMap: false }
const listeners = new Set<() => void>()
let opener: HTMLElement | null = null
const set = (next: Partial<MapState>) => {
  // Remember what opened the phone full map, to give focus back when it closes.
  if (next.fullMap && !state.fullMap && typeof document !== "undefined") opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches

/** Open a marker's briefing; on phones this also opens the full map. */
export function selectMarker(id: string) {
  set({ selected: id, nonce: state.nonce + 1, fullMap: isDesktop() ? state.fullMap : true })
}
export const closeBriefing = () => set({ selected: null })
export const setFullMap = (fullMap: boolean) => set(fullMap ? { fullMap } : { fullMap, selected: null })
export const getMapState = () => state
/** The element that opened the full map (phones), once. */
export function takeOpener() {
  const el = opener
  opener = null
  return el
}

/** The minimap on the home page: bring the full map into view and focus it. */
export function showMap() {
  if (!isDesktop()) {
    setFullMap(true)
    return
  }
  const map = document.getElementById("map")
  if (!map) return
  map.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" })
  document.querySelector<HTMLElement>("[data-map-marker][tabindex='0']")?.focus({ preventScroll: true })
}

export function useMapState(): MapState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => state,
    () => state
  )
}
