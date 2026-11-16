"use client"

import { Download, Menu, Search, X } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef } from "react"

import { buttonClass } from "@/components/ui/Button"
import { nav, profile } from "@/data/profile"

import { usePalette } from "./Providers"
import { switchTheme } from "./ThemeToggle"

/**
 * Full-screen sheet with the header links (below the lg breakpoint). A native modal <dialog>:
 * Esc closes it, the page behind is inert, and focus returns to the menu button.
 */
export function MobileMenu() {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()
  const { openPalette } = usePalette()
  const { resolvedTheme, setTheme } = useTheme()

  const close = () => dialog.current?.close()
  // Close when the route changes (a link was followed).
  useEffect(() => close(), [pathname])

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-label="Open menu"
        aria-haspopup="dialog"
        className="inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-ink hover:bg-ink/[0.06] lg:hidden"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      <dialog
        ref={dialog}
        aria-label="Menu"
        className="sheet m-0 h-dvh max-h-none w-screen max-w-none bg-bg p-0 text-ink"
        onClick={(e) => {
          // Following a link closes the sheet (also for same-page hash links).
          if ((e.target as HTMLElement).closest("a")) close()
        }}
      >
        <div className="mx-auto flex h-full max-w-[1120px] flex-col px-4 sm:px-6">
          <div className="flex h-14 items-center justify-between border-b border-border">
            <span className="text-[0.9375rem] font-semibold tracking-tight">{profile.name}</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] hover:bg-ink/[0.06]"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <nav aria-label="Main" className="py-6">
            <ul>
              {nav.map((item) => (
                <li key={item.href} className="border-b border-border">
                  <Link href={item.href} className="flex items-center justify-between py-4 text-2xl font-semibold tracking-tight">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="border-b border-border">
                <Link href="/cv" className="flex items-center justify-between py-4 text-2xl font-semibold tracking-tight">
                  Résumé
                </Link>
              </li>
            </ul>
          </nav>

          <div className="mt-auto grid gap-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            <a href={profile.cvPdf} download className={buttonClass("primary", "md", "w-full")}>
              <Download aria-hidden="true" className="size-4" />
              Download CV
            </a>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className={buttonClass("outline", "md")}
                onClick={() => {
                  close()
                  openPalette()
                }}
              >
                <Search aria-hidden="true" className="size-4" />
                Search
              </button>
              <button type="button" className={buttonClass("outline", "md")} onClick={() => switchTheme(setTheme, resolvedTheme)}>
                <span className="dark:hidden">Dark mode</span>
                <span className="hidden dark:inline">Light mode</span>
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  )
}
