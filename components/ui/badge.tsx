import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "h-5.5 gap-1.5 rounded-full border border-transparent px-2.5 py-0.5 text-[11px] font-semibold transition-colors has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:size-3 inline-flex items-center justify-center w-fit whitespace-nowrap shrink-0 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive overflow-hidden group/badge",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
        secondary: "bg-secondary text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive: "bg-destructive/10 [a]:hover:bg-destructive/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 text-destructive dark:bg-destructive/20",
        outline: "border-border text-foreground [a]:hover:bg-muted [a]:hover:text-muted-foreground bg-input/20 dark:bg-input/30",
        ghost: "hover:bg-muted hover:text-muted-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  asChild,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    render?: React.ReactElement
    asChild?: boolean
  }) {
  const badgeClasses = cn(badgeVariants({ variant }), className)

  if (render && React.isValidElement(render)) {
    return React.cloneElement(render as React.ReactElement<{ className?: string }>, {
      className: cn(badgeClasses, (render as React.ReactElement<{ className?: string }>).props.className),
      "data-slot": "badge",
      "data-variant": variant,
    } as React.HTMLAttributes<HTMLElement>)
  }

  if (asChild && React.isValidElement(props.children)) {
    const child = props.children as React.ReactElement<{ className?: string }>
    return React.cloneElement(child, {
      className: cn(badgeClasses, child.props?.className),
      "data-slot": "badge",
      "data-variant": variant,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={badgeClasses}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
