// Demo events for the booking preview.

export type DemoEvent = {
  id: string
  code: string
  emoji: string
  title: string
  when: string
  place: string
  price: string
  accent: string
  blurb: string
}

export const EVENTS: DemoEvent[] = [
  {
    id: "jazz",
    code: "JZ",
    emoji: "🎷",
    title: "Rooftop jazz night",
    when: "Friday, 9 pm",
    place: "Sidi Bou Said",
    price: "35 TND",
    accent: "bg-lavender",
    blurb: "A quartet, a warm breeze and the whole bay below. Doors open at 8:30.",
  },
  {
    id: "meetup",
    code: "FE",
    emoji: "💻",
    title: "Frontend meetup",
    when: "Tuesday, 7 pm",
    place: "Les Berges du Lac",
    price: "Free",
    accent: "bg-sky",
    blurb: "Three short talks on React, motion and accessibility, then pizza and questions.",
  },
  {
    id: "cinema",
    code: "CN",
    emoji: "🎬",
    title: "Open-air cinema",
    when: "Saturday, 8:30 pm",
    place: "The old harbour",
    price: "20 TND",
    accent: "bg-butter",
    blurb: "A classic on a big screen under the stars. Bring a jacket, we bring the popcorn.",
  },
  {
    id: "yoga",
    code: "YG",
    emoji: "🧘",
    title: "Sunrise yoga",
    when: "Sunday, 7 am",
    place: "La Marsa beach",
    price: "15 TND",
    accent: "bg-mint",
    blurb: "An easy hour on the sand as the sun comes up. Mats provided, all levels welcome.",
  },
]

export const ROWS = ["A", "B", "C", "D", "E"] as const
export const SEATS_PER_ROW = 8

/** Deterministic "taken" seats per event, so server and client agree. */
export function isTaken(eventId: string, row: number, seat: number) {
  let h = 2166136261
  const s = `${eventId}-${row}-${seat}`
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0) % 10 < 3
}
