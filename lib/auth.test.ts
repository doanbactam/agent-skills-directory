import { describe, it, expect, mock } from "bun:test";

// Mock @clerk/nextjs/server because lib/auth.ts imports it
mock.module("@clerk/nextjs/server", () => {
  return {
    auth: () => ({ userId: "test-user" }),
    currentUser: () => Promise.resolve({ publicMetadata: { role: "user" } }),
  };
});

describe("verifyBearerToken", () => {
  const secret = "super-secret-token";

  it("should return true for valid bearer token", async () => {
    const { verifyBearerToken } = await import("./auth");
    expect(verifyBearerToken(`Bearer ${secret}`, secret)).toBe(true);
  });

  it("should return false for invalid token", async () => {
    const { verifyBearerToken } = await import("./auth");
    expect(verifyBearerToken("Bearer wrong-token", secret)).toBe(false);
  });

  it("should return false for missing bearer prefix", async () => {
    const { verifyBearerToken } = await import("./auth");
    expect(verifyBearerToken(secret, secret)).toBe(false);
  });

  it("should return false for empty header", async () => {
    const { verifyBearerToken } = await import("./auth");
    expect(verifyBearerToken("", secret)).toBe(false);
  });

  it("should return false for null header", async () => {
    const { verifyBearerToken } = await import("./auth");
    expect(verifyBearerToken(null, secret)).toBe(false);
  });

  it("should return false for empty secret", async () => {
    const { verifyBearerToken } = await import("./auth");
    expect(verifyBearerToken("Bearer token", "")).toBe(false);
  });

  it("should match exactly including case", async () => {
    const { verifyBearerToken } = await import("./auth");
    expect(verifyBearerToken(`Bearer ${secret.toUpperCase()}`, secret)).toBe(false);
  });

  it("should fail safely with timing attack resistant logic (functionally correct)", async () => {
    const { verifyBearerToken } = await import("./auth");
    const longSecret = "a".repeat(100);
    const longToken = "Bearer " + "a".repeat(100);
    expect(verifyBearerToken(longToken, longSecret)).toBe(true);

    const almostLongToken = "Bearer " + "a".repeat(99) + "b";
    expect(verifyBearerToken(almostLongToken, longSecret)).toBe(false);
  });
});
