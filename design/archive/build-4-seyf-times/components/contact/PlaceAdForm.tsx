"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent } from "react"

import { Stamp } from "@/components/contact/Stamp"
import { paper, profile } from "@/data/profile"
import { cn } from "@/lib/utils"

type Field = "name" | "email" | "message"
type Values = Record<Field, string>
type Errors = Partial<Record<Field, string>>
type Status = "idle" | "sending" | "sent" | "unconfigured" | "failed"

const FIELDS: Field[] = ["name", "email", "message"]
const EMPTY: Values = { name: "", email: "", message: "" }
// Same rules as app/api/contact/route.ts, so most mistakes are caught before sending.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function check(field: Field, raw: string): string | undefined {
  const v = raw.trim()
  if (field === "name") {
    if (!v) return "Add your name, so Seyf knows who placed the ad."
    if (v.length > 120) return "Shorten your name to 120 characters or fewer."
  }
  if (field === "email") {
    if (!v) return "Add your email address, so Seyf can reply."
    if (!EMAIL_RE.test(v) || v.length > 254) return "Check the email address: it should look like name@example.com."
  }
  if (field === "message") {
    if (v.length < 10) return `Write a few more words: at least 10 characters (${v.length} so far).`
    if (v.length > 5000) return `Trim the message to 5000 characters or fewer (${v.length} now).`
  }
  return undefined
}

function validate(values: Values): Errors {
  const errors: Errors = {}
  for (const f of FIELDS) {
    const e = check(f, values[f])
    if (e) errors[f] = e
  }
  return errors
}

