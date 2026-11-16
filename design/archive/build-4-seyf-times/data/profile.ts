// Who Seyf is. Facts come from cv.md (synced with Seyf's real CV). Edit freely; components only read from here.

export const profile = {
  name: "Seyf Mejri",
  firstName: "Seyf",
  title: "Fullstack JavaScript Developer",
  yearsExperience: 6,
  companies: 5,
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
  /** Short bio for "Who is Seyf?" */
  bio: "Fullstack JavaScript developer building React/Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products. Comfortable owning features end to end, from database design to UI and deployment.",
  summary:
    "Fullstack JavaScript developer with 6 years of experience building React/Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products. Recently led the full rebuild of a company CRM from AngularJS to React/TypeScript. Comfortable owning features end to end, from database design to UI and deployment.",
  /** Placeholder portrait: replace /public/images/portrait.svg with a real photo (any format, update the path). */
  portrait: { src: "/images/portrait.svg", alt: "Portrait of Seyf Mejri (placeholder)", width: 800, height: 1000 },
}

export const paper = {
  name: "The Seyf Times",
  motto: "All the code that's fit to ship.",
  edition: "Edition No. 6 — six years in tech",
  footer: "Printed in Tunis · Built with Next.js, GSAP and too much coffee",
}

/** Breaking news ticker on the front page. */
export const breakingNews = [
  "Educaro CRM fully rebuilt from AngularJS to React/TypeScript",
  "Now used daily across every department",
  "6 years building SaaS, ERP, e-commerce and booking products",
  "Restaurant ordering app used by ~120 people",
  "Open to new opportunities",
]

export const atAGlance = [
  { label: "Experience", value: "6 years" },
  { label: "Companies", value: "5" },
  { label: "Focus", value: "Fullstack (React, Next.js, Node.js)" },
  { label: "Languages", value: "Arabic, English, French" },
]

/** Sections in the top navigation. */
export const sections = [
  { href: "/", label: "Front Page" },
  { href: "/projects", label: "Projects" },
  { href: "/career", label: "Career" },
  { href: "/skills", label: "Markets" },
  { href: "/contact", label: "Classifieds" },
] as const
