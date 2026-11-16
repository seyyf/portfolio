"use client"

import { AnimatePresence, LazyMotion, m, MotionConfig } from "framer-motion"
import { ThemeProvider } from "next-themes"
import dynamic from "next/dynamic"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { useToast } from "@/lib/toast"

// cmdk is only downloaded the first time the palette opens.
const CommandPalette = dynamic(() => import("./CommandPalette").then((mod) => mod.CommandPalette), { ssr: false })
const loadFeatures = () => import("@/lib/motionFeatures").then((mod) => mod.default)

type PaletteApi = { openPalette: () => void }
const PaletteContext = createContext<PaletteApi>({ openPalette: () => {} })
export const usePalette = () => useContext(PaletteContext)

export function Providers({ children }: { children: ReactNode }) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [paletteLoaded, setPaletteLoaded] = useState(false)

  const openPalette = useCallback(() => {
    setPaletteLoaded(true)
    setPaletteOpen(true)
  }, [])

  // ⌘K / Ctrl+K anywhere toggles the palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteLoaded(true)
        setPaletteOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const api = useMemo(() => ({ openPalette }), [openPalette])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LazyMotion features={loadFeatures} strict>
        <MotionConfig reducedMotion="user">
          <PaletteContext.Provider value={api}>
            {children}
            {paletteLoaded && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />}
            <Toaster />
          </PaletteContext.Provider>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  )
}

/** One short mono confirmation at the bottom of the screen, announced to screen readers. */
function Toaster() {
  const t = useToast()
  return (
    <div role="status" aria-live="polite" className="no-print pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {t && (
          <m.p
            key={t.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="rounded-[var(--radius-control)] border border-border bg-surface px-4 py-2.5 font-mono text-sm text-ink shadow-[var(--shadow-hover)]"
          >
            {t.text}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  )
}
