"use client"

import { AnimatePresence, motion } from "framer-motion"

import { springs } from "@/lib/animations"
import { useOS } from "@/lib/store"

/**
 * The live pill at the top centre. Compact when idle; it morphs (Framer layout animation) into an
 * expanded card for live activities: deploys, coffee orders, downloads.
 */
export function LivePill() {
  const activity = useOS((s) => s.activity)
  const clear = useOS((s) => s.clearActivity)
  const reduced = useOS((s) => s.reducedMotion)
  const transition = reduced ? { duration: 0.15 } : springs.pill

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[9px] flex justify-center">
      <motion.div
        layout
        transition={transition}
        role="status"
        aria-live="polite"
        onClick={() => activity && clear(activity.id)}
        className={`pointer-events-auto overflow-hidden bg-[#0B0C16] text-white shadow-[0_6px_20px_-6px_rgba(0,0,0,0.45)] ${
          activity ? "w-[min(320px,calc(100%-24px))] cursor-pointer rounded-[26px]" : "h-[32px] w-[104px] rounded-full"
        }`}
        style={{ borderRadius: activity ? 26 : 999 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {activity ? (
            <motion.div
              key={activity.id + activity.label}
              initial={{ opacity: 0, filter: "blur(6px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.22 }}
              className="flex flex-col gap-2 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/12 text-base" aria-hidden="true">
                  {activity.icon}
                </span>
                <span className={`min-w-0 flex-1 truncate text-[14px] font-semibold ${activity.tone === "success" ? "text-[#9BF0C9]" : ""}`}>
                  {activity.label}
                </span>
                {activity.detail && <span className="shrink-0 text-[13px] font-medium text-white/65 tabular-nums">{activity.detail}</span>}
              </div>
              {typeof activity.progress === "number" && (
                <div className="h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
                  <motion.div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#A8E6CF,#A0D2EB)]"
                    initial={false}
                    animate={{ width: `${Math.round(activity.progress * 100)}%` }}
                    transition={springs.smooth}
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.span key="idle" className="flex h-[32px] items-center justify-end pr-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* A tiny lens dot keeps the idle pill feeling like hardware. */}
              <span aria-hidden="true" className="size-2.5 rounded-full bg-[radial-gradient(circle_at_35%_35%,#3a4060,#0b0c16)] ring-1 ring-white/10" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
