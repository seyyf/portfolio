import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// A tiny front page: double rule, red photo block and text lines on newsprint.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F1E8" }}>
        <svg width="140" height="140" viewBox="0 0 32 32">
          <path d="M3 5.5h26M3 8h26" stroke="#141414" strokeWidth="1.2" />
          <path d="M3 12h10v11H3z" fill="#D7263D" />
          <path d="M16 12.5h13M16 16h13M16 19.5h13M3 27h26" stroke="#141414" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size
  )
}
