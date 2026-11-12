"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback } from "react"

import { appHref, appIds, type AppId, type BrowserSite } from "@/data/apps"
import { consumeLayers, notePush, planHome } from "@/lib/backStack"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"

/** The app for a pathname like /app/educaro, or null on the home screen. */
export function appFromPath(pathname: string): AppId | null {
  const m = pathname.match(/^\/app\/([^/?#]+)/)
  return m && (appIds as string[]).includes(m[1]) ? (m[1] as AppId) : null
}

/** The app on screen: the one just tapped (optimistic), else the one in the URL. */
export function useCurrentApp(): AppId | null {
  const pathname = usePathname()
  const optimistic = useOS((s) => s.openApp)
  return optimistic !== undefined ? optimistic : appFromPath(pathname)
}

export function currentApp(): AppId | null {
  const o = useOS.getState().openApp
  return o !== undefined ? o : appFromPath(window.location.pathname)
}

type Router = ReturnType<typeof useRouter>

/**
 * Pushes an app screen. If an overlay is open (it owns a same-URL history entry), that entry is
 * replaced instead, so closing the overlay can't undo this navigation and history stays clean.
 */
function navigate(router: Router, href: string) {
  if (consumeLayers() > 0) router.replace(href, { scroll: false })
  else router.push(href, { scroll: false })
  notePush(false)
}

/**
 * OS navigation. Every app is a real URL (/app/<id>), so the phone's back button closes apps too.
 * `originKey` is the home icon the app opens from (and shrinks back into on close).
 */
export function useOSNav() {
  const router = useRouter()

  const open = useCallback(
    (app: AppId, opts: { site?: BrowserSite; originKey?: string } = {}) => {
      const os = useOS.getState()
      os.setOrigin(opts.originKey ?? null)
      os.setEditMode(false)
      os.setControlCenter(false)
      if (os.locked) os.unlock()
      const href = appHref({ app, site: opts.site })
      // Already showing it: nothing to do (and no duplicate history entry).
      if (window.location.pathname + window.location.search === href) return
      // Open now; the URL catches up in the background.
      os.setOpenApp(app)
      playSfx("tap")
      navigate(router, href)
    },
    [router]
  )

  const home = useCallback(
    (page?: number) => {
      const os = useOS.getState()
      os.setControlCenter(false)
      if (typeof page === "number") os.setHomePage(page)
      if (currentApp() === null && window.location.pathname === "/") return
      os.setOpenApp(null)
      // Like a phone, going home leaves no trail: rewind the screens SeyfOS opened since home.
      // From a deep link (no home entry below), replace the current entry with home instead, so
      // the back button doesn't reopen the app.
      const { steps, replace } = planHome()
      if (steps > 0) {
        if (replace) {
          const onPop = () => {
            window.removeEventListener("popstate", onPop)
            router.replace("/", { scroll: false })
          }
          window.addEventListener("popstate", onPop)
        }
        window.history.go(-steps)
      } else if (replace) {
        router.replace("/", { scroll: false })
      }
    },
    [router]
  )

  const resume = useCallback(() => {
    useOS.getState().setControlCenter(false)
    navigate(router, "/resume")
  }, [router])

  /** Fetch an app route ahead of time (icon hover/press) so the URL change is instant too. */
  const prefetch = useCallback((app: AppId, site?: BrowserSite) => router.prefetch(appHref({ app, site })), [router])

  return { open, home, resume, prefetch }
}
