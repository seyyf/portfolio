"use client"

import { Lock } from "lucide-react"

import { play } from "@/lib/sound"
import { openPhone } from "@/lib/ui"

/** Mission 06, locked. Unlocking it means sending Seyf a message: opens the phone on Messages. */
export function LockedNext({ number, codename, teaser }: { number: string; codename: string; teaser: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        play("pop")
        openPhone("messages")
      }}
      aria-haspopup="dialog"
      className="glow-hover cut-br group relative flex min-h-28 flex-col justify-center gap-1 overflow-hidden rounded-xl border border-dashed border-pink/50 bg-[repeating-linear-gradient(-55deg,rgb(242_181_68/0.05)_0_10px,transparent_10px_20px)] px-5 py-4 text-left transition-colors hover:border-pink sm:items-end sm:text-right"
    >
      <span className="flex items-center gap-2 font-mono text-xs text-pink lowercase">
        <Lock aria-hidden="true" className="size-4 transition-transform group-hover:-rotate-12" />
        Next · Mission {number} · Locked
      </span>
      <span className="font-display text-[1.75rem] text-ink md:text-[2rem]">
        <span>{codename}</span>
      </span>
      <span className="text-[0.9375rem] leading-snug text-muted">{teaser}</span>
    </button>
  )
}
