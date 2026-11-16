import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// The favicon at home-screen size: a release list (dots on a line, with notes) on Sidi Bou Said blue.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0E4C92" }}>
        <svg width="132" height="132" viewBox="0 0 32 32">
          <path d="M10 8.5v15" stroke="#ffffff" strokeOpacity=".45" strokeWidth="1.5" />
          <circle cx="10" cy="10" r="2.6" fill="#ffffff" />
          <circle cx="10" cy="16" r="2" fill="#ffffff" fillOpacity=".85" />
          <circle cx="10" cy="22" r="2" fill="#ffffff" fillOpacity=".85" />
          <path d="M15 10h9M15 16h7M15 22h8" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size
  )
}
