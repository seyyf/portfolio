// Career, newest first, from cv.md. Each job is an "edition" in the archive.

export type Job = {
  company: string
  role: string
  start: string
  end: string
  location: string
  stories: string[]
  stack: string[]
  /** Article about this job, if there is one. */
  slug?: string
}

export const jobs: Job[] = [
  {
    company: "Educaro",
    role: "Fullstack Developer",
    start: "Jan 2025",
    end: "Present",
    location: "Tunis",
    stories: [
      "Led the rebuild of the internal CRM from scratch, migrating from AngularJS to React/TypeScript; used daily company-wide.",
      "Redesigned it mobile-first with shadcn/ui and animations, and reworked login and authentication.",
      "REST APIs in Node.js and PHP; Docker; GitLab CI/CD deploying to DigitalOcean with migrations on each release.",
    ],
    stack: ["React", "TypeScript", "shadcn/ui", "Node.js", "PHP", "MongoDB", "MySQL", "Docker", "DigitalOcean", "GitLab CI/CD"],
    slug: "educaro-crm",
  },
  {
    company: "Uteek",
    role: "Frontend Developer",
    start: "Feb 2024",
    end: "Dec 2024",
    location: "Tunis",
    stories: [
      "Built responsive booking and event-management interfaces in React and Next.js.",
      "Managed server state with React Query: caching, background refetching, loading and error states.",
    ],
    stack: ["React", "Next.js", "React Query", "Tailwind CSS", "GitLab"],
    slug: "uteek-events",
  },
  {
    company: "Global ENR",
    role: "Fullstack Developer",
    start: "Feb 2023",
    end: "Feb 2024",
    location: "Tunis",
    stories: [
      "Built a restaurant PWA used by about 120 people to order food and drinks from their phone.",
      "Designed and built the backend REST APIs of an internal ERP in Node.js, Express and MySQL, plus its HR, finance and marketing modules.",
    ],
    stack: ["React", "Tailwind CSS", "Node.js", "Express", "MySQL", "GitHub"],
    slug: "restaurant-ordering",
  },
  {
    company: "Opus Lab",
    role: "Frontend Developer",
    start: "Feb 2022",
    end: "Feb 2023",
    location: "Tunis",
    stories: ["Built an admin dashboard for restaurant owners to manage their establishments.", "Built a PWA for QR-code menu access and online payment."],
    stack: ["React", "TypeScript", "Tailwind CSS", "REST APIs"],
    slug: "restaurant-ordering",
  },
  {
    company: "Bertsch Innovation",
    role: "Frontend Developer",
    start: "Aug 2020",
    end: "Feb 2022",
    location: "Tunis (alongside Master's)",
    stories: ["Developed features for e-proCAT, a B2B product-catalog and data-classification SaaS, in Angular 9 and TypeScript, in an Agile team of five."],
    stack: ["Angular 9", "TypeScript"],
    slug: "e-procat",
  },
]

export const education = [
  { degree: "Master's in Media Engineering (Web Development)", school: "ISAMM, Manouba", years: "2020 – 2022" },
  { degree: "Bachelor's in Multimedia Communication", school: "ISAMM, Tunis", years: "2017 – 2020" },
]
