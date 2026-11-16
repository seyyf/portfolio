"use client"

import { Command } from "cmdk"
import { ArrowUpRight, Copy, Download, FileText, FolderGit2, GraduationCap, Moon, Printer, Rocket, Search, Tag as TagIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type ReactNode } from "react"

import { profile } from "@/data/profile"
import { projects } from "@/data/projects"
import { releaseHref, releases, type Release } from "@/data/releases"
import { toast } from "@/lib/toast"

import { switchTheme } from "./ThemeToggle"

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

/**
 * ⌘K / Ctrl+K: jump to any release or project, download or print the CV, copy the email, open
 * LinkedIn, switch theme. cmdk inside a native modal <dialog>: arrow keys move, Enter runs, Esc
 * closes, focus returns to whatever opened it.
 */
export function CommandPalette({ open, onOpenChange }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const [query, setQuery] = useState("")

  useEffect(() => {
    const d = dialog.current
    if (!d) return
    if (open && !d.open) {
      d.showModal()
      // React's autoFocus doesn't set the attribute showModal() looks for, so focus the input here.
      d.querySelector<HTMLInputElement>("[cmdk-input]")?.focus()
    }
    if (!open && d.open) d.close()
  }, [open])

  const run = (action: () => void) => {
    onOpenChange(false)
    setQuery("")
    action()
  }

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      toast("✓ Email copied")
    } catch {
      toast(profile.email, 6000)
    }
  }

  const downloadCv = () => {
    const a = document.createElement("a")
    a.href = profile.cvPdf
    a.download = ""
    a.click()
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Command menu"
      onClose={() => {
        onOpenChange(false)
        setQuery("")
      }}
      // A click on the backdrop lands on the <dialog> element itself.
      onClick={(e) => e.target === e.currentTarget && onOpenChange(false)}
      className="sheet mx-auto mt-[10vh] w-[min(640px,calc(100vw-2rem))] max-w-none overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface p-0 text-ink shadow-[0_24px_64px_-24px_rgb(0_0_0/0.45)] backdrop:bg-black/40"
    >
      <Command label="Command menu" loop filter={filter} className="flex max-h-[min(72vh,560px)] flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search aria-hidden="true" className="size-4 shrink-0 text-muted" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder="Search releases, projects and actions"
            className="h-13 w-full bg-transparent py-3.5 text-base text-ink outline-none placeholder:text-muted"
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 font-mono text-[0.6875rem] text-muted sm:inline">Esc</kbd>
        </div>

        <Command.List className="overflow-y-auto overscroll-contain p-2">
          <Command.Empty className="px-3 py-8 text-center text-sm text-muted">Nothing matches “{query}”.</Command.Empty>

          <Command.Group heading="Releases">
            {releases.map((r) => (
              <Item key={r.version} value={`${r.version} ${labelFor(r)}`} keywords={keywordsFor(r)} icon={iconFor(r)} hint={r.version} onSelect={() => run(() => router.push(releaseHref(r)))}>
                {labelFor(r)}
              </Item>
            ))}
          </Command.Group>

          <Command.Group heading="Projects">
            {projects.map((p) => (
              <Item
                key={p.slug}
                value={`project ${p.name}`}
                keywords={[...p.tags, p.description]}
                icon={<FolderGit2 aria-hidden="true" className="size-4" />}
                hint={p.url ? "Live site" : "Project"}
                onSelect={() => run(() => (p.url ? window.open(p.url, "_blank", "noopener,noreferrer") : router.push(`/#project-${p.slug}`)))}
              >
                {p.name}
              </Item>
            ))}
          </Command.Group>

          <Command.Group heading="Actions">
            <Item value="Download CV" keywords={["resume", "pdf"]} icon={<Download aria-hidden="true" className="size-4" />} onSelect={() => run(downloadCv)}>
              Download CV
            </Item>
            <Item value="Copy email" keywords={["mail", "contact", profile.email]} icon={<Copy aria-hidden="true" className="size-4" />} hint={profile.email} onSelect={() => run(() => void copyEmail())}>
              Copy email
            </Item>
            <Item
              value="Open LinkedIn"
              keywords={["profile", "social"]}
              icon={<ArrowUpRight aria-hidden="true" className="size-4" />}
              onSelect={() => run(() => window.open(profile.linkedin, "_blank", "noopener,noreferrer"))}
            >
              Open LinkedIn
            </Item>
            <Item value="Toggle theme" keywords={["dark", "light", "mode"]} icon={<Moon aria-hidden="true" className="size-4" />} onSelect={() => run(() => switchTheme(setTheme, resolvedTheme))}>
              Toggle theme
            </Item>
            <Item value="Print CV" keywords={["resume", "pdf", "save"]} icon={<Printer aria-hidden="true" className="size-4" />} onSelect={() => run(() => router.push("/cv?print=1"))}>
              Print CV
            </Item>
            <Item value="View résumé" keywords={["cv", "resume"]} icon={<FileText aria-hidden="true" className="size-4" />} onSelect={() => run(() => router.push("/cv"))}>
              View one-page résumé
            </Item>
          </Command.Group>
        </Command.List>

        <div className="hidden items-center gap-4 border-t border-border px-4 py-2 font-mono text-[0.6875rem] text-muted sm:flex">
          <span>↑↓ to move</span>
          <span>↵ to open</span>
          <span>Esc to close</span>
        </div>
      </Command>
    </dialog>
  )
}

function Item({ children, icon, hint, ...props }: { children: ReactNode; icon: ReactNode; hint?: string; value: string; keywords?: string[]; onSelect: () => void }) {
  return (
    <Command.Item {...props} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[0.9375rem] text-ink">
      <span className="text-muted">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint && <span className="hidden shrink-0 font-mono text-xs text-muted sm:inline">{hint}</span>}
    </Command.Item>
  )
}

/**
 * Predictable matching instead of cmdk's fuzzy default: every typed word must appear in the item's
 * name or keywords; matches in the name rank first ("fripa" finds Fripa, not "Frontend… APIs").
 */
function filter(value: string, search: string, keywords?: string[]) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return 1
  const name = value.toLowerCase()
  const all = `${name} ${(keywords ?? []).join(" ").toLowerCase()}`
  if (!words.every((w) => all.includes(w))) return 0
  return words.every((w) => name.includes(w)) ? (name.startsWith(words[0]) || name.includes(` ${words[0]}`) ? 1 : 0.8) : 0.4
}

const labelFor = (r: Release) =>
  r.kind === "job" ? `${r.company} · ${r.role}` : r.kind === "upcoming" ? r.title : `${r.degree}, ${r.school}`

const keywordsFor = (r: Release) => (r.kind === "job" ? [r.title, ...r.stack] : r.kind === "upcoming" ? ["contact", "hire", "job"] : ["education", "degree", r.school])

const iconFor = (r: Release) =>
  r.kind === "job" ? <TagIcon aria-hidden="true" className="size-4" /> : r.kind === "upcoming" ? <Rocket aria-hidden="true" className="size-4" /> : <GraduationCap aria-hidden="true" className="size-4" />
