import Link from "next/link"
import { Search, Star, Terminal } from "lucide-react"

import { Badge } from "@/components/ui/badge"
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
  { name: "githubcopilot", label: "GitHub Copilot" },
  { name: "gemini", label: "Gemini" },
  { name: "opencode", label: "OpenCode" },
  { name: "trae", label: "Trae" },
]

function ProviderLogo({ name, label }: { name: LogoName; label: string }) {
  return (
    <div className="flex size-10 items-center justify-center rounded-xl bg-background shadow-sm border border-border/50 transition-transform hover:scale-105">
      <Logo name={name} size={20} aria-label={label} />
    </div>
  )
}

function Hero({ stats = { total: 0, updatedToday: 0 }, healthStatus }: HeroProps) {
  const healthState = healthStatus?.status ?? "unknown"
  const healthLabel =
    healthState === "healthy" ? "Healthy" : healthState === "unhealthy" ? "Unhealthy" : "Unknown"
  const healthDotClassName =
    healthState === "healthy"
      ? "bg-emerald-500"
      : healthState === "unhealthy"
        ? "bg-rose-500"
        : "bg-muted-foreground/50"
  const healthLatency = typeof healthStatus?.latencyMs === "number"
    ? Math.round(healthStatus.latencyMs)
    : null
  const healthTitle = healthLatency ? `DB latency ${healthLatency}ms` : "Health status"

  return (
    <section
      aria-labelledby="hero-heading"
      className="rounded-2xl border border-border/40 bg-gradient-to-br from-background via-background to-primary/5 p-6 sm:p-10 shadow-sm"
    >
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-6 flex-1">
          <div className="space-y-4">
            <h1
              id="hero-heading"
              className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl text-foreground"
            >
              <span className="text-primary bg-primary/10 px-2 rounded-md -ml-2 mr-1 inline-block transform -skew-x-3">Agent skills</span> directory for coding assistants
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed text-pretty max-w-2xl">
              Discover SKILL.md workflows from GitHub, compare stars and updates, and install agent skills for Claude Code, Cursor, Windsurf, and more.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background border border-border/50">
              <span className="font-semibold text-foreground">
                {stats.total > 0 ? formatNumber(stats.total) : "--"}
              </span>{" "}
              skills
            </span>
            {stats.updatedToday > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                <span className="font-medium">{stats.updatedToday}</span> updated today
              </span>
            )}
            <Badge variant="outline" className="gap-1.5 h-auto py-1 px-3 border-border/60 bg-background/60 backdrop-blur-sm" title={healthTitle}>
              <span className={`size-2 rounded-full ${healthDotClassName}`} aria-hidden="true" />
              <span>System {healthLabel}</span>
            </Badge>
          </div>

          <div className="flex items-center gap-3 pt-2 overflow-x-auto pb-2 scrollbar-hide mask-linear">
            {TOOLS.map((tool) => (
              <ProviderLogo key={tool.name} name={tool.name} label={tool.label} />
            ))}
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button size="default" className="shadow-md hover:shadow-lg transition-all" asChild>
              <Link href="/agent-skills">Read the Agent Skills Guide</Link>
            </Button>
            <Button size="default" variant="outline" className="bg-background/50 backdrop-blur-sm hover:bg-background" asChild>
              <Link href="/skills">Browse Agent Skills</Link>
            </Button>
            <Button
              variant="ghost"
              size="default"
              asChild
            >
              <Link href="/categories">
                View Categories
              </Link>
            </Button>
          </div>
        </div>

        <div className="space-y-6 lg:w-[320px] bg-background/40 backdrop-blur-sm rounded-xl p-5 border border-border/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Search className="size-4" aria-hidden="true" />
              </div>
              Discover
            </div>
            <p className="text-xs text-muted-foreground text-pretty pl-9">
              Find agent skills for Claude Code, Cursor, Windsurf, and more.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                <Star className="size-4" aria-hidden="true" />
              </div>
              Compare
            </div>
            <p className="text-xs text-muted-foreground text-pretty pl-9">
              Review stars, forks, and recent updates before you install.
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-500">
                <Terminal className="size-4" aria-hidden="true" />
              </div>
              Install
            </div>
            <p className="text-xs text-muted-foreground text-pretty pl-9">
              Copy the install command and run it in your tool or terminal.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export { Hero }
