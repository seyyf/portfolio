import { buildings } from "@/data/city"
import { rand } from "@/lib/world"

// City map. The island spans -ISLAND..ISLAND on x and z, ground at y = 0.
// Two roads run along z (x = ±8) and two along x (z = ±5.5), making a # with 9 blocks.

export const ISLAND = 21
export const ROAD_W = 2.4
export const ROADS_X = [-8, 8] as const
export const ROADS_Z = [-5.5, 5.5] as const

export type Rect = { x0: number; x1: number; z0: number; z1: number }

const xs = [-ISLAND, ROADS_X[0] - ROAD_W / 2, ROADS_X[0] + ROAD_W / 2, ROADS_X[1] - ROAD_W / 2, ROADS_X[1] + ROAD_W / 2, ISLAND]
const zs = [-ISLAND, ROADS_Z[0] - ROAD_W / 2, ROADS_Z[0] + ROAD_W / 2, ROADS_Z[1] - ROAD_W / 2, ROADS_Z[1] + ROAD_W / 2, ISLAND]

export const BLOCKS: Rect[] = []
for (let j = 0; j < 3; j++) {
  for (let i = 0; i < 3; i++) {
    BLOCKS.push({ x0: xs[i * 2], x1: xs[i * 2 + 1], z0: zs[j * 2], z1: zs[j * 2 + 1] })
  }
}

export const BILLBOARD = { x: 0, z: -18, rotation: Math.PI / 4 }
export const POND = { x: -14.2, z: 18.4, r: 1.7 }

const footprints = buildings.map((b) => ({
  x: b.position[0],
  z: b.position[1],
  hw: b.size[0] / 2 + 1.3,
  hd: b.size[1] / 2 + 2.6,
}))

function isFree(x: number, z: number) {
  if (Math.abs(x) > ISLAND - 0.9 || Math.abs(z) > ISLAND - 0.9) return false
  for (const r of ROADS_X) if (Math.abs(x - r) < ROAD_W / 2 + 1.1) return false
  for (const r of ROADS_Z) if (Math.abs(z - r) < ROAD_W / 2 + 1.1) return false
  for (const f of footprints) if (Math.abs(x - f.x) < f.hw && Math.abs(z - f.z) < f.hd && z < f.z + f.hd) return false
  if (Math.hypot(x - BILLBOARD.x, z - BILLBOARD.z) < 3.4) return false
  if (Math.hypot(x - POND.x, z - POND.z) < POND.r + 0.6) return false
  return true
}

export type TreeSpec = { x: number; z: number; s: number; kind: "round" | "pine"; hue: number; delay: number }

/** Deterministic scatter of trees on free ground. */
export function makeTrees(max: number): TreeSpec[] {
  const out: TreeSpec[] = []
  let seed = 1
  for (let gx = -ISLAND + 1.5; gx <= ISLAND - 1.5; gx += 2.3) {
    for (let gz = -ISLAND + 1.5; gz <= ISLAND - 1.5; gz += 2.3) {
      seed++
      const x = gx + (rand(seed) - 0.5) * 1.4
      const z = gz + (rand(seed + 99) - 0.5) * 1.4
      if (!isFree(x, z)) continue
      if (rand(seed + 7) < 0.35) continue
      out.push({
        x,
        z,
        s: 0.75 + rand(seed + 3) * 0.5,
        kind: rand(seed + 5) < 0.35 ? "pine" : "round",
        hue: Math.floor(rand(seed + 11) * 3),
        delay: rand(seed + 13),
      })
    }
  }
  // Keep a spread-out subset when capped (low quality).
  if (out.length <= max) return out
  const step = out.length / max
  return Array.from({ length: max }, (_, i) => out[Math.floor(i * step)])
}

