"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { cheats } from "@/data/game"
import { missionBySlug } from "@/data/missions"
import { addHeat, enterCheat, getGame, queueCall } from "@/lib/game"
import { closeWheel, getUI, openWheel, useUI } from "@/lib/ui"

import { IncomingCall } from "./IncomingCall"
import { Toasts } from "./Toasts"

// Downloaded the first time the wheel opens.
const SkillsWheel = dynamic(() => import("./SkillsWheel").then((mod) => mod.SkillsWheel), { ssr: false })

/** The first call from Seyf rings this long after the visitor arrives (first visit only). */
const INTRO_CALL_DELAY = 30_000
/** Holding Q longer than this opens the wheel only while held; a quick tap toggles it. */
const HOLD_MS = 350
const LONGEST_CODE = Math.max(...cheats.map((c) => c.code.length))

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || !!target.closest("input, textarea, select, [contenteditable='true']")
}

/**
 * The game layer, mounted once in the root layout: records what the visitor explores (the HUD
 * interest level), listens for cheat codes and the Q key (skills wheel), schedules the welcome
 * call, and shows notifications and the ringing phone. Recruiter mode (/cv) is left alone: it only
 * counts the visit.
 */
export function Game() {
  const pathname = usePathname()
  const recruiter = pathname === "/cv"
  const { wheel } = useUI()
  const [wheelArmed, setWheelArmed] = useState(false)
  if (wheel && !wheelArmed) setWheelArmed(true)

  // What the visitor has explored.
  useEffect(() => {
    const slug = pathname.startsWith("/missions/") ? pathname.split("/")[2] : undefined
    if (slug) {
      if (missionBySlug(slug)) addHeat(`visit:${slug}`)
    } else if (pathname === "/stats") addHeat("stats")
    else if (pathname === "/contact") addHeat("contact")
    else if (pathname === "/cv") addHeat("cv")
  }, [pathname])

  // The welcome call, once ever.
  useEffect(() => {
    if (getGame().save.calls.includes("intro")) return
    const t = window.setTimeout(() => queueCall("intro"), INTRO_CALL_DELAY)
    return () => window.clearTimeout(t)
  }, [])

  // Cheat codes typed anywhere, and Q for the skills wheel. Never while typing in a field.
  useEffect(() => {
    if (recruiter) return
    let typed = ""
    let lastKey = 0
    let qDown = 0

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing || isEditable(e.target)) return
      if (e.key.length !== 1 || !/[a-z]/i.test(e.key)) return

      if ((e.key === "q" || e.key === "Q") && !e.repeat) {
        const ui = getUI()
        if (ui.wheel) {
          closeWheel()
          qDown = 0
        } else if (!ui.pause && !ui.phone && !document.querySelector("dialog[open]") && !document.documentElement.classList.contains("intro-pending")) {
          openWheel()
          qDown = performance.now()
        }
      }
      if (e.repeat) return

      const now = performance.now()
      typed = (now - lastKey > 2500 ? "" : typed) + e.key.toUpperCase()
      typed = typed.slice(-LONGEST_CODE)
      lastKey = now
      const match = cheats.find((c) => typed.endsWith(c.code))
      if (match) {
        typed = ""
        enterCheat(match.code)
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "q" && e.key !== "Q") return
      if (qDown && performance.now() - qDown > HOLD_MS && getUI().wheel) closeWheel()
      qDown = 0
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
    }
  }, [recruiter])

  if (recruiter) return null
  return (
    <div className="no-print">
      <Toasts />
      <IncomingCall />
      {wheelArmed && <SkillsWheel />}
    </div>
  )
}
