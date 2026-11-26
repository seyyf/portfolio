"use client"

import { FileText, Map as MapIcon, MessageSquare, PhoneOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

import { calls } from "@/data/game"
import { profile } from "@/data/profile"
import { useGame } from "@/lib/game"
import { useMotionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { closePhone, setPhoneApp } from "@/lib/ui"
import { cn } from "@/lib/utils"

/** How long each line of the call stays before the next one comes in. */
const LINE_MS = 2600

/**
 * The call screen: Seyf's lines come in one by one, like subtitles, then the next step. With reduced
 * motion every line shows at once. The thread is a polite log, so screen readers follow along.
 */
export function CallApp() {
  const { live } = useGame()
  const call = calls[live.activeCall ?? "intro"]
  return <CallScreen key={call.id} id={call.id} />
}

function CallScreen({ id }: { id: keyof typeof calls }) {
  const call = calls[id]
  const reduced = useMotionReduced()
  const [shown, setShown] = useState(1)
  const [seconds, setSeconds] = useState(0)
  const all = reduced ? call.lines.length : shown
  const done = all >= call.lines.length

  useEffect(() => {
    if (reduced || done) return
    const t = window.setTimeout(() => setShown((n) => n + 1), LINE_MS)
    return () => window.clearTimeout(t)
  }, [reduced, done, shown])

  useEffect(() => {
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(t)
  }, [])

  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`

  return (
    <div className="flex min-h-full flex-col px-5 py-5">
      <div className="text-center">
        <span className="relative mx-auto block size-24">
          {!done && <span aria-hidden="true" className="call-pulse absolute inset-0 rounded-full bg-orange/40" />}
          <Image src={profile.portrait.src} alt="" width={96} height={96} className="relative size-24 rounded-full object-cover ring-2 ring-orange" />
        </span>
        <p className="mt-3 font-display text-3xl text-ink">
          <span>{profile.name}</span>
        </p>
        <p className="mt-1 font-mono text-xs text-gold lowercase tabular-nums">
          {call.label} · {done ? "call ended" : clock}
        </p>
      </div>

      <ol role="log" aria-label="Call transcript" className="mt-6 grid gap-2.5">
        {call.lines.slice(0, all).map((line, i) => (
          <li key={line} className={cn("call-line max-w-[90%] rounded-2xl rounded-tl-md bg-surface-2 px-4 py-2.5 text-[0.9375rem] leading-snug text-ink", i === all - 1 && !done && "border border-orange/30")}>
            {line}
          </li>
        ))}
      </ol>

      <div className="mt-auto grid gap-2 pt-6">
        {done && id === "wanted" && (
          <>
            <button type="button" onClick={() => { play("tap"); setPhoneApp("messages") }} className="bg-sunset inline-flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-bg">
              <MessageSquare aria-hidden="true" className="size-4" />
              Send Seyf a message
            </button>
            <Link href="/cv" className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-ink/20 font-semibold text-ink hover:border-orange hover:text-gold">
              <FileText aria-hidden="true" className="size-4" />
              Open the CV
            </Link>
          </>
        )}
        {done && id === "intro" && (
          <Link href="/#map" onClick={() => closePhone()} className="bg-sunset inline-flex h-12 items-center justify-center gap-2 rounded-xl font-semibold text-bg">
            <MapIcon aria-hidden="true" className="size-4" />
            Open the map
          </Link>
        )}
        <button
          type="button"
          onClick={() => {
            play("tap")
            setPhoneApp("home")
          }}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-pink/40 font-semibold text-[#ff8cc4] hover:bg-pink/10"
        >
          <PhoneOff aria-hidden="true" className="size-4" />
          {done ? "Back to Home" : "Hang up"}
        </button>
      </div>
    </div>
  )
}
