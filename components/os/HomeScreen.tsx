"use client"

import { animate, motion, useDragControls, useMotionValue, type MotionValue } from "framer-motion"
import { ArrowDownToLine, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowUpRight, Briefcase, Check, ExternalLink, Info, MoreHorizontal } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { AppIcon } from "@/components/os/AppIcon"
import { AppIconArt } from "@/components/os/icons"
import { usePhoneScreen } from "@/components/os/phoneScreen"
import { useIconDrag } from "@/components/os/useIconDrag"
import { AboutSheet } from "@/components/shared/AboutSheet"
import { Sheet } from "@/components/shared/Sheet"
import { apps, browserSites, type HomeIcon } from "@/data/apps"
import { canAccept, iconByKey, locate, type Area } from "@/lib/homeLayout"
import { profile } from "@/data/profile"
import { projectById, type ProjectId } from "@/data/projects"
import { springs } from "@/lib/animations"
import { useBackLayer } from "@/lib/backStack"
import { SplitText, useGSAP, gsap } from "@/lib/gsap"
import { useOSNav } from "@/lib/nav"
import { useOS } from "@/lib/store"
import { formatDate, formatTime, useNow } from "@/lib/time"

const PAGES = 2

type IconHandlers = {
  onMenu: (i: HomeIcon) => void
  onDragStart: (icon: HomeIcon, e: PointerEvent, el: HTMLElement) => void
  /** Key of the icon being dragged: its slot stays in place, empty, while the copy follows the pointer. */
  dragKey: string | null
}

export function HomeScreen({ inert }: { inert: boolean }) {
  const editMode = useOS((s) => s.editMode)
  const setEditMode = useOS((s) => s.setEditMode)
  const screen = usePhoneScreen()
  const [menu, setMenuState] = useState<{ icon: HomeIcon; pos: { top: number; left: number } } | null>(null)
  const setMenu = (icon: HomeIcon | null) => setMenuState(icon ? { icon, pos: menuPosition(screen, icon.key) } : null)
  const drag = useIconDrag(screen)
  const tap = useRef<{ x: number; y: number } | null>(null)

  const handlers: IconHandlers = {
    onMenu: setMenu,
    onDragStart: (icon, e, el) => {
      setMenuState(null)
      drag.start(icon, e, el)
    },
    dragKey: drag.dragKey,
  }

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col pt-[calc(var(--status-h)+env(safe-area-inset-top)+4px)] pb-[calc(env(safe-area-inset-bottom)+10px)]"
      inert={inert}
      aria-hidden={inert || undefined}
      onPointerDown={(e) => (tap.current = { x: e.clientX, y: e.clientY })}
      onPointerUp={(e) => {
        // In edit mode, a tap (not a swipe) anywhere that isn't an icon or a control stops the wiggle.
        const t = tap.current
        tap.current = null
        if (!editMode || drag.dragKey || !t || Math.hypot(e.clientX - t.x, e.clientY - t.y) > 6) return
        if (!(e.target as Element).closest("[data-icon-key], [data-menu], button")) setEditMode(false)
      }}
    >
      <h1 className="sr-only">SeyfOS home screen</h1>
      <Pages {...handlers} />
      <Dock {...handlers} />
      <IconMenu icon={menu?.icon ?? null} pos={menu?.pos ?? null} onClose={() => setMenu(null)} />
      {drag.dragKey && <DragGhost iconKey={drag.dragKey} x={drag.x} y={drag.y} />}
    </div>
  )
}

/** The icon under the finger while rearranging: lifted, slightly bigger, with a soft shadow. */
function DragGhost({ iconKey, x, y }: { iconKey: string; x: MotionValue<number>; y: MotionValue<number> }) {
  const icon = iconByKey[iconKey]
  return (
    <motion.div aria-hidden="true" className="pointer-events-none absolute top-0 left-0 z-[58] w-[62px]" style={{ x, y }}>
      <motion.div initial={{ scale: 1 }} animate={{ scale: 1.14 }} transition={springs.snappy} className="drop-shadow-[0_14px_18px_rgba(0,0,0,0.3)]">
        <AppIconArt app={icon.app} site={icon.site} className="w-full text-[15px]" />
      </motion.div>
    </motion.div>
  )
}

/** Two home pages side by side, swiped horizontally with a rubber band at the edges. */
function Pages(handlers: IconHandlers) {
  const page = useOS((s) => s.homePage)
  const setPage = useOS((s) => s.setHomePage)
  const editMode = useOS((s) => s.editMode)
  const setEditMode = useOS((s) => s.setEditMode)
  const resetLayout = useOS((s) => s.resetLayout)
  const reduced = useOS((s) => s.reducedMotion)
  const viewport = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const x = useMotionValue(0)
  const controls = useDragControls()
  const swipe = useRef<{ x: number; y: number; started: boolean } | null>(null)

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
      <div
        ref={viewport}
        className="home-viewport relative min-h-0 flex-1 overflow-clip"
        // Page swipes start once the pointer moves sideways (not on press), so a long-press on an icon
        // can still turn into an icon drag. In edit mode, dragging an icon moves the icon, not the page.
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY, started: false })}
        onPointerMove={(e) => {
          const s = swipe.current
          if (!s || s.started || handlers.dragKey) return
          const dx = e.clientX - s.x
          if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - s.y)) return
          if (useOS.getState().editMode && (e.target as Element).closest("[data-icon-key]")) return
          s.started = true
          controls.start(e)
        }}
        onPointerUp={() => (swipe.current = null)}
        onPointerCancel={() => (swipe.current = null)}
      >
        <motion.div
          className="flex h-full touch-pan-y"
          style={{ x, width: width ? width * PAGES : "200%" }}
          drag={width ? "x" : false}
          dragControls={controls}
          dragListener={false}
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
          <section aria-label="Home page 1" className="h-full shrink-0 px-5" style={{ width: width || "50%" }} inert={page !== 0}>
            <WorkPage {...handlers} />
          </section>
          <section aria-label="Home page 2" className="h-full shrink-0 px-5" style={{ width: width || "50%" }} inert={page !== 1}>
            <SystemPage {...handlers} />
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
        {editMode && (
          <button
            type="button"
            onClick={() => {
              resetLayout()
              useOS.getState().toast("Home screen reset")
            }}
            className="glass absolute left-5 grid h-8 place-items-center rounded-full px-3 text-[12px] font-semibold text-text"
          >
            Reset
          </button>
        )}
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

