"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { closePhone, getUI, useUI } from "@/lib/ui"

// The overlay (dialog, apps, contact form) is a separate chunk, downloaded the first time the phone
// opens. Until then this renders nothing.
const PhoneShell = dynamic(() => import("./PhoneShell").then((mod) => mod.PhoneShell), { ssr: false })

/** The in-game phone. Open it with openPhone() / openPhone("messages") from lib/ui. */
export function Phone() {
  const { phone } = useUI()
  const [armed, setArmed] = useState(false)
  if (phone !== null && !armed) setArmed(true)

  // A link inside the phone (or anywhere) navigated: put the phone away.
  const pathname = usePathname()
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    if (getUI().phone) closePhone()
  }, [pathname])

  return armed ? <PhoneShell /> : null
}
