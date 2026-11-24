"use client"

import { m } from "framer-motion"
import { BarChart3, Briefcase, Disc3, FileText, Map as MapIcon, Settings, Smartphone, X } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"

import { DisplayTitle } from "@/components/ui/Gradient"
import { setPrefs, usePrefs, useMotionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { closePause, getUI, openPause, openPhone, openWheel, useUI } from "@/lib/ui"
import { cn } from "@/lib/utils"

/**
 * Pause menu (Esc anywhere, or the Menu button): Map · Missions · Stats · Skills wheel · Phone ·
 * Settings · Recruiter mode. A native modal <dialog>: focus stays inside, the page behind is inert, Esc closes.
 * ↑/↓ move between items. Full screen on desktop, a bottom sheet on phones.
 */
export function PauseMenu() {
  const { pause } = useUI()
  const dialog = useRef<HTMLDialogElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const prefs = usePrefs()
  const reduced = useMotionReduced()
  const [settingsOpen, setSettingsOpen] = useState(false)

  // Esc opens the menu when nothing else is open. Overlays that use Esc themselves (the phone,
  // MISSION PASSED) call preventDefault(), or are detected through the UI store.
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return
      const ui = getUI()
      if (ui.pause || ui.phone) return
      if (document.querySelector("dialog[open]")) return
      e.preventDefault()
      play("click")
      openPause()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (pause && !d.open) {
      d.showModal()
      d.querySelector<HTMLElement>("[data-pause-item]")?.focus()
    }
    if (!pause && d.open) d.close()
  }, [pause])

  // Close when the route changes (an item navigated).
  useEffect(() => closePause(), [pathname])

  const go = (href: string) => {
    play("click")
    closePause()
    router.push(href)
  }

  const onListKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    e.preventDefault()
    const items = [...(dialog.current?.querySelectorAll<HTMLElement>("[data-pause-item]") ?? [])]
    const i = items.indexOf(document.activeElement as HTMLElement)
    items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus()
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Pause menu"
      onClose={() => {
        closePause()
        setSettingsOpen(false)
      }}
      onClick={(e) => e.target === e.currentTarget && closePause()}
      className="m-0 mt-auto h-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border-t border-ink/15 bg-bg p-0 text-ink backdrop:bg-bg/70 backdrop:backdrop-blur-sm lg:mt-0 lg:h-dvh lg:max-h-none lg:rounded-none lg:border-0 lg:bg-bg/92"
    >
      {pause && (
        <m.div
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.15 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto grid max-w-6xl gap-8 px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:min-h-dvh lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16 lg:px-10"
        >
          <div aria-hidden="true" className="mx-auto h-1.5 w-12 rounded-full bg-ink/25 lg:hidden" />
          <div className="flex items-start justify-between gap-4 lg:block">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">Game paused</p>
              <DisplayTitle as="h2" className="mt-2 text-6xl lg:text-[9rem]">
                Paused
              </DisplayTitle>
              <p className="mt-4 hidden max-w-[40ch] text-muted lg:block">Use ↑ ↓ and Enter, or click. Esc resumes.</p>
              <p className="mt-2 hidden max-w-[40ch] text-sm text-muted/80 lg:block">Psst: some words do things here. Type one anywhere.</p>
            </div>
            <button
              type="button"
              onClick={closePause}
              className="hud-panel inline-flex size-11 shrink-0 items-center justify-center rounded-xl lg:absolute lg:top-6 lg:right-10"
              aria-label="Resume (close the menu)"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <nav aria-label="Pause menu" onKeyDown={onListKey}>
            <ul className="grid gap-1.5">
              <Item index={0} reduced={reduced} icon={<MapIcon />} label="Map" hint="All missions on Greater Tunis" onClick={() => go("/")} />
              <Item index={1} reduced={reduced} icon={<Briefcase />} label="Missions" hint="The mission list" onClick={() => go("/#missions")} />
              <Item index={2} reduced={reduced} icon={<BarChart3 />} label="Stats" hint="Skills and career stats" onClick={() => go("/stats")} />
              <Item index={3} reduced={reduced} icon={<Disc3 />} label="Skills wheel" hint="The whole stack (or hold Q)" onClick={() => openWheel()} />
              <Item
                index={4}
                reduced={reduced}
                icon={<Smartphone />}
                label="Phone"
                hint="Message Seyf, contacts"
                onClick={() => openPhone()}
              />
              <li>
                <Item
                  index={5}
                  reduced={reduced}
                  icon={<Settings />}
                  label="Settings"
                  hint="Sound, motion"
                  expanded={settingsOpen}
                  asLi={false}
                  onClick={() => setSettingsOpen((o) => !o)}
                />
                {settingsOpen && (
                  <div className="mt-1.5 grid gap-1.5 rounded-xl border border-ink/10 bg-surface p-3">
                    <Toggle label="Sound" detail="Subtle UI sounds (off by default)" on={prefs.sound} onChange={(v) => setPrefs({ sound: v })} />
                    <Toggle label="Reduce motion" detail="No loading sequence, no map flights, instant overlays" on={prefs.reduceMotion} onChange={(v) => setPrefs({ reduceMotion: v })} />
                  </div>
                )}
              </li>
              <Item index={6} reduced={reduced} icon={<FileText />} label="Recruiter mode" hint="Plain one-page CV" onClick={() => go("/cv")} accent />
            </ul>
          </nav>
        </m.div>
      )}
    </dialog>
  )
}

function Item({
  index,
  icon,
  label,
  hint,
  onClick,
  accent,
  expanded,
  reduced,
  asLi = true,
}: {
  index: number
  icon: ReactNode
  label: string
  hint: string
  onClick: () => void
  accent?: boolean
  expanded?: boolean
  reduced: boolean
  asLi?: boolean
}) {
  const button = (
    <m.button
      type="button"
      data-pause-item
      onClick={onClick}
      aria-expanded={expanded}
      initial={reduced ? false : { opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: reduced ? 0 : 0.05 + index * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group flex w-full items-center gap-4 rounded-xl border border-transparent px-4 py-3 text-left transition-colors",
        "hover:border-ink/15 hover:bg-surface focus-visible:border-gold focus-visible:bg-surface focus-visible:outline-none"
      )}
    >
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-muted transition-colors group-hover:text-gold group-focus-visible:text-gold [&>svg]:size-5">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block font-display text-3xl leading-none lg:text-4xl", accent ? "text-gold" : "text-ink")}>{label}</span>
        <span className="mt-1 block text-sm text-muted">{hint}</span>
      </span>
      <span aria-hidden="true" className="h-8 w-1 rounded-full bg-sunset opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
    </m.button>
  )
  return asLi ? <li>{button}</li> : button
}

function Toggle({ label, detail, on, onChange }: { label: string; detail: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      data-pause-item
      onClick={() => {
        onChange(!on)
        play("tap")
      }}
      className="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-left hover:bg-surface-2 focus-visible:bg-surface-2"
    >
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm text-muted">{detail}</span>
      </span>
      <span aria-hidden="true" className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-sunset" : "bg-ink/20")}>
        <span className={cn("absolute top-1 left-1 size-5 rounded-full bg-ink transition-transform", on && "translate-x-5 bg-bg")} />
      </span>
    </button>
  )
}
