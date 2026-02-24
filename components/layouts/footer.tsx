import * as React from "react"
import Link from "next/link"
import { getExternalUrl } from "@/lib/utils"

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/terms", label: "Terms" },
] as const

function Footer() {
  return (
    <footer className="border-t border-border/40">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <nav className="flex items-center gap-3 text-xs text-muted-foreground">
          {footerLinks.map((link, i) => (
            <React.Fragment key={link.href}>
              {i > 0 && <span className="text-border" aria-hidden="true">·</span>}
              <Link
                href={link.href}
                prefetch={false}
                className="hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            </React.Fragment>
          ))}
        </nav>
        <a
          href={getExternalUrl("https://github.com/doanbactam/agent-skills-directory")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </footer>
  )
}

export { Footer }
