// Every project as a newspaper article. Facts come from cv.md and the Seyf Times brief; headlines,
// decks and pull quotes are editorial summaries of those facts (no invented numbers).
//
// TODO markers: `todo` lists the real numbers worth adding to each story (users, load time, bugs
// fixed...). They show as "TODO: add metric" boxes in development only, never on the live site.

export type Category = "fullstack" | "frontend" | "ecommerce" | "saas"

export const categories: { id: Category | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "fullstack", label: "Fullstack" },
  { id: "frontend", label: "Frontend" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "saas", label: "SaaS" },
]

export type Img = { src: string; alt: string; width: number; height: number; caption?: string }

export type Project = {
  slug: string
  /** Short name used in lists, e.g. "Educaro CRM". */
  name: string
  /** Section label above the headline, e.g. "FRIPA". */
  kicker: string
  headline: string
  /** Subheadline. */
  deck: string
  /** One or two lines for story cards. */
  summary: string
  /** Byline details: role(s) and dates. Empty for client sites with no role on the CV. */
  roles: { title: string; company: string; period: string }[]
  categories: Category[]
  problem: string[]
  built: string[]
  result: string[]
  stack: string[]
  pullQuote: string
  hero: Img
  gallery: Img[]
  /** Live site; empty until there is one (the button hides). */
  url: string
  /** Special interactive block inside the article. */
  extra?: "beforeAfter" | "swipe"
  /** Real numbers to add to the story (shown as TODO boxes in development only). */
  todo: string[]
}

const placeholder = (slug: string, label: string): Img => ({
  src: `/images/news/${slug}.svg`,
  alt: `${label} (placeholder image, replace with a real screenshot)`,
  width: 1600,
  height: 1000,
})

