import { NextResponse } from "next/server"
import { searchSkills } from "@/lib/features/skills/github-rest"
import { batchUpsertSkills } from "@/lib/db/queries"
import type { NewSkill } from "@/lib/db/schema"
import { env } from "@/lib/env"
import { slugify } from "@/lib/utils"
import { verifyBearerToken } from "@/lib/auth"

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization")
  const expectedToken = env.SYNC_SECRET_TOKEN

  if (!expectedToken) {
    console.error("SYNC_SECRET_TOKEN is not set")
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    )
  }

  if (!verifyBearerToken(authHeader, expectedToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const allSkills: NewSkill[] = []
    let page = 1
    const maxPages = 10

    while (page <= maxPages) {
      const { skills, total } = await searchSkills("", page, 30)

      const dbSkills: NewSkill[] = skills.map((skill) => {
        const owner = skill.owner.toLowerCase()
        const repo = skill.repo.toLowerCase()
        return ({
          id: `${owner}/${repo}/${skill.path}`,
          name: skill.name,
          slug: slugify(skill.name),
          description: skill.description,
          owner,
          repo,
          path: skill.path,
          url: skill.url,
          rawUrl: skill.rawUrl,
        compatibility: skill.compatibility ?? null,
        allowedTools: skill.allowedTools ? JSON.stringify(skill.allowedTools) : null,
        stars: skill.stars ?? 0,
        forks: skill.forks ?? 0,
        avatarUrl: skill.avatarUrl ?? null,
        repoUpdatedAt: skill.updatedAt ? new Date(skill.updatedAt) : null,
        })
      })

      allSkills.push(...dbSkills)

      if (skills.length < 30 || page * 30 >= total) break
      page++

      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    await batchUpsertSkills(allSkills)

    return NextResponse.json({
      success: true,
      synced: allSkills.length,
      pages: page,
    })
  } catch (error) {
    console.error("Sync failed:", error)
    return NextResponse.json(
      { error: "Sync failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
