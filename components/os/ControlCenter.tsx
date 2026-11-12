"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Briefcase, FileDown, Mail, Sun, Volume2, VolumeX } from "lucide-react"
import { useEffect, useRef } from "react"

import { profile } from "@/data/profile"
import { springs } from "@/lib/animations"
import { gsap, useGSAP } from "@/lib/gsap"
import { useBackLayer } from "@/lib/backStack"
import { useOSNav } from "@/lib/nav"
import { playSfx, primeSounds } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { switchThemeFrom } from "@/lib/theme"
import { cn } from "@/lib/utils"

/** Frosted control center: theme, sound, Focus Mode, brightness, quick links. Drag up or tap outside to close. */
export function ControlCenter() {
  const open = useOS((s) => s.controlCenter)
  const setOpen = useOS((s) => s.setControlCenter)
  const reduced = useOS((s) => s.reducedMotion)
  const panel = useRef<HTMLDivElement>(null)
  useBackLayer(open, () => setOpen(false))

  useEffect(() => {
    if (!open) return
    const prev = document.activeElement as HTMLElement | null
    requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("button")?.focus())
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      prev?.focus?.({ preventScroll: true })
    }
  }, [open, setOpen])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cc"
          className="absolute inset-0 z-[70]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button type="button" aria-label="Close control center" className="absolute inset-0 bg-black/25 backdrop-blur-[6px]" onClick={() => setOpen(false)} />
          <motion.div
            ref={panel}
            role="dialog"
            aria-label="Control center"
            className="glass-strong absolute inset-x-3 top-[calc(env(safe-area-inset-top)+10px)] rounded-[32px] p-4 pt-5 text-text shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]"
            initial={reduced ? { opacity: 0 } : { y: "-110%" }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: "-110%" }}
            transition={reduced ? { duration: 0.15 } : springs.smooth}
            drag={reduced ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.6, bottom: 0.08 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -60 || info.velocity.y < -500) setOpen(false)
            }}
          >
            <h2 className="mb-3 px-1 text-[13px] font-semibold text-text-soft">Control center</h2>
            <div className="grid grid-cols-2 gap-3">
              <ThemeTile />
              <SoundTile />
              <FocusTile />
              <BrightnessTile />
            </div>
            <h3 className="mt-4 mb-2 px-1 text-[13px] font-semibold text-text-soft">Quick links</h3>
            <div className="grid grid-cols-3 gap-2">
              <QuickLink href={profile.cv} download label="CV" icon={<FileDown size={20} />} cv />
              <QuickLink href={profile.linkedin} label="LinkedIn" icon={<LinkedInMark />} external />
              <QuickLink href={`mailto:${profile.email}`} label="Email" icon={<Mail size={20} />} />
            </div>
            <div aria-hidden="true" className="mx-auto mt-4 h-1.5 w-10 rounded-full bg-text/25" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SUN =
  "M12 4.5a7.5 7.5 0 1 1 0 15 7.5 7.5 0 0 1 0-15Z"
const MOON = "M15.4 3.6a8.6 8.6 0 1 0 5 13.7A7.2 7.2 0 0 1 15.4 3.6Z"

function Tile({
  active,
  onClick,
  label,
  sub,
  children,
  pressed,
  tileRef,
}: {
  active: boolean
  onClick: () => void
  label: string
  sub: string
  children: React.ReactNode
  pressed?: boolean
  tileRef?: React.Ref<HTMLButtonElement>
}) {
  return (
    <button
      ref={tileRef}
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        "flex min-h-[84px] flex-col justify-between rounded-[24px] p-3.5 text-left transition-[background-color,transform] active:scale-[0.96]",
        active ? "bg-text text-bg" : "bg-surface-2/80 text-text"
      )}
    >
      <span className={cn("grid size-9 place-items-center rounded-full", active ? "bg-bg/15" : "bg-text/8")}>{children}</span>
      <span>
        <span className="block text-[14px] leading-tight font-semibold">{label}</span>
        <span className="block text-[12px] opacity-70">{sub}</span>
      </span>
    </button>
  )
}

