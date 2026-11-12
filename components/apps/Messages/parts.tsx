"use client"

import { motion } from "framer-motion"
import { useRef } from "react"

import { profile } from "@/data/profile"
import { fade, springs } from "@/lib/animations"
import { gsap, SplitText, useGSAP } from "@/lib/gsap"
import { cn } from "@/lib/utils"

export type Message = { id: string; from: "seyf" | "me"; text: string }

/** Seyf's avatar: a round "S" badge on a mint to sky gradient. */
export function Avatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-linear-135 from-mint to-sky font-display font-semibold text-ink",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_2px_8px_-2px_rgba(31,34,51,0.25)]",
        size === "lg" ? "size-16 text-3xl" : "size-7 text-sm"
      )}
    >
      S
    </span>
  )
}

type BubbleProps = {
  message: Message
  /** Last bubble of a run: rounded tail corner, and Seyf's avatar next to it. */
  tail: boolean
  firstOfGroup: boolean
  /** Reveal the text letter by letter (used for the very first message). */
  splitReveal: boolean
  reduce: boolean
}

export function Bubble({ message, tail, firstOfGroup, splitReveal, reduce }: BubbleProps) {
  const mine = message.from === "me"
  const textRef = useRef<HTMLSpanElement>(null)

  useGSAP(
    () => {
      if (!splitReveal || !textRef.current) return
      const split = SplitText.create(textRef.current, { type: "words,chars", aria: "auto" })
      gsap.from(split.chars, { opacity: 0, y: 7, scale: 0.6, duration: 0.55, ease: "os.spring", stagger: 0.028, delay: 0.08 })
    },
    { scope: textRef, dependencies: [splitReveal] }
  )

  return (
    <motion.li
      className={cn("flex items-end gap-2", mine ? "justify-end" : "justify-start", firstOfGroup ? "mt-3" : "mt-1")}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduce ? fade : springs.bouncy}
      style={{ originX: mine ? 1 : 0, originY: 1 }}
    >
      {!mine && (tail ? <Avatar /> : <span aria-hidden="true" className="w-7 shrink-0" />)}
      <p
        className={cn(
          "max-w-[78%] rounded-[20px] px-3.5 py-2 text-[0.96875rem] leading-snug",
          mine ? "bg-sky text-ink" : "bg-surface text-text shadow-[0_1px_2px_rgba(31,34,51,0.06)]",
          tail && (mine ? "rounded-br-md" : "rounded-bl-md")
        )}
      >
        <span className="sr-only">{mine ? "You: " : `${profile.firstName}: `}</span>
        <span ref={textRef}>{message.text}</span>
      </p>
    </motion.li>
  )
}

/** Three bouncing dots while Seyf "types". */
export function TypingBubble({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      aria-hidden="true"
      className="mt-3 flex items-end gap-2"
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, transition: { duration: 0.12 } }}
      transition={reduce ? fade : springs.bouncy}
      style={{ originX: 0, originY: 1 }}
    >
      <Avatar />
      <span className="flex h-9 items-center gap-1 rounded-[20px] rounded-bl-md bg-surface px-3.5 shadow-[0_1px_2px_rgba(31,34,51,0.06)]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2 rounded-full bg-text-soft/70"
            animate={reduce ? { opacity: [0.4, 1, 0.4] } : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: [0.45, 0, 0.3, 1] }}
          />
        ))}
      </span>
    </motion.div>
  )
}
