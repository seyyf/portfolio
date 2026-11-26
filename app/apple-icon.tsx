import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// A sunset over the sea: the site's icon at home-screen size.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0E1B2B" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <circle cx="16" cy="17" r="8" fill="#F2B544" />
          <path d="M4 21h24M6 24.5h20M9 28h14" stroke="#0E1B2B" strokeWidth="1.6" />
          <path d="M3 30.5h26" stroke="#2F6DB5" strokeWidth="3" />
        </svg>
      </div>
    ),
    size
  )
}
