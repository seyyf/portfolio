"use client"

import { X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"

import { missions } from "@/data/missions"
import { segmentsFor, statTabs, type SkillStatus, type StatTab } from "@/data/skills"
import { play } from "@/lib/sound"
import { closeWheel, getUI, useUI } from "@/lib/ui"
import { cn } from "@/lib/utils"

/*
 * The skills wheel: the Stats page's categories as a radial menu. Hold Q (or tap Q, or open it from
 * the pause menu, the phone or the Stats page), point at a slice or use ← →, and the panel shows
 * that category's skills and the missions they were used on. A native modal <dialog>.
 */

const N = statTabs.length
const SLICE = 360 / N
const GAP = 1.6 // degrees between slices
const R_OUT = 97
const R_IN = 47
const R_LABEL = (R_OUT + R_IN) / 2

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return [+(r * Math.sin(a)).toFixed(2), +(-r * Math.cos(a)).toFixed(2)] as const
}

/** An annular slice centred on angle i·SLICE (clockwise from the top). */
function slicePath(i: number) {
  const a0 = i * SLICE - SLICE / 2 + GAP / 2
  const a1 = i * SLICE + SLICE / 2 - GAP / 2
  const [ox0, oy0] = pt(R_OUT, a0)
  const [ox1, oy1] = pt(R_OUT, a1)
  const [ix1, iy1] = pt(R_IN, a1)
  const [ix0, iy0] = pt(R_IN, a0)
  return `M${ox0} ${oy0} A${R_OUT} ${R_OUT} 0 0 1 ${ox1} ${oy1} L${ix1} ${iy1} A${R_IN} ${R_IN} 0 0 0 ${ix0} ${iy0} Z`
}

// Skill names as the CV writes them vs. the gear lists on mission pages.
const ALIASES: Record<string, string[]> = {
  JavaScript: ["React", "Angular", "Node.js", "Next.js", "Vue.js"],
  "Git (GitHub, GitLab, Bitbucket)": ["GitHub", "GitLab", "GitLab CI/CD", "Bitbucket"],
}

/** The main missions whose gear includes any skill of the category. */
function usedOn(tab: StatTab) {
  const names = new Set(tab.skills.flatMap((s) => [s.name, ...(ALIASES[s.name] ?? [])]))
  return missions.filter((m) => m.gear.some((g) => names.has(g)))
}

const STATUS_COLOR: Record<SkillStatus, string> = {
  "Daily use": "text-pink",
  Production: "text-orange",
  Experienced: "text-ink",
  Native: "text-pink",
  C1: "text-orange",
  B2: "text-ink",
}

