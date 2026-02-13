"use client"

import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export function VerifiedBadge({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4"

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("inline-flex items-center justify-center cursor-help align-text-bottom", className)}
          // No tabIndex to avoid nested interactive issues in links.
        >
          <ShieldCheck
            className={cn("text-blue-500 shrink-0", sizeClass)}
            aria-hidden="true"
          />
          <span className="sr-only">Verified organization</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>Verified organization</p>
      </TooltipContent>
    </Tooltip>
  )
}
