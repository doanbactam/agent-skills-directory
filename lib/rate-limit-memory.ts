export type RateLimitOptions = {
  key: string
  max: number
  windowMs: number
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetAt: number
}

const buckets = new Map<string, { count: number; resetAt: number }>()
const MAX_BUCKETS = 10000 // Prevent memory leaks by capping the number of tracked clients

export function checkRateLimitInMemory({ key, max, windowMs }: RateLimitOptions): RateLimitResult {
  const now = Date.now()

  // Defense in depth: Cleanup if map grows too large to prevent DoS via memory exhaustion
  if (buckets.size >= MAX_BUCKETS) {
    // 1. Remove expired entries first
    for (const [k, v] of buckets.entries()) {
      if (v.resetAt <= now) {
        buckets.delete(k)
      }
    }

    // 2. If still full, remove oldest entries (Map iterates in insertion order)
    if (buckets.size >= MAX_BUCKETS) {
      const itemsToRemove = Math.ceil(MAX_BUCKETS * 0.1) // Remove oldest 10%
      let removed = 0
      for (const k of buckets.keys()) {
        buckets.delete(k)
        removed++
        if (removed >= itemsToRemove) break
      }
    }
  }

  const existing = buckets.get(key)

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
