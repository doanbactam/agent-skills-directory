import * as React from "react"
import { cn } from "@/lib/utils"

type ContainerSize = "sm" | "md" | "lg" | "xl" | "full"

const containerSizes: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-[90rem]",
}

interface ContainerProps extends React.ComponentProps<"div"> {
  size?: ContainerSize
  spacing?: "none" | "sm" | "md" | "lg"
}

const spacingClasses = {
  none: "",
  sm: "space-y-3",
  md: "space-y-4",
  lg: "space-y-6",
}

function Container({
  size = "md",
  spacing = "md",
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full",
        "px-4 py-6 sm:px-6",
        containerSizes[size],
        spacingClasses[spacing],
        className
      )}
      data-slot="container"
      data-size={size}
      {...props}
    >
      {children}
    </div>
  )
}

export { Container, type ContainerSize }
