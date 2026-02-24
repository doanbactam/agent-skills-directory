"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { CopyButton } from "@/features/skills/copy-button";

type InstallCommandProps = {
  owner: string;
  repo: string;
  skillName: string;
  variant?: "default" | "compact";
};

function getInstallCommand(owner: string, repo: string, skillName: string): string {
  const normalizedSkill = /\s/.test(skillName)
    ? `"${skillName.replace(/"/g, '\\"')}"`
    : skillName;
  return `npx skills add ${owner}/${repo} --skill ${normalizedSkill}`;
}

function InstallCommand({ owner, repo, skillName, variant = "default" }: InstallCommandProps) {
  const command = getInstallCommand(owner, repo, skillName);

  if (variant === "compact") {
    return (
      <div className="space-y-3">
        {/* Command Display */}
        <div className="group relative rounded-xl bg-muted/50 dark:bg-muted/30 border border-border/50 p-3 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ChevronRight
                className="size-3.5 shrink-0 text-primary transition-colors duration-200 motion-reduce:transition-none"
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <pre className="font-mono text-xs leading-relaxed overflow-x-auto scrollbar-none min-w-0 flex-1">
                <code className="flex items-center gap-1">
                  <span className="font-semibold shrink-0 text-primary">
                    {command.split(" ")[0]}
                  </span>
                  <span className="text-muted-foreground break-words">
                    {command.split(" ").slice(1).join(" ")}
                  </span>
                </code>
              </pre>
            </div>
            <CopyButton text={command} variant="prominent" label="Copy" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/30 overflow-hidden shadow-sm backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-6 rounded bg-primary/10 text-primary font-mono text-xs font-bold leading-none">
            {">_"}
          </div>
          <span className="text-[13px] font-bold tracking-tight text-foreground">Quick Install</span>
        </div>
        <CopyButton text={command} variant="prominent" label="Copy" />
      </div>

      {/* Command Display */}
      <div className="px-4 pb-4">
        <div className="relative rounded-xl bg-background border border-border/40 p-3 shadow-sm overflow-hidden flex items-center">
          <div className="flex items-start gap-3 w-full">
            <ChevronRight
              className="size-4 mt-[1px] shrink-0 text-primary transition-colors duration-200 motion-reduce:transition-none"
              strokeWidth={3}
              aria-hidden="true"
            />
            <pre className="font-mono text-xs leading-relaxed overflow-x-auto scrollbar-none flex-1 min-w-0">
              <code className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="font-bold shrink-0 text-primary">
                  {command.split(" ")[0]}
                </span>
                <span className="text-muted-foreground">
                  {command.split(" ").slice(1, 4).join(" ")}
                </span>
                <span className="font-medium text-foreground">
                  {command.split(" ").slice(4).join(" ")}
                </span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export { InstallCommand };
