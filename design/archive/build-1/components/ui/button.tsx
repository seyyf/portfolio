import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// DESIGN.md: button-primary / button-secondary (+ -sm), nav-link, icon-button-circular.
// One radius scale for every interactive element: the 100px pill.
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-pill font-medium whitespace-nowrap transition-[background-color,color,box-shadow,transform] duration-200 ease-out-expo active:scale-[0.98] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-ink text-on-primary hover:bg-ink/85",
        secondary: "bg-canvas text-ink shadow-level-1 hover:bg-canvas-soft-2",
        ghost: "text-body hover:bg-canvas-soft-2 hover:text-ink",
      },
      size: {
        lg: "h-12 px-3 text-body-md has-[>svg]:pr-4 has-[>svg]:pl-3.5 [&_svg]:size-[18px]",
        sm: "h-8 px-2.5 text-body-sm [&_svg]:size-4",
        nav: "h-8 px-3 text-body-sm font-normal",
        icon: "size-11 shadow-level-1 bg-canvas text-ink hover:bg-canvas-soft-2 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "lg",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "lg",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
