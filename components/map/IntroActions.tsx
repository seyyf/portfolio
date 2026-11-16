"use client"

import { Download, MessageSquare, Play } from "lucide-react"

import { selectMarker } from "@/components/map/store"
import { Button, ButtonAnchor } from "@/components/ui/Button"
import { missions } from "@/data/missions"
import { profile } from "@/data/profile"
import { play } from "@/lib/sound"
import { openPhone } from "@/lib/ui"

/** The intro card's three actions: start the story (Mission 01 briefing), download the CV, contact. */
export function IntroActions() {
  return (
    <div className="flex flex-wrap gap-2.5">
      <Button
        size="lg"
        className="w-full sm:w-auto lg:w-full"
        onClick={() => {
          play("click")
          selectMarker(missions[0].slug)
        }}
      >
        <Play aria-hidden="true" className="size-4 fill-current" /> Start the story
      </Button>
      <ButtonAnchor href={profile.cvPdf} download variant="outline" className="flex-1 px-3 sm:flex-none sm:px-5 lg:flex-1" onClick={() => play("click")}>
        <Download aria-hidden="true" className="size-4" /> Download CV
      </ButtonAnchor>
      <Button
        variant="outline"
        className="flex-1 px-3 sm:flex-none sm:px-5 lg:flex-1"
        onClick={() => {
          play("pop")
          openPhone("messages")
        }}
      >
        <MessageSquare aria-hidden="true" className="size-4" /> Contact
      </Button>
    </div>
  )
}
