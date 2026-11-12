"use client"

import { createContext, useContext } from "react"

/**
 * The phone's screen element. Overlays (sheets, menus) portal into it so they stay inside the phone
 * on desktop. The screen has `transform: translateZ(0)`, which makes it the containing block for
 * `position: fixed` children: fixed overlays cover the screen, not the browser window.
 */
export const PhoneScreenContext = createContext<HTMLElement | null>(null)
export const usePhoneScreen = () => useContext(PhoneScreenContext)
