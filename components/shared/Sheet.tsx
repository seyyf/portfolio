"use client"

import type { ReactNode } from "react"
import { Drawer } from "vaul"

import { usePhoneScreen } from "@/components/os/phoneScreen"
import { useBackLayer } from "@/lib/backStack"

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Visually hidden description for screen readers. */
  description?: string
  children: ReactNode
}

/** Native-feeling bottom sheet (Vaul), rendered inside the phone screen. Drag down to dismiss. */
export function Sheet({ open, onOpenChange, title, description, children }: SheetProps) {
  const screen = usePhoneScreen()
  // The phone's back button closes the sheet first, like a native bottom sheet.
  useBackLayer(open, () => onOpenChange(false))
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} noBodyStyles>
      <Drawer.Portal container={screen ?? undefined}>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/30" />
        <Drawer.Content
          className="glass-strong fixed inset-x-0 bottom-0 z-[61] flex max-h-[86%] flex-col rounded-t-[28px] pb-[calc(var(--home-h)+env(safe-area-inset-bottom))] text-text outline-none"
        >
          <div aria-hidden="true" className="mx-auto mt-2.5 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-text/25" />
          <Drawer.Title className="px-5 pt-2 pb-1 font-display text-xl font-semibold">{title}</Drawer.Title>
          <Drawer.Description className={description ? "px-5 pb-1 text-sm text-text-soft" : "sr-only"}>
            {description ?? title}
          </Drawer.Description>
          <div className="app-scroll min-h-0 flex-1 px-5 pt-2 pb-4" data-vaul-no-drag>
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
