"use client"

import { animate, motion, useMotionValue } from "framer-motion"
import { ArrowUpRight, Briefcase, Check, ExternalLink, Info, MoreHorizontal } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { AppIcon } from "@/components/os/AppIcon"
import { usePhoneScreen } from "@/components/os/phoneScreen"
import { AboutSheet } from "@/components/shared/AboutSheet"
import { Sheet } from "@/components/shared/Sheet"
import { apps, browserSites, dock, homePage1, homePage2, type HomeIcon } from "@/data/apps"
import { profile } from "@/data/profile"
import { projectById, type ProjectId } from "@/data/projects"
import { springs } from "@/lib/animations"
import { useBackLayer } from "@/lib/backStack"
import { SplitText, useGSAP, gsap } from "@/lib/gsap"
import { useOSNav } from "@/lib/nav"
import { useOS } from "@/lib/store"
import { formatDate, formatTime, useNow } from "@/lib/time"

const PAGES = 2

export function HomeScreen({ inert }: { inert: boolean }) {
  const editMode = useOS((s) => s.editMode)
  const setEditMode = useOS((s) => s.setEditMode)
  const screen = usePhoneScreen()
  const [menu, setMenuState] = useState<{ icon: HomeIcon; pos: { top: number; left: number } } | null>(null)
  const setMenu = (icon: HomeIcon | null) => setMenuState(icon ? { icon, pos: menuPosition(screen, icon.key) } : null)

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col pt-[calc(var(--status-h)+env(safe-area-inset-top)+4px)] pb-[calc(env(safe-area-inset-bottom)+10px)]"
      inert={inert}
      aria-hidden={inert || undefined}
      onPointerDown={(e) => {
        // In edit mode, tapping anywhere that isn't an icon stops the wiggle.
        if (editMode && !(e.target as Element).closest("[data-icon-key], [data-menu], button")) setEditMode(false)
      }}
    >
      <h1 className="sr-only">SeyfOS home screen</h1>
      <Pages onMenu={setMenu} />
      <Dock onMenu={setMenu} />
      <IconMenu icon={menu?.icon ?? null} pos={menu?.pos ?? null} onClose={() => setMenu(null)} />
    </div>
  )
}