function mailtoHref(values: Values) {
  const subject = values.name.trim() ? `Reply to your classified, from ${values.name.trim()}` : "Reply to your classified"
  const signature = [values.name.trim(), values.email.trim()].filter(Boolean).join(" · ")
  const body = `${values.message.trim()}${signature ? `\n\n${signature}` : ""}`
  return `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

const stampDate = new Intl.DateTimeFormat("en-GB", { timeZone: profile.timeZone, day: "numeric", month: "short", year: "numeric" })

/**
 * "Place your ad": the contact form, posting JSON to /api/contact. Success stamps RECEIVED on the
 * form; if the form isn't configured (503) or sending fails, it offers a prefilled mailto: link.
 */
export function PlaceAdForm({ className }: { className?: string }) {
  const id = useId()
  const reduce = useReducedMotion()
  const [values, setValues] = useState<Values>(EMPTY)
  const [company, setCompany] = useState("")
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>("idle")
  const [receivedOn, setReceivedOn] = useState("")

  const inputs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({})
  const statusRef = useRef<HTMLDivElement>(null)

  // Move focus to the outcome so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (status === "sent" || status === "unconfigured" || status === "failed") statusRef.current?.focus()
  }, [status])

  const fieldId = (f: Field) => `${id}-${f}`
  const errorId = (f: Field) => `${id}-${f}-error`

  const onChange = (field: Field) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value
    setValues((v) => ({ ...v, [field]: value }))
    // Once a field shows an error, re-check it as the visitor fixes it.
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: check(field, value) }))
    if (status === "failed" || status === "unconfigured") setStatus("idle")
  }

  const focusFirst = (errs: Errors) => {
    const first = FIELDS.find((f) => errs[f])
    if (first) inputs.current[first]?.focus()
  }

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === "sending") return
    const errs = validate(values)
    setErrors(errs)
    if (Object.keys(errs).length > 0) {
      focusFirst(errs)
      return
    }

    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, subject: "Classified ad from the portfolio", company }),
      })
      if (res.ok) {
        setReceivedOn(stampDate.format(new Date()).toUpperCase())
        setStatus("sent")
        return
      }
      if (res.status === 422) {
        const data = (await res.json().catch(() => null)) as { errors?: Record<string, string> } | null
        const serverErrors: Errors = {}
        for (const f of FIELDS) if (data?.errors?.[f]) serverErrors[f] = data.errors[f]
        if (Object.keys(serverErrors).length > 0) {
          setErrors(serverErrors)
          setStatus("idle")
          focusFirst(serverErrors)
          return
        }
      }
      setStatus(res.status === 503 ? "unconfigured" : "failed")
    } catch {
      setStatus("failed")
    }
  }

  const reset = () => {
    setValues(EMPTY)
    setErrors({})
    setStatus("idle")
    setReceivedOn("")
    // Wait for the fields to be enabled again before focusing.
    requestAnimationFrame(() => inputs.current.name?.focus())
  }

  const sent = status === "sent"
  const sending = status === "sending"
  const errorCount = Object.values(errors).filter(Boolean).length

  const fieldClass = (f: Field) =>
    cn(
      "mt-1.5 block w-full border-0 border-b-2 bg-transparent px-0 py-2 font-body text-[1.0625rem] leading-relaxed text-ink outline-none placeholder:text-gray/70 focus-visible:border-accent focus-visible:outline-none disabled:opacity-60",
      errors[f] ? "border-accent" : "border-ink"
    )

  return (
    <div className={cn("relative", className)}>
      <form
        noValidate
        onSubmit={onSubmit}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-intro`}
        className="border-[3px] border-double border-ink bg-paper p-5 sm:p-8"
      >
        <h2 id={`${id}-title`} className="text-center font-headline text-[1.9rem] leading-tight font-black uppercase sm:text-[2.2rem]">
          Place your ad
        </h2>
        <p id={`${id}-intro`} className="mt-1 text-center text-[1.0625rem] text-gray">
          Free of charge. Goes straight to {profile.firstName}&apos;s inbox. All fields are required.
        </p>
        <div className="rule-double mt-4" aria-hidden="true" />

        {errorCount > 1 ? (
          <p className="mt-4 font-sans text-[0.95rem] font-semibold text-accent-ink" role="alert">
            {errorCount} fields need a fix before the ad can run.
          </p>
        ) : null}

        <fieldset disabled={sent} className="mt-5 grid gap-6 sm:grid-cols-2">
          <legend className="sr-only">Your details and message</legend>

          {(["name", "email"] as const).map((f) => (
            <div key={f}>
              <label htmlFor={fieldId(f)} className="label">
                {f === "name" ? "Your name" : "Your email"}
              </label>
              <input
                ref={(el) => {
                  inputs.current[f] = el
                }}
                id={fieldId(f)}
                name={f}
                type={f === "email" ? "email" : "text"}
                autoComplete={f === "email" ? "email" : "name"}
                inputMode={f === "email" ? "email" : undefined}
                spellCheck={f === "email" ? false : undefined}
                required
                maxLength={f === "email" ? 254 : 120}
                value={values[f]}
                onChange={onChange(f)}
                aria-invalid={errors[f] ? true : undefined}
                aria-describedby={errors[f] ? errorId(f) : undefined}
                className={fieldClass(f)}
              />
              {errors[f] ? (
                <p id={errorId(f)} className="mt-1.5 font-sans text-[0.9rem] text-accent-ink">
                  {errors[f]}
                </p>
              ) : null}
            </div>
          ))}

          <div className="sm:col-span-2">
            <label htmlFor={fieldId("message")} className="label">
              Your ad
            </label>
            <textarea
              ref={(el) => {
                inputs.current.message = el
              }}
              id={fieldId("message")}
              name="message"
              required
              rows={6}
              maxLength={5000}
              value={values.message}
              onChange={onChange("message")}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={`${errors.message ? `${errorId("message")} ` : ""}${id}-message-hint`}
              className={cn(fieldClass("message"), "resize-y")}
            />
            {errors.message ? (
              <p id={errorId("message")} className="mt-1.5 font-sans text-[0.9rem] text-accent-ink">
                {errors.message}
              </p>
            ) : null}
            <p id={`${id}-message-hint`} className="mt-1.5 font-sans text-[0.85rem] text-gray">
              What you&apos;re looking for, in 10 to 5000 characters.
            </p>
          </div>

          {/* Honeypot: hidden from people and assistive tech; bots fill it and get silently ignored. */}
          <div aria-hidden="true" className="sr-only">
            <label htmlFor={`${id}-company`}>Company (leave empty)</label>
            <input id={`${id}-company`} type="text" name="company" tabIndex={-1} autoComplete="off" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button type="submit" className="btn-ink disabled:cursor-not-allowed disabled:opacity-70" aria-busy={sending || undefined}>
              {sending ? "Sending…" : "Send the ad"}
            </button>
            <a href={mailtoHref(values)} className="font-sans text-[0.95rem] underline decoration-1 underline-offset-4 hover:text-accent-ink">
              Or email {profile.email}
            </a>
          </div>
        </fieldset>
      </form>

      {/* Outcome: announced politely, focused for keyboard users. */}
      <div ref={statusRef} tabIndex={-1} role="status" aria-live="polite" className="mt-5 outline-none focus-visible:outline-2">
        {sent ? (
          <div className="border-l-4 border-accent pl-4">
            <p className="text-[1.0625rem]">
              <strong>Your ad has been received.</strong> {profile.firstName} will reply to {values.email.trim()}.
            </p>
            <button type="button" onClick={reset} className="btn-ink btn-outline mt-3">
              Place another ad
            </button>
          </div>
        ) : status === "unconfigured" || status === "failed" ? (
          <div className="border-l-4 border-ink pl-4">
            <p className="text-[1.0625rem]">
              {status === "unconfigured"
                ? "The classifieds desk isn't taking ads online just yet. Your words are still here: send them by email instead."
                : "The ad didn't go through, perhaps a connection hiccup. Try sending again, or send it by email."}
            </p>
            <a href={mailtoHref(values)} className="btn-ink mt-3">
              Email the ad to {profile.firstName}
            </a>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {sent ? (
          <motion.div
            key="stamp"
            className="pointer-events-none absolute inset-x-0 top-[18%] flex justify-center"
            exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, transition: { duration: 0.25 } }}
          >
            <Stamp subline={`${paper.name.toUpperCase()} · ${receivedOn}`} className="w-[min(82%,340px)]" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
