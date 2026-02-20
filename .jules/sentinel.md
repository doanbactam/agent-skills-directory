## 2024-05-24 - Secure Hex String Comparison
**Vulnerability:** Weak signature verification in GitHub webhooks using `Buffer.from()` on potential hex strings without validation.
**Learning:** `Buffer.from(string)` treats input as UTF-8 by default. When comparing HMACs (hex strings), this can lead to incorrect comparisons or potential vulnerabilities if inputs are not strictly validated as hex.
**Prevention:** Always validate hex strings (regex `^[0-9a-f]+$`) and use `Buffer.from(str, 'hex')` to ensure byte-level comparison. Use `timingSafeEqual` for cryptographic comparisons.

## 2025-02-23 - In-memory Rate Limiter Memory Leak
**Vulnerability:** The in-memory fallback rate limiter (`checkRateLimitInMemory`) stored client identifiers in a `Map` without any cleanup mechanism, allowing indefinite growth and potential Denial of Service (DoS) via memory exhaustion.
**Learning:** Fallback mechanisms (like in-memory rate limiting when Redis fails) are often less scrutinized but become critical during outages. Attackers can exploit this by forcing the fallback path.
**Prevention:** Always implement cleanup strategies (TTL, max size, LRU) for in-memory stores that accept user-controlled keys. Use `Map.size` checks and periodic cleanup or eviction policies.
