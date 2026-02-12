## 2024-05-23 - Avoid Invalid Button Nesting with asChild
**Learning:** Found `<Link><Button>...</Button></Link>` pattern which creates invalid `<a><button>` nesting, causing accessibility issues.
**Action:** Use `<Button asChild><Link>...</Link></Button>` pattern to apply button styles to the link element directly.

## 2026-02-12 - Explicit Form Error Linking
**Learning:** Error messages in forms were visually present but not programmatically linked to inputs, causing screen readers to miss validation errors.
**Action:** Use `React.useId()` to generate unique IDs for error containers and link them to inputs using `aria-describedby` and `aria-invalid` attributes.
