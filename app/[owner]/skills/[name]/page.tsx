import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Github,
  Star,
  GitFork,
  ExternalLink,
  FileText,
  Clock,
  ShieldCheck,
  Tag,
} from "lucide-react";

import { getSkillBySlug, getSkillCategories } from "@/lib/db/queries";
import { parseTopics } from "@/lib/categories";
import { buildMetadata } from "@/lib/seo";
import { getExternalUrl } from "@/lib/utils";
import { skillRouteParamsSchema, safeParseAllowedTools } from "@/lib/validators/skills";
import { Badge } from "@/components/ui/badge";
import { InstallCommand } from "@/features/skills/install-command";
import { MarkdownContent } from "@/features/skills/markdown-content";
import { RelatedSkillsSection } from "@/features/skills/related-skills-section";
import { SecurityBadge } from "@/features/skills/security-badge";
import { Container } from "@/components/layouts/container";
import { Section } from "@/components/layouts/section";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs-json-ld";
import { SkillStructuredData } from "@/components/seo/skill-structured-data";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ReportSkillDialog } from "@/features/skills/report-skill-dialog";

export const revalidate = 300;

const getSkill = React.cache(async (owner: string, slug: string) =>
  getSkillBySlug(owner, slug),
);

async function fetchSkillBody(rawUrl: string) {
  try {
    const response = await fetch(rawUrl, { next: { revalidate: 3600 } });
    if (!response.ok) return "";
    const content = await response.text();
    return content.replace(/^---[\s\S]*?---\s*/, "");
  } catch {
    return "";
  }
}

function RelatedSkillsFallback() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/30 p-4 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3.5">
            <div className="size-11 rounded-xl bg-muted animate-pulse motion-reduce:animate-none" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
              <div className="h-3 w-24 bg-muted rounded animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

type PageProps = {
  params: Promise<{
    owner: string;
    name: string;
  }>;
};

const relativeDateCache = new Map<string, string>();

