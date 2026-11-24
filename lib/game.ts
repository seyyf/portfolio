"use client"

import { useSyncExternalStore } from "react"

import { calls, cheats, doors, starThresholds, type CallId, type CheatId, type DoorId } from "@/data/game"
import { missionPages } from "@/data/missions"
import { play } from "@/lib/sound"

/*
 * The game layer's state. Two parts:
 *   save: progress, kept in localStorage so returning visitors keep it (doors, cheats, calls, the
 *         things that raise the interest level).
 *   live: this page session only (active cheat toggles, notifications, the ringing phone).
 * Any component reads it with useGame(); anything can call the actions below.
 */

const KEY = "ow-game"

export type Save = {
  /** Distinct things done that raise the interest level: "visit:<slug>", "stats", "passed:/missions/x"… */
  heat: string[]
  doors: DoorId[]
  cheats: CheatId[]
  /** Calls that have rung (answered or not): listed in the phone's Recent calls. */
  calls: CallId[]
  /** HIREME: five stars, whatever the points. */
  maxed: boolean
}

export type Toast = { id: number; title: string; detail?: string; kind?: "loot" }

export type Live = {
  active: CheatId[]
  toasts: Toast[]
  /** The call ringing right now (the card above the phone button). */
  ringing: CallId | null
  /** Calls waiting to ring once nothing else is on screen. */
  queue: CallId[]
  /** The call shown in the phone's call screen. */
  activeCall: CallId | null
}

export type GameState = { save: Save; live: Live }

const EMPTY_SAVE: Save = { heat: [], doors: [], cheats: [], calls: [], maxed: false }
const EMPTY: GameState = { save: EMPTY_SAVE, live: { active: [], toasts: [], ringing: null, queue: [], activeCall: null } }

let state: GameState = EMPTY
let loaded = false
const listeners = new Set<() => void>()

const strings = (v: unknown, allowed?: readonly string[]) =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === "string" && (!allowed || allowed.includes(x))))] : []

function load() {
  if (loaded || typeof window === "undefined") return
  loaded = true
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<Record<keyof Save, unknown>>
    state = {
      ...state,
      save: {
        heat: strings(raw.heat).slice(0, 200),
        doors: strings(raw.doors, doors.map((d) => d.id)) as DoorId[],
        cheats: strings(raw.cheats, cheats.map((c) => c.id)) as CheatId[],
        calls: strings(raw.calls, Object.keys(calls)) as CallId[],
        maxed: raw.maxed === true,
      },
    }
  } catch {}
}

function emit() {
  listeners.forEach((l) => l())
}

function setSave(patch: Partial<Save>) {
  const before = progress(state.save)
  state = { ...state, save: { ...state.save, ...patch } }
  try {
    localStorage.setItem(KEY, JSON.stringify(state.save))
  } catch {}
  emit()
  afterProgress(before, progress(state.save))
}

function setLive(patch: Partial<Live>) {
  state = { ...state, live: { ...state.live, ...patch } }
  emit()
}

export function getGame(): GameState {
  load()
  return state
}

export function useGame(): GameState {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    getGame,
    () => EMPTY
  )
}

// ---------------------------------------------------------------------------------------------
// Derived numbers

export const points = (s: Save) => s.heat.length + s.doors.length + s.cheats.length
export const starsOf = (s: Save) => (s.maxed ? 5 : starThresholds.filter((t) => points(s) >= t).length)

const missionSlugs = missionPages.map((m) => m.slug)
export const visitedMissions = (s: Save) => missionSlugs.filter((slug) => s.heat.includes(`visit:${slug}`))

/** Game completion: doors + cheats + mission pages visited, as a share of all of them. */
export function completion(s: Save) {
  const total = doors.length + cheats.length + missionSlugs.length
  const done = s.doors.length + s.cheats.length + visitedMissions(s).length
  return { done, total, percent: Math.floor((done / total) * 100) }
}

function progress(s: Save) {
  return { stars: starsOf(s), percent: completion(s).percent, doors: s.doors.length }
}

function afterProgress(before: ReturnType<typeof progress>, after: ReturnType<typeof progress>) {
  if (after.stars > before.stars) {
    toast(after.stars === 5 ? "Interest level: max" : "Interest level up", "★".repeat(after.stars) + "☆".repeat(5 - after.stars))
    if (after.stars === 5) queueCall("wanted")
  }
  if (after.doors === doors.length && before.doors < doors.length) toast("All blue doors found", "Every door in the city. Respect.")
  if (after.percent === 100 && before.percent < 100) toast("100% completion", "You've seen everything. The Stats page has your reward.")
}

// ---------------------------------------------------------------------------------------------
// Actions

/** Records something the visitor did (once). Raises the interest level. */
export function addHeat(id: string) {
  load()
  if (state.save.heat.includes(id)) return
  setSave({ heat: [...state.save.heat, id] })
}

let toastId = 0
export function toast(title: string, detail?: string, kind?: Toast["kind"]) {
  const t: Toast = { id: ++toastId, title, detail, kind }
  setLive({ toasts: [...state.live.toasts, t].slice(-3) })
  window.setTimeout(() => setLive({ toasts: state.live.toasts.filter((x) => x.id !== t.id) }), kind === "loot" ? 5200 : 3800)
}

export function findDoor(id: DoorId) {
  load()
  if (state.save.doors.includes(id)) return
  play("ding")
  toast("Blue door found", `${state.save.doors.length + 1} of ${doors.length}`)
  setSave({ doors: [...state.save.doors, id] })
}

const toggleClass = (id: CheatId) => `cheat-${id}`

/**
 * Runs a cheat code. Returns the cheat (and whether a toggle is now on), or null for an unknown
 * code. Letters only, any case: "hire me" works too.
 */
export function enterCheat(raw: string): { id: CheatId; on: boolean } | null {
  load()
  const code = raw.toUpperCase().replace(/[^A-Z]/g, "")
  const cheat = cheats.find((c) => c.code === code)
  if (!cheat) return null
  play("ding")

  let on = true
  if (cheat.toggle) {
    on = !state.live.active.includes(cheat.id)
    document.documentElement.classList.toggle(toggleClass(cheat.id), on)
    setLive({ active: on ? [...state.live.active, cheat.id] : state.live.active.filter((x) => x !== cheat.id) })
  }

  if (cheat.id === "motherlode") toast("Cheat activated", cheat.code, "loot")
  else toast(on ? "Cheat activated" : "Cheat deactivated", cheat.code)

  const patch: Partial<Save> = {}
  if (!state.save.cheats.includes(cheat.id)) patch.cheats = [...state.save.cheats, cheat.id]
  if (cheat.id === "hireme") patch.maxed = true
  if (Object.keys(patch).length) setSave(patch)
  return { id: cheat.id, on }
}

/** Queues a call: it rings once nothing else is on screen (see IncomingCall). Each call rings once. */
export function queueCall(id: CallId) {
  load()
  if (state.save.calls.includes(id) || state.live.queue.includes(id) || state.live.ringing === id) return
  setLive({ queue: [...state.live.queue, id] })
}

/** Takes the next queued call and rings it. */
export function ringNext() {
  const [next, ...rest] = state.live.queue
  if (!next || state.live.ringing) return
  setLive({ ringing: next, queue: rest })
  if (!state.save.calls.includes(next)) setSave({ calls: [...state.save.calls, next] })
}

export function stopRinging() {
  setLive({ ringing: null })
}

/** Shows a call in the phone's call screen (the caller opens the phone). */
export function startCall(id: CallId) {
  setLive({ ringing: null, activeCall: id })
}
