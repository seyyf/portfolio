// Seyf City: every word on the site lives here.
// Edit text freely; components only read from this file.
// Facts come from cv.md plus the "Seyf City" brief (Fripa is from the brief only).

export type BuildingId =
  | "educaro"
  | "uteek"
  | "globalenr"
  | "opuslab"
  | "bertsch"
  | "fripa"
  | "febal"
  | "aurelia"
  | "weedy"
  | "house"
  | "workshop"

/** Interactive extra shown inside a building's info panel. */
export type Widget =
  | "beforeAfter"
  | "ticket"
  | "coffee"
  | "qrMenu"
  | "est2020"
  | "swipe"
  | "contact"
  | "toolbox"

export type Building = {
  id: BuildingId
  emoji: string
  /** What the building is in the city, e.g. "The School". */
  place: string
  /** Company, project or section name. */
  name: string
  kind: "job" | "project" | "about" | "skills"
  role?: string
  period?: string
  /** One or two sentences for the tour card. */
  summary: string
  /** Full story for the info panel; each entry is one paragraph or bullet. */
  story: string[]
  stack: string[]
  link?: { label: string; href: string }
  widget?: Widget
  // ---- city placement ----
  /** Ground position [x, z] in world units. The island spans -21..21 on both axes. */
  position: [number, number]
  /** Footprint width (x), depth (z) and height (y), used for camera framing and label height. */
  size: [number, number, number]
  /** Camera zoom at this tour stop, relative to the overview zoom. */
  zoom: number
  /**
   * Optional .glb model in /public/models to replace the procedural building.
   * Example: "/models/school.glb". The model is centred on `position` with its base at y = 0.
   */
  model?: string
}

export const profile = {
  name: "Seyf Mejri",
  firstName: "Seyf",
  title: "Fullstack JavaScript Developer",
  yearsExperience: 6,
  location: "Tunis, Tunisia",
  email: "mejri.seyf@gmail.com",
  linkedin: "https://www.linkedin.com/in/seyf-mejri-848a8416b",
  linkedinLabel: "linkedin.com/in/seyf-mejri-848a8416b",
  cv: "/cv/Seyf-Mejri-CV.pdf",
  // PLACEHOLDER: replace with the real domain before deploying (used for SEO and Open Graph URLs).
  siteUrl: "https://example.com",
  tagline: "I build the apps people use every day.",
  summary:
    "Fullstack JavaScript developer with 6 years of experience building React and Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products. Recently led the full rebuild of a company CRM from AngularJS to React and TypeScript. Comfortable owning features end to end, from database design to UI and deployment, and using AI tooling to ship faster without cutting corners on quality.",
}

export const hero = {
  greeting: "Hi, I'm Seyf",
  intro: "I'm a fullstack JavaScript developer in Tunis. Every building in this town is something I built.",
  scrollHint: "Scroll to take the tour",
}

export const finale = {
  heading: "Let's build something together",
  body: "The lights are on and the city is quiet. If you have an app in mind, I'd love to hear about it.",
}

export const educaroDepartments = ["Admissions", "Sales", "Support", "Recruiting", "Finance", "Teaching"] as const

