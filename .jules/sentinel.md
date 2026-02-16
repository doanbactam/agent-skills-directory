## 2024-05-24 - Secure Hex String Comparison
**Vulnerability:** Weak signature verification in GitHub webhooks using `Buffer.from()` on potential hex strings without validation.
**Learning:** `Buffer.from(string)` treats input as UTF-8 by default. When comparing HMACs (hex strings), this can lead to incorrect comparisons or potential vulnerabilities if inputs are not strictly validated as hex.
**Prevention:** Always validate hex strings (regex `^[0-9a-f]+$`) and use `Buffer.from(str, 'hex')` to ensure byte-level comparison. Use `timingSafeEqual` for cryptographic comparisons.
