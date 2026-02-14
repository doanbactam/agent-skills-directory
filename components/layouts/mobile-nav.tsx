"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetHeader,
  SheetDescription,
} from "@/components/ui/sheet"
import { SiteLogo } from "@/components/ui/site-logo"
import { SubmitSkillDialog } from "@/features/submissions/submit-skill-dialog"

const HeaderAuth = dynamic(
  () => import("@/components/layouts/header-auth").then((mod) => mod.HeaderAuth),
  {
    ssr: false,
    loading: () => <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />,
  },
)

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const navItems = [
    { label: "Browse", href: "/skills" },
    { label: "Categories", href: "/categories" },
    { label: "Ranking", href: "/ranking" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <SheetHeader className="px-1 text-left">
          <SheetTitle>
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setOpen(false)}
            >
              <SiteLogo size={24} />
              <span className="font-bold">AGNXI</span>
            </Link>
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigation menu for mobile devices
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4 pl-1 pr-6">
          <nav className="grid gap-2 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
            <div className="px-3">
              <SubmitSkillDialog buttonSize="sm" />
            </div>
            <div className="px-3 pt-2">
              <HeaderAuth />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
