import { describe, it, expect, beforeEach } from "bun:test"
import { withServerCache, invalidateCache, getCacheStats } from "./server-cache"

describe("server-cache", () => {
  beforeEach(() => {
    invalidateCache() // Clear cache
  })

  it("should cache values", async () => {
    const key = "test-key"
    const value = "test-value"

    const result = await withServerCache(key, 1000, async () => value)
    expect(result).toBe(value)

    const stats = getCacheStats()
    expect(stats.size).toBe(1)
  })

  it("should invalidate cache with wildcard", async () => {
    await withServerCache("test-key-1", 1000, async () => "value1")
    await withServerCache("test-key-2", 1000, async () => "value2")
    await withServerCache("other-key", 1000, async () => "value3")

    // Use * as wildcard instead of regex .*
    invalidateCache("test-*")

    const stats = getCacheStats()
    expect(stats.size).toBe(1) // only "other-key" should remain
  })

  it("should prevent regex vulnerability", async () => {
    // This test confirms that the implementation treats input as literal (with wildcard support)
    // and DOES NOT interpret regex characters like +, (, )
    await withServerCache("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!", 1000, async () => "value")

    // This pattern would be dangerous if interpreted as regex
    // Now it should be treated as literal "(a+)+" which doesn't match the key
    invalidateCache("(a+)+")

    // Cache should remain intact because the key doesn't contain "(a+)+" literally
    const stats = getCacheStats()
    expect(stats.size).toBe(1)
  })

  it("should match literal regex characters", async () => {
    // Verify that special characters are treated literally
    await withServerCache("key-with-(parens)", 1000, async () => "value")

    invalidateCache("key-with-(parens)")

    const stats = getCacheStats()
    expect(stats.size).toBe(0)
  })
})
