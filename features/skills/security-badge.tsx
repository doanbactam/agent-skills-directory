import * as React from "react"
import { ShieldAlert, ShieldCheck, ShieldX } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import type { SecurityScanResult } from "@/lib/features/skills/security-scanner"

type SecurityBadgeProps = {
  securityScan: string | null
  variant?: "full" | "compact" | "icon"
  className?: string
}

function SecurityBadge({ securityScan, variant = "compact", className }: SecurityBadgeProps) {
  if (!securityScan) return null

  let scan: SecurityScanResult
  try {
    scan = JSON.parse(securityScan)
  } catch {
    return null
  }

  if (!scan || typeof scan !== "object") return null

  const { safe, riskScore, threats } = scan

  // Determine severity level
  const severity = riskScore >= 75 ? "critical" : riskScore >= 50 ? "high" : riskScore >= 25 ? "medium" : "low"

  // Icon and colors based on severity
  const config = {
    critical: {
      icon: ShieldX,
      color: "text-red-600",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      label: "Critical Risk",
    },
    high: {
      icon: ShieldAlert,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
      border: "border-orange-500/30",
      label: "High Risk",
    },
    medium: {
      icon: ShieldAlert,
      color: "text-yellow-600",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/30",
      label: "Medium Risk",
    },
    low: {
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-500/10",
      border: "border-green-500/30",
      label: "Verified Safe",
    },
  }

  const { icon: Icon, color, bg, border, label } = config[severity]

  // Tooltip content
  const tooltipContent = (
    <div className="space-y-1.5 text-xs">
      <div className="font-semibold">Security Scan: {label}</div>
      <div className="text-muted-foreground">Risk Score: {riskScore}/100</div>
      {threats.length > 0 && (
        <>
          <div className="text-muted-foreground mt-2">Threats detected:</div>
          <ul className="space-y-1 text-muted-foreground">
            {threats.slice(0, 3).map((threat, idx) => (
              <li key={idx} className="text-[10px]">
                • {threat.message}
              </li>
            ))}
            {threats.length > 3 && (
              <li className="text-[10px]">• +{threats.length - 3} more</li>
            )}
          </ul>
        </>
      )}
    </div>
  )

  if (variant === "icon") {
    return (
      <Tooltip>
        <TooltipTrigger
          className={`inline-flex items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${className}`}
          type="button"
          aria-label={`Security scan: ${label}`}
        >
          <Icon className={`size-4 ${color}`} aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    )
  }

  if (variant === "compact") {
    return (
      <Tooltip>
        <TooltipTrigger
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${bg} ${color} ${border} border ${className}`}
          type="button"
          aria-label={`Security scan: ${safe ? "Verified" : label}`}
        >
          <Icon className="size-3" aria-hidden="true" />
          <span>{safe ? "Verified" : label}</span>
        </TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    )
  }

  // Full variant
  return (
    <div className={`rounded-lg border ${border} ${bg} p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <Icon className={`size-4 ${color} shrink-0 mt-0.5`} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`text-xs font-semibold ${color}`}>{label}</span>
            <span className="text-[10px] text-muted-foreground">
              Risk: {riskScore}/100
            </span>
          </div>
          {threats.length > 0 && (
            <div className="space-y-1">
              {threats.slice(0, 2).map((threat, idx) => (
                <div key={idx} className="text-[10px] text-muted-foreground">
                  • {threat.message}
                </div>
              ))}
              {threats.length > 2 && (
                <div className="text-[10px] text-muted-foreground">
                  +{threats.length - 2} more issues
                </div>
              )}
            </div>
          )}
          {threats.length === 0 && safe && (
            <div className="text-[10px] text-muted-foreground">
              No security threats detected
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { SecurityBadge }
