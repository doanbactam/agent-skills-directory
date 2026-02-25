"use client"

import * as React from "react"
import { Check, ExternalLink, SquarePen, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { SecurityBadge } from "@/features/skills/security-badge"
import { DataTable, type ColumnDef } from "@/components/ui/data-table"
import { getExternalUrl } from "@/lib/utils"

export type Skill = {
  id: string
  name: string
  slug: string
  description: string
  owner: string
  repo: string
  path: string
  url: string
  rawUrl: string
  stars: number | null
  forks: number | null
  avatarUrl: string | null
  status: string | null
  isVerifiedOrg: boolean | null
  isArchived: boolean | null
  topics: string | null
  compatibility: string | null
  allowedTools: string | null
  blobSha: string | null
  lastSeenAt: Date | null
  submittedBy: string | null
  repoUpdatedAt: Date | null
  fileUpdatedAt: Date | null
  indexedAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
  searchText: string | null
  securityScan: string | null
  securityScannedAt: Date | null
}

type SkillsTableProps = {
  skills: Skill[]
  onEdit: (skill: Skill) => void
  onApprove: (skillId: string) => Promise<void>
  onDelete: (skillId: string) => Promise<void>
}

export const SkillsTable = React.memo(function SkillsTable({
  skills,
  onEdit,
  onApprove,
  onDelete,
}: SkillsTableProps) {
  const [processingIds, setProcessingIds] = React.useState<Set<string>>(new Set())

  const handleAction = React.useCallback(
    async (
      skillId: string,
      action: "approve" | "delete",
      actionFn: (id: string) => Promise<void>
    ) => {
      if (processingIds.has(skillId)) return

      if (action === "delete" && !confirm("Delete this skill?")) return

      setProcessingIds((prev) => new Set(prev).add(skillId))
      try {
        await actionFn(skillId)
      } catch (error) {
        toast.error(
          `Failed to ${action} skill: ${error instanceof Error ? error.message : "Unknown error"}`
        )
      } finally {
        setProcessingIds((prev) => {
          const next = new Set(prev)
          next.delete(skillId)
          return next
        })
      }
    },
    [processingIds]
  )

  const skillColumns: ColumnDef<Skill>[] = React.useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="min-w-[200px]">
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
              {row.original.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "owner",
        header: "Repo",
        cell: ({ row }) => (
          <a
            href={getExternalUrl(`https://github.com/${row.original.owner}/${row.original.repo}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm hover:underline"
          >
            {row.original.owner}/{row.original.repo}
            <ExternalLink className="size-3 text-muted-foreground" aria-hidden="true" />
          </a>
        ),
      },
      {
        accessorKey: "stars",
        header: "Stars",
        cell: ({ row }) => (
          <span className="text-sm tabular-nums">
            {row.original.stars?.toLocaleString() ?? 0}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status === "approved" ? "approved" : "pending"
          const colorClass =
            status === "approved"
              ? "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950"
              : "text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950"
          return (
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${colorClass}`}>
              {status}
            </span>
          )
        },
        filterFn: (row, id, value) => {
          if (value === "all") return true
          return row.getValue(id) === value
        },
      },
      {
        id: "security",
        header: "Security",
        cell: ({ row }) => {
          const scan = row.original.securityScan
          if (!scan || scan.trim().length === 0) {
            return (
              <span className="px-2 py-0.5 text-xs rounded-full font-medium text-muted-foreground bg-muted">
                Not scanned
              </span>
            )
          }
          try {
            const parsed = JSON.parse(scan)
            if (!parsed || typeof parsed !== "object") throw new Error("Invalid scan")
            return <SecurityBadge securityScan={scan} variant="compact" />
          } catch {
            return (
              <span className="px-2 py-0.5 text-xs rounded-full font-medium text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950">
                Invalid
              </span>
            )
          }
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const skill = row.original
          const isProcessing = processingIds.has(skill.id)
          return (
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label="Edit skill"
                    onClick={() => onEdit(skill)}
                    disabled={isProcessing}
                  >
                    <SquarePen className="size-3.5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit skill</TooltipContent>
              </Tooltip>

              {skill.status !== "approved" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      aria-label="Approve skill"
                      onClick={() => handleAction(skill.id, "approve", onApprove)}
                      disabled={isProcessing}
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Approve skill</TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label="Delete skill"
                    onClick={() => handleAction(skill.id, "delete", onDelete)}
                    disabled={isProcessing}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete skill</TooltipContent>
              </Tooltip>
            </div>
          )
        },
      },
    ],
    [onEdit, onApprove, onDelete, handleAction, processingIds]
  )

  return (
    <DataTable
      columns={skillColumns}
      data={skills}
      searchKey="name"
      searchPlaceholder="Search skills…"
      pageSize={20}
    />
  )
})
