import * as React from "react"
import Link from "next/link"
import { getExternalUrl } from "@/lib/utils"

function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 sm:px-6 md:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-muted-foreground flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono">
            <Link href="/about" prefetch={false} className="hover:text-foreground transition-colors">
              [About]
            </Link>
            <Link href="/privacy" prefetch={false} className="hover:text-foreground transition-colors">
              [Privacy]
            </Link>
            <Link href="/cookies" prefetch={false} className="hover:text-foreground transition-colors">
              [Cookies]
            </Link>
            <Link href="/terms" prefetch={false} className="hover:text-foreground transition-colors">
              [Terms]
            </Link>
          </div>
          <p className="text-muted-foreground text-xs font-mono">
            Built with{" "}
            <a
              href={getExternalUrl("https://github.com/doanbactam/agent-skills-directory")}
              className="text-foreground hover:underline transition-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
