"use client"

import { motion, useMotionValue, useTransform, type Variants } from "framer-motion"
import { useEffect } from "react"

import { appComponents } from "@/components/apps/registry"
import { HomeIndicator } from "@/components/os/HomeIndicator"
import { AppIconArt } from "@/components/os/icons"
import { apps, type AppId, type BrowserSite } from "@/data/apps"
import { useOSNav } from "@/lib/nav"

const FULL = "inset(0px 0px 0px 0px round 0px)"
/** iOS-like deceleration: fast start, long soft settle. Never linear. */
const EASE = [0.32, 0.72, 0, 1] as const

/**
 * Where an app opens from and closes into: the inset() clip of its home icon, measured relative to
 * the phone screen. Falls back to a small square in the middle (deep links, chat shortcuts).
 */
export function originClip(screen: HTMLElement | null, app: AppId, key: string | null) {
  if (!screen) return "inset(45% 40% 45% 40% round 22px)"
  const s = screen.getBoundingClientRect()
  const k = s.width / (screen.offsetWidth || s.width) || 1
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.left >= s.left - 1 && r.right <= s.right + 1
  }
  let el: Element | null | undefined = key ? screen.querySelector(`[data-icon-key="${key}"]`) : null
  if (!el || !visible(el)) el = Array.from(screen.querySelectorAll(`[data-icon-app="${app}"]`)).find(visible)
  if (!el) return "inset(42% 38% 42% 38% round 22px)"
  const r = el.getBoundingClientRect()
  const top = (r.top - s.top) / k
  const left = (r.left - s.left) / k
  const right = (s.right - r.right) / k
  const bottom = (s.bottom - r.bottom) / k
  return `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round 16px)`
}

const windowVariants: Variants = {
  closed: (clip: string) => ({ clipPath: clip, transition: { duration: 0.42, ease: EASE } }),
  open: { clipPath: FULL, transition: { duration: 0.52, ease: EASE } },
}
const contentVariants: Variants = {
  closed: { scale: 0.92, transition: { duration: 0.42, ease: EASE } },
  open: { scale: 1, transition: { duration: 0.52, ease: EASE } },
}
const tileVariants: Variants = {
  closed: { opacity: 1, transition: { duration: 0.22, delay: 0.12 } },
  open: { opacity: 0, transition: { duration: 0.28, delay: 0.06 } },
}
const fadeVariants: Variants = {
  closed: { opacity: 0, transition: { duration: 0.16 } },
  open: { opacity: 1, transition: { duration: 0.16 } },
}

type Props = {
  app: AppId
  site?: BrowserSite
  /** Clip the window opens from (computed by the phone when the app is opened). */
  clip: string
  reduced: boolean
}

/** An open app: expands from its icon, shrinks back into it, and closes with a swipe up on the home bar. */
export function AppWindow({ app, site, clip, reduced }: Props) {
  const App = appComponents[app]
  const { home } = useOSNav()
  const dragY = useMotionValue(0)
  const scale = useTransform(dragY, [-280, 0], [0.78, 1])
  const radius = useTransform(dragY, [-100, 0], [40, 0])
  const a = apps[app]

  // Move focus into the app so keyboard and screen reader users land on its content.
  useEffect(() => {
    const t = setTimeout(() => document.getElementById("app-window")?.focus({ preventScroll: true }), 60)
    return () => clearTimeout(t)
  }, [app])

  if (reduced) {
    return (
      <motion.section
        id="app-window"
        tabIndex={-1}
        aria-label={a.name}
        className="absolute inset-0 z-20 bg-bg outline-none"
        variants={fadeVariants}
        initial="closed"
        animate="open"
        exit="closed"
      >
        <App />
        <HomeIndicator dragY={dragY} onHome={() => home()} />
      </motion.section>
    )
  }

  return (
    <motion.section
      id="app-window"
      tabIndex={-1}
      aria-label={a.name}
      className="absolute inset-0 z-20 outline-none will-change-[clip-path]"
      custom={clip}
      variants={windowVariants}
      initial="closed"
      animate="open"
      exit="closed"
    >
      <motion.div className="absolute inset-0 overflow-clip bg-bg shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]" style={{ scale, borderRadius: radius }}>
        <motion.div className="absolute inset-0 origin-center" variants={contentVariants}>
          <App />
        </motion.div>
        {/* The icon's tile covers the window while it grows, then fades: the icon "becomes" the app. */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center" variants={tileVariants}>
          <AppIconArt app={app} site={site} className="absolute inset-0 h-full w-full rounded-none text-[60px] shadow-none" />
        </motion.div>
      </motion.div>
      <HomeIndicator dragY={dragY} onHome={() => home()} />
    </motion.section>
  )
}