export const projects: Project[] = [
  {
    slug: "educaro-crm",
    name: "Educaro CRM",
    kicker: "Exclusive · Case study",
    headline: "Tunis Developer Rebuilds Company's Entire CRM From Scratch",
    deck: "Seyf Mejri led the move from a legacy AngularJS system to a modern React and TypeScript app now used every day by admissions, sales, support, recruiting, finance and teaching.",
    summary: "The internal CRM, rebuilt from AngularJS to React/TypeScript and used daily company-wide.",
    roles: [{ title: "Fullstack Developer", company: "Educaro", period: "Jan 2025 – Present" }],
    categories: ["fullstack", "saas"],
    problem: [
      "Educaro's internal CRM ran on AngularJS. The legacy app had recurring bugs and couldn't support the features the teams needed, while every department relied on it daily.",
    ],
    built: [
      "Led the rebuild of the internal CRM from scratch, migrating from AngularJS to React/TypeScript.",
      "Redesigned it mobile-first with a modern UI, animations and a shadcn/ui component library, and resolved the recurring bugs of the legacy app.",
      "Shipped new features the old system couldn't support and reworked login and authentication to strengthen security.",
      "Built REST APIs in Node.js and PHP on MongoDB and MySQL, and containerized the app with Docker.",
      "Set up GitLab CI/CD pipelines that deploy automatically to DigitalOcean and run database migrations on each release.",
    ],
    result: ["The new CRM is used daily company-wide, across admissions, sales, support, recruiting, finance and teaching."],
    stack: ["React", "TypeScript", "shadcn/ui", "Node.js", "PHP", "MongoDB", "MySQL", "Docker", "DigitalOcean", "GitLab CI/CD"],
    pullQuote: "One CRM, rebuilt from scratch, opened every day by every department.",
    hero: { ...placeholder("educaro-crm", "The new Educaro CRM"), caption: "The rebuilt CRM, designed mobile-first." },
    gallery: [
      { src: "/images/educaro-before.svg", alt: "Illustration of the old AngularJS CRM: dense tables and cramped forms", width: 1600, height: 1000, caption: "Before: the legacy AngularJS system (illustration)." },
      { src: "/images/educaro-after.svg", alt: "Illustration of the new React CRM: clean cards, clear navigation, mobile-first", width: 1600, height: 1000, caption: "After: the new React and TypeScript CRM (illustration)." },
    ],
    url: "",
    extra: "beforeAfter",
    todo: ["Number of daily users", "Bugs fixed from the legacy app", "Load time before vs after", "Deploys per month with CI/CD"],
  },
  {
    slug: "fripa",
    name: "Fripa",
    kicker: "Fripa",
    headline: "Swipe Right on Fashion: The Thrift Store That Shops Like a Dating App",
    deck: "A personal project: an online secondhand clothing store in Tunisia where you browse by swiping, one piece at a time.",
    summary: "Online secondhand clothing store in Tunisia with a swipe-to-shop interface.",
    roles: [{ title: "Personal project", company: "Fripa", period: "" }],
    categories: ["ecommerce", "frontend"],
    problem: [],
    built: ["An online secondhand clothing store in Tunisia with a swipe-to-shop interface: right to keep, left to pass."],
    result: [],
    stack: [],
    pullQuote: "Shopping secondhand, one swipe at a time.",
    hero: { ...placeholder("fripa", "Fripa"), caption: "Fripa's swipe-to-shop interface." },
    gallery: [],
    url: "",
    extra: "swipe",
    todo: ["Tech stack used", "Number of listed items or users"],
  },
  {
    slug: "restaurant-ordering",
    name: "Restaurant ordering",
    kicker: "Restaurants",
    headline: "120 Diners Now Order From Their Phones",
    deck: "At Global ENR, a restaurant PWA used by about 120 people; at Opus Lab, an admin dashboard for owners and a QR-code menu with online payment.",
    summary: "A restaurant PWA used by about 120 people, plus a dashboard and QR-code menu with online payment.",
    roles: [
      { title: "Fullstack Developer", company: "Global ENR", period: "Feb 2023 – Feb 2024" },
      { title: "Frontend Developer", company: "Opus Lab", period: "Feb 2022 – Feb 2023" },
    ],
    categories: ["fullstack", "frontend"],
    problem: [],
    built: [
      "Global ENR: built a restaurant PWA used by about 120 people to order food and drinks from their phone.",
      "Opus Lab: built an admin dashboard for restaurant owners to manage their establishments.",
      "Opus Lab: built a PWA for QR-code menu access and online payment.",
    ],
    result: ["About 120 people order food and drinks from their phones with the Global ENR PWA."],
    stack: ["React", "TypeScript", "Tailwind CSS", "Node.js", "Express", "MySQL", "REST APIs", "GitHub"],
    pullQuote: "Scan, pick, pay: the menu now lives in your pocket.",
    hero: { ...placeholder("restaurant-ordering", "Restaurant ordering app"), caption: "Ordering from the table, on a phone." },
    gallery: [],
    url: "",
    todo: ["Orders per day", "Average order time"],
  },
  {
    slug: "uteek-events",
    name: "Uteek Events",
    kicker: "Events",
    headline: "Booking an Event, Reimagined",
    deck: "Responsive booking and event-management interfaces in React and Next.js, with live data kept fresh by React Query.",
    summary: "Booking and event-management interfaces in React and Next.js, with React Query.",
    roles: [{ title: "Frontend Developer", company: "Uteek", period: "Feb 2024 – Dec 2024" }],
    categories: ["frontend", "saas"],
    problem: [],
    built: [
      "Built responsive booking and event-management interfaces for an event platform in React and Next.js.",
      "Managed server state and API data with React Query, handling caching, background refetching, and loading and error states.",
    ],
    result: [],
    stack: ["React", "Next.js", "React Query", "Tailwind CSS", "GitLab"],
    pullQuote: "Fresh data, fast screens, no spinner in sight.",
    hero: { ...placeholder("uteek-events", "Uteek event booking"), caption: "Event booking interfaces built for Uteek." },
    gallery: [],
    url: "",
    todo: ["Bookings handled", "Performance improvement from caching"],
  },
  {
    slug: "internal-erp",
    name: "Internal ERP",
    kicker: "ERP",
    headline: "Inside the Internal ERP Powering HR, Finance and Marketing",
    deck: "At Global ENR, Seyf designed and built the backend REST APIs of an internal ERP in Node.js, Express and MySQL, plus its HR, finance and marketing modules.",
    summary: "Backend REST APIs of an internal ERP, with HR, finance and marketing modules.",
    roles: [{ title: "Fullstack Developer", company: "Global ENR", period: "Feb 2023 – Feb 2024" }],
    categories: ["fullstack", "saas"],
    problem: [],
    built: ["Designed and built the backend REST APIs of an internal ERP in Node.js, Express and MySQL, plus its HR, finance and marketing modules."],
    result: [],
    stack: ["Node.js", "Express", "MySQL", "React", "Tailwind CSS", "GitHub"],
    pullQuote: "Three departments, one backend underneath them.",
    hero: { ...placeholder("internal-erp", "Internal ERP"), caption: "The ERP's HR, finance and marketing modules." },
    gallery: [],
    url: "",
    todo: ["Number of endpoints or modules", "Teams using it"],
  },
  {
    slug: "febal-casa-usa",
    name: "Febal Casa USA",
    kicker: "International",
    headline: "Italian Design Lands in the US",
    deck: "A website for an Italian furniture and interior-design brand in the US.",
    summary: "Website for an Italian furniture and interior-design brand in the US.",
    roles: [],
    categories: ["frontend"],
    problem: [],
    built: ["Website for an Italian furniture and interior-design brand in the US."],
    result: [],
    stack: [],
    pullQuote: "Italian craft, presented for an American audience.",
    hero: { ...placeholder("febal-casa-usa", "Febal Casa USA website"), caption: "Febal Casa USA." },
    gallery: [],
    url: "",
    todo: ["Your role and dates", "Tech stack", "Live URL"],
  },
  {
    slug: "aurelia-gloves",
    name: "Aurelia Gloves",
    kicker: "Business",
    headline: "Gloves, Going Digital",
    deck: "A product site for a US brand of professional disposable gloves.",
    summary: "Product site for a US brand of professional disposable gloves.",
    roles: [],
    categories: ["frontend"],
    problem: [],
    built: ["Product site for a US brand of professional disposable gloves."],
    result: [],
    stack: [],
    pullQuote: "A professional product, given a clear home online.",
    hero: { ...placeholder("aurelia-gloves", "Aurelia Gloves website"), caption: "Aurelia Gloves." },
    gallery: [],
    url: "",
    todo: ["Your role and dates", "Tech stack", "Live URL"],
  },
  {
    slug: "weedy",
    name: "Weedy",
    kicker: "Europe",
    headline: "A French E-Commerce Launch",
    deck: "An e-commerce store selling CBD products in France.",
    summary: "E-commerce store selling CBD products in France.",
    roles: [],
    categories: ["ecommerce"],
    problem: [],
    built: ["E-commerce store selling CBD products in France."],
    result: [],
    stack: [],
    pullQuote: "A storefront built for the French market.",
    hero: { ...placeholder("weedy", "Weedy e-commerce store"), caption: "Weedy." },
    gallery: [],
    url: "",
    todo: ["Your role and dates", "Tech stack", "Live URL"],
  },
  {
    slug: "e-procat",
    name: "e-proCAT",
    kicker: "SaaS",
    headline: "Where It All Started: A B2B Catalog Platform",
    deck: "At Bertsch Innovation, Seyf developed features for e-proCAT, a B2B product-catalog and data-classification SaaS, alongside his Master's.",
    summary: "Features for a B2B product-catalog and data-classification SaaS in Angular 9.",
    roles: [{ title: "Frontend Developer", company: "Bertsch Innovation", period: "Aug 2020 – Feb 2022" }],
    categories: ["frontend", "saas"],
    problem: [],
    built: ["Developed features for e-proCAT, a B2B product-catalog and data-classification SaaS, in Angular 9 and TypeScript, in an Agile team of five."],
    result: [],
    stack: ["Angular 9", "TypeScript"],
    pullQuote: "The first job, the first team of five, the first shipped features.",
    hero: { ...placeholder("e-procat", "e-proCAT catalog platform"), caption: "e-proCAT, a B2B product catalog." },
    gallery: [],
    url: "",
    todo: ["Features you shipped", "Number of catalog products or clients"],
  },
]

export const projectBySlug = Object.fromEntries(projects.map((p) => [p.slug, p])) as Record<string, Project>
export const leadStory = projectBySlug["educaro-crm"]
/** "More Stories" on the front page, in this order. */
export const moreStories = ["fripa", "restaurant-ordering", "uteek-events", "internal-erp", "febal-casa-usa", "aurelia-gloves", "weedy", "e-procat"].map(
  (s) => projectBySlug[s]
)
