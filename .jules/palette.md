## 2026-02-16 - Image Fallback Strategy
**Learning:** `ExternalImage` text fallback ("Image unavailable") overflows small containers like avatars (40px).
**Action:** Use icons (`ImageOff`) for small containers (< 100px) and text only for larger ones, ensuring `role="img"` and `aria-label` are preserved for context.

## 2026-02-16 - React 19 Ref Prop
**Learning:** React 19 allows passing `ref` as a standard prop to functional components, removing the need for `forwardRef`.
**Action:** When creating or modifying UI components, accept `ref` in `props` and pass it down directly, ensuring it propagates to the underlying DOM element.
