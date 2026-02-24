import * as React from "react"
import type { Metadata } from "next"
import { Hero } from "@/features/marketing/hero"
import { SkillsGrid } from "@/features/skills/skills-grid"
import { Container } from "@/components/layouts/container"
import { FaqJsonLd } from "@/components/seo/faq-json-ld"
import { siteDescription, siteFullName } from "@/lib/seo"
import { getSiteUrl } from "@/lib/site-url"
import { getStats } from "@/lib/stats"
import { getCategories, getSkills, type GetSkillsOptions } from "@/lib/db/queries"
import { getHealthStatus } from "@/lib/health"
import { siteConfig } from "@/config/site"
import { HomeClient } from "@/features/marketing/home-client"

export const metadata: Metadata = {
  title: {
    absolute: siteFullName,
  },
  description: siteDescription,
  keywords: [
    ...siteConfig.keywords,
    "agent skills directory",
    "find agent skills",
    "SKILL.md files",
    "search agent skills",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteFullName,
    description: siteDescription,
    url: getSiteUrl(),
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: siteFullName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitterHandle,
    creator: siteConfig.twitterHandle,
    title: siteFullName,
    description: siteDescription,
    images: ["/opengraph-image"],
  },
}

function SkillsGridSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-9 bg-muted rounded-md animate-pulse motion-reduce:animate-none" />
        <div className="hidden sm:flex gap-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-12 h-7 bg-muted rounded-md animate-pulse motion-reduce:animate-none" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border-subtle bg-card p-4 space-y-3">
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

type PageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

const DEFAULT_PAGE_SIZE = 12 // Reduced from 32 for better performance and lower egress

const allowedSorts: NonNullable<GetSkillsOptions["sortBy"]>[] = [
  "recent",
  "stars_desc",
  "name_asc",
  "name_desc",
  "last_commit",
]

function parseSort(value: string | undefined): NonNullable<GetSkillsOptions["sortBy"]> {
  if (value && allowedSorts.includes(value as NonNullable<GetSkillsOptions["sortBy"]>)) {
    return value as NonNullable<GetSkillsOptions["sortBy"]>
  }

  return "last_commit"
}

function parseNumber(value: string | string[] | undefined, fallback: number) {
  if (typeof value !== "string") return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

function parseCategoryList(value: string | string[] | undefined) {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams
  const searchQuery = typeof params?.q === "string" ? params.q : undefined
  const sortParam = typeof params?.sort === "string" ? params.sort : undefined
  const sortBy = parseSort(sortParam)
  const page = parseNumber(params?.page, 1)
  const categoryList = parseCategoryList(params?.categories)

  const [stats, categories, skillsData, healthStatus] = await Promise.all([
    getStats(),
    getCategories(),
    getSkills({
      query: searchQuery,
      page,
      perPage: DEFAULT_PAGE_SIZE,
      descriptionLength: 200,
      sortBy,
      categoryList,
    }),
    getHealthStatus(),
  ])

  return (
    <>
      <FaqJsonLd />
      <Container>
        <HomeClient />
        <Hero stats={stats} healthStatus={healthStatus} />
        <section aria-labelledby="featured-skills-heading" className="space-y-4">
          <h2 id="featured-skills-heading" className="sr-only">
            Featured Agent Skills
          </h2>
          <React.Suspense fallback={<SkillsGridSkeleton />}>
            <SkillsGrid initialData={skillsData} initialCategories={categories} />
          </React.Suspense>
        </section>
      </Container>
    </>
  )
}
