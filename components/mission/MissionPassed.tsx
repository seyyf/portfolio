"use client"

import { ArrowRight, Flag, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useEffect, useEffectEvent, useId, useLayoutEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react"
import { createPortal } from "react-dom"

import { buttonClass } from "@/components/ui/Button"
import { addHeat } from "@/lib/game"
import { motionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { getUI, openPhone } from "@/lib/ui"
import { cn } from "@/lib/utils"

/*
 * MISSION PASSED: the signature moment at the end of every mission page.
 *
 * Opens once per page view when the reader reaches the end (a sentinel near the end scrolls into
 * view after they've scrolled), or any time from the "Complete mission" button. GSAP (+ SplitText)
 * is downloaded only when the end of the page gets close, and only runs inside this overlay.
 *
 * Timeline (seconds):
 *   0.00  dim fades in (0.35, power2.out)
 *   0.05  diagonal band sweeps in from the left (0.75, expo.out); its top edge from the right (0.14)
 *   0.30  kicker "MISSION 05 · THE REBUILD" fades up
 *   0.36  title letters slide in from the right (expo.out, 24ms stagger) with a skew/stretch that
 *         settles past zero and back (back.out) while the whole title pushes in (scale .94 → 1)
 *   0.66  the hit: "ding" (if sound is on)
 *   0.74  sunset bar draws left → right (0.6, power4.inOut)
 *   0.82  a gold gleam crosses the band
 *   1.22  "Skills unlocked:" slides in
 *   1.40  each skill pops in (back.out, 140ms stagger)
 *   end   Continue (+ next step) fades up; Skip fades out. ~2.4–3.0s depending on skill count.
 *
 * Skip: the Skip button, a click anywhere, or any key jumps to the end; once at the end, Esc, a
 * click outside the buttons or any other key closes. Esc is handled on window in the capture phase
 * with preventDefault(), so the global pause menu doesn't open as well. Reduced motion: the final
 * card appears at once, no movement.
 */

export type PassedVariant = "passed" | "checkpoint" | "side"
export type PassedAction = { type: "link"; href: string; label: string } | { type: "phone"; label: string }

const TITLES: Record<PassedVariant, string> = {
  passed: "Mission passed",
  checkpoint: "Checkpoint reached",
  side: "Side mission passed",
}

type GsapModule = typeof import("@/lib/gsap")
type Timeline = ReturnType<GsapModule["gsap"]["timeline"]>
type Tween = ReturnType<GsapModule["gsap"]["to"]>
type Context = ReturnType<GsapModule["gsap"]["context"]>

let gsapPromise: Promise<GsapModule> | null = null
function loadGsap() {
  gsapPromise ??= import("@/lib/gsap").catch((err: unknown) => {
    gsapPromise = null
    throw err
  })
  return gsapPromise
}
const prefetchGsap = () => {
  if (!motionReduced()) loadGsap().catch(() => {})
}

// Each letter takes its colour from the sunset gradient (pink → orange → gold), so the title keeps
// the gradient while every letter moves on its own (background-clip text can't follow transforms).
const STOPS: [number, number, number][] = [
  [255, 79, 163],
  [255, 138, 61],
  [255, 201, 74],
]
function sunsetAt(t: number) {
  const [a, b, u] = t <= 0.55 ? [STOPS[0], STOPS[1], t / 0.55] : [STOPS[1], STOPS[2], (t - 0.55) / 0.45]
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * u)).join(" ")})`
}

type Els = {
  dim: HTMLElement
  stage: HTMLElement
  band: HTMLElement
  edge: HTMLElement
  gleam: HTMLElement
  kicker: HTMLElement
  title: HTMLElement
  titleText: HTMLElement
  rule: HTMLElement
  label: HTMLElement
  items: HTMLElement[]
  actions: HTMLElement
  skip: HTMLElement | null
}

function buildTimeline({ gsap, SplitText }: GsapModule, el: Els, onHit: () => void, onDone: () => void): { tl: Timeline; split: InstanceType<typeof SplitText> } {
  const split = SplitText.create(el.titleText, { type: "words,chars", tag: "span", aria: "auto" })
  const chars = split.chars as HTMLElement[]
  chars.forEach((c, i) => {
    c.style.color = sunsetAt(chars.length > 1 ? i / (chars.length - 1) : 0)
  })
  const each = 0.024

  const tl = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: onDone })
  tl.set(el.stage, { visibility: "visible" }, 0)
    .to(el.dim, { opacity: 1, duration: 0.35, ease: "power2.out" }, 0)
    // The band: body from the left, its top edge from the right, so they cross and lock together.
    .from(el.band, { xPercent: -101, duration: 0.75, ease: "expo.out" }, 0.05)
    .from(el.edge, { xPercent: 101, duration: 0.85, ease: "expo.out" }, 0.14)
    .from(el.kicker, { autoAlpha: 0, y: 10, duration: 0.45 }, 0.3)
    // The title: letters fly in from the right, stretched and over-skewed, then snap upright.
    .from(el.title, { scale: 0.94, duration: 1.1, ease: "expo.out" }, 0.36)
    .from(chars, { xPercent: 220, duration: 0.7, ease: "expo.out", stagger: each }, 0.36)
    .from(chars, { autoAlpha: 0, duration: 0.18, ease: "power1.out", stagger: each }, 0.36)
    .from(chars, { skewX: -32, scaleX: 1.3, transformOrigin: "0% 100%", duration: 0.8, ease: "back.out(2.6)", stagger: each }, 0.36)
    .call(onHit, undefined, 0.66)
    .from(el.rule, { scaleX: 0, transformOrigin: "0% 50%", duration: 0.6, ease: "power4.inOut" }, 0.74)
    .fromTo(el.gleam, { xPercent: -100, opacity: 1 }, { xPercent: 520, duration: 0.95, ease: "power2.inOut" }, 0.82)
    .from(el.label, { autoAlpha: 0, x: -16, duration: 0.4 }, 1.22)
    .from(el.items, { autoAlpha: 0, y: 16, scale: 0.9, duration: 0.5, ease: "back.out(2)", stagger: 0.14 }, 1.4)
    .from(el.actions, { autoAlpha: 0, y: 12, duration: 0.45 }, ">-0.1")
  if (el.skip) tl.to(el.skip, { autoAlpha: 0, duration: 0.25 }, "<")
  return { tl, split }
}

export function MissionPassed({
  variant,
  kicker,
  skills,
  skillsLabel = "Skills unlocked:",
  triggerLabel,
  action,
}: {
  variant: PassedVariant
  kicker: string
  skills: string[]
  skillsLabel?: string
  triggerLabel: string
  action?: PassedAction
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"anim" | "static">("anim")
  const [done, setDone] = useState(false)
  const anim = mode === "anim"
  const titleId = useId()
  const descId = useId()

  const root = useRef<HTMLDivElement>(null)
  const dim = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const band = useRef<HTMLDivElement>(null)
  const edge = useRef<HTMLDivElement>(null)
  const gleam = useRef<HTMLDivElement>(null)
  const kickerEl = useRef<HTMLParagraphElement>(null)
  const title = useRef<HTMLHeadingElement>(null)
  const titleText = useRef<HTMLSpanElement>(null)
  const rule = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLParagraphElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const actions = useRef<HTMLDivElement>(null)
  const skipBtn = useRef<HTMLButtonElement>(null)
  const continueBtn = useRef<HTMLButtonElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const sentinel = useRef<HTMLDivElement>(null)

  const tl = useRef<Timeline | null>(null)
  const gsapMod = useRef<GsapModule | null>(null)
  const exitTween = useRef<Tween | null>(null)
  const returnFocus = useRef<HTMLElement | null>(null)
  const restoreFocus = useRef(false)
  const closing = useRef(false)
  const autoShown = useRef(false)

  const openOverlay = () => {
    if (open) return
    const reduced = motionReduced()
    returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    autoShown.current = true
    closing.current = false
    restoreFocus.current = false
    setMode(reduced ? "static" : "anim")
    setDone(reduced)
    setOpen(true)
    addHeat(`passed:${location.pathname}`)
    if (reduced) play("ding")
  }

  /** Jump to the end state. Before GSAP has loaded, just show the final card. */
  const finish = () => {
    if (done || closing.current) return
    if (tl.current) tl.current.progress(1)
    else setMode("static")
    setDone(true)
  }

  const close = ({ instant = false, restore = true } = {}) => {
    if (!open || closing.current) return
    closing.current = true
    restoreFocus.current = restore
    const g = gsapMod.current
    if (!instant && anim && g && root.current && !motionReduced()) {
      exitTween.current = g.gsap.to(root.current, { autoAlpha: 0, duration: 0.28, ease: "power2.in", onComplete: () => setOpen(false) })
    } else {
      setOpen(false)
    }
  }

  // Next.js keeps up to 3 visited pages alive but hidden (React Activity). Hiding runs this
  // cleanup: never come back to a page with the overlay still up.
  useLayoutEffect(
    () => () => {
      exitTween.current?.kill()
      exitTween.current = null
      closing.current = false
      setOpen(false)
      setDone(false)
    },
    []
  )

  // Auto-open: once per page view, when the end sentinel is in view after the reader has scrolled
  // (so a short page never pops it on load), and never over the phone or the pause menu.
  const autoOpen = useEffectEvent(() => {
    if (autoShown.current || open) return
    const ui = getUI()
    if (ui.phone || ui.pause || document.querySelector("dialog[open]")) return
    openOverlay()
  })
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    let visible = false
    let scrolled = false
    const check = () => {
      if (visible && scrolled) autoOpen()
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        check()
      },
      { rootMargin: "0px 0px -15% 0px" }
    )
    // Fetch GSAP while the reader is still a screen or so away from the end.
    const pre = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        prefetchGsap()
        pre.disconnect()
      },
      { rootMargin: "100% 0px" }
    )
    const onScroll = () => {
      scrolled = true
      check()
    }
    io.observe(el)
    pre.observe(el)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      io.disconnect()
      pre.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [])

  // While open: lock page scroll; on close, put focus back where it was (or on the trigger).
  useEffect(() => {
    if (!open) return
    const html = document.documentElement
    const fallback = trigger.current
    const prev = { overflow: html.style.overflow, paddingRight: html.style.paddingRight }
    const gap = window.innerWidth - html.clientWidth
    html.style.overflow = "hidden"
    if (gap > 0) html.style.paddingRight = `${gap}px`
    return () => {
      html.style.overflow = prev.overflow
      html.style.paddingRight = prev.paddingRight
      if (!restoreFocus.current) return
      restoreFocus.current = false
      const back = returnFocus.current
      const target = back && back.isConnected && back !== document.body ? back : fallback
      target?.focus({ preventScroll: true })
    }
  }, [open])

  // Focus: Skip while it plays, Continue once it's done.
  useEffect(() => {
    if (!open) return
    ;(done ? continueBtn.current : skipBtn.current)?.focus({ preventScroll: true })
  }, [open, done])

  // The animation. Everything (tweens, SplitText) is reverted on close, unmount or skip-before-load.
  useEffect(() => {
    if (!open || mode !== "anim") return
    let cancelled = false
    let ctx: Context | undefined
    loadGsap()
      .then((mod) => {
        const r = root.current
        if (cancelled || !r) return
        const need = [dim, stage, band, edge, gleam, kickerEl, title, titleText, rule, label, list, actions].map((x) => x.current)
        if (need.some((x) => !x)) throw new Error("MissionPassed: missing element")
        gsapMod.current = mod
        ctx = mod.gsap.context(() => {
          const { tl: timeline, split } = buildTimeline(
            mod,
            {
              dim: dim.current!,
              stage: stage.current!,
              band: band.current!,
              edge: edge.current!,
              gleam: gleam.current!,
              kicker: kickerEl.current!,
              title: title.current!,
              titleText: titleText.current!,
              rule: rule.current!,
              label: label.current!,
              items: [...list.current!.children] as HTMLElement[],
              actions: actions.current!,
              skip: skipBtn.current,
            },
            () => play("ding"),
            () => setDone(true)
          )
          tl.current = timeline
          return () => split.revert()
        }, r)
      })
      .catch(() => {
        // GSAP failed to load (offline?): show the final card.
        if (cancelled) return
        setMode("static")
        setDone(true)
      })
    return () => {
      cancelled = true
      tl.current = null
      ctx?.revert()
    }
  }, [open, mode])

  // Keyboard, on window in the capture phase so it runs before the HUD's Esc → pause menu.
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    const r = root.current
    if (!r) return
    if (closing.current) {
      e.preventDefault()
      e.stopPropagation()
      return
    }
    if (e.key === "Tab") {
      const items = [...r.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")].filter((x) => !x.closest("[inert]"))
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      if (!first || !last) return e.preventDefault()
      if (!r.contains(active)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && active === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
      return
    }
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      if (!e.repeat) (done ? close : finish)()
      return
    }
    if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Fn", "OS"].includes(e.key) || e.ctrlKey || e.metaKey || e.altKey) return
    // At the end, Enter/Space on Continue or the next-step link work as usual.
    const active = document.activeElement
    if (done && (e.key === "Enter" || e.key === " ") && active instanceof HTMLElement && r.contains(active) && active.matches("a[href], button")) return
    e.preventDefault()
    e.stopPropagation()
    if (!e.repeat) (done ? close : finish)()
  })
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => onKey(e)
    window.addEventListener("keydown", h, true)
    return () => window.removeEventListener("keydown", h, true)
  }, [open])

  const onRootClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest("a, button")) return
    if (done) close()
    else finish()
  }

  const overlay = (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClick={onRootClick}
      className="fixed inset-0 z-[85] overflow-x-hidden overflow-y-auto overscroll-contain"
    >
      <div
        ref={dim}
        aria-hidden="true"
        className={cn("fixed inset-0 bg-bg/80 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgb(11_15_26/0.75)_100%)]", anim && "opacity-0")}
      />

      <div ref={stage} className={cn("relative flex min-h-full items-center justify-center px-4 pt-20 pb-28 md:py-24", anim && "invisible")}>
        <div className="relative w-full max-w-[56rem] text-center">
          {/* The diagonal band behind the card: body + bottom edge, and a separate top edge. */}
          <div aria-hidden="true" className="pointer-events-none absolute -inset-y-10 left-1/2 w-[140vw] -translate-x-1/2 md:-inset-y-14">
            <div ref={band} className="absolute inset-0">
              <div className="absolute inset-0 -skew-y-5 overflow-hidden bg-[linear-gradient(90deg,rgb(20_26_42/0.97),rgb(14_59_67/0.95)_50%,rgb(20_26_42/0.97))] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.85)]">
                <div ref={gleam} className="absolute inset-y-0 left-0 w-1/5 bg-[linear-gradient(100deg,transparent,rgb(255_201_74/0.16),transparent)] opacity-0" />
                <div className="absolute inset-x-0 bottom-0 h-0.75 bg-sunset-h" />
              </div>
            </div>
            <div ref={edge} className="absolute inset-0">
              <div className="absolute inset-0 -skew-y-5">
                <div className="absolute inset-x-0 top-0 h-0.75 bg-sunset-h" />
              </div>
            </div>
          </div>

          <p ref={kickerEl} className="relative font-mono text-xs tracking-[0.28em] text-ink/85 uppercase md:text-sm">
            {kicker}
          </p>
          <h2
            ref={title}
            id={titleId}
            className="relative mt-3 font-display text-[clamp(2.75rem,12.5vw,6.5rem)] leading-[0.92] text-ink [filter:drop-shadow(0_0.05em_0_rgb(11_15_26/0.9))]"
          >
            <span ref={titleText} className={cn("lean px-[0.06em]", !anim && "text-sunset")}>
              {TITLES[variant]}
            </span>
          </h2>
          <div ref={rule} aria-hidden="true" className="relative mx-auto mt-4 h-1.5 w-[min(78%,30rem)] -skew-x-[30deg] bg-sunset-h md:h-2" />

          <div id={descId} className="relative mt-7">
            <p ref={label} className="font-mono text-sm tracking-[0.2em] text-gold uppercase">
              {skillsLabel}
            </p>
            <ul ref={list} className="mx-auto mt-3 flex max-w-[40rem] flex-wrap justify-center gap-2">
              {skills.map((s) => (
                <li key={s} className="rounded-md border border-gold/35 bg-bg/70 px-3 py-1.5 text-[0.9375rem] leading-6 font-semibold text-ink">
                  <span aria-hidden="true" className="mr-1 text-gold">
                    +
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div ref={actions} inert={!done} className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <button ref={continueBtn} type="button" onClick={() => close()} className={buttonClass("sunset", "lg", "min-w-40")}>
              Continue
            </button>
            {action?.type === "link" && (
              <Link href={action.href} onClick={() => close({ instant: true, restore: false })} className={buttonClass("outline", "lg")}>
                {action.label}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            )}
            {action?.type === "phone" && (
              <button
                type="button"
                onClick={() => {
                  close({ instant: true, restore: false })
                  play("pop")
                  openPhone("messages")
                }}
                className={buttonClass("outline", "lg")}
              >
                <MessageSquare aria-hidden="true" className="size-4" />
                {action.label}
              </button>
            )}
          </div>
        </div>
      </div>

      {!done && (
        <button
          ref={skipBtn}
          type="button"
          onClick={finish}
          className="hud-panel fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] inline-flex h-11 items-center gap-2 rounded-lg px-4 font-mono text-xs tracking-[0.14em] text-ink uppercase transition-colors hover:border-gold hover:text-gold lg:right-6 lg:bottom-6"
        >
          Skip
          <kbd aria-hidden="true" className="hidden rounded border border-ink/25 px-1 text-[0.625rem] normal-case sm:inline">
            any key
          </kbd>
        </button>
      )}
    </div>
  )

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <button
          ref={trigger}
          type="button"
          onClick={() => {
            play("click")
            openOverlay()
          }}
          onPointerEnter={prefetchGsap}
          onFocus={prefetchGsap}
          aria-haspopup="dialog"
          className={buttonClass("sunset", "lg")}
        >
          <Flag aria-hidden="true" className="size-4" />
          {triggerLabel}
        </button>
      </div>
      <div ref={sentinel} aria-hidden="true" className="h-px" />
      {open && createPortal(overlay, document.body)}
    </>
  )
}