export function SkillsWheel() {
  const { wheel } = useUI()
  const dialog = useRef<HTMLDialogElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const radios = useRef<(HTMLButtonElement | null)[]>([])
  const opener = useRef<HTMLElement | null>(null)
  // Stays mounted once loaded, so the last category is still selected next time.
  const [sel, setSel] = useState(0)
  const pathname = usePathname()

  const select = (i: number, { focus = false } = {}) => {
    const next = ((i % N) + N) % N
    if (next !== sel) play("tap")
    setSel(next)
    if (focus) radios.current[next]?.focus()
  }

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (wheel && !d.open) {
      const active = document.activeElement
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null
      d.showModal()
      d.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')?.focus({ preventScroll: true })
    }
    if (!wheel && d.open) {
      d.close()
      const back = opener.current
      opener.current = null
      if (back?.isConnected) back.focus({ preventScroll: true })
    }
  }, [wheel])

  // A mission link inside the wheel navigated: put it away.
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    if (getUI().wheel) closeWheel()
  }, [pathname])

  /** Pointing selects: the slice under the pointer's angle, outside the hub. */
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return
    const el = ring.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const dist = Math.hypot(dx, dy) / (r.width / 2)
    if (dist < R_IN / 100 || dist > 1.02) return
    const deg = ((Math.atan2(dx, -dy) * 180) / Math.PI + 360) % 360
    select(Math.round(deg / SLICE) % N)
  }

  const onRadioKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
    if (!step) return
    e.preventDefault()
    select(sel + step, { focus: true })
  }

  const tab = statTabs[sel]
  const used = usedOn(tab)

  return (
    <dialog
      ref={dialog}
      aria-labelledby="wheel-title"
      onCancel={(e) => {
        e.preventDefault()
        closeWheel()
      }}
      onClose={() => {
        if (getUI().wheel) closeWheel()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeWheel()
      }}
      className="no-print fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-y-auto bg-transparent p-0 text-ink backdrop:bg-bg/75 backdrop:backdrop-blur-[3px]"
    >
      {wheel && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeWheel()
          }}
          className="wheel-in mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-6 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] lg:grid lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)] lg:gap-12 lg:px-8"
        >
          <div className="flex w-full items-start justify-between gap-4 lg:col-span-2">
            <div>
              <p className="font-mono text-xs text-muted lowercase">Hold Q · ← → to switch · Esc to close</p>
              <h2 id="wheel-title" className="mt-1 font-display text-4xl text-ink lg:text-5xl">
                <span className="text-pink">Skills wheel</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={() => closeWheel()}
              aria-label="Close the skills wheel"
              className="hud-panel inline-flex size-11 shrink-0 items-center justify-center rounded-xl hover:border-pink hover:text-pink"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          {/* The wheel. The SVG is decoration; the labels are the radio buttons. */}
          <div ref={ring} onPointerMove={onPointerMove} className="relative aspect-square w-[min(84vw,26rem)] shrink-0 lg:w-full lg:max-w-[32rem]">
            <svg viewBox="-100 -100 200 200" aria-hidden="true" className="absolute inset-0 size-full drop-shadow-[0_20px_50px_rgb(0_0_0/0.25)]">
              {statTabs.map((t, i) => (
                <path
                  key={t.id}
                  d={slicePath(i)}
                  onClick={() => select(i, { focus: true })}
                  className={cn("cursor-pointer transition-[fill,opacity] duration-150", i === sel ? "fill-pink" : "fill-[#15263a]/90 stroke-ink/15 hover:fill-[#1c3048]")}
                  strokeWidth="0.6"
                />
              ))}
              <circle r={R_IN - 4} className="fill-bg/95 stroke-ink/15" strokeWidth="0.6" />
            </svg>

            <div role="radiogroup" aria-label="Skill categories" onKeyDown={onRadioKey}>
              {statTabs.map((t, i) => {
                const [x, y] = pt(R_LABEL, i * SLICE)
                const on = i === sel
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      radios.current[i] = el
                    }}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(i, { focus: true })}
                    style={{ left: `${50 + x / 2}%`, top: `${50 + y / 2}%` }}
                    className={cn(
                      "absolute flex -translate-1/2 flex-col items-center rounded-lg px-2 py-1 font-display text-base leading-none sm:text-xl",
                      on ? "text-bg" : "text-ink/85 hover:text-ink"
                    )}
                  >
                    <span className={cn(on && "lean")}>{t.label}</span>
                    <span className={cn("mt-1 font-mono text-[0.625rem] normal-case sm:text-xs", on ? "text-bg/80" : "text-muted")}>{t.skills.length} skills</span>
                  </button>
                )
              })}
            </div>

            {/* The hub: what's selected. */}
            <div aria-hidden="true" className="pointer-events-none absolute top-1/2 left-1/2 flex w-[36%] -translate-1/2 flex-col items-center text-center">
              <span className="font-mono text-[0.625rem] text-pink lowercase sm:text-xs">Equipped</span>
              <span className="mt-1 font-display text-2xl leading-none text-ink sm:text-4xl">
                <span>{tab.label}</span>
              </span>
            </div>
          </div>

          {/* Details for the selected category. */}
          <section aria-live="polite" aria-label={`${tab.label} skills`} className="hud-panel cut-br w-full max-w-[32rem] rounded-t-2xl !bg-bg/95 px-5 pt-4 pb-7 lg:self-center">
            <h3 className="font-mono text-xs text-pink lowercase">{tab.label}</h3>
            <ul className="mt-3 grid gap-2">
              {tab.skills.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 text-[0.9375rem] leading-snug text-ink">{s.name}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span aria-hidden="true" className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, k) => (
                        <span key={k} className={cn("h-2 w-2.5 -skew-x-[20deg]", k < segmentsFor[s.status] ? "bg-pink" : "bg-ink/15")} />
                      ))}
                    </span>
                    <span className={cn("w-[5.5rem] text-right font-mono text-[0.6875rem] lowercase", STATUS_COLOR[s.status])}>{s.status}</span>
                  </span>
                </li>
              ))}
            </ul>
            {used.length > 0 && (
              <>
                <p className="mt-5 font-mono text-xs text-muted lowercase">Used on</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {used.map((m) => (
                    <li key={m.slug}>
                      <Link
                        href={`/missions/${m.slug}`}
                        className="inline-flex h-9 items-center rounded-lg border border-ink/15 px-2.5 text-sm font-semibold text-ink hover:border-orange hover:text-pink"
                      >
                        <span className="mr-1.5 font-mono text-xs text-pink">{m.number}</span>
                        {m.codename}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        </div>
      )}
    </dialog>
  )
}
