"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useEffect } from "react"

import { DesktopStage } from "@/components/desktop/DesktopStage"
import { Phone } from "@/components/os/Phone"
import { ResumeView } from "@/components/resume/ResumeView"
import { installBackStack, notePush } from "@/lib/backStack"
import { readStoredTheme, useOS } from "@/lib/store"

/**
 * Root of SeyfOS. Lives in the (os) route-group layout, so it stays mounted while the URL changes
 * between /, /app/<id> and /resume: apps open and close without a page reload, and the back button
 * closes them. /resume swaps the phone for the one-page résumé (the phone animates out).
 */
export function OSShell() {
  const pathname = usePathname()
  const router = useRouter()
  const resume = pathname === "/resume"

  useEffect(() => {
    installBackStack(window.location.pathname)
    const s = useOS.getState()
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    s.setReducedMotion(mq.matches)
    const onChange = () => useOS.getState().setReducedMotion(mq.matches)
    mq.addEventListener("change", onChange)
    const attr = document.documentElement.getAttribute("data-theme")
    s.setTheme(readStoredTheme() ?? (attr === "dark" ? "dark" : "light"))
    return () => mq.removeEventListener("change", onChange)
  }, [])

  // Keep <html data-theme> in step with the store (the control center and Settings change it).
  const theme = useOS((s) => s.theme)
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
  }, [theme])

  return (
    <AnimatePresence mode="wait" initial={false}>
      {resume ? (
        <motion.main
          key="resume"
          id="main"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <ResumeView
            onBack={() => {
              const prev = useOS.getState().prevPath
              if (prev && prev !== "/resume") router.back()
              else {
                // Arrived straight on /resume: swap it for home so back doesn't bounce to the résumé.
                router.replace("/")
                notePush(true)
              }
            }}
          />
        </motion.main>
      ) : (
        <motion.main
          key="os"
          id="main"
          className="os-root fixed inset-0"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
        >
          <DesktopStage>
            <Phone />
          </DesktopStage>
        </motion.main>
      )}
    </AnimatePresence>
  )
}
