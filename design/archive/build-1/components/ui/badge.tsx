import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// DESIGN.md badge-secondary, set in caption-mono for technical labels (stack tags, dates).
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full font-mono text-caption whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        // on canvas-soft surfaces the badge is lifted to canvas so it stays visible
        secondary: "h-6 bg-canvas px-2 text-body shadow-level-1",
        soft: "h-6 bg-canvas-soft px-2 text-body shadow-level-1",
        // on the polarity-flipped primary band
        inverse: "h-6 border border-body px-2 text-on-primary",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
)

function Badge({
  className,
  variant = "secondary",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
