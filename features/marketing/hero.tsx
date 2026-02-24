import Link from "next/link"
import { Terminal } from "lucide-react"

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
  const healthState = healthStatus?.status ?? "unknown"
  const healthLabel = healthState === "healthy" ? "healthy" : healthState === "unhealthy" ? "unhealthy" : "unknown"
  const healthTextColor = healthState === "healthy" ? "text-emerald-500" : healthState === "unhealthy" ? "text-rose-500" : "text-muted-foreground"

  return (
    <section
      aria-labelledby="hero-heading"
      className="mb-8 font-mono text-sm border border-border/50 bg-card/40 backdrop-blur-sm rounded-[1.25rem] overflow-hidden shadow-sm"
    >
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">{">_"}</span>
          <span className="text-muted-foreground font-semibold tracking-tight">sys@agnxi:~$ ./discover-skills.sh</span>
        </div>
        <div className="hidden sm:flex items-center gap-3.5 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          {TOOLS.map((tool) => (
            <Logo key={tool.name} name={tool.name} size={15} aria-label={tool.label} />
          ))}
        </div>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <h1
            id="hero-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5"
          >
            <span className="text-primary">{">"}</span> Agent Skills Directory
          </h1>
          <p className="max-w-2xl text-muted-foreground text-sm sm:text-[15px] leading-relaxed">
            Discover, compare, and install SKILL.md workflows for your coding assistants.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 rounded-xl border border-border/50 text-foreground shadow-sm">
            <span className="text-primary">total_skills:</span> {stats.total > 0 ? formatNumber(stats.total) : "--"}
          </div>
          {stats.updatedToday > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl shadow-sm">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              updated_today: {stats.updatedToday}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/50 rounded-xl border border-border/50 text-foreground shadow-sm">
            <span className="text-primary">sys_status:</span>
            <span className={healthTextColor}>{healthLabel}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-3">
          <Button asChild className="rounded-xl px-6 shadow-sm font-semibold">
            <Link href="/skills">{"[ Browse Skills ]"}</Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl px-6 shadow-sm font-semibold bg-background/50">
            <Link href="/agent-skills">{"[ Read Guide ]"}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export { Hero }

