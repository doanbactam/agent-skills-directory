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
  Share2,
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
import { BadgeSnippet } from "@/features/skills/badge-snippet";
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
    <div className="space-y-3">
      <div className="h-4 w-28 bg-muted rounded animate-pulse motion-reduce:animate-none" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border/50 bg-card/30 p-3">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-muted animate-pulse motion-reduce:animate-none" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-muted rounded animate-pulse motion-reduce:animate-none" />
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
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="space-y-5 min-w-0">
            <div className="relative flex items-center gap-3 group">
              <UserAvatar
                src={skill.avatarUrl}
                alt={`${skill.name} by ${skill.owner}`}
                size={40}
                className="size-10"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold truncate leading-tight text-balance">{skill.name}</h1>
                  {skill.securityScan && (
                    <div className="lg:hidden shrink-0">
                      <SecurityBadge securityScan={skill.securityScan} variant="icon" />
                    </div>
                  )}
                </div>
                <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span>{skill.owner}</span>
                  {skill.isVerifiedOrg && (
                    <ShieldCheck
                      className="size-3.5 shrink-0 text-blue-500"
                      aria-label="Verified"
                    />
                  )}
                </p>
              </div>
            </div>

            {skill.description && (
              <p className="text-sm text-muted-foreground leading-relaxed break-words text-pretty">
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

            <div className="rounded-lg border border-border/50 bg-card/40 overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border/40 bg-muted/30">
                <FileText className="size-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-xs font-medium">Instructions</span>
              </div>
              <div className="p-3.5">
                {hasBody ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none text-[13px]">
                    <React.Suspense
                      fallback={
                        <p className="text-xs text-muted-foreground/60 text-center py-6">
                          Loading…
                        </p>
                      }
                    >
                      <MarkdownContent content={bodyContent} />
                    </React.Suspense>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground/60 text-center py-6">
                    No instructions available
                  </p>
                )}
              </div>
            </div>

            <div className="lg:hidden">
              <React.Suspense fallback={<RelatedSkillsFallback />}>
                <RelatedSkillsSection skillId={skill.id} />
              </React.Suspense>
            </div>

            {hasTags && (
              <div className="rounded-lg border border-border/50 bg-card/40 overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border/40 bg-muted/30">
                  <Tag className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-xs font-medium">Tags & Topics</span>
                </div>
                <div className="p-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {skill.compatibility && (
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 rounded-full">
                        {skill.compatibility}
                      </Badge>
                    )}
                    {allowedTools.map((tool: string) => (
                      <Badge key={tool} variant="secondary" className="text-[10px] px-2 py-0.5 font-mono rounded-full">
                        {tool}
                      </Badge>
                    ))}
                    {displayTopics.map((topic) => (
                      <Badge key={topic} variant="secondary" className="text-[10px] px-2 py-0.5 rounded-full">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-4 lg:relative">
            <div className="lg:sticky lg:top-20 space-y-4">
              {skill.securityScan && (
                <div className="lg:block hidden">
                  <SecurityBadge securityScan={skill.securityScan} variant="full" />
                </div>
              )}

              <Link
                href={ownerUrl}
                className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-card/40 p-3.5 hover:border-border hover:bg-card/80 transition-[background-color,border-color,box-shadow,color] group"
              >
                <UserAvatar
                  src={skill.avatarUrl}
                  alt={`${skill.owner} avatar`}
                  size={32}
                  className="size-8 rounded-md"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 text-[13px] font-medium truncate group-hover:text-primary transition-colors">
                    <span className="truncate">{skill.owner}</span>
                    {skill.isVerifiedOrg && (
                      <ShieldCheck
                        className="size-3.5 shrink-0 text-blue-500"
                        aria-label="Verified"
                      />
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    View all skills
                  </p>
                </div>
              </Link>

              <div className="rounded-lg border border-border/50 bg-card/40 overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border/40 bg-muted/30">
                  <Github className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-[11px] font-medium">Repository</span>
                </div>

                <div className="divide-y divide-border/40">
                  <div className="flex items-center justify-between px-3.5 py-2.5 text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Star className="size-3 text-amber-500/80 fill-amber-500/80" aria-hidden="true" />
                      Stars
                    </span>
                    <span className="font-medium tabular-nums">{formatStars(skill.stars ?? 0)}</span>
                  </div>

                  <div className="flex items-center justify-between px-3.5 py-2.5 text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <GitFork className="size-3" aria-hidden="true" />
                      Forks
                    </span>
                    <span className="font-medium tabular-nums">{skill.forks ?? 0}</span>
                  </div>

                  <div className="flex items-center justify-between px-3.5 py-2.5 text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="size-3" aria-hidden="true" />
                      Updated
                    </span>
                    <span className="font-medium tabular-nums">{updatedLabel}</span>
                  </div>

                  <div className="flex gap-2 p-3.5">
                    <a
                      href={getExternalUrl(githubUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-medium py-1.5 rounded-md border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
                    >
                      <Github className="size-3" aria-hidden="true" />
                      Source
                    </a>
                    <a
                      href={getExternalUrl(skill.rawUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-medium py-1.5 rounded-md border border-border/50 bg-background/50 hover:bg-muted/50 transition-colors"
                    >
                      <ExternalLink className="size-3" aria-hidden="true" />
                      Raw
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/40 overflow-hidden">
                <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-border/40 bg-muted/30">
                  <Share2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  <span className="text-[11px] font-medium">Share this skill</span>
                </div>
                <div className="p-3.5">
                  <BadgeSnippet owner={skill.owner} slug={skill.slug} />
                </div>
              </div>

              <div className="hidden lg:block">
                <React.Suspense fallback={<RelatedSkillsFallback />}>
                  <RelatedSkillsSection skillId={skill.id} />
                </React.Suspense>
              </div>

              <div className="rounded-lg border border-border/50 bg-card/40 overflow-hidden">
                <div className="p-3.5">
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
