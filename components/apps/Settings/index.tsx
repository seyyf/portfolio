"use client"

import { motion, useReducedMotion } from "framer-motion"
import {
  ChevronRight,
  CodeXml,
  Container,
  Crosshair,
  Database,
  Languages,
  Moon,
  Server,
  Sun,
  Volume2,
  Wrench,
  type LucideIcon,
} from "lucide-react"
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { Toggle } from "@/components/shared/Toggle"
import { languages, profile, skillGroups } from "@/data/profile"
import { fade, springs } from "@/lib/animations"
import { useOSNav } from "@/lib/nav"
import { playSfx, primeSounds } from "@/lib/sound"
import { useOS, type Theme } from "@/lib/store"
import { switchThemeFrom } from "@/lib/theme"
import { cn } from "@/lib/utils"

type Tint = "mint" | "sky" | "butter" | "lavender" | "coral"

const tints: Record<Tint, string> = {
  mint: "bg-mint",
  sky: "bg-sky",
  butter: "bg-butter",
  lavender: "bg-lavender",
  coral: "bg-coral",
}

const groupStyle: Record<string, { icon: LucideIcon; tint: Tint }> = {
  Frontend: { icon: CodeXml, tint: "sky" },
  Backend: { icon: Server, tint: "lavender" },
  Databases: { icon: Database, tint: "butter" },
  DevOps: { icon: Container, tint: "mint" },
  Tools: { icon: Wrench, tint: "coral" },
}

const sections = [
  ...skillGroups.map((g) => ({
    title: g.label,
    ...(groupStyle[g.label] ?? { icon: Wrench, tint: "sky" as Tint }),
    rows: g.items.map((s) => ({ name: s.name, detail: s.detail })),
  })),
  {
    title: "Languages",
    icon: Languages,
    tint: "butter" as Tint,
    rows: languages.map((l) => ({ name: l.name, detail: l.level })),
  },
]

const skillCount = sections.reduce((n, s) => n + s.rows.length, 0)

/** Settings: appearance, sounds, Focus Mode, and every skill switched on (for good). */
export default function SettingsApp() {
  const { open, resume } = useOSNav()
  const sound = useOS((s) => s.sound)
  const toggleSound = useOS((s) => s.toggleSound)
  const ids = useId()

  return (
    <AppScreen title="Settings">
      <div className="flex flex-col gap-6 px-4 pb-6">
        {/* Profile, like the account card at the top of a phone's settings */}
        <button
          type="button"
          onClick={() => open("messages")}
          className="card flex min-h-11 w-full items-center gap-3.5 p-3.5 text-left transition-transform active:scale-[0.98]"
        >
          <span
            aria-hidden="true"
            className="grid size-14 shrink-0 place-items-center rounded-full bg-linear-135 from-mint to-sky font-display text-2xl font-semibold text-ink"
          >
            S
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-display text-lg leading-tight font-semibold">{profile.name}</span>
            <span className="block text-sm text-text-soft">
              {profile.title}, {profile.yearsExperience} years
            </span>
          </span>
          <ChevronRight size={20} className="shrink-0 text-text-soft" aria-hidden="true" />
          <span className="sr-only">Open Messages to chat</span>
        </button>

        <Group title="Appearance">
          <li className="p-2">
            <ThemeSwitch />
          </li>
        </Group>

        <Group title="Sounds">
          <Row icon={Volume2} tint="sky" first label="Sounds" detail="Taps, pings and pops" labelId={`${ids}-snd`} detailId={`${ids}-snd-d`}>
            <Toggle
              checked={sound}
              label="Sounds"
              labelledBy={`${ids}-snd`}
              describedBy={`${ids}-snd-d`}
              onChange={(on) => {
                if (on === sound) return
                if (on) primeSounds()
                toggleSound()
                if (on) playSfx("pop")
              }}
            />
          </Row>
        </Group>

        <Group title="Focus Mode">
          <li>
            <button type="button" onClick={resume} className="block w-full text-left transition-colors active:bg-surface-2">
              <RowLayout icon={Crosshair} tint="coral" first label="Focus Mode" detail="Recruiter view: a clean one-page résumé">
                <ChevronRight size={20} className="shrink-0 text-text-soft" aria-hidden="true" />
              </RowLayout>
            </button>
          </li>
        </Group>

        {sections.map((s) => (
          <SkillSection key={s.title} {...s} />
        ))}

        <p className="px-4 text-center text-xs text-text-soft">
          All {skillCount} skills are switched on. They stay that way.
        </p>
      </div>
    </AppScreen>
  )
}

/* ---------- Building blocks ---------- */

function Group({ title, aside, children, sectionRef }: { title: string; aside?: string; children: ReactNode; sectionRef?: RefObject<HTMLElement | null> }) {
  const id = useId()
  return (
    <section ref={sectionRef} aria-labelledby={id}>
      <div className="mb-1.5 flex items-baseline justify-between px-4">
        <h2 id={id} className="text-[0.8125rem] font-semibold text-text-soft">
          {title}
        </h2>
        {aside && <span className="text-xs text-text-soft">{aside}</span>}
      </div>
      <ul className="overflow-hidden rounded-[22px] bg-surface shadow-[0_1px_2px_rgba(31,34,51,0.05)]">{children}</ul>
    </section>
  )
}

