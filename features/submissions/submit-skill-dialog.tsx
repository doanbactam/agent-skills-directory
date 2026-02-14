"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SubmitSkillForm } from "@/features/submissions/submit-skill-form";

type SubmitSkillDialogProps = {
  buttonSize?: "sm" | "default";
};

function SubmitSkillDialog({ buttonSize = "default" }: SubmitSkillDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return (
      <Button
        size={buttonSize}
        disabled
        className="gap-1.5"
      >
        <Plus
          strokeWidth={2}
          aria-hidden="true"
        />
        Submit
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button
          size={buttonSize}
          className="gap-1.5"
        >
          <Plus
            strokeWidth={2}
            aria-hidden="true"
          />
          Submit
        </Button>
      </SignInButton>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size={buttonSize}
          className="gap-1.5"
        >
          <Plus
            strokeWidth={2}
            aria-hidden="true"
          />
          Submit
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-md rounded-xl border border-border/70 bg-card p-5 shadow-xl">
        <div className="space-y-0.5">
          <DialogTitle className="text-base font-semibold">
            Submit a skill
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Paste your GitHub repo URL to import SKILL.md files.
          </DialogDescription>
        </div>

        <SubmitSkillForm />

        <p className="text-[11px] text-muted-foreground">
          By submitting, you agree that your skill may be listed publicly.
        </p>
      </DialogContent>
    </Dialog>
  );
}

export { SubmitSkillDialog };
