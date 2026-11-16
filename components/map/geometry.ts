import { districts, type DistrictId } from "@/data/missions"

// Stylized geometry of Greater Tunis, drawn for this site (no satellite or survey data).
// Units are the world map's viewBox: 0 0 1600 1000. The sea is east, the Lake of Tunis sits
// between the Medina and La Goulette. Shared by the full map, the mobile preview and the minimap.

export type Pt = readonly [number, number]

export const VIEW = { w: 1600, h: 1000 } as const
/** The art keeps going past the viewBox so panning never shows an edge. */
export const WORLD = { x: -1500, y: -1200, w: 4300, h: 3200 } as const

const r1 = (n: number) => Math.round(n * 10) / 10

/** Catmull-Rom spline through the points, as SVG cubic Béziers. Keeps the point count tiny. */
export function smoothPath(points: readonly Pt[], closed = false): string {
  const n = points.length
  if (n < 2) return ""
  const at = (i: number): Pt => (closed ? points[(i + n) % n] : points[Math.max(0, Math.min(n - 1, i))])
  let d = `M${r1(points[0][0])} ${r1(points[0][1])}`
  const segments = closed ? n : n - 1
  for (let i = 0; i < segments; i++) {
    const p0 = at(i - 1)
    const p1 = at(i)
    const p2 = at(i + 1)
    const p3 = at(i + 2)
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`
  }
  return closed ? d + "Z" : d
}

/** The coast from north (Gammarth) past La Marsa, the Carthage cape and La Goulette, then south-east along the gulf. */
export const coastPoints: Pt[] = [
  [1150, -300],
  [1240, -60],
  [1300, 40],
  [1335, 100],
  [1350, 160],
  [1372, 215],
  [1415, 245],
  [1452, 282],
  [1440, 322],
  [1412, 352],
  [1398, 400],
  [1402, 455],
  [1395, 505],
  [1372, 548],
  [1330, 585],
  [1282, 615],
  [1248, 648],
  [1238, 690],
  [1262, 738],
  [1316, 782],
  [1395, 830],
  [1480, 872],
  [1580, 905],
  [1700, 925],
  [2000, 960],
  [2800, 1000],
]

export const coastPath = smoothPath(coastPoints)
/** Land = everything west of the coast, extended past the viewBox. */
export const landPath = `${coastPath}L2800 2000L-1500 2000L-1500 -1200L1100 -1200Z`

export const lakePath = smoothPath(
  [
    [800, 520],
    [860, 494],
    [960, 488],
    [1040, 500],
    [1078, 540],
    [1082, 600],
    [1046, 646],
    [966, 676],
    [884, 686],
    [820, 664],
    [788, 616],
    [784, 562],
  ],
  true
)

export const sebkhaArianaPath = smoothPath(
  [
    [760, 170],
    [820, 130],
    [920, 118],
    [1020, 132],
    [1060, 170],
    [1010, 210],
    [900, 222],
    [800, 210],
  ],
  true
)

export const sebkhaSijoumiPath = smoothPath(
  [
    [350, 760],
    [400, 712],
    [480, 696],
    [570, 716],
    [600, 760],
    [560, 808],
    [470, 824],
    [385, 808],
  ],
  true
)

/** Main roads: the north expressway along the lake to La Marsa, the lake causeway, radial roads. */
export const roads: { d: string; major?: boolean; dashed?: boolean }[] = [
  { d: smoothPath([[720, 590], [800, 505], [930, 440], [1080, 400], [1180, 330], [1250, 220], [1300, 120], [1320, 40], [1300, -200]]), major: true },
  { d: smoothPath([[720, 600], [900, 600], [1080, 610], [1180, 640], [1250, 664]]), dashed: true },
  { d: smoothPath([[700, 610], [690, 500], [650, 400], [620, 300], [600, 180], [560, -100]]) },
  { d: smoothPath([[700, 610], [600, 560], [520, 525], [420, 540], [300, 565], [100, 580], [-300, 600]]) },
  { d: smoothPath([[700, 620], [730, 720], [770, 820], [800, 950], [830, 1300]]), major: true },
  { d: smoothPath([[1250, 655], [1300, 560], [1335, 460], [1355, 380], [1385, 300], [1360, 200], [1330, 110]]) },
  { d: smoothPath([[790, 820], [950, 780], [1100, 762], [1260, 752], [1400, 900]]) },
  { d: smoothPath([[600, 160], [470, 300], [420, 500], [450, 700], [600, 870], [790, 900]]) },
]

/** District cells (a Voronoi split of the district centres), clipped to the land when drawn. */
export const districtCells: Record<DistrictId, string> = {
  manouba: "M-1500 -1200L-947 -1200L362 278L460 814L-236 2000L-1500 2000Z",
  bardo: "M460 814L362 278L670 426L516 771Z",
  ariana: "M-947 -1200L650 -1200L932 101L741 416L670 426L362 278Z",
  medina: "M516 771L670 426L741 416L931 659L931 663Z",
  lac: "M1090 494L931 659L741 416L932 101L1108 289Z",
  "la-goulette": "M2800 1263L2800 2000L1518 2000L931 663L931 659L1090 494Z",
  carthage: "M2800 1175L2800 1263L1090 494L1108 289L1138 289Z",
  "sidi-bou-said": "M2800 -542L2800 1175L1138 289Z",
  "la-marsa": "M650 -1200L2800 -1200L2800 -542L1138 289L1108 289L932 101Z",
  "ben-arous": "M1518 2000L-236 2000L460 814L516 771L931 663Z",
}

/**
 * Where each district's name is drawn. Based on the label positions in data/missions.ts, nudged
 * so the names never sit under a mission marker.
 */
export const districtLabels: { id: DistrictId; name: string; x: number; y: number; anchor: "start" | "middle" | "end" }[] = (
  [
    ["manouba", 230, 498, "middle"],
    ["bardo", 520, 522, "middle"],
    ["ariana", 620, 262, "middle"],
    ["medina", 632, 650, "end"],
    ["lac", 920, 396, "middle"],
    ["la-goulette", 1176, 604, "start"],
    ["carthage", 1290, 440, "start"],
    ["sidi-bou-said", 1362, 292, "start"],
    ["la-marsa", 1290, 128, "start"],
    ["ben-arous", 826, 818, "start"],
  ] as const
).map(([id, x, y, anchor]) => ({ id, name: districts[id].name, x, y, anchor }))

/** The point the full map frames first: every marker plus a strip of sea. */
export const FRAME = { x: 220, y: 120, w: 1340, h: 760 } as const

/** "You are here" when the page is not a mission: the Medina. */
export const homePoint = { x: districts.medina.x, y: districts.medina.y, district: "medina" as DistrictId }
