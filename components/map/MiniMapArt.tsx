import { coastPath, lakePath, landPath, roads, sebkhaArianaPath, sebkhaSijoumiPath, WORLD } from "@/components/map/geometry"

// A light version of the map (same geometry, fewer layers) for the HUD minimap and the phone
// preview. No hooks, so it renders on the server or inside client components.

export type MiniDot = { id: string; x: number; y: number; tone: "mission" | "side" | "tutorial" | "locked" }

const dotFill: Record<MiniDot["tone"], string> = { mission: "#ff5c93", side: "#f2b544", tutorial: "#5ccdb5", locked: "#93a4b8" }

export function MiniMapArt({
  viewBox,
  dots = [],
  here,
  dotRadius = 14,
  className,
}: {
  viewBox: string
  dots?: MiniDot[]
  here?: { x: number; y: number; r: number }
  dotRadius?: number
  className?: string
}) {
  return (
    <svg viewBox={viewBox} aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid slice" className={className}>
      <rect x={WORLD.x} y={WORLD.y} width={WORLD.w} height={WORLD.h} fill="#0a1522" />
      <path d={landPath} fill="#192c42" />
      <g fill="none" stroke="#eef2f5" strokeOpacity="0.2" strokeLinecap="round">
        {roads
          .filter((r) => r.major)
          .map((r) => (
            <path key={r.d} d={r.d} strokeWidth="10" />
          ))}
      </g>
      <path d={coastPath} fill="none" stroke="#ff5c93" strokeOpacity="0.8" strokeWidth="8" />
      <path d={lakePath} fill="#1d4a66" />
      <path d={sebkhaArianaPath} fill="#1a3046" />
      <path d={sebkhaSijoumiPath} fill="#1a3046" />
      {dots.map((d) => (
        <circle key={d.id} cx={d.x} cy={d.y} r={d.tone === "mission" ? dotRadius : dotRadius * 0.75} fill={dotFill[d.tone]} stroke="#0e1b2b" strokeWidth={dotRadius * 0.3} />
      ))}
      {here && (
        <g>
          <circle cx={here.x} cy={here.y} r={here.r * 2.2} fill="#ff6b6b" fillOpacity="0.22" />
          <circle cx={here.x} cy={here.y} r={here.r} fill="#ff6b6b" stroke="#eef2f5" strokeWidth={here.r * 0.35} />
        </g>
      )}
    </svg>
  )
}
