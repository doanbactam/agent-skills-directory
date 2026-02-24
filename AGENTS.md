# AGENTS.md - Project Rules for AI Agents

## Overview

**AGNXI** is an agent skills directory for coding assistants. Users discover SKILL.md workflows, compare stars/updates, and install skills for Claude Code, Cursor, Windsurf, Amp, and more.

### Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, Turbopack) | 16.1.6 |
| UI | React | 19.2.4 |
| Language | TypeScript (strict mode) | 5.9 |
| Styling | Tailwind CSS v4 (CSS-first) + shadcn | 4.2 |
| CSS Tooling | PostCSS with `@tailwindcss/postcss` | — |
| UI Primitives | Base UI (`@base-ui/react`) | 1.1 |
| Variants | class-variance-authority (CVA) | 0.7 |
| Icons | lucide-react | 0.575 |
| Auth | Clerk (`@clerk/nextjs`) | 6.38 |
| Database | PostgreSQL via Drizzle ORM | 0.45 |
| AI | Vercel AI SDK + Google Gemini (`@ai-sdk/google`) | 6.0 |
| Background Jobs | Inngest | 3.52 |
| Rate Limiting | Upstash Redis (`@upstash/ratelimit`) | 2.0 |
| URL State | nuqs | 2.8 |
| Env Validation | `@t3-oss/env-nextjs` + Zod v4 | — |
| Toasts | Sonner | 2.0 |
| Markdown | react-markdown + remark-gfm | — |
| Analytics | `@next/third-parties` | 16.1 |
| Tables | `@tanstack/react-table` | 8.21 |
| Runtime | Bun (package manager + runtime) | — |
| Node | ≥ 20.0.0 | — |

---

## Commands

**ALWAYS use Bun instead of npm/yarn/pnpm.**

```bash
# Development
bun dev                    # Start dev server (port 4000, Turbopack)

# Build & Production
bun build                  # Production build
bun start                  # Start production server (port 4000)

# Linting
bun lint                   # Run ESLint (always run after code changes)

# Database (Drizzle ORM)
bun db:generate            # Generate Drizzle migrations
bun db:migrate             # Run Drizzle migrations
bun db:push                # Push schema directly to database
bun db:studio              # Open Drizzle Studio (visual DB browser)
bun db:seed:categories     # Seed category data

# Tests
# No test framework is currently configured.
# Ask the user before adding any testing setup.
```

**Important notes:**
- Always run `bun lint` after significant code changes
- Dev server runs on port **4000** (not default 3000)
- Turbopack is the default bundler in dev mode
- The `postinstall` script auto-generates Drizzle migrations

---

## Project Structure

