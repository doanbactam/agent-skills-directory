"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CopyButtonProps = {
  text: string;
  className?: string;
  variant?: "default" | "inline" | "prominent";
  label?: string;
};

function CopyButton({
  text,
  className,
  variant = "default",
  label,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard", { duration: 1600 });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy", { duration: 2200 });
    }
  };

  if (variant === "prominent") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className={cn(
          "gap-2 transition-colors duration-200 rounded-full bg-background/50 h-8 px-3 text-xs shadow-none border-border/60 hover:bg-muted font-medium",
          copied &&
          "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400",
          className,
        )}
        aria-label="Copy to clipboard"
      >
        {copied ? (
          <Check className="size-3.5" strokeWidth={2} aria-hidden="true" />
        ) : (
          <Copy className="size-3.5" strokeWidth={2} aria-hidden="true" />
        )}
        {copied ? "Copied!" : (label ?? "Copy")}
      </Button>
    );
  }

  if (variant === "inline") {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              "inline-flex items-center justify-center rounded-md p-1.5 transition-colors duration-200 touch-manipulation",
              "text-muted-foreground hover:text-foreground hover:bg-muted/80",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              copied && "text-emerald-500 hover:text-emerald-500",
              className,
            )}
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Copy className="size-4" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {copied ? "Copied" : (label ?? "Copy")}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className={cn(
            "shrink-0 transition-colors duration-200",
            copied && "text-emerald-500 hover:text-emerald-500",
            className,
          )}
          aria-label="Copy to clipboard"
        >
          {copied ? (
            <Check className="size-4" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Copy className="size-4" strokeWidth={2} aria-hidden="true" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {copied ? "Copied" : (label ?? "Copy")}
      </TooltipContent>
    </Tooltip>
  );
}

export { CopyButton };
