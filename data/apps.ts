import type { ProjectId } from "@/data/projects"

// The apps on SeyfOS. Every app has its own URL: /app/<id> (the browser takes ?site=).

export type AppId =
  | "educaro"
  | "fripa"
  | "order"
  | "uteek"
  | "eprocat"
  | "browser"
  | "messages"
  | "photos"
  | "calendar"
  | "settings"
  | "files"
  | "mail"

export type BrowserSite = "febal" | "aurelia" | "weedy"

export type AppDef = {
  id: AppId
  /** Label under the icon and window title. */
  name: string
  /** Accent colour: icon tile, desktop background glow. */
  accent: string
  /** Second icon gradient stop. */
  accent2: string
  kind: "project" | "system"
  project?: ProjectId
  /** Short description for SEO and the context menu. */
  description: string
}

export const apps: Record<AppId, AppDef> = {
  educaro: { id: "educaro", name: "Educaro CRM", accent: "#A0D2EB", accent2: "#7AB8DE", kind: "project", project: "educaro", description: "The CRM I rebuilt from AngularJS to React for Educaro: departments, before/after and the deploy pipeline." },
  fripa: { id: "fripa", name: "Fripa", accent: "#FF8B94", accent2: "#FFB3A7", kind: "project", project: "fripa", description: "Swipe-to-shop secondhand clothing store in Tunisia. Play the swipe game." },
  order: { id: "order", name: "Order", accent: "#FFD97D", accent2: "#FFB86B", kind: "project", project: "order", description: "Restaurant apps from Global ENR and Opus Lab: scan a QR menu, order a coffee, track it." },
  uteek: { id: "uteek", name: "Uteek Events", accent: "#C3B1E1", accent2: "#A895CF", kind: "project", project: "uteek", description: "Event booking in React and Next.js: pick a seat and get your ticket." },
  eprocat: { id: "eprocat", name: "e-proCAT", accent: "#9FD8C2", accent2: "#6CC3A3", kind: "project", project: "eprocat", description: "B2B product-catalog SaaS in Angular at Bertsch Innovation: search and filter the catalog." },
  browser: { id: "browser", name: "Browser", accent: "#B9C3F0", accent2: "#8E9BE0", kind: "system", description: "Websites I built: Febal Casa USA, Aurelia Gloves and Weedy." },
  messages: { id: "messages", name: "Messages", accent: "#A8E6CF", accent2: "#7FD3B0", kind: "system", description: "Chat with Seyf: who I am, in a few messages." },
  photos: { id: "photos", name: "Photos", accent: "#FFC1B6", accent2: "#FF8B94", kind: "system", description: "Screenshots of my projects, grouped in albums." },
  calendar: { id: "calendar", name: "Calendar", accent: "#FFFFFF", accent2: "#F1ECFA", kind: "system", description: "My career timeline, from university to today." },
  settings: { id: "settings", name: "Settings", accent: "#D9DCE8", accent2: "#B7BCD2", kind: "system", description: "My skills, all switched on. Plus appearance, sounds and Focus Mode." },
  files: { id: "files", name: "Files", accent: "#A0D2EB", accent2: "#6FB4DE", kind: "system", description: "Download my CV." },
  mail: { id: "mail", name: "Mail", accent: "#FFD97D", accent2: "#FF8B94", kind: "system", description: "Write to me." },
}

export const appIds = Object.keys(apps) as AppId[]

/** A home-screen icon. Most open their app; the three websites open the browser on their site. */
export type HomeIcon = { key: string; app: AppId; site?: BrowserSite; label: string; badge?: number }

// PLACEHOLDER hosts: shown in the in-phone address bar. Replace with the real domains.
export const browserSites: Record<BrowserSite, { name: string; host: string; project: ProjectId }> = {
  febal: { name: "Febal Casa", host: "febalcasa-usa.com", project: "febal" },
  aurelia: { name: "Aurelia", host: "aureliagloves.com", project: "aurelia" },
  weedy: { name: "Weedy", host: "weedy.fr", project: "weedy" },
}

/** Page 1: work. */
export const homePage1: HomeIcon[] = [
  { key: "educaro", app: "educaro", label: "Educaro CRM" },
  { key: "fripa", app: "fripa", label: "Fripa", badge: 1 },
  { key: "order", app: "order", label: "Order" },
  { key: "uteek", app: "uteek", label: "Uteek Events" },
  { key: "febal", app: "browser", site: "febal", label: "Febal Casa" },
  { key: "aurelia", app: "browser", site: "aurelia", label: "Aurelia" },
  { key: "weedy", app: "browser", site: "weedy", label: "Weedy" },
  { key: "eprocat", app: "eprocat", label: "e-proCAT" },
]

/** Page 2: system apps (widgets sit above them). */
export const homePage2: HomeIcon[] = [
  { key: "messages-2", app: "messages", label: "Messages", badge: 1 },
  { key: "photos-2", app: "photos", label: "Photos" },
  { key: "calendar", app: "calendar", label: "Calendar" },
  { key: "settings", app: "settings", label: "Settings" },
  { key: "files-2", app: "files", label: "Files" },
  { key: "mail-2", app: "mail", label: "Mail" },
]

export const dock: HomeIcon[] = [
  { key: "messages", app: "messages", label: "Messages", badge: 1 },
  { key: "photos", app: "photos", label: "Photos" },
  { key: "files", app: "files", label: "Files" },
  { key: "mail", app: "mail", label: "Mail" },
]

export const appHref = (icon: { app: AppId; site?: BrowserSite }) =>
  icon.site ? `/app/browser?site=${icon.site}` : `/app/${icon.app}`