function ThemeTile() {
  const theme = useOS((s) => s.theme)
  const tile = useRef<HTMLButtonElement>(null)
  const path = useRef<SVGPathElement>(null)
  const rays = useRef<SVGGElement>(null)
  const dark = theme === "dark"
  const first = useRef(true)
  useGSAP(
    () => {
      if (!path.current) return
      const d = first.current ? 0 : 0.6
      first.current = false
      gsap.to(path.current, { morphSVG: dark ? MOON : SUN, duration: d, ease: "os.spring" })
      gsap.to(rays.current, { scale: dark ? 0 : 1, opacity: dark ? 0 : 1, rotate: dark ? -90 : 0, transformOrigin: "50% 50%", duration: d * 0.8, ease: "os.out" })
    },
    { dependencies: [dark] }
  )
  return (
    <Tile
      tileRef={tile}
      active={dark}
      pressed={dark}
      label="Dark mode"
      sub={dark ? "On" : "Off"}
      onClick={() => {
        playSfx("tap")
        switchThemeFrom(tile.current, dark ? "light" : "dark")
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path ref={path} d={SUN} fill="currentColor" stroke="none" transform="scale(0.62) translate(7.4 7.4)" />
        <g ref={rays}>
          <path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4M4.8 4.8l1.7 1.7M17.5 17.5l1.7 1.7M4.8 19.2l1.7-1.7M17.5 6.5l1.7-1.7" />
        </g>
      </svg>
    </Tile>
  )
}

function SoundTile() {
  const sound = useOS((s) => s.sound)
  const toggle = useOS((s) => s.toggleSound)
  return (
    <Tile
      active={sound}
      pressed={sound}
      label="Sound"
      sub={sound ? "On" : "Muted"}
      onClick={() => {
        if (!sound) primeSounds()
        toggle()
        if (!sound) setTimeout(() => playSfx("pop"), 60)
      }}
    >
      {sound ? <Volume2 size={19} aria-hidden="true" /> : <VolumeX size={19} aria-hidden="true" />}
    </Tile>
  )
}

function FocusTile() {
  const { resume } = useOSNav()
  return (
    <Tile active={false} label="Focus Mode" sub="Recruiter view" onClick={resume}>
      <Briefcase size={19} aria-hidden="true" />
    </Tile>
  )
}

/** Brightness actually dims the phone screen (an overlay rendered by the phone). */
function BrightnessTile() {
  const brightness = useOS((s) => s.brightness)
  const setBrightness = useOS((s) => s.setBrightness)
  return (
    <label className="flex min-h-[84px] flex-col justify-between rounded-[24px] bg-surface-2/80 p-3.5">
      <span className="flex items-center justify-between">
        <span className="grid size-9 place-items-center rounded-full bg-text/8">
          <Sun size={19} aria-hidden="true" />
        </span>
        <span className="text-[12px] font-semibold tabular-nums opacity-70">{Math.round(brightness * 100)}%</span>
      </span>
      <span className="text-[14px] font-semibold">Brightness</span>
      <input
        type="range"
        min={35}
        max={100}
        value={Math.round(brightness * 100)}
        onChange={(e) => setBrightness(Number(e.target.value) / 100)}
        aria-label="Brightness"
        className="mt-1 h-2 w-full cursor-pointer accent-[var(--text)]"
      />
    </label>
  )
}

function QuickLink({ href, label, icon, download, external, cv }: { href: string; label: string; icon: React.ReactNode; download?: boolean; external?: boolean; cv?: boolean }) {
  return (
    <a
      href={href}
      download={download ? profile.cvFileName : undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      onClick={() => {
        if (cv) useOS.getState().showActivity({ id: "cv", icon: "📄", label: "CV downloaded", tone: "success" }, 2600)
      }}
      className="flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-[20px] bg-surface-2/80 text-[12px] font-semibold transition-transform active:scale-95"
    >
      <span aria-hidden="true">{icon}</span>
      {label}
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </a>
  )
}

/** lucide v1 ships no brand icons, so the LinkedIn mark is drawn here. */
function LinkedInMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="2.5" y="2.5" width="19" height="19" rx="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="6.6" y="10" width="2.4" height="7.4" rx="0.6" />
      <circle cx="7.8" cy="7.3" r="1.45" />
      <path d="M11.2 10h2.3v1.1c.5-.8 1.5-1.3 2.6-1.3 2 0 3 1.3 3 3.5v4.1h-2.4v-3.7c0-1.1-.4-1.8-1.4-1.8s-1.7.7-1.7 1.9v3.6h-2.4Z" />
    </svg>
  )
}
