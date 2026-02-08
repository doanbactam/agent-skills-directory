import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { getSiteUrl } from "@/lib/site-url";

describe("getSiteUrl", () => {
  const originalNextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const originalVercelUrl = process.env.VERCEL_URL;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
  });

  afterEach(() => {
    if (originalNextPublicSiteUrl === undefined) {
      delete process.env.NEXT_PUBLIC_SITE_URL;
    } else {
      process.env.NEXT_PUBLIC_SITE_URL = originalNextPublicSiteUrl;
    }

    if (originalVercelUrl === undefined) {
      delete process.env.VERCEL_URL;
    } else {
      process.env.VERCEL_URL = originalVercelUrl;
    }
  });

  it("should return NEXT_PUBLIC_SITE_URL if set and not localhost", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("should normalize NEXT_PUBLIC_SITE_URL (remove trailing slash)", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com/";
    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("should return VERCEL_URL if NEXT_PUBLIC_SITE_URL is not set", () => {
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(getSiteUrl()).toBe("https://my-app.vercel.app");
  });

  it("should return VERCEL_URL if NEXT_PUBLIC_SITE_URL is localhost", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:4000";
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(getSiteUrl()).toBe("https://my-app.vercel.app");
  });

  it("should return localhost NEXT_PUBLIC_SITE_URL if VERCEL_URL is not set", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:4000/";
    expect(getSiteUrl()).toBe("http://localhost:4000");
  });

  it("should return default localhost:3000 if no env vars are set", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });

  it("should handle 127.0.0.1 as localhost", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3000";
    process.env.VERCEL_URL = "my-app.vercel.app";
    expect(getSiteUrl()).toBe("https://my-app.vercel.app");
  });
});
