"use client"

import * as React from "react"
import { useUser, UserButton } from "@clerk/nextjs"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Skill } from "./components/skills-table"

const OverviewTab = dynamic(() => import("./components/overview-tab").then((mod) => ({ default: mod.OverviewTab })), {
  loading: () => <div className="p-8 text-center text-sm text-muted-foreground">Loading overview…</div>,
  ssr: false,
})

const SkillsTab = dynamic(() => import("./components/skills-tab").then((mod) => ({ default: mod.SkillsTab })), {
  loading: () => <div className="p-8 text-center text-sm text-muted-foreground">Loading skills…</div>,
  ssr: false,
})

type Tab = "overview" | "skills"

type AdminClientPageProps = {
  initialSkills: Skill[]
  stats: {
    total: number
    approved: number
    pending: number
  }
}

export default function AdminClientPage({ initialSkills, stats }: AdminClientPageProps) {
  const { isLoaded, user } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const normalizeTab = React.useCallback((value: string | null): Tab => {
    if (value === "skills") return "skills"
    return "overview"
  }, [])

  const [activeTab, setActiveTab] = React.useState<Tab>(
    normalizeTab(searchParams.get("tab"))
  )

  React.useEffect(() => {
    setActiveTab(normalizeTab(searchParams.get("tab")))
  }, [normalizeTab, searchParams])

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeTab === "overview") {
      params.delete("tab")
    } else {
      params.set("tab", activeTab)
    }
    const next = params.toString()
    const current = searchParams.toString()
    if (next !== current) {
      router.replace(`${pathname}${next ? `?${next}` : ""}`, { scroll: false })
    }
  }, [activeTab, pathname, router, searchParams])

  if (!isLoaded) {
    return <div className="p-12 text-center">Loading…</div>
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-6 md:p-8">
      <Card className="rounded-2xl border-border/50 bg-card/40 backdrop-blur-md shadow-sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Admin Dashboard</CardTitle>
              <CardDescription>
                Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </CardDescription>
            </div>
            <CardAction>
              <UserButton afterSignOutUrl="/" />
            </CardAction>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {(["overview", "skills"] as Tab[]).map((tab) => (
              <Button
                key={tab}
                type="button"
                variant={activeTab === tab ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab(tab)}
                className="capitalize"
              >
                {tab}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {activeTab === "overview" && <OverviewTab skills={initialSkills} stats={stats} />}
      {activeTab === "skills" && <SkillsTab skills={initialSkills} />}
    </div>
  )
}


