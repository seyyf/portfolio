"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useState } from "react"

import { useCity } from "@/lib/store"
import { playSfx } from "@/lib/sound"

const FLOORS = 5
const FLOOR_H = 36
const SHAFT_TOP = 12
// Car y for each floor (0 = ground floor).
const floorY = (f: number) => SHAFT_TOP + (FLOORS - 1 - f) * FLOOR_H + 4
// Ride: ground, 2, 4, 1, 3, ground, with a pause at each stop.
const STOPS = [0, 2, 4, 1, 3, 0]
const RIDE_Y = STOPS.flatMap((f) => [floorY(f), floorY(f)])
const RIDE_TIMES = RIDE_Y.map((_, i) => i / (RIDE_Y.length - 1))

/** Bertsch Innovation: a swinging "Est. 2020" sign and a busy little elevator. */
export function Est2020() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useCity((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const [swing, setSwing] = useState(0)

  const nudge = () => {
    setSwing((s) => s + 1)
    playSfx("click")
  }

  return (
    <figure className="flex w-full flex-col items-center gap-4">
      <div className="flex w-full items-end justify-center gap-6">
        {/* Hanging sign */}
        <button type="button" onClick={nudge} className="rounded-3xl p-1" aria-label="Est. 2020. Nudge the sign">
          <svg aria-hidden viewBox="0 0 200 160" className="h-auto w-[180px] overflow-visible">
            {/* bracket */}
            <rect x="20" y="4" width="160" height="12" rx="6" fill="#8a5a36" stroke="#2b2d42" strokeWidth="3" />
            <circle cx="62" cy="10" r="3" fill="#2b2d42" />
            <circle cx="138" cy="10" r="3" fill="#2b2d42" />

            <motion.g
              key={swing}
              style={{ originX: 0.5, originY: 0 }}
              initial={{ rotate: 0 }}
              animate={reduce ? { rotate: 0 } : { rotate: [0, swing ? -12 : 9, 7, -5, 3.5, -2, 1, 0] }}
              transition={{ duration: 3.2, ease: "easeInOut", delay: swing ? 0 : 0.3 }}
            >
              {/* strings */}
              <path d="M62 10L40 62M138 10l22 52" stroke="#2b2d42" strokeWidth="2.5" strokeLinecap="round" />
              {/* board */}
              <rect x="22" y="64" width="156" height="76" rx="16" fill="#2b2d42" />
              <rect x="22" y="58" width="156" height="76" rx="16" fill="#d9a066" stroke="#2b2d42" strokeWidth="4" />
              <path
                d="M36 74c30-4 60 4 128-2M34 118c40 4 80-6 130 2M48 96c20-2 30 2 40 0"
                fill="none"
                stroke="#b97a45"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="40" cy="64" r="3.5" fill="#fffbf5" stroke="#2b2d42" strokeWidth="2" />
              <circle cx="160" cy="64" r="3.5" fill="#fffbf5" stroke="#2b2d42" strokeWidth="2" />
              <text
                x="100"
                y="108"
                textAnchor="middle"
                className="font-display"
                fontSize="32"
                fontWeight="700"
                fill="#2b2d42"
              >
                Est. 2020
              </text>
            </motion.g>
          </svg>
        </button>

        {/* Elevator */}
        <svg viewBox="0 0 80 208" className="h-auto w-[72px] shrink-0" role="img" aria-label="A small elevator riding up and down five floors">
          <rect x="18" y={SHAFT_TOP - 8} width="56" height={FLOORS * FLOOR_H + 14} rx="10" fill="#a0d2eb" stroke="#2b2d42" strokeWidth="3" />
          <rect x="26" y={SHAFT_TOP} width="40" height={FLOORS * FLOOR_H} rx="4" fill="#fffbf5" stroke="#2b2d42" strokeWidth="2.5" />
          {Array.from({ length: FLOORS }, (_, i) => {
            const y = SHAFT_TOP + i * FLOOR_H
            return (
              <g key={i}>
                {i > 0 && <path d={`M26 ${y}h40`} stroke="#2b2d42" strokeWidth="1.5" opacity="0.3" />}
                <text x="9" y={y + FLOOR_H / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor" className="font-display">
                  {FLOORS - i}
                </text>
              </g>
            )
          })}
          <path d={`M46 ${SHAFT_TOP}v${FLOORS * FLOOR_H}`} stroke="#2b2d42" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.35" />
          <motion.g
            initial={{ y: floorY(0) }}
            animate={reduce ? { y: floorY(0) } : { y: RIDE_Y }}
            transition={reduce ? { duration: 0 } : { duration: 14, times: RIDE_TIMES, ease: "easeInOut", repeat: Infinity }}
          >
            <rect x="29" y="0" width="34" height={FLOOR_H - 8} rx="5" fill="#ffd97d" stroke="#2b2d42" strokeWidth="2.5" />
            <path d={`M46 3v${FLOOR_H - 14}`} stroke="#2b2d42" strokeWidth="2" />
            <circle cx="40" cy="10" r="3.2" fill="#2b2d42" />
            <path d="M35.5 22a4.5 4.5 0 0 1 9 0" fill="#2b2d42" />
          </motion.g>
        </svg>
      </div>

      <figcaption className="text-center text-sm text-text-soft">
        Where it all started: my first developer job, alongside my Master&apos;s.
      </figcaption>
    </figure>
  )
}
