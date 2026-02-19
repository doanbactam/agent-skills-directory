## 2024-05-24 - Secure Hex String Comparison
**Vulnerability:** Weak signature verification in GitHub webhooks using `Buffer.from()` on potential hex strings without validation.
**Learning:** `Buffer.from(string)` treats input as UTF-8 by default. When comparing HMACs (hex strings), this can lead to incorrect comparisons or potential vulnerabilities if inputs are not strictly validated as hex.
**Prevention:** Always validate hex strings (regex `^[0-9a-f]+$`) and use `Buffer.from(str, 'hex')` to ensure byte-level comparison. Use `timingSafeEqual` for cryptographic comparisons.

## 2025-02-23 - CSRF Protection for JSON API Routes
**Vulnerability:** CSRF vulnerability in `app/api/admin/sync/route.ts` where Simple Requests (e.g. `text/plain` POST) were accepted, bypassing browser preflight checks.
**Learning:** Next.js `request.json()` parses body regardless of `Content-Type`. API routes relying on cookie authentication must enforce `Content-Type: application/json` to trigger CORS preflight and prevent CSRF.
**Prevention:** Explicitly check `request.headers.get("content-type")?.includes("application/json")` in sensitive mutation endpoints.
