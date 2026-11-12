// Who Seyf is. Facts come from cv.md (synced with Seyf's real CV). Edit freely; components only read from here.

export const profile = {
  name: "Seyf Mejri",
  firstName: "Seyf",
  title: "Fullstack JavaScript Developer",
  yearsExperience: 6,
  location: "Tunis, Tunisia",
  city: "Tunis",
  timeZone: "Africa/Tunis",
  email: "mejri.seyf@gmail.com",
  linkedin: "https://www.linkedin.com/in/seyf-mejri-848a8416b",
  linkedinLabel: "linkedin.com/in/seyf-mejri-848a8416b",
  cv: "/cv/Seyf-Mejri-CV.pdf",
  cvFileName: "Seyf-Mejri-CV.pdf",
  // PLACEHOLDER: replace with the real domain before deploying (canonical URLs, Open Graph, sitemap).
  siteUrl: "https://example.com",
  summary:
    "Fullstack JavaScript developer with 6 years of experience building React and Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products. Recently led the full rebuild of a company CRM from AngularJS to React and TypeScript. Comfortable owning features end to end, from database design to UI and deployment.",
  tagline: "I build the apps people use every day.",
}

export const skillGroups: { label: string; items: { name: string; detail?: string }[] }[] = [
  {
    label: "Frontend",
    items: ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "React Query", "Tailwind CSS", "shadcn/ui", "PWAs"].map((name) => ({ name })),
  },
  { label: "Backend", items: ["Node.js", "Express", "NestJS", "PHP", "REST APIs"].map((name) => ({ name })) },
  { label: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL"].map((name) => ({ name })) },
  { label: "DevOps", items: ["Docker", "GitLab CI/CD", "DigitalOcean"].map((name) => ({ name })) },
  {
    label: "Tools",
    items: [
      { name: "Git", detail: "GitHub, GitLab, Bitbucket" },
      { name: "AI-assisted development", detail: "Claude, Codex, OpenAI API" },
    ],
  },
]

export const languages = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "C1" },
  { name: "French", level: "B2" },
]

export const education = [
  { degree: "Master's in Media Engineering (Web Development)", school: "ISAMM, Manouba", start: 2020, end: 2022 },
  { degree: "Bachelor's in Multimedia Communication", school: "ISAMM, Tunis", start: 2017, end: 2020 },
]

/** Lock screen notifications, in order. `app` is what tapping the notification opens. */
export const lockNotifications = [
  { id: "n1", app: "educaro", from: "Educaro", text: "The new CRM is live for every department ✅" },
  { id: "n2", app: "fripa", from: "Fripa", text: "Someone just saved a vintage jacket 🧥" },
  { id: "n3", app: "uteek", from: "Uteek", text: "1 new booking confirmed 🎟️" },
  { id: "n4", app: "messages", from: "Recruiter", text: "Hey Seyf, are you available for a chat?" },
] as const

/** The Messages app conversation. */
export const chat = {
  intro: [
    "Hi! I'm Seyf 👋",
    "Fullstack JavaScript developer from Tunis",
    "6 years building web apps: SaaS, ERP, e-commerce, booking",
    "I love owning features end to end, from the database to the pixels",
    "What would you like to see?",
  ],
  replies: [
    { label: "Show me your work", answer: "Here are the apps I've built 👇", go: "home" },
    { label: "Your skills", answer: "Opening my settings, everything is switched on 😄", go: "settings" },
    { label: "Your experience", answer: "Here's my calendar, from university to today 📅", go: "calendar" },
    { label: "Let's talk", answer: "Great! Write me a mail ✉️", go: "mail" },
  ],
} as const
