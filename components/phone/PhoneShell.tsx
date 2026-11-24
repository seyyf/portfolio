"use client"

import { AnimatePresence, m } from "framer-motion"
import { ChevronLeft, X } from "lucide-react"
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"

import { useMotionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { closePhone, getUI, setPhoneApp, useUI, type PhoneApp } from "@/lib/ui"
import { cn } from "@/lib/utils"

import { useTunisClock } from "./clock"
import { CallApp } from "./CallApp"
import { CodesApp } from "./CodesApp"
import { Contacts } from "./Contacts"
import { MapApp } from "./MapApp"
import { Messages } from "./Messages"
import { PhoneHome, Wallpaper } from "./PhoneHome"
import { SettingsApp } from "./SettingsApp"

const TITLES: Record<Exclude<PhoneApp, "home">, string> = { messages: "Messages", contacts: "Contacts", map: "Map", settings: "Settings", codes: "Codes", call: "Call" }
const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Moves focus to the open app's starting point: the first empty form field in Messages (pointer
 * devices only, so phones don't pop the keyboard), otherwise the element marked data-phone-focus
 * (the app heading, or the app icon the visitor came back from).
 */
function focusStart(root: HTMLElement) {
  const fine = window.matchMedia("(pointer: fine)").matches
  const target = (fine && root.querySelector<HTMLElement>("[data-phone-field-focus]")) || root.querySelector<HTMLElement>("[data-phone-focus]")
  target?.focus({ preventScroll: true })
}

/** The fallback when the element that opened the phone is gone (e.g. it was in the pause menu). */
function hudPhoneButton() {
  return document.querySelector<HTMLElement>('[data-phone-button]')
}

/**
 * The phone overlay. A native modal <dialog> (focus trap, inert page, top layer). The dialog spans
 * the viewport and is transparent; the device sits inside it: a framed phone above the HUD phone
 * button on md+, full screen below md. Clicking outside the device or pressing Esc closes it.
 */
export function PhoneShell() {
  const { phone } = useUI()
  const reduced = useMotionReduced()
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const open = phone !== null

  useEffect(() => {
    const d = dialog.current
    if (!d || !open) return
    if (!d.open) {
      const active = document.activeElement
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null
      d.showModal()
    }
    focusStart(d)
  }, [open])

  // After the closing animation: close the dialog and give focus back to whatever opened the phone.
  const onExitComplete = () => {
    const d = dialog.current
    if (!d || getUI().phone) return
    if (d.open) d.close()
    const back = opener.current
    opener.current = null
    const usable = back && back.isConnected && !back.closest("dialog:not([open])") && back.getClientRects().length > 0
    ;(usable ? back : hudPhoneButton())?.focus({ preventScroll: true })
  }

  const onKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Escape" || e.nativeEvent.isComposing) return
    // preventDefault: the dialog doesn't close instantly (we animate out) and the pause menu ignores this Esc.
    e.preventDefault()
    closePhone()
  }

  const deviceMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : {
        initial: { opacity: 0, y: 56, scale: 0.94 },
        animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: EASE } },
        exit: { opacity: 0, y: 40, scale: 0.96, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const } },
      }

  return (
    <dialog
      ref={dialog}
      aria-label="Phone"
      onKeyDown={onKeyDown}
      onCancel={(e) => {
        e.preventDefault()
        closePhone()
      }}
      onClose={() => {
        if (getUI().phone) closePhone()
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closePhone()
      }}
      className="no-print fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-ink backdrop:bg-bg/60 backdrop:backdrop-blur-[2px] md:backdrop:bg-bg/45"
    >
      <AnimatePresence onExitComplete={onExitComplete}>
        {phone && (
          <m.div
            key="device"
            {...deviceMotion}
            className={cn(
              "absolute inset-0 origin-bottom-right",
              "md:inset-auto md:right-4 md:bottom-[5.25rem] md:h-[min(760px,calc(100dvh-6.25rem))] md:w-[380px]",
              "lg:right-6 lg:bottom-[6.25rem] lg:h-[min(760px,calc(100dvh-7.75rem))]"
            )}
          >
            <Device app={phone} reduced={reduced} />
          </m.div>
        )}
      </AnimatePresence>
    </dialog>
  )
}

function Device({ app, reduced }: { app: PhoneApp; reduced: boolean }) {
  // Remember the last app so the home screen can put focus back on its icon.
  const [shown, setShown] = useState(app)
  const [cameFrom, setCameFrom] = useState<PhoneApp>("home")
  if (shown !== app) {
    setCameFrom(shown)
    setShown(app)
  }

  return (
    // Frame (md+ only): a dark bezel with a sunset rim light. Below md the screen is the whole viewport.
    <div className="h-full w-full md:rounded-[3rem] md:border md:border-ink/20 md:bg-[#05070d] md:p-2.5 md:shadow-[0_40px_90px_-30px_rgb(255_79_163/0.55),0_0_0_1px_rgb(255_138_61/0.25)]">
      <div aria-hidden="true" className="absolute top-28 -left-[3px] hidden h-12 w-[3px] rounded-l bg-ink/20 md:block" />
      <div aria-hidden="true" className="absolute top-44 -left-[3px] hidden h-16 w-[3px] rounded-l bg-ink/20 md:block" />
      <div aria-hidden="true" className="absolute top-36 -right-[3px] hidden h-20 w-[3px] rounded-r bg-ink/20 md:block" />

      <div className="relative h-full w-full overflow-hidden bg-bg md:rounded-[2.4rem]">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.section
            key={app}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: app === "home" ? -28 : 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: app === "home" ? 28 : -28 }}
            transition={{ duration: reduced ? 0.12 : 0.26, ease: EASE }}
            className="absolute inset-0 flex flex-col"
          >
            <AppScreen app={app} cameFrom={cameFrom} />
          </m.section>
        </AnimatePresence>

        {/* Status bar and home indicator float above every screen (the wallpaper runs behind them). */}
        <StatusBar />
        <HomeIndicator app={app} />
      </div>
    </div>
  )
}

