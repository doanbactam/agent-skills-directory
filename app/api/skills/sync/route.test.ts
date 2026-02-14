import { describe, it, expect, mock } from "bun:test";

// Mock @clerk/nextjs/server FIRST
mock.module("@clerk/nextjs/server", () => {
  return {
    auth: () => ({ userId: "test-user" }),
    currentUser: () => Promise.resolve({ publicMetadata: { role: "user" } }),
  };
});

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

// Mock lib/features/skills/github-rest
mock.module("@/lib/features/skills/github-rest", () => ({
  searchSkills: () => Promise.resolve({
    skills: [],
    total: 0
  })
}));

// Mock lib/db/queries
mock.module("@/lib/db/queries", () => ({
  batchUpsertSkills: () => Promise.resolve({ inserted: 0 })
}));

// Mock lib/utils
mock.module("@/lib/utils", () => ({
  slugify: (str: string) => str.toLowerCase().replace(/ /g, "-")
}));

describe("Sync All Auth", () => {
  it("should fail closed (500) if SYNC_SECRET_TOKEN is missing", async () => {
    // Mock lib/env
    mock.module("@/lib/env", () => ({
      env: {
        SYNC_SECRET_TOKEN: undefined
      }
    }));

    // Re-import route to apply mock
    const { POST } = await import("./route");

    const request = new Request("http://localhost/api/skills/sync", {
      method: "POST",
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Server configuration error");
  });
});
