## 2024-05-23 - Avoid Invalid Button Nesting with asChild
**Learning:** Found `<Link><Button>...</Button></Link>` pattern which creates invalid `<a><button>` nesting, causing accessibility issues.
**Action:** Use `<Button asChild><Link>...</Link></Button>` pattern to apply button styles to the link element directly.

## 2025-02-21 - Enhancing Markdown Code Blocks with Copy Button
**Learning:** Markdown code blocks rendered by `react-markdown` can be enhanced with client-side interactivity (like a copy button) by replacing the `pre` component.
**Action:** Use a custom client component to wrap the `pre` element in `ReactMarkdown`'s `components` prop to add copy functionality without complex DOM parsing.
