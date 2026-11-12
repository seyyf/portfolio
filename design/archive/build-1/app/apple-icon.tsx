import { monogramImage } from "@/lib/monogram-image"

export const size = { width: 180, height: 180 }
export const contentType = "image/png"

// iOS applies its own corner mask, so the square is drawn without a radius.
export default function AppleIcon() {
  return monogramImage(180, 0)
}
