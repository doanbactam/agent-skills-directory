"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { createHash } from "crypto"
import { inArray, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { skills, skillCategories, type NewSkill } from "@/lib/db/schema"
import {
  batchUpsertSkills,
  batchLinkSkillsToCategories,
  approveSkill as dbApproveSkill,
} from "@/lib/db/queries"
import { batchFetchSkills, discoverAllSkillFilesInRepo } from "@/lib/features/skills/github-graphql"
import { parseSkillMd, normalizeAllowedTools } from "@/lib/features/skills/parser"
import { toSkillIdentity, isLikelyAgentSkill } from "@/lib/features/skills/canonical"
import { mapSkillToCategories, parseTopics } from "@/lib/categories"
import { slugify } from "@/lib/utils"
import { checkRateLimitInMemory, reportRateLimit } from "@/lib/rate-limit"
import { inngest } from "@/lib/inngest/client"
import { skillSubmissionSchema, skillUpdateSchema, type SkillSubmission, type SkillUpdate } from "@/lib/validators/skills"
import { checkAdminAuth } from "@/lib/auth"
import { env } from "@/lib/env"

const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

async function getRateLimitKey() {
  const headersList = await headers()
  const forwarded = headersList.get("x-forwarded-for")
  const realIp = headersList.get("x-real-ip")
  const clientIP = forwarded?.split(",")[0]?.trim() || realIp?.trim() || "unknown"

  if (clientIP !== "unknown") {
    return `submission:${clientIP}`
  }

  const userAgent = headersList.get("user-agent") ?? "unknown"
  const acceptLanguage = headersList.get("accept-language") ?? "unknown"
  const raw = `${userAgent}|${acceptLanguage}`
  const hash = createHash("sha256").update(raw).digest("hex").slice(0, 24)
  return `submission:ua:${hash}`
}

export type SubmissionResult = {
  success: boolean
  error?: string
  status?: string
  message?: string
  total?: number
  approved?: number
  failed?: number | Array<{ path: string; error: string }>
  already?: number
  skill?: { id: string; owner: string; slug: string; name: string }
  skills?: Array<{ id: string; owner: string; slug: string; name: string; path: string }>
}

export async function submitSkill(data: SkillSubmission): Promise<SubmissionResult> {
  const validation = skillSubmissionSchema.safeParse(data)
  if (!validation.success) {
    return { success: false, error: "Invalid submission data" }
  }

  const { repoUrl, skillPath: inputSkillPath, submittedBy } = validation.data

  const rateLimitKey = await getRateLimitKey()
  let allowed = true

  // Defense in depth: Distributed rate limiting
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    try {
      const { success } = await reportRateLimit.limit(rateLimitKey)
      allowed = success
    } catch (error) {
      console.warn("Rate limit error (Redis), falling back to in-memory:", error)
      const result = checkRateLimitInMemory({
        key: rateLimitKey,
        max: RATE_LIMIT,
        windowMs: RATE_WINDOW_MS,
      })
      allowed = result.allowed
    }
  } else {
    // Fallback: In-memory rate limiting
    const result = checkRateLimitInMemory({
      key: rateLimitKey,
      max: RATE_LIMIT,
      windowMs: RATE_WINDOW_MS,
    })
    allowed = result.allowed
  }

  if (!allowed) {
    return { success: false, error: "Too many requests. Please try again later." }
  }

  try {
    const normalizedInput = repoUrl.trim()
    const parsedUrl = new URL(normalizedInput)
    const segments = parsedUrl.pathname.replace(/\/+$/, "").split("/").filter(Boolean)
    if (segments.length < 2) return { success: false, error: "Invalid GitHub repository URL" }

    const owner = segments[0]
    const repo = segments[1].replace(/\.git$/, "")

    let skillPaths: string[] = []
    const needsDiscovery = !inputSkillPath || inputSkillPath.trim() === "" || inputSkillPath.includes("*")

    if (needsDiscovery) {
      skillPaths = await discoverAllSkillFilesInRepo(owner, repo)

      if (skillPaths.length === 0) {
        return {
          success: false,
          error: "No SKILL.md found in repository",
        }
      }
    } else {
      skillPaths = [inputSkillPath]
    }

    const skillItems = skillPaths.map(path => ({ owner, repo, path }))
    const skillDataMap = await batchFetchSkills(skillItems)

    const approvedSkills: Array<{ id: string; owner: string; slug: string; name: string; path: string }> = []
    const upToDateSkills: Array<{ id: string; owner: string; slug: string; name: string; path: string }> = []
    const failedSkills: Array<{ path: string; error: string }> = []
    const skillsToUpsert: NewSkill[] = []
    const categoryLinks: Array<{ skillId: string; categoryIds: string[] }> = []
    const needsAiCategories = new Set<string>()

    const canonicalIds = skillPaths.map((path) => toSkillIdentity(owner, repo, path).canonicalId)
    const existingSkills = canonicalIds.length > 0
      ? await db
          .select({
            id: skills.id,
            blobSha: skills.blobSha,
            status: skills.status,
            owner: skills.owner,
            slug: skills.slug,
            name: skills.name,
            path: skills.path,
          })
          .from(skills)
          .where(inArray(skills.id, canonicalIds))
      : []
    const existingById = new Map(existingSkills.map((skill) => [skill.id, skill]))

    for (const path of skillPaths) {
      const lookupKey = `${owner}/${repo}/${path}`
      const data = skillDataMap.get(lookupKey)
      const identity = toSkillIdentity(owner, repo, path)
      const existing = existingById.get(identity.canonicalId)

      if (!data || !data.content) {
        failedSkills.push({ path, error: "Failed to fetch - file not found or empty" })
        continue
      }

      const isApprovedAndSameBlob =
        existing?.status === "approved" &&
        existing?.blobSha &&
        data.sha &&
        existing.blobSha === data.sha

      if (isApprovedAndSameBlob) {
        const existingInfo = {
          id: identity.canonicalId,
          owner: existing?.owner ?? identity.owner,
          slug: existing?.slug ?? slugify(existing?.name ?? identity.repo),
          name: existing?.name ?? identity.repo,
          path: existing?.path ?? identity.path,
        }
        upToDateSkills.push(existingInfo)
        approvedSkills.push(existingInfo)
        continue
      }

      const parsedSkill = parseSkillMd(data.content)
      if (!parsedSkill.success) {
        failedSkills.push({ path, error: `Invalid format: ${parsedSkill.error}` })
        continue
      }

      if (!isLikelyAgentSkill(parsedSkill.data.name, parsedSkill.data.description)) {
        failedSkills.push({ path, error: "Not a valid Agent Skill - placeholder or test content" })
        continue
      }

      const skill: NewSkill = {
        id: identity.canonicalId,
        name: parsedSkill.data.name,
        slug: slugify(parsedSkill.data.name),
        description: parsedSkill.data.description,
        owner: identity.owner,
        repo: identity.repo,
        path: identity.path,
        url: `https://github.com/${identity.owner}/${identity.repo}/blob/HEAD/${identity.path}`,
        rawUrl: `https://raw.githubusercontent.com/${identity.owner}/${identity.repo}/HEAD/${identity.path}`,
        compatibility: parsedSkill.data.compatibility ?? null,
        allowedTools: normalizeAllowedTools(parsedSkill.data["allowed-tools"])
          ? JSON.stringify(normalizeAllowedTools(parsedSkill.data["allowed-tools"]))
          : null,
        stars: data.stars,
        forks: data.forks,
        avatarUrl: data.avatarUrl,
        topics: data.topics?.length ? JSON.stringify(data.topics) : "[]",
        isArchived: data.isArchived,
        blobSha: data.sha,
        lastSeenAt: new Date(),
        repoUpdatedAt: data.pushedAt ? new Date(data.pushedAt) : null,
        fileUpdatedAt: data.fileCommittedAt ? new Date(data.fileCommittedAt) : null,
        submittedBy: submittedBy ?? null,
        status: "approved",
      }

      skillsToUpsert.push(skill)
      approvedSkills.push({
        id: skill.id,
        owner: skill.owner,
        slug: skill.slug,
        name: skill.name,
        path: skill.path,
      })

      const topics = parseTopics(data.topics?.length ? JSON.stringify(data.topics) : "[]")
      const catIds = mapSkillToCategories(parsedSkill.data.name, parsedSkill.data.description, topics)
      if (catIds.length > 0) {
        categoryLinks.push({ skillId: skill.id, categoryIds: catIds })
      } else {
        needsAiCategories.add(skill.id)
      }
    }

    if (approvedSkills.length === 0) {
      return {
        success: false,
        error: "No valid skills found",
        failed: failedSkills,
      }
    }

    await batchUpsertSkills(skillsToUpsert)

    const skillIds = skillsToUpsert.map((skill) => skill.id)
    if (skillIds.length > 0) {
      await db.delete(skillCategories).where(inArray(skillCategories.skillId, skillIds))
    }
    if (categoryLinks.length > 0) {
      await batchLinkSkillsToCategories(categoryLinks)
    }

    const aiCategoryIds = Array.from(needsAiCategories)
    if (aiCategoryIds.length > 0) {
      try {
        await inngest.send({
          name: "categories/assign.ai",
          data: { skillIds: aiCategoryIds, mode: "insert-if-empty" },
        })
      } catch (error) {
        console.error("Failed to enqueue AI categorization:", error)
      }
    }

    const isMultiple = approvedSkills.length > 1

    revalidatePath("/")
    revalidatePath("/skills")
    for (const skill of approvedSkills) {
      revalidatePath(`/${skill.owner}`)
      revalidatePath(`/${skill.owner}/skills/${skill.slug}`)
    }

    return {
      success: true,
      status: "approved",
      total: skillPaths.length,
      approved: approvedSkills.length,
      failed: failedSkills.length > 0 ? failedSkills : undefined,
      already: upToDateSkills.length,
      skill: !isMultiple ? {
        id: approvedSkills[0].id,
        owner: approvedSkills[0].owner,
        slug: approvedSkills[0].slug,
        name: approvedSkills[0].name,
      } : undefined,
      skills: isMultiple ? approvedSkills : undefined,
      message: isMultiple 
        ? `${approvedSkills.length} skills approved and published!`
        : "Skill approved and published!",
    }

  } catch (error) {
    console.error("Submission error:", error)
    return { success: false, error: "Failed to submit skill" }
  }
}

