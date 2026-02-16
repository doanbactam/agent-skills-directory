import { describe, it, expect } from "bun:test"
import { verifySignature } from "./verify-signature"
import { createHmac } from "crypto"

describe("verifySignature", () => {
  const secret = "test-secret"
  const payload = '{"ref": "refs/heads/main"}'

  it("should return true for a valid signature", () => {
    const signature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`
    expect(verifySignature(payload, signature, secret)).toBe(true)
  })

  it("should return false for an invalid signature (wrong secret)", () => {
    const signature = `sha256=${createHmac("sha256", "wrong-secret").update(payload).digest("hex")}`
    expect(verifySignature(payload, signature, secret)).toBe(false)
  })

  it("should return false for an invalid signature (wrong payload)", () => {
    const signature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`
    expect(verifySignature("different-payload", signature, secret)).toBe(false)
  })

  it("should return false for a malformed signature (missing algo)", () => {
    const signature = createHmac("sha256", secret).update(payload).digest("hex")
    expect(verifySignature(payload, signature, secret)).toBe(false)
  })

  it("should return false for a malformed signature (wrong algo)", () => {
    const signature = `sha1=${createHmac("sha256", secret).update(payload).digest("hex")}`
    expect(verifySignature(payload, signature, secret)).toBe(false)
  })

  it("should return false for a malformed signature (invalid hex)", () => {
    const signature = "sha256=invalid-hex-string"
    expect(verifySignature(payload, signature, secret)).toBe(false)
  })

  it("should return false for a malformed signature (wrong length)", () => {
    // SHA256 hex is 64 chars. Create one with 63 chars.
    const hash = createHmac("sha256", secret).update(payload).digest("hex").slice(0, 63)
    const signature = `sha256=${hash}`
    expect(verifySignature(payload, signature, secret)).toBe(false)
  })
})
