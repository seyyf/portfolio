"use client"

import { useEffect, useRef, useState } from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

type Status = "idle" | "copied" | "error"

export function CopyEmail({ email, className }: { email: string; className?: string }) {
  const [status, setStatus] = useState<Status>("idle")
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(email)
      setStatus("copied")
    } catch {
      setStatus("error")
    }
    timer.current = setTimeout(() => setStatus("idle"), 2500)
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <a
        href={`mailto:${email}`}
        className="font-mono text-code text-ink underline decoration-hairline-strong underline-offset-4 transition-colors hover:decoration-ink"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy email address"
        className="relative inline-flex size-8 items-center justify-center rounded-full bg-canvas text-ink shadow-level-1 transition-colors after:absolute after:-inset-1.5 hover:bg-canvas-soft-2 active:scale-[0.96] motion-reduce:active:scale-100"
      >
        {status === "copied" ? (
          <CheckIcon aria-hidden className="size-4" />
        ) : (
          <CopyIcon aria-hidden className="size-4" />
        )}
      </button>
      <span aria-live="polite" className="text-body-sm text-body">
        {status === "copied" && "Copied"}
        {status === "error" && "Couldn’t copy. Select the address instead."}
      </span>
    </div>
  )
}
