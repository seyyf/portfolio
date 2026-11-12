"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useState } from "react"

import { skillGroups } from "@/data/city"
import { useCity } from "@/lib/store"
import { playSfx } from "@/lib/sound"

const GROUP_COLORS = ["bg-sky", "bg-mint", "bg-coral", "bg-butter", "bg-lavender"]

const LID_DELAY = 0.25
const FIRST_BADGE_DELAY = 0.7
const BADGE_STAGGER = 0.035
const GROUP_GAP = 0.14

// When each group starts popping, so groups come out one after another.
const groupDelays = skillGroups.reduce<number[]>((acc, _, i) => {
  if (i === 0) return [FIRST_BADGE_DELAY]
  const prev = skillGroups[i - 1]
  return [...acc, acc[i - 1] + prev.items.length * BADGE_STAGGER + GROUP_GAP]
}, [])

/** Workshop: a toolbox that opens and spills out every skill, group by group. */
export function Toolbox() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useCity((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  // Bumping the round remounts the animated parts, so the box closes and opens again.
  const [round, setRound] = useState(0)

  const replay = () => {
    setRound((r) => r + 1)
    playSfx("pop")
  }

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <button
        type="button"
        onClick={replay}
        className="rounded-3xl p-1 transition-transform hover:-rotate-2 active:scale-95"
        aria-label="Close the toolbox and open it again"
      >
        <ToolboxArt key={round} reduce={reduce} />
      </button>

      <div key={round} className="flex w-full flex-col gap-4">
        {skillGroups.map((group, g) => (
          <section key={group.label} aria-labelledby={`toolbox-${g}`}>
            <motion.h3
              id={`toolbox-${g}`}
              className="mb-2 text-sm font-semibold text-text-soft"
              initial={{ opacity: 0, x: reduce ? 0 : -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduce ? 0 : groupDelays[g] - 0.08, duration: 0.3 }}
            >
              {group.label}
            </motion.h3>
            <ul className="flex flex-wrap gap-2">
              {group.items.map((skill, i) => (
                <motion.li
                  key={skill}
                  className={`chip text-ink ${GROUP_COLORS[g % GROUP_COLORS.length]}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0, rotate: i % 2 ? 14 : -14, y: -18 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0, y: 0 }}
                  transition={
                    reduce
                      ? { duration: 0.25 }
                      : {
                          type: "spring",
                          stiffness: 520,
                          damping: 13,
                          mass: 0.7,
                          delay: groupDelays[g] + i * BADGE_STAGGER,
                          opacity: { duration: 0.1, delay: groupDelays[g] + i * BADGE_STAGGER },
                        }
                  }
                  whileHover={reduce ? undefined : { y: -2, rotate: i % 2 ? 3 : -3 }}
                >
                  {skill}
                </motion.li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}

function ToolboxArt({ reduce }: { reduce: boolean }) {
  const open = { rotate: -24 }
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 240 160"
      className="h-auto w-[200px] overflow-visible"
      initial={reduce ? false : { y: 0 }}
      animate={reduce ? undefined : { y: [0, 0, -6, 0] }}
      transition={{ duration: 0.5, times: [0, 0.4, 0.7, 1], delay: LID_DELAY - 0.1 }}
    >
      {/* shadow */}
      <ellipse cx="120" cy="150" rx="96" ry="7" fill="#2b2d42" opacity="0.15" />

      {/* inside of the box */}
      <rect x="34" y="58" width="172" height="20" rx="6" fill="#1b1f3b" />

      {/* tools peeking out once the lid is up */}
      <motion.g initial={reduce ? false : { y: 34 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 12, delay: LID_DELAY + 0.25 }}>
        {/* wrench */}
        <path d="M70 76V44" stroke="#a0d2eb" strokeWidth="9" strokeLinecap="round" />
        <path d="M61 38a10 10 0 1 0 18 0l-5 4h-8z" fill="#a0d2eb" stroke="#2b2d42" strokeWidth="3" strokeLinejoin="round" />
        {/* pencil */}
        <path d="M112 78V36" stroke="#ffd97d" strokeWidth="10" />
        <path d="M107 36l5-12 5 12z" fill="#f7e4cd" stroke="#2b2d42" strokeWidth="2.5" strokeLinejoin="round" />
        {/* screwdriver */}
        <path d="M160 78V52" stroke="#c3b1e1" strokeWidth="12" strokeLinecap="round" />
        <path d="M160 50V30" stroke="#2b2d42" strokeWidth="4" strokeLinecap="round" />
      </motion.g>

      {/* body */}
      <rect x="26" y="66" width="188" height="78" rx="16" fill="#ff8b94" stroke="#2b2d42" strokeWidth="4" />
      <path d="M26 96h188" stroke="#2b2d42" strokeWidth="3" opacity="0.25" />
      <rect x="106" y="80" width="28" height="18" rx="5" fill="#ffd97d" stroke="#2b2d42" strokeWidth="3" />
      <circle cx="120" cy="89" r="2.5" fill="#2b2d42" />

      {/* lid, hinged on the left */}
      <motion.g
        style={{ originX: 0, originY: 1 }}
        initial={reduce ? open : { rotate: 0 }}
        animate={reduce ? open : { rotate: [0, 0, -34, -20, -26, -24] }}
        transition={{ duration: 0.9, times: [0, 0.05, 0.35, 0.6, 0.8, 1], delay: LID_DELAY, ease: "easeOut" }}
      >
        <path d="M100 44V30a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v14" fill="none" stroke="#2b2d42" strokeWidth="6" strokeLinecap="round" />
        <rect x="22" y="42" width="196" height="26" rx="11" fill="#ff6f7b" stroke="#2b2d42" strokeWidth="4" />
      </motion.g>

      {/* sparkles */}
      {!reduce &&
        [
          { x: 214, y: 30, d: 0 },
          { x: 196, y: 8, d: 0.08 },
          { x: 40, y: 14, d: 0.16 },
        ].map((s) => (
          <motion.path
            key={`${s.x}-${s.y}`}
            d={`M${s.x} ${s.y - 7}l2 5 5 2-5 2-2 5-2-5-5-2 5-2z`}
            fill="#ffd97d"
            stroke="#2b2d42"
            strokeWidth="1.5"
            strokeLinejoin="round"
            style={{ originX: 0.5, originY: 0.5 }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 0.9], rotate: [0, 45, 30] }}
            transition={{ duration: 0.6, delay: LID_DELAY + 0.35 + s.d }}
          />
        ))}
    </motion.svg>
  )
}
