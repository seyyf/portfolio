"use client"

import { useProgress } from "@react-three/drei"
import { AnimatePresence, motion } from "framer-motion"

import { useCity } from "@/lib/store"

/**
 * Loading screen: a little crane stacking blocks. The percentage combines real signals: the 3D code
 * chunk arriving, asset loading from drei's useProgress (models, if any are configured), and the
 * first frames rendering with compiled shaders.
 */
export function Loader({ codeLoaded }: { codeLoaded: boolean }) {
  const ready = useCity((s) => s.sceneReady)
  const { progress, total } = useProgress()
  const assets = total > 0 ? progress / 100 : 1
  const pct = ready ? 100 : codeLoaded ? Math.round(55 + assets * 35) : 15
  const step = ready ? "Lights on" : !codeLoaded ? "Unpacking the toolbox" : assets < 1 ? "Delivering the buildings" : "Raising the city"

  return (
    <AnimatePresence>
      {!ready && (
        <motion.div
          key="loader"
          role="status"
          aria-live="polite"
          aria-label={`Building the city, ${pct}%`}
          className="fixed inset-0 z-[55] grid place-items-center bg-[linear-gradient(180deg,var(--sky-top),var(--sky-bottom))]"
          exit={{ opacity: 0, y: -30, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div className="flex flex-col items-center gap-5 px-6 text-center">
            <Crane />
            <p className="font-display text-6xl font-semibold tabular-nums text-text">{pct}%</p>
            <p className="font-display text-lg font-medium text-text-soft">{step}…</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Crane() {
  return (
    <svg width="180" height="150" viewBox="0 0 180 150" aria-hidden="true" className="overflow-visible">
      <style>{`
        .hook { animation: hook 2.4s ease-in-out infinite; transform-origin: 120px 22px; }
        .b1 { animation: pop 2.4s ease-out infinite; transform-origin: 70px 140px; }
        .b2 { animation: pop 2.4s ease-out .4s infinite; transform-origin: 98px 140px; }
        .b3 { animation: pop 2.4s ease-out .8s infinite; transform-origin: 84px 112px; }
        @keyframes hook { 0%,100% { transform: rotate(-6deg) } 50% { transform: rotate(6deg) } }
        @keyframes pop { 0% { transform: scale(0) } 18% { transform: scale(1.15) } 26%,90% { transform: scale(1) } 100% { transform: scale(0) } }
        @media (prefers-reduced-motion: reduce) { .hook,.b1,.b2,.b3 { animation: none } }
      `}</style>
      {/* ground */}
      <rect x="10" y="140" width="160" height="8" rx="4" fill="#7FD3B0" stroke="#2B2D42" strokeWidth="2.5" />
      {/* tower and jib */}
      <rect x="22" y="22" width="12" height="118" fill="#FFD97D" stroke="#2B2D42" strokeWidth="2.5" />
      <path d="M22 40 L34 52 M22 64 L34 76 M22 88 L34 100 M22 112 L34 124" stroke="#2B2D42" strokeWidth="2" />
      <rect x="10" y="16" width="140" height="8" rx="3" fill="#FFD97D" stroke="#2B2D42" strokeWidth="2.5" />
      <rect x="8" y="24" width="14" height="12" fill="#FF8B94" stroke="#2B2D42" strokeWidth="2.5" />
      {/* hook with a swinging block */}
      <g className="hook">
        <line x1="120" y1="22" x2="120" y2="66" stroke="#2B2D42" strokeWidth="2" />
        <rect x="108" y="66" width="24" height="20" rx="4" fill="#A0D2EB" stroke="#2B2D42" strokeWidth="2.5" />
      </g>
      {/* blocks stacking up */}
      <rect className="b1" x="58" y="116" width="24" height="24" rx="4" fill="#FF8B94" stroke="#2B2D42" strokeWidth="2.5" />
      <rect className="b2" x="86" y="116" width="24" height="24" rx="4" fill="#C3B1E1" stroke="#2B2D42" strokeWidth="2.5" />
      <rect className="b3" x="72" y="92" width="24" height="24" rx="4" fill="#A8E6CF" stroke="#2B2D42" strokeWidth="2.5" />
    </svg>
  )
}
