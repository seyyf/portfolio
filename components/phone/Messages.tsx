"use client"

import { AnimatePresence, m } from "framer-motion"
import { CircleAlert, LoaderCircle, Mail, RotateCcw, Send } from "lucide-react"
import { useEffect, useId, useRef, useState, useSyncExternalStore, type FormEvent, type KeyboardEvent } from "react"

import { profile } from "@/data/profile"
import { addHeat } from "@/lib/game"
import { useMotionReduced } from "@/lib/prefs"
import { play } from "@/lib/sound"
import { cn } from "@/lib/utils"

// The Messages app: a contact form dressed as a chat thread. Used in the phone overlay and inline on
// /contact. Validation mirrors app/api/contact/route.ts so errors show instantly, without a round trip.

type Field = "name" | "email" | "message"
type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const FIELDS: Field[] = ["name", "email", "message"]

function check(field: Field, raw: string): string | undefined {
  const v = raw.trim()
  if (field === "name") {
    if (!v) return "Add your name."
    if (v.length > 120) return "Keep the name under 120 characters."
  }
  if (field === "email" && (!EMAIL_RE.test(v) || v.length > 254)) return "Use a valid email address, like name@example.com."
  if (field === "message") {
    if (v.length < 10) return "Write at least 10 characters."
    if (v.length > 5000) return "Keep the message under 5000 characters."
  }
  return undefined
}

function checkAll(values: Values): Errors {
  const errors: Errors = {}
  for (const f of FIELDS) {
    const e = check(f, values[f])
    if (e) errors[f] = e
  }
  return errors
}

