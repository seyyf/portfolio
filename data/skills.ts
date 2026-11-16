import { missions } from "@/data/missions"

// Skills for the Stats page. No percentages, no numeric ratings: each skill gets a plain status
// derived from the CV — "Daily use" (in the current job's stack), "Production" (used in an earlier
// job), or "Experienced" (in the toolbox). The segmented bar is decorative and follows the status.

export type SkillStatus = "Daily use" | "Production" | "Experienced" | "Native" | "C1" | "B2"
export type Skill = { name: string; status: SkillStatus }
export type StatTab = { id: string; label: string; skills: Skill[] }

const ALIASES: Record<string, string[]> = {
  Angular: ["Angular"],
  JavaScript: ["React", "Angular", "Node.js", "Next.js"],
  PWAs: [],
  "Git (GitHub, GitLab, Bitbucket)": ["GitHub", "GitLab", "GitLab CI/CD"],
}
const current = missions.find((m) => m.status === "IN PROGRESS")!

function statusOf(name: string): SkillStatus {
  const names = ALIASES[name] ?? [name]
  if (current.gear.some((g) => names.includes(g))) return "Daily use"
  if (name === "PWAs") return "Production" // the Opus Lab and Global ENR PWAs
  if (missions.some((m) => m.gear.some((g) => names.includes(g)))) return "Production"
  return "Experienced"
}

const tab = (id: string, label: string, names: string[]): StatTab => ({ id, label, skills: names.map((name) => ({ name, status: statusOf(name) })) })

export const statTabs: StatTab[] = [
  tab("frontend", "Frontend", ["JavaScript", "TypeScript", "React", "Next.js", "Vue.js", "Angular", "React Query", "Tailwind CSS", "shadcn/ui", "PWAs"]),
  tab("backend", "Backend", ["Node.js", "Express", "NestJS", "PHP", "REST APIs"]),
  tab("databases", "Databases", ["PostgreSQL", "MongoDB", "MySQL"]),
  tab("devops", "DevOps", ["Docker", "GitLab CI/CD", "DigitalOcean"]),
  tab("tools", "Tools", ["Git (GitHub, GitLab, Bitbucket)", "AI-assisted development (Claude, Codex, OpenAI API)"]),
  {
    id: "languages",
    label: "Languages",
    skills: [
      { name: "Arabic", status: "Native" },
      { name: "English", status: "C1" },
      { name: "French", status: "B2" },
    ],
  },
]

/** How many of the 5 bar segments light up, by status (decorative, mirrors the label). */
export const segmentsFor: Record<SkillStatus, number> = { "Daily use": 5, Production: 4, Experienced: 3, Native: 5, C1: 4, B2: 3 }
