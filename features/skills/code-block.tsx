"use client"

import * as React from "react"
import { CopyButton } from "@/features/skills/copy-button"
import { cn } from "@/lib/utils"

interface CodeBlockProps extends React.HTMLAttributes<HTMLPreElement> {
  node?: unknown
}

export function CodeBlock({ children, className, node, ...props }: CodeBlockProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _unused = node
  const preRef = React.useRef<HTMLPreElement>(null)
  const [text, setText] = React.useState("")

  React.useEffect(() => {
    if (preRef.current) {
      setText(preRef.current.textContent || "")
    }
  }, [children])

  return (
    <div className="group relative mb-4 rounded-lg bg-muted">
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <CopyButton
          text={text}
          className="h-6 w-6 bg-background/80 hover:bg-background shadow-sm backdrop-blur-sm"
        />
      </div>
      <pre
        ref={preRef}
        className={cn("overflow-x-auto p-4 text-xs", className)}
        {...props}
      >
        {children}
      </pre>
    </div>
  )
}
