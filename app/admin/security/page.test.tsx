
import { describe, it, expect, mock, beforeEach } from "bun:test";

// Mock auth
mock.module("@clerk/nextjs/server", () => ({
  auth: () => Promise.resolve({ userId: "user_123" }), // Authenticated user
  currentUser: () => Promise.resolve({ publicMetadata: { role: "user" } }), // NOT admin
}));

// Mock db
mock.module("@/lib/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => Promise.resolve([]), // Return empty skills
          }),
        }),
      }),
    }),
  },
}));

// Mock navigation
const redirectMock = mock(() => {});
mock.module("next/navigation", () => ({
  redirect: redirectMock,
}));

// Import the page
import SecurityPage from "./page";

describe("Admin Security Page Access Control", () => {
  beforeEach(() => {
    redirectMock.mockClear();
  });

  it("should redirect non-admin users to home page", async () => {
    // Current implementation only checks for userId, so this test will FAIL (it won't redirect)
    // We expect it to redirect to "/" if secured properly

    await SecurityPage();

    // If vulnerable, redirect is NOT called
    // If secured, redirect("/") should be called
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
