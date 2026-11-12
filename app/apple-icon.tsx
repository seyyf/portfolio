import { ImageResponse } from "next/og"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// The SeyfOS mark: an "S" on a mint, sky and lavender gradient.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #A8E6CF, #A0D2EB 50%, #C3B1E1)" }}>
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M21 10.5c-1.2-1.4-3-2-5-2-3 0-5 1.6-5 3.8 0 4.9 10 2.6 10 7.6 0 2.3-2.1 3.9-5.2 3.9-2.3 0-4.2-.8-5.3-2.3" fill="none" stroke="#1F2233" strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      </div>
    ),
    size
  )
}
