"use client"

import { RotateCcw } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { buttonClass } from "@/components/ui/Button"
import { addHeat } from "@/lib/game"
import { motionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"

/**
 * The 404's "Respawn at the map" button: a fade to black with RESPAWNING, then the map. Without
 * JavaScript it's a plain link; with reduced motion it goes straight there. Getting busted also
 * counts towards the interest level.
 */
export function Respawn() {
  const router = useRouter()
  const [going, setGoing] = useState(false)

  useEffect(() => addHeat("busted"), [])

  return (
    <>
      <Link
        href="/"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
          e.preventDefault()
          play("click")
          if (motionReduced()) {
            router.push("/")
            return
          }
          setGoing(true)
          window.setTimeout(() => router.push("/"), 1100)
        }}
        className={buttonClass("primary", "lg")}
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        Respawn at the map
      </Link>
      {going && (
        <div role="status" className="respawn fixed inset-0 z-[95] flex items-center justify-center bg-bg">
          <p className="font-display text-5xl text-ink lg:text-7xl">
            <span className="text-blue">Respawning…</span>
          </p>
        </div>
      )}
    </>
  )
}
