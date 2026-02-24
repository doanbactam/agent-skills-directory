"use client"

import * as React from "react"

import { Card, CardContent } from "@/components/ui/card"
import type { Skill } from "./skills-table"

type OverviewTabProps = {
  skills: Skill[]
  stats: {
    total: number
    approved: number
    pending: number
  }
}

export const OverviewTab = React.memo(function OverviewTab({ stats }: OverviewTabProps) {
  return (
    <div className="space-y-6 pt-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Dashboard Overview</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Skills" value={stats.total} />
        <StatCard label="Approved Skills" value={stats.approved} color="green" />
        <StatCard label="Pending Skills" value={stats.pending} color="yellow" />
      </div>
    </div>
  )
})

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: string | number
  color?: string
}) {
  const colorClass = {
    green: "text-green-600",
    yellow: "text-yellow-600",
    blue: "text-blue-600",
    orange: "text-orange-600",
    red: "text-red-600",
  }[color ?? ""] ?? ""

  return (
    <Card className="rounded-2xl border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
      <CardContent className="p-4">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div className={`mt-2 text-2xl font-semibold ${colorClass}`}>{value}</div>
      </CardContent>
    </Card>
  )
}