/** Room kept free for the floating status bar (top) and home indicator (bottom). */
const TOP = "pt-[calc(2.5rem+env(safe-area-inset-top))] md:pt-11"
const BOTTOM = "pb-[calc(1.75rem+env(safe-area-inset-bottom))] md:pb-6"

function AppScreen({ app, cameFrom }: { app: PhoneApp; cameFrom: PhoneApp }) {
  const self = useRef<HTMLDivElement>(null)

  // On an app switch (the dialog is already open), move focus into the new screen. The first open is
  // handled by PhoneShell right after showModal().
  useEffect(() => {
    const el = self.current
    if (el && el.closest("dialog")?.open) focusStart(el)
  }, [])

  if (app === "home") {
    return (
      <div ref={self} className="relative flex min-h-0 flex-1 flex-col">
        <Wallpaper />
        <div className={cn("relative flex min-h-0 flex-1 flex-col", TOP)}>
          <div className="flex justify-end px-3">
            <CloseButton />
          </div>
          <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", BOTTOM)}>
            <PhoneHome returnFrom={cameFrom} />
          </div>
        </div>
      </div>
    )
  }

  let body: ReactNode
  if (app === "messages") body = <Messages variant="phone" />
  else if (app === "contacts") body = <Contacts className="px-4 py-4" />
  else if (app === "map") body = <MapApp />
  else if (app === "codes") body = <CodesApp />
  else if (app === "call") body = <CallApp />
  else body = <SettingsApp />

  return (
    <div ref={self} className={cn("flex min-h-0 flex-1 flex-col bg-bg", TOP, BOTTOM)}>
      <header className="flex shrink-0 items-center gap-1 border-b border-ink/10 px-2 pb-2">
        <button
          type="button"
          onClick={() => {
            play("tap")
            setPhoneApp("home")
          }}
          className="inline-flex h-11 items-center gap-0.5 rounded-xl pr-3 pl-1.5 text-[0.9375rem] font-semibold text-gold hover:bg-ink/[0.06]"
          aria-label="Back to Home screen"
        >
          <ChevronLeft aria-hidden="true" className="size-5" />
          Home
        </button>
        <h2 tabIndex={-1} data-phone-focus className="font-display min-w-0 flex-1 truncate text-center text-2xl leading-none text-ink outline-none">
          {TITLES[app]}
        </h2>
        <CloseButton />
      </header>
      <div className={cn("min-h-0 flex-1", app === "messages" ? "flex flex-col" : "overflow-y-auto overscroll-contain")}>{body}</div>
    </div>
  )
}

function CloseButton() {
  return (
    <button
      type="button"
      onClick={() => closePhone()}
      aria-label="Close the phone"
      aria-keyshortcuts="Escape"
      className="relative z-10 inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink/90 hover:bg-ink/[0.08] hover:text-ink"
    >
      <X aria-hidden="true" className="size-5" />
    </button>
  )
}

function StatusBar() {
  const { time } = useTunisClock()
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[calc(2.5rem+env(safe-area-inset-top))] items-center justify-between px-6 pt-[env(safe-area-inset-top)] font-mono text-[0.8125rem] font-medium text-ink md:h-11 md:px-7">
      <span className="tabular-nums">{time}</span>
      {/* Notch / camera pill (md+). */}
      <span className="hidden h-6 w-24 rounded-full bg-[#05070d] md:block" />
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="h-3 w-[1.1rem]" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4" />
        </svg>
        <span className="text-[0.6875rem] tracking-[0.1em]">TN</span>
        <svg viewBox="0 0 26 12" className="h-3 w-[1.6rem]">
          <rect x="0.5" y="0.5" width="22" height="11" rx="3" fill="none" stroke="currentColor" strokeOpacity="0.5" />
          <rect x="2.5" y="2.5" width="14" height="7" rx="1.5" fill="#ffc94a" />
          <rect x="23.5" y="4" width="2" height="4" rx="1" fill="currentColor" fillOpacity="0.5" />
        </svg>
      </span>
    </div>
  )
}

function HomeIndicator({ app }: { app: PhoneApp }) {
  const bar = <span className="block h-1.5 w-32 rounded-full bg-ink/70" />
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex h-[calc(1.75rem+env(safe-area-inset-bottom))] items-center justify-center pb-[env(safe-area-inset-bottom)] md:h-6">
      {app === "home" ? (
        <span aria-hidden="true">{bar}</span>
      ) : (
        // Swiping up isn't a thing here, but tapping the bar goes home, like the Back button.
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => {
            play("tap")
            setPhoneApp("home")
          }}
          className="pointer-events-auto flex h-6 items-center px-6"
        >
          {bar}
        </button>
      )}
    </div>
  )
}
