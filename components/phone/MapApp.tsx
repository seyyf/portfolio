"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

import { buttonClass } from "@/components/ui/Button"
import { closePhone } from "@/lib/ui"

/** The Map app: a small card that sends the visitor to the full map on the home page. */
export function MapApp() {
  return (
    <div className="px-4 py-4">
      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-surface">
        {/* An abstract, original sketch of the gulf: sea, coast, the lake and a few mission pins. */}
        <svg viewBox="0 0 320 180" aria-hidden="true" className="block h-auto w-full">
          <rect width="320" height="180" fill="#0a1522" />
          <path d="M0 0h200c-10 22-4 40 12 52 14 10 18 26 10 42-10 20-6 44 14 60 10 8 14 18 12 26H0Z" fill="#15263a" />
          <path d="M120 70c14-8 34-6 44 4 8 8 4 22-10 26-16 4-36 0-40-12-2-8 0-14 6-18Z" fill="#0a1522" stroke="#2f6db5" strokeOpacity="0.5" />
          <path d="M200 0c-10 22-4 40 12 52 14 10 18 26 10 42-10 20-6 44 14 60 10 8 14 18 12 26" fill="none" stroke="#f2b544" strokeOpacity="0.35" strokeWidth="1.5" />
          <g fill="none" stroke="#eef2f5" strokeOpacity="0.08">
            <path d="M0 45h200M0 90h220M0 135h230M60 0v180M120 0v180" />
          </g>
          {[
            [70, 118],
            [104, 56],
            [150, 128],
            [190, 40],
            [214, 96],
          ].map(([x, y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="9" fill="#ff6b6b" fillOpacity="0.18" />
              <circle cx={x} cy={y} r="4.5" fill={i === 4 ? "#f2b544" : "#ff9a5c"} stroke="#0e1b2b" strokeWidth="1.5" />
            </g>
          ))}
        </svg>
        <div className="p-4">
          <p className="font-display text-2xl text-ink">
            <span>Greater Tunis</span>
          </p>
          <p className="mt-1 text-[0.9375rem] leading-snug text-muted">Every mission of Seyf&apos;s career, pinned on a stylized map of Greater Tunis.</p>
          <Link href="/#map" onClick={() => closePhone()} className={buttonClass("primary", "md", "mt-4 w-full")}>
            Open the map
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link href="/#missions" onClick={() => closePhone()} className={buttonClass("outline", "md", "mt-2 w-full")}>
            Mission list
          </Link>
        </div>
      </div>
    </div>
  )
}
