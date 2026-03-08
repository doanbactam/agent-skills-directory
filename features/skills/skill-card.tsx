import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SecurityBadge } from "./security-badge";
import type { SkillListItem } from "@/types";

type SkillCardProps = {
  skill: SkillListItem;
  className?: string;
};

function SkillCard({ skill, className }: SkillCardProps) {
  const skillUrl = `/${skill.owner}/skills/${skill.slug}`;
  const updatedAt = skill.updatedAtLabel ?? null;

  return (
    <div
      data-slot="skill-card"
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-border/50 bg-card/40 p-4",
        "backdrop-blur-md shadow-sm",
        "transition-all duration-300 ease-out will-change-transform",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:bg-card/60",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring/50",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-3.5">
        <div className="shrink-0">
          <UserAvatar
            src={skill.avatarUrl}
            alt={`${skill.name} by ${skill.owner}`}
            size={44}
            className="rounded-xl border border-border/50 shadow-sm transition-transform group-hover:scale-105 duration-300"
            quality={85}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="truncate text-base font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
            <Link href={skillUrl} prefetch={false} className="focus:outline-none">
              <span className="absolute inset-0" aria-hidden="true" />
              {skill.name}
            </Link>
          </h3>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className="truncate hover:text-foreground transition-colors">{skill.owner}</span>
            {skill.isVerifiedOrg && (
              <span className="inline-flex items-center relative z-10" title="Verified Organization">
                <ShieldCheck className="size-3.5 shrink-0 text-primary fill-primary/10" aria-hidden="true" />
                <span className="sr-only">Verified organization</span>
              </span>
            )}
            {skill.securityScan && (
              <span className="relative z-10 inline-flex">
                <SecurityBadge securityScan={skill.securityScan} variant="icon" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground/90 line-clamp-2 text-pretty font-normal">
        {skill.description}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 text-xs font-medium text-muted-foreground">
        <div className="flex items-center gap-3">
          {skill.stars !== null && skill.stars > 0 && (
            <span className="inline-flex items-center gap-1 tabular-nums group-hover:text-amber-500 transition-colors">
              <Star
                className="size-3.5 fill-amber-400 text-amber-400"
                aria-hidden="true"
              />
              <span>{formatStars(skill.stars)}</span>
            </span>
          )}
        </div>

        {updatedAt && (
          <span className="text-[11px] text-muted-foreground/70 bg-muted/30 px-2 py-0.5 rounded-full border border-border/30">
            {updatedAt}
          </span>
        )}
      </div>
    </div>
  );
}

function formatStars(stars: number): string {
  if (stars >= 1000) {
    return `${(stars / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }
  return stars.toString();
}

export { SkillCard };
