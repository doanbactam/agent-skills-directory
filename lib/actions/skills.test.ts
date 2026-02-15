import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock dependencies BEFORE importing the module under test
mock.module("next/headers", () => ({
  headers: async () => new Map([["x-forwarded-for", "127.0.0.1"]]),
}));

mock.module("next/cache", () => ({
  revalidatePath: () => {},
}));

mock.module("@/lib/db", () => ({
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: () => [] }) }) }),
    insert: () => ({ values: () => ({ onConflictDoUpdate: () => {} }) }),
    delete: () => ({ where: () => {} }),
    update: () => ({ set: () => ({ where: () => {} }) }),
  },
}));

mock.module("@/lib/features/skills/github-graphql", () => ({
  discoverAllSkillFilesInRepo: async () => [],
  batchFetchSkills: async () => new Map(),
}));

mock.module("@/lib/inngest/client", () => ({
  inngest: { send: async () => {} },
}));

const mockLimit = mock(() => Promise.resolve({ success: true, limit: 10, remaining: 9, reset: 0 }));
const mockCheckInMemory = mock(() => ({ allowed: true }));

mock.module("@/lib/rate-limit", () => ({
  reportRateLimit: {
    limit: mockLimit,
  },
  checkRateLimitInMemory: mockCheckInMemory,
}));

// Mutable env mock
const mockEnv = {
  UPSTASH_REDIS_REST_URL: "https://example.com",
  UPSTASH_REDIS_REST_TOKEN: "token",
};

mock.module("@/lib/env", () => ({
  env: mockEnv,
}));

// Import the module under test
import { submitSkill } from "./skills";

describe("submitSkill rate limiting", () => {
  beforeEach(() => {
    mockLimit.mockClear();
    mockCheckInMemory.mockClear();
    // Reset env
    mockEnv.UPSTASH_REDIS_REST_URL = "https://example.com";
    mockEnv.UPSTASH_REDIS_REST_TOKEN = "token";
  });

  it("should use Redis rate limit when configured", async () => {
    await submitSkill({ repoUrl: "https://github.com/owner/repo" });
    expect(mockLimit).toHaveBeenCalled();
  });

  it("should fall back to in-memory when Redis is not configured", async () => {
    // Simulate missing env
    mockEnv.UPSTASH_REDIS_REST_URL = undefined;

    await submitSkill({ repoUrl: "https://github.com/owner/repo" });

    expect(mockLimit).not.toHaveBeenCalled();
    expect(mockCheckInMemory).toHaveBeenCalled();
  });

  it("should fall back to in-memory when Redis fails", async () => {
    // Simulate Redis failure
    mockLimit.mockRejectedValueOnce(new Error("Redis error"));

    await submitSkill({ repoUrl: "https://github.com/owner/repo" });

    expect(mockLimit).toHaveBeenCalled();
    expect(mockCheckInMemory).toHaveBeenCalled();
  });
});
