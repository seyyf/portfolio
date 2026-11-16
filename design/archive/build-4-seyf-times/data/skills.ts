import { jobs } from "@/data/career"

// Skills as the financial pages. No invented proficiency numbers: the only figure shown is how many
// of Seyf's roles used the skill (counted from data/career.ts stacks). Sparklines are decorative.

export type Skill = { name: string; detail?: string; note: string; roles: number }
export type Index = { id: string; title: string; skills: Skill[] }

/** Matches a skill to the stack names used on the CV ("Angular" also matches "Angular 9"). */
const ALIASES: Record<string, string[]> = {
  Angular: ["Angular", "Angular 9"],
  Git: ["GitHub", "GitLab", "Bitbucket", "GitLab CI/CD"],
  JavaScript: ["React", "Angular 9", "Node.js", "Next.js"],
}

function rolesUsing(skill: string) {
  const names = ALIASES[skill] ?? [skill]
  return jobs.filter((j) => j.stack.some((s) => names.includes(s))).length
}

function noteFor(skill: string, roles: number) {
  if (roles === 0) return "In the toolbox"
  const current = jobs[0].stack.some((s) => (ALIASES[skill] ?? [skill]).includes(s))
  if (current) return "Daily use"
  return "Production experience"
}

const make = (name: string, detail?: string): Skill => {
  const roles = rolesUsing(name)
  return { name, detail, roles, note: noteFor(name, roles) }
}

export const indices: Index[] = [
  {
    id: "frontend",
    title: "Frontend Index",
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "React Query", "Tailwind CSS", "shadcn/ui", "PWAs"].map((n) => make(n)),
  },
  { id: "backend", title: "Backend Index", skills: ["Node.js", "Express", "NestJS", "PHP", "REST APIs"].map((n) => make(n)) },
  { id: "databases", title: "Database Exchange", skills: ["PostgreSQL", "MongoDB", "MySQL"].map((n) => make(n)) },
  { id: "devops", title: "DevOps Board", skills: ["Docker", "GitLab CI/CD", "DigitalOcean"].map((n) => make(n)) },
  {
    id: "tools",
    title: "Tools",
    skills: [make("Git", "GitHub, GitLab, Bitbucket"), { name: "AI-assisted development", detail: "Claude, Codex, OpenAI API", roles: 0, note: "In the toolbox" }],
  },
  {
    id: "languages",
    title: "Languages",
    skills: [
      { name: "Arabic", detail: "Native", roles: 0, note: "Native" },
      { name: "English", detail: "C1", roles: 0, note: "Professional (C1)" },
      { name: "French", detail: "B2", roles: 0, note: "Working (B2)" },
    ],
  },
]

/** PWAs appear on the CV as product work rather than in a stack list. */
for (const s of indices[0].skills) {
  if (s.name === "PWAs") {
    s.roles = 2
    s.note = "Production experience"
  }
}

/** The five skills used in the most roles, for the front page "Markets" preview. */
export const topSkills = indices
  .slice(0, 4)
  .flatMap((i) => i.skills)
  .sort((a, b) => b.roles - a.roles)
  .slice(0, 5)

/** Running ticker across the top of the Markets page. */
export const skillTicker = indices.slice(0, 4).flatMap((i) => i.skills.filter((s) => s.roles > 0).map((s) => `${s.name} ▲ ${s.roles}`))
