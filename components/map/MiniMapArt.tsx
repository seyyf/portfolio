import { coastPath, lakePath, landPath, roads, sebkhaArianaPath, sebkhaSijoumiPath, WORLD } from "@/components/map/geometry"

// A light version of the map (same geometry, fewer layers) for the HUD minimap and the phone
// preview. No hooks, so it renders on the server or inside client components.

export type MiniDot = { id: string; x: number; y: number; tone: "mission" | "side" | "tutorial" | "locked" }

const dotFill: Record<MiniDot["tone"], string> = { mission: "#ff8a3d", side: "#ffc94a", tutorial: "#4fb7c4", locked: "#b4a3c4" }

export function MiniMapArt({
  viewBox,
  idPrefix,
  dots = [],
  here,
  dotRadius = 14,
  className,
}: {
  viewBox: string
  /** Unique per instance: SVG ids are document-global. */
  idPrefix: string
  dots?: MiniDot[]
  here?: { x: number; y: number; r: number }
  dotRadius?: number
  className?: string
}) {
  const coast = `${idPrefix}-coast`
  const glow = `${idPrefix}-glow`
  return (
    <svg viewBox={viewBox} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <linearGradient id={coast} gradientUnits="userSpaceOnUse" x1="1300" y1="-100" x2="1500" y2="1000">
          <stop offset="0" stopColor="#ff4fa3" />
          <stop offset="0.55" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#ffc94a" />
        </linearGradient>
        <radialGradient id={glow} gradientUnits="userSpaceOnUse" cx="1780" cy="80" r="900">
          <stop offset="0" stopColor="#ff4fa3" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={WORLD.x} y={WORLD.y} width={WORLD.w} height={WORLD.h} fill="#1a1a40" />
      <rect x={WORLD.x} y={WORLD.y} width={WORLD.w} height={WORLD.h} fill={`url(#${glow})`} />
      <path d={landPath} fill="#22183b" />
      <g fill="none" stroke="#fff1e6" strokeOpacity="0.2" strokeLinecap="round">
        {roads
          .filter((r) => r.major)
          .map((r) => (
            <path key={r.d} d={r.d} strokeWidth="10" />
          ))}
      </g>
      <path d={coastPath} fill="none" stroke={`url(#${coast})`} strokeWidth="8" />
      <path d={lakePath} fill="#174a66" />
      <path d={sebkhaArianaPath} fill="#1c2c45" />
      <path d={sebkhaSijoumiPath} fill="#1c2c45" />
      {dots.map((d) => (
        <circle key={d.id} cx={d.x} cy={d.y} r={d.tone === "mission" ? dotRadius : dotRadius * 0.75} fill={dotFill[d.tone]} stroke="#140c22" strokeWidth={dotRadius * 0.3} />
      ))}
      {here && (
        <g>
          <circle cx={here.x} cy={here.y} r={here.r * 2.2} fill="#ff4fa3" fillOpacity="0.22" />
          <circle cx={here.x} cy={here.y} r={here.r} fill="#ff4fa3" stroke="#fff1e6" strokeWidth={here.r * 0.35} />
        </g>
      )}
    </svg>
  )
}
