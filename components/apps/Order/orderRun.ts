"use client"

import { create } from "zustand"

import { playSfx } from "@/lib/sound"
import { useOS } from "@/lib/store"

// The demo order lives outside the component, so it keeps going (and the live pill keeps updating)
// when the visitor leaves the app. Come back and the tracker is still there.

export type OrderStatus = "idle" | "received" | "preparing" | "onTheWay"

type OrderRun = { status: OrderStatus; summary: string }

export const useOrderRun = create<OrderRun>()(() => ({ status: "idle", summary: "" }))

let timers: ReturnType<typeof setTimeout>[] = []

const clearTimers = () => {
  timers.forEach(clearTimeout)
  timers = []
}

export function startOrder(summary: string) {
  clearTimers()
  useOrderRun.setState({ status: "received", summary })
  useOS.getState().showActivity({ id: "coffee", icon: "☕", label: "Ordering coffee", detail: "2 min", progress: 0.15 })

  timers.push(
    setTimeout(() => {
      useOrderRun.setState({ status: "preparing" })
      useOS.getState().updateActivity("coffee", { detail: "1 min", progress: 0.55 })
    }, 2400)
  )
  timers.push(
    setTimeout(() => {
      useOrderRun.setState({ status: "onTheWay" })
      useOS.getState().updateActivity("coffee", { label: "Coffee on its way ☕", detail: undefined, progress: undefined, tone: "success" }, 3200)
      playSfx("ping")
    }, 5200)
  )
}

export function resetOrder() {
  clearTimers()
  useOS.getState().clearActivity("coffee")
  useOrderRun.setState({ status: "idle", summary: "" })
}
