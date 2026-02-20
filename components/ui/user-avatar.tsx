"use client"

import * as React from "react"
import { ExternalImage } from "@/components/ui/external-image"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  src?: string | null
  alt: string
  initials?: string
  className?: string
  size?: number
  quality?: number
}

export function UserAvatar({
  src,
  alt,
  initials,
  className,
  size = 40,
  quality = 75,
}: UserAvatarProps) {
  // Derive initials from alt if not provided
  const displayInitials = initials || alt.charAt(0).toUpperCase()

  const style = { width: size, height: size }

  // Calculate font size roughly based on container size
  const fontSize = Math.floor(size * 0.4);

  if (src) {
    return (
      <div
        className={cn("overflow-hidden rounded-lg bg-muted flex items-center justify-center shrink-0", className)}
        style={style}
      >
        <ExternalImage
          src={src}
          alt={alt}
          width={size}
          height={size}
          quality={quality}
          className="size-full object-cover"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-muted to-muted/50 text-muted-foreground font-semibold shrink-0 select-none",
        className
      )}
      style={style}
      role="img"
      aria-label={alt}
    >
      <span style={{ fontSize }}>
        {displayInitials}
      </span>
    </div>
  )
}
