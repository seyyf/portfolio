"use client"

import { useId, useState, type FormEvent } from "react"

import { cheats } from "@/data/game"
import { enterCheat, useGame } from "@/lib/game"
import { play } from "@/lib/sound"
import { cn } from "@/lib/utils"

/**
 * Codes: enter a cheat code (the way to do it on a phone; on a keyboard, typing it anywhere works
 * too). Lists the codes found so far, and hints for the rest.
 */
export function CodesApp() {
  const { save, live } = useGame()
  const [value, setValue] = useState("")
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)
  const inputId = useId()
  const resultId = useId()

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    const r = enterCheat(value)
    if (r) {
      const c = cheats.find((x) => x.id === r.id)!
      setResult({ ok: true, text: `${c.code}: ${c.toggle && !r.on ? "deactivated" : "activated"}. ${c.effect}.` })
      setValue("")
    } else {
      play("tap")
      setResult({ ok: false, text: "Nothing happened. Check the hints below." })
    }
  }

  return (
    <div className="px-4 py-4">
      <form onSubmit={submit} className="hud-panel rounded-2xl p-4">
        <label htmlFor={inputId} className="font-mono text-xs tracking-[0.2em] text-gold uppercase">
          Enter a code
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id={inputId}
            data-phone-field-focus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoComplete="off"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            aria-describedby={result ? resultId : undefined}
            className="h-12 min-w-0 flex-1 rounded-xl border border-ink/20 bg-bg px-3 font-mono text-lg tracking-[0.16em] text-ink uppercase placeholder:text-ink/30 focus:border-gold"
            placeholder="HIREME"
          />
          <button type="submit" className="bg-sunset h-12 shrink-0 rounded-xl px-4 font-semibold text-bg">
            Enter
          </button>
        </div>
        <p id={resultId} role="status" className={cn("mt-2 min-h-[1.25rem] text-sm", result?.ok ? "text-gold" : "text-[#ff8cc4]")}>
          {result?.text}
        </p>
      </form>

      <h3 className="mt-6 font-mono text-xs tracking-[0.2em] text-muted uppercase">
        Found · {save.cheats.length}/{cheats.length}
      </h3>
      <ul className="mt-2 grid gap-2">
        {cheats.map((c) => {
          const found = save.cheats.includes(c.id)
          const on = live.active.includes(c.id)
          return (
            <li key={c.id} className="rounded-xl border border-ink/10 bg-surface/70 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("font-mono font-semibold tracking-[0.12em]", found ? "text-gold" : "text-muted")}>{found ? c.code : "?".repeat(c.code.length)}</span>
                {found && c.toggle && (
                  <span className={cn("rounded px-1.5 font-mono text-[0.625rem] tracking-[0.12em] uppercase", on ? "bg-gold/15 text-gold" : "text-muted")}>{on ? "On" : "Off"}</span>
                )}
              </div>
              <p className="mt-0.5 text-sm leading-snug text-ink/80">{found ? c.effect : `Hint: ${c.hint}`}</p>
            </li>
          )
        })}
      </ul>
      <p className="mt-4 text-sm text-muted">On a keyboard, just type a code anywhere on the site.</p>
    </div>
  )
}