export const buildings: Building[] = [
  {
    id: "educaro",
    emoji: "🏫",
    place: "The School",
    name: "Educaro",
    kind: "job",
    role: "Fullstack Developer",
    period: "Jan 2025 – Present",
    summary:
      "I led the full rebuild of the company CRM, from AngularJS to React and TypeScript. 70 people use it every day.",
    story: [
      "Led the rebuild of the company CRM from scratch, moving it from AngularJS to React and TypeScript. It is used every day by 70 staff across admissions, sales, support, recruiting, finance and teaching.",
      "Redesigned it mobile-first with shadcn/ui and animations, and fixed the recurring bugs of the legacy app.",
      "Reworked login and authentication to strengthen security.",
      "Built REST APIs in Node.js and PHP on MongoDB and MySQL, and containerized the app with Docker.",
      "Set up GitLab CI/CD that deploys to DigitalOcean automatically and runs database migrations on every release.",
    ],
    stack: ["React", "TypeScript", "shadcn/ui", "Node.js", "PHP", "MongoDB", "MySQL", "Docker", "GitLab CI/CD", "DigitalOcean"],
    widget: "beforeAfter",
    position: [0, 0],
    size: [9, 5.6, 6.4],
    zoom: 1.75,
  },
  {
    id: "uteek",
    emoji: "🎟️",
    place: "The Event Hall",
    name: "Uteek",
    kind: "job",
    role: "Frontend Developer",
    period: "Feb 2024 – Dec 2024",
    summary: "Booking and event-management interfaces in React and Next.js, with live data kept fresh by React Query.",
    story: [
      "Built responsive booking and event-management interfaces for an event platform in React and Next.js.",
      "Managed server state with React Query: caching, background refetching, and clear loading and error states.",
    ],
    stack: ["React", "Next.js", "React Query", "Tailwind CSS", "GitLab"],
    widget: "ticket",
    position: [-14.5, 0],
    size: [6, 5, 4.2],
    zoom: 2.2,
  },
  {
    id: "globalenr",
    emoji: "🍽️",
    place: "The Restaurant",
    name: "Global ENR",
    kind: "job",
    role: "Fullstack Developer",
    period: "Feb 2023 – Feb 2024",
    summary: "A restaurant PWA that about 120 people use to order food and drinks from their phones, plus the APIs of an internal ERP.",
    story: [
      "Built a restaurant PWA used by about 120 people to order food and drinks from their phones.",
      "Designed and built the backend REST APIs of an internal ERP in Node.js, Express and MySQL, including its HR, finance and marketing modules.",
    ],
    stack: ["React", "Tailwind CSS", "Node.js", "Express", "MySQL", "GitHub"],
    widget: "coffee",
    position: [14.5, -12],
    size: [5, 4, 4.2],
    zoom: 2.2,
  },
  {
    id: "opuslab",
    emoji: "🍕",
    place: "The Café",
    name: "Opus Lab",
    kind: "job",
    role: "Frontend Developer",
    period: "Feb 2022 – Feb 2023",
    summary: "An admin dashboard for restaurant owners, and a PWA that opens the menu from a QR code and takes payment online.",
    story: [
      "Built an admin dashboard for restaurant owners to manage their establishments.",
      "Built a PWA for QR-code menu access and online payment.",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    widget: "qrMenu",
    position: [0, -12],
    size: [4.5, 3.5, 3.2],
    zoom: 2.4,
  },
  {
    id: "bertsch",
    emoji: "🏢",
    place: "The Office Tower",
    name: "Bertsch Innovation",
    kind: "job",
    role: "Frontend Developer",
    period: "Aug 2020 – Feb 2022",
    summary: "Where it all started: e-proCAT, a B2B product-catalog SaaS, built in Angular and TypeScript with an Agile team of five.",
    story: [
      "Where it all started.",
      "Developed features for e-proCAT, a B2B product-catalog and data-classification SaaS, in Angular and TypeScript.",
      "Worked in an Agile team of five, alongside my Master's degree.",
    ],
    stack: ["Angular", "TypeScript"],
    widget: "est2020",
    position: [-14.5, -12.5],
    size: [4, 4, 11],
    zoom: 1.7,
  },
  {
    id: "febal",
    emoji: "🛋️",
    place: "The Furniture Store",
    name: "Febal Casa USA",
    kind: "project",
    summary: "Website for an Italian furniture and interior-design brand in the US.",
    story: ["Website for an Italian furniture and interior-design brand in the US."],
    stack: [],
    position: [-17, 13],
    size: [4, 4, 4],
    zoom: 2.5,
  },
  {
    id: "aurelia",
    emoji: "🧤",
    place: "The Supply Shop",
    name: "Aurelia Gloves",
    kind: "project",
    summary: "Product site for a US brand of professional disposable gloves.",
    story: ["Product site for a US brand of professional disposable gloves."],
    stack: [],
    position: [-11.5, 13],
    size: [3.5, 3.5, 3.2],
    zoom: 2.6,
  },
  {
    id: "weedy",
    emoji: "🌿",
    place: "The Paris Boutique",
    name: "Weedy",
    kind: "project",
    summary: "E-commerce store in France, on the city's little French corner.",
    story: ["E-commerce store in France."],
    stack: [],
    position: [12, 13],
    size: [3.5, 3.5, 3.4],
    zoom: 2.6,
  },
  {
    id: "fripa",
    emoji: "👕",
    place: "The Thrift Shop",
    name: "Fripa",
    kind: "project",
    role: "Personal project",
    summary: "An online secondhand clothing store in Tunisia where you shop by swiping. Try it inside.",
    story: [
      "An online secondhand clothing store in Tunisia.",
      "Instead of scrolling a grid, you swipe through pieces one at a time: right to keep, left to pass.",
    ],
    stack: [],
    widget: "swipe",
    position: [17.5, 13],
    size: [3.5, 3.5, 3.2],
    zoom: 2.6,
  },
  {
    id: "workshop",
    emoji: "🔧",
    place: "The Workshop",
    name: "Skills",
    kind: "skills",
    summary: "The toolbox I bring to every building in town.",
    story: ["The tools I use to build, from the first database table to the deploy pipeline."],
    stack: [],
    widget: "toolbox",
    position: [14.5, 0],
    size: [5, 4, 3.4],
    zoom: 2.2,
  },
  {
    id: "house",
    emoji: "🏠",
    place: "My House",
    name: "About me",
    kind: "about",
    role: "Fullstack JavaScript Developer",
    summary: "Seyf Mejri, fullstack JavaScript developer based in Tunis, with 6 years of experience.",
    story: [
      "I'm Seyf Mejri, a fullstack JavaScript developer based in Tunis with 6 years of experience.",
      "I have a Master's in Media Engineering from ISAMM, and I speak Arabic, English and French.",
      "I like owning features end to end, and I use AI tooling to ship faster without cutting corners on quality.",
    ],
    stack: [],
    widget: "contact",
    position: [0, 13],
    size: [4, 4, 3.8],
    zoom: 2.4,
  },
]

export const buildingById = Object.fromEntries(buildings.map((b) => [b.id, b])) as Record<BuildingId, Building>

/** Guided tour order: career from first job to now, then side projects, then skills. */
export const tourOrder: BuildingId[] = [
  "bertsch",
  "opuslab",
  "globalenr",
  "uteek",
  "educaro",
  "febal",
  "aurelia",
  "weedy",
  "fripa",
  "workshop",
]

export const skillGroups: { label: string; items: string[] }[] = [
  {
    label: "Frontend",
    items: ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "React Query", "Tailwind CSS", "shadcn/ui", "PWAs"],
  },
  { label: "Backend", items: ["Node.js", "Express", "NestJS", "PHP", "REST APIs"] },
  { label: "Databases", items: ["PostgreSQL", "MongoDB", "MySQL"] },
  { label: "DevOps", items: ["Docker", "GitLab CI/CD", "DigitalOcean"] },
  { label: "Tools", items: ["Git", "AI-assisted development"] },
]

export const education = [
  { degree: "Master's in Media Engineering (Web Development)", school: "ISAMM, Manouba", years: "2020 – 2022" },
  { degree: "Bachelor's in Multimedia Communication", school: "ISAMM, Tunis", years: "2017 – 2020" },
]

export const languages = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "C1" },
  { name: "French", level: "B2" },
]

/** Placeholder images for the Educaro before/after slider. Replace the files in /public/images. */
export const educaroBeforeAfter = {
  before: { src: "/images/educaro-before.svg", alt: "Illustration of the old AngularJS CRM: dense tables and cramped forms" },
  after: { src: "/images/educaro-after.svg", alt: "Illustration of the new React CRM: clean cards, clear navigation, mobile-first" },
}
