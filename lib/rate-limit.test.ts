import { describe, it, expect } from "bun:test";
import { checkRateLimitInMemory } from "./rate-limit-memory";

describe("checkRateLimitInMemory", () => {
  it("should allow requests within the limit", () => {
    const key = "test-client-1";
    const max = 5;
    const windowMs = 1000;

    for (let i = 0; i < max; i++) {
      const result = checkRateLimitInMemory({ key, max, windowMs });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(max - 1 - i);
    }
  });

  it("should block requests exceeding the limit", () => {
    const key = "test-client-2";
    const max = 5;
    const windowMs = 1000;

    // Use up the limit
    for (let i = 0; i < max; i++) {
      checkRateLimitInMemory({ key, max, windowMs });
    }

    // Next request should be blocked
    const result = checkRateLimitInMemory({ key, max, windowMs });
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("should reset the limit after the window expires", async () => {
    const key = "test-client-3";
    const max = 5;
    const windowMs = 50; // Short window for testing

    // Use up the limit
    for (let i = 0; i < max; i++) {
      checkRateLimitInMemory({ key, max, windowMs });
    }

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, windowMs + 10));

    // Should be allowed again
    const result = checkRateLimitInMemory({ key, max, windowMs });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(max - 1);
  });

  it("should enforce cleanup when map grows too large", () => {
    // Generate many unique keys to trigger cleanup
    // MAX_BUCKETS is 10000 in lib/rate-limit-memory.ts
    const MAX_BUCKETS = 10000;
    const keyPrefix = "stress-test-";
    const max = 5;
    const windowMs = 60000;

    // Fill the map up to the limit + extra to trigger cleanup
    // This also implicitly tests memory usage doesn't explode
    for (let i = 0; i < MAX_BUCKETS + 500; i++) {
      checkRateLimitInMemory({ key: `${keyPrefix}${i}`, max, windowMs });
    }

    // The cleanup should have triggered.
    // Check if a new request works
    const result = checkRateLimitInMemory({ key: "new-client", max, windowMs });
    expect(result.allowed).toBe(true);
  });
});
