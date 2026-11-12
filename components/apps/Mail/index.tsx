"use client"

import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowUpRight, AtSign, BriefcaseBusiness, Check, Mail } from "lucide-react"
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react"

import { AppScreen } from "@/components/shared/AppScreen"
import { profile } from "@/data/profile"
import { fade, springs } from "@/lib/animations"
import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"
import { cn } from "@/lib/utils"

type Field = "name" | "email" | "subject" | "message"
type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>
type Status = { kind: "idle" | "sending" | "sent" } | { kind: "failed"; reason: "unconfigured" | "error" }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_MESSAGE = 5000
const empty: Values = { name: "", email: "", subject: "", message: "" }

function validate(v: Values): Errors {
  const errors: Errors = {}
  if (!v.name.trim()) errors.name = "Add your name so I know who I'm replying to."
  if (!v.email.trim()) errors.email = "Add your email so I can write back."
  else if (!EMAIL_RE.test(v.email.trim())) errors.email = "Check the email address. It should look like name@example.com."
  if (v.subject.trim().length > 200) errors.subject = "Shorten the subject to 200 characters or fewer."
  const len = v.message.trim().length
  if (len < 10) errors.message = len === 0 ? "Write a message, at least 10 characters." : `Write a little more: ${10 - len} more ${10 - len === 1 ? "character" : "characters"} to go.`
  else if (len > MAX_MESSAGE) errors.message = `Shorten the message by ${len - MAX_MESSAGE} characters (5000 max).`
  return errors
}

