// All site copy, sourced from cv.md. Facts must stay traceable to the CV.
// Placeholders the owner still needs to fill are marked with PLACEHOLDER.

export const PLACEHOLDER = {
  link: "[ADD LINK]",
  screenshot: "[ADD SCREENSHOT]",
} as const

export const profile = {
  name: "Seyf Mejri",
  initials: "SM",
  title: "Fullstack JavaScript Developer",
  location: "Tunis, Tunisia",
  email: "mejri.seyf@gmail.com",
  linkedin: "https://www.linkedin.com/in/seyf-mejri-848a8416b",
  pitch:
    "6 years building React and Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products.",
  // PLACEHOLDER: replace with the real domain before deploying (used for SEO and Open Graph URLs)
  siteUrl: "https://example.com",
}

export const about = {
  heading: "From database design to deployment.",
  paragraphs: [
    "I’m a fullstack JavaScript developer with 6 years of experience across SaaS, ERP, e-commerce and booking products. Most recently I led the full rebuild of Educaro’s CRM from AngularJS to React and TypeScript.",
    "I like owning features end to end, and I use AI tooling to ship faster without cutting corners on quality.",
  ],
  facts: [
    { label: "Experience", value: "6 years" },
    { label: "Focus", value: "React, Next.js, Node.js" },
    { label: "Education", value: "Master’s in Media Engineering" },
  ],
}

export const caseStudy = {
  heading: "Case study: rebuilding the Educaro CRM.",
  lead: "Fullstack Developer at Educaro, Jan 2025 - Present. An internal CRM used every day by staff across 6 departments.",
  migration: { from: "AngularJS", to: "React + TypeScript", caption: "Full rebuild from scratch" },
  stats: [
    { value: "70", label: "staff use it daily" },
    { value: "6", label: "departments" },
  ],
  problem:
    "Educaro’s internal CRM ran on AngularJS. It had recurring bugs and couldn’t support the features the team needed, while 70 staff in admissions, sales, support, recruiting, finance and teaching relied on it daily.",
  actions: [
    { title: "Rebuilt from scratch", body: "Led the migration from AngularJS to React and TypeScript." },
    {
      title: "Mobile-first redesign",
      body: "A modern UI with animations, built on a shadcn/ui component library.",
    },
    { title: "Secure authentication", body: "Reworked login and authentication to strengthen security." },
    { title: "APIs and data", body: "REST APIs in Node.js and PHP on MongoDB and MySQL." },
    {
      title: "Delivery",
      body: "Containerized with Docker. GitLab CI/CD deploys to DigitalOcean and runs database migrations on every release.",
    },
  ],
  result:
    "A React and TypeScript CRM that 70 staff use daily, with the legacy app’s recurring bugs resolved and new features the old system couldn’t support.",
  stack: [
    "React",
    "TypeScript",
    "shadcn/ui",
    "Node.js",
    "PHP",
    "MongoDB",
    "MySQL",
    "Docker",
    "DigitalOcean",
    "GitLab CI/CD",
  ],
}

export type Role = {
  role: string
  company: string
  start: string
  end: string
  location: string
  current?: boolean
  points: string[]
  stack: string[]
  caseStudyLink?: boolean
}

export const experience: Role[] = [
  {
    role: "Fullstack Developer",
    company: "Educaro",
    start: "Jan 2025",
    end: "Present",
    location: "Tunis",
    current: true,
    points: [
      "Led the rebuild of the internal CRM from AngularJS to React and TypeScript, used daily by 70 staff across 6 departments.",
      "Covered the mobile-first UI, authentication, REST APIs in Node.js and PHP, Docker, and GitLab CI/CD to DigitalOcean.",
    ],
    stack: ["React", "TypeScript", "shadcn/ui", "Node.js", "PHP", "MongoDB", "MySQL", "Docker", "DigitalOcean", "GitLab CI/CD"],
    caseStudyLink: true,
  },
  {
    role: "Frontend Developer",
    company: "Uteek",
    start: "Feb 2024",
    end: "Dec 2024",
    location: "Tunis",
    points: [
      "Built responsive booking and event-management interfaces for an event platform in React and Next.js.",
      "Managed server state and API data with React Query: caching, background refetching, and loading and error states.",
    ],
    stack: ["React", "Next.js", "React Query", "Tailwind CSS", "GitLab"],
  },
  {
    role: "Fullstack Developer",
    company: "Global ENR",
    start: "Feb 2023",
    end: "Feb 2024",
    location: "Tunis",
    points: [
      "Built a restaurant PWA used by about 120 people to order food and drinks from their phone.",
      "Designed and built the backend REST APIs of an internal ERP in Node.js, Express and MySQL, plus its HR, finance and marketing modules.",
    ],
    stack: ["React", "Tailwind CSS", "Node.js", "Express", "MySQL", "GitHub"],
  },
  {
    role: "Frontend Developer",
    company: "Opus Lab",
    start: "Feb 2022",
    end: "Feb 2023",
    location: "Tunis",
    points: [
      "Built an admin dashboard for restaurant owners to manage their establishments.",
      "Built a PWA for QR-code menu access and online payment.",
    ],
    stack: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
  },
  {
    role: "Frontend Developer",
    company: "Bertsch Innovation",
    start: "Aug 2020",
    end: "Feb 2022",
    location: "Tunis, alongside my Master’s",
    points: [
      "Developed features for e-proCAT, a B2B product-catalog and data-classification SaaS, in Angular 9 and TypeScript, in an Agile team of 5.",
    ],
    stack: ["Angular 9", "TypeScript"],
  },
]

export type Project = {
  name: string
  description: string
  kind: string
  // PLACEHOLDER: set the live URL; leave empty to show [ADD LINK]
  url: string
  // PLACEHOLDER: path under /public, e.g. "/projects/febal-casa.jpg"; leave empty to show [ADD SCREENSHOT]
  image: string
}

export const projects: Project[] = [
  {
    name: "Febal Casa USA",
    description: "Website for an Italian furniture and interior-design brand in the US.",
    kind: "Website",
    url: "",
    image: "",
  },
  {
    name: "Aurelia Gloves",
    description: "Product site for a US brand of professional disposable gloves.",
    kind: "Product site",
    url: "",
    image: "",
  },
  {
    name: "Weedy",
    description: "E-commerce store selling CBD products in France.",
    kind: "E-commerce",
    url: "",
    image: "",
  },
]

export const skills = {
  frontend: [
    "JavaScript",
    "TypeScript",
    "React",
    "Next.js",
    "Vue.js",
    "Angular",
    "React Query",
    "Tailwind CSS",
    "shadcn/ui",
    "PWAs",
  ],
  backend: ["Node.js", "Express", "NestJS", "PHP", "REST APIs"],
  databases: ["PostgreSQL", "MongoDB", "MySQL"],
  devops: ["Docker", "GitLab CI/CD", "DigitalOcean"],
  tools: [
    { label: "Git", items: ["GitHub", "GitLab", "Bitbucket"] },
    { label: "AI-assisted development", items: ["Claude", "Codex", "OpenAI API"] },
  ],
}

export const education = [
  {
    degree: "Master’s in Media Engineering (Web Development)",
    school: "ISAMM, Manouba",
    years: "2020 - 2022",
  },
  {
    degree: "Bachelor’s in Multimedia Communication",
    school: "ISAMM, Tunis",
    years: "2017 - 2020",
  },
]

export const languages = [
  { name: "Arabic", level: "Native" },
  { name: "English", level: "C1" },
  { name: "French", level: "B2" },
]
