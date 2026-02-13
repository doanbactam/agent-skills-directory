import type { Metadata } from "next"
import Link from "next/link"
import { Boxes, Trophy, Medal } from "lucide-react"

import { getOwnerRankings, type OwnerRanking } from "@/lib/db/queries"
import { buildMetadata } from "@/lib/seo"
import { VerifiedBadge } from "@/features/skills/verified-badge"
import { Container } from "@/components/layouts/container"
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs-json-ld"
import { ExternalImage } from "@/components/ui/external-image"
import { cn } from "@/lib/utils"

export const metadata: Metadata = buildMetadata({
  title: "Top Contributors Ranking",
  description:
    "See contributors ranked by published agent skills.",
  path: "/ranking",
  keywords: ["agent skills ranking", "ranking", "leaderboard", "top contributors", "skill authors", "maintainers"],
})

type PageProps = {
  searchParams: Promise<{
    sort?: string
  }>
}

type SortValue = "skills" | "stars" | "forks"

const allowedSorts: SortValue[] = ["skills", "stars", "forks"]

function parseSort(value: string | undefined): SortValue {
  if (!value) return "skills"
  const normalized = value.toLowerCase()
  if (allowedSorts.includes(normalized as SortValue)) {
    return normalized as SortValue
  }
  return "skills"
}