function mailtoHref(v: Values) {
  const subject = v.subject.trim() || `Hello from ${v.name.trim() || "your portfolio"}`
  const body = [v.message.trim(), "", v.name.trim(), v.email.trim()].filter((l, i) => i < 2 || l).join("\n")
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

/** Mail: a compose screen that posts to /api/contact, with a mailto: fallback. */
export default function MailApp() {
  const prefersReduced = useReducedMotion()
  const storeReduced = useOS((s) => s.reducedMotion)
  const reduce = Boolean(prefersReduced || storeReduced)

  const id = useId()
  const [values, setValues] = useState<Values>(empty)
  const [company, setCompany] = useState("")
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [sentTo, setSentTo] = useState({ name: "", email: "" })

  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const subjectRef = useRef<HTMLInputElement>(null)
  const messageRef = useRef<HTMLTextAreaElement>(null)
  const envelopeRef = useRef<HTMLSpanElement>(null)
  const sentHeadingRef = useRef<HTMLHeadingElement>(null)

  const errors = { ...validate(values), ...serverErrors }
  const show = (f: Field) => ((submitted || touched[f]) && errors[f]) || null

  const onChange = (f: Field) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [f]: e.target.value }))
    if (serverErrors[f]) setServerErrors((s) => ({ ...s, [f]: undefined }))
    if (status.kind === "failed") setStatus({ kind: "idle" })
  }
  const onBlur = (f: Field) => () => setTouched((t) => ({ ...t, [f]: true }))

  useEffect(() => {
    if (status.kind === "sent") sentHeadingRef.current?.focus()
  }, [status.kind])

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status.kind === "sending") return
    setSubmitted(true)
    const local = validate(values)
    const first = (["name", "email", "subject", "message"] as const).find((f) => local[f])
    if (first) {
      const target = { name: nameRef, email: emailRef, subject: subjectRef, message: messageRef }[first]
      target.current?.focus()
      return
    }

    setStatus({ kind: "sending" })
    let result: Status
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; configured?: boolean; errors?: Errors }
      if (res.ok && data.ok) result = { kind: "sent" }
      else if (res.status === 422 && data.errors) {
        setServerErrors(data.errors)
        setStatus({ kind: "idle" })
        return
      } else result = { kind: "failed", reason: data.configured === false ? "unconfigured" : "error" }
    } catch {
      result = { kind: "failed", reason: "error" }
    }

    if (result.kind !== "sent") {
      setStatus(result)
      return
    }

    playSfx("ping")
    const env = envelopeRef.current
    if (env && !reduce) {
      // The envelope lifts off, wobbles and flies up and away before the sent screen appears.
      await animate(
        env,
        {
          x: [0, -6, 30, 240],
          y: [0, 8, -70, -460],
          rotate: [0, -12, 6, 28],
          scale: [1, 1.2, 1.05, 0.6],
          opacity: [1, 1, 1, 0],
        },
        { duration: 0.85, times: [0, 0.18, 0.5, 1], ease: [0.45, 0, 0.2, 1] }
      )
    }
    useOS.getState().showActivity({ id: "mail", icon: "✉️", label: "Message sent", tone: "success" }, 2400)
    setSentTo({ name: values.name.trim(), email: values.email.trim() })
    setStatus({ kind: "sent" })
  }

  const reset = () => {
    setValues(empty)
    setTouched({})
    setSubmitted(false)
    setServerErrors({})
    setStatus({ kind: "idle" })
  }

  const sending = status.kind === "sending"
  const messageLength = values.message.trim().length

  return (
    <AppScreen title="Mail" subtitle={status.kind === "sent" ? "Sent" : "New message"}>
      <div className="px-4 pb-6">
        <AnimatePresence mode="wait" initial={false}>
          {status.kind === "sent" ? (
            <motion.div
              key="sent"
              role="status"
              className="card flex flex-col items-center px-5 py-8 text-center"
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reduce ? fade : springs.bouncy}
            >
              <motion.span
                aria-hidden="true"
                className="grid size-18 place-items-center rounded-full bg-mint text-ink"
                initial={reduce ? false : { scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={reduce ? fade : { ...springs.bouncy, delay: 0.12 }}
              >
                <Check size={38} strokeWidth={2.6} />
              </motion.span>
              <h2 ref={sentHeadingRef} tabIndex={-1} className="mt-4 font-display text-2xl font-semibold outline-none">
                Sent ✅
              </h2>
              <p className="mt-1.5 text-[0.9375rem] text-text-soft">
                Thanks{sentTo.name ? `, ${sentTo.name.split(/\s+/)[0]}` : ""}. I&apos;ll reply to{" "}
                <span className="font-semibold break-all text-text">{sentTo.email}</span> soon.
              </p>
              <button type="button" onClick={reset} className="btn btn-soft mt-5">
                Write another message
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="compose"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reduce ? fade : springs.smooth}
            >
              <form id={`${id}-form`} noValidate onSubmit={onSubmit} aria-busy={sending} className="card relative overflow-hidden">
                <div className="flex min-h-12 items-center gap-3 px-4 py-2">
                  <span className="w-16 shrink-0 text-sm text-text-soft">To</span>
                  <span className="chip max-w-full min-w-0 truncate bg-sky/50 text-ink">
                    {profile.name} &lt;{profile.email}&gt;
                  </span>
                </div>

                <InlineField id={`${id}-name`} label="Name" error={show("name")} reduce={reduce}>
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
                    placeholder="Your name"
                    className={inputClass}
                  />
                </InlineField>

                <InlineField id={`${id}-email`} label="Email" error={show("email")} reduce={reduce}>
                  <input
                    ref={emailRef}
                    id={`${id}-email`}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="off"
                    spellCheck={false}
                    required
                    value={values.email}
                    onChange={onChange("email")}
                    onBlur={onBlur("email")}
                    aria-invalid={Boolean(show("email"))}
                    aria-describedby={show("email") ? `${id}-email-error` : undefined}
                    placeholder="name@example.com"
                    className={inputClass}
                  />
                </InlineField>

                <InlineField id={`${id}-subject`} label="Subject" error={show("subject")} reduce={reduce}>
                  <input
                    ref={subjectRef}
                    id={`${id}-subject`}
                    name="subject"
                    value={values.subject}
                    onChange={onChange("subject")}
                    onBlur={onBlur("subject")}
                    aria-invalid={Boolean(show("subject"))}
                    aria-describedby={show("subject") ? `${id}-subject-error` : undefined}
                    placeholder="Optional"
                    className={inputClass}
                  />
                </InlineField>

                <div className="border-t border-line px-4 pt-3 pb-3 transition-[background-color,box-shadow] focus-within:bg-surface-2/60 focus-within:shadow-[inset_3px_0_0_var(--color-mint)]">
                  <label htmlFor={`${id}-message`} className="text-sm text-text-soft">
                    Message
                  </label>
                  <textarea
                    ref={messageRef}
                    id={`${id}-message`}
                    name="message"
                    required
                    rows={7}
                    value={values.message}
                    onChange={onChange("message")}
                    onBlur={onBlur("message")}
                    aria-invalid={Boolean(show("message"))}
                    aria-describedby={cn(`${id}-message-count`, show("message") && `${id}-message-error`)}
                    placeholder="Hi Seyf, I'd love to talk about…"
                    className="mt-1 block w-full resize-none bg-transparent text-base leading-relaxed text-text outline-none placeholder:text-text-soft/60"
                  />
                  <div className="mt-1 flex items-start justify-between gap-3">
                    <FieldError id={`${id}-message-error`} message={show("message")} reduce={reduce} />
                    <span
                      id={`${id}-message-count`}
                      className={cn("ml-auto shrink-0 text-xs tabular-nums", messageLength > MAX_MESSAGE ? "font-semibold text-coral" : "text-text-soft")}
                    >
                      {messageLength} / {MAX_MESSAGE}
                    </span>
                  </div>
                </div>

                {/* Honeypot: hidden from people, tempting for bots. */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <label>
                    Company
                    <input name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
                  </label>
                </div>
              </form>

              <AnimatePresence initial={false}>
                {status.kind === "failed" && (
                  <motion.div
                    key="failed"
                    role="alert"
                    className="mt-3 rounded-[20px] bg-butter/45 p-4 text-[0.9375rem] text-text"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? fade : springs.snappy}
                  >
                    <p className="font-semibold">
                      {status.reason === "unconfigured" ? "Sending from here isn't set up yet." : "That didn't go through."}
                    </p>
                    <p className="mt-1 text-text-soft">
                      {status.reason === "unconfigured"
                        ? "Your message is still here. Send it from your email app instead, it's already filled in."
                        : "Check your connection and try again, or send it from your email app. It's already filled in."}
                    </p>
                    <a href={mailtoHref(values)} className="btn btn-accent mt-3 w-full">
                      <Mail size={18} aria-hidden="true" />
                      Open in my email app
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                form={`${id}-form`}
                disabled={sending}
                className="btn relative mt-4 w-full overflow-visible disabled:opacity-80"
              >
                <span ref={envelopeRef} className="relative z-20 inline-flex" aria-hidden="true">
                  <Mail size={19} />
                </span>
                {sending ? "Sending…" : "Send message"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <section aria-labelledby={`${id}-direct`} className="mt-7">
          <h2 id={`${id}-direct`} className="mb-1.5 px-4 text-[0.8125rem] font-semibold text-text-soft">
            Or reach me directly
          </h2>
          <ul className="overflow-hidden rounded-[22px] bg-surface shadow-[0_1px_2px_rgba(31,34,51,0.05)]">
            <DirectLink href={`mailto:${profile.email}`} icon={<AtSign size={17} strokeWidth={2.2} />} tint="bg-butter" label="Email" detail={profile.email} first />
            <DirectLink
              href={profile.linkedin}
              external
              icon={<BriefcaseBusiness size={17} strokeWidth={2.2} />}
              tint="bg-sky"
              label="LinkedIn"
              detail={profile.linkedinLabel}
            />
          </ul>
        </section>
      </div>
    </AppScreen>
  )
}

const inputClass = "min-h-11 w-full min-w-0 bg-transparent text-base text-text outline-none placeholder:text-text-soft/60"

function InlineField({ id, label, error, reduce, children }: { id: string; label: string; error: string | null; reduce: boolean; children: ReactNode }) {
  return (
    <div className="border-t border-line px-4 py-1 transition-[background-color,box-shadow] focus-within:bg-surface-2/60 focus-within:shadow-[inset_3px_0_0_var(--color-mint)]">
      <div className="flex items-center gap-3">
        <label htmlFor={id} className="w-16 shrink-0 text-sm text-text-soft">
          {label}
        </label>
        {children}
      </div>
      <div className="pb-1 pl-19">
        <FieldError id={`${id}-error`} message={error} reduce={reduce} />
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
          className="text-[0.8125rem] leading-snug font-semibold text-[#c2410c] [:root[data-theme='dark']_&]:text-coral"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
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

function DirectLink({
  href,
  icon,
  tint,
  label,
  detail,
  external,
  first,
}: {
  href: string
  icon: ReactNode
  tint: string
  label: string
  detail: string
  external?: boolean
  first?: boolean
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="flex min-h-14 items-stretch gap-3 pl-3.5 transition-colors active:bg-surface-2"
      >
        <span aria-hidden="true" className={cn("my-auto grid size-7.5 shrink-0 place-items-center rounded-[9px] text-ink", tint)}>
          {icon}
        </span>
        <span className={cn("flex min-w-0 flex-1 items-center gap-2 py-2.5 pr-4", !first && "border-t border-line")}>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.96875rem] font-medium">{label}</span>
            <span className="block truncate text-[0.8125rem] text-text-soft">{detail}</span>
          </span>
          <ArrowUpRight size={18} className="shrink-0 text-text-soft" aria-hidden="true" />
          {external && <span className="sr-only">(opens in a new tab)</span>}
        </span>
      </a>
    </li>
  )
}
