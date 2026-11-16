// The career as releases, newest first. Version map is fixed by the brief; change lists are the CV's
// own bullets. Never invent numbers: a metric without a real value is a `TODO: add metric`
// placeholder (shown in development only).

export type ChangeTag = "NEW" | "IMPROVED" | "FIXED" | "SECURITY" | "INFRA"
export type Change = { tag: ChangeTag; text: string }
export type Img = { src: string; alt: string; width: number; height: number }
/** A figure for the Impact section. Leave `value` undefined until there is a real number. */
export type Metric = { label: string; value?: string }

export type JobRelease = {
  kind: "job"
  slug: string
  version: string
  company: string
  role: string
  dates: string
  location: string
  title: string
  summary: string
  changes: Change[]
  /** Indexes into `changes` shown in the home-page changelog (2–4). */
  highlights: number[]
  stack: string[]
  context: string[]
  impact: string[]
  metrics: Metric[]
  hero: Img
  beforeAfter?: { before: Img; after: Img }
}

export type EducationRelease = {
  kind: "education"
  version: string
  degree: string
  school: string
  dates: string
}

export type UpcomingRelease = { kind: "upcoming"; version: string; title: string }

export type Release = JobRelease | EducationRelease | UpcomingRelease

const shot = (slug: string, alt: string): Img => ({ src: `/images/releases/${slug}.svg`, alt, width: 1600, height: 1000 })