/** Two home pages side by side, swiped horizontally with a rubber band at the edges. */
function Pages({ onMenu }: { onMenu: (i: HomeIcon) => void }) {
  const page = useOS((s) => s.homePage)
  const setPage = useOS((s) => s.setHomePage)
  const editMode = useOS((s) => s.editMode)
  const setEditMode = useOS((s) => s.setEditMode)
  const reduced = useOS((s) => s.reducedMotion)
  const viewport = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const x = useMotionValue(0)

  useLayoutEffect(() => {
    const el = viewport.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!width) return
    if (reduced) x.set(-page * width)
    else animate(x, -page * width, springs.smooth)
  }, [page, width, reduced, x])

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      {/* overflow-clip, not hidden: focus() can scroll a hidden container sideways and misalign the pages. */}
      <div ref={viewport} className="home-viewport relative min-h-0 flex-1 overflow-clip">
        <motion.div
          className="flex h-full touch-pan-y"
          style={{ x, width: width ? width * PAGES : "200%" }}
          drag={width ? "x" : false}
          dragConstraints={{ left: -width * (PAGES - 1), right: 0 }}
          dragElastic={0.14}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            const swipe = info.offset.x + info.velocity.x * 0.2
            const next = swipe < -width * 0.2 ? page + 1 : swipe > width * 0.2 ? page - 1 : page
            const clamped = Math.max(0, Math.min(PAGES - 1, next))
            if (clamped === page) animate(x, -page * width, springs.smooth)
            else setPage(clamped)
          }}
        >
          <section aria-label="Work apps" className="h-full shrink-0 px-5" style={{ width: width || "50%" }} inert={page !== 0}>
            <WorkPage onMenu={onMenu} />
          </section>
          <section aria-label="System apps" className="h-full shrink-0 px-5" style={{ width: width || "50%" }} inert={page !== 1}>
            <SystemPage onMenu={onMenu} />
          </section>
        </motion.div>
      </div>
      <div className="relative flex h-10 items-center justify-center gap-2">
        {Array.from({ length: PAGES }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setPage(i)}
            aria-label={`Home page ${i + 1}`}
            aria-current={i === page ? "page" : undefined}
            className="grid size-7 place-items-center"
          >
            <span className={`size-[7px] rounded-full transition-colors ${i === page ? "bg-text" : "bg-text/30"}`} />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          aria-pressed={editMode}
          aria-label={editMode ? "Done editing" : "Edit home screen"}
          className="glass absolute right-5 grid h-8 min-w-8 place-items-center rounded-full px-2 text-[12px] font-semibold text-text"
        >
          {editMode ? <Check size={15} aria-hidden="true" /> : <MoreHorizontal size={16} aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

function IconGrid({ icons, onMenu, offset = 0 }: { icons: HomeIcon[]; onMenu: (i: HomeIcon) => void; offset?: number }) {
  return (
    <ul className="grid grid-cols-4 justify-items-center gap-x-2 gap-y-4">
      {icons.map((icon, i) => (
        <li key={icon.key}>
          <AppIcon icon={icon} index={offset + i} onMenu={onMenu} />
        </li>
      ))}
    </ul>
  )
}

function WorkPage({ onMenu }: { onMenu: (i: HomeIcon) => void }) {
  return (
    <div className="flex h-full flex-col gap-4 pt-2">
      <Greeting />
      <NowWidget />
      <h2 className="sr-only">Apps I built</h2>
      <IconGrid icons={homePage1} onMenu={onMenu} offset={2} />
    </div>
  )
}

function SystemPage({ onMenu }: { onMenu: (i: HomeIcon) => void }) {
  return (
    <div className="flex h-full flex-col gap-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <ClockWidget />
        <FocusWidget />
      </div>
      <h2 className="sr-only">System apps</h2>
      <IconGrid icons={homePage2} onMenu={onMenu} />
    </div>
  )
}

/** "Hi, I'm Seyf" widget with a SplitText reveal. */
function Greeting() {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useOS((s) => s.reducedMotion)
  useGSAP(
    (_, contextSafe) => {
      const h = ref.current?.querySelector("h2")
      if (!h || reduced || !contextSafe) return
      let cancelled = false
      // contextSafe: tweens created after the fonts load still belong to this context, so a cleanup
      // (e.g. reduced motion switching on) reverts them instead of leaving the text invisible.
      const reveal = contextSafe(() => {
        if (cancelled) return
        const split = SplitText.create(h, { type: "chars,words", charsClass: "inline-block" })
        gsap.from(split.chars, { yPercent: 80, opacity: 0, rotate: 8, stagger: 0.03, duration: 0.7, ease: "os.spring", delay: 0.25 })
        gsap.from(ref.current!.querySelector("p"), { opacity: 0, y: 8, duration: 0.6, ease: "os.out", delay: 0.6 })
      })
      document.fonts.ready.then(reveal)
      return () => {
        cancelled = true
      }
    },
    // revertOnUpdate: when reduced motion switches on, undo the half-played reveal (text stays visible).
    { scope: ref, dependencies: [reduced], revertOnUpdate: true }
  )
  return (
    <div ref={ref} className="glass rounded-[28px] px-5 py-4 shadow-[var(--shadow)]">
      <h2 className="font-display text-[1.65rem] leading-tight font-semibold">Hi, I&apos;m {profile.firstName} 👋</h2>
      <p className="mt-1 text-[14px] font-medium text-text-soft">
        {profile.title} · {profile.yearsExperience} years · {profile.city}
      </p>
    </div>
  )
}

function NowWidget() {
  const { open } = useOSNav()
  return (
    <button
      type="button"
      onClick={() => open("educaro", { originKey: "educaro" })}
      className="now-widget glass flex items-center gap-3 rounded-[24px] px-4 py-3 text-left shadow-[var(--shadow)] transition-transform active:scale-[0.98]"
    >
      <span className="relative grid size-3 place-items-center" aria-hidden="true">
        <span className="absolute size-3 animate-ping rounded-full bg-mint opacity-70 motion-reduce:animate-none" />
        <span className="size-2.5 rounded-full bg-[#3CC489]" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold text-text-soft">Now</span>
        <span className="block text-[15px] font-semibold">Currently building at Educaro</span>
      </span>
      <ArrowUpRight size={18} className="text-text-soft" aria-hidden="true" />
    </button>
  )
}

function ClockWidget() {
  const now = useNow()
  return (
    <div className="glass flex aspect-square flex-col justify-between rounded-[26px] p-4 shadow-[var(--shadow)]">
      <span className="text-[12px] font-semibold text-text-soft">{profile.city}</span>
      <span>
        <span className="block font-display text-[2.4rem] leading-none font-semibold tabular-nums">{now ? formatTime(now) : " "}</span>
        <span className="mt-1 block text-[12px] font-medium text-text-soft">{now ? formatDate(now) : " "}</span>
      </span>
    </div>
  )
}

function FocusWidget() {
  const { resume } = useOSNav()
  return (
    <button
      type="button"
      onClick={resume}
      className="flex aspect-square flex-col justify-between rounded-[26px] bg-[linear-gradient(150deg,var(--color-lavender),var(--color-sky))] p-4 text-left text-ink shadow-[var(--shadow)] transition-transform active:scale-[0.97]"
    >
      <Briefcase size={22} aria-hidden="true" />
      <span>
        <span className="block text-[15px] leading-tight font-semibold">In a hurry?</span>
        <span className="mt-0.5 block text-[12px] font-medium opacity-80">Open the one-page résumé</span>
      </span>
    </button>
  )
}

function Dock({ onMenu }: { onMenu: (i: HomeIcon) => void }) {
  return (
    <nav aria-label="Dock" className="glass mx-3 rounded-[32px] px-3 py-3 shadow-[var(--shadow)]">
      <ul className="grid grid-cols-4 justify-items-center">
        {dock.map((icon, i) => (
          <li key={icon.key}>
            <AppIcon icon={icon} index={i + 14} showLabel={false} onMenu={onMenu} />
          </li>
        ))}
      </ul>
    </nav>
  )
}

/** Long-press menu: Open, About this project, Visit live site. Anchored next to the icon. */
/** Where to place the long-press menu: under the icon, or above it near the bottom of the screen. */
function menuPosition(screen: HTMLElement | null, key: string) {
  const el = screen?.querySelector(`[data-icon-key="${key}"]`)
  if (!screen || !el) return { top: 120, left: 24 }
  const s = screen.getBoundingClientRect()
  const r = el.getBoundingClientRect()
  const menuW = 230
  const left = Math.min(Math.max(12, r.left - s.left + r.width / 2 - menuW / 2), s.width - menuW - 12)
  const below = r.bottom - s.top + 10
  const top = below + 170 > s.height ? r.top - s.top - 10 - 160 : below
  return { top, left }
}

function IconMenu({ icon, pos, onClose }: { icon: HomeIcon | null; pos: { top: number; left: number } | null; onClose: () => void }) {
  const { open } = useOSNav()
  const [about, setAbout] = useState<ProjectId | null>(null)
  const [info, setInfo] = useState<HomeIcon | null>(null)
  const first = useRef<HTMLButtonElement>(null)
  useBackLayer(!!icon, onClose)

  useEffect(() => {
    if (icon) requestAnimationFrame(() => first.current?.focus())
  }, [icon])

  useEffect(() => {
    if (!icon) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [icon, onClose])

  const project: ProjectId | undefined = icon ? (icon.site ? browserSites[icon.site].project : apps[icon.app].project) : undefined
  const url = project ? projectById[project].url : ""

  return (
    <>
      {icon && pos && (
        <div className="absolute inset-0 z-[55]" data-menu onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
          <motion.div
            role="menu"
            aria-label={`${icon.label} options`}
            initial={{ opacity: 0, scale: 0.85, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={springs.snappy}
            className="glass-strong absolute w-[230px] overflow-hidden rounded-[20px] text-[15px] text-text shadow-[0_16px_40px_-12px_rgba(0,0,0,0.4)]"
            style={{ top: pos.top, left: pos.left }}
          >
            <MenuItem
              ref={first}
              icon={<ArrowUpRight size={18} />}
              onClick={() => {
                onClose()
                open(icon.app, { site: icon.site, originKey: icon.key })
              }}
            >
              Open
            </MenuItem>
            <MenuItem
              icon={<Info size={18} />}
              onClick={() => {
                onClose()
                if (project) setAbout(project)
                else setInfo(icon)
              }}
            >
              {project ? "About this project" : "About this app"}
            </MenuItem>
            {project && (
              <MenuItem
                icon={<ExternalLink size={18} />}
                disabled={!url}
                onClick={() => {
                  onClose()
                  if (url) window.open(url, "_blank", "noopener,noreferrer")
                }}
              >
                {url ? "Visit live site" : "Live site coming soon"}
              </MenuItem>
            )}
          </motion.div>
        </div>
      )}
      {about && <AboutSheet project={about} open onOpenChange={(o) => !o && setAbout(null)} />}
      <Sheet open={!!info} onOpenChange={(o) => !o && setInfo(null)} title={info ? apps[info.app].name : ""}>
        <p className="leading-relaxed">{info ? apps[info.app].description : ""}</p>
      </Sheet>
    </>
  )
}

function MenuItem({
  icon,
  children,
  onClick,
  disabled,
  ref,
}: {
  icon: React.ReactNode
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  ref?: React.Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className="flex min-h-12 w-full items-center justify-between gap-3 border-b border-line px-4 text-left last:border-b-0 hover:bg-text/5 disabled:opacity-45"
    >
      {children}
      <span aria-hidden="true" className="text-text-soft">
        {icon}
      </span>
    </button>
  )
}
