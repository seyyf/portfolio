"use client"

import { Printer } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/Button"

/** "Print / Save as PDF". Opening /cv?print=1 (the command palette's "Print CV") prints right away. */
export function PrintButton() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("print") !== "1") return
    window.history.replaceState(null, "", "/cv")
    void document.fonts.ready.then(() => window.print())
  }, [])

  return (
    <Button onClick={() => window.print()}>
      <Printer aria-hidden="true" className="size-4" />
      Print / Save as PDF
    </Button>
  )
}
