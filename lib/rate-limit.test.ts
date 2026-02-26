import { describe, it, expect, mock } from "bun:test"

// Mock external dependencies
mock.module("@upstash/ratelimit", () => ({
  Ratelimit: class {
    constructor() {}
    static slidingWindow() {}
  }
}))

mock.module("@/lib/redis", () => ({
  redis: {}
}))

describe("checkRateLimitInMemory", () => {
  it("should allow requests within limit", async () => {
    const { checkRateLimitInMemory } = await import("./rate-limit")
    const key = "test-key-1"
    const max = 5
    const windowMs = 1000

    for (let i = 0; i < max; i++) {
      const result = checkRateLimitInMemory({ key, max, windowMs })
      expect(result.allowed).toBe(true)
      expect(result.remaining).toBe(max - 1 - i)
    }
  })

  it("should block requests exceeding limit", async () => {
    const { checkRateLimitInMemory } = await import("./rate-limit")
    const key = "test-key-2"
    const max = 3
    const windowMs = 1000

    // Consume all tokens
    for (let i = 0; i < max; i++) {
      checkRateLimitInMemory({ key, max, windowMs })
    }

    // Exceed limit
    const result = checkRateLimitInMemory({ key, max, windowMs })
    expect(result.allowed).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it("should reset after window expires", async () => {
    const { checkRateLimitInMemory } = await import("./rate-limit")
    const key = "test-key-3"
    const max = 2
    const windowMs = 10

    checkRateLimitInMemory({ key, max, windowMs })
    checkRateLimitInMemory({ key, max, windowMs }) // limit reached

    await new Promise(resolve => setTimeout(resolve, 15))

    const result = checkRateLimitInMemory({ key, max, windowMs })
    expect(result.allowed).toBe(true)
    expect(result.remaining).toBe(max - 1)
  })

  it("should enforce MAX_BUCKETS limit (LRU eviction)", async () => {
    const { checkRateLimitInMemory, MAX_BUCKETS } = await import("./rate-limit")

    // Skip if MAX_BUCKETS not exported (e.g. before implementation)
    // We assume 10000 if not exported, but for this test we need the exact value.
    const limit = MAX_BUCKETS || 10000
    const max = 5
    const windowMs = 10000 // Long window

    // 1. Add key1
    const key1 = "eviction-test-key-1"
    checkRateLimitInMemory({ key: key1, max, windowMs }) // count=1

    // 2. Fill up to limit (adding limit-1 more keys)
    for (let i = 0; i < limit; i++) {
        checkRateLimitInMemory({ key: `filler-${i}`, max, windowMs })
    }

    // 3. Access key1 again. Should be evicted -> reset count
    const result = checkRateLimitInMemory({ key: key1, max, windowMs })
    expect(result.remaining).toBe(max - 1)
  })
})

describe("getClientIdentifier", () => {
  it("should prioritize X-Forwarded-For over X-Real-IP", async () => {
    const { getClientIdentifier } = await import("./rate-limit")
    const req = new Request("http://localhost", {
      headers: {
        "x-real-ip": "spoofed-ip",
        "x-forwarded-for": "client-ip, real-proxy-ip"
      }
    })
    // Should take the last IP from X-Forwarded-For (trusted proxy behavior)
    // ignoring the spoofed X-Real-IP
    expect(getClientIdentifier(req)).toBe("real-proxy-ip")
  })

  it("should fallback to X-Real-IP if X-Forwarded-For is missing", async () => {
    const { getClientIdentifier } = await import("./rate-limit")
    const req = new Request("http://localhost", {
      headers: {
        "x-real-ip": "real-ip"
      }
    })
    expect(getClientIdentifier(req)).toBe("real-ip")
  })

  it("should use the last IP from X-Forwarded-For", async () => {
    const { getClientIdentifier } = await import("./rate-limit")
    const req = new Request("http://localhost", {
      headers: {
        "x-forwarded-for": "spoofed-ip, real-ip"
      }
    })
    expect(getClientIdentifier(req)).toBe("real-ip")
  })

  it("should handle single IP in X-Forwarded-For", async () => {
    const { getClientIdentifier } = await import("./rate-limit")
    const req = new Request("http://localhost", {
      headers: {
        "x-forwarded-for": "single-ip"
      }
    })
    expect(getClientIdentifier(req)).toBe("single-ip")
  })

  it("should return anonymous if no headers present", async () => {
    const { getClientIdentifier } = await import("./rate-limit")
    const req = new Request("http://localhost")
    expect(getClientIdentifier(req)).toBe("anonymous")
  })
})
