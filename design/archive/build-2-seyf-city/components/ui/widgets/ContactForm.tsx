"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useId, useRef, useState, type FormEvent } from "react"

import { profile } from "@/data/city"
import { useCity } from "@/lib/store"
import { playSfx } from "@/lib/sound"

type Field = "name" | "email" | "message"
type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function validate(v: Values): Errors {
  const errors: Errors = {}
  if (!v.name.trim()) errors.name = "Add your name so I know who to reply to."
  if (!v.email.trim()) errors.email = "Add your email so I can write back."
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Check the email address. It should look like name@example.com."
  if (v.message.trim().length < 10) errors.message = "Write a little more, at least 10 characters."
  return errors
}

/*
 * There is no backend: submitting builds a mailto: link and opens the visitor's email app.
 * To send messages from the site instead, swap `openMailto` for a POST to a route handler, e.g.
 * app/api/contact/route.ts that calls Resend (resend.emails.send) or forwards to Formspree,
 * then keep the same success state below.
 */
function openMailto({ name, email, message }: Values) {
  const subject = `Hello from Seyf City, from ${name.trim()}`
  const body = `${message.trim()}\n\n${name.trim()}\n${email.trim()}`
  window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** My House mailbox: a contact form that opens the visitor's email app. */
export function ContactForm() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useCity((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const id = useId()
  const [values, setValues] = useState<Values>({ name: "", email: "", message: "" })
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [sent, setSent] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)

  const errors = validate(values)
  const show = (f: Field) => (submitted || touched[f]) && errors[f]

  const onChange = (f: Field) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [f]: e.target.value }))
  const onBlur = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }))

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    const first = (["name", "email", "message"] as const).find((f) => errors[f])
    if (first) {
      const target = { name: nameRef, email: emailRef, message: messageRef }[first]
      target.current?.focus()
      return
    }
    openMailto(values)
    useCity.getState().setMailSent()
    playSfx("ding")
    setSent(true)
  }

  const reset = () => {
    setValues({ name: "", email: "", message: "" })
    setTouched({})
    setSubmitted(false)
    setSent(false)
  }

  const inputClass = (f: Field) =>
    `w-full rounded-2xl border-2 bg-surface px-4 py-3 text-base text-text placeholder:text-text-soft/60 transition-colors ${
      show(f) ? "border-coral" : "border-line/40 hover:border-line/70 focus:border-line"
    }`

  return (
    <div className="w-full">
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            className="card flex flex-col items-center p-5 text-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 340, damping: 22 }}
            role="status"
          >
            <Mailbox reduce={reduce} />
            <p className="mt-3 font-display text-lg font-semibold">Message ready</p>
            <p className="mt-1 text-sm text-text-soft">
              Your email app should open with the message ready to send. The flag is up!
            </p>
            <CopyEmail />
            <button type="button" className="btn btn-plain btn-sm mt-4" onClick={reset}>
              Write another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            noValidate
            onSubmit={onSubmit}
            className="flex flex-col gap-4"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <label htmlFor={`${id}-name`} className="mb-1.5 block font-display text-sm font-semibold">
                Your name
              </label>
              <input
                ref={nameRef}
                id={`${id}-name`}
                name="name"
                autoComplete="name"
                required
                value={values.name}
                onChange={onChange("name")}
                onBlur={onBlur("name")}
                aria-invalid={Boolean(show("name"))}
                aria-describedby={show("name") ? `${id}-name-error` : undefined}
                className={inputClass("name")}
                placeholder="Ada Lovelace"
              />
              <FieldError id={`${id}-name-error`} message={show("name") || null} reduce={reduce} />
            </div>

            <div>
              <label htmlFor={`${id}-email`} className="mb-1.5 block font-display text-sm font-semibold">
                Your email
              </label>
              <input
                ref={emailRef}
                id={`${id}-email`}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={values.email}
                onChange={onChange("email")}
                onBlur={onBlur("email")}
                aria-invalid={Boolean(show("email"))}
                aria-describedby={show("email") ? `${id}-email-error` : undefined}
                className={inputClass("email")}
                placeholder="you@example.com"
              />
              <FieldError id={`${id}-email-error`} message={show("email") || null} reduce={reduce} />
            </div>

            <div>
              <label htmlFor={`${id}-message`} className="mb-1.5 block font-display text-sm font-semibold">
                Message
              </label>
              <textarea
                ref={messageRef}
                id={`${id}-message`}
                name="message"
                required
                rows={4}
                value={values.message}
                onChange={onChange("message")}
                onBlur={onBlur("message")}
                aria-invalid={Boolean(show("message"))}
                aria-describedby={show("message") ? `${id}-message-error` : undefined}
                className={`${inputClass("message")} min-h-28 resize-y`}
                placeholder="Tell me about your project, team or idea."
              />
              <FieldError id={`${id}-message-error`} message={show("message") || null} reduce={reduce} />
            </div>

            <button type="submit" className="btn btn-coral self-start">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12l16-8-6 16-3-6.5z" />
              </svg>
              Send message
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="mt-6 border-t-2 border-dashed border-line/25 pt-4">
        <p className="mb-2 text-sm text-text-soft">Or reach me directly</p>
        <ul className="flex flex-wrap gap-2">
          <li>
            <a href={`mailto:${profile.email}`} className="btn btn-sky btn-sm">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" />
                <path d="M4 7l8 6 8-6" strokeLinecap="round" />
              </svg>
              Email
            </a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-lavender btn-sm" aria-label={`LinkedIn, ${profile.linkedinLabel} (opens in a new tab)`}>
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M5 3.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM3.3 9h3.4v11.5H3.3zM9 9h3.3v1.6c.5-.9 1.7-1.9 3.6-1.9 3.6 0 4.3 2.3 4.3 5.4v6.4h-3.4v-5.7c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.8H9z" />
              </svg>
              LinkedIn
            </a>
          </li>
          <li>
            <a href={profile.cv} download className="btn btn-mint btn-sm">
              <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" />
              </svg>
              Download CV
            </a>
          </li>
        </ul>
        <p className="mt-2 text-xs break-all text-text-soft">
          {profile.email} · {profile.linkedinLabel}
        </p>
      </div>
    </div>
  )
}

