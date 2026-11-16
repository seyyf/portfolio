import { districts, lockedMission, type DistrictId, missions, sideMissions, tutorials, type LockedMission, type Mission, type SideMission, type Tutorial } from "@/data/missions"

// Every marker on the map, in story order: education first, then the five missions, the locked
// sixth, then side missions. Arrow keys follow the map spatially; Home / End use this order.

export type MarkerItem = { id: string; x: number; y: number; district: DistrictId; districtName: string } & (
  | { kind: "mission"; data: Mission }
  | { kind: "locked"; data: LockedMission }
  | { kind: "side"; data: SideMission }
  | { kind: "tutorial"; data: Tutorial }
)

const place = (map: { x: number; y: number; district: DistrictId }) => ({ x: map.x, y: map.y, district: map.district, districtName: districts[map.district].name })

export const markers: MarkerItem[] = [
  ...tutorials.map((t) => ({ id: t.slug, kind: "tutorial" as const, data: t, ...place(t.map) })),
  ...missions.map((m) => ({ id: m.slug, kind: "mission" as const, data: m, ...place(m.map) })),
  { id: lockedMission.slug, kind: "locked" as const, data: lockedMission, ...place(lockedMission.map) },
  ...sideMissions.map((s) => ({ id: s.slug, kind: "side" as const, data: s, ...place(s.map) })),
]

export const markerById = (id: string | null) => (id ? markers.find((m) => m.id === id) : undefined)

/** "Mission 05 — The Rebuild", "Side mission — Fripa", "Tutorial 1 — Bachelor's in …". */
export function markerTitle(m: MarkerItem): string {
  switch (m.kind) {
    case "mission":
      return `Mission ${m.data.number} — ${m.data.codename}`
    case "locked":
      return `Mission ${m.data.number} — ${m.data.codename}`
    case "side":
      return `Side mission — ${m.data.name}`
    case "tutorial":
      return `Tutorial ${m.data.number} — ${m.data.degree}`
  }
}

/** The accessible name of a marker button. */
export function markerLabel(m: MarkerItem): string {
  switch (m.kind) {
    case "mission":
      return `${markerTitle(m)}, ${m.data.company}, ${m.data.dates}, ${m.data.status === "IN PROGRESS" ? "in progress" : "completed"}`
    case "locked":
      return `${markerTitle(m)}, locked. Message Seyf to unlock it`
    case "side":
      return `${markerTitle(m)}, ${m.data.client === "Personal" ? "personal project" : "client project"}`
    case "tutorial":
      return `Tutorial ${m.data.number}: ${m.data.degree}, ${m.data.school}, ${m.data.dates}`
  }
}

export type Direction = "up" | "down" | "left" | "right"
const DIRS: Record<Direction, [number, number]> = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }

/** Spatial arrow-key navigation: the closest marker in that direction (inside a cone first). */
export function nextMarker(from: MarkerItem, dir: Direction): MarkerItem | undefined {
  const [dx, dy] = DIRS[dir]
  const pick = (cone: boolean) => {
    let best: MarkerItem | undefined
    let bestScore = Infinity
    for (const m of markers) {
      if (m.id === from.id) continue
      const vx = m.x - from.x
      const vy = m.y - from.y
      const along = vx * dx + vy * dy
      const across = Math.abs(vx * dy - vy * dx)
      if (along <= 0 || (cone && across > along * 1.6)) continue
      const score = along + across * 2
      if (score < bestScore) {
        best = m
        bestScore = score
      }
    }
    return best
  }
  return pick(true) ?? pick(false)
}
