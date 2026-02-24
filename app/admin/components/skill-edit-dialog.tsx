"use client"

import * as React from "react"
import { ExternalLink, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CATEGORIES, type CategoryDefinition } from "@/lib/categories"
import { cn, getExternalUrl } from "@/lib/utils"
import type { Skill } from "./skills-table"

type SkillEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  skill: Skill | null
  onSave: (
    skillId: string,
    updates: Partial<Skill>,
    categories?: string[]
  ) => Promise<void>
}

export function SkillEditDialog({
  open,
  onOpenChange,
  skill,
  onSave,
}: SkillEditDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [status, setStatus] = React.useState<string>("pending")
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>([])
  const [initialCategories, setInitialCategories] = React.useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!skill || !open) return
    setName(skill.name ?? "")
    setDescription(skill.description ?? "")
    setStatus(skill.status === "approved" ? "approved" : "pending")
    setError(null)
    setSelectedCategories([])
    setInitialCategories([])

    const controller = new AbortController()
    const fetchCategories = async () => {
      setLoadingCategories(true)
      try {
        const res = await fetch(
          `/api/admin/skills/${encodeURIComponent(skill.id)}/categories`,
          { signal: controller.signal }
        )
        if (res.ok) {
          const data = await res.json()
          setSelectedCategories(data.categories ?? [])
          setInitialCategories(data.categories ?? [])
        } else {
          setError("Failed to load categories")
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        console.error("Failed to fetch categories", err)
        setError("Failed to load categories")
      } finally {
        setLoadingCategories(false)
      }
    }
    fetchCategories()
    return () => controller.abort()
  }, [skill, open])

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    )
  }

  const handleSave = async () => {
    if (!skill) return
    setIsSaving(true)
    setError(null)

    const updates: Partial<Skill> = {}
    if (name.trim() && name.trim() !== skill.name) updates.name = name.trim()
    if (description.trim() !== skill.description) updates.description = description.trim()
    if (status !== skill.status) updates.status = status

    const categoriesChanged =
      selectedCategories.length !== initialCategories.length ||
      selectedCategories.some((s) => !initialCategories.includes(s))

    try {
      await onSave(
        skill.id,
        updates,
        categoriesChanged ? selectedCategories : undefined
      )
      onOpenChange(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update skill"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl sm:p-6 p-5">
        <DialogHeader>
          <DialogTitle>Edit Skill</DialogTitle>
          <DialogDescription>
            Update metadata, status, and categories for this skill.
          </DialogDescription>
        </DialogHeader>
        {!skill ? (
          <div className="py-8 text-center text-sm text-muted-foreground">No skill selected.</div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm p-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-foreground">
                  {skill.owner}/{skill.repo}
                </span>
                <a
                  href={getExternalUrl(skill.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary text-link"
                >
                  Open GitHub
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </div>
              <div className="mt-1 truncate">Path: {skill.path}</div>
            </div>

            <div className="space-y-2">
              <label htmlFor="skill-name" className="text-xs font-medium text-muted-foreground">
                Name
              </label>
              <Input
                id="skill-name"
                name="name"
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="skill-description"
                className="text-xs font-medium text-muted-foreground"
              >
                Description
              </label>
              <Textarea
                id="skill-description"
                name="description"
                autoComplete="off"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="skill-status" className="text-xs font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={status}
                onValueChange={(value) => {
                  if (typeof value === "string") {
                    setStatus(value)
                  }
                }}
              >
                <SelectTrigger id="skill-status" className="w-full" size="default">
                  <SelectValue placeholder="Select status…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Categories</label>
              {loadingCategories ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                  Loading categories…
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {(CATEGORIES as readonly CategoryDefinition[]).map((category) => {
                    const isSelected = selectedCategories.includes(category.slug)
                    return (
                      <label
                        key={category.id}
                        className={cn(
                          "flex items-center gap-2 rounded-xl border p-2 cursor-pointer transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleCategory(category.slug)}
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
              {selectedCategories.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
                  {selectedCategories.map((slug) => {
                    const cat = (CATEGORIES as readonly CategoryDefinition[]).find(
                      (c) => c.slug === slug
                    )
                    return cat ? (
                      <Badge key={slug} variant="secondary" className="text-xs">
                        {cat.icon} {cat.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>

            {error && <div className="text-xs text-destructive">{error}</div>}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !skill}
            isLoading={isSaving}
            loadingText="Saving…"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
