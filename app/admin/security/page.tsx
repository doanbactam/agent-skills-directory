import * as React from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"

import { checkAdminAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { skills } from "@/lib/db/schema"
import { desc, isNotNull } from "drizzle-orm"
import type { SecurityScanResult } from "@/lib/features/skills/security-scanner"

export default async function SecurityPage() {
  const isAdmin = await checkAdminAuth()

  if (!isAdmin) {
    redirect("/")
  }

  // Fetch skills with security scans
  const scannedSkills = await db
    .select({
      id: skills.id,
      name: skills.name,
      slug: skills.slug,
      owner: skills.owner,
      repo: skills.repo,
      stars: skills.stars,
      securityScan: skills.securityScan,
      securityScannedAt: skills.securityScannedAt,
      status: skills.status,
    })
    .from(skills)
    .where(isNotNull(skills.securityScan))
    .orderBy(desc(skills.securityScannedAt))
    .limit(100)

  // Parse and categorize
  const unsafeSkills = scannedSkills.filter(s => {
    if (!s.securityScan) return false
    try {
      const scan = JSON.parse(s.securityScan) as SecurityScanResult
      return !scan.safe || scan.riskScore >= 50
    } catch {
      return false
    }
  })

  const stats = {
    total: scannedSkills.length,
    unsafe: unsafeSkills.length,
    safe: scannedSkills.length - unsafeSkills.length,
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to Admin
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-12 rounded-lg bg-primary/10">
              <Shield className="size-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Security Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Monitor SKILL.md files for security threats
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border rounded-lg p-6 bg-card">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="size-5 text-muted-foreground" />
              <div className="text-sm font-medium text-muted-foreground">Total Scanned</div>
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">Skills analyzed</p>
          </div>
          
          <div className="border rounded-lg p-6 bg-card border-destructive/50">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="size-5 text-destructive" />
              <div className="text-sm font-medium text-muted-foreground">Unsafe Skills</div>
            </div>
            <div className="text-3xl font-bold text-destructive">{stats.unsafe}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? `${Math.round((stats.unsafe / stats.total) * 100)}%` : "0%"} of total
            </p>
          </div>
          
          <div className="border rounded-lg p-6 bg-card border-green-500/50">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="size-5 text-green-600" />
              <div className="text-sm font-medium text-muted-foreground">Safe Skills</div>
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.safe}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.total > 0 ? `${Math.round((stats.safe / stats.total) * 100)}%` : "0%"} of total
            </p>
          </div>
        </div>

        {/* Empty State */}
        {scannedSkills.length === 0 && (
          <div className="border rounded-lg p-12 text-center bg-card">
            <Shield className="size-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Security Scans Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Security scans will appear here after skills are synced
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Admin Dashboard
            </Link>
          </div>
        )}

        {/* Unsafe Skills List */}
        {unsafeSkills.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="size-5 text-destructive" />
              <h2 className="text-xl font-bold">Skills with Security Issues</h2>
              <span className="text-sm text-muted-foreground">({unsafeSkills.length})</span>
            </div>
            <div className="space-y-4">
              {unsafeSkills.map(skill => {
                const scan = JSON.parse(skill.securityScan!) as SecurityScanResult
                return (
                  <div key={skill.id} className="border rounded-lg p-5 bg-card hover:border-border/80 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/${skill.owner}/skills/${skill.slug}`}
                          className="font-semibold text-lg hover:text-primary transition-colors"
                        >
                          {skill.name}
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {skill.owner}/{skill.repo} • {skill.stars ?? 0} ⭐
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            scan.riskScore >= 75
                              ? "bg-red-500/10 text-red-600 border border-red-500/20"
                              : scan.riskScore >= 50
                                ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                                : "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                          }`}
                        >
                          Risk: {scan.riskScore}/100
                        </span>
                      </div>
                    </div>

                    {/* Threats */}
                    {scan.threats.length > 0 && (
                      <div className="space-y-2 mt-4 pt-4 border-t">
                        {scan.threats.slice(0, 5).map((threat, idx) => (
                          <div
                            key={idx}
                            className="text-sm border-l-2 pl-3 py-2 rounded-r bg-muted/30"
                            style={{
                              borderColor:
                                threat.severity === "critical"
                                  ? "rgb(239 68 68)"
                                  : threat.severity === "high"
                                    ? "rgb(249 115 22)"
                                    : threat.severity === "medium"
                                      ? "rgb(234 179 8)"
                                      : "rgb(59 130 246)",
                            }}
                          >
                            <div className="font-medium">
                              <span className="text-[10px] uppercase tracking-wide opacity-70">
                                {threat.severity}
                              </span>
                              {" • "}
                              {threat.message}
                            </div>
                            {threat.details && (
                              <div className="text-muted-foreground mt-1 text-xs">{threat.details}</div>
                            )}
                          </div>
                        ))}
                        {scan.threats.length > 5 && (
                          <div className="text-sm text-muted-foreground pl-3">
                            +{scan.threats.length - 5} more threats
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Safe Skills Summary */}
        {stats.safe > 0 && (
          <div className="border rounded-lg p-6 bg-green-500/5 border-green-500/20 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="size-5 text-green-600" />
              <h3 className="font-semibold text-green-600">Safe Skills</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {stats.safe} {stats.safe === 1 ? "skill has" : "skills have"} been scanned and verified as safe with no security threats detected.
            </p>
          </div>
        )}

        {/* Reference */}
        <div className="border rounded-lg p-6 bg-muted/30">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            📚 Security Reference
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Security scanning based on Agent Skills Threat Model. Learn more about the threats we detect and how to protect your skills.
          </p>
          <div className="flex gap-3">
            <a
              href="https://safedep.io/agent-skills-threat-model/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary text-link font-medium"
            >
              Read the full threat model →
            </a>
            <a
              href="https://arxiv.org/html/2510.26328v1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary text-link font-medium"
            >
              Research paper →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
