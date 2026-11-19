// The career as missions on a stylized map of Greater Tunis. Briefings are the CV's own bullets.
// Never invent numbers: a metric without a value is a `TODO: add metric` placeholder (shown in
// development only). Marker positions are illustrative (district level), never real addresses.

export type Img = { src: string; alt: string; width: number; height: number }
/** A figure for the mission page. Leave `value` undefined until there is a real number. */
export type Metric = { label: string; value?: string }

/** Map coordinates use the world map's viewBox: 0 0 1600 1000. */
export type MapPoint = { x: number; y: number; district: DistrictId }

export type DistrictId =
  | "manouba"
  | "bardo"
  | "ariana"
  | "medina"
  | "lac"
  | "la-goulette"
  | "carthage"
  | "sidi-bou-said"
  | "la-marsa"
  | "ben-arous"

/** District label positions. The map draws its shapes around these. */
export const districts: Record<DistrictId, { name: string; x: number; y: number }> = {
  manouba: { name: "Manouba", x: 300, y: 560 },
  bardo: { name: "Le Bardo", x: 520, y: 520 },
  ariana: { name: "Ariana", x: 620, y: 270 },
  medina: { name: "Tunis Medina", x: 700, y: 610 },
  lac: { name: "Les Berges du Lac", x: 920, y: 450 },
  "la-goulette": { name: "La Goulette", x: 1130, y: 640 },
  carthage: { name: "Carthage", x: 1190, y: 420 },
  "sidi-bou-said": { name: "Sidi Bou Said", x: 1290, y: 300 },
  "la-marsa": { name: "La Marsa", x: 1250, y: 170 },
  "ben-arous": { name: "Ben Arous", x: 760, y: 830 },
}

export type Mission = {
  kind: "mission"
  slug: string
  number: string // "05"
  codename: string // "The Rebuild"
  company: string
  role: string
  dates: string
  location: string
  status: "COMPLETED" | "IN PROGRESS"
  objective: string
  briefing: string[]
  gear: string[]
  /** Shown one by one in the MISSION PASSED overlay. */
  skillsUnlocked: string[]
  metrics: Metric[]
  map: MapPoint
  /** The live product, if it is public. Shows a "Visit site" link on the card, briefing and page. */
  url?: string
  beforeAfter?: { before: Img; after: Img }
}

export type SideMission = {
  kind: "side"
  slug: string
  name: string
  client: "Personal" | "Client"
  tags: string[]
  objective: string
  description: string
  map: MapPoint
  url?: string
  swipeDemo?: boolean
}

export type Tutorial = { kind: "tutorial"; slug: string; number: string; degree: string; school: string; dates: string; map: MapPoint }
export type LockedMission = { kind: "locked"; slug: string; number: string; codename: string; teaser: string; map: MapPoint }


export const missions: Mission[] = [
  {
    kind: "mission",
    slug: "first-contract",
    number: "01",
    codename: "First Contract",
    company: "Bertsch Innovation",
    role: "Frontend Developer",
    dates: "Aug 2020 – Feb 2022",
    location: "Tunis, alongside Master's",
    status: "COMPLETED",
    objective: "Ship features for e-proCAT, a B2B product-catalog and data-classification SaaS, as part of an Agile team of five.",
    briefing: ["Developed features for e-proCAT, a B2B product-catalog and data-classification SaaS, in Angular 9 and TypeScript, in an Agile team of five."],
    gear: ["Angular", "TypeScript"],
    skillsUnlocked: ["Angular 9", "TypeScript", "Agile teamwork"],
    metrics: [
      { label: "Features shipped" }, // TODO: add metric
    ],
    map: { x: 610, y: 330, district: "ariana" },
  },
  {
    kind: "mission",
    slug: "table-service",
    number: "02",
    codename: "Table Service",
    company: "Opus Lab",
    role: "Frontend Developer",
    dates: "Feb 2022 – Feb 2023",
    location: "Tunis",
    status: "COMPLETED",
    objective: "Give restaurant owners a dashboard for their establishments, and their customers a QR-code menu with online payment.",
    briefing: ["Built an admin dashboard for restaurant owners to manage their establishments.", "Built a PWA for QR-code menu access and online payment."],
    gear: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    skillsUnlocked: ["React", "TypeScript", "PWAs", "Online payment"],
    metrics: [
      { label: "Restaurants using the dashboard" }, // TODO: add metric
      { label: "Orders paid online" }, // TODO: add metric
    ],
    map: { x: 700, y: 640, district: "medina" },
  },
  {
    kind: "mission",
    slug: "120-users",
    number: "03",
    codename: "120 Users",
    company: "Global ENR",
    role: "Fullstack Developer",
    dates: "Feb 2023 – Feb 2024",
    location: "Tunis",
    status: "COMPLETED",
    objective: "Get a restaurant ordering from their phones, and build the APIs behind an internal ERP.",
    briefing: [
      "Built a restaurant PWA used by about 120 people to order food and drinks from their phone.",
      "Designed and built the backend REST APIs of an internal ERP in Node.js, Express and MySQL, plus its HR, finance and marketing modules.",
    ],
    gear: ["React", "Tailwind CSS", "Node.js", "Express", "MySQL"],
    skillsUnlocked: ["Node.js", "Express", "MySQL", "REST API design", "PWAs"],
    metrics: [
      { label: "People ordering with the PWA", value: "About 120" },
      { label: "Orders per day" }, // TODO: add metric
      { label: "ERP endpoints or modules" }, // TODO: add metric
    ],
    map: { x: 770, y: 800, district: "ben-arous" },
  },
  {
    kind: "mission",
    slug: "book-it",
    number: "04",
    codename: "Book It",
    company: "Uteek",
    role: "Frontend Developer",
    dates: "Feb 2024 – Dec 2024",
    location: "Tunis",
    status: "COMPLETED",
    objective: "Build the booking and event-management screens of an event platform, on every screen size.",
    briefing: [
      "Built responsive booking and event-management interfaces for an event platform in React and Next.js.",
      "Managed server state and API data with React Query, handling caching, background refetching, and loading and error states.",
    ],
    gear: ["React", "Next.js", "React Query", "Tailwind CSS", "GitLab"],
    skillsUnlocked: ["Next.js", "React Query", "Caching", "Responsive UI"],
    metrics: [
      { label: "Bookings handled" }, // TODO: add metric
      { label: "Load time improvement from caching" }, // TODO: add metric
    ],
    map: { x: 1120, y: 600, district: "la-goulette" },
  },
  {
    kind: "mission",
    slug: "the-rebuild",
    number: "05",
    codename: "The Rebuild",
    company: "Educaro",
    role: "Fullstack Developer",
    dates: "Jan 2025 – Present",
    location: "Tunis",
    status: "IN PROGRESS",
    objective: "Rebuild the company CRM from scratch, from AngularJS to React and TypeScript, and run it in production.",
    briefing: [
      "Led the rebuild of the internal CRM from scratch, migrating from AngularJS to React/TypeScript; used daily company-wide across admissions, sales, support, recruiting, finance and teaching.",
      "Redesigned it mobile-first with a modern UI, animations and a shadcn/ui component library, and resolved the recurring bugs of the legacy app.",
      "Shipped new features the old system couldn't support and reworked login and authentication to strengthen security.",
      "Built REST APIs in Node.js and PHP on MongoDB and MySQL, and containerized the app with Docker.",
      "Set up GitLab CI/CD pipelines that deploy automatically to DigitalOcean and run database migrations on each release.",
    ],
    gear: ["React", "TypeScript", "shadcn/ui", "Node.js", "PHP", "MongoDB", "MySQL", "Docker", "DigitalOcean", "GitLab CI/CD"],
    skillsUnlocked: ["React + TypeScript", "shadcn/ui", "Auth & security", "Docker", "GitLab CI/CD", "DigitalOcean"],
    metrics: [
      { label: "Daily active users" }, // TODO: add metric
      { label: "Page load time, legacy vs new" }, // TODO: add metric
      { label: "Legacy bugs fixed" }, // TODO: add metric
      { label: "Deploys per month" }, // TODO: add metric
    ],
    map: { x: 930, y: 470, district: "lac" },
    beforeAfter: {
      before: { src: "/images/missions/the-rebuild-legacy.webp", alt: "Illustration of the legacy AngularJS CRM: dense tables and cramped forms", width: 1600, height: 1000 },
      after: { src: "/images/missions/the-rebuild-new.webp", alt: "Illustration of the new React CRM: clear navigation and cards", width: 1600, height: 1000 },
    },
  },
]

