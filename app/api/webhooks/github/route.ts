import { NextResponse } from "next/server"
import { inngest } from "@/lib/inngest/client"
import { env } from "@/lib/env"
import { apiRateLimit, checkRateLimitInMemory, getClientIdentifier } from "@/lib/rate-limit"
import { verifySignature } from "@/lib/features/github/verify-signature"

type PushEvent = {
  ref: string
  repository: {
    owner: { login: string }
    name: string
    full_name: string
  }
  commits?: Array<{
    added: string[]
    modified: string[]
    removed: string[]
  }>
  head_commit?: {
    added: string[]
    modified: string[]
    removed: string[]
  }
}

function extractSkillPaths(event: PushEvent): string[] {
  const paths = new Set<string>()
  
  const checkPath = (path: string) => {
    if (path.endsWith("SKILL.md")) {
      paths.add(path)
    }
  }
  
  if (event.head_commit) {
    event.head_commit.added?.forEach(checkPath)
    event.head_commit.modified?.forEach(checkPath)
  }
  
  event.commits?.forEach((commit) => {
    commit.added?.forEach(checkPath)
    commit.modified?.forEach(checkPath)
  })
  
  return Array.from(paths)
}

export async function POST(request: Request) {
  try {
    // Rate Limiting
    const identifier = getClientIdentifier(request)
    const hasRedis = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

    let allowed = true
    if (hasRedis) {
      try {
        const { success } = await apiRateLimit.limit(identifier)
        allowed = success
      } catch (error) {
        console.error("Rate limit error (Redis), falling back to in-memory:", error)
        const fallback = checkRateLimitInMemory({ key: identifier, max: 100, windowMs: 60000 })
        allowed = fallback.allowed
      }
    } else {
      const fallback = checkRateLimitInMemory({ key: identifier, max: 100, windowMs: 60000 })
      allowed = fallback.allowed
    }

    if (!allowed) {
      console.warn(`Rate limit exceeded for webhook from ${identifier}`)
      return NextResponse.json({ error: "Too many requests" }, { status: 429 })
    }

    const rawBody = await request.text()
    const signature = request.headers.get("x-hub-signature-256")
    const eventType = request.headers.get("x-github-event")

    if (!env.GITHUB_WEBHOOK_SECRET) {
      console.error("GITHUB_WEBHOOK_SECRET is not set. Cannot verify webhook signature.")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }
    
    if (!verifySignature(rawBody, signature, env.GITHUB_WEBHOOK_SECRET)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
    
    if (eventType === "ping") {
      return NextResponse.json({ message: "pong" })
    }
    
    if (eventType !== "push") {
      return NextResponse.json({ message: `Ignored event: ${eventType}` })
    }
    
    const event = JSON.parse(rawBody) as PushEvent
    const skillPaths = extractSkillPaths(event)
    
    if (skillPaths.length === 0) {
      return NextResponse.json({ message: "No SKILL.md files changed" })
    }
    
    const owner = event.repository.owner.login
    const repo = event.repository.name
    const ref = event.ref
    
    const events = skillPaths.map((path) => ({
      name: "github/push" as const,
      data: { owner, repo, path, ref },
    }))
    
    await inngest.send(events)
    
    return NextResponse.json({
      success: true,
      message: `Triggered sync for ${skillPaths.length} skill(s)`,
      skills: skillPaths,
    })
  } catch (error) {
    console.error("GitHub webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