```
app/                      # Next.js App Router
├── (auth)/               # Auth routes (sign-in, sign-up)
├── [owner]/              # Dynamic owner pages
├── about/                # About page
├── admin/                # Admin dashboard (role-protected)
├── agent-skills/         # Agent skills listing
├── api/                  # API routes
│   ├── admin/            # Admin API endpoints
│   ├── inngest/          # Inngest webhook handler
│   ├── skills/           # Skills CRUD API
│   ├── webhooks/         # GitHub webhooks
│   ├── health/           # Health check
│   ├── stats/            # Stats endpoint
│   ├── owners/           # Owner data
│   └── categories/       # Category data
├── categories/           # Category pages
├── skills/               # Skill detail pages
├── globals.css           # Tailwind v4 theme (oklch tokens, shadcn vars)
├── layout.tsx            # Root layout (fonts, Clerk, analytics)
├── page.tsx              # Homepage
├── sitemap.ts            # Dynamic sitemap generation
├── error.tsx             # Error boundary
└── not-found.tsx         # 404 page

components/               # Shared React components
├── ui/                   # Reusable UI primitives (shadcn-style)
│   ├── button.tsx        # Button with CVA variants
│   ├── dialog.tsx        # Base UI Dialog wrapper
│   ├── select.tsx        # Base UI Select wrapper
│   ├── dropdown-menu.tsx # Base UI Menu wrapper
│   ├── input.tsx         # Input component
│   ├── card.tsx          # Card layout
│   ├── badge.tsx         # Badge with variants
│   ├── tooltip.tsx       # Tooltip component
│   ├── data-table.tsx    # TanStack Table wrapper
│   ├── sheet.tsx         # Slide-out panel
│   ├── sonner.tsx        # Toast provider
│   └── ...               # 23 UI components total
├── layouts/              # Page layout components
├── seo/                  # SEO components (JSON-LD, meta)
├── analytics/            # Analytics integration
├── faq/                  # FAQ components
└── error-boundary.tsx    # Client error boundary

features/                 # Feature modules (domain logic)
├── skills/               # Skills grid, filters, search
├── submissions/          # Skill submission flow
└── marketing/            # Landing page components

lib/                      # Shared utilities and logic
├── db/                   # Database layer
│   ├── schema.ts         # Drizzle schema (skills, categories, syncJobs, etc.)
│   ├── queries.ts        # Database queries
│   ├── client.ts         # Drizzle client setup
│   ├── transaction.ts    # Transaction helpers
│   ├── errors.ts         # Database error handling
│   └── seed-categories.ts
├── actions/              # Server Actions
├── ai/                   # AI integration (Gemini)
├── inngest/              # Inngest functions
├── hooks/                # Custom React hooks
├── categories/           # Category utilities
├── features/             # Feature flags
├── validators/           # Zod validation schemas
├── env.ts                # Environment validation (@t3-oss/env-nextjs)
├── auth.ts               # Auth helpers (Clerk)
├── redis.ts              # Upstash Redis client
├── rate-limit.ts         # Rate limiting logic
├── server-cache.ts       # Server-side caching
├── seo.ts                # SEO utilities
├── stats.ts              # Stats calculations
├── site-url.ts           # URL helpers
└── utils.ts              # cn() and general utilities

config/                   # Application configuration
├── site.ts               # Site metadata (name, URL, social links)
└── image-hosts.ts        # Allowed image remote patterns

drizzle/                  # Generated Drizzle migration files
types/                    # Shared TypeScript type definitions
├── index.ts              # App-wide types
└── clerk.d.ts            # Clerk type extensions
scripts/                  # Build and utility scripts
public/                   # Static assets (favicon, images)

proxy.ts                  # Request proxy (replaces middleware.ts in Next.js 16)
next.config.ts            # Next.js configuration
tsconfig.json             # TypeScript configuration (strict mode)
eslint.config.mjs         # ESLint (core-web-vitals + typescript)
drizzle.config.ts         # Drizzle ORM config (PostgreSQL)
postcss.config.mjs        # PostCSS config (@tailwindcss/postcss)
```

---

## Code Style Guidelines

### Imports & File Organization

```typescript
// 1. React imports (always use * as React)
import * as React from "react"

// 2. Third-party packages
import { cva, type VariantProps } from "class-variance-authority"
import { Dialog, Select, Menu } from "@base-ui/react"
import { Plus, Bluetooth } from "lucide-react"

// 3. Local imports (use @/* alias)
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
```

**Import rules:**
- React: `import * as React from "react"` (DO NOT use `import React from "react"`)
- Local: Always use the `@/` path alias (maps to project root)
- Order: React → Third-party → Local
- Types: Use `import { type X }` for type-only imports

### Component Declarations

```typescript
// ✅ Function declarations with named exports
function Button({ className, ...props }: React.ComponentProps<"button">) {
  return <button className={cn("base-classes", className)} {...props} />
}
export { Button }

// ✅ Page components with default export
export default function Page() {
  return <div>...</div>
}

// ❌ AVOID: Arrow function exports (unless necessary)
// export const Button = ({ ... }) => { ... }
```

### TypeScript Patterns

```typescript
// Component props: Use React.ComponentProps
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return <input type={type} className={cn(...)} {...props} />
}

// Union types with as const
const variants = ["default", "outline", "destructive"] as const
type Variant = typeof variants[number]

// Generic props with Readonly
function Wrapper({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div>{children}</div>
}
```

**TypeScript rules:**
- Use `React.ComponentProps<"tag">` for native element props
- Use `Readonly<>` for props objects to prevent accidental mutation
- DO NOT use `as any`, `@ts-ignore`, `@ts-expect-error` — fix types properly
- Strict mode is enabled — respect type safety at all times

### Utility Functions & cn()

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn("base-classes", className, isActive && "active-classes")} />
```

### Component Variants (CVA)

```typescript
import { cva, type VariantProps } from "class-variance-authority"

