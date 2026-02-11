import { cn, getExternalUrl } from "@/lib/utils"
import { CodeBlock } from "@/features/skills/code-block"

type MarkdownContentProps = {
  content: string
  className?: string
}

async function MarkdownContent({ content, className }: MarkdownContentProps) {
  const [{ default: ReactMarkdown }, { default: remarkGfm }] = await Promise.all([
    import("react-markdown"),
    import("remark-gfm"),
  ])

  return (
    <div className={cn("prose prose-sm dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold mt-6 mb-3 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold mt-5 mb-2">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-semibold mt-4 mb-2">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-3 break-words">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside text-sm mb-3 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside text-sm mb-3 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="text-sm break-words">{children}</li>,
          code: ({ className, children, ...props }) => {
            const isInline = !className
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                {children}
              </code>
            ) : (
              <code className={cn("text-xs", className)} {...props}>
                {children}
              </code>
            )
          },
          pre: CodeBlock,
          a: ({ href, children }) => (
            <a
              href={getExternalUrl(href ?? "")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary text-link"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground mb-3">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-border bg-muted px-3 py-2 text-left font-medium break-words">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-3 py-2 break-words">{children}</td>
          ),
          hr: () => <hr className="border-border my-6" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export { MarkdownContent }
