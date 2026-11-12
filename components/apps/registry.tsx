import dynamic from "next/dynamic"
import type { ComponentType } from "react"

import { AppLoading } from "@/components/os/AppLoading"
import type { AppId } from "@/data/apps"

// Each app is its own code-split chunk (server-rendered on its own URL, loaded on demand on the client).
const loading = () => <AppLoading />

export const appComponents: Record<AppId, ComponentType> = {
  educaro: dynamic(() => import("./Educaro"), { loading }),
  fripa: dynamic(() => import("./Fripa"), { loading }),
  order: dynamic(() => import("./Order"), { loading }),
  uteek: dynamic(() => import("./Uteek"), { loading }),
  eprocat: dynamic(() => import("./EproCat"), { loading }),
  browser: dynamic(() => import("./Browser"), { loading }),
  messages: dynamic(() => import("./Messages"), { loading }),
  photos: dynamic(() => import("./Photos"), { loading }),
  calendar: dynamic(() => import("./Calendar"), { loading }),
  settings: dynamic(() => import("./Settings"), { loading }),
  files: dynamic(() => import("./Files"), { loading }),
  mail: dynamic(() => import("./Mail"), { loading }),
}

/** Starts downloading an app's code early (on icon hover, focus or press) so it opens instantly. */
export const preloadApp: Record<AppId, () => Promise<unknown>> = {
  educaro: () => import("./Educaro"),
  fripa: () => import("./Fripa"),
  order: () => import("./Order"),
  uteek: () => import("./Uteek"),
  eprocat: () => import("./EproCat"),
  browser: () => import("./Browser"),
  messages: () => import("./Messages"),
  photos: () => import("./Photos"),
  calendar: () => import("./Calendar"),
  settings: () => import("./Settings"),
  files: () => import("./Files"),
  mail: () => import("./Mail"),
}
