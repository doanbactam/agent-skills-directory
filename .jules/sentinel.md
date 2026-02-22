## 2024-05-24 - Secure Hex String Comparison
**Vulnerability:** Weak signature verification in GitHub webhooks using `Buffer.from()` on potential hex strings without validation.
**Learning:** `Buffer.from(string)` treats input as UTF-8 by default. When comparing HMACs (hex strings), this can lead to incorrect comparisons or potential vulnerabilities if inputs are not strictly validated as hex.
**Prevention:** Always validate hex strings (regex `^[0-9a-f]+$`) and use `Buffer.from(str, 'hex')` to ensure byte-level comparison. Use `timingSafeEqual` for cryptographic comparisons.

## 2026-02-22 - Rate Limit Fallback Strategy
**Vulnerability:** DoS risk (Availability) on critical endpoints relying solely on Redis for rate limiting. If Redis is down or misconfigured, the application fails closed (500 Error), preventing legitimate usage.
**Learning:** Hard dependency on external services for rate limiting creates a single point of failure.
**Prevention:** Implement "Defense in Depth" by wrapping external rate limiters in `try/catch` and falling back to a namespaced in-memory rate limiter (e.g., `checkRateLimitInMemory` with `report:${ip}`) to maintain availability during outages while still providing protection.
