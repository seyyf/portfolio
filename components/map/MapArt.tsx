import { districtCells, districtLabels, coastPath, lakePath, landPath, roads, sebkhaArianaPath, sebkhaSijoumiPath, WORLD } from "@/components/map/geometry"
import type { DistrictId } from "@/data/missions"

// The full map of Greater Tunis: an original flat illustration (sea, coast, lake, districts,
// roads, a few landmarks). Server-rendered SVG; the interactive layer sits on top of it.

const tints = ["#16283c", "#192c42", "#14243a", "#1b2f46", "#172a40"]
const W = WORLD

/** Short shimmer strokes on the gulf. Deterministic, east of the coast. */
const shimmer = Array.from({ length: 16 }, (_, i) => ({ x: 1462 + ((i * 137) % 300), y: 40 + i * 50, w: 26 + ((i * 53) % 60) }))

function Palm({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return <use href="#wm-palm" x={x} y={y} width={36 * s} height={48 * s} />
}

export function MapArt() {
  return (
    <svg viewBox="0 0 1600 1000" aria-hidden="true" focusable="false" className="pointer-events-none absolute inset-0 size-full overflow-visible select-none">
      <defs>
        <linearGradient id="wm-sea" gradientUnits="userSpaceOnUse" x1="0" y1="-700" x2="0" y2="1500">
          <stop offset="0" stopColor="#0f1d30" />
          <stop offset="0.35" stopColor="#0c182a" />
          <stop offset="0.6" stopColor="#0a1522" />
          <stop offset="1" stopColor="#08121e" />
        </linearGradient>
        <radialGradient id="wm-glow" gradientUnits="userSpaceOnUse" cx="1780" cy="80" r="900">
          <stop offset="0" stopColor="#ff5c93" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ff5c93" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wm-lake" gradientUnits="userSpaceOnUse" x1="0" y1="480" x2="0" y2="700">
          <stop offset="0" stopColor="#1d4a66" />
          <stop offset="1" stopColor="#133248" />
        </linearGradient>
        <pattern id="wm-grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M100 0H0V100" fill="none" stroke="#eef2f5" strokeOpacity="0.045" strokeWidth="1.5" />
        </pattern>
        <clipPath id="wm-land-clip">
          <path d={landPath} />
        </clipPath>
        <symbol id="wm-palm" viewBox="0 0 120 160">
          <path d="M56 160 C58 128 64 96 70 54 L76 54 C72 96 66 128 64 160 Z" fill="#2b5b4f" />
          <g transform="translate(73 52)" fill="#3f8a6f">
            <path d="M0 0 C -18 -14, -44 -14, -60 4 C -40 -4, -20 -2, 0 4 Z" />
            <path d="M0 0 C -10 -22, -30 -36, -52 -34 C -32 -26, -16 -14, -2 2 Z" />
            <path d="M0 0 C 4 -24, -2 -44, -14 -52 C -4 -38, -2 -20, 2 0 Z" />
            <path d="M0 0 C 16 -20, 36 -30, 56 -26 C 36 -18, 18 -8, 2 2 Z" />
            <path d="M0 0 C 20 -8, 44 -4, 60 12 C 40 6, 20 4, 0 4 Z" />
          </g>
        </symbol>
      </defs>

      {/* Sea and the pink glow on the gulf */}
      <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="url(#wm-sea)" />
      <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="url(#wm-glow)" />
      <g stroke="#f39ab9" strokeOpacity="0.22" strokeWidth="3" strokeLinecap="round">
        {shimmer.map((s) => (
          <path key={s.y} d={`M${s.x} ${s.y}h${s.w}`} />
        ))}
      </g>

      {/* Land, district cells, grid and roads */}
      <path d={landPath} fill="#15263a" />
      <g clipPath="url(#wm-land-clip)">
        {(Object.entries(districtCells) as [DistrictId, string][]).map(([id, d], i) => (
          <path key={id} d={d} data-cell={id} fill={tints[i % tints.length]} stroke="#eef2f5" strokeOpacity="0.1" strokeWidth="2" strokeDasharray="4 10" />
        ))}
        <rect x={W.x} y={W.y} width={W.w} height={W.h} fill="url(#wm-grid)" />
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          {roads
            .filter((r) => !r.dashed)
            .map((r) => (
              <g key={r.d}>
                <path d={r.d} stroke="#0e1b2b" strokeOpacity="0.6" strokeWidth={r.major ? 12 : 9} />
                <path d={r.d} stroke={r.major ? "#f2b544" : "#eef2f5"} strokeOpacity={r.major ? 0.32 : 0.16} strokeWidth={r.major ? 5 : 3.5} />
              </g>
            ))}
        </g>
        {/* Tunis–Carthage airport runways */}
        <g stroke="#eef2f5" strokeOpacity="0.14" strokeWidth="7" strokeLinecap="round">
          <path d="M770 318 L880 262" />
          <path d="M800 340 L900 300" />
        </g>
        {/* Bou Kornine, across the gulf */}
        <path d="M1380 1010 L1450 948 L1482 972 L1522 930 L1600 1010 Z" fill="#1c3048" stroke="#eef2f5" strokeOpacity="0.1" strokeWidth="2" />
      </g>

      {/* Coastline with a neon edge */}
      <path d={coastPath} fill="none" stroke="#ff5c93" strokeOpacity="0.16" strokeWidth="16" strokeLinecap="round" />
      <path d={coastPath} fill="none" stroke="#ff5c93" strokeWidth="3" strokeLinecap="round" />

      {/* Lake of Tunis and the salt flats */}
      <path d={lakePath} fill="url(#wm-lake)" stroke="#2f6db5" strokeOpacity="0.8" strokeWidth="2.5" />
      <path d={sebkhaArianaPath} fill="#1a3046" stroke="#2f6db5" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="2 7" />
      <path d={sebkhaSijoumiPath} fill="#1a3046" stroke="#2f6db5" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="2 7" />
      {/* The causeway across the lake to La Goulette */}
      {roads
        .filter((r) => r.dashed)
        .map((r) => (
          <path key={r.d} d={r.d} fill="none" stroke="#eef2f5" strokeOpacity="0.4" strokeWidth="3" strokeDasharray="10 8" strokeLinecap="round" />
        ))}

      {/* Landmarks */}
      <g fill="#eef2f5">
        {/* Medina: a square minaret */}
        <g transform="translate(765 705)" opacity="0.55">
          <rect x="-8" y="-30" width="16" height="44" />
          <rect x="-11" y="-34" width="22" height="5" />
          <rect x="-4" y="-46" width="8" height="12" />
          <rect x="-2" y="-22" width="4" height="7" fill="#15263a" />
        </g>
        {/* Carthage: columns */}
        <g transform="translate(1205 374)" opacity="0.5">
          <rect x="-20" y="-22" width="40" height="5" />
          <rect x="-17" y="-17" width="6" height="30" />
          <rect x="-3" y="-17" width="6" height="30" />
          <rect x="11" y="-10" width="6" height="23" />
          <rect x="-22" y="13" width="44" height="5" />
        </g>
        {/* Sidi Bou Said: a white house with a blue door */}
        <g transform="translate(1330 246)">
          <rect x="-13" y="-10" width="26" height="20" />
          <path d="M-7 -10 a7 7 0 0 1 14 0 Z" />
          <path d="M-3 10 V3 a3 3 0 0 1 6 0 V10 Z" fill="#2f6db5" />
        </g>
      </g>
      <Palm x={1302} y={36} />
      <Palm x={1322} y={150} s={0.9} />
      <Palm x={1352} y={462} />
      <Palm x={1214} y={706} s={0.9} />
      <Palm x={560} y={600} s={0.8} />

      {/* District names */}
      <g className="font-mono" fontSize="19" letterSpacing="3" fill="#eef2f5" fillOpacity="0.62">
        {districtLabels.map((l) => (
          <text key={l.id} x={l.x} y={l.y} textAnchor={l.anchor} dominantBaseline="middle">
            {l.name.toUpperCase()}
          </text>
        ))}
      </g>
      <g className="font-mono" fontSize="14" letterSpacing="2.5" fill="#8fb4e0" fillOpacity="0.75" textAnchor="middle">
        <text x="935" y="648">LAKE OF TUNIS</text>
        <text x="910" y="174">SEBKHA ARIANA</text>
        <text x="476" y="764">SEBKHA SIJOUMI</text>
      </g>
      <text x="1530" y="540" transform="rotate(90 1530 540)" textAnchor="middle" className="font-display" fontSize="34" letterSpacing="10" fill="#eef2f5" fillOpacity="0.2">
        GULF OF TUNIS
      </text>

      {/* Compass */}
      <g transform="translate(1508 792)" fill="none" stroke="#eef2f5" strokeOpacity="0.35" strokeWidth="2">
        <circle r="34" />
        <path d="M0 -46 L7 0 L0 46 L-7 0 Z" fill="#eef2f5" fillOpacity="0.12" />
        <path d="M0 -46 L7 0 L-7 0 Z" fill="#ff9a5c" stroke="none" />
        <text y="-56" textAnchor="middle" className="font-mono" fontSize="16" fill="#eef2f5" fillOpacity="0.6" stroke="none">
          N
        </text>
      </g>
    </svg>
  )
}