// Admin Actions
// Note: These functions are kept for backward compatibility
// New admin actions are in lib/actions/admin-skills.ts

export async function updateSkill(skillId: string, updates: SkillUpdate, categories?: string[]) {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  const validation = skillUpdateSchema.safeParse(updates)
  if (!validation.success) {
    throw new Error("Invalid update data")
  }

  const { name, description, status, isVerifiedOrg } = validation.data

  await db.update(skills).set({
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(status !== undefined && { status }),
    ...(isVerifiedOrg !== undefined && { isVerifiedOrg }),
    updatedAt: new Date(),
  }).where(eq(skills.id, skillId))

  if (categories) {
    await db.delete(skillCategories).where(eq(skillCategories.skillId, skillId))
    if (categories.length > 0) {
      await batchLinkSkillsToCategories(categories.map(c => ({ skillId, categoryIds: [c] })))
    }
  }

  revalidatePath("/admin")
  return { success: true }
}

export async function deleteSkill(skillId: string) {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  await db.delete(skills).where(eq(skills.id, skillId))
  revalidatePath("/admin")
  return { success: true }
}

export async function approveSkill(skillId: string) {
  const isAdmin = await checkAdminAuth()
  if (!isAdmin) {
    throw new Error("Unauthorized")
  }

  await dbApproveSkill(skillId)
  revalidatePath("/admin")
  return { success: true }
}