function mailtoFor({ name, email, message }: Values) {
  const subject = `Hello from ${name.trim() || "your portfolio"}`
  const body = `${message.trim()}\n\n${name.trim()}${email.trim() ? `\n${email.trim()}` : ""}`
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

type Sent = { id: number; values: Values; status: "sending" | "delivered" | "unconfigured" | "failed" }

/**
 * A thread of sent messages. Kept outside React state so a send that finishes after the component
 * unmounted (the visitor switched apps or closed the phone) still lands in the thread.
 */
function createThread() {
  let list: Sent[] = []
  const listeners = new Set<() => void>()
  return {
    get: () => list,
    set: (fn: (l: Sent[]) => Sent[]) => {
      list = fn(list)
      listeners.forEach((l) => l())
    },
    subscribe: (l: () => void) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
  }
}

// The phone's Messages app keeps its thread and draft across app switches.
const phoneThread = createThread()
const EMPTY: Values = { name: "", email: "", message: "" }
let phoneDraft: Values = EMPTY
let seq = 1

const GREETING = "Hey, it's Seyf. Got a mission for me?"

export function Messages({ variant = "phone", className }: { variant?: "phone" | "page"; className?: string }) {
  const uid = useId()
  const reduced = useMotionReduced()
  const [store] = useState(() => (variant === "phone" ? phoneThread : createThread()))
  const sent = useSyncExternalStore(store.subscribe, store.get, store.get)
  const setSent = store.set
  const [values, setValues] = useState<Values>(() => (variant === "phone" ? phoneDraft : EMPTY))
  const [company, setCompany] = useState("") // honeypot
  const [errors, setErrors] = useState<Errors>({})
  const thread = useRef<HTMLDivElement>(null)
  const form = useRef<HTMLFormElement>(null)
  const sending = sent.some((s) => s.status === "sending")
  const ids = { name: `${uid}-name`, email: `${uid}-email`, message: `${uid}-message`, hint: `${uid}-hint` }
  const errId = (f: Field) => `${uid}-${f}-error`
  const left = 5000 - values.message.trim().length
  const firstEmpty = FIELDS.find((f) => !values[f].trim()) ?? "message"

  useEffect(() => {
    if (variant === "phone") phoneDraft = values
  }, [variant, values])

  // Keep the newest bubble in view.
  useEffect(() => {
    const t = thread.current
    if (t) t.scrollTo({ top: t.scrollHeight, behavior: reduced ? "auto" : "smooth" })
  }, [sent, reduced])

  const update = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    // Once a field shows an error, re-check it as the visitor types so the error clears as soon as it's fixed.
    if (errors[field]) setErrors((e) => ({ ...e, [field]: check(field, value) }))
  }

  const blur = (field: Field) => {
    if (values[field].trim()) setErrors((e) => ({ ...e, [field]: check(field, values[field]) }))
  }

  const focusFirstInvalid = (errs: Errors) => {
    const f = FIELDS.find((k) => errs[k])
    if (f) document.getElementById(ids[f])?.focus()
  }

  async function deliver(id: number, payload: Values) {
    let status: Sent["status"] = "failed"
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: payload.name.trim(), email: payload.email.trim(), message: payload.message.trim(), company }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; configured?: boolean; errors?: Errors }
      if (res.ok && data.ok) status = "delivered"
      else if (res.status === 503) status = "unconfigured"
      else if (res.status === 422 && data.errors) {
        // The server disagreed with the client-side checks: put the text back and show its errors.
        setSent((list) => list.filter((s) => s.id !== id))
        setValues(payload)
        setErrors(data.errors)
        requestAnimationFrame(() => focusFirstInvalid(data.errors!))
        return
      }
    } catch {
      status = "failed"
    }
    setSent((list) => list.map((s) => (s.id === id ? { ...s, status } : s)))
    if (status === "delivered") {
      play("ding")
      addHeat("message")
    }
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (sending) return
    const errs = checkAll(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      focusFirstInvalid(errs)
      return
    }
    const id = seq++
    const payload = values
    setSent((list) => [...list, { id, values: payload, status: "sending" }])
    // Name and email stay filled in, so a second message is quick.
    setValues((v) => ({ ...v, message: "" }))
    play("tap")
    void deliver(id, payload)
  }

  const retry = (s: Sent) => {
    if (sending) return
    setSent((list) => list.map((x) => (x.id === s.id ? { ...x, status: "sending" } : x)))
    void deliver(s.id, s.values)
  }

  const onComposerKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      form.current?.requestSubmit()
    }
  }

  const bubbleMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.15 } }
    : { initial: { opacity: 0, y: 12, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as const } }

  const inputClass = (f: Field) =>
    cn(
      "w-full rounded-xl border bg-bg/70 px-3 text-base text-ink placeholder:text-muted/80 transition-colors focus-visible:outline-2 focus-visible:outline-offset-1",
      errors[f] ? "border-red" : "border-ink/15 hover:border-ink/30 focus-visible:border-pink"
    )

  const errorText = (f: Field) =>
    errors[f] ? (
      <p id={errId(f)} className="mt-1 flex items-start gap-1.5 text-sm leading-snug text-red">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
        {errors[f]}
      </p>
    ) : null

  return (
    <form ref={form} noValidate onSubmit={onSubmit} aria-label="Message Seyf" className={cn("flex min-h-0 flex-col", variant === "phone" && "flex-1", className)}>
      {/* The thread. role="log": new bubbles and status changes are announced politely. */}
      <div
        ref={thread}
        role="log"
        aria-label="Conversation with Seyf"
        className={cn(
          "flex flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-4",
          variant === "phone" ? "min-h-0 flex-1" : "max-h-[26rem] min-h-[12rem]"
        )}
      >
        <p className="font-mono text-[0.6875rem] text-muted lowercase self-center">Today</p>
        <Incoming>{GREETING}</Incoming>
        <AnimatePresence initial={false}>
          {sent.map((s) => (
            <m.div key={s.id} {...bubbleMotion} className="flex flex-col gap-3">
              <Outgoing status={s.status}>{s.values.message.trim()}</Outgoing>
              {s.status === "delivered" && <Incoming>Got it, thanks {s.values.name.trim().split(/\s+/)[0]}. I&apos;ll reply to {s.values.email.trim()}.</Incoming>}
              {s.status === "unconfigured" && (
                <Incoming>
                  Messages aren&apos;t connected yet, sorry. Your note is ready to go by email instead, to {profile.email}:
                  <MailLink href={mailtoFor(s.values)} />
                </Incoming>
              )}
              {s.status === "failed" && (
                <Incoming>
                  That one didn&apos;t go through. Try again in a moment, or send it by email to {profile.email}:
                  <span className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => retry(s)}
                      aria-disabled={sending}
                      className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-ink/20 px-3 text-sm font-semibold hover:border-pink hover:text-pink aria-disabled:opacity-60"
                    >
                      <RotateCcw aria-hidden="true" className="size-4" />
                      Try again
                    </button>
                    <MailLink href={mailtoFor(s.values)} inline />
                  </span>
                </Incoming>
              )}
            </m.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="border-t border-ink/10 bg-surface/80 px-3 pt-3 pb-3">
        {/* Who's writing: compact, above the composer. */}
        <div className="grid grid-cols-2 gap-2">
          <div className="min-w-0">
            <label htmlFor={ids.name} className="mb-1 block font-mono text-[0.6875rem] text-muted lowercase">
              Your name
            </label>
            <input
              id={ids.name}
              name="name"
              autoComplete="name"
              maxLength={160}
              value={values.name}
              onChange={(e) => update("name", e.target.value)}
              onBlur={() => blur("name")}
              readOnly={sending}
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? errId("name") : undefined}
              data-phone-field-focus={firstEmpty === "name" || undefined}
              className={cn(inputClass("name"), "h-11")}
            />
            {errorText("name")}
          </div>
          <div className="min-w-0">
            <label htmlFor={ids.email} className="mb-1 block font-mono text-[0.6875rem] text-muted lowercase">
              Your email
            </label>
            <input
              id={ids.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              maxLength={300}
              value={values.email}
              onChange={(e) => update("email", e.target.value)}
              onBlur={() => blur("email")}
              readOnly={sending}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? errId("email") : undefined}
              data-phone-field-focus={firstEmpty === "email" || undefined}
              className={cn(inputClass("email"), "h-11")}
            />
            {errorText("email")}
          </div>
        </div>

        {/* Honeypot: hidden from people and assistive tech; bots fill it in. */}
        <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-company`}>Company (leave this empty)</label>
          <input id={`${uid}-company`} name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>

        <div className="mt-3 flex items-end gap-2">
          <div className="min-w-0 flex-1">
            <label htmlFor={ids.message} className="sr-only">
              Your message
            </label>
            <textarea
              id={ids.message}
              name="message"
              rows={2}
              maxLength={5200}
              placeholder="Write a message…"
              value={values.message}
              onChange={(e) => update("message", e.target.value)}
              onBlur={() => blur("message")}
              onKeyDown={onComposerKey}
              readOnly={sending}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={cn(errors.message && errId("message"), ids.hint) || undefined}
              data-phone-field-focus={firstEmpty === "message" || undefined}
              className={cn(inputClass("message"), "block max-h-40 min-h-11 resize-none py-2.5 leading-snug [field-sizing:content]")}
            />
          </div>
          <button
            type="submit"
            aria-disabled={sending}
            className="bg-pink inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl px-4 text-[0.9375rem] font-semibold text-bg shadow-[0_6px_24px_-10px_rgb(0_0_0/0.8)] transition-shadow hover:shadow-[var(--glow)] aria-disabled:opacity-70"
          >
            {sending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Send aria-hidden="true" className="size-4" />}
            {sending ? "Sending" : "Send"}
          </button>
        </div>
        {errorText("message")}
        <p id={ids.hint} className="mt-2 text-[0.8125rem] leading-snug text-muted">
          <span className="hidden sm:inline">Ctrl + Enter sends. </span>Replies go to the email you enter.
          {left < 500 && <span className={left < 0 ? "text-red" : "text-pink"}> {left < 0 ? `${-left} characters over the limit.` : `${left} characters left.`}</span>}
        </p>
      </div>
    </form>
  )
}

function Incoming({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex max-w-[88%] items-end gap-2 self-start">
      <span aria-hidden="true" className="bg-pink flex size-7 shrink-0 items-center justify-center rounded-full font-display text-xs text-bg">
        S
      </span>
      <p className="min-w-0 rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2.5 text-[0.9375rem] leading-snug [overflow-wrap:anywhere] text-ink">
        <span className="sr-only">Seyf: </span>
        {children}
      </p>
    </div>
  )
}

const STATUS_TEXT: Record<Sent["status"], string> = {
  sending: "Sending…",
  delivered: "Delivered ✓",
  unconfigured: "Not sent",
  failed: "Not delivered",
}

function Outgoing({ children, status }: { children: React.ReactNode; status: Sent["status"] }) {
  return (
    <div className="flex max-w-[88%] flex-col items-end gap-1 self-end">
      <p className="rounded-2xl rounded-br-md bg-pink px-3.5 py-2.5 text-[0.9375rem] leading-snug [overflow-wrap:anywhere] whitespace-pre-wrap text-bg">
        <span className="sr-only">You: </span>
        {children}
      </p>
      <p className={cn("flex items-center gap-1 font-mono text-[0.6875rem] lowercase", status === "delivered" ? "text-pink" : status === "sending" ? "text-muted" : "text-red")}>
        {STATUS_TEXT[status]}
      </p>
    </div>
  )
}

function MailLink({ href, inline }: { href: string; inline?: boolean }) {
  return (
    <a
      href={href}
      className={cn(
        "min-h-10 items-center gap-1.5 rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-bg hover:bg-pink",
        inline ? "inline-flex" : "mt-2 flex w-fit"
      )}
    >
      <Mail aria-hidden="true" className="size-4" />
      Send by email
    </a>
  )
}
