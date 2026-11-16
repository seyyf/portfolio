"use client"

import { setPrefs, usePrefs, useMotionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { cn } from "@/lib/utils"

/** The Settings app: sound and reduce motion (same settings as the pause menu, saved in localStorage). */
export function SettingsApp() {
  const prefs = usePrefs()
  const reduced = useMotionReduced()
  const osReduced = reduced && !prefs.reduceMotion

  return (
    <div className="px-4 py-4">
      <ul className="grid gap-2 rounded-2xl border border-ink/10 bg-surface p-2">
        <li>
          <Switch
            label="Sound"
            detail="Subtle UI sounds. Off by default."
            on={prefs.sound}
            onChange={(v) => {
              setPrefs({ sound: v })
              // Played after the change, so turning sound on gives an audible confirmation.
              play("tap")
            }}
          />
        </li>
        <li>
          <Switch
            label="Reduce motion"
            detail="No map flights, no slides: overlays simply fade."
            on={prefs.reduceMotion}
            onChange={(v) => {
              setPrefs({ reduceMotion: v })
              play("tap")
            }}
          />
        </li>
      </ul>
      {osReduced && <p className="mt-3 px-1 text-sm leading-snug text-muted">Your device also asks for reduced motion, so animations stay minimal either way.</p>}
      <p className="mt-3 px-1 text-sm leading-snug text-muted">Saved in this browser only.</p>
    </div>
  )
}

function Switch({ label, detail, on, onChange }: { label: string; detail: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-left text-ink transition-colors hover:bg-surface-2 focus-visible:bg-surface-2"
    >
      <span>
        <span className="block font-semibold">{label}</span>
        <span className="block text-sm leading-snug text-muted">{detail}</span>
      </span>
      <span aria-hidden="true" className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-sunset" : "bg-ink/20")}>
        <span className={cn("absolute top-1 left-1 size-5 rounded-full transition-transform", on ? "translate-x-5 bg-bg" : "bg-ink")} />
      </span>
    </button>
  )
}
