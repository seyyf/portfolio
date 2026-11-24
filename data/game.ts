// The game layer on top of the portfolio: cheat codes, hidden blue doors, phone calls from Seyf
// and the interest level (the HUD stars). Everything here is original to this site. Facts in the
// calls come from cv.md / data/profile.ts, like the rest of the site.

export type CheatId = "hireme" | "nightride" | "xray" | "bighead" | "motherlode" | "bluedoor"

export type Cheat = {
  id: CheatId
  /** What the visitor types (letters only, case-insensitive). */
  code: string
  /** Shown once found, in the phone's Codes app. */
  effect: string
  /** Shown while still hidden, as a nudge. */
  hint: string
  /** Toggles on and off (a class on <html>) rather than firing once. */
  toggle: boolean
}

export const cheats: Cheat[] = [
  { id: "hireme", code: "HIREME", effect: "Instant five-star interest level", hint: "What a recruiter is thinking, in two words", toggle: false },
  { id: "nightride", code: "NIGHTRIDE", effect: "Neon night filter over the whole city", hint: "A drive after dark", toggle: true },
  { id: "xray", code: "XRAY", effect: "See the layout: every box on the page outlined", hint: "See through the walls", toggle: true },
  { id: "bighead", code: "BIGHEAD", effect: "Seyf's name in the HUD, much bigger", hint: "An ego boost", toggle: true },
  { id: "motherlode", code: "MOTHERLODE", effect: "Cash in the career stats", hint: "The jackpot", toggle: false },
  { id: "bluedoor", code: "BLUEDOOR", effect: "Hidden doors on this page light up", hint: "The colour of Sidi Bou Said, and a way in", toggle: true },
]

/** The 10 hidden Sidi Bou Said doors. `hint` is shown on the Stats page until the door is found. */
export const doors = [
  { id: "hub", hint: "On the map page, near Seyf's name" },
  { id: "mission-list", hint: "At the far end of the mission list" },
  { id: "first-contract", hint: "Mission 01" },
  { id: "table-service", hint: "Mission 02" },
  { id: "120-users", hint: "Mission 03" },
  { id: "book-it", hint: "Mission 04" },
  { id: "the-rebuild", hint: "Mission 05" },
  { id: "stats", hint: "On the Stats page" },
  { id: "contact", hint: "Where you send a message" },
  { id: "busted", hint: "You only get there by getting lost" },
] as const

export type DoorId = (typeof doors)[number]["id"]

export type CallId = "intro" | "wanted"

export type Call = {
  id: CallId
  /** Shown on the ringing card and in Recent calls. */
  label: string
  lines: string[]
}

export const calls: Record<CallId, Call> = {
  intro: {
    id: "intro",
    label: "Welcome to Tunis",
    lines: [
      "Hey, it's Seyf. Welcome to Tunis.",
      "Every pin on the map is a real job I did. Open one for the full briefing.",
      "Word is there are ten blue doors hidden around this site. Find them all.",
      "And some words do things here. Type one anywhere. Start with HIREME.",
      "My whole stack is on the skills wheel: hold Q, or find it in the menu. Talk soon.",
    ],
  },
  wanted: {
    id: "wanted",
    label: "Five stars",
    lines: [
      "Five stars. You've really been looking around.",
      "I think you've seen enough to know what I can do.",
      "So let's talk. Send me a message and I'll get back to you.",
    ],
  },
}

/** Interest level: how many points (distinct things done) each star needs. */
export const starThresholds = [1, 3, 6, 10, 15] as const
