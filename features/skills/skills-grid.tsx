"use client"

import * as React from "react"
import {
  Search,
  PackageSearch,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SkillCard } from "@/features/skills/skill-card-client"
import { useSkillsSearch, type InitialData } from "@/lib/hooks/use-skills-search"
import type { Category } from "@/types"

type SkillsGridProps = {
  initialData?: InitialData
  initialCategories?: Category[]
}

function SkillsGrid({ initialData, initialCategories }: SkillsGridProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)

  const {
    skills,
    categories,
    totalPages,
    loading,
    error,
    inputValue,
    searchQuery,
    selectedCategories,
    page,
    sort,
    sortLabel,
    sortOptions,
    setInputValue,
    handleSearch,
    handleClearFilters,
    handleSortChange,
    handleClearSearch,
    handleCategoryToggle,
    handlePageChange,
  } = useSkillsSearch({
    initialData,
    initialCategories,
  })

  const onClearSearch = () => {
    handleClearSearch()
    inputRef.current?.focus()
  }

  return (
    <section className="space-y-4" aria-busy={loading} aria-label="Skills">
      {/* Search + Controls */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Search skills…"
            aria-label="Search skills"
            name="search"
            autoComplete="off"
            inputMode="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="pl-9 pr-9 h-9"
          />
          {inputValue && (
            <button
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  {selectedCategories.length === 0
                    ? "All Categories"
                    : selectedCategories.length === 1
                      ? categories.find((cat) => cat.slug === selectedCategories[0])?.name || "Category"
                      : `${selectedCategories.length} Categories`}
                  <ChevronDown data-icon="inline-end" className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" sideOffset={4} className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuCheckboxItem
                    checked={selectedCategories.length === 0}
                    onCheckedChange={() => handleClearFilters()}
                  >
                    All Categories
                  </DropdownMenuCheckboxItem>
                  {categories.map((cat) => (
                    <DropdownMenuCheckboxItem
                      key={cat.id}
                      checked={selectedCategories.includes(cat.slug)}
                      onCheckedChange={() => handleCategoryToggle(cat.slug)}
                    >
                      {cat.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                {sortLabel}
                <ChevronDown data-icon="inline-end" className="size-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={4}>
              <DropdownMenuGroup>
                <DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
                  {sortOptions.map((option) => (
                    <DropdownMenuRadioItem key={option.value} value={option.value}>
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12" role="status" aria-live="polite">
          <Loader2 className="text-primary size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-muted-foreground text-sm">Loading…</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm py-8 justify-center" role="alert">
          <AlertCircle className="size-4" aria-hidden="true" />
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && skills.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <PackageSearch className="size-6 opacity-50" aria-hidden="true" />
          <p className="text-sm text-pretty">No skills found</p>
          {(searchQuery || selectedCategories.length > 0) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Results */}
      {!loading && !error && skills.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-2">
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

type PaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const pageNumbers = React.useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (page <= 3) {
      for (let i = 1; i <= maxVisible; i++) pages.push(i)
    } else if (page >= totalPages - 2) {
      for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) pages.push(i)
    } else {
      for (let i = page - 2; i <= page + 2; i++) pages.push(i)
    }

    return pages
  }, [page, totalPages])

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>

      {pageNumbers.map((pageNum) => (
        <Button
          key={pageNum}
          variant={page === pageNum ? "default" : "ghost"}
          size="icon-sm"
          onClick={() => onPageChange(pageNum)}
          className={cn(page === pageNum && "pointer-events-none")}
          aria-label={`Go to page ${pageNum}`}
          aria-current={page === pageNum ? "page" : undefined}
        >
          {pageNum}
        </Button>
      ))}

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}

export { SkillsGrid }
