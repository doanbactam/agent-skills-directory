/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { describe, it, expect, mock } from "bun:test";

// Mock next/server
mock.module("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; statusText?: string, headers?: HeadersInit }) => {
      return new Response(JSON.stringify(body), {
        status: init?.status || 200,
        statusText: init?.statusText || "OK",
        headers: { "Content-Type": "application/json", ...init?.headers }
      });
    }
  }
}));

// Mock rate limit
mock.module("@/lib/rate-limit", () => ({
  reportRateLimit: {
    limit: mock(() => Promise.resolve({ success: true, remaining: 10 }))
  },
  getClientIdentifier: () => "127.0.0.1"
}));

// Mock db
mock.module("@/lib/db", () => ({
  db: {
    insert: mock(() => ({
      values: mock(() => Promise.resolve())
    }))
  },
  skillReports: {}
}));

// Mock nanoid
mock.module("nanoid", () => ({
  nanoid: () => "test-id"
}));

import { POST } from "./route";

describe("Skill Report API", () => {
  it("should accept valid report", async () => {
    const payload = {
      skillId: "test-skill-123",
      reason: "spam",
      description: "This is spam",
      reporterEmail: "test@example.com"
    };

    const request = new Request("http://localhost/api/skills/report", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("should reject invalid reason", async () => {
    const payload = {
      skillId: "test-skill-123",
      reason: "invalid-reason",
    };

    const request = new Request("http://localhost/api/skills/report", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    // Zod will return an error about invalid enum
  });

  it("should reject description that is too long", async () => {
    const payload = {
      skillId: "test-skill-123",
      reason: "spam",
      description: "a".repeat(1001), // Limit is 1000
    };

    const request = new Request("http://localhost/api/skills/report", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    // Assuming we check error message for "too long"
    expect(JSON.stringify(body)).toContain("too long");
  });

  it("should reject invalid email", async () => {
    const payload = {
      skillId: "test-skill-123",
      reason: "spam",
      reporterEmail: "not-an-email",
    };

    const request = new Request("http://localhost/api/skills/report", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(JSON.stringify(body)).toContain("Invalid email");
  });
});
