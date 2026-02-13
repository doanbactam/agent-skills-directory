import * as React from "react";
import Link from "next/link";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { ExternalImage } from "@/components/ui/external-image";
import { SecurityBadge } from "./security-badge";
import { VerifiedBadge } from "./verified-badge";
import type { SkillListItem } from "@/types";

type SkillCardProps = {
  skill: SkillListItem;
  className?: string;
};

function SkillCard({ skill, className }: SkillCardProps) {
  const skillUrl = `/${skill.owner}/skills/${skill.slug}`;
  const updatedAt = skill.updatedAtLabel ?? null;
  const optimizedAvatar = buildAvatarUrl(skill.avatarUrl);

  return (
    <Link
      href={skillUrl}
      prefetch={false}
      data-slot="skill-card"
      className={cn(
        "group relative flex h-full flex-col rounded-xl border border-border/40 bg-card/30 p-3.5",
        "backdrop-blur-sm",
        "transition-[box-shadow,background-color,border-color] duration-200 ease-out motion-reduce:transition-none",
        "hover:border-border/60 hover:bg-card/50 hover:shadow-md hover:shadow-black/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          {skill.avatarUrl ? (
            <div className="overflow-hidden rounded-lg bg-muted">
              <ExternalImage
                src={optimizedAvatar ?? skill.avatarUrl}
                alt={`${skill.name} by ${skill.owner}`}
                width={40}
                height={40}
                quality={75}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted/70">
              <span className="text-xs font-semibold text-muted-foreground">
                {skill.owner.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="truncate text-sm font-semibold leading-tight text-foreground group-hover:text-foreground">
            {skill.name}
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{skill.owner}</span>
            {skill.isVerifiedOrg && (
              <VerifiedBadge size="sm" />
            )}
            {skill.securityScan && (
              <SecurityBadge securityScan={skill.securityScan} variant="icon" />
            )}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2 text-pretty">
        {skill.description}
      </p>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-3 border-t border-border/30 pt-3 text-xs text-muted-foreground">
        {skill.stars !== null && skill.stars > 0 && (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Star
              className="size-3.5 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />
            <span className="font-medium">{formatStars(skill.stars)}</span>
          </span>
        )}
        {updatedAt && (
          <span className="text-muted-foreground/70">
            Updated {updatedAt}
          </span>
        )}
      </div>
    </Link>
  );
}

function buildAvatarUrl(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;

  try {
    const url = new URL(avatarUrl);
    url.searchParams.set("s", "80");
    return url.toString();
  } catch {
    const separator = avatarUrl.includes("?") ? "&" : "?";
    return `${avatarUrl}${separator}s=80`;
  }
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return stars.toString();
}

export { SkillCard };