const buttonVariants = cva(
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

function Button({
  className,
  variant,
  size,
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants>) {
  return <button className={cn(buttonVariants({ variant, size }), className)} />
}
```

### "use client" Directive

```typescript
"use client"
import * as React from "react"

export function Counter() {
  const [count, setCount] = React.useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**When to use:**
- Components using `useState`, `useEffect`, `useRef`, etc.
- Components with event handlers (`onClick`, `onChange`, etc.)
- Components that need browser APIs

**DO NOT use when:**
- Pure presentational components
- Server components (default in Next.js App Router)

### Data Attributes

```typescript
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

- `data-slot`: Component type (e.g., "button", "input", "card")
- `data-variant`: Variant value
- `data-size`: Size value

### Styling

```typescript
// Always accept and merge className via cn()
function Component({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("base-classes", className)} {...props} />
}

// Conditional classes
<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isError && "error-classes"
)} />
```

**Tailwind CSS v4 specifics:**
- CSS-first configuration via `globals.css` (`@theme inline`, `@custom-variant`)
- Design tokens use oklch color space (light/dark)
- Token names: `primary`, `secondary`, `muted`, `accent`, `destructive`, `foreground`, `background`, `border`, `input`, `ring`, `card`, `popover`, `sidebar`, `chart-1..5`
- Custom utilities: `.text-link`, `.glass` (glassmorphism), `.animate-marquee`, `.mask-linear`, `.scrollbar-hide`
- shadcn integration via `@import "shadcn/tailwind.css"`
- Animation library: `tw-animate-css`

### Icons

```typescript
import { Plus, Bluetooth } from "lucide-react"

<Plus strokeWidth={2} data-icon="inline-start" />
```

### Base UI Integration

```typescript
import { Dialog, Select, Menu, AlertDialog, Field, Separator } from "@base-ui/react"

// Dialog pattern
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

// Select pattern
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
// No empty catch blocks
try {
  await fetchData()
} catch (error) {
  console.error("Failed to fetch data:", error)
  throw error // or handle gracefully
}

// Type-safe error handling
if (error instanceof Error) {
  console.error(error.message)
}
```

---

## Database

### Schema (lib/db/schema.ts)

Main tables:
- **skills** — Core skill records (name, slug, owner, repo, path, stars, forks, status, security scan results, search text with GIN trigram index)
- **categories** — Skill categories (name, slug, color, order)
- **skillCategories** — Many-to-many join table (skill ↔ category)
- **syncJobs** — GitHub sync job tracking
- **syncState** — Key-value sync state
- **skillReports** — User-submitted skill reports

### Type Exports

```typescript
import type { Skill, NewSkill, Category, SyncJob } from "@/lib/db/schema"
```

### Drizzle Patterns

- Schema: `lib/db/schema.ts`
- Client: `lib/db/client.ts`
- Queries: `lib/db/queries.ts`
- Migrations: `drizzle/` directory
- Config: `drizzle.config.ts` (reads `.env.local` via dotenv)

---

## Authentication

- **Clerk** handles all auth (`@clerk/nextjs`)
- Proxy (`proxy.ts`) uses `clerkMiddleware` with route matchers:
  - `/dashboard(.*)` — Protected (requires sign-in)
  - `/admin(.*)`, `/api/admin(.*)` — Admin-only (checks `metadata.role === "admin"`)
- Auth helpers: `lib/auth.ts`
- Clerk type extensions: `types/clerk.d.ts`

---

## Environment Variables

Validated via `@t3-oss/env-nextjs` in `lib/env.ts`. Validation is skipped in development.

**Server:**
- `DATABASE_URL` — PostgreSQL connection string (required)
- `GITHUB_TOKEN` / `GITHUB_WEBHOOK_SECRET` — GitHub integration
- `CLERK_SECRET_KEY` — Clerk auth
- `SYNC_SECRET_TOKEN` / `INDEXNOW_KEY` — Sync & indexing
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Redis
- `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` — Background jobs
- `GOOGLE_GENERATIVE_AI_API_KEY` / `GEMINI_MODEL` — AI features

**Client:**
- `NEXT_PUBLIC_SITE_URL` / `NEXT_PUBLIC_APP_URL` — Site URLs
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk client key

---

## Next.js Configuration

Key settings in `next.config.ts`:
- **Turbopack** enabled with `root: __dirname`
- **Experimental:** `optimizeCss: true`, `optimizePackageImports: ["@clerk/nextjs"]`
- **Images:** AVIF + WebP formats, SVG allowed, dynamic remote patterns from `config/image-hosts.ts`
- **Security headers:** `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS (production only)
- **Static caching:** `/_next/static/*` gets `max-age=31536000, immutable`
- **Compression:** gzip/brotli enabled
- **`proxy.ts`:** Replaces `middleware.ts` in Next.js 16. Single file at root; all request-level logic goes here (can split into modules and import)

---

## Linting & Quality

- ESLint: `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- ESLint config uses flat config format (`eslint.config.mjs`)
- Strict TypeScript enabled
- Always run `bun lint` after code changes
- Fix all lint errors before committing
- No test framework configured — ask user before adding tests
