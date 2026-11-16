"use client"

import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

type StampProps = {
  /** Big word on the stamp. */
  label?: string
  /** Small line under it, e.g. the date. */
  subline?: string
  className?: string
}

/**
 * A red rubber stamp that slams onto the page: drops from twice its size with a bounce and lands at a
 * slight angle. The ink texture comes from an SVG noise filter. Decorative (aria-hidden): announce the
 * outcome in text next to it. Reduced motion: it simply appears.
 */
export function Stamp({ label = "RECEIVED", subline, className }: StampProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      aria-hidden="true"
      className={cn("pointer-events-none text-accent-ink mix-blend-multiply dark:mix-blend-screen", className)}
      initial={reduce ? false : { scale: 2, opacity: 0, rotate: -4 }}
      animate={{ scale: 1, opacity: 0.92, rotate: -12 }}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 560, damping: 15, mass: 0.9, opacity: { duration: 0.12 } }}
    >
      <svg viewBox="0 0 280 120" className="h-auto w-full overflow-visible" focusable="false">
        <defs>
          <filter id="stamp-ink" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} result="noise" />
            {/* Alpha from the noise's red channel: mostly solid ink with worn speckles. */}
            <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -3 0 0 0 2.4" result="speckle" />
            <feComposite in="SourceGraphic" in2="speckle" operator="in" result="inked" />
            <feDisplacementMap in="inked" in2="noise" scale={2.5} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#stamp-ink)">
          <rect x="6" y="6" width="268" height="108" rx="12" fill="none" stroke="currentColor" strokeWidth="6" />
          <rect x="16" y="16" width="248" height="88" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <text
            x="140"
            y="70"
            textAnchor="middle"
            textLength="216"
            lengthAdjust="spacingAndGlyphs"
            fill="currentColor"
            className="font-headline"
            fontSize="44"
            fontWeight="900"
          >
            {label}
          </text>
          {subline ? (
            <text x="140" y="92" textAnchor="middle" fill="currentColor" className="font-sans" fontSize="10" fontWeight="700" letterSpacing="1.5">
              {subline}
            </text>
          ) : null}
        </g>
      </svg>
    </motion.div>
  )
}