/** One slot of a page or the dock. `layout` makes the other icons slide when one is moved. */
function Slot({ icon, area, index, offset, showLabel = true, handlers }: { icon: HomeIcon; area: Area; index: number; offset: number; showLabel?: boolean; handlers: IconHandlers }) {
  const reduced = useOS((s) => s.reducedMotion)
  return (
    <motion.li
      layout={!reduced}
      transition={springs.snappy}
      data-slot
      data-area={area.kind}
      data-page={area.kind === "page" ? area.page : undefined}
      data-index={index}
      style={{ opacity: handlers.dragKey === icon.key ? 0 : 1 }}
    >
      <AppIcon icon={icon} index={offset + index} showLabel={showLabel} onMenu={handlers.onMenu} onDragStart={handlers.onDragStart} />
    </motion.li>
  )
}

function IconGrid({ page, offset = 0, handlers }: { page: number; offset?: number; handlers: IconHandlers }) {
  const keys = useOS((s) => s.layout.pages[page])
  return (
    <ul data-grid-page={page} className="grid min-h-[96px] grid-cols-4 justify-items-center gap-x-2 gap-y-4">
      {keys.map((key, i) => (
        <Slot key={key} icon={iconByKey[key]} area={{ kind: "page", page }} index={i} offset={offset} handlers={handlers} />
      ))}
    </ul>
  )
}

function WorkPage(handlers: IconHandlers) {
  return (
    <div className="flex h-full flex-col gap-4 pt-2">
      <Greeting />
      <NowWidget />
      <h2 className="sr-only">Apps on page 1</h2>
      <IconGrid page={0} offset={2} handlers={handlers} />
    </div>
  )
}

function SystemPage(handlers: IconHandlers) {
  return (
    <div className="flex h-full flex-col gap-4 pt-2">
      <div className="grid grid-cols-2 gap-3">
        <ClockWidget />
        <FocusWidget />
      </div>
      <h2 className="sr-only">Apps on page 2</h2>
      <IconGrid page={1} handlers={handlers} />
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

function Dock(handlers: IconHandlers) {
  const keys = useOS((s) => s.layout.dock)
  return (
    <nav aria-label="Dock" data-dock className="glass mx-3 rounded-[32px] px-3 py-3 shadow-[var(--shadow)]">
      <ul className="grid min-h-[62px] grid-cols-4 justify-items-center">
        {keys.map((key, i) => (
          <Slot key={key} icon={iconByKey[key]} area={{ kind: "dock" }} index={i} offset={14} showLabel={false} handlers={handlers} />
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
  const menuH = 300 // up to six rows
  const left = Math.min(Math.max(12, r.left - s.left + r.width / 2 - menuW / 2), s.width - menuW - 12)
  const below = r.bottom - s.top + 10
  const above = r.top - s.top - 10 - menuH
  const top = below + menuH <= s.height - 12 ? below : Math.max(56, above)
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

  // Rearranging without dragging (keyboard, screen readers): move actions for this icon.
  const screen = usePhoneScreen()
  const layout = useOS((s) => s.layout)
  const homePage = useOS((s) => s.homePage)
  const where = icon ? locate(layout, icon.key) : null
  const listLength = where ? (where.area.kind === "dock" ? layout.dock.length : layout.pages[where.area.page].length) : 0
  const moveTo = (area: Area, index: number) => {
    if (!icon) return
    const os = useOS.getState()
    os.moveIcon(icon.key, area, index)
    if (area.kind === "page") os.setHomePage(area.page)
    onClose()
    requestAnimationFrame(() => screen?.querySelector<HTMLElement>(`[data-icon-key="${icon.key}"]`)?.focus())
  }
  const otherPage = where?.area.kind === "page" ? 1 - where.area.page : homePage
  const toOtherPage: Area = { kind: "page", page: otherPage }
  const pageFull = !!icon && !canAccept(layout, icon.key, toOtherPage)
  const dockFull = !!icon && !canAccept(layout, icon.key, { kind: "dock" })

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
            {where && (
              <>
                <div role="none" className="h-1.5 bg-text/5" />
                <MenuItem icon={<ArrowLeft size={18} />} disabled={where.index === 0} onClick={() => moveTo(where.area, where.index - 1)}>
                  Move left
                </MenuItem>
                <MenuItem icon={<ArrowRight size={18} />} disabled={where.index >= listLength - 1} onClick={() => moveTo(where.area, where.index + 1)}>
                  Move right
                </MenuItem>
                <MenuItem icon={<ArrowLeftRight size={18} />} disabled={pageFull} onClick={() => moveTo(toOtherPage, 99)}>
                  {`Move to page ${otherPage + 1}${pageFull ? " (full)" : ""}`}
                </MenuItem>
                {where.area.kind === "dock" ? null : (
                  <MenuItem icon={<ArrowDownToLine size={18} />} disabled={dockFull} onClick={() => moveTo({ kind: "dock" }, 99)}>
                    {dockFull ? "Dock is full" : "Move to dock"}
                  </MenuItem>
                )}
              </>
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