/** Streetlights along both sides of each road, skipping intersections. */
export function makeLamps(): { x: number; z: number; th: number }[] {
  const out: { x: number; z: number; th: number }[] = []
  const off = ROAD_W / 2 + 0.45
  let k = 0
  for (const rx of ROADS_X) {
    for (let z = -ISLAND + 2.5; z < ISLAND - 1; z += 5.2) {
      if (ROADS_Z.some((rz) => Math.abs(z - rz) < 2.4)) continue
      const side = k % 2 ? 1 : -1
      out.push({ x: rx + off * side, z, th: 0.2 + rand(k++ * 17) * 0.55 })
    }
  }
  for (const rz of ROADS_Z) {
    for (let x = -ISLAND + 2.5; x < ISLAND - 1; x += 5.2) {
      if (ROADS_X.some((rx) => Math.abs(x - rx) < 2.4)) continue
      const side = k % 2 ? 1 : -1
      out.push({ x, z: rz + off * side, th: 0.2 + rand(k++ * 17) * 0.55 })
    }
  }
  return out
}

// ---------- paths for cars, people and the scooter ----------

export type Path = { pts: [number, number][]; closed: boolean; length: number; seg: number[] }

export function makePath(pts: [number, number][], closed = true): Path {
  const seg: number[] = [0]
  let length = 0
  const n = closed ? pts.length : pts.length - 1
  for (let i = 0; i < n; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    length += Math.hypot(b[0] - a[0], b[1] - a[1])
    seg.push(length)
  }
  return { pts, closed, length, seg }
}

/** Position along a path at distance d (wraps for closed paths). Writes into out. */
export function samplePath(p: Path, d: number, out: { x: number; z: number }) {
  let dist = p.closed ? ((d % p.length) + p.length) % p.length : Math.min(Math.max(d, 0), p.length)
  let i = 0
  while (i < p.seg.length - 2 && dist > p.seg[i + 1]) i++
  const a = p.pts[i]
  const b = p.pts[(i + 1) % p.pts.length]
  const segLen = p.seg[i + 1] - p.seg[i] || 1
  dist = (dist - p.seg[i]) / segLen
  out.x = a[0] + (b[0] - a[0]) * dist
  out.z = a[1] + (b[1] - a[1]) * dist
  return out
}

const LANE = 0.55
const END = ISLAND - 1.6

/** Car loops: each road as a long two-lane loop with U-turns at the island edge, plus the ring around the school. */
export const CAR_PATHS: Path[] = [
  makePath([
    [ROADS_X[0] - LANE, ROADS_Z[0] - LANE],
    [ROADS_X[0] - LANE, ROADS_Z[1] + LANE],
    [ROADS_X[1] + LANE, ROADS_Z[1] + LANE],
    [ROADS_X[1] + LANE, ROADS_Z[0] - LANE],
  ]),
  ...ROADS_Z.map((z) =>
    makePath([
      [-END, z + LANE],
      [END, z + LANE],
      [END, z - LANE],
      [-END, z - LANE],
    ])
  ),
  ...ROADS_X.map((x) =>
    makePath([
      [x - LANE, -END],
      [x - LANE, END],
      [x + LANE, END],
      [x + LANE, -END],
    ])
  ),
]

/** People walk loops just inside the sidewalks of each block. */
export const WALK_PATHS: Path[] = BLOCKS.map((b) => {
  const i = 0.45
  return makePath([
    [b.x0 + i, b.z0 + i],
    [b.x1 - i, b.z0 + i],
    [b.x1 - i, b.z1 - i],
    [b.x0 + i, b.z1 - i],
  ])
})

/** Delivery scooter: from the restaurant to my house along the roads (rides there and back). */
export const SCOOTER_PATH = makePath(
  [
    [14.5, -9.4],
    [14.5, ROADS_Z[0] + 0.5],
    [ROADS_X[1] + 0.5, ROADS_Z[0] + 0.5],
    [ROADS_X[1] + 0.5, ROADS_Z[1] + 0.5],
    [0.6, ROADS_Z[1] + 0.5],
    [0.6, 9.2],
  ],
  false
)
