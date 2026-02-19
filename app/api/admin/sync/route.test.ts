
import { describe, it, expect, mock } from "bun:test";

// Mock dependencies
mock.module("@/lib/auth", () => ({
  requireAdmin: async () => Promise.resolve(),
}));

mock.module("@/lib/inngest/client", () => ({
  inngest: {
    send: mock(() => Promise.resolve()),
  },
}));

mock.module("@/lib/db/queries", () => ({
  getRecentSyncJobs: async () => [],
}));

// Mock NextResponse
mock.module("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      Response.json(body, init),
  },
}));

// Import the route handler
// We use dynamic import to ensure mocks are applied if using top-level await,
// but bun test runs modules.
// However, since we used mock.module, we can just import.
import { POST } from "./route";

describe("Admin Sync Route CSRF", () => {
  it("should reject text/plain requests (CSRF protection)", async () => {
    const body = JSON.stringify({ type: "metadata" });
    const req = new Request("http://localhost/api/admin/sync", {
      method: "POST",
      headers: {
        "content-type": "text/plain", // Simple Request header
        "cookie": "admin-session=secret", // Simulate auth cookie
      },
      body,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(415);
    expect(data.error).toContain("Unsupported Media Type");
  });

  it("should accept application/json requests", async () => {
    const body = JSON.stringify({ type: "metadata" });
    const req = new Request("http://localhost/api/admin/sync", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cookie": "admin-session=secret",
      },
      body,
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