type RowLayoutProps = {
  icon: LucideIcon
  tint: Tint
  first?: boolean
  label: string
  detail?: string
  labelId?: string
  detailId?: string
  children?: ReactNode
}

/** Icon square, label and secondary text, control on the right. Inset divider between rows. */
function RowLayout({ icon: Icon, tint, first, label, detail, labelId, detailId, children }: RowLayoutProps) {
  return (
    <div className="flex min-h-13 items-stretch gap-3 pl-3.5">
      <span className={cn("my-auto grid size-7.5 shrink-0 place-items-center rounded-[9px] text-ink", tints[tint])} aria-hidden="true">
        <Icon size={17} strokeWidth={2.2} />
      </span>
      <span className={cn("flex min-w-0 flex-1 items-center gap-3 py-2.5 pr-4", !first && "border-t border-line")}>
        <span className="min-w-0 flex-1">
          <span id={labelId} className="block text-[0.96875rem] leading-snug font-medium">
            {label}
          </span>
          {detail && (
            <span id={detailId} className="block text-[0.8125rem] leading-snug text-text-soft">
              {detail}
            </span>
          )}
        </span>
        {children}
      </span>
    </div>
  )
}

function Row(props: RowLayoutProps) {
  return (
    <li>
      <RowLayout {...props} />
    </li>
  )
}

/* ---------- Appearance ---------- */

const themes: { value: Theme; label: string; icon: LucideIcon }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
]

function ThemeSwitch() {
  const theme = useOS((s) => s.theme)
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)
  const refs = useRef<Partial<Record<Theme, HTMLButtonElement | null>>>({})

  const choose = (t: Theme) => {
    if (t !== theme) switchThemeFrom(refs.current[t] ?? null, t)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return
    e.preventDefault()
    const next: Theme = theme === "light" ? "dark" : "light"
    choose(next)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label="Appearance" onKeyDown={onKeyDown} className="grid grid-cols-2 gap-1 rounded-[16px] bg-surface-2 p-1">
      {themes.map(({ value, label, icon: Icon }) => {
        const active = theme === value
        return (
          <button
            key={value}
            ref={(el) => {
              refs.current[value] = el
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => choose(value)}
            className={cn(
              "relative flex min-h-11 items-center justify-center gap-2 rounded-[12px] text-[0.9375rem] font-semibold transition-colors",
              active ? "text-text" : "text-text-soft hover:text-text"
            )}
          >
            {active && (
              <motion.span
                layoutId="settings-theme-thumb"
                className="absolute inset-0 rounded-[12px] bg-surface shadow-[0_1px_3px_rgba(31,34,51,0.14)]"
                transition={reduce ? fade : springs.snappy}
              />
            )}
            <Icon size={17} className="relative" aria-hidden="true" />
            <span className="relative">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Skills ---------- */

/** True once the element has scrolled into view inside the app's scroll container. */
/**
 * True once the element's top has scrolled ~60px into view. A ratio threshold would never fire for
 * tall sections (10 rows) that are only partly on screen, leaving visible skills switched off.
 */
function useInViewOnce(ref: RefObject<HTMLElement | null>) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      const t = window.setTimeout(() => setInView(true), 0)
      return () => window.clearTimeout(t)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        setInView(true)
        io.disconnect()
      },
      { root: el.closest(".app-scroll"), threshold: 0, rootMargin: "0px 0px -60px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
  return inView
}

type SkillSectionProps = {
  title: string
  icon: LucideIcon
  tint: Tint
  rows: { name: string; detail?: string }[]
}

function SkillSection({ title, icon, tint, rows }: SkillSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInViewOnce(ref)
  return (
    <Group title={title} aside={`${rows.length} on`} sectionRef={ref}>
      {rows.map((r, i) => (
        <SkillRow key={r.name} index={i} icon={icon} tint={tint} name={r.name} detail={r.detail} armed={inView} />
      ))}
    </Group>
  )
}

type SkillRowProps = { index: number; icon: LucideIcon; tint: Tint; name: string; detail?: string; armed: boolean }

function SkillRow({ index, icon, tint, name, detail, armed }: SkillRowProps) {
  const id = useId()
  const [on, setOn] = useState(false)
  const bounce = useRef<number | undefined>(undefined)

  // Switch on, one after another, the first time the section scrolls into view.
  useEffect(() => {
    if (!armed) return
    const instant = useOS.getState().reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const t = window.setTimeout(() => setOn(true), instant ? 0 : 140 + index * 70)
    return () => window.clearTimeout(t)
  }, [armed, index])

  useEffect(() => () => window.clearTimeout(bounce.current), [])

  const onChange = (next: boolean) => {
    setOn(next)
    if (next) return
    // Nope: it springs back on.
    window.clearTimeout(bounce.current)
    bounce.current = window.setTimeout(() => {
      setOn(true)
      useOS.getState().toast("Nice try, that one's staying on 😄")
      playSfx("pop")
    }, 350)
  }

  return (
    <Row icon={icon} tint={tint} first={index === 0} label={name} detail={detail} labelId={`${id}-l`} detailId={detail ? `${id}-d` : undefined}>
      <Toggle checked={on} onChange={onChange} label={name} labelledBy={`${id}-l`} describedBy={detail ? `${id}-d` : undefined} />
    </Row>
  )
}
