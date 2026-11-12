// Everything Seyf built. Facts come from cv.md plus the SeyfOS brief (Fripa is from the brief).

export type ProjectId = "educaro" | "fripa" | "order" | "uteek" | "eprocat" | "febal" | "aurelia" | "weedy"

export type Role = { title: string; company: string; start: string; end: string }

export type Project = {
  id: ProjectId
  name: string
  /** One line for icons, cards and SEO descriptions. */
  tagline: string
  roles: Role[]
  /** What I did: one entry per paragraph or bullet. */
  story: string[]
  stack: string[]
  /** Live site; leave "" until there is one (the button then hides). */
  url: string
  /** Screenshots for Photos and the Browser app. Paths under /public; replace the placeholders. */
  images: { src: string; alt: string; width: number; height: number }[]
}

const shot = (name: string, alt: string, width = 1200, height = 2400) => ({ src: `/images/projects/${name}`, alt, width, height })

export const projects: Project[] = [
  {
    id: "educaro",
    name: "Educaro CRM",
    tagline: "The company CRM, rebuilt from AngularJS to React and used every day across Educaro.",
    roles: [{ title: "Fullstack Developer", company: "Educaro", start: "Jan 2025", end: "Present" }],
    story: [
      "Led the full rebuild of the company CRM from AngularJS to React and TypeScript, used daily across the whole company: admissions, sales, support, recruiting, finance and teaching.",
      "Mobile-first redesign with shadcn/ui and animations, and fixed the recurring bugs of the legacy app.",
      "Shipped features the old system couldn't support, and reworked login and authentication.",
      "REST APIs in Node.js and PHP on MongoDB and MySQL, containerized with Docker.",
      "GitLab CI/CD deploys automatically to DigitalOcean and runs migrations on every release.",
    ],
    stack: ["React", "TypeScript", "shadcn/ui", "Node.js", "PHP", "MongoDB", "MySQL", "Docker", "DigitalOcean", "GitLab CI/CD"],
    url: "",
    images: [
      { src: "/images/educaro-before.svg", alt: "Illustration of the old AngularJS CRM: dense tables and cramped forms", width: 1600, height: 1000 },
      { src: "/images/educaro-after.svg", alt: "Illustration of the new React CRM: clean cards, clear navigation, mobile-first", width: 1600, height: 1000 },
    ],
  },
  {
    id: "fripa",
    name: "Fripa",
    tagline: "A secondhand clothing store in Tunisia where you shop by swiping.",
    roles: [{ title: "Personal project", company: "Fripa", start: "", end: "" }],
    story: [
      "An online secondhand clothing store in Tunisia.",
      "Instead of scrolling a grid, you swipe through pieces one at a time: right to keep, left to pass.",
    ],
    stack: [],
    url: "",
    images: [shot("fripa-1.svg", "Fripa placeholder: a swipe card with a vintage jacket")],
  },
  {
    id: "order",
    name: "Order",
    tagline: "Restaurant apps: order from your phone, QR menus, online payment and the ERP behind them.",
    roles: [
      { title: "Fullstack Developer", company: "Global ENR", start: "Feb 2023", end: "Feb 2024" },
      { title: "Frontend Developer", company: "Opus Lab", start: "Feb 2022", end: "Feb 2023" },
    ],
    story: [
      "Global ENR: a restaurant PWA used by about 120 people to order food and drinks from their phones.",
      "Global ENR: backend REST APIs for an internal ERP in Node.js, Express and MySQL, with HR, finance and marketing modules.",
      "Opus Lab: an admin dashboard for restaurant owners to manage their establishments.",
      "Opus Lab: a PWA for QR-code menu access and online payment.",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "MySQL", "REST APIs", "PWAs"],
    url: "",
    images: [shot("order-1.svg", "Order placeholder: a phone menu with coffee and a cart")],
  },
  {
    id: "uteek",
    name: "Uteek Events",
    tagline: "Booking and event-management interfaces in React and Next.js.",
    roles: [{ title: "Frontend Developer", company: "Uteek", start: "Feb 2024", end: "Dec 2024" }],
    story: [
      "Built responsive booking and event-management interfaces for an event platform in React and Next.js.",
      "Managed server state with React Query: caching, background refetching, and clear loading and error states.",
    ],
    stack: ["React", "Next.js", "React Query", "Tailwind CSS", "GitLab"],
    url: "",
    images: [shot("uteek-1.svg", "Uteek placeholder: an event list and a ticket")],
  },
  {
    id: "eprocat",
    name: "e-proCAT",
    tagline: "A B2B product-catalog and data-classification SaaS. Where it all started.",
    roles: [{ title: "Frontend Developer", company: "Bertsch Innovation", start: "Aug 2020", end: "Feb 2022" }],
    story: [
      "Developed features for e-proCAT, a B2B product-catalog and data-classification SaaS, in Angular 9 and TypeScript.",
      "Worked in an Agile team of five, alongside my Master's degree.",
    ],
    stack: ["Angular 9", "TypeScript"],
    url: "",
    images: [shot("eprocat-1.svg", "e-proCAT placeholder: a product catalog table with filters")],
  },
  {
    id: "febal",
    name: "Febal Casa",
    tagline: "Website for an Italian furniture and interior-design brand in the US.",
    roles: [],
    story: ["Website for an Italian furniture and interior-design brand in the US."],
    stack: [],
    url: "",
    images: [shot("febal-1.svg", "Febal Casa USA placeholder: a long furniture website page", 1200, 3600)],
  },
  {
    id: "aurelia",
    name: "Aurelia",
    tagline: "Product site for a US brand of professional disposable gloves.",
    roles: [],
    story: ["Product site for a US brand of professional disposable gloves."],
    stack: [],
    url: "",
    images: [shot("aurelia-1.svg", "Aurelia Gloves placeholder: a long product website page", 1200, 3600)],
  },
  {
    id: "weedy",
    name: "Weedy",
    tagline: "E-commerce store selling CBD products in France.",
    roles: [],
    story: ["E-commerce store selling CBD products in France."],
    stack: [],
    url: "",
    images: [shot("weedy-1.svg", "Weedy placeholder: a long e-commerce website page", 1200, 3600)],
  },
]

export const projectById = Object.fromEntries(projects.map((p) => [p.id, p])) as Record<ProjectId, Project>

/** Career timeline for Calendar and the résumé, oldest first. */
export const career = [
  { kind: "education" as const, title: "Bachelor's in Multimedia Communication", place: "ISAMM", start: "2017", end: "2020" },
  { kind: "education" as const, title: "Master's in Media Engineering", place: "ISAMM", start: "2020", end: "2022" },
  { kind: "job" as const, title: "Frontend Developer", place: "Bertsch Innovation", start: "Aug 2020", end: "Feb 2022", app: "eprocat" as const },
  { kind: "job" as const, title: "Frontend Developer", place: "Opus Lab", start: "Feb 2022", end: "Feb 2023", app: "order" as const },
  { kind: "job" as const, title: "Fullstack Developer", place: "Global ENR", start: "Feb 2023", end: "Feb 2024", app: "order" as const },
  { kind: "job" as const, title: "Frontend Developer", place: "Uteek", start: "Feb 2024", end: "Dec 2024", app: "uteek" as const },
  { kind: "job" as const, title: "Fullstack Developer", place: "Educaro", start: "Jan 2025", end: "Present", app: "educaro" as const, now: true },
]
