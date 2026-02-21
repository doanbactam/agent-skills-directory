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
        "group relative flex h-full flex-col rounded-xl border border-border/40 bg-card/30 p-4",
        "backdrop-blur-sm",
        "transition-[box-shadow,background-color,border-color] duration-200 ease-out motion-reduce:transition-none",
        "hover:border-border/60 hover:bg-card/50 hover:shadow-md hover:shadow-black/5",
        className,
      )}
    >

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <UserAvatar
            src={skill.avatarUrl}
            alt={`${skill.name} by ${skill.owner}`}
            size={40}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-0.5 pr-12">
          <h3 className="truncate text-sm font-semibold leading-tight text-foreground group-hover:text-foreground">
            <Link
              href={skillUrl}
              prefetch={false}
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded-md"
            >
              <span className="absolute inset-0 rounded-xl" aria-hidden="true" />
              {skill.name}
            </Link>
          </h3>
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="truncate">{skill.owner}</span>
            {skill.isVerifiedOrg && (
              <span className="inline-flex items-center">
                <ShieldCheck className="size-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                <span className="sr-only">Verified organization</span>
              </span>
            )}
            {skill.securityScan && (
              <div className="relative z-10 ml-1">
                <SecurityBadge securityScan={skill.securityScan} variant="icon" />
              </div>
            )}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 flex-1 text-[13px] leading-relaxed text-muted-foreground line-clamp-2">
        {skill.description}
      </p>

      {/* Footer */}
      <div className="mt-3 flex items-center gap-3 border-t border-border/30 pt-3 text-xs text-muted-foreground">
        {skill.stars !== null && skill.stars > 0 && (
          <span className="inline-flex items-center gap-1">
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
