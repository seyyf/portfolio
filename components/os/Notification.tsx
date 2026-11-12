"use client"

import { AnimatePresence, motion } from "framer-motion"

import { AppIconArt } from "@/components/os/icons"
import type { AppId } from "@/data/apps"
import { springs } from "@/lib/animations"
import { useOSNav } from "@/lib/nav"
import { useOS } from "@/lib/store"

/** One notification card (lock screen list and top banners share the look). */
export function NotificationCard({
  app,
  from,
  text,
  time,
  onOpen,
  action,
}: {
  app?: AppId
  from: string
  text: string
  time?: string
  onOpen?: () => void
  action?: { label: string; onClick: () => void }
}) {
  return (
    <div className="glass-strong flex w-full items-start gap-3 rounded-[22px] p-3 text-left text-text shadow-[0_8px_24px_-12px_rgba(31,34,51,0.35)]">
      <span className="mt-0.5 w-9 shrink-0 text-[9px]">{app ? <AppIconArt app={app} /> : <span className="grid aspect-square place-items-center rounded-[24%] bg-butter text-base">🔋</span>}</span>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left" disabled={!onOpen}>
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-semibold">{from}</span>
          {time && <span className="text-[11px] text-text-soft">{time}</span>}
        </span>
        <span className="mt-0.5 block text-[14px] leading-snug">{text}</span>
      </button>
      {action && (
        <button type="button" onClick={action.onClick} className="btn btn-accent min-h-9 shrink-0 self-center px-3 text-[13px]">
          {action.label}
        </button>
      )}
    </div>
  )
}

/** Banners slide down from the top; swipe up or wait to dismiss, tap to open the app. */
export function Banners() {
  const banners = useOS((s) => s.banners)
  const dismiss = useOS((s) => s.dismissBanner)
  const reduced = useOS((s) => s.reducedMotion)
  const { open } = useOSNav()
  return (
    <div className="pointer-events-none absolute inset-x-0 top-[calc(var(--status-h)+env(safe-area-inset-top))] z-50 flex flex-col gap-2 px-3" aria-live="polite">
      <AnimatePresence>
        {banners.map((b) => (
          <motion.div
            key={b.id}
            layout
            className="pointer-events-auto"
            initial={reduced ? { opacity: 0 } : { y: -90, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: -90, opacity: 0 }}
            transition={reduced ? { duration: 0.15 } : springs.bouncy}
            drag={reduced ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.6, bottom: 0.1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y < -30) dismiss(b.id)
            }}
          >
            <NotificationCard
              app={b.app ?? b.action?.app}
              from={b.from}
              text={b.text}
              time="now"
              onOpen={
                b.app
                  ? () => {
                      dismiss(b.id)
                      open(b.app!)
                    }
                  : undefined
              }
              action={
                b.action
                  ? {
                      label: b.action.label,
                      onClick: () => {
                        dismiss(b.id)
                        open(b.action!.app)
                      },
                    }
                  : undefined
              }
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/** Small toasts above the home indicator. */
export function Toasts() {
  const toasts = useOS((s) => s.toasts)
  const reduced = useOS((s) => s.reducedMotion)
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--home-h)+env(safe-area-inset-bottom)+16px)] z-80 flex flex-col items-center gap-2 px-4" role="status" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={reduced ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={reduced ? { duration: 0.15 } : springs.bouncy}
            className="rounded-full bg-[#0B0C16] px-4 py-2.5 text-[14px] font-medium text-white shadow-lg"
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
