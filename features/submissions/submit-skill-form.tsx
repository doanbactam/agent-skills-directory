"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitSkill } from "@/lib/actions/skills";

type SubmitState = "idle" | "submitting" | "success" | "error";

type ApprovedSkill = {
  id: string;
  owner: string;
  slug: string;
  name: string;
};

function SubmitSkillForm({ className }: { className?: string }) {
  const [repoUrl, setRepoUrl] = React.useState("");
  const [state, setState] = React.useState<SubmitState>("idle");
  const [message, setMessage] = React.useState("");
  const [approvedSkills, setApprovedSkills] = React.useState<ApprovedSkill[]>(
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoUrl) {
      setMessage("Please enter a GitHub repository URL");
      setState("error");
      toast.error("Please enter a GitHub repository URL");
      return;
    }

    setState("submitting");
    setMessage("");
    setApprovedSkills([]);

    try {
      const result = await submitSkill({ repoUrl });

      if (!result.success) {
        setState("error");
        const msg = result.error || "Submission failed";
        setMessage(msg);
        toast.error(msg);
        return;
      }

      setState("success");

      if (result.skills && result.skills.length > 0) {
        setApprovedSkills(result.skills);
        const importedCount = result.approved ?? result.skills.length;
        const already = result.already ?? 0;
        const msg =
          already > 0
            ? `${importedCount} skills imported, ${already} already up to date.`
            : `${importedCount} skill${importedCount > 1 ? "s" : ""} imported successfully!`;
        setMessage(msg);
        toast.success(msg);
      } else if (result.skill) {
        setApprovedSkills([result.skill]);
        setMessage("Skill imported successfully!");
        toast.success("Skill imported!");
      }

      setRepoUrl("");
    } catch (error) {
      setState("error");
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <div className="space-y-1.5">
        <label htmlFor="repoUrl" className="sr-only">
          GitHub repository URL
        </label>
        <Input
          id="repoUrl"
          type="url"
          placeholder="https://github.com/username/repo…"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          disabled={state === "submitting"}
          name="repoUrl"
          autoComplete="off"
          inputMode="url"
          spellCheck={false}
          autoCapitalize="none"
          required
          className="h-10"
        />
      </div>

      {message && (
        <div
          className={cn(
            "flex items-start gap-2 rounded-md border p-2.5 text-sm",
            state === "success" && "border-green-500/30 bg-green-500/5",
            state === "error" && "border-destructive/30 bg-destructive/5",
          )}
          role={state === "error" ? "alert" : "status"}
        >
          {state === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" aria-hidden="true" />
          ) : (
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
          )}
          <div className="space-y-1 min-w-0">
            <p>{message}</p>
            {state === "success" && approvedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {approvedSkills.slice(0, 5).map((skill) => (
                  <a
                    key={skill.id}
                    href={`/${skill.owner}/skills/${skill.slug}`}
                    className="text-xs text-primary text-link"
                  >
                    {skill.name}
                  </a>
                ))}
                {approvedSkills.length > 5 && (
                  <span className="text-xs text-muted-foreground">
                    +{approvedSkills.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={state === "submitting" || !repoUrl.trim()}
        isLoading={state === "submitting"}
        loadingText="Importing…"
        className="w-full"
      >
        Submit
      </Button>
    </form>
  );
}

export { SubmitSkillForm };
