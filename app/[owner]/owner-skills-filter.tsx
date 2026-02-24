"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, Grid } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SkillCard } from "@/features/skills/skill-card-client";
import type { Category, SkillWithCategories as Skill } from "@/types";

const sortOptions = [
  { value: "stars_desc", label: "Most Stars" },
  { value: "name_asc", label: "Name (A-Z)" },
  { value: "name_desc", label: "Name (Z-A)" },
  { value: "recent", label: "Recently Added" },
  { value: "last_commit", label: "Last Commit" },
] as const;

type SortValue = (typeof sortOptions)[number]["value"];
const DEFAULT_SORT: SortValue = "last_commit";
const PAGE_SIZE = 12;

type OwnerSkillsFilterProps = {
  owner: string;
  skills: Skill[];
  categories: Category[];
};

function OwnerSkillsFilter({ owner, skills, categories }: OwnerSkillsFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const parseCategories = React.useCallback((value: string | null) => {
    if (!value) return [];
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, []);

  const parsePage = React.useCallback((value: string | null) => {
    if (!value) return 1;
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, []);

  const normalizeSort = React.useCallback((value: string | null): SortValue => {
    if (!value) return DEFAULT_SORT;
    const match = sortOptions.find((opt) => opt.value === value);
    return match ? match.value : DEFAULT_SORT;
  }, []);

  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    parseCategories(searchParams.get("categories")),
  );
  const [sort, setSort] = React.useState<SortValue>(
    normalizeSort(searchParams.get("sort")),
  );
  const [page, setPage] = React.useState<number>(
    parsePage(searchParams.get("page")),
  );

  React.useEffect(() => {
    const nextSort = normalizeSort(searchParams.get("sort"));
    const nextCategories = parseCategories(searchParams.get("categories"));
    const nextPage = parsePage(searchParams.get("page"));
    setSort(nextSort);
    setSelectedCategories(nextCategories);
    setPage(nextPage);
  }, [normalizeSort, parseCategories, parsePage, searchParams]);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (sort === DEFAULT_SORT) {
      params.delete("sort");
    } else {
      params.set("sort", sort);
    }

    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","));
    } else {
      params.delete("categories");
    }

    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(`${pathname}${next ? `?${next}` : ""}`, { scroll: false });
    }
  }, [pathname, router, searchParams, selectedCategories, sort, page]);

  const filteredAndSortedSkills = React.useMemo(() => {
    let list = [...skills];

    if (selectedCategories.length > 0) {
      list = list.filter((skill) =>
        selectedCategories.includes(skill.category?.slug || "")
      );
    }

    list.sort((a, b) => {
      let cmp = 0;
      switch (sort) {
        case "stars_desc":
          cmp = (b.stars ?? 0) - (a.stars ?? 0);
          break;
        case "name_asc":
          cmp = a.name.localeCompare(b.name);
          break;
        case "name_desc":
          cmp = b.name.localeCompare(a.name);
          break;
        case "recent":
          cmp = new Date(b.indexedAt ?? 0).getTime() - new Date(a.indexedAt ?? 0).getTime();
          break;
        case "last_commit":
          cmp = new Date(b.fileUpdatedAt ?? b.repoUpdatedAt ?? b.indexedAt ?? 0).getTime() - new Date(a.fileUpdatedAt ?? a.repoUpdatedAt ?? a.indexedAt ?? 0).getTime();
          break;
      }
      if (cmp !== 0) return cmp;
      return b.id.localeCompare(a.id);
    });

    return list;
  }, [skills, selectedCategories, sort]);

  const totalPages = Math.ceil(filteredAndSortedSkills.length / PAGE_SIZE);
  const pagedSkills = filteredAndSortedSkills.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  React.useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleCategoryToggle = React.useCallback((slug: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, slug] : prev.filter((s) => s !== slug)
    );
    setPage(1);
  }, []);

  const handleSortChange = React.useCallback((value: string) => {
    setSort(normalizeSort(value));
    setPage(1);
  }, [normalizeSort]);

  const activeSortLabel =
    sortOptions.find((opt) => opt.value === sort)?.label || "Last Commit";

  const showSkeleton = skills.length === 0 && categories.length === 0;

  const getCategoryLabel = React.useCallback(() => {
    if (selectedCategories.length === 0) return "All";
    if (selectedCategories.length === 1) {
      return categories.find((c) => c.slug === selectedCategories[0])?.name ?? "1 Category";
    }
    return `${selectedCategories.length} Categories`;
  }, [categories, selectedCategories]);

  return (
    <>
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Skills by {owner}</h2>

        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-7 gap-2 px-2.5 text-xs",
                    selectedCategories.length > 0 && "border-foreground/50"
                  )}
                >
                  <Grid className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="font-medium truncate max-w-[6rem]">
                    {getCategoryLabel()}
                  </span>
                  {selectedCategories.length > 0 && (
                    <span className="size-4 rounded-full bg-foreground text-background text-[9px] flex items-center justify-center font-medium">
                      {selectedCategories.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6} className="min-w-40">
                <DropdownMenuGroup>
                  {categories.map((cat) => (
                    <DropdownMenuCheckboxItem
                      key={cat.id}
                      checked={selectedCategories.includes(cat.slug)}
                      onCheckedChange={(checked) =>
                        handleCategoryToggle(cat.slug, checked)
                      }
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
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-2 px-2.5 text-xs"
                title={`Sort by ${activeSortLabel}`}
              >
                <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="font-medium truncate max-w-[6rem]">
                  {activeSortLabel}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={6} className="min-w-40">
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

      {showSkeleton ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-border/50 bg-card/40 p-3 space-y-3 animate-pulse motion-reduce:animate-none"
            >
              <div className="flex items-start gap-3">
                <div className="size-8 rounded-md bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 bg-muted rounded" />
                  <div className="h-3 w-16 bg-muted rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded" />
                <div className="h-3 w-2/3 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedSkills.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pagedSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setPage(pageNum)}
                    className={cn(page === pageNum && "pointer-events-none")}
                    aria-label={`Go to page ${pageNum}`}
                    aria-current={page === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </Button>
                );
              })}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-8 text-center">
          <Grid className="size-8 text-muted-foreground/50 mx-auto mb-2" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            {selectedCategories.length > 0
              ? "No skills found in selected categories"
              : "No skills available yet"}
          </p>
          {selectedCategories.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs"
              onClick={() => setSelectedCategories([])}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}
    </>
  );
}

export { OwnerSkillsFilter };
