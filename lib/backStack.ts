"use client"

import { useEffect, useRef } from "react"

/**
 * Makes the phone's back button (Android back, Safari edge swipe) behave like a real phone:
 * it closes the top-most overlay or in-app screen first (control center, sheets, menus, photo
 * viewer, event details) and only then the app.
 *
 * Each open layer owns one extra history entry at the same URL (Next.js copies its router state into
 * native pushState calls, so the router is unaffected). Back pops the entry and we close the layer.
 * Closing a layer from the UI removes its entry again, so history never fills up with dead steps.
 *
 * It also counts the app screens SeyfOS pushed since the home screen ("depth"), so going home can
 * rewind exactly those entries instead of stacking a new home entry on top.
 */

type Layer = { id: number; close: () => void }

const layers: Layer[] = []
let nextId = 1
/** Pops we triggered ourselves (closing a layer from the UI); the listener must not treat them as "back". */
let ownPops = 0
/** Layer entries released but not yet popped: a layer opening right after can reuse the entry. */
let releasedEntries = 0
let releaseTimer: ReturnType<typeof setTimeout> | undefined
let installed = false

/** App entries (/app/…, /resume) SeyfOS pushed on top of a home ("/") entry in this tab. */
let depth = 0
/** Whether a home entry exists below the current one (false when the visitor arrived on a deep link). */
let homeBelow = false

export function installBackStack(pathname: string) {
  if (installed) return
  installed = true
  homeBelow = pathname === "/"
  window.addEventListener("popstate", () => {
    if (ownPops > 0) {
      ownPops--
      return
    }
    // Back with a layer open: close just that layer (the URL did not change).
    const top = layers.pop()
    if (top) {
      top.close()
      return
    }
    // Otherwise it was an app-level step. Assume back (forward is rare); under-counting is safe.
    if (window.location.pathname === "/") {
      depth = 0
      homeBelow = true
    } else depth = Math.max(0, depth - 1)
  })
}

/** Called by navigation when it pushes an app screen. */
export function notePush(toHome: boolean) {
  if (toHome) {
    depth = 0
    homeBelow = true
  } else depth++
}

/**
 * Called when navigating away while overlays are open: forgets their entries (the navigation replaces
 * the top one). Returns how many there were.
 */
export function consumeLayers() {
  return dropLayers()
}

/** Removes all layer entries without closing UI (the caller is navigating away anyway). Returns how many. */
function dropLayers() {
  const n = layers.length + releasedEntries
  layers.length = 0
  releasedEntries = 0
  clearTimeout(releaseTimer)
  return n
}

/**
 * How to get home from here: `steps` entries to rewind with history.go(-steps), then `replace` the
 * current entry with "/" if there is no home entry to land on (deep links).
 */
export function planHome(): { steps: number; replace: boolean } {
  const layerSteps = dropLayers()
  if (homeBelow && depth > 0) {
    const steps = layerSteps + depth
    depth = 0
    return { steps, replace: false }
  }
  const plan = { steps: layerSteps, replace: window.location.pathname !== "/" }
  depth = 0
  homeBelow = true
  return plan
}

function pushLayer(close: () => void) {
  const id = nextId++
  if (releasedEntries > 0) {
    // A layer just closed and another opened (e.g. sheet to sheet): reuse its history entry.
    releasedEntries--
  } else {
    window.history.pushState({ seyfosLayer: id }, "")
  }
  layers.push({ id, close })
  return id
}

function releaseLayer(id: number) {
  const i = layers.findIndex((l) => l.id === id)
  if (i === -1) return // already popped by the back button
  layers.splice(i, 1)
  // Pop the entry a moment later, so a layer opening right after can reuse it instead.
  releasedEntries++
  clearTimeout(releaseTimer)
  releaseTimer = setTimeout(() => {
    const n = releasedEntries
    releasedEntries = 0
    if (n > 0) {
      ownPops += 1
      window.history.go(-n)
    }
  }, 60)
}

/**
 * Registers an overlay or in-app screen with the back button while `open` is true.
 * `onClose` must close it (it is called when the visitor presses back).
 */
export function useBackLayer(open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })
  useEffect(() => {
    if (!open) return
    const id = pushLayer(() => closeRef.current())
    return () => releaseLayer(id)
  }, [open])
}
