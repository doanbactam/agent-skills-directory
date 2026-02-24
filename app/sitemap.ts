import type { MetadataRoute } from "next"
import { getCategories, getSkillsForSitemap } from "@/lib/db/queries"
import { getSiteUrl } from "@/lib/site-url"

export const dynamic = "force-dynamic"
export const revalidate = 3600 // 1 hour

const MAX_URLS_PER_SITEMAP = 45000 // Leave buffer under 50k limit

/**
 * Generate sitemap or sitemap index based on content size
 * - If total URLs < MAX_URLS_PER_SITEMAP: returns single sitemap
 * - If total URLs >= MAX_URLS_PER_SITEMAP: returns sitemap index pointing to /sitemap/[id].xml
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const now = new Date()

  // Static routes with SEO-optimized priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteUrl}/skills`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${siteUrl}/agent-skills`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/categories`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${siteUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ]

  try {
    const [categoriesData, skills] = await Promise.all([
      getCategories(),
      getSkillsForSitemap(),
    ])

    // Category routes
    const categoryRoutes: MetadataRoute.Sitemap = categoriesData.map((category) => ({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    }))

    // Build owner map with latest update date
    const ownerMap = new Map<string, { lastMod: Date; avatarUrl: string | null }>()
    for (const skill of skills) {
      const existing = ownerMap.get(skill.owner)
      const skillDate = skill.repoUpdatedAt ?? skill.updatedAt ?? skill.indexedAt ?? now
      if (!existing || skillDate > existing.lastMod) {
        ownerMap.set(skill.owner, {
          lastMod: skillDate,
          avatarUrl: skill.avatarUrl ?? null
        })
      }
    }

    // Owner routes
    const ownerRoutes: MetadataRoute.Sitemap = Array.from(ownerMap.entries()).map(
      ([owner, data]) => ({
        url: `${siteUrl}/${owner}`,
        lastModified: data.lastMod,
        changeFrequency: "weekly",
        priority: 0.6,
      })
    )

    // Calculate available slots for skills
    const reservedSlots = staticRoutes.length + categoryRoutes.length + ownerRoutes.length
    const availableSlots = MAX_URLS_PER_SITEMAP - reservedSlots

    // Skill routes with dynamic priority based on stars
    const skillRoutes: MetadataRoute.Sitemap = skills
      .slice(0, availableSlots)
      .map((skill) => ({
        url: `${siteUrl}/${skill.owner}/skills/${skill.slug}`,
        lastModified: skill.repoUpdatedAt ?? skill.updatedAt ?? skill.indexedAt ?? now,
        changeFrequency: "weekly",
        priority: calculateSkillPriority(skill.stars),
      }))

    return [...staticRoutes, ...categoryRoutes, ...ownerRoutes, ...skillRoutes]
  } catch (error) {
    console.error("[sitemap] Error generating sitemap:", error)
    return staticRoutes
  }
}

/**
 * Calculate priority based on GitHub stars
 * - 1000+ stars: 0.9
 * - 500+ stars: 0.85
 * - 100+ stars: 0.8
 * - 50+ stars: 0.75
 * - 10+ stars: 0.7
 * - Default: 0.65
 */
function calculateSkillPriority(stars: number | null): number {
  if (!stars) return 0.65
  if (stars >= 1000) return 0.9
  if (stars >= 500) return 0.85
  if (stars >= 100) return 0.8
  if (stars >= 50) return 0.75
  if (stars >= 10) return 0.7
  return 0.65
}
