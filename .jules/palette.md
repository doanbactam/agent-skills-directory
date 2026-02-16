## 2026-02-16 - Image Fallback Strategy
**Learning:** `ExternalImage` text fallback ("Image unavailable") overflows small containers like avatars (40px).
**Action:** Use icons (`ImageOff`) for small containers (< 100px) and text only for larger ones, ensuring `role="img"` and `aria-label` are preserved for context.
