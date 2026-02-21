## 2026-02-16 - Image Fallback Strategy
**Learning:** `ExternalImage` text fallback ("Image unavailable") overflows small containers like avatars (40px).
**Action:** Use icons (`ImageOff`) for small containers (< 100px) and text only for larger ones, ensuring `role="img"` and `aria-label` are preserved for context.

## 2026-02-16 - React 19 Ref Prop
**Learning:** React 19 allows passing `ref` as a standard prop to functional components, removing the need for `forwardRef`.
**Action:** When creating or modifying UI components, accept `ref` in `props` and pass it down directly, ensuring it propagates to the underlying DOM element.

## 2026-02-18 - Semantic Radio Groups
**Learning:** Manual radio groups using divs and buttons require complex state management for accessibility (focus, selection). Semantic `<input type="radio" className="sr-only" />` inside `<label>` provides native keyboard navigation and screen reader support for free.
**Action:** Replace custom radio implementations with semantic inputs, using CSS (e.g., `:has(:checked)`, `:has(:focus-visible)`) to style the label container.

## 2026-02-18 - Nested Interactive Cards
**Learning:** Wrapping a card in a `Link` prevents nested interactive elements (like tooltips or buttons) from being accessible or valid HTML. The "Stretched Link" pattern allows the whole card to be clickable while keeping nested elements interactive and accessible.
**Action:** Use a `div` for the card container (`relative`), place the `Link` inside the primary heading with an `absolute inset-0` child (`z-0`), and give nested interactive elements `relative z-10`.
