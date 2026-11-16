"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { homePoint } from "@/components/map/geometry"
import { MiniMapArt } from "@/components/map/MiniMapArt"
import { showMap } from "@/components/map/store"
import { districts, missionBySlug } from "@/data/missions"
import { play } from "@/lib/sound"

const R = 250 // half the minimap's view, in map units

/**
 * The HUD minimap (bottom-left): the same map geometry around a "you are here" dot — the
 * mission's district on /missions/[slug], the Tunis Medina elsewhere. On "/" it brings up the
 * full map; elsewhere it links to /#map.
 */
export function Minimap() {
  const pathname = usePathname()
  const slug = pathname.startsWith("/missions/") ? pathname.split("/")[2] : undefined
  const point = (slug && missionBySlug(slug)?.map) || homePoint
  const label = `Open the full map (you are near ${districts[point.district].name})`

  const className =
    "hud-panel group fixed bottom-4 left-4 z-50 block size-[4.5rem] overflow-hidden rounded-full transition-[border-color,box-shadow] hover:border-orange hover:shadow-[var(--glow)] lg:bottom-6 lg:left-6 lg:size-32"
  const inner = (
    <>
      <MiniMapArt
        viewBox={`${point.x - R} ${point.y - R} ${R * 2} ${R * 2}`}
        idPrefix="hud-mm"
        here={{ x: point.x, y: point.y, r: 20 }}
        className="absolute inset-0 size-full opacity-90 transition-transform duration-500 group-hover:scale-110"
      />
      <span aria-hidden="true" className="absolute top-1/2 left-1/2 size-4 -translate-1/2 animate-ping rounded-full bg-pink/50" />
      <span aria-hidden="true" className="absolute inset-0 rounded-full shadow-[inset_0_0_0_2px_rgb(255_138_61/0.55),inset_0_0_18px_rgb(11_15_26/0.9)]" />
      <span aria-hidden="true" className="absolute top-1 left-1/2 -translate-x-1/2 font-mono text-[0.5625rem] leading-none font-bold text-gold lg:top-1.5 lg:text-[0.6875rem]">
        N
      </span>
    </>
  )

  if (pathname === "/") {
    return (
      <button
        type="button"
        aria-label={label}
        title={label}
        onClick={() => {
          play("tap")
          showMap()
        }}
        className={className}
      >
        {inner}
      </button>
    )
  }
  return (
    <Link href="/#map" aria-label={label} title={label} onClick={() => play("tap")} className={className}>
      {inner}
    </Link>
  )
}
