import { create } from "zustand"

import type { AppId } from "@/data/apps"

export type Theme = "light" | "dark"

/** A live activity in the pill at the top of the screen. */
export type Activity = {
  id: string
  /** Emoji or short glyph shown on the left. */
  icon: string
  label: string
  /** Optional right-side detail, e.g. "2 min". */
  detail?: string
  /** 0..1 shows a progress bar. */
  progress?: number
  tone?: "default" | "success"
}

/** A notification banner that slides in from the top. */
export type Banner = {
  id: string
  from: string
  text: string
  /** App to open when the banner is tapped. */
  app?: AppId
  action?: { label: string; app: AppId }
}

type OSState = {
  locked: boolean
  /**
   * App shown right now, set the instant an icon is tapped (before the URL finishes changing) so apps
   * open with no delay. undefined = follow the URL (back button, deep links).
   */
  openApp: AppId | null | undefined
  /** Icons fly in from depth only on the first unlock. */
  justUnlocked: boolean
  /** Key of the icon that opened the current app (the open/close animation starts from it). */
  originKey: string | null
  /** Pathname before the current one (to decide between history.back and push on "go home"). */
  prevPath: string | null
  homePage: number
  editMode: boolean
  theme: Theme
  sound: boolean
  battery: number
  charging: boolean
  lowBatteryShown: boolean
  /** 0.35..1; the screen is dimmed below 1. */
  brightness: number
  controlCenter: boolean
  activity: Activity | null
  banners: Banner[]
  toasts: { id: string; text: string }[]
  reducedMotion: boolean

  setOpenApp: (app: AppId | null | undefined) => void
  unlock: () => void
  lock: () => void
  clearJustUnlocked: () => void
  setOrigin: (key: string | null) => void
  setPrevPath: (path: string | null) => void
  setHomePage: (page: number) => void
  setEditMode: (on: boolean) => void
  setTheme: (theme: Theme) => void
  toggleSound: () => void
  drainBattery: () => void
  recharge: () => void
  setBrightness: (v: number) => void
  setControlCenter: (open: boolean) => void
  /** Shows (or replaces) the live activity. Hides itself after `hideAfterMs` if given. */
  showActivity: (activity: Activity, hideAfterMs?: number) => void
  updateActivity: (id: string, patch: Partial<Activity>, hideAfterMs?: number) => void
  clearActivity: (id?: string) => void
  notify: (banner: Omit<Banner, "id"> & { id?: string }) => void
  dismissBanner: (id: string) => void
  toast: (text: string) => void
  setReducedMotion: (on: boolean) => void
}

let activityTimer: ReturnType<typeof setTimeout> | undefined
let seq = 0
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${seq++}`

export const useOS = create<OSState>()((set, get) => ({
  locked: true,
  openApp: undefined,
  justUnlocked: false,
  originKey: null,
  prevPath: null,
  homePage: 0,
  editMode: false,
  theme: "light",
  sound: false,
  battery: 32,
  charging: false,
  lowBatteryShown: false,
  brightness: 1,
  controlCenter: false,
  activity: null,
  banners: [],
  toasts: [],
  reducedMotion: false,

  setOpenApp: (openApp) => set({ openApp }),
  unlock: () => {
    if (!get().locked) return
    set({ locked: false, justUnlocked: true })
    try {
      window.localStorage.setItem(VISITED_KEY, "1")
    } catch {
      // Storage can be blocked; the lock screen will simply show again next time.
    }
  },
  lock: () => set({ locked: true, editMode: false, controlCenter: false }),
  clearJustUnlocked: () => set({ justUnlocked: false }),
  setOrigin: (originKey) => set({ originKey }),
  setPrevPath: (prevPath) => set({ prevPath }),
  setHomePage: (homePage) => set({ homePage }),
  setEditMode: (editMode) => set({ editMode }),
  setTheme: (theme) => {
    set({ theme })
    try {
      window.localStorage.setItem(THEME_KEY, theme)
    } catch {
      // Not persisted this time; the theme still applies for this visit.
    }
  },
  toggleSound: () => set((s) => ({ sound: !s.sound })),
  drainBattery: () => {
    const s = get()
    if (s.charging || s.battery <= 1) return
    const battery = s.battery - 1
    set({ battery })
    if (battery <= 5 && !s.lowBatteryShown) {
      set({ lowBatteryShown: true })
      get().notify({
        from: "Battery",
        text: "Running low… better hire Seyf before it dies 🔋",
        action: { label: "Open Mail", app: "mail" },
      })
    }
  },
  recharge: () => {
    if (get().charging) return
    set({ charging: true })
    const step = () => {
      const b = get().battery
      if (b >= 100) {
        set({ charging: false, lowBatteryShown: false })
        return
      }
      set({ battery: Math.min(100, b + 4) })
      setTimeout(step, 45)
    }
    step()
  },
  setBrightness: (brightness) => set({ brightness: Math.min(1, Math.max(0.35, brightness)) }),
  setControlCenter: (controlCenter) => set({ controlCenter, editMode: false }),
  showActivity: (activity, hideAfterMs) => {
    clearTimeout(activityTimer)
    set({ activity })
    if (hideAfterMs) activityTimer = setTimeout(() => get().clearActivity(activity.id), hideAfterMs)
  },
  updateActivity: (id, patch, hideAfterMs) => {
    const a = get().activity
    if (!a || a.id !== id) return
    clearTimeout(activityTimer)
    set({ activity: { ...a, ...patch } })
    if (hideAfterMs) activityTimer = setTimeout(() => get().clearActivity(id), hideAfterMs)
  },
  clearActivity: (id) => {
    const a = get().activity
    if (!a || (id && a.id !== id)) return
    clearTimeout(activityTimer)
    set({ activity: null })
  },
  notify: (banner) => {
    const id = banner.id ?? uid("banner")
    set((s) => ({ banners: [...s.banners.filter((b) => b.id !== id), { ...banner, id }] }))
    setTimeout(() => get().dismissBanner(id), 6500)
  },
  dismissBanner: (id) => set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),
  toast: (text) => {
    const id = uid("toast")
    set((s) => ({ toasts: [...s.toasts.slice(-1), { id, text }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 2600)
  },
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}))

export const THEME_KEY = "seyfos-theme"
export const VISITED_KEY = "seyfos-visited"

export function readStoredTheme(): Theme | null {
  try {
    const v = window.localStorage.getItem(THEME_KEY)
    return v === "light" || v === "dark" ? v : null
  } catch {
    return null
  }
}
