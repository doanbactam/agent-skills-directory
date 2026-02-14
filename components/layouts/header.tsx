"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import { SiteLogo } from "@/components/ui/site-logo"
import { SubmitSkillDialog } from "@/features/submissions/submit-skill-dialog"
import { MobileNav } from "@/components/layouts/mobile-nav"

const HeaderAuth = dynamic(
  () => import("@/components/layouts/header-auth").then((mod) => mod.HeaderAuth),
  {
    ssr: false,
    loading: () => <div className="ml-2 h-8 min-w-[112px]" aria-hidden="true" />,
  },
)

function Header() {
  const navItems: Array<{ label: string; href: string }> = [
    { label: "Browse", href: "/skills" },
    { label: "Categories", href: "/categories" },
    { label: "Ranking", href: "/ranking" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" prefetch={false} className="flex items-center gap-2.5">
          <SiteLogo size={32} className="shadow-sm" />
          <div className="leading-tight">
            <span className="block text-sm font-bold tracking-tight">AGNXI</span>
            <span className="block text-[10px] font-medium text-muted-foreground">Agent Skills</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
          {navItems.map((item) => (
            <Button key={item.label} variant="ghost" size="sm" asChild>
              <Link href={item.href} prefetch={false}>{item.label}</Link>
            </Button>
          ))}
          <SubmitSkillDialog buttonSize="sm" />
          <HeaderAuth />
        </nav>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </header>
  );
}

export { Header };
