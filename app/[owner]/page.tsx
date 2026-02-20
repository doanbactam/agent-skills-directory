import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star, GitFork, Github, Boxes, ExternalLink, ShieldCheck } from "lucide-react";

import { checkAdminAuth } from "@/lib/auth";
import { getCategories, getOwnerInfo } from "@/lib/db/queries";
import { setOwnerVerified } from "@/lib/actions/admin-owners";
import { getSiteUrl } from "@/lib/site-url";
import { buildMetadata } from "@/lib/seo";
import { getExternalUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layouts/container";
import { Section } from "@/components/layouts/section";
import { BreadcrumbsJsonLd } from "@/components/seo/breadcrumbs-json-ld";
import { JsonLd } from "@/components/seo/json-ld";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { OwnerSkillsFilter } from "./owner-skills-filter";

const getOwner = React.cache(async (owner: string) => getOwnerInfo(owner));
const getAllCategories = React.cache(async () => getCategories());

async function updateOwnerVerified(formData: FormData) {
  "use server";
  const owner = String(formData.get("owner") ?? "");
  const verified = String(formData.get("verified") ?? "") === "true";

  if (!owner) return;
  await setOwnerVerified(owner, verified);
}

type PageProps = {
  params: Promise<{
    owner: string;
  }>;
};

function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return num.toString();
}

export default async function OwnerPage({ params }: PageProps) {
  const { owner } = await params;
  const [ownerInfo, categories, isAdmin] = await Promise.all([
    getOwner(owner),
    getAllCategories(),
    checkAdminAuth(),
  ]);

  if (!ownerInfo) {
    notFound();
  }

  const githubUrl = `https://github.com/${ownerInfo.owner}`;
  const siteUrl = getSiteUrl();

  return (
    <Container>
      <BreadcrumbsJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Skills", url: "/skills" },
          { name: owner, url: `/${owner}` },
        ]}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          name: `${owner} skills`,
          url: new URL(`/${owner}`, siteUrl).toString(),
          mainEntity: {
            "@type": "Organization",
            name: owner,
            url: githubUrl,
          },
        }}
      />

      <Section spacing="sm">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Skills", href: "/skills" },
            { label: ownerInfo.owner },
          ]}
        />
      </Section>

      {/* Profile Card */}
      <Section spacing="md">
        <section className="rounded-xl border border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
        <div className="h-16 bg-muted/30" />
        
        <div className="px-4 pb-4 -mt-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative shrink-0">
              <UserAvatar
                src={ownerInfo.avatarUrl}
                alt={`${ownerInfo.owner} avatar`}
                size={64}
                className="size-16 rounded-xl bg-card border-2 border-background shadow-sm"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <h1 className="flex items-center gap-1.5 text-xl font-bold text-balance">
                <span className="truncate">{ownerInfo.owner}</span>
                {ownerInfo.isVerifiedOrg && (
                  <ShieldCheck
                    className="size-5 shrink-0 text-blue-500"
                    aria-label="Verified"
                  />
                )}
              </h1>
              <p className="text-xs text-muted-foreground text-pretty">
                {ownerInfo.isVerifiedOrg ? "Verified" : "Unverified"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {isAdmin && (
                <form action={updateOwnerVerified}>
                  <input type="hidden" name="owner" value={ownerInfo.owner} />
                  <input type="hidden" name="verified" value={ownerInfo.isVerifiedOrg ? "false" : "true"} />
                  <Button
                    size="sm"
                    variant={ownerInfo.isVerifiedOrg ? "outline" : "default"}
                    className="gap-1.5 h-7 text-xs"
                  >
                    {ownerInfo.isVerifiedOrg ? "Unverify Owner" : "Verify Owner"}
                  </Button>
                </form>
              )}
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 h-7 text-xs"
                asChild
              >
                <a href={getExternalUrl(githubUrl)} target="_blank" rel="noopener noreferrer">
                  <Github className="size-3.5" aria-hidden="true" />
                  View on GitHub
                  <ExternalLink className="size-3" aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-border/40">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                <Boxes className="size-4 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums leading-tight">
                  {ownerInfo.totalSkills}
                </p>
                <p className="text-[10px] text-muted-foreground text-pretty">Skills</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-amber-500/10">
                <Star className="size-4 text-amber-500 fill-amber-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums leading-tight">
                  {formatNumber(ownerInfo.totalStars)}
                </p>
                <p className="text-[10px] text-muted-foreground text-pretty">Stars</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center size-8 rounded-lg bg-blue-500/10">
                <GitFork className="size-4 text-blue-500" aria-hidden="true" />
              </div>
              <div>
                <p className="text-lg font-bold tabular-nums leading-tight">
                  {formatNumber(ownerInfo.totalForks)}
                </p>
                <p className="text-[10px] text-muted-foreground text-pretty">Forks</p>
              </div>
            </div>
          </div>
        </div>
        </section>
      </Section>

      {/* Skills Section */}
      <Section spacing="lg">
        <section className="space-y-3">
          <OwnerSkillsFilter
            owner={ownerInfo.owner}
            skills={ownerInfo.skills}
            categories={categories}
          />
        </section>
      </Section>
    </Container>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { owner } = await params;
  const ownerInfo = await getOwner(owner);

  if (!ownerInfo) {
    return buildMetadata({
      title: "Owner Not Found",
      description: "The requested owner profile could not be found.",
      path: `/${owner}`,
      noIndex: true,
    });
  }

  return buildMetadata({
    title: owner,
    description: `Browse ${ownerInfo.totalSkills} agent skills by ${owner}.`,
    path: `/${owner}`,
    openGraphType: "profile",
  });
}
