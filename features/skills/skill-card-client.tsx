"use client";

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
        "group relative flex h-full flex-col rounded-2xl border border-border/40 bg-card/30 p-4 shadow-sm",
        "backdrop-blur-sm font-mono transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/40 hover:bg-card/50 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div className="flex items-start gap-2.5 mb-2.5">
        <div className="shrink-0 mt-0.5">
          <UserAvatar
            src={skill.avatarUrl}
            alt={`${skill.name} by ${skill.owner}`}
            size={32}
            className="rounded-xl size-8 border border-border/50 shadow-sm"
          />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="truncate text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            <Link
              href={skillUrl}
              prefetch={false}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-lg"
            >
              <span className="absolute inset-0 rounded-2xl" aria-hidden="true" />
              {skill.owner}/{skill.name}
            </Link>
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            {skill.isVerifiedOrg && (
              <span className="inline-flex items-center text-[10px] text-blue-500 bg-blue-500/10 px-1 py-0.5 rounded">
                <ShieldCheck className="size-3 mr-1" aria-hidden="true" />
                Verified
              </span>
            )}
            {skill.securityScan && (
              <div className="relative z-10 scale-90 origin-left -ml-1">
                <SecurityBadge securityScan={skill.securityScan} variant="icon" />
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">
        {skill.description}
      </p>

      <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2.5 text-[11px] text-muted-foreground/70">
        <div className="flex items-center gap-3">
          {skill.stars !== null && skill.stars > 0 && (
            <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
              <Star className="size-3 fill-amber-500" aria-hidden="true" />
              {formatStars(skill.stars)}
            </span>
          )}
        </div>
        {updatedAt && (
          <span className="tabular-nums">
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
