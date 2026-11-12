import { ImageResponse } from "next/og"

// "SM" monogram: white initials on an ink rounded square (DESIGN.md primary / on-primary).
export function monogramImage(size: number, radius: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#171717",
          borderRadius: radius,
          color: "#ffffff",
          fontSize: Math.round(size * 0.44),
          fontWeight: 600,
          letterSpacing: Math.round(size * -0.03),
        }}
      >
        SM
      </div>
    ),
    { width: size, height: size }
  )
}
