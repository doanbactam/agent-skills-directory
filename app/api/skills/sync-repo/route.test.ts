import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock next/server
mock.module("next/server", () => {
  return {
    NextResponse: {
      json: (body: unknown, init?: { status?: number }) => ({
        status: init?.status || 200,
        json: () => Promise.resolve(body),
      }),
    },
  };
});

// Mock lib/features/skills/sync
mock.module("@/lib/features/skills/sync", () => ({
  syncRepoSkills: () => Promise.resolve({
    success: true,
    owner: "test",
    repo: "test",
    total: 1,
    synced: 1,
    failed: 0,
    skills: [],
    errors: []
  })
}));

// Default mock for rate limit
mock.module("@/lib/rate-limit", () => ({
  strictRateLimit: {
    limit: () => Promise.resolve({ success: true, remaining: 10, reset: 0 })
  },
  getClientIdentifier: () => "test-ip"
}));

describe("Sync Repo Auth", () => {
  beforeEach(() => {
    // Reset mocks if needed, though bun:test mocks are usually per-test file or reset manually
  });

  it("should fail closed (500) if SYNC_SECRET_TOKEN is missing", async () => {
    // Mock env to return undefined
    mock.module("@/lib/env", () => ({
      env: {
        SYNC_SECRET_TOKEN: undefined
      }
    }));

    // Ensure rate limit allows this request
    mock.module("@/lib/rate-limit", () => ({
      strictRateLimit: {
        limit: () => Promise.resolve({ success: true, remaining: 10, reset: 0 })
      },
      getClientIdentifier: () => "test-ip"
    }));

    // Re-import route to apply mock
    // Note: In Bun, modules are cached. We might need a way to clear cache or use fresh import path?
    // Usually mock.module handles it for subsequent imports.
    const { POST } = await import("./route");

    const payload = JSON.stringify({ repoUrl: "https://github.com/test/test" });
    const request = new Request("http://localhost/api/skills/sync-repo", {
      method: "POST",
      body: payload,
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Server configuration error");
  });

  it("should return 429 if rate limit exceeded", async () => {
    // Mock rate limit failure
    mock.module("@/lib/rate-limit", () => ({
      strictRateLimit: {
        limit: () => Promise.resolve({ success: false, remaining: 0, reset: 0 })
      },
      getClientIdentifier: () => "test-ip"
    }));

    // Re-import route
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/skills/sync-repo", {
      method: "POST",
    });

    const response = await POST(request);
    expect(response.status).toBe(429);
    const body = await response.json();
    expect(body.error).toBe("Too many requests");
  });
});
