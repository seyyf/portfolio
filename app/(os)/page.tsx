import type { Metadata } from "next"

export const metadata: Metadata = {
  alternates: { canonical: "/" },
}

// The home screen and lock screen are rendered by the OS shell in the layout.
export default function Home() {
  return null
}
