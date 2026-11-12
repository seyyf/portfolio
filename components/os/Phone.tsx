"use client"

import { AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

import { AppWindow, originClip } from "@/components/os/AppWindow"
import { ControlCenter } from "@/components/os/ControlCenter"
import { HomeScreen } from "@/components/os/HomeScreen"
import { LockScreen } from "@/components/os/LockScreen"
import { Banners, Toasts } from "@/components/os/Notification"
import { PhoneScreenContext } from "@/components/os/phoneScreen"
import { StatusBar } from "@/components/os/StatusBar"
import { Wallpaper } from "@/components/os/Wallpaper"
import { dock, homePage1, homePage2, type AppId, type BrowserSite } from "@/data/apps"
import { currentApp, useCurrentApp, useOSNav } from "@/lib/nav"
import { useOS } from "@/lib/store"

const ALL_ICONS = [...homePage1, ...homePage2, ...dock]

/** The phone's screen: everything inside the glass. */
export function Phone() {
  const pathname = usePathname()
  // Opens the instant an icon is tapped; the URL catches up a moment later.
  const appId = useCurrentApp()
  const [screen, setScreen] = useState<HTMLDivElement | null>(null)
  const locked = useOS((s) => s.locked)
  const originKey = useOS((s) => s.originKey)
  const brightness = useOS((s) => s.brightness)
  const reduced = useOS((s) => s.reducedMotion)
  const { home } = useOSNav()

  // Remember the last open app so the closing window knows which icon to shrink into.
  const [lastApp, setLastApp] = useState<AppId | null>(appId)
  if (appId && appId !== lastApp) setLastApp(appId)

  const site = useMemo<BrowserSite | undefined>(() => ALL_ICONS.find((i) => i.key === originKey)?.site, [originKey])
  // Measured during render on purpose: the home icons are on screen right now, before the window covers them.
  const clip = useMemo(() => (typeof window === "undefined" ? "" : originClip(screen, appId ?? lastApp ?? "messages", originKey)), [appId, lastApp, originKey, screen])

  // Previous pathname, so "go home" can step back in history instead of piling up entries.
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current === pathname) return
    useOS.getState().setPrevPath(lastPath.current)
    lastPath.current = pathname
    // The URL has caught up with the optimistic open/close: follow it again.
    useOS.getState().setOpenApp(undefined)
  }, [pathname])

  // Returning visitors and deep links skip the lock screen (the inline script already hid it).
  // Also restore the visitor's own home-screen arrangement, if they rearranged it before.
  useEffect(() => {
    useOS.getState().hydrateLayout()
    if (document.documentElement.getAttribute("data-returning") === "true") useOS.setState({ locked: false })
  }, [])

  // Icons fly in once after the first unlock.
  const justUnlocked = useOS((s) => s.justUnlocked)
  useEffect(() => {
    if (!justUnlocked) return
    const t = setTimeout(() => useOS.getState().clearJustUnlocked(), 1400)
    return () => clearTimeout(t)
  }, [justUnlocked])

  // Battery drains about 1% every 20 seconds while the visitor browses.
  useEffect(() => {
    const t = setInterval(() => {
      const s = useOS.getState()
      if (!s.locked && document.visibilityState === "visible") s.drainBattery()
    }, 20000)
    return () => clearInterval(t)
  }, [])

  // Keyboard: Esc goes home, ←/→ switch home pages.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useOS.getState()
      const target = e.target instanceof Element ? e.target : null
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='slider']")) return
      if (document.querySelector("[data-vaul-drawer], [role='menu']") || s.controlCenter) return
      if (e.key === "Escape") {
        if (s.editMode) s.setEditMode(false)
        else if (currentApp()) home()
      } else if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !currentApp() && !s.locked) {
        s.setHomePage(Math.max(0, Math.min(1, s.homePage + (e.key === "ArrowRight" ? 1 : -1))))
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [home])

  return (
    <div
      ref={setScreen}
      className="os-screen relative isolate h-full w-full overflow-clip bg-bg text-text [transform:translateZ(0)]"
    >
      <PhoneScreenContext.Provider value={screen}>
        <Wallpaper />
        <HomeScreen inert={!!appId || locked} />
        <AnimatePresence initial={false} custom={clip}>
          {appId && <AppWindow key={appId} app={appId} site={site} clip={clip} reduced={reduced} />}
        </AnimatePresence>
        <AnimatePresence>{locked && !appId && <LockScreen key="lock" />}</AnimatePresence>
        <StatusBar />
        <Banners />
        <ControlCenter />
        <Toasts />
        {/* Brightness really dims the screen. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[95] bg-black transition-opacity duration-150"
          style={{ opacity: (1 - brightness) * 0.85 }}
        />
      </PhoneScreenContext.Provider>
    </div>
  )
}
