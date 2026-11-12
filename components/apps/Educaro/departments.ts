// Demo data for the CRM preview. Plausible numbers, clearly labelled as a demo in the UI.

export type Department = {
  id: string
  name: string
  emoji: string
  /** Tailwind background for the accent bits. */
  accent: string
  stats: { label: string; value: string }[]
  chartLabel: string
  /** Seven values, Monday to Sunday. */
  chart: number[]
  list: { title: string; meta: string; status: string }[]
}

export const departments: Department[] = [
  {
    id: "admissions",
    name: "Admissions",
    emoji: "🎓",
    accent: "bg-sky",
    stats: [
      { label: "New applications", value: "48" },
      { label: "Interviews today", value: "6" },
    ],
    chartLabel: "Applications this week",
    chart: [5, 8, 6, 11, 9, 4, 5],
    list: [
      { title: "Application #1042", meta: "Documents received", status: "Review" },
      { title: "Application #1039", meta: "Interview at 14:00", status: "Booked" },
      { title: "Application #1031", meta: "Offer sent", status: "Waiting" },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    emoji: "💼",
    accent: "bg-butter",
    stats: [
      { label: "Open leads", value: "126" },
      { label: "Won this month", value: "31" },
    ],
    chartLabel: "Leads per day",
    chart: [14, 19, 12, 22, 17, 9, 6],
    list: [
      { title: "Lead from the website", meta: "Call back before noon", status: "Hot" },
      { title: "Referral from a parent", meta: "Brochure sent", status: "Warm" },
      { title: "Fair contact", meta: "Follow-up email", status: "New" },
    ],
  },
  {
    id: "support",
    name: "Support",
    emoji: "🛟",
    accent: "bg-mint",
    stats: [
      { label: "Open tickets", value: "17" },
      { label: "Median reply", value: "12 min" },
    ],
    chartLabel: "Tickets closed",
    chart: [9, 12, 10, 14, 11, 3, 2],
    list: [
      { title: "Cannot reset password", meta: "Assigned to you", status: "Open" },
      { title: "Invoice question", meta: "Waiting on finance", status: "Pending" },
      { title: "Schedule change", meta: "Closed 5 min ago", status: "Done" },
    ],
  },
  {
    id: "recruiting",
    name: "Recruiting",
    emoji: "🤝",
    accent: "bg-lavender",
    stats: [
      { label: "Open roles", value: "5" },
      { label: "Candidates", value: "64" },
    ],
    chartLabel: "Candidates screened",
    chart: [4, 6, 9, 5, 7, 1, 0],
    list: [
      { title: "Math teacher", meta: "3 interviews scheduled", status: "Active" },
      { title: "Support agent", meta: "12 new candidates", status: "Active" },
      { title: "Sales advisor", meta: "Offer accepted", status: "Filled" },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    emoji: "📊",
    accent: "bg-coral",
    stats: [
      { label: "Invoices due", value: "23" },
      { label: "Paid this week", value: "41" },
    ],
    chartLabel: "Payments received",
    chart: [7, 9, 6, 12, 8, 2, 1],
    list: [
      { title: "Invoice INV-2207", meta: "Due in 3 days", status: "Due" },
      { title: "Invoice INV-2199", meta: "Paid by transfer", status: "Paid" },
      { title: "Refund request", meta: "Needs approval", status: "Review" },
    ],
  },
  {
    id: "teaching",
    name: "Teaching",
    emoji: "📚",
    accent: "bg-glow",
    stats: [
      { label: "Classes today", value: "14" },
      { label: "Attendance", value: "92%" },
    ],
    chartLabel: "Classes per day",
    chart: [14, 13, 15, 14, 12, 6, 0],
    list: [
      { title: "Group B2, English", meta: "Room 3, 10:00", status: "Now" },
      { title: "Group A1, French", meta: "Room 1, 11:30", status: "Next" },
      { title: "Homework review", meta: "8 to grade", status: "To do" },
    ],
  },
]
