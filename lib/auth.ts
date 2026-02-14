import { createHash, timingSafeEqual } from "crypto"
import { auth, currentUser } from "@clerk/nextjs/server"

/**
 * Securely verify a Bearer token against a known secret using constant-time comparison.
 * This prevents timing attacks where an attacker could guess the token character by character.
 */
export function verifyBearerToken(authHeader: string | null, secret: string): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  const token = authHeader.slice(7)
  if (!token) {
    return false
  }

  // Hash both token and secret to ensure equal length for timingSafeEqual
  // This prevents length-based timing attacks
  const tokenHash = createHash("sha256").update(token).digest()
  const secretHash = createHash("sha256").update(secret).digest()

  return timingSafeEqual(tokenHash, secretHash)
}

function hasRoleMetadata(metadata: unknown): metadata is { role?: unknown } {
  return typeof metadata === "object" && metadata !== null && "role" in metadata
}

function readRole(metadata: unknown): string | null {
  if (!hasRoleMetadata(metadata)) return null
  return typeof metadata.role === "string" ? metadata.role : null
}

export async function isAdmin(): Promise<boolean> {
  const user = await currentUser()
  const role = readRole(user?.publicMetadata)
  return role === "admin"
}

export async function checkAdminAuth(): Promise<boolean> {
  return isAdmin()
}

export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error("Unauthorized: Admin access required")
  }
}

export async function getUser() {
  return currentUser()
}

export async function getUserId(): Promise<string | null> {
  const { userId } = await auth()
  return userId
}
