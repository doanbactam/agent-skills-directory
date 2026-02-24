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
  MoreHorizontal,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
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

  const searchInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !e.metaKey && !e.ctrlKey)
      ) {
        if (
          document.activeElement !== searchInputRef.current &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault()
          searchInputRef.current?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <section className="space-y-4" aria-busy={loading} aria-label="Skills">
      {/* Unified search & filter toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch rounded-xl border border-border/50 bg-background/50 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:border-border/80">
        {/* Search input */}
        <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={searchInputRef}
            type="search"
            placeholder="Search agent skills..."
            aria-label="Search skills"
            aria-keyshortcuts="Control+K /"
            name="search"
            autoComplete="off"
            inputMode="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="h-10 w-full bg-transparent pl-9 pr-12 text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          {!inputValue && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center pointer-events-none">
              <kbd className="inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/60 bg-muted/60 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          )}
          {inputValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </form>

        {/* Divider */}
        <div className="hidden sm:block w-px bg-border/50 my-2 shrink-0" />
        <div className="sm:hidden h-px bg-border/50 mx-3 shrink-0" />

        {/* Filter controls */}
        <div className="flex items-center shrink-0">
          {categories.length > 0 && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="h-10 flex items-center gap-1.5 px-3 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span className="truncate max-w-[120px]">
                      {selectedCategories.length === 0
                        ? "Category"
                        : selectedCategories.length === 1
                          ? categories.find((cat) => cat.slug === selectedCategories[0])?.name || "Category"
                          : `${selectedCategories.length} selected`}
                    </span>
                    <ChevronDown className="size-3.5 opacity-50 shrink-0" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
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

              {/* Separator between dropdowns */}
              <div className="hidden sm:block w-px bg-border/50 my-2 shrink-0" />
              <div className="sm:hidden h-px bg-border/50 shrink-0" />
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="h-10 flex items-center gap-1.5 px-3 text-sm font-normal text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="truncate max-w-[140px]">{sortLabel}</span>
                <ChevronDown className="size-3.5 opacity-50 shrink-0" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl">
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

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10" role="status" aria-live="polite">
          <Loader2 className="text-primary size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          <span className="text-muted-foreground text-sm">Loading…</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm py-6 justify-center" role="alert">
          <AlertCircle className="size-4" aria-hidden="true" />
          {error}
        </div>
      )}

      {!loading && !error && skills.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <PackageSearch className="size-5 opacity-50" aria-hidden="true" />
          <p className="text-sm text-pretty">No skills found</p>
          {(searchQuery || selectedCategories.length > 0) && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {!loading && !error && skills.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pt-2 pb-6">
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
    const pages: (number | string)[] = []
    const maxPagesToShow = 7

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (page >= totalPages - 3) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = page - 1; i <= page + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }, [page, totalPages])

  return (
    <nav className="flex items-center justify-center gap-1 sm:gap-2" role="navigation" aria-label="Pagination">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        aria-label="Previous page"
        className="size-8 sm:size-9"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>

      <div className="flex items-center gap-0.5 sm:gap-1">
        {pageNumbers.map((pageNum, idx) => {
          if (pageNum === "...") {
            return (
              <div key={`ellipsis-${idx}`} className="flex size-8 sm:size-9 items-center justify-center">
                <MoreHorizontal className="size-4 opacity-50" aria-hidden="true" />
              </div>
            )
          }

          const isCurrent = page === pageNum
          return (
            <Button
              key={`page-${pageNum}`}
              variant={isCurrent ? "default" : "ghost"}
              size="icon"
              onClick={() => onPageChange(pageNum as number)}
              aria-label={`Go to page ${pageNum}`}
              aria-current={isCurrent ? "page" : undefined}
              className="size-8 sm:size-9 text-xs sm:text-sm"
            >
              {pageNum}
            </Button>
          )
        })}
      </div>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page >= totalPages}
        aria-label="Next page"
        className="size-8 sm:size-9"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}

export { SkillsGrid }
