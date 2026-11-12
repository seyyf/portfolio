import { createCn } from "cn/config"

// Teach the class merger about the DESIGN.md tokens so that `text-body` (color)
// and `text-body-lg` (font size) are not treated as conflicting classes.
export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display-xl",
            "display-lg",
            "display-md",
            "display-sm",
            "body-lg",
            "body-md",
            "body-sm",
            "caption",
            "code",
          ],
        },
      ],
      rounded: [{ rounded: ["pill", "pill-sm"] }],
      shadow: [{ shadow: ["level-1", "level-2", "level-3", "level-4", "level-5"] }],
    },
  },
})
