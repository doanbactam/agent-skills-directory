import { NextResponse } from "next/server"
import { inngest } from "@/lib/inngest/client"
import { getRecentSyncJobs } from "@/lib/db/queries"
import { requireAdmin } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Prevent CSRF by enforcing Content-Type: application/json
  // This triggers a preflight request for cross-origin calls, preventing simple requests
  const contentType = request.headers.get("content-type")
  if (!contentType?.includes("application/json")) {
    return NextResponse.json(
      { error: "Unsupported Media Type. Content-Type must be application/json" },
      { status: 415 }
    )
  }

  const body = await request.json()
  const { type, ...params } = body

  try {
    switch (type) {
      case "metadata":
        await inngest.send({ name: "sync/metadata", data: {} })
        break

      case "repo":
        if (!params.owner || !params.repo) {
          return NextResponse.json(
            { error: "Missing owner or repo for repo sync" },
            { status: 400 }
          )
        }
        await inngest.send({
          name: "repo/trigger-sync",
          data: {
            owner: params.owner,
            repo: params.repo,
            submittedBy: params.submittedBy,
            status: params.status ?? "pending",
          },
        })
        break

      case "reindex":
        if (!params.skillId) {
          return NextResponse.json(
            { error: "Missing skillId for reindex" },
            { status: 400 }
          )
        }
        await inngest.send({
          name: "skill/reindex",
          data: {
            skillId: params.skillId,
            refreshCategories: params.refreshCategories ?? false,
          },
        })
        break

      default:
        return NextResponse.json(
          { error: "Invalid sync type. Supported: metadata, repo, reindex" },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `${type} sync triggered`,
    })
  } catch (error) {
    console.error("Failed to trigger sync:", error)
    return NextResponse.json({ error: "Failed to trigger sync" }, { status: 500 })
  }
}

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const jobs = await getRecentSyncJobs()
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Failed to get sync jobs:", error)
    return NextResponse.json({ error: "Failed to get sync jobs" }, { status: 500 })
  }
}
