"use client"

import { Phone, PhoneOff } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"

import { calls } from "@/data/game"
import { profile } from "@/data/profile"
import { getGame, ringNext, startCall, stopRinging, toast, useGame } from "@/lib/game"
import { play } from "@/lib/sound"
import { getUI, openPhone } from "@/lib/ui"

/** Unanswered calls stop ringing after this long (they stay in the phone's Recent calls). */
const RING_MS = 25_000

/** True when something already has the visitor's attention: an overlay, the loading screen, MISSION PASSED. */
function busy() {
  const ui = getUI()
  const html = document.documentElement
  return !!(ui.phone || ui.pause || ui.wheel || document.querySelector("dialog[open]") || html.classList.contains("intro-pending") || html.style.overflow === "hidden")
}

/**
 * Seyf calling: a card above the HUD phone button, with Answer / Decline. Not modal and never
 * steals focus; it's announced politely. Queued calls wait until nothing else is on screen.
 * Answering opens the phone on the call screen.
 */
export function IncomingCall() {
  const { live } = useGame()
  const ringing = live.ringing
  const waiting = live.queue.length > 0

  // Ring the next queued call once the screen is free.
  useEffect(() => {
    if (!waiting || ringing) return
    const tryRing = () => {
      if (!busy()) ringNext()
    }
    tryRing()
    const id = window.setInterval(tryRing, 1500)
    return () => window.clearInterval(id)
  }, [waiting, ringing])

  // While ringing: shake the HUD phone button, chime, and give up after a while.
  useEffect(() => {
    if (!ringing) return
    const html = document.documentElement
    html.classList.add("phone-ringing")
    play("ding")
    let rings = 1
    const chime = window.setInterval(() => {
      if (rings++ < 3) play("pop")
    }, 4000)
    const miss = window.setTimeout(() => {
      if (getGame().live.ringing !== ringing) return
      stopRinging()
      toast("Missed call", "Seyf · replay it from the phone")
    }, RING_MS)
    return () => {
      html.classList.remove("phone-ringing")
      window.clearInterval(chime)
      window.clearTimeout(miss)
    }
  }, [ringing])

  const call = ringing ? calls[ringing] : null

  return (
    <div aria-live="polite" className="fixed right-4 bottom-[5.25rem] z-[55] w-[min(20rem,calc(100vw-2rem))] lg:right-6 lg:bottom-[6.5rem]">
      {call && (
        <section aria-label={`Incoming call from ${profile.name}`} className="game-call hud-panel rounded-2xl !bg-bg/95 p-3 shadow-[0_24px_60px_-20px_rgb(255_79_163/0.6)]">
          <div className="flex items-center gap-3">
            <span className="relative shrink-0">
              <span aria-hidden="true" className="call-pulse absolute inset-0 rounded-full bg-pink/50" />
              <Image src={profile.portrait.src} alt="" width={48} height={48} className="relative size-12 rounded-full object-cover ring-2 ring-orange" />
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[0.6875rem] tracking-[0.16em] text-gold uppercase">Incoming call</span>
              <span className="block truncate font-semibold text-ink">{profile.name}</span>
              <span className="block truncate text-sm text-ink/75">{call.label}</span>
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                stopRinging()
                play("tap")
                toast("Call declined", "Replay it any time from the phone")
              }}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-ink/20 text-sm font-semibold text-ink hover:border-pink hover:text-[#ff8cc4]"
            >
              <PhoneOff aria-hidden="true" className="size-4" />
              Decline
            </button>
            <button
              type="button"
              onClick={() => {
                startCall(call.id)
                openPhone("call")
              }}
              className="bg-sunset inline-flex h-11 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-bg hover:shadow-[var(--glow)]"
            >
              <Phone aria-hidden="true" className="size-4" />
              Answer
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
