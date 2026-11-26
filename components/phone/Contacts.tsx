"use client"

import { Check, Copy, Download, ExternalLink, FileText, Mail } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { profile } from "@/data/profile"
import { play } from "@/lib/sound"
import { closePhone } from "@/lib/ui"
import { cn } from "@/lib/utils"

// The Contacts app: copy the email, open LinkedIn, download the CV. Also used on /contact.

type CopyState = "idle" | "copied" | "failed"

export function Contacts({ className }: { className?: string }) {
  const [copy, setCopy] = useState<CopyState>("idle")
  const address = useRef<HTMLSpanElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copyEmail = async () => {
    clearTimeout(timer.current)
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopy("copied")
      play("tap")
      timer.current = setTimeout(() => setCopy("idle"), 2400)
    } catch {
      // No clipboard access (insecure context, denied permission): select the address so it can be copied by hand.
      setCopy("failed")
      const el = address.current
      const sel = window.getSelection()
      if (el && sel) {
        const range = document.createRange()
        range.selectNodeContents(el)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }

  return (
    <div className={className}>
      <ul className="grid grid-cols-[minmax(0,1fr)] gap-2.5">
        <li className="rounded-2xl border border-ink/10 bg-surface p-1.5">
          <button type="button" onClick={copyEmail} className={rowClass}>
            <Tile className="bg-pink text-bg">
              <Mail />
            </Tile>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Email</span>
              <span ref={address} className="block truncate font-mono text-[0.8125rem] text-muted select-all">
                {profile.email}
              </span>
            </span>
            <span className={cn("inline-flex shrink-0 items-center gap-1 font-mono text-xs lowercase", copy === "copied" ? "text-pink" : "text-ink/80")}>
              {copy === "copied" ? <Check aria-hidden="true" className="size-4" /> : <Copy aria-hidden="true" className="size-4" />}
              {copy === "copied" ? "Copied ✓" : "Copy"}
            </span>
          </button>
          <p role="status" className={cn("px-3 text-sm", copy === "failed" ? "pt-1 pb-2 text-pink" : "sr-only")}>
            {copy === "copied" ? "Email address copied." : copy === "failed" ? `Couldn't copy automatically. The address is selected: ${profile.email}` : ""}
          </p>
          <a href={`mailto:${profile.email}`} className="ml-14 inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm text-ink/85 underline decoration-ink/30 underline-offset-4 hover:text-pink hover:decoration-pink">
            Open in your mail app
          </a>
        </li>

        <li className="rounded-2xl border border-ink/10 bg-surface p-1.5">
          <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className={rowClass}>
            <Tile className="bg-sbs text-ink">
              <span className="font-sans text-base font-bold tracking-tight">in</span>
            </Tile>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">LinkedIn</span>
              <span className="block truncate font-mono text-[0.8125rem] text-muted">{profile.linkedinLabel}</span>
            </span>
            <ExternalLink aria-hidden="true" className="size-4 shrink-0 text-ink/80" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>

        <li className="rounded-2xl border border-ink/10 bg-surface p-1.5">
          <a href={profile.cvPdf} download className={rowClass}>
            <Tile className="bg-pink text-bg">
              <Download />
            </Tile>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">Download CV</span>
              <span className="block font-mono text-[0.8125rem] text-muted">PDF · one page</span>
            </span>
          </a>
          <Link
            href="/cv"
            onClick={() => closePhone()}
            className="ml-14 inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm text-ink/85 underline decoration-ink/30 underline-offset-4 hover:text-pink hover:decoration-pink"
          >
            <FileText aria-hidden="true" className="size-3.5" />
            Read it online
          </Link>
        </li>
      </ul>
    </div>
  )
}

const rowClass =
  "group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left text-ink transition-colors hover:bg-surface-2 focus-visible:bg-surface-2"

function Tile({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl [&>svg]:size-5", className)}>
      {children}
    </span>
  )
}
