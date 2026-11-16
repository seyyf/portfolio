"use client"

import { useId, useRef, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/Button"
import { profile } from "@/data/profile"
import { toast } from "@/lib/toast"
import { cn } from "@/lib/utils"

type Field = "name" | "email" | "message"
type Status = "idle" | "sending" | "sent" | "unconfigured" | "failed"

function check(d: Record<string, string>) {
  const e: Partial<Record<Field, string>> = {}
  const name = (d.name ?? "").trim()
  const email = (d.email ?? "").trim()
  const message = (d.message ?? "").trim()
  if (!name) e.name = "Add your name."
  else if (name.length > 120) e.name = "Keep the name under 120 characters."
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) e.email = "Use a valid email address, like name@example.com."
  if (message.length < 10) e.message = "Write at least 10 characters."
  else if (message.length > 5000) e.message = "Keep the message under 5000 characters."
  return e
}

const field =
  "mt-1.5 block w-full rounded-[var(--radius-control)] border border-border bg-bg px-3.5 py-2.5 text-[1.0625rem] text-ink transition-colors placeholder:text-muted/80 hover:border-ink/30 focus:border-accent focus:outline-none focus-visible:outline-2 focus-visible:outline-accent aria-[invalid=true]:border-tag-security"

/**
 * Name, email, message → POST /api/contact (Formspree behind it, see README). Success shows the
 * "✓ Message delivered" toast. If sending isn't configured or fails, it offers a prefilled email.
 */
export function ContactForm() {
  const id = useId()
  const form = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [draft, setDraft] = useState({ name: "", message: "" })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (status === "sending") return
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    setDraft({ name: data.name ?? "", message: data.message ?? "" })

    // Same rules as the server (which checks again), so mistakes show instantly.
    const local = check(data)
    if (Object.keys(local).length) {
      setErrors(local)
      const first = (["name", "email", "message"] as const).find((k) => local[k])
      if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
      return
    }

    setStatus("sending")
    setErrors({})
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, subject: `Portfolio: message from ${data.name}` }),
      })
      if (res.ok) {
        setStatus("sent")
        form.current?.reset()
        toast("✓ Message delivered")
        return
      }
      if (res.status === 422) {
        const body = (await res.json().catch(() => ({}))) as { errors?: Partial<Record<Field, string>> }
        setErrors(body.errors ?? {})
        setStatus("idle")
        const first = (["name", "email", "message"] as const).find((k) => body.errors?.[k])
        if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus()
        return
      }
      setStatus(res.status === 503 ? "unconfigured" : "failed")
    } catch {
      setStatus("failed")
    }
  }

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(`Portfolio: message from ${draft.name || "a visitor"}`)}&body=${encodeURIComponent(draft.message)}`
  const describe = (k: Field) => (errors[k] ? `${id}-${k}-error` : undefined)

  return (
    <form ref={form} onSubmit={onSubmit} noValidate aria-labelledby={`${id}-title`} className="rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:p-7">
      <h3 id={`${id}-title`} className="text-xl font-semibold">
        Send a message
      </h3>

      <div className="mt-5 grid gap-4">
        {(
          [
            { k: "name", label: "Name", type: "text", auto: "name" },
            { k: "email", label: "Email", type: "email", auto: "email" },
          ] as const
        ).map(({ k, label, type, auto }) => (
          <div key={k}>
            <label htmlFor={`${id}-${k}`} className="text-sm font-medium">
              {label}
            </label>
            <input id={`${id}-${k}`} name={k} type={type} autoComplete={auto} required className={field} aria-invalid={!!errors[k]} aria-describedby={describe(k)} />
            {errors[k] && (
              <p id={`${id}-${k}-error`} className="mt-1.5 text-sm text-tag-security">
                {errors[k]}
              </p>
            )}
          </div>
        ))}

        <div>
          <label htmlFor={`${id}-message`} className="text-sm font-medium">
            Message
          </label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={5}
            required
            className={cn(field, "resize-y")}
            aria-invalid={!!errors.message}
            aria-describedby={describe("message")}
          />
          {errors.message && (
            <p id={`${id}-message-error`} className="mt-1.5 text-sm text-tag-security">
              {errors.message}
            </p>
          )}
        </div>

        {/* Honeypot: hidden from people and assistive tech; bots fill it and are silently ignored. */}
        <div aria-hidden="true" className="sr-only">
          <label htmlFor={`${id}-company`}>Company</label>
          <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Send message"}
        </Button>
        <div aria-live="polite" className="text-sm text-muted">
          {status === "sent" && <p>Thanks. I&apos;ll reply by email.</p>}
          {(status === "unconfigured" || status === "failed") && (
            <p>
              {status === "unconfigured" ? "The form isn't connected yet." : "The message couldn't be sent."}{" "}
              <a href={mailto} className="text-accent underline underline-offset-4">
                Send it from your email app
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </form>
  )
}
