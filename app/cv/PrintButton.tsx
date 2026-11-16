"use client"

import { Printer } from "lucide-react"

/** "Print / Save as PDF": the browser's print dialog saves the page as a one-page A4 PDF. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#111] px-4 text-[0.9375rem] font-semibold text-white hover:bg-[#333]"
    >
      <Printer aria-hidden="true" className="size-4" />
      Print / Save as PDF
    </button>
  )
}
