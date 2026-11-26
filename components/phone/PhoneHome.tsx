"use client"

import { PhoneIncoming } from "lucide-react"
import { useId } from "react"

import { Palm } from "@/components/ui/Palm"
import { calls } from "@/data/game"
import { profile } from "@/data/profile"
import { startCall, useGame } from "@/lib/game"
import { play } from "@/lib/sound"
import { openWheel, setPhoneApp, type PhoneApp } from "@/lib/ui"

import { useTunisClock } from "./clock"

/** Phone apps on the home screen, plus "wheel", which opens the skills wheel. */
type App = Exclude<PhoneApp, "home" | "call"> | "wheel"

const APPS: { id: App; label: string; hint: string; Icon: (p: { uid: string }) => React.ReactElement }[] = [
  { id: "messages", label: "Messages", hint: "Send Seyf a message", Icon: MessagesIcon },
  { id: "contacts", label: "Contacts", hint: "Email, LinkedIn, CV", Icon: ContactsIcon },
  { id: "map", label: "Map", hint: "Missions across Tunis", Icon: MapIcon },
  { id: "codes", label: "Codes", hint: "Enter cheat codes", Icon: CodesIcon },
  { id: "wheel", label: "Skills", hint: "The skills wheel", Icon: WheelIcon },
  { id: "settings", label: "Settings", hint: "Sound, motion", Icon: SettingsIcon },
]

