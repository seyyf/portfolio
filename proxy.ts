import { NextResponse, type NextRequest } from "next/server"

import { missionPages } from "@/data/missions"

const slugs = new Set(missionPages.map((m) => m.slug))

// Mission pages are prerendered, so an unknown slug would otherwise stream a "not found" page with
// a 200 status (a soft 404). Answer unknown slugs with the 404 page and a real 404 status instead.
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2]
  if (slug && !slugs.has(slug)) {
    return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 })
  }
  return NextResponse.next()
}

export const config = { matcher: "/missions/:slug" }
