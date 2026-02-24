import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Logo, type LogoName } from "@/components/ui/logo"
import type { HealthStatus } from "@/lib/health"

type HeroStats = {
  total: number
  updatedToday: number
}

type HeroProps = {
  stats?: HeroStats
  healthStatus?: HealthStatus
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`
  }
  return num.toString()
}

const TOOLS: { name: LogoName; label: string }[] = [
  { name: "claude", label: "Claude" },
  { name: "cursor", label: "Cursor" },
  { name: "windsurf", label: "Windsurf" },
  { name: "cline", label: "Cline" },
  { name: "amp", label: "Amp" },
  { name: "githubcopilot", label: "Copilot" },
]

function Hero({ stats = { total: 0, updatedToday: 0 }, healthStatus }: HeroProps) {
  return (
    <section
      aria-labelledby="hero-heading"
      className="mb-8 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden"
    >
      <div className="p-6 sm:p-8 space-y-5">
        <div className="space-y-2.5">
          <h1
            id="hero-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
          >
            Agent Skills Directory
          </h1>
          <p className="max-w-xl text-muted-foreground text-sm sm:text-[15px] leading-relaxed">
            Discover, compare, and install SKILL.md workflows for your coding assistants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {stats.total > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-background/50 rounded-lg border border-border/40 text-foreground">
              {formatNumber(stats.total)} skills
            </span>
          )}
          {stats.updatedToday > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-emerald-500/8 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {stats.updatedToday} updated today
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href="/skills">
              Browse Skills
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button variant="outline" asChild className="bg-background/50">
            <Link href="/agent-skills">
              <BookOpen className="size-4" aria-hidden="true" />
              Read Guide
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <span className="text-xs text-muted-foreground">Works with</span>
          <div className="flex items-center gap-2.5 opacity-60 hover:opacity-90 grayscale hover:grayscale-0 transition-all duration-300">
            {TOOLS.map((tool) => (
              <Logo key={tool.name} name={tool.name} size={16} aria-label={tool.label} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export { Hero }
