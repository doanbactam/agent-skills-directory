import type { Metadata } from "next"
import Link from "next/link"
import { Compass, Home } from "lucide-react"

import { Container } from "@/components/layouts/container"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Not Found | Agent Skills Directory",
  description: "The page you're looking for doesn't exist.",
}

export default function NotFoundPage() {
  return (
    <Container>
      <div className="flex min-h-[60vh] items-center justify-center py-12">
        <div className="text-center space-y-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Not Found
          </div>

          <div className="space-y-2">
            <h1 className="text-7xl font-black bg-gradient-to-r from-primary via-amber-500 to-rose-500 bg-clip-text text-transparent">
              404
            </h1>
            <p className="text-xl font-medium text-foreground">Page not found.</p>
            <p className="text-muted-foreground max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/">
                <Home className="size-4" aria-hidden="true" />
                Go Home
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/skills">
                <Compass className="size-4" aria-hidden="true" />
                Explore Skills
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Container>
  )
}