/** The phone's home screen: a sunset wallpaper, a clock widget, recent calls and the apps. */
export function PhoneHome({ returnFrom }: { returnFrom: PhoneApp }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const { time, date } = useTunisClock()
  const { save } = useGame()

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col px-5 pt-2 pb-6">
        <h2 className="sr-only">Home screen</h2>

        {/* Clock widget (Tunis time). */}
        <div className="text-center">
          <p className="font-mono text-6xl font-medium tracking-tight text-ink tabular-nums drop-shadow-[0_2px_12px_rgb(0_0_0/0.45)]">
            {time}
          </p>
          <p className="mt-1 text-[0.9375rem] font-medium text-ink/90">
            {date ? `${date} · ` : ""}
            Tunis
          </p>
        </div>

        <div className="hud-panel mt-6 rounded-2xl px-4 py-3">
          <p className="font-display text-xl text-ink">
            <span>{profile.name}</span>
          </p>
          <p className="mt-0.5 text-sm leading-snug text-ink/85">{profile.title}</p>
        </div>

        {save.calls.length > 0 && (
          <div className="hud-panel mt-3 rounded-2xl px-4 py-3">
            <h3 className="font-mono text-[0.6875rem] text-pink lowercase">Recent calls</h3>
            <ul className="mt-1.5 grid gap-1">
              {save.calls.map((id) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => {
                      play("tap")
                      startCall(id)
                      setPhoneApp("call")
                    }}
                    className="-mx-2 flex min-h-11 w-[calc(100%+1rem)] items-center gap-2.5 rounded-xl px-2 text-left hover:bg-ink/[0.06]"
                  >
                    <PhoneIncoming aria-hidden="true" className="size-4 shrink-0 text-orange" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.9375rem] font-semibold text-ink">{profile.name}</span>
                      <span className="block truncate text-[0.8125rem] text-ink/75">{calls[id].label}</span>
                    </span>
                    <span className="font-mono text-[0.6875rem] text-pink lowercase">Replay</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <ul aria-label="Apps" className="mt-auto grid grid-cols-2 gap-3 pt-8">
          {APPS.map(({ id, label, hint, Icon }) => (
            <li key={id}>
              <button
                type="button"
                data-phone-focus={id === (returnFrom === "home" ? "messages" : returnFrom) || undefined}
                onClick={() => {
                  play("tap")
                  if (id === "wheel") openWheel()
                  else setPhoneApp(id)
                }}
                className="hud-panel group flex w-full flex-col items-start gap-2 rounded-2xl p-3 text-left transition-[border-color,transform] hover:border-orange active:scale-[0.98]"
              >
                <span aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5">
                  <Icon uid={uid} />
                </span>
                <span>
                  <span className="block font-semibold text-ink">{label}</span>
                  <span className="block text-[0.8125rem] leading-snug text-ink/75">{hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** The home screen wallpaper: an original sunset over the gulf, with palms. Fills its positioned parent. */
export function Wallpaper() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#0e1b2b_0%,#1c2a55_34%,#5a2a6a_56%,#ff5c93_78%,#f2b544_100%)]" />
      <div className="absolute bottom-[14%] left-1/2 size-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#ffe39a_0%,#ffc94a_45%,rgb(242_181_68/0)_70%)] opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-[16%] bg-[linear-gradient(180deg,#0a1522,#0e1b2b)]" />
      <Palm className="absolute bottom-[10%] -left-6 h-56 text-bg" lean={0.6} />
      <Palm className="absolute right-0 bottom-[9%] h-44 -scale-x-100 text-bg" lean={0.9} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(14_27_43/0.2),rgb(14_27_43/0.6))]" />
    </div>
  )
}

// Original app icons, drawn for this site (56×56, rounded squares).

function MessagesIcon({ uid }: { uid: string }) {
  const g = `${uid}-msg`
  return (
    <svg viewBox="0 0 56 56" className="size-12">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6b6b" />
          <stop offset="0.6" stopColor="#ff9a5c" />
          <stop offset="1" stopColor="#f2b544" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="15" fill={`url(#${g})`} />
      <path d="M14 18a6 6 0 0 1 6-6h16a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H25l-7 6v-6.4A6 6 0 0 1 14 30Z" fill="#0e1b2b" />
      <circle cx="22" cy="24" r="2.2" fill="#ff6b6b" />
      <circle cx="28" cy="24" r="2.2" fill="#ff9a5c" />
      <circle cx="34" cy="24" r="2.2" fill="#f2b544" />
    </svg>
  )
}

function ContactsIcon({ uid }: { uid: string }) {
  const g = `${uid}-con`
  return (
    <svg viewBox="0 0 56 56" className="size-12">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a76d0" />
          <stop offset="1" stopColor="#3b3466" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="15" fill={`url(#${g})`} />
      <rect x="11" y="15" width="34" height="26" rx="5" fill="#eef2f5" />
      <circle cx="21" cy="25" r="4.2" fill="#ff9a5c" />
      <path d="M14.5 36c.8-3.6 3.4-5.6 6.5-5.6s5.7 2 6.5 5.6Z" fill="#ff9a5c" />
      <rect x="30" y="22" width="11" height="2.6" rx="1.3" fill="#3b3466" />
      <rect x="30" y="28" width="8" height="2.6" rx="1.3" fill="#93a4b8" />
    </svg>
  )
}

function MapIcon({ uid }: { uid: string }) {
  const g = `${uid}-map`
  return (
    <svg viewBox="0 0 56 56" className="size-12">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a5050" />
          <stop offset="1" stopColor="#123a3a" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="15" fill={`url(#${g})`} />
      <path d="M11 17l11-4 12 4 11-4v26l-11 4-12-4-11 4Z" fill="#2f6db5" />
      <path d="M22 13v26M34 17v26" stroke="#123a3a" strokeWidth="1.6" />
      <path d="M11 30c6-2 9 3 14 1s8-6 13-3 5 2 7 1" stroke="#eef2f5" strokeOpacity="0.55" strokeWidth="1.6" fill="none" />
      <path d="M33 14a6 6 0 0 1 6 6c0 4.6-6 10-6 10s-6-5.4-6-10a6 6 0 0 1 6-6Z" fill="#f2b544" />
      <circle cx="33" cy="20" r="2.2" fill="#123a3a" />
    </svg>
  )
}

function CodesIcon({ uid }: { uid: string }) {
  const g = `${uid}-codes`
  return (
    <svg viewBox="0 0 56 56" className="size-12">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#123a3a" />
          <stop offset="1" stopColor="#0e1b2b" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="15" fill={`url(#${g})`} />
      <rect x="10" y="18" width="36" height="20" rx="5" fill="none" stroke="#5ccdb5" strokeOpacity="0.7" strokeWidth="2" />
      <path d="M17 28h3M24 28h3M31 28h3" stroke="#5ccdb5" strokeWidth="3" strokeLinecap="round" />
      <rect x="37" y="23" width="2.4" height="10" rx="1" fill="#f2b544" />
    </svg>
  )
}

function WheelIcon({ uid }: { uid: string }) {
  const g = `${uid}-wheel`
  return (
    <svg viewBox="0 0 56 56" className="size-12">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6b6b" />
          <stop offset="1" stopColor="#ff9a5c" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="15" fill="#1c3048" />
      <circle cx="28" cy="28" r="17" fill="none" stroke="#eef2f5" strokeOpacity="0.25" strokeWidth="8" />
      <path d="M28 11a17 17 0 0 1 14.7 8.5" fill="none" stroke={`url(#${g})`} strokeWidth="8" />
      <circle cx="28" cy="28" r="6" fill="#f2b544" />
    </svg>
  )
}

function SettingsIcon({ uid }: { uid: string }) {
  const g = `${uid}-set`
  return (
    <svg viewBox="0 0 56 56" className="size-12">
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#233a55" />
          <stop offset="1" stopColor="#1c3048" />
        </linearGradient>
      </defs>
      <rect width="56" height="56" rx="15" fill={`url(#${g})`} />
      <g stroke="#eef2f5" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round">
        <path d="M14 18h28M14 28h28M14 38h28" />
      </g>
      <circle cx="34" cy="18" r="4.5" fill="#ff6b6b" />
      <circle cx="21" cy="28" r="4.5" fill="#ff9a5c" />
      <circle cx="37" cy="38" r="4.5" fill="#f2b544" />
    </svg>
  )
}
