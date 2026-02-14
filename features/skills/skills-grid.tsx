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

  return (
    <section className="space-y-6" aria-busy={loading} aria-label="Skills">
      {/* Search + Controls - Floating Toolbar */}
      <div className="sticky top-16 z-40 -mx-2 px-2 py-3 backdrop-blur-2xl bg-background/60 supports-[backdrop-filter]:bg-background/40 rounded-2xl border border-border/20 shadow-sm transition-all duration-300">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search agent skills..."
              aria-label="Search skills"
              name="search"
              autoComplete="off"
              inputMode="search"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 pr-9 h-11 bg-background/50 border-transparent hover:border-border/50 focus-visible:bg-background transition-all shadow-none"
            />
            {inputValue && (
              <button
                type="button"
                onClick={handleClearSearch}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/50"
              >
                <X className="size-3.5" aria-hidden="true" />
              </button>
            )}
          </form>

          <div className="flex flex-wrap items-center gap-2.5">
            {categories.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="lg" className="h-11 px-4 gap-2 bg-background/50 border-border/50 hover:bg-background">
                    {selectedCategories.length === 0
                      ? "Category"
                      : selectedCategories.length === 1
                        ? categories.find((cat) => cat.slug === selectedCategories[0])?.name || "Category"
                        : `${selectedCategories.length} Selected`}
                    <ChevronDown data-icon="inline-end" className="size-3.5 opacity-70" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={8} className="w-56 p-1 rounded-xl shadow-xl border-border/50 bg-background/95 backdrop-blur-xl">
                  <DropdownMenuGroup>
                    <DropdownMenuCheckboxItem
                      checked={selectedCategories.length === 0}
                      onCheckedChange={() => handleClearFilters()}
                      className="rounded-lg cursor-pointer"
                    >
                      All Categories
                    </DropdownMenuCheckboxItem>
                    {categories.map((cat) => (
                      <DropdownMenuCheckboxItem
                        key={cat.id}
                        checked={selectedCategories.includes(cat.slug)}
                        onCheckedChange={() => handleCategoryToggle(cat.slug)}
                        className="rounded-lg cursor-pointer"
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
                <Button variant="outline" size="lg" className="h-11 px-4 gap-2 bg-background/50 border-border/50 hover:bg-background">
                  {sortLabel}
                  <ChevronDown data-icon="inline-end" className="size-3.5 opacity-70" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-48 p-1 rounded-xl shadow-xl border-border/50 bg-background/95 backdrop-blur-xl">
                <DropdownMenuGroup>
                  <DropdownMenuRadioGroup value={sort} onValueChange={handleSortChange}>
                    {sortOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value} className="rounded-lg cursor-pointer">
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-4 pb-8">
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
    <nav className="flex items-center justify-center gap-2" role="navigation" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full size-9 border-border/50 bg-background/50 backdrop-blur-sm shadow-sm"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>

      <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm">
        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={page === pageNum ? "default" : "ghost"}
            size="sm"
            onClick={() => onPageChange(pageNum)}
            className={cn(
              "rounded-full size-8 p-0 text-xs font-medium transition-all",
              page === pageNum ? "shadow-md scale-105" : "hover:bg-muted"
            )}
            aria-label={`Go to page ${pageNum}`}
            aria-current={page === pageNum ? "page" : undefined}
          >
            {pageNum}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="icon"
        className="rounded-full size-9 border-border/50 bg-background/50 backdrop-blur-sm shadow-sm"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}

export { SkillsGrid }
