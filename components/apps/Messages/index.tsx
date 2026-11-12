"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useRef, useState } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import type { AppId } from "@/data/apps"
import { chat, profile } from "@/data/profile"
import { fade, springs } from "@/lib/animations"
import { useOSNav } from "@/lib/nav"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

import { Avatar, Bubble, TypingBubble, type Message } from "./parts"

type Reply = (typeof chat.replies)[number]

/** Time "Seyf" spends typing a message: longer messages take longer, within 600 to 1200ms. */
const typingTime = (text: string) => Math.min(1200, 600 + text.length * 11)

function prefersReducedNow() {
  return useOS.getState().reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/** Messages: a short chat with Seyf that introduces him, then offers quick replies that open apps. */
export default function MessagesApp() {
  const { open, home } = useOSNav()
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [messages, setMessages] = useState<Message[]>([])
  const [typing, setTyping] = useState(false)
  const [phase, setPhase] = useState<"intro" | "replies" | "answering">("intro")

  const scrollRef = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const seq = useRef(0)

  const wait = (ms: number) =>
    new Promise<void>((resolve) => {
      timers.current.push(window.setTimeout(resolve, ms))
    })

  // The intro script. Restarts each time the app opens; reduced motion shows everything at once.
  useEffect(() => {
    let cancelled = false
    const pending = timers.current
    const later = (ms: number) =>
      new Promise<void>((resolve) => {
        pending.push(window.setTimeout(resolve, ms))
      })

    const run = async () => {
      const instant = prefersReducedNow()
      await later(instant ? 0 : 450)
      if (cancelled) return
      if (instant) {
        setMessages(chat.intro.map((text, i) => ({ id: `intro-${i}`, from: "seyf", text })))
        setPhase("replies")
        return
      }
      for (const [i, text] of chat.intro.entries()) {
        setTyping(true)
        await later(typingTime(text))
        if (cancelled) return
        setTyping(false)
        setMessages((m) => [...m, { id: `intro-${i}`, from: "seyf", text }])
        playSfx("ping")
        await later(i === chat.intro.length - 1 ? 250 : 380)
        if (cancelled) return
      }
      setPhase("replies")
    }
    void run()

    return () => {
      cancelled = true
      pending.forEach((t) => window.clearTimeout(t))
      pending.length = 0
    }
  }, [])

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" })
  }, [messages, typing, phase, reduce])

  const send = async (reply: Reply) => {
    if (phase !== "replies") return
    const instant = prefersReducedNow()
    const n = seq.current++
    setPhase("answering")
    setMessages((m) => [...m, { id: `me-${n}`, from: "me", text: reply.label }])
    playSfx("key")

    if (!instant) {
      await wait(380)
      setTyping(true)
      await wait(typingTime(reply.answer))
      setTyping(false)
    }
    setMessages((m) => [...m, { id: `seyf-${n}`, from: "seyf", text: reply.answer }])
    playSfx("ping")

    await wait(instant ? 600 : 900)
    if (reply.go === "home") home(0)
    else open(reply.go as AppId)
    // If the app is still mounted (e.g. navigation was blocked), let the visitor pick again.
    setPhase("replies")
  }

  // Clear pending timers if the app closes mid-conversation.
  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((t) => window.clearTimeout(t))
  }, [])

  return (
    <AppScreen title="Messages" scroll={false}>
      <div ref={scrollRef} className="app-scroll min-h-0 flex-1 px-4 pb-3">
        <ContactCard />

        <ol role="log" aria-live="polite" aria-relevant="additions" aria-label={`Conversation with ${profile.firstName}`} className="flex flex-col">
          {messages.map((m, i) => {
            const next = messages[i + 1]
            const prev = messages[i - 1]
            // The last bubble of a run gets the tail (and Seyf's avatar), unless he's typing the next one.
            const tail = next ? next.from !== m.from : !(m.from === "seyf" && typing)
            return (
              <Bubble
                key={m.id}
                message={m}
                tail={tail}
                firstOfGroup={!prev || prev.from !== m.from}
                splitReveal={m.id === "intro-0" && !reduce}
                reduce={reduce}
              />
            )
          })}
        </ol>

        <AnimatePresence>{typing && <TypingBubble key="typing" reduce={reduce} />}</AnimatePresence>
      </div>

      <div className="shrink-0 px-4 pt-2">
        <AnimatePresence initial={false} mode="popLayout">
          {phase === "replies" && (
            <motion.div
              key="replies"
              role="group"
              aria-label="Quick replies"
              className="flex flex-wrap justify-end gap-2"
              initial="hidden"
              animate="shown"
              exit="hidden"
              variants={{ hidden: {}, shown: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
            >
              {chat.replies.map((r) => (
                <motion.button
                  key={r.label}
                  type="button"
                  onClick={() => void send(r)}
                  variants={{
                    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.9 },
                    shown: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={reduce ? fade : springs.bouncy}
                  whileTap={reduce ? undefined : { scale: 0.94 }}
                  className={cn(
                    "min-h-11 rounded-full border border-line bg-surface px-4 py-2 text-[0.9375rem] font-semibold text-text shadow-(--shadow)",
                    "transition-colors hover:bg-surface-2"
                  )}
                >
                  {r.label}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {phase !== "replies" && (
          <p className="flex min-h-11 items-center justify-center text-xs font-medium text-text-soft" aria-hidden="true">
            {phase === "intro" ? `${profile.firstName} is introducing himself…` : `${profile.firstName} is replying…`}
          </p>
        )}
      </div>
    </AppScreen>
  )
}

/** Conversation header: who you're talking to. */
function ContactCard() {
  return (
    <div className="flex flex-col items-center pt-1 pb-5 text-center">
      <Avatar size="lg" />
      <p className="mt-2 font-display text-lg font-semibold">{profile.name}</p>
      <p className="text-xs font-medium text-text-soft">
        {profile.title} · {profile.city}
      </p>
    </div>
  )
}
