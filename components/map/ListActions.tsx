"use client"

import { LocateFixed, MessageSquare } from "lucide-react"

import { isDesktop, selectMarker } from "@/components/map/store"
import { Button } from "@/components/ui/Button"
import { motionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { openPhone } from "@/lib/ui"

/** "Show on map": opens the marker's briefing on the map (desktop scrolls back up to it). */
export function LocateButton({ id, name }: { id: string; name: string }) {
  return (
    <Button
      variant="ghost"
      size="md"
      aria-label={`Show on map: ${name}`}
      onClick={() => {
        play("tap")
        if (isDesktop()) document.getElementById("map")?.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" })
        selectMarker(id)
      }}
    >
      <LocateFixed aria-hidden="true" className="size-4" /> Show on map
    </Button>
  )
}

/** The locked mission: message Seyf to unlock it. */
export function UnlockButton() {
  return (
    <Button
      variant="outline"
      onClick={() => {
        play("pop")
        openPhone("messages")
      }}
    >
      <MessageSquare aria-hidden="true" className="size-4" /> Message Seyf
    </Button>
  )
}
