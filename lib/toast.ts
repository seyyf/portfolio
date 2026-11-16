"use client"

import { useSyncExternalStore } from "react"

// A tiny toast store: one short mono message at a time ("✓ Message delivered", "✓ Email copied").

type Toast = { id: number; text: string } | null

let current: Toast = null
let timer: ReturnType<typeof setTimeout> | undefined
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function toast(text: string, ms = 3200) {
  current = { id: Date.now(), text }
  emit()
  clearTimeout(timer)
  timer = setTimeout(() => {
    current = null
    emit()
  }, ms)
}

export function useToast() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
    () => null
  )
}
