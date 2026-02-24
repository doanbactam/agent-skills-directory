## 2024-05-24 - Secure Hex String Comparison
**Vulnerability:** Weak signature verification in GitHub webhooks using `Buffer.from()` on potential hex strings without validation.
**Learning:** `Buffer.from(string)` treats input as UTF-8 by default. When comparing HMACs (hex strings), this can lead to incorrect comparisons or potential vulnerabilities if inputs are not strictly validated as hex.
**Prevention:** Always validate hex strings (regex `^[0-9a-f]+$`) and use `Buffer.from(str, 'hex')` to ensure byte-level comparison. Use `timingSafeEqual` for cryptographic comparisons.

## 2024-05-27 - IP Spoofing in Rate Limiting
**Vulnerability:** Rate limiting logic used the first IP from `X-Forwarded-For` header, allowing attackers to bypass limits by spoofing the header (e.g., `X-Forwarded-For: spoofed-ip`).
**Learning:** `X-Forwarded-For` is a list where clients can append values. The *first* value is often user-controlled. The *last* value is the one appended by the immediate trusted proxy (if configured correctly).
**Prevention:** Prioritize `X-Real-IP` (if set by trusted proxy). If using `X-Forwarded-For`, use the LAST IP in the list, as it represents the client IP as seen by the immediate trusted proxy.
