// Who Seyf is. Facts come from the real CV (cv.md). The phone number is intentionally not here:
// it must never appear on the website.

export const profile = {
  name: "Seyf Mejri",
  title: "Fullstack JavaScript Developer",
  location: "Tunis, Tunisia",
  email: "mejri.seyf@gmail.com",
  linkedin: "https://www.linkedin.com/in/seyf-mejri-848a8416b",
  linkedinLabel: "linkedin.com/in/seyf-mejri-848a8416b",
  cvPdf: "/cv/Seyf-Mejri-CV.pdf",
  edition: "Open World Edition",

  /** The 5-second card above the map. */
  intro: "Fullstack JavaScript developer. 6 years building React/Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products.",
  summary:
    "Fullstack JavaScript developer with 6 years of experience building React/Next.js frontends and Node.js backends for SaaS, ERP, e-commerce and booking products. Recently led the full rebuild of a company CRM from AngularJS to React/TypeScript. Comfortable owning features end to end, from database design to UI and deployment.",

  hudLine: "6 YRS · 5 COMPANIES · TUNIS",
  careerStats: [
    { value: "6", label: "years" },
    { value: "5", label: "companies" },
    { value: "9", label: "projects" },
    { value: "3", label: "languages" },
  ],

  loadingTips: [
    "Tip: Seyf rebuilt an entire company CRM from AngularJS to React/TypeScript.",
    "Tip: His restaurant PWA is used by about 120 people to order from their phone.",
    "Tip: Recruiters can skip straight to the CV at any time.",
  ],

  /** Placeholder: replace with a real photo (any format) and update the path and size. */
  portrait: { src: "/images/intro/portrait.webp", alt: "Illustrated portrait of Seyf Mejri (placeholder)", width: 900, height: 1200 },
} as const
