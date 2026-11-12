import { monogramImage } from "@/lib/monogram-image"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return monogramImage(32, 6)
}
