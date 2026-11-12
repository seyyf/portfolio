"use client"

import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion"
import { useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react"

import { WidgetFor } from "@/components/ui/widgets"
import { buildingById, type Building } from "@/data/city"
import { lockScroll } from "@/lib/scroll"
import { useCity } from "@/lib/store"

const DESKTOP = "(min-width: 860px)"
function useIsDesktop() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(DESKTOP)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(DESKTOP).matches,
    () => true
  )
}

const list: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
}
const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 380, damping: 30 } },
}

/** Slides in from the side on desktop, up from the bottom as a sheet on phones. */
export function InfoPanel() {
  const id = useCity((s) => s.panel)
  const close = useCity((s) => s.closePanel)
  const desktop = useIsDesktop()
  const reduced = useReducedMotion()
  const b = id ? buildingById[id] : null
  const returnFocus = useRef<HTMLElement | null>(null)

  // Layout effect: runs before the panel moves focus to its close button (a passive effect),
  // so this captures the element the visitor opened the panel from.
  useLayoutEffect(() => {
    if (!id) return
    returnFocus.current = document.activeElement as HTMLElement | null
    const explore = useCity.getState().mode === "explore"
    if (!explore) lockScroll(true)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      if (useCity.getState().mode !== "explore") lockScroll(false)
    }
  }, [id, close])

  const offscreen = reduced ? { opacity: 0 } : desktop ? { x: "110%" } : { y: "100%" }
  const onscreen = reduced ? { opacity: 1 } : desktop ? { x: 0 } : { y: 0 }

  return (
    // Focus goes back to whatever opened the panel once it has fully left (the exiting panel can
    // still hold focus during its exit animation).
    <AnimatePresence onExitComplete={() => returnFocus.current?.focus?.({ preventScroll: true })}>
      {b && (
        <motion.div
          key={b.id}
          role="dialog"
          aria-labelledby="panel-title"
          className={
            desktop
              ? "card fixed top-24 right-4 bottom-4 z-40 flex w-[min(440px,calc(100vw-2rem))] flex-col overflow-hidden"
              : "card fixed inset-x-0 bottom-0 z-40 flex max-h-[86svh] flex-col overflow-hidden rounded-b-none"
          }
          initial={offscreen}
          animate={onscreen}
          exit={offscreen}
          transition={reduced ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 30 }}
          drag={!desktop && !reduced ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.6 }}
          onDragEnd={(_, info) => {
            if (info.offset.y > 120 || info.velocity.y > 600) close()
          }}
        >
          {!desktop && <div aria-hidden="true" className="mx-auto mt-2.5 h-1.5 w-12 shrink-0 rounded-full bg-ink/25" />}
          <PanelBody b={b} onClose={close} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PanelBody({ b, onClose }: { b: Building; onClose: () => void }) {
  const closeBtn = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    closeBtn.current?.focus({ preventScroll: true })
  }, [])
  return (
    <>
      <div className="flex shrink-0 items-start gap-3 px-5 pt-4 pb-3 sm:px-6 sm:pt-6">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl border-2 border-line bg-butter text-2xl shadow-[0_3px_0_var(--line)]">
          {b.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-text-soft">{b.place}</p>
          <h2 id="panel-title" className="font-display text-2xl leading-tight font-semibold sm:text-3xl">
            {b.name}
          </h2>
        </div>
        <button ref={closeBtn} type="button" onClick={onClose} className="btn btn-plain btn-icon btn-sm shrink-0" aria-label={`Close ${b.name}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <motion.div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-6 sm:px-6"
        data-lenis-prevent
        variants={list}
        initial="hidden"
        animate="show"
        onPointerDownCapture={(e) => e.stopPropagation()}
      >
        {(b.role || b.period) && (
          <motion.p variants={item} className="font-semibold text-text-soft">
            {b.role}
            {b.role && b.period ? ", " : ""}
            {b.period}
          </motion.p>
        )}
        <motion.ul variants={list} className="mt-3 space-y-2.5">
          {b.story.map((line) => (
            <motion.li key={line} variants={item} className="flex gap-2.5 leading-relaxed">
              <span aria-hidden="true" className="mt-2 size-2 shrink-0 rounded-full bg-coral" />
              <span>{line}</span>
            </motion.li>
          ))}
        </motion.ul>
        {b.stack.length > 0 && (
          <motion.ul variants={item} className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech used">
            {b.stack.map((s) => (
              <li key={s} className="chip">
                {s}
              </li>
            ))}
          </motion.ul>
        )}
        {b.widget && (
          <motion.div variants={item} className="mt-6">
            <WidgetFor key={b.id} widget={b.widget} />
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
