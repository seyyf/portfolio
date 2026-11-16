import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// A sunset over the sea: the site's icon at home-screen size.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0B0F1A" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="s" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FF4FA3" />
              <stop offset=".55" stopColor="#FF8A3D" />
              <stop offset="1" stopColor="#FFC94A" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="17" r="8" fill="url(#s)" />
          <path d="M4 21h24M6 24.5h20M9 28h14" stroke="#0B0F1A" strokeWidth="1.6" />
          <path d="M3 30.5h26" stroke="#0E3B43" strokeWidth="3" />
        </svg>
      </div>
    ),
    size
  )
}
