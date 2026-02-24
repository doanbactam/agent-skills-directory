# AGENTS.md - Quy tắc dự án cho AI Agents

## Overview

Dự án này là Next.js 16.1.4 với React 19, TypeScript 5, và Tailwind CSS 4. Dùng cho agentic coding workflows.

---

## Commands

**LUÔN sử dụng Bun thay cho npm/yarn/pnpm**

```bash
# Development
bun dev              # Start dev server

# Build
bun build            # Production build
bun start            # Start production server

# Linting/Typecheck
bun lint             # Run ESLint (sau khi thay đổi code)
bun run lint         # Alternative lint command

# Tests (không có trong project này)
# Không có test commands được cấu hình
```

**Lưu ý quan trọng:**
- Luôn chạy `bun lint` sau khi thay đổi code quan trọng
- Không có test framework trong dự án hiện tại
- Nếu cần thêm tests, hãy hỏi người dùng về preferred testing setup

---

## Code Style Guidelines

### Imports & File Organization

```typescript
// React imports (luôn dùng * as React)
import * as React from "react"

// Third-party packages
import { cva, type VariantProps } from "class-variance-authority"
import { Dialog, Select, Menu } from "@base-ui/react"
import { Plus, Bluetooth } from "lucide-react"

// Local imports (sử dụng @/* alias)
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

**Quy tắc imports:**
- React import: `import * as React from "react"` (KHÔNG dùng `import React from "react"`)
- Local imports: Luôn dùng `@/` alias (ví dụ: `@/lib/utils`, `@/components/ui/button`)
- Group imports theo thứ tự: React → Third-party → Local
- Type imports: Sử dụng `import { type X }` cho type-only imports

### Component Declarations

```typescript
// ✅ CORRECT: Function declarations với named exports
function Button({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("base-classes", className)} {...props} />
}
export { Button }

// ✅ CORRECT: Page components với default export
export default function Page() {
  return <div>...</div>
}

// ❌ AVOID: Arrow function exports (trừ khi cần)
// export const Button = ({ ... }) => { ... }
```

### TypeScript Patterns

```typescript
// Component props: Sử dụng React.ComponentProps
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn(...)} {...props} />
}

// Union types với as const
const variants = ["default", "outline", "destructive"] as const
type Variant = typeof variants[number]

// Generic props
function Wrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div>{children}</div>
}
```

**Quy tắc TypeScript:**
- Sử dụng `React.ComponentProps<"tag">` cho native element props
- Dùng `Readonly<>` cho props object để tránh accidental mutation
- KHÔNG dùng `as any`, `@ts-ignore`, `@ts-expect-error` - fix types properly
- Strict mode enabled trong tsconfig.json - tôn trọng type safety

### Utility Functions & cn()

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Utility function trong lib/utils.ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Sử dụng trong components
function MyComponent({ className }: { className?: string }) {
  return (
    <div className={cn("base-classes", className, isActive && "active-classes")} />
  )
}
```

### Component Variants (CVA)

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
  // Base classes
  "rounded-md border transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border-border hover:bg-accent",
      },
      size: {
        default: "h-7 px-2",
        sm: "h-6 px-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({ className, variant, size }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} />
}
```

### "use client" Directive

```typescript
// Client components (state, effects, event handlers)
"use client"

import * as React from "react"

export function Counter() {
  const [count, setCount] = React.useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**Khi nào dùng "use client":**
- Components sử dụng `useState`, `useEffect`, `useRef`, v.v.
- Components có event handlers (`onClick`, `onChange`, v.v.)
- Components cần browser APIs

**KHÔNG dùng khi:**
- Pure presentational components
- Server components (default trong Next.js app directory)

### Data Attributes

```typescript
// Sử dụng data attributes cho component identification
function Button({ variant, size, ...props }) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      {...props}
    />
  )
}
```

**Quy tắc data attributes:**
- `data-slot`: Component type (e.g., "button", "input", "card")
- `data-variant`: Variant value
- `data-size`: Size value

### Styling Patterns

```typescript
// ✅ CORRECT: Dùng cn() với destructuring
function Component({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("base-classes", className)} {...props} />
  )
}

// ✅ CORRECT: Conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isError && "error-classes"
)} />
```

**Tailwind CSS v4:**
- Tailwind v4 đã tích hợp CSS-first approach
- Sử dụng Tailwind classes trực tiếp, không cần custom utilities
- Design tokens: `primary`, `secondary`, `muted`, `accent`, `destructive`, `foreground`, `background`, `border`, `input`, `ring`

### Icons

```typescript
// Từ lucide-react
import { Plus, Bluetooth } from "lucide-react"

// Sử dụng trực tiếp
<Plus strokeWidth={2} data-icon="inline-start" />
```

### Base UI Integration

```typescript
// Component composition với Base UI
import { Dialog, Select, Menu, AlertDialog, Field, Separator } from "@base-ui/react"

// Dialog example
<Dialog.Root open={open} onOpenChange={setOpen}>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop className="fixed inset-0 bg-black/50" />
    <Dialog.Popup className="fixed ...">
      <Dialog.Title>Title</Dialog.Title>
      <Dialog.Description>Description</Dialog.Description>
      <Dialog.Close>Close</Dialog.Close>
    </Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>

// Select example
<Select.Root value={value} onValueChange={setValue}>
  <Select.Trigger>
    <Select.Value placeholder="Select..." />
  </Select.Trigger>
  <Select.Portal>
    <Select.Positioner>
      <Select.Popup>
        <Select.Item value="option1">Option 1</Select.Item>
      </Select.Popup>
    </Select.Positioner>
  </Select.Portal>
</Select.Root>
```

### Error Handling

```typescript
// KHÔNG có empty catch blocks
try {
  await fetchData()
} catch (error) {
  console.error("Failed to fetch data:", error)
  throw error // hoặc handle gracefully
}

// Type-safe error handling
if (error instanceof Error) {
  console.error(error.message)
}
```

---

## File Structure

```
app/              # Next.js App Router pages
components/       # React components
  ui/            # Reusable UI components (shadcn-style)
lib/             # Utility functions
middleware.ts     # Next.js Middleware (handles request-level logic)
next.config.ts   # Next.js config
tsconfig.json    # TypeScript config
eslint.config.mjs # ESLint config
```

---

## Linting & Quality

- ESLint sử dụng `eslint-config-next` với TypeScript rules
- Strict TypeScript enabled
- Luôn chạy `bun lint` sau khi thay đổi code
- Fix all lint errors trước khi commit

---

## Additional Notes

- Next.js 16 dung `middleware.ts` (standard) thay cho `proxy.ts` (đã bị loại bỏ)
- Chi co mot `middleware.ts` o root, moi logic request-level dat tai day (co the tach module roi import)
- Project sử dụng Next.js 16 với App Router
- Tailwind CSS v4 với CSS-first configuration
- No testing framework configured - ask user before adding tests
- Icons: lucide-react
- UI pattern: shadcn-style components với Base UI primitives (@base-ui/react)
