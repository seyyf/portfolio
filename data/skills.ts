// Skills as package.json groups. No versions, no percentages, no proficiency scores.

export const skills = {
  frontend: ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "React Query", "Tailwind CSS", "shadcn/ui", "PWAs"],
  backend: ["Node.js", "Express", "NestJS", "PHP", "REST APIs"],
  databases: ["PostgreSQL", "MongoDB", "MySQL"],
  devops: ["Docker", "GitLab CI/CD", "DigitalOcean"],
  tools: ["Git (GitHub, GitLab, Bitbucket)", "AI-assisted development (Claude, Codex, OpenAI API)"],
} as const

export const locales = [
  { code: "ar", language: "Arabic", level: "native" },
  { code: "en", language: "English", level: "C1" },
  { code: "fr", language: "French", level: "B2" },
] as const

/** Plain-English headings for the chip list under the package.json card. */
export const skillGroupLabels: Record<keyof typeof skills | "locales", string> = {
  frontend: "Frontend",
  backend: "Backend",
  databases: "Databases",
  devops: "DevOps",
  tools: "Tools",
  locales: "Languages",
}
