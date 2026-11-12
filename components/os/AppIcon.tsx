"use client"

import { motion } from "framer-motion"
import { MoreHorizontal } from "lucide-react"
import { useRef } from "react"

import { preloadApp } from "@/components/apps/registry"
import { AppIconArt } from "@/components/os/icons"
import type { HomeIcon } from "@/data/apps"
import { springs } from "@/lib/animations"
import { useOSNav } from "@/lib/nav"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

const LONG_PRESS_MS = 450

type Props = {
  icon: HomeIcon
  /** Position in the grid, for the staggered fly-in on first unlock. */
  index: number
  showLabel?: boolean
  onMenu: (icon: HomeIcon) => void
}

/**
 * A home-screen icon. Press: springs down to 0.9 and opens the app. Long-press (or right-click):
 * enters edit mode (wiggle) and opens its context menu. In edit mode a "⋯" button opens the menu,
 * so the gesture always has a tap alternative.
 */
export function AppIcon({ icon, index, showLabel = true, onMenu }: Props) {
  const { open, prefetch } = useOSNav()
  const editMode = useOS((s) => s.editMode)
  const setEditMode = useOS((s) => s.setEditMode)
  const justUnlocked = useOS((s) => s.justUnlocked)
  const reduced = useOS((s) => s.reducedMotion)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const longPressed = useRef(false)
  /** Set when the pointer travelled (e.g. swiping between home pages), so the release is not a tap. */
  const moved = useRef(false)

  const cancel = () => {
    clearTimeout(timer.current)
    start.current = null
  }
  const preload = () => {
    void preloadApp[icon.app]().catch(() => {})
    prefetch(icon.app, icon.site)
  }
  const label = `${icon.label}${icon.badge ? `, ${icon.badge} new` : ""}`

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={justUnlocked && !reduced ? { opacity: 0, scale: 0.35, y: 30 } : false}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ ...springs.bouncy, delay: justUnlocked ? 0.08 + index * 0.035 : 0 }}
    >
      <motion.button
        type="button"
        data-icon-key={icon.key}
        data-icon-app={icon.app}
        aria-label={label}
        className={cn("relative w-[62px] touch-manipulation rounded-[24%] select-none [-webkit-touch-callout:none]", editMode && !reduced && "wiggle")}
        style={editMode ? { animationDelay: `${-(index % 4) * 0.07}s` } : undefined}
        whileTap={reduced ? undefined : { scale: 0.9 }}
        transition={springs.snappy}
        onPointerEnter={preload}
        onFocus={preload}
        onPointerDown={(e) => {
          preload()
          longPressed.current = false
          moved.current = false
          start.current = { x: e.clientX, y: e.clientY }
          clearTimeout(timer.current)
          timer.current = setTimeout(() => {
            longPressed.current = true
            setEditMode(true)
            onMenu(icon)
            navigator.vibrate?.(8)
          }, LONG_PRESS_MS)
        }}
        onPointerMove={(e) => {
          if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8) {
            moved.current = true
            cancel()
          }
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onPointerLeave={cancel}
        onContextMenu={(e) => {
          e.preventDefault()
          cancel()
          setEditMode(true)
          onMenu(icon)
        }}
        onClick={(e) => {
          if (longPressed.current || moved.current) {
            e.preventDefault()
            longPressed.current = false
            moved.current = false
            return
          }
          if (editMode) {
            onMenu(icon)
            return
          }
          open(icon.app, { site: icon.site, originKey: icon.key })
        }}
      >
        <AppIconArt app={icon.app} site={icon.site} className="w-full text-[15px]" />
        {icon.badge && !editMode && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 grid min-w-[22px] place-items-center rounded-full bg-[#F2545F] px-1.5 text-[12px] leading-[22px] font-semibold text-white shadow"
          >
            {icon.badge}
          </span>
        )}
      </motion.button>
      {editMode && (
        <button
          type="button"
          aria-label={`Options for ${icon.label}`}
          onClick={() => onMenu(icon)}
          className="glass-strong absolute -top-2 -left-1 grid size-6 place-items-center rounded-full text-text shadow"
        >
          <MoreHorizontal size={14} aria-hidden="true" />
        </button>
      )}
      {showLabel && (
        <span aria-hidden="true" className="mt-1.5 w-[78px] truncate text-center text-[11.5px] leading-tight font-medium text-text [text-shadow:0_1px_2px_var(--bg)]">
          {icon.label}
        </span>
      )}
    </motion.div>
  )
}
