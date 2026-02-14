## 2024-05-23 - Avoid Invalid Button Nesting with asChild
**Learning:** Found `<Link><Button>...</Button></Link>` pattern which creates invalid `<a><button>` nesting, causing accessibility issues.
**Action:** Use `<Button asChild><Link>...</Link></Button>` pattern to apply button styles to the link element directly.

## 2026-02-14 - React 19 Ref Handling in Base Components
**Learning:** React 19 function components now accept `ref` as a prop directly, simplifying how base UI components like `Input` expose their DOM nodes for focus management.
**Action:** Update base components to accept `ref` prop instead of `forwardRef` when focus needs to be managed programmatically (e.g., returning focus after clearing search).