function TopThreeCard({ owner, rank }: { owner: OwnerRanking; rank: number }) {
  const initials = owner.owner.slice(0, 2).toUpperCase()
  
  const rankConfig = {
    1: {
      gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
      border: "border-amber-500/30",
      badge: "bg-gradient-to-br from-amber-400 to-amber-600 text-white",
      icon: Trophy,
      size: "size-20",
      avatarBorder: "border-amber-500/40",
    },
    2: {
      gradient: "from-slate-400/20 via-slate-400/10 to-transparent",
      border: "border-slate-400/30",
      badge: "bg-gradient-to-br from-slate-300 to-slate-500 text-white",
      icon: Medal,
      size: "size-16",
      avatarBorder: "border-slate-400/40",
    },
    3: {
      gradient: "from-orange-500/20 via-orange-500/10 to-transparent",
      border: "border-orange-500/30",
      badge: "bg-gradient-to-br from-orange-400 to-orange-600 text-white",
      icon: Medal,
      size: "size-16",
      avatarBorder: "border-orange-500/40",
    },
  } as const

  const config = rankConfig[rank as 1 | 2 | 3]
  const Icon = config.icon

  return (
    <Link
      href={`/${owner.owner}`}
      className={cn(
        "group relative flex flex-col items-center rounded-2xl border-2 p-6 backdrop-blur-sm transition-all duration-300",
        "bg-gradient-to-b",
        config.gradient,
        config.border,
        "hover:scale-[1.02] hover:shadow-lg",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
      )}
    >
      {/* Rank Badge */}
      <div className={cn(
        "absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center size-12 rounded-full shadow-lg",
        config.badge
      )}>
        <Icon className="size-6" aria-hidden="true" />
        <span className="sr-only">Rank {rank}</span>
      </div>

      {/* Avatar */}
      <div className={cn(
        "mt-4 rounded-2xl overflow-hidden bg-muted border-2",
        config.size,
        config.avatarBorder
      )}>
        {owner.avatarUrl ? (
          <ExternalImage 
            src={owner.avatarUrl} 
            alt={`${owner.owner} avatar`} 
            width={rank === 1 ? 80 : 64}
            height={rank === 1 ? 80 : 64}
            quality={80}
            className="object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center size-full">
            <span className="text-lg font-semibold text-muted-foreground">{initials}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-4 text-center space-y-1">
        <div className="flex items-center justify-center gap-1">
          <h3 className="font-bold text-base truncate max-w-[140px] group-hover:text-primary transition-colors">
            {owner.owner}
          </h3>
          {owner.isVerifiedOrg && (
            <VerifiedBadge size="md" />
          )}
        </div>
        <div className="flex items-center justify-center gap-1.5">
          <Boxes className="size-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm font-semibold text-foreground">
            {owner.totalSkills} skill{owner.totalSkills !== 1 && "s"}
          </p>
        </div>
      </div>
    </Link>
  )
}

function TopTenCard({ owner, rank }: { owner: OwnerRanking; rank: number }) {
  const initials = owner.owner.slice(0, 2).toUpperCase()

  return (
    <Link
      href={`/${owner.owner}`}
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 backdrop-blur-sm transition-all duration-200",
        "hover:border-primary/40 hover:bg-primary/10 hover:shadow-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2"
      )}
    >
      {/* Rank */}
      <div className="flex shrink-0 items-center justify-center size-10 rounded-lg bg-primary/10 text-primary font-bold text-sm tabular-nums border border-primary/20">
        {rank}
      </div>

      {/* Avatar */}
      <div className="size-12 overflow-hidden rounded-xl bg-muted border border-border/50 shrink-0">
        {owner.avatarUrl ? (
          <ExternalImage 
            src={owner.avatarUrl} 
            alt={`${owner.owner} avatar`} 
            width={48}
            height={48}
            quality={75}
            className="object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center size-full">
            <span className="text-sm font-semibold text-muted-foreground">{initials}</span>
          </div>
        )}
      </div>

      {/* Owner Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {owner.owner}
          </h3>
          {owner.isVerifiedOrg && (
            <VerifiedBadge size="sm" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Boxes className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            {owner.totalSkills} skill{owner.totalSkills !== 1 && "s"}
          </p>
        </div>
      </div>
    </Link>
  )
}

function RankingCard({ owner, rank }: { owner: OwnerRanking; rank: number }) {
  const initials = owner.owner.slice(0, 2).toUpperCase()

  return (
    <Link
      href={`/${owner.owner}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg border border-border/50 bg-background/95 supports-[backdrop-filter]:bg-background/60 p-3 backdrop-blur transition-colors",
        "hover:border-primary/30 hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      )}
    >
      {/* Rank */}
      <div className="flex shrink-0 items-center justify-center size-8 rounded-lg bg-muted/50 text-muted-foreground font-semibold text-xs tabular-nums border border-border/40">
        {rank}
      </div>

      {/* Avatar */}
      <div className="size-10 overflow-hidden rounded-lg bg-muted shrink-0">
        {owner.avatarUrl ? (
          <ExternalImage 
            src={owner.avatarUrl} 
            alt={`${owner.owner} avatar`} 
            width={40}
            height={40}
            quality={75}
            className="object-cover" 
          />
        ) : (
          <div className="flex items-center justify-center size-full">
            <span className="text-xs font-semibold text-muted-foreground">{initials}</span>
          </div>
        )}
      </div>

      {/* Owner Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
            {owner.owner}
          </h3>
          {owner.isVerifiedOrg && (
            <VerifiedBadge size="sm" />
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <Boxes className="size-3.5 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            {owner.totalSkills} skill{owner.totalSkills !== 1 && "s"}
          </p>
        </div>
      </div>
    </Link>
  )
}

export default async function RankingPage({ searchParams }: PageProps) {
  const { sort } = await searchParams
  const sortBy = parseSort(sort)

  const owners = await getOwnerRankings({ sortBy, limit: 100 })
  const topThree = owners.slice(0, 3)
  const topFourToTen = owners.slice(3, 10)
  const rest = owners.slice(10)

  return (
    <Container>
      <BreadcrumbsJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Ranking", url: "/ranking" },
        ]}
      />

      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-balance text-2xl font-bold tracking-tight">
          Top Agent Skills Contributors
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
          Ranked by number of published agent skills.
        </p>
        <p className="text-muted-foreground text-xs">
          New to agent skills? Read the{" "}
          <Link href="/agent-skills" className="text-primary text-link">
            Agent Skills Guide
          </Link>
          .
        </p>
      </header>

      {/* Top 3 Podium */}
      {topThree.length >= 3 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-center">Top 3 Contributors</h2>
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {/* 2nd Place */}
            <div className="pt-8">
              <TopThreeCard owner={topThree[1]} rank={2} />
            </div>
            {/* 1st Place */}
            <div>
              <TopThreeCard owner={topThree[0]} rank={1} />
            </div>
            {/* 3rd Place */}
            <div className="pt-8">
              <TopThreeCard owner={topThree[2]} rank={3} />
            </div>
          </div>
        </section>
      )}

      {/* Top 4-10 */}
      {topFourToTen.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Top 4-10</h2>
          <div className="space-y-2">
            {topFourToTen.map((owner, index) => (
              <TopTenCard key={owner.owner} owner={owner} rank={index + 4} />
            ))}
          </div>
        </section>
      )}

      {/* Rest of Rankings */}
      {rest.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">All Contributors</h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((owner, index) => (
              <RankingCard key={owner.owner} owner={owner} rank={index + 11} />
            ))}
          </div>
        </section>
      )}

      {owners.length === 0 && (
        <div className="text-muted-foreground py-12 text-center text-sm">
          No contributors found.
        </div>
      )}
    </Container>
  )
}
