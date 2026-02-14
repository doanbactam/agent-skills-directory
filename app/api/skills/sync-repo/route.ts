import { NextResponse } from "next/server"
import { syncRepoSkills } from "@/lib/features/skills/sync"
import { env } from "@/lib/env"
import { verifyBearerToken } from "@/lib/auth"

/**
 * POST /api/skills/sync-repo
 * 
 * Sync ALL SKILL.md files from a GitHub repository.
 * Automatically discovers and imports all skills.
 * 
 * @example
 * curl -X POST https://yoursite.com/api/skills/sync-repo \
 *   -H "Authorization: Bearer YOUR_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"repoUrl": "https://github.com/anthropics/skills"}'
 * 
 * Or with owner/repo:
 *   -d '{"owner": "anthropics", "repo": "skills"}'
 */
export async function POST(request: Request) {
  // Auth check
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
    const body = await request.json()
    
    let owner: string
    let repo: string
    
    // Support both formats:
    // 1. { repoUrl: "https://github.com/owner/repo" }
    // 2. { owner: "owner", repo: "repo" }
    if (body.repoUrl) {
      const match = body.repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
      if (!match) {
        return NextResponse.json(
          { error: "Invalid GitHub URL. Expected format: https://github.com/owner/repo" },
          { status: 400 }
        )
      }
      owner = match[1]
      repo = match[2].replace(/\.git$/, "")
    } else if (body.owner && body.repo) {
      owner = body.owner
      repo = body.repo
    } else {
      return NextResponse.json(
        { error: "Missing required fields. Provide either 'repoUrl' or 'owner' and 'repo'" },
        { status: 400 }
      )
    }

    const result = await syncRepoSkills(owner, repo, {
      submittedBy: body.submittedBy,
      status: body.autoApprove ? "approved" : "pending",
    })

    if (!result.success && result.errors.length > 0 && result.synced === 0) {
      return NextResponse.json(
        { 
          error: "Sync failed", 
          details: result.errors 
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      owner: result.owner,
      repo: result.repo,
      total: result.total,
      synced: result.synced,
      failed: result.failed,
      skills: result.skills,
      errors: result.errors.length > 0 ? result.errors : undefined,
    })
  } catch (error) {
    console.error("Sync repo failed:", error)
    return NextResponse.json(
      { 
        error: "Sync failed", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