export const jobs: JobRelease[] = [
  {
    kind: "job",
    slug: "educaro",
    version: "v5.0",
    company: "Educaro",
    role: "Fullstack Developer",
    dates: "Jan 2025 – Present",
    location: "Tunis",
    title: "Educaro CRM — rebuilt from scratch",
    summary: "I led the rebuild of Educaro's internal CRM from AngularJS to React and TypeScript, from the database to deployment.",
    changes: [
      {
        tag: "NEW",
        text: "Led the rebuild of the internal CRM from scratch, migrating from AngularJS to React/TypeScript; used daily company-wide across admissions, sales, support, recruiting, finance and teaching.",
      },
      { tag: "IMPROVED", text: "Redesigned it mobile-first with a modern UI, animations and a shadcn/ui component library." },
      { tag: "FIXED", text: "Resolved the recurring bugs of the legacy app." },
      { tag: "NEW", text: "Shipped new features the old system couldn't support." },
      { tag: "SECURITY", text: "Reworked login and authentication to strengthen security." },
      { tag: "INFRA", text: "Built REST APIs in Node.js and PHP on MongoDB and MySQL, containerized with Docker." },
      { tag: "INFRA", text: "GitLab CI/CD pipelines deploying automatically to DigitalOcean with database migrations on each release." },
    ],
    highlights: [0, 1, 4, 6],
    stack: ["React", "TypeScript", "shadcn/ui", "Node.js", "PHP", "MongoDB", "MySQL", "Docker", "DigitalOcean", "GitLab CI/CD"],
    context: [
      "Educaro ran its daily work on an internal CRM built in AngularJS. Admissions, sales, support, recruiting, finance and teaching all depended on it, and it had recurring bugs and features it couldn't support.",
      "I led the rebuild from scratch in React and TypeScript: a new mobile-first interface, new APIs, a stronger login, and automated deployments.",
    ],
    impact: [
      "The new CRM is used daily across the whole company: admissions, sales, support, recruiting, finance and teaching.",
      "The recurring bugs of the legacy app are resolved, and features the old system couldn't support have shipped.",
      "Every release deploys automatically to DigitalOcean through GitLab CI/CD, with database migrations run on each release.",
    ],
    metrics: [
      { label: "Daily active users" }, // TODO: add metric
      { label: "Page load time, legacy vs new" }, // TODO: add metric
      { label: "Legacy bugs fixed" }, // TODO: add metric
      { label: "Deploys per month" }, // TODO: add metric
    ],
    hero: shot("educaro", "Placeholder screenshot of the new Educaro CRM dashboard"),
    beforeAfter: {
      before: { src: "/images/releases/educaro-legacy.svg", alt: "Placeholder of the legacy AngularJS CRM: dense tables and cramped forms", width: 1600, height: 1000 },
      after: { src: "/images/releases/educaro-new.svg", alt: "Placeholder of the new React CRM: clear navigation and cards", width: 1600, height: 1000 },
    },
  },
  {
    kind: "job",
    slug: "uteek",
    version: "v4.0",
    company: "Uteek",
    role: "Frontend Developer",
    dates: "Feb 2024 – Dec 2024",
    location: "Tunis",
    title: "Booking and event management for an event platform",
    summary: "I built responsive booking and event-management interfaces in React and Next.js, with server state handled by React Query.",
    changes: [
      { tag: "NEW", text: "Responsive booking and event-management interfaces for an event platform in React and Next.js." },
      { tag: "IMPROVED", text: "Server state and API data with React Query: caching, background refetching, loading and error states." },
    ],
    highlights: [0, 1],
    stack: ["React", "Next.js", "React Query", "Tailwind CSS", "GitLab"],
    context: [
      "Uteek runs an event platform. Organisers manage events and visitors book them, on phones as much as on desktops.",
      "I worked on the frontend: the booking and event-management screens, and the data layer that keeps them in sync with the API.",
    ],
    impact: [
      "Booking and event-management screens work on every screen size.",
      "With React Query, API data is cached and refreshed in the background, and every screen has clear loading and error states.",
    ],
    metrics: [
      { label: "Bookings handled" }, // TODO: add metric
      { label: "Load time improvement from caching" }, // TODO: add metric
    ],
    hero: shot("uteek", "Placeholder screenshot of the Uteek booking interface"),
  },
  {
    kind: "job",
    slug: "global-enr",
    version: "v3.0",
    company: "Global ENR",
    role: "Fullstack Developer",
    dates: "Feb 2023 – Feb 2024",
    location: "Tunis",
    title: "A restaurant PWA and the APIs of an internal ERP",
    summary: "I built a restaurant ordering PWA used by about 120 people, and designed the backend REST APIs of an internal ERP.",
    changes: [
      { tag: "NEW", text: "Restaurant PWA used by about 120 people to order food and drinks from their phone." },
      { tag: "NEW", text: "Designed and built the backend REST APIs of an internal ERP in Node.js, Express and MySQL, plus its HR, finance and marketing modules." },
    ],
    highlights: [0, 1],
    stack: ["React", "Tailwind CSS", "Node.js", "Express", "MySQL", "GitHub"],
    context: [
      "Two products at once: a progressive web app for ordering food and drinks in a restaurant, and the backend of an internal ERP.",
      "On the ERP I designed the REST APIs in Node.js, Express and MySQL, and built its HR, finance and marketing modules.",
    ],
    impact: [
      "About 120 people order food and drinks from their phone with the PWA.",
      "The ERP's HR, finance and marketing modules run on the REST APIs I designed.",
    ],
    metrics: [
      { label: "Orders per day" }, // TODO: add metric
      { label: "ERP endpoints or modules" }, // TODO: add metric
    ],
    hero: shot("global-enr", "Placeholder screenshot of the restaurant ordering PWA"),
  },
  {
    kind: "job",
    slug: "opus-lab",
    version: "v2.0",
    company: "Opus Lab",
    role: "Frontend Developer",
    dates: "Feb 2022 – Feb 2023",
    location: "Tunis",
    title: "Restaurant dashboard and a QR-code menu PWA",
    summary: "I built an admin dashboard for restaurant owners and a PWA for QR-code menus and online payment.",
    changes: [
      { tag: "NEW", text: "Admin dashboard for restaurant owners to manage their establishments." },
      { tag: "NEW", text: "PWA for QR-code menu access and online payment." },
    ],
    highlights: [0, 1],
    stack: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    context: [
      "Opus Lab builds tools for restaurants. Owners needed one place to manage their establishments, and their customers needed a menu they could open by scanning a QR code.",
      "I built both frontends in React and TypeScript on top of REST APIs.",
    ],
    impact: [
      "Restaurant owners manage their establishments from one dashboard.",
      "Customers open the menu by scanning a QR code and pay online from their phone.",
    ],
    metrics: [
      { label: "Restaurants using the dashboard" }, // TODO: add metric
      { label: "Orders paid online" }, // TODO: add metric
    ],
    hero: shot("opus-lab", "Placeholder screenshot of the restaurant admin dashboard"),
  },
  {
    kind: "job",
    slug: "bertsch-innovation",
    version: "v1.0",
    company: "Bertsch Innovation",
    role: "Frontend Developer",
    dates: "Aug 2020 – Feb 2022",
    location: "Tunis (alongside Master's)",
    title: "Features for e-proCAT, a B2B catalog SaaS",
    summary: "My first release: features for e-proCAT, a B2B product-catalog and data-classification SaaS, in Angular 9 and TypeScript.",
    changes: [
      {
        tag: "NEW",
        text: "Features for e-proCAT, a B2B product-catalog and data-classification SaaS, in Angular 9 and TypeScript, in an Agile team of five.",
      },
    ],
    highlights: [0],
    stack: ["Angular", "TypeScript"],
    context: [
      "e-proCAT is a B2B SaaS for managing product catalogs and classifying product data.",
      "I joined an Agile team of five while finishing my Master's, and developed features in Angular 9 and TypeScript.",
    ],
    impact: ["Features shipped to e-proCAT in an Agile team of five, alongside a Master's degree."],
    metrics: [
      { label: "Features shipped" }, // TODO: add metric
    ],
    hero: shot("bertsch-innovation", "Placeholder screenshot of the e-proCAT catalog"),
  },
]

export const upcoming: UpcomingRelease = { kind: "upcoming", version: "v6.0", title: "Upcoming release: your team?" }

export const education: EducationRelease[] = [
  { kind: "education", version: "v0.9", degree: "Master's in Media Engineering (Web Development)", school: "ISAMM Manouba", dates: "2020 – 2022" },
  { kind: "education", version: "v0.1", degree: "Bachelor's in Multimedia Communication", school: "ISAMM Tunis", dates: "2017 – 2020" },
]

/** Every release, newest first: v6.0, the jobs, then education. */
export const releases: Release[] = [upcoming, ...jobs, ...education]

export const latest = jobs[0]

/** "v5.0" → "v5-0", used as the element id on the home page. */
export const anchorFor = (version: string) => version.replace(".", "-")

export const releaseLabel = (r: Release) =>
  r.kind === "job" ? r.company : r.kind === "upcoming" ? "Upcoming" : r.degree.startsWith("Master") ? "Master's" : "Bachelor's"

export const jobBySlug = (slug: string) => jobs.find((j) => j.slug === slug)

/** Where a release lives: its own page for jobs, the home-page entry otherwise. */
export const releaseHref = (r: Release) =>
  r.kind === "job" ? `/releases/${r.slug}` : r.kind === "upcoming" ? "/#contact" : `/#${anchorFor(r.version)}`
