"use client"

import { Compass, Folder, Images, Mail, MessageCircle, Settings } from "lucide-react"
import type { ReactNode } from "react"

import { apps, type AppId, type BrowserSite } from "@/data/apps"
import { formatDay, formatWeekday, useNow } from "@/lib/time"

// Original icon artwork: a soft gradient tile with a simple glyph. Project apps get custom glyphs;
// system apps use lucide glyphs. No third-party OS iconography.

const INK = "#1F2233"

const glyph = (children: ReactNode) => (
  <svg viewBox="0 0 48 48" width="62%" height="62%" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
)

const PROJECT_GLYPHS: Partial<Record<AppId | BrowserSite, ReactNode>> = {
  // A dashboard: card with rising bars and a status dot.
  educaro: glyph(
    <>
      <rect x="7" y="9" width="34" height="30" rx="7" fill="#fff" />
      <path d="M15 31v-6M22 31v-11M29 31v-8" />
      <circle cx="34" cy="16" r="2.6" fill="#7FD3B0" stroke="none" />
    </>
  ),
  // A hanger.
  fripa: glyph(
    <>
      <path d="M24 14a4 4 0 1 1 4 4c-2 0-4 1.2-4 3.5v1" />
      <path d="M24 22.5 7.5 33.2a2 2 0 0 0 1.1 3.8h30.8a2 2 0 0 0 1.1-3.8Z" fill="#fff" />
    </>
  ),
  // A coffee cup with steam.
  order: glyph(
    <>
      <path d="M11 22h22v8a9 9 0 0 1-9 9h-4a9 9 0 0 1-9-9Z" fill="#fff" />
      <path d="M33 25h2.5a4.5 4.5 0 0 1 0 9H32" />
      <path d="M17 9c-1.5 2 1.5 3.5 0 6M24 8c-1.5 2 1.5 3.5 0 6" />
    </>
  ),
  // A ticket with a notch and a perforation.
  uteek: glyph(
    <>
      <path d="M8 15a3 3 0 0 1 3-3h26a3 3 0 0 1 3 3v4a5 5 0 0 0 0 10v4a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3v-4a5 5 0 0 0 0-10Z" fill="#fff" />
      <path d="M29 14v3M29 22v4M29 31v3" />
    </>
  ),
  // A catalog: product grid with a tag.
  eprocat: glyph(
    <>
      <rect x="8" y="8" width="13" height="13" rx="3.5" fill="#fff" />
      <rect x="27" y="8" width="13" height="13" rx="3.5" fill="#fff" />
      <rect x="8" y="27" width="13" height="13" rx="3.5" fill="#fff" />
      <path d="M28 27h8l4 4v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4Z" />
      <circle cx="33" cy="33" r="1.2" fill={INK} />
    </>
  ),
  // A sofa.
  febal: glyph(
    <>
      <path d="M12 23v-5a5 5 0 0 1 5-5h14a5 5 0 0 1 5 5v5" />
      <path d="M8 25a3.5 3.5 0 0 1 7 0v3h18v-3a3.5 3.5 0 0 1 7 0v9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2Z" fill="#fff" />
      <path d="M12 36v3M36 36v3" />
    </>
  ),
  // A glove.
  aurelia: glyph(
    <path
      d="M16 40V24l-3.5-4.5a2.6 2.6 0 0 1 4-3.2L19 19V10.5a2.5 2.5 0 0 1 5 0V18v-9a2.5 2.5 0 0 1 5 0v9-6.5a2.5 2.5 0 0 1 5 0V18v-3.5a2.5 2.5 0 0 1 5 0V29a11 11 0 0 1-11 11Z"
      fill="#fff"
    />
  ),
  // A leaf.
  weedy: glyph(
    <>
      <path d="M10 38C10 20 22 9 39 9c0 17-11 29-29 29Z" fill="#fff" />
      <path d="M10 38 28 20" />
    </>
  ),
}

const SYSTEM_GLYPHS: Partial<Record<AppId, ReactNode>> = {
  browser: <Compass size="58%" strokeWidth={2.2} color={INK} aria-hidden="true" />,
  messages: <MessageCircle size="58%" strokeWidth={2.2} color={INK} fill="#fff" aria-hidden="true" />,
  photos: <Images size="56%" strokeWidth={2.1} color={INK} aria-hidden="true" />,
  settings: <Settings size="60%" strokeWidth={2} color={INK} aria-hidden="true" />,
  files: <Folder size="58%" strokeWidth={2.2} color={INK} fill="#fff" aria-hidden="true" />,
  mail: <Mail size="58%" strokeWidth={2.4} color={INK} aria-hidden="true" />,
}

const SITE_TILES: Record<BrowserSite, [string, string]> = {
  febal: ["#F5D9C4", "#E7B79A"],
  aurelia: ["#CFE6FB", "#9CC9F2"],
  weedy: ["#C9EFC6", "#8FD99B"],
}

/** The coloured tile and glyph for an app (or one of the three browser sites). */
export function AppIconArt({ app, site, className = "" }: { app: AppId; site?: BrowserSite; className?: string }) {
  const a = apps[app]
  const [c1, c2] = site ? SITE_TILES[site] : [a.accent, a.accent2]
  return (
    <span
      className={`relative grid aspect-square place-items-center overflow-hidden rounded-[24%] shadow-[0_2px_6px_rgba(31,34,51,0.16),inset_0_1px_0_rgba(255,255,255,0.6)] ${className}`}
      style={{ background: `linear-gradient(150deg, ${c1}, ${c2})` }}
    >
      {app === "calendar" ? <CalendarGlyph /> : (site && PROJECT_GLYPHS[site]) || PROJECT_GLYPHS[app] || SYSTEM_GLYPHS[app]}
    </span>
  )
}

/** Calendar icon shows today's weekday and date in Tunis. */
function CalendarGlyph() {
  const now = useNow()
  return (
    <span className="flex flex-col items-center leading-none" aria-hidden="true">
      <span className="text-[0.62em] font-semibold text-[#E2505D]">{now ? formatWeekday(now) : " "}</span>
      <span className="mt-[0.06em] font-sans text-[1.55em] font-medium text-ink tabular-nums">{now ? formatDay(now) : " "}</span>
    </span>
  )
}

/** The SeyfOS mark: a rounded phone tile with an "S" made of two arcs. */
export function SeyfOSLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="seyfos-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#A8E6CF" />
          <stop offset="0.5" stopColor="#A0D2EB" />
          <stop offset="1" stopColor="#C3B1E1" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill="url(#seyfos-g)" />
      <path d="M21 10.5c-1.2-1.4-3-2-5-2-3 0-5 1.6-5 3.8 0 4.9 10 2.6 10 7.6 0 2.3-2.1 3.9-5.2 3.9-2.3 0-4.2-.8-5.3-2.3" fill="none" stroke="#1F2233" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}
