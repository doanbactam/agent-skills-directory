import * as React from "react"
import Link from "next/link"
import { SkillsFaq } from "@/components/faq/skills-faq-loader"
import { SkillsGrid } from "@/features/skills/skills-grid"
import { Container } from "@/components/layouts/container"
import { Section } from "@/components/layouts/section"
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs-json-ld"
import { buildMetadata } from "@/lib/seo"
import { getSkills, getCategories } from "@/lib/db/queries"


export const metadata = buildMetadata({
  title: "Browse Agent Skills",
  description: "Browse agent skills for coding assistants. Search SKILL.md workflows for Claude Code, Cursor, Windsurf, and more, then filter by category or recency.",
  path: "/skills",
  keywords: [
    "browse agent skills",
    "agent skills directory",
    "search skills",
    "SKILL.md",
    "Claude Code skills",
    "coding assistant skills",
  ],
})

function SkillsGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-9 bg-muted rounded-md animate-pulse motion-reduce:animate-none" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-card p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-lg bg-muted animate-pulse motion-reduce:animate-none" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse motion-reduce:animate-none" />
                <div className="h-3 w-16 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-2/3 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function SkillsPage() {
  const [initialData, categories] = await Promise.all([
    getSkills({ page: 1, perPage: 30, descriptionLength: 200, sortBy: "recent" }),
    getCategories(),
  ])

  return (
    <Container>
      <BreadcrumbsJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Browse Skills", url: "/skills" },
        ]}
      />
      <Section spacing="sm" className="space-y-2">
        <header className="space-y-1">
          <h1 className="text-balance text-2xl font-bold tracking-tight">Browse Agent Skills</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl text-pretty">
            Search agent skills by name, filter by category, and sort by recent updates or stars.
          </p>
          <p className="text-muted-foreground text-xs text-pretty">
            Need a refresher? Read the{" "}
            <Link href="/agent-skills" className="text-primary text-link">
              Agent Skills Guide
            </Link>
            .
          </p>
        </header>
      </Section>
      <Section spacing="lg">
        <React.Suspense fallback={<SkillsGridSkeleton />}>
          <SkillsGrid initialData={initialData} initialCategories={categories} />
        </React.Suspense>
      </Section>
      <Section spacing="sm">
        <SkillsFaq />
      </Section>
    </Container>
  )
}