export default async function SkillDetailPage({ params }: PageProps) {
  const rawParams = await params;

  const paramsResult = skillRouteParamsSchema.safeParse({
    owner: rawParams.owner,
    name: rawParams.name,
  });

  if (!paramsResult.success) {
    notFound();
  }

  const { owner, name: slug } = paramsResult.data;

  const skill = await getSkill(owner, slug);

  if (!skill) {
    notFound();
  }

  const [skillCategories, bodyContent] = await Promise.all([
    getSkillCategories(skill.id),
    fetchSkillBody(skill.rawUrl),
  ]);
  const primaryCategory = skillCategories[0];

  const githubUrl = `https://github.com/${skill.owner}/${skill.repo}/tree/main/${skill.path}`;
  const ownerUrl = `/${skill.owner}`;

  const formatRelativeDate = (date?: Date | null) => {
    if (!date) return null;
    const cacheKey = date.toISOString();
    const cached = relativeDateCache.get(cacheKey);
    if (cached) return cached;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    let result: string;
    if (diffDays === 0) result = "today";
    else if (diffDays === 1) result = "yesterday";
    else if (diffDays < 7) result = `${diffDays} days ago`;
    else if (diffDays < 30) result = `${Math.floor(diffDays / 7)} weeks ago`;
    else if (diffDays < 365) result = `${Math.floor(diffDays / 30)} months ago`;
    else result = `${Math.floor(diffDays / 365)} years ago`;

    relativeDateCache.set(cacheKey, result);
    return result;
  };

  const allowedTools = safeParseAllowedTools(skill.allowedTools);
  const topics = parseTopics(skill.topics) ?? [];
  const hasBody = bodyContent.trim().length > 0;
  const hasTags = Boolean(skill.compatibility) || allowedTools.length > 0 || topics.length > 0;
  const displayTopics = topics.slice(0, 6);

  const formatStars = (stars: number): string => {
    if (stars >= 1000) {
      return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    }
    return stars.toString();
  };
  const updatedLabel = formatRelativeDate(skill.repoUpdatedAt) ?? "N/A";

  return (
    <Container>
      <BreadcrumbsJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Skills", url: "/skills" },
          ...(primaryCategory
            ? [
              {
                name: primaryCategory.name,
                url: `/categories/${primaryCategory.slug}`,
              },
            ]
            : []),
          { name: skill.owner, url: `/${skill.owner}` },
          { name: skill.name, url: `/${skill.owner}/skills/${skill.slug}` },
        ]}
      />
      <SkillStructuredData skill={skill} categories={skillCategories} />

      <Section spacing="sm">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Skills", href: "/skills" },
            ...(primaryCategory
              ? [{ label: primaryCategory.name, href: `/categories/${primaryCategory.slug}` }]
              : []),
            { label: skill.name },
          ]}
        />
      </Section>

      <Section spacing="md">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="relative flex items-start sm:items-center gap-4 group flex-1 min-w-0">
                <div className="shrink-0 mt-1 sm:mt-0">
                  <UserAvatar
                    src={skill.avatarUrl}
                    alt={`${skill.name} by ${skill.owner}`}
                    size={56}
                    className="size-12 sm:size-14 rounded-xl shadow-sm border border-border/50 transition-transform group-hover:scale-105 duration-300"
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate leading-tight text-balance group-hover:text-primary transition-colors">{skill.name}</h1>
                    {skill.securityScan && (
                      <div className="lg:hidden shrink-0">
                        <SecurityBadge securityScan={skill.securityScan} variant="icon" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <p className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground">
                      <Link href={`/${skill.owner}`} className="hover:text-foreground transition-colors truncate">
                        {skill.owner}
                      </Link>
                      {skill.isVerifiedOrg && (
                        <span className="inline-flex items-center" title="Verified Organization">
                          <ShieldCheck className="size-3.5 shrink-0 text-primary fill-primary/10" aria-hidden="true" />
                        </span>
                      )}
                    </p>
                    <span className="hidden sm:inline-block text-muted-foreground/30">•</span>
                    <div className="flex items-center gap-3 text-xs sm:text-sm font-medium text-muted-foreground">
                      <span className="flex items-center gap-1.5" title="Stars">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                        {formatStars(skill.stars ?? 0)}
                      </span>
                      <span className="flex items-center gap-1.5" title="Forks">
                        <GitFork className="size-3.5" aria-hidden="true" />
                        {skill.forks ?? 0}
                      </span>
                      <span className="flex items-center gap-1.5" title="Updated">
                        <Clock className="size-3.5" aria-hidden="true" />
                        {updatedLabel}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getExternalUrl(githubUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-1.5 h-8 rounded-full border border-border/60 bg-background/50 hover:bg-muted transition-colors text-foreground"
                >
                  <Github className="size-3.5" aria-hidden="true" />
                  Source
                </a>
                <a
                  href={getExternalUrl(skill.rawUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-1.5 h-8 rounded-full border border-border/60 bg-background/50 hover:bg-muted transition-colors text-foreground"
                >
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  Raw
                </a>
              </div>
            </div>

            {skill.description && (
              <p className="text-[15px] sm:text-base text-muted-foreground/90 leading-relaxed break-words text-pretty font-normal">
                {skill.description}
              </p>
            )}

            <InstallCommand
              owner={skill.owner}
              repo={skill.repo}
              skillName={skill.name}
            />

            {skill.securityScan && (
              <div className="lg:hidden">
                <SecurityBadge securityScan={skill.securityScan} variant="full" />
              </div>
            )}

            <div className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                <span className="text-sm font-semibold">Instructions</span>
              </div>
              <div className="p-4 sm:p-5">
                {hasBody ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                    <React.Suspense
                      fallback={
                        <p className="text-sm text-muted-foreground/60 text-center py-8">
                          Loading…
                        </p>
                      }
                    >
                      <MarkdownContent content={bodyContent} />
                    </React.Suspense>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/60 text-center py-8">
                    No instructions available
                  </p>
                )}
              </div>
            </div>

            <div className="lg:hidden mt-8">
              <React.Suspense fallback={<RelatedSkillsFallback />}>
                <RelatedSkillsSection skillId={skill.id} />
              </React.Suspense>
            </div>

            {hasTags && (
              <div className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden shadow-sm backdrop-blur-sm mt-6">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/30">
                  <Tag className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-sm font-semibold">Tags & Topics</span>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex flex-wrap gap-2">
                    {skill.compatibility && (
                      <Badge variant="outline" className="text-xs px-2.5 py-0.5 rounded-full">
                        {skill.compatibility}
                      </Badge>
                    )}
                    {allowedTools.map((tool: string) => (
                      <Badge key={tool} variant="secondary" className="text-xs px-2.5 py-0.5 font-mono rounded-full bg-secondary/50">
                        {tool}
                      </Badge>
                    ))}
                    {displayTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-xs px-2.5 py-0.5 rounded-full bg-secondary/50">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:relative">
            <div className="lg:sticky lg:top-24 space-y-5">
              {skill.securityScan && (
                <div className="lg:block hidden">
                  <SecurityBadge securityScan={skill.securityScan} variant="full" />
                </div>
              )}

              <Link
                href={ownerUrl}
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/40 p-4 hover:border-primary/30 hover:bg-card/60 transition-all duration-300 group backdrop-blur-sm shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="shrink-0 overflow-hidden rounded-xl border border-border/50 group-hover:scale-105 transition-transform duration-300">
                  <UserAvatar
                    src={skill.avatarUrl}
                    alt={`${skill.owner} avatar`}
                    size={40}
                    className="size-10"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-base font-semibold truncate group-hover:text-primary transition-colors">
                    <span className="truncate">{skill.owner}</span>
                    {skill.isVerifiedOrg && (
                      <span className="inline-flex items-center" title="Verified Organization">
                        <ShieldCheck className="size-4 shrink-0 text-primary fill-primary/10" aria-hidden="true" />
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium group-hover:text-muted-foreground/80 transition-colors">
                    View all skills
                  </p>
                </div>
              </Link>

              <div className="hidden lg:block">
                <React.Suspense fallback={<RelatedSkillsFallback />}>
                  <RelatedSkillsSection skillId={skill.id} />
                </React.Suspense>
              </div>

              <div className="rounded-2xl border border-border/50 bg-card/40 overflow-hidden shadow-sm backdrop-blur-sm">
                <div className="p-4 flex flex-col justify-center">
                  <ReportSkillDialog skillId={skill.id} skillName={skill.name} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Section>
    </Container>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const rawParams = await params;

  const paramsResult = skillRouteParamsSchema.safeParse({
    owner: rawParams.owner,
    name: rawParams.name,
  });

  if (!paramsResult.success) {
    return buildMetadata({
      title: "Invalid Skill URL",
      description: "The requested skill URL is invalid.",
      path: `/${rawParams.owner}/skills/${rawParams.name}`,
      noIndex: true,
    });
  }

  const { owner, name: slug } = paramsResult.data;
  const skill = await getSkill(owner, slug);

  if (!skill) {
    return buildMetadata({
      title: "Skill Not Found",
      description: "The requested skill could not be found.",
      path: `/${owner}/skills/${slug}`,
      noIndex: true,
    });
  }

  const title = `${skill.name} - Agent Skill by ${skill.owner}`;
  const description = skill.description
    ? `${skill.description} Agent skill with install steps and source repo for Claude Code, Cursor, Windsurf, and more.`
    : `Install ${skill.name} agent skill by ${skill.owner}. SKILL.md workflow compatible with Claude Code, Cursor, Windsurf, and Amp Code.`;

  const keywords = [
    skill.name,
    `${skill.name} skill`,
    skill.owner,
    skill.compatibility ?? "Claude Code",
    "agent skill",
    "agent skills",
    "coding assistant skills",
    "SKILL.md",
  ].filter(Boolean);

  return buildMetadata({
    title,
    description,
    path: `/${skill.owner}/skills/${skill.slug}`,
    openGraphType: "article",
    keywords,
    modifiedTime: skill.repoUpdatedAt?.toISOString(),
    author: skill.owner,
    noIndex: skill.isArchived === true,
  });
}
