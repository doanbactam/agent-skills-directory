"use client"

import * as React from "react"
import { Flag, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "malicious", label: "Malicious content" },
  { value: "copyright", label: "Copyright violation" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "broken", label: "Broken / Not working" },
  { value: "other", label: "Other" },
] as const

type ReportReason = (typeof REPORT_REASONS)[number]["value"]

interface ReportSkillDialogProps {
  skillId: string
  skillName: string
}

function ReportSkillDialog({ skillId, skillName }: ReportSkillDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState<ReportReason | null>(null)
  const [description, setDescription] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/skills/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skillId,
          reason,
          description: description.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit report")
      }

      toast.success("Report submitted successfully")
      setOpen(false)
      setReason(null)
      setDescription("")
    } catch {
      toast.error("Failed to submit report. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground gap-1.5 h-auto py-1 px-2">
          <Flag className="size-3" aria-hidden="true" />
          Report skill
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Skill</DialogTitle>
          <DialogDescription>
            Report an issue with <span className="font-medium">{skillName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-3">
            <label id="report-reason-label" className="text-sm font-medium">Reason</label>
            <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="report-reason-label">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={cn(
                    "relative flex cursor-pointer flex-col rounded-lg border p-3 shadow-sm outline-none transition-all duration-200 hover:bg-accent hover:text-accent-foreground has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring/40 has-[input:focus-visible]:ring-offset-2 has-[input:focus-visible]:ring-offset-background",
                    reason === r.value
                      ? "border-primary bg-primary/5 text-foreground shadow-sm"
                      : "border-border bg-background"
                  )}
                >
                  <span className="text-sm font-medium leading-none">{r.label}</span>
                  <input
                    type="radio"
                    name="report-reason"
                    value={r.value}
                    className="sr-only"
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="report-details" className="text-sm font-medium">
                Additional details <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {description.length}/500
              </span>
            </div>
            <Textarea
              id="report-details"
              name="details"
              autoComplete="off"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 500))}
              placeholder="Provide more context about the issue…"
              rows={3}
              maxLength={500}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!reason || isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
            {isSubmitting ? "Submitting…" : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ReportSkillDialog }
