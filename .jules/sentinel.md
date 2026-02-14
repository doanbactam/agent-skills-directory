# Sentinel's Journal - Critical Security Learnings

## 2025-02-18 - [Critical] Optional Webhook Secrets Bypass
**Vulnerability:** The GitHub webhook endpoint (`app/api/webhooks/github/route.ts`) skipped signature verification if `GITHUB_WEBHOOK_SECRET` environment variable was missing. This allowed unauthenticated requests to trigger internal processes (Inngest events) simply by omitting the secret in configuration.
**Learning:** Optional environment variables for security secrets can lead to silent failures where security controls are bypassed entirely if configuration is incomplete.
**Prevention:** Always enforce strict validation for security-critical secrets. If a secret is missing, the application should fail securely (reject requests or crash on startup) rather than degrading to an insecure state. Use `zod` schema validation to ensure secrets are present in production.

## 2024-05-24 - Auto-Generated Destructive Migrations
**Vulnerability:** `bun install` triggers `drizzle-kit generate` which may create destructive migrations (e.g., dropping tables) if the local schema is out of sync with the database or migration history. This can lead to accidental data loss if these migrations are committed and run.
**Learning:** The project's `postinstall` script runs `drizzle-kit generate`. This is convenient for development but risky if it generates changes that are not intended.
**Prevention:** Always review generated migration files before committing. Be cautious when running `bun install` in environments where schema changes are not expected.

## 2024-05-24 - Robust Rate Limiting Pattern
**Vulnerability:** Webhook endpoints were vulnerable to DoS attacks due to lack of rate limiting.
**Learning:** Implemented a robust rate limiting pattern using Redis (primary) with an in-memory fallback. This ensures protection even if the Redis service is temporarily unavailable or misconfigured.
**Prevention:** Use the `apiRateLimit` with `try-catch` and fallback to `checkRateLimitInMemory` for critical endpoints where availability is key but protection is needed.

## 2025-02-19 - [High] Broken Access Control on Admin Pages
**Vulnerability:** The Admin Security Dashboard (`app/admin/security/page.tsx`) only checked for authentication (`userId`), allowing any signed-in user to access sensitive security scan results without admin privileges.
**Learning:** Checking for `userId` confirms identity but not authority. Admin pages must explicitly verify the `admin` role.
**Prevention:** Always use `checkAdminAuth()` or `requireAdmin()` from `@/lib/auth` for administrative routes. Do not rely solely on `auth()` or middleware unless configured to check roles.

## 2025-02-19 - [High] Timing Attacks in Token Verification
**Vulnerability:** API endpoints verified Bearer tokens using direct string comparison (`header !== expected`), which fails as soon as a mismatch is found. This timing difference allows attackers to guess the secret token character by character.
**Learning:** Simple string equality checks leak timing information. Even high-entropy secrets can be vulnerable if network jitter is low enough or sample size is large enough.
**Prevention:** Use `verifyBearerToken` from `@/lib/auth` which uses `crypto.timingSafeEqual` and hashes inputs to ensure constant-time comparison regardless of token length or content.
