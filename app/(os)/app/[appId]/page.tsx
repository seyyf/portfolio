import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { appIds, apps, type AppId } from "@/data/apps"
import { profile } from "@/data/profile"

// Every app has its own shareable URL. All are known ahead of time, so all are prerendered.
export async function generateStaticParams() {
  return appIds.map((appId) => ({ appId }))
}

const isApp = (id: string): id is AppId => (appIds as string[]).includes(id)

export async function generateMetadata({ params }: PageProps<"/app/[appId]">): Promise<Metadata> {
  const { appId } = await params
  if (!isApp(appId)) return {}
  const a = apps[appId]
  const description = `${a.description} Part of SeyfOS, the portfolio of ${profile.name}, ${profile.title}.`
  return {
    title: a.name,
    description,
    alternates: { canonical: `/app/${appId}` },
    openGraph: { type: "website", siteName: "SeyfOS", locale: "en_US", url: `/app/${appId}`, title: `${a.name} · SeyfOS`, description },
    twitter: { card: "summary_large_image", title: `${a.name} · SeyfOS`, description },
  }
}

// The app itself is rendered inside the phone by the OS shell (server-rendered for this URL).
export default async function AppPage({ params }: PageProps<"/app/[appId]">) {
  const { appId } = await params
  if (!isApp(appId)) notFound()
  return null
}
