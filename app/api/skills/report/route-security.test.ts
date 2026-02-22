import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock next/server
mock.module("next/server", () => {
  return {
    NextResponse: {
      json: (body: any, init: any) => ({
        status: init?.status || 200,
        headers: new Headers(init?.headers),
        json: async () => body,
      })
    }
  };
});

// Mock DB
mock.module("@/lib/db", () => ({
  db: {
    insert: mock(() => ({ values: () => Promise.resolve() }))
  },
  skillReports: {}
}));

// Mock nanoid
mock.module("nanoid", () => ({
  nanoid: () => "test-id"
}));

// Mock Validators to avoid Zod dependency
mock.module("@/lib/validators/skills", () => ({
  skillReportSchema: {
    safeParse: (body: any) => ({
      success: true,
      data: {
        skillId: "test-skill",
        reason: "spam",
        description: "Test description",
        reporterEmail: "test@example.com",
        ...body
      }
    })
  }
}));

// Mock Rate Limit
const mockLimit = mock(() => Promise.reject(new Error("Redis connection failed")));
const mockCheckInMemory = mock(() => ({ allowed: true, remaining: 5, resetAt: Date.now() + 3600000 }));
const mockGetIdentifier = mock(() => "127.0.0.1");

mock.module("@/lib/rate-limit", () => ({
  reportRateLimit: {
    limit: mockLimit
  },
  getClientIdentifier: mockGetIdentifier,
  checkRateLimitInMemory: mockCheckInMemory
}));

describe("Skill Report Security - Rate Limit Fallback", () => {
  let POST: any;

  beforeEach(async () => {
    // Dynamic import to ensure mocks are applied
    const module = await import("./route");
    POST = module.POST;

    mockLimit.mockClear();
    mockCheckInMemory.mockClear();
    mockGetIdentifier.mockClear();

    // Reset default implementation
    mockLimit.mockImplementation(() => Promise.reject(new Error("Redis connection failed")));
    mockCheckInMemory.mockImplementation(() => ({ allowed: true, remaining: 5, resetAt: Date.now() + 3600000 }));
  });

  it("should fallback to in-memory check when Redis fails", async () => {
    const req = new Request("http://localhost/api/skills/report", {
      method: "POST",
      body: JSON.stringify({
        skillId: "test-skill",
        reason: "spam",
        description: "Test description"
      })
    });

    const res = await POST(req);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);

    expect(mockLimit).toHaveBeenCalled();
    expect(mockCheckInMemory).toHaveBeenCalled();
    const args = mockCheckInMemory.mock.calls[0];
    expect(args[0]).toEqual({
      key: "report:127.0.0.1",
      max: 5,
      windowMs: 3600000
    });
  });

  it("should block request when fallback limit is exceeded", async () => {
    mockCheckInMemory.mockImplementation(() => ({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 3600000
    }));

    const req = new Request("http://localhost/api/skills/report", {
      method: "POST",
      body: JSON.stringify({
        skillId: "test-skill",
        reason: "spam"
      })
    });

    const res = await POST(req);

    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error).toContain("Too many reports");
  });
});
