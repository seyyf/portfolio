"use client"

import { Download, Search } from "lucide-react"
import Link from "next/link"
import { useSyncExternalStore } from "react"

import { ButtonAnchor } from "@/components/ui/Button"
import { nav, profile } from "@/data/profile"

import { MobileMenu } from "./MobileMenu"
import { usePalette } from "./Providers"
import { ThemeToggle } from "./ThemeToggle"

/** "⌘K" on Apple devices, "Ctrl K" elsewhere (decided after hydration; the server renders ⌘K). */
function useShortcutLabel() {
  return useSyncExternalStore(
    () => () => {},
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl K"),
    () => "⌘K"
  )
}

export function VersionBadge() {
  return (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-border bg-surface px-2 font-mono text-xs text-muted">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-tag-improved" />
      {profile.currentVersion} stable
    </span>
  )
}

export function Header() {
  const { openPalette } = usePalette()
  const shortcut = useShortcutLabel()

  return (
    <header className="no-print sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-md">
          <span className="text-[0.9375rem] font-semibold tracking-tight whitespace-nowrap">{profile.name}</span>
          <VersionBadge />
        </Link>

        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="rounded-md px-3 py-2 text-[0.9375rem] text-muted transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <button
            type="button"
            onClick={openPalette}
            aria-label="Open command menu"
            aria-keyshortcuts="Meta+K Control+K"
            className="inline-flex size-11 items-center justify-center gap-2 rounded-[var(--radius-control)] text-muted hover:bg-ink/[0.06] hover:text-ink lg:h-9 lg:w-auto lg:border lg:border-border lg:px-2.5"
          >
            <Search aria-hidden="true" className="size-[17px] lg:size-4" />
            <kbd className="hidden font-mono text-xs lg:inline" suppressHydrationWarning>
              {shortcut}
            </kbd>
          </button>
          <div className="hidden items-center gap-1 lg:flex">
            <ThemeToggle />
            <ButtonAnchor href={profile.cvPdf} download size="sm" className="ml-1">
              <Download aria-hidden="true" className="size-4" />
              Download CV
            </ButtonAnchor>
          </div>
          <MobileMenu />
        </div>
      </div>
    </header>
  )
}
