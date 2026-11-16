// Who Seyf is, in one place. Facts come from cv.md (the real CV). The phone number is intentionally
// not here: it must never appear on the website.

export const profile = {
  name: "Seyf Mejri",
  firstName: "Seyf",
  title: "Fullstack JavaScript Developer",
  location: "Tunis, Tunisia",
  yearsShipping: 6,
  companies: 5,
  currentVersion: "v5.0",
  email: "mejri.seyf@gmail.com",
  linkedin: "https://www.linkedin.com/in/seyf-mejri-848a8416b",
  linkedinLabel: "linkedin.com/in/seyf-mejri-848a8416b",
  cvPdf: "/cv/Seyf-Mejri-CV.pdf",
  /** Replace with the real domain once deployed (canonical URLs, Open Graph, sitemap, JSON-LD). */
  siteUrl: "https://example.com",
  copyrightYear: 2026,

  headline: "Fullstack JavaScript developer. I ship products end to end.",
  sub: "React/Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products. Currently v5.0 at Educaro, where I led the full rebuild of the company CRM.",
  summary:
    "Fullstack JavaScript developer with 6 years of experience building React/Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products. Recently led the full rebuild of a company CRM from AngularJS to React/TypeScript. Comfortable owning features end to end, from database design to UI and deployment.",
  atAGlance: ["6 yrs", "5 companies", "React · Next.js · Node.js", "AR · EN · FR"],
  availability: "Open to new opportunities · Based in Tunis · Open to remote.",

  /** Placeholder: replace public/images/portrait.svg with a real photo and update the path and size. */
  portrait: { src: "/images/portrait.svg", alt: "Portrait of Seyf Mejri (placeholder)", width: 640, height: 640 },
} as const

export const nav = [
  { label: "Releases", href: "/#releases" },
  { label: "Projects", href: "/#projects" },
  { label: "Stack", href: "/#stack" },
  { label: "Contact", href: "/#contact" },
] as const