export const lockedMission: LockedMission = {
  kind: "locked",
  slug: "your-team",
  number: "06",
  codename: "Your Team?",
  teaser: "Next mission locked. Send Seyf a message to unlock it.",
  map: { x: 1300, y: 330, district: "sidi-bou-said" },
}

export const tutorials: Tutorial[] = [
  { kind: "tutorial", slug: "tutorial-1", number: "1", degree: "Bachelor's in Multimedia Communication", school: "ISAMM, Tunis", dates: "2017 – 2020", map: { x: 290, y: 600, district: "manouba" } },
  { kind: "tutorial", slug: "tutorial-2", number: "2", degree: "Master's in Media Engineering (Web Development)", school: "ISAMM Manouba", dates: "2020 – 2022", map: { x: 370, y: 520, district: "manouba" } },
]


export const sideMissions: SideMission[] = [
  {
    kind: "side",
    slug: "fripa",
    name: "Fripa",
    client: "Personal",
    tags: ["Personal", "E-commerce"],
    objective: "Make secondhand shopping in Tunisia as quick as a swipe.",
    description: "Online secondhand clothing store in Tunisia with a swipe-to-shop interface.",
    map: { x: 1230, y: 200, district: "la-marsa" },
    url: "https://fripa.shop/",
    swipeDemo: true,
  },
  {
    kind: "side",
    slug: "febal-casa-usa",
    name: "Febal Casa USA",
    client: "Client",
    tags: ["Client", "Website"],
    objective: "Present an Italian furniture and interior-design brand to the US market.",
    description: "Website for an Italian furniture and interior-design brand in the US.",
    map: { x: 1210, y: 450, district: "carthage" },
    url: "https://www.febalcasa.com/it/",
  },
  {
    kind: "side",
    slug: "aurelia-gloves",
    name: "Aurelia Gloves",
    client: "Client",
    tags: ["Client", "Product site"],
    objective: "Give a US brand of professional disposable gloves a clear product site.",
    description: "Product site for a US brand of professional disposable gloves.",
    map: { x: 1050, y: 700, district: "la-goulette" },
    url: "https://www.aureliagloves.com/",
  },
  {
    kind: "side",
    slug: "weedy",
    name: "Weedy",
    client: "Client",
    tags: ["Client", "E-commerce"],
    objective: "Build an online store for a French e-commerce client.",
    description: "E-commerce store for a French client.",
    map: { x: 1330, y: 520, district: "carthage" },
    url: "https://weedy.fr/",
  },
]

/** Every page under /missions/[slug]: the five jobs, then the side missions. */
export const missionPages = [...missions, ...sideMissions]
export const missionBySlug = (slug: string) => missionPages.find((m) => m.slug === slug)

/** Main missions in story order, for previous / next links. */
export const storyOrder = missions

export const currentMission = missions[missions.length - 1]
