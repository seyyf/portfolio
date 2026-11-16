import { NextResponse, type NextRequest } from "next/server"

import { projects } from "@/data/projects"

const slugs = new Set(projects.map((p) => p.slug))

/**
 * Unknown project URLs get a real 404 status. The article page calls notFound() too, but by then the
 * prerendered shell has already been sent with a 200 (it only adds a noindex tag), so the check has
 * to happen here, before rendering starts.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2]
  if (slug && !slugs.has(slug)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 })
  }
}

export const config = {
  matcher: "/projects/:slug",
}
