import { createHmac, timingSafeEqual } from "crypto"

/**
 * Verifies a GitHub webhook signature (HMAC-SHA256).
 *
 * @param payload - The raw request body as a string.
 * @param signature - The X-Hub-Signature-256 header value (e.g., "sha256=<hex>").
 * @param secret - The webhook secret.
 * @returns boolean - True if the signature is valid, false otherwise.
 */
export function verifySignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false

  const parts = signature.split("=")
  if (parts.length !== 2) return false

  const algo = parts[0]
  const hash = parts[1]

  // GitHub currently uses sha256
  if (algo !== "sha256") return false

  // Strict check for valid hex string of correct length (SHA256 = 64 hex chars)
  if (!/^[0-9a-f]{64}$/i.test(hash)) return false

  try {
    // Compute expected HMAC
    const expected = createHmac("sha256", secret).update(payload).digest("hex")

    // Compare as buffers using hex encoding to ensure byte-level comparison
    // This avoids UTF-8 string interpretation issues
    const hashBuffer = Buffer.from(hash, 'hex')
    const expectedBuffer = Buffer.from(expected, 'hex')

    // Constant-time comparison to prevent timing attacks
    return timingSafeEqual(hashBuffer, expectedBuffer)
  } catch (error) {
    // Catch any errors during buffer creation or comparison
    console.error("Signature verification error:", error)
    return false
  }
}
