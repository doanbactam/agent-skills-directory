"use client"

import * as React from "react"
import { LogIn } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

function HeaderAuth() {
  return (
    <div className="ml-2 flex min-w-[112px] items-center justify-end gap-2">
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline" size="sm">
            <LogIn
              strokeWidth={2}
              aria-hidden="true"
            />
            Sign in
          </Button>
        </SignInButton>
      </SignedOut>

      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </SignedIn>
    </div>
  )
}

export { HeaderAuth }
