import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"
export { checkRateLimitInMemory } from "./rate-limit-memory"
export type { RateLimitOptions, RateLimitResult } from "./rate-limit-memory"

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