function FieldError({ id, message, reduce }: { id: string; message: string | null; reduce: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          key={message}
          id={id}
          className="mt-1.5 text-sm font-semibold text-[#c2410c] [:root[data-night='true']_&]:text-coral"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, x: 0 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, x: [0, -4, 4, -2, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}

function CopyEmail() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle")

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setState("copied")
    } catch {
      setState("failed")
    }
  }

  return (
    <div className="mt-4 w-full rounded-2xl border-2 border-dashed border-line/30 p-3 text-sm">
      <p className="text-text-soft">Nothing opened? Write to me at:</p>
      <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
        <span className="font-bold break-all select-all">{profile.email}</span>
        <button type="button" className="btn btn-sm" onClick={copy}>
          {state === "copied" ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {state === "copied" ? "Email address copied." : ""}
      </p>
      {state === "failed" && <p className="mt-1 text-xs text-text-soft">Copy didn&apos;t work here. Select the address and copy it by hand.</p>}
    </div>
  )
}

function Mailbox({ reduce }: { reduce: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 120 110" className="h-28 w-32 overflow-visible">
      {/* post */}
      <rect x="52" y="62" width="12" height="46" rx="3" fill="#c98f5a" stroke="#2b2d42" strokeWidth="3" />
      {/* box */}
      <path d="M18 66V40a22 22 0 0 1 22-22h40v48z" fill="#ff8b94" stroke="#2b2d42" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M80 18a20 20 0 0 1 20 20v28H60V38a20 20 0 0 1 20-20z" fill="#ffb3b9" stroke="#2b2d42" strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="66" y="44" width="28" height="5" rx="2.5" fill="#2b2d42" />
      {/* letter peeking out */}
      <motion.g initial={reduce ? false : { y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 14 }}>
        <rect x="68" y="30" width="24" height="16" rx="2" fill="#fffbf5" stroke="#2b2d42" strokeWidth="2.5" />
        <path d="M68.5 31l11.5 8 11.5-8" fill="none" stroke="#2b2d42" strokeWidth="2" />
      </motion.g>
      {/* flag pivots on the side of the box */}
      <motion.g
        style={{ originX: 0.115, originY: 0.95 }}
        initial={reduce ? false : { rotate: -90 }}
        animate={{ rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 9, delay: 0.25 }}
      >
        <rect x="21" y="16" width="6" height="42" rx="3" fill="#2b2d42" />
        <path d="M27 16h20l-5 7 5 7H27z" fill="#ffd97d" stroke="#2b2d42" strokeWidth="3" strokeLinejoin="round" />
      </motion.g>
      <circle cx="24" cy="56" r="3" fill="#fffbf5" stroke="#2b2d42" strokeWidth="2" />
    </svg>
  )
}
