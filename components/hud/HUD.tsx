"use client"

import { Menu, Smartphone } from "lucide-react"
import { usePathname } from "next/navigation"

import { Minimap } from "@/components/hud/Minimap"
import { PauseMenu } from "@/components/hud/PauseMenu"
import { RecruiterButton } from "@/components/hud/RecruiterButton"
import { Phone } from "@/components/phone/Phone"
import { profile } from "@/data/profile"
import { play } from "@/lib/sound"
import { openPause, openPhone, useUI } from "@/lib/ui"
import { cn } from "@/lib/utils"

/**
 * The fixed HUD on every page except the CV: recruiter button (top-left), name + career line
 * (top-right), minimap (bottom-left), phone (bottom-right) and the pause menu button.
 */
export function HUD() {
  const pathname = usePathname()
  const { phone } = useUI()
  if (pathname === "/cv") return null

  return (
    <div className="no-print">
      {/* Phones: soft fades behind the top and bottom HUD bands, so text never runs under the controls. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-40 h-20 bg-gradient-to-b from-bg via-bg/75 to-transparent lg:hidden" />
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-28 bg-gradient-to-t from-bg via-bg/85 to-transparent lg:hidden" />
      <RecruiterButton />

      {/* Pause menu: next to the recruiter button on desktop, bottom centre on phones. */}
      <button
        type="button"
        onClick={() => {
          play("click")
          openPause()
        }}
        aria-label="Open the menu (Esc)"
        aria-keyshortcuts="Escape"
        className={cn(
          "hud-panel fixed z-50 inline-flex items-center gap-2 rounded-full font-mono text-xs tracking-[0.12em] text-ink uppercase transition-colors hover:border-gold hover:text-gold",
          "bottom-4 left-1/2 h-12 -translate-x-1/2 px-5",
          "lg:top-4 lg:bottom-auto lg:left-[10.25rem] lg:h-11 lg:translate-x-0 lg:rounded-lg lg:px-3.5"
        )}
      >
        <Menu aria-hidden="true" className="size-4" />
        Menu
        <kbd className="hidden rounded border border-ink/25 px-1 text-[0.625rem] lg:inline">Esc</kbd>
      </button>

      {/* Name and career line. */}
      <div className="pointer-events-none fixed top-3 right-3 z-50 text-right lg:top-4 lg:right-5">
        <p className="font-display text-[1.375rem] leading-none tracking-[0.02em] text-ink drop-shadow-[0_2px_8px_rgb(0_0_0/0.6)] lg:text-[2rem]">
          <span className="lean">{profile.name}</span>
        </p>
        <p className="mt-1 font-mono text-[0.625rem] tracking-[0.14em] text-ink/80 lg:text-xs">{profile.hudLine}</p>
      </div>

      <Minimap />

      <button
        type="button"
        onClick={() => openPhone()}
        data-phone-button
        aria-label="Open the phone: message Seyf, contacts, map and settings"
        aria-expanded={phone !== null}
        className="hud-panel group fixed right-4 bottom-4 z-50 flex size-14 items-center justify-center rounded-2xl text-ink transition-[border-color,box-shadow] hover:border-orange hover:shadow-[var(--glow)] lg:right-6 lg:bottom-6 lg:size-16"
      >
        <Smartphone aria-hidden="true" className="size-6 transition-transform group-hover:-rotate-6 lg:size-7" />
        <span aria-hidden="true" className="absolute -top-1 -right-1 size-3 rounded-full bg-pink ring-2 ring-bg" />
      </button>

      <Phone />
      <PauseMenu />
    </div>
  )
}
