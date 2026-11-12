import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// The tiny house from the header, on a butter tile.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFD97D" }}>
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#2B2D42" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.5 9.35 12 4l6.5 5.35V19a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Z" fill="#FF8B94" />
          <path d="M10 20v-5h4v5" fill="#FFF4E6" />
          <path d="M3.5 11 12 4l8.5 7" />
        </svg>
      </div>
    ),
    size
  )
}
