import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"

// Rate limiters for different use cases
// Using sliding window algorithm for smooth rate limiting

// General API rate limiter: 100 requests per minute
export const apiRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"),
  analytics: true,
  prefix: "ratelimit:api",
})

// Strict rate limiter for sensitive endpoints: 10 requests per minute
export const strictRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit:strict",
})

// Report/submission rate limiter: 5 requests per hour
export const reportRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"),
  analytics: true,
  prefix: "ratelimit:report",
})

// Helper function to get client identifier
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  return forwarded?.split(",")[0]?.trim() ?? realIp ?? "anonymous"
}

// Legacy in-memory rate limiter (fallback when Redis unavailable)
type RateLimitOptions = {
  key: string
  max: number
  windowMs: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

// Limit the number of in-memory buckets to prevent memory leaks/DoS
export const MAX_BUCKETS = 10000
const buckets = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimitInMemory({ key, max, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const existing = buckets.get(key)

  // If new key (or expired - handled in next block but we want to cleanup first if new)
  if (!existing) {
    if (buckets.size >= MAX_BUCKETS) {
      // 1. Cleanup expired keys first
      for (const [k, v] of buckets.entries()) {
        if (v.resetAt <= now) {
          buckets.delete(k)
        }
      }

      // 2. If still full, remove oldest (LRU-ish approximation)
      if (buckets.size >= MAX_BUCKETS) {
        const firstKey = buckets.keys().next().value
        if (firstKey !== undefined) buckets.delete(firstKey)
      }
    }
  }

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt }
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  const nextCount = existing.count + 1
  buckets.set(key, { count: nextCount, resetAt: existing.resetAt })
  return { allowed: true, remaining: max - nextCount, resetAt: existing.resetAt }
}
