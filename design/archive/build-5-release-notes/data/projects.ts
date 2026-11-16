// Side releases: projects outside the main career line. Add a `url` when a project is live and the
// card shows a link to it.

export type ProjectTag = "Personal" | "Client" | "E-commerce"

export type Project = {
  slug: string
  name: string
  description: string
  tags: ProjectTag[]
  image: { src: string; alt: string; width: number; height: number }
  url?: string
}

const img = (slug: string, name: string) => ({ src: `/images/projects/${slug}.svg`, alt: `Placeholder image for ${name}`, width: 1200, height: 800 })

export const projects: Project[] = [
  {
    slug: "fripa",
    name: "Fripa",
    description: "Online secondhand clothing store in Tunisia with a swipe-to-shop interface.",
    tags: ["Personal", "E-commerce"],
    image: img("fripa", "Fripa"),
  },
  {
    slug: "febal-casa-usa",
    name: "Febal Casa USA",
    description: "Website for an Italian furniture and interior-design brand in the US.",
    tags: ["Client"],
    image: img("febal-casa-usa", "Febal Casa USA"),
  },
  {
    slug: "aurelia-gloves",
    name: "Aurelia Gloves",
    description: "Product site for a US brand of professional disposable gloves.",
    tags: ["Client"],
    image: img("aurelia-gloves", "Aurelia Gloves"),
  },
  {
    slug: "weedy",
    name: "Weedy",
    description: "E-commerce store selling CBD products in France.",
    tags: ["Client", "E-commerce"],
    image: img("weedy", "Weedy"),
  },
]

export const projectFilters = ["All", "E-commerce", "Personal", "Client"] as const
export type ProjectFilter = (typeof projectFilters)[number]
