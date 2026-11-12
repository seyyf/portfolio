"use client"

import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { ChevronUp, FileText, Lock } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"

import { NotificationCard } from "@/components/os/Notification"
import { Wallpaper } from "@/components/os/Wallpaper"
import { lockNotifications } from "@/data/profile"
import { springs } from "@/lib/animations"
import { useOSNav } from "@/lib/nav"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { formatDate, formatTime, useNow } from "@/lib/time"

/** Lock screen: Tunis clock, notifications that open their app, swipe up (or tap) to unlock. */
export function LockScreen() {
  const now = useNow()
  const unlock = useOS((s) => s.unlock)
  const reduced = useOS((s) => s.reducedMotion)
  const { open } = useOSNav()
  const y = useMotionValue(0)
  const fade = useTransform(y, [-260, 0], [0.35, 1])

  // A soft ping as each notification lands (only if the visitor has turned sound on).
  useEffect(() => {
    const timers = lockNotifications.map((_, i) => setTimeout(() => playSfx("ping"), 700 + i * 420))
    return () => timers.forEach(clearTimeout)
  }, [])

  const doUnlock = () => {
    playSfx("unlock")
    unlock()
  }

  return (
    <motion.div
      className="lock-screen absolute inset-0 z-30 flex flex-col overflow-hidden text-text"
      style={{ y, opacity: fade }}
      exit={reduced ? { opacity: 0, transition: { duration: 0.18 } } : { y: "-100%", filter: "blur(10px)", opacity: 0.4, transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] } }}
      drag={reduced ? false : "y"}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.9, bottom: 0.05 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -110 || info.velocity.y < -600) doUnlock()
        else animate(y, 0, springs.smooth)
      }}
    >
      {/* Its own opaque wallpaper, so the home screen never shows through. */}
      <Wallpaper />
      <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg)_14%,transparent)]" aria-hidden="true" />
      <div className="relative flex flex-1 flex-col items-center px-4 pt-[calc(var(--status-h)+env(safe-area-inset-top)+28px)]">
        <Lock size={18} className="text-text/70" aria-hidden="true" />
        <p className="mt-2 text-[15px] font-semibold text-text/80">{now ? formatDate(now) : " "}</p>
        <p className="font-sans text-[5.4rem] leading-none font-semibold tracking-[-0.04em] tabular-nums" aria-live="off">
          {now ? formatTime(now) : " "}
        </p>
        <h1 className="sr-only">SeyfOS, the portfolio of {"Seyf Mejri"}. Locked: swipe up or use the unlock button.</h1>

        <ul className="mt-8 flex w-full max-w-[380px] flex-col gap-2.5" aria-label="Notifications">
          {lockNotifications.map((n, i) => (
            <motion.li
              key={n.id}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: -18, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduced ? { duration: 0.2 } : { ...springs.bouncy, delay: 0.6 + i * 0.42 }}
            >
              <NotificationCard app={n.app} from={n.from} text={n.text} time={i === 0 ? "now" : `${i * 4}m ago`} onOpen={() => open(n.app)} />
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="relative flex flex-col items-center gap-3 pb-[calc(env(safe-area-inset-bottom)+18px)]">
        <Link href="/resume" className="glass rounded-full px-4 py-2 text-[13px] font-semibold" onPointerDown={(e) => e.stopPropagation()}>
          <FileText size={14} className="mr-1.5 inline -translate-y-px" aria-hidden="true" />
          Skip to résumé
        </Link>
        <button type="button" onClick={doUnlock} className="flex flex-col items-center gap-0.5 px-6 py-2 text-[14px] font-semibold" onPointerDown={(e) => e.stopPropagation()}>
          <ChevronUp size={22} className="motion-safe:animate-bounce" aria-hidden="true" />
          Swipe up to unlock
        </button>
      </div>
    </motion.div>
  )
}
