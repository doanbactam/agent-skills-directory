/**
 * SKILL.md Security Scanner
 * 
 * Based on Agent Skills Threat Model: https://safedep.io/agent-skills-threat-model/
 * 
 * Threats detected:
 * 1. Prompt Injection (hidden instructions, malicious descriptions)
 * 2. Malicious Script References (unpinned dependencies, dangerous imports)
 * 3. Dangerous Tool Permissions (overly broad allowed-tools)
 * 4. External Resource Fetching (remote config, untrusted URLs)
 * 5. Hidden Characters (zero-width, excessive whitespace)
 * 6. Base64 Encoded Content (potential obfuscation)
 */

export type SecurityThreat = {
  type: ThreatType
  severity: "critical" | "high" | "medium" | "low"
  message: string
  details?: string
  location?: string
}

export type ThreatType =
  | "prompt_injection"
  | "hidden_instructions"
  | "malicious_script"
  | "unpinned_dependency"
  | "dangerous_import"
  | "dangerous_tool_permission"
  | "external_resource"
  | "hidden_characters"
  | "base64_content"
  | "suspicious_pattern"

export type SecurityScanResult = {
  safe: boolean
  threats: SecurityThreat[]
  riskScore: number // 0-100
}

/**
 * Scan SKILL.md content for security threats
 */
export function scanSkillContent(content: string): SecurityScanResult {
  const threats: SecurityThreat[] = []

  // 1. Check for prompt injection patterns
  threats.push(...detectPromptInjection(content))

  // 2. Check for hidden characters
  threats.push(...detectHiddenCharacters(content))

  // 3. Check for base64 encoded content
  threats.push(...detectBase64Content(content))

  // 4. Check for external resource fetching
  threats.push(...detectExternalResources(content))

  // 5. Check for hardcoded secrets
  threats.push(...detectSecrets(content))

  // Calculate risk score
  const riskScore = calculateRiskScore(threats)

  return {
    safe: riskScore < 50, // Threshold for "safe"
    threats,
    riskScore,
  }
}

/**
 * Scan allowed-tools field for dangerous permissions
 */
export function scanAllowedTools(allowedTools: string | string[] | undefined): SecurityThreat[] {
  if (!allowedTools) return []

  const threats: SecurityThreat[] = []
  const tools = Array.isArray(allowedTools) ? allowedTools : [allowedTools]

  for (const tool of tools) {
    const normalized = tool.toLowerCase().trim()

    // Check for wildcard or "all" permissions
    if (normalized === "*" || normalized === "all") {
      threats.push({
        type: "dangerous_tool_permission",
        severity: "critical",
        message: "Wildcard tool permission detected",
        details: "allowed-tools: * grants unrestricted access to all tools",
        location: "allowed-tools field",
      })
    }

    // Check for dangerous specific tools
    const dangerousTools = ["shell", "exec", "execute", "file_write", "network", "subprocess"]
    if (dangerousTools.some(dt => normalized.includes(dt))) {
      threats.push({
        type: "dangerous_tool_permission",
        severity: "high",
        message: `Dangerous tool permission: ${tool}`,
        details: "This tool can execute arbitrary code or modify files",
        location: "allowed-tools field",
      })
    }
  }

  return threats
}

/**
 * Scan Python script content for security issues
 */
export function scanPythonScript(scriptContent: string, scriptPath: string): SecurityThreat[] {
  const threats: SecurityThreat[] = []

  // 1. Check for PEP 723 inline metadata with unpinned dependencies
  const pep723Match = scriptContent.match(/# \/\/\/ script\n([\s\S]*?)\n# \/\/\//)
  if (pep723Match) {
    const metadata = pep723Match[1]
    
    // Extract dependencies
    const depsMatch = metadata.match(/dependencies\s*=\s*\[([\s\S]*?)\]/)
    if (depsMatch) {
      const deps = depsMatch[1]
        .split(",")
        .map(d => d.trim().replace(/['"]/g, ""))
        .filter(Boolean)

      for (const dep of deps) {
        // Check if dependency is pinned (has ==, >=...< or ~=)
        if (!dep.match(/[=~><]/)) {
          threats.push({
            type: "unpinned_dependency",
            severity: "critical",
            message: `Unpinned dependency: ${dep}`,
            details: "Unpinned dependencies allow deferred attacks - attacker can publish malicious version later",
            location: scriptPath,
          })
        } else if (!dep.includes("==")) {
          threats.push({
            type: "unpinned_dependency",
            severity: "high",
            message: `Loosely pinned dependency: ${dep}`,
            details: "Use == for exact version pinning to prevent supply chain attacks",
            location: scriptPath,
          })
        }
      }
    }
  }

  // 2. Check for dangerous imports
  const dangerousImports = [
    { pattern: /^import\s+(os|sys|subprocess|eval|exec|__import__)/, severity: "high" as const },
    { pattern: /^from\s+(os|sys|subprocess)\s+import/, severity: "high" as const },
    { pattern: /\beval\s*\(/, severity: "critical" as const },
    { pattern: /\bexec\s*\(/, severity: "critical" as const },
    { pattern: /\b__import__\s*\(/, severity: "critical" as const },
  ]

  for (const { pattern, severity } of dangerousImports) {
    const matches = scriptContent.match(new RegExp(pattern, "gm"))
    if (matches) {
      for (const match of matches) {
        threats.push({
          type: "dangerous_import",
          severity,
          message: `Dangerous import/function: ${match.trim()}`,
          details: "This can execute arbitrary code",
          location: scriptPath,
        })
      }
    }
  }

  // 3. Check for environment variable access (potential secret harvesting)
  if (scriptContent.match(/os\.environ|os\.getenv|sys\.argv/)) {
    threats.push({
      type: "suspicious_pattern",
      severity: "medium",
      message: "Environment variable access detected",
      details: "Script accesses environment variables - verify it doesn't exfiltrate secrets",
      location: scriptPath,
    })
  }

  return threats
}

/**
 * Detect prompt injection patterns
 */
function detectPromptInjection(content: string): SecurityThreat[] {
  const threats: SecurityThreat[] = []

  const suspiciousPatterns = [
    { pattern: /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi, severity: "critical" as const },
    { pattern: /disregard\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi, severity: "critical" as const },
    { pattern: /forget\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi, severity: "critical" as const },
    { pattern: /override\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/gi, severity: "critical" as const },
    { pattern: /bypass\s+(security|safety|restrictions?|rules?)/gi, severity: "critical" as const },
    { pattern: /you\s+are\s+now\s+(a|an|the)/gi, severity: "high" as const },
    { pattern: /new\s+(instructions?|role|persona|character)/gi, severity: "high" as const },
    { pattern: /system\s*:\s*/gi, severity: "high" as const },
    { pattern: /\[SYSTEM\]/gi, severity: "high" as const },
  ]

  for (const { pattern, severity } of suspiciousPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      threats.push({
        type: "prompt_injection",
        severity,
        message: `Potential prompt injection: "${matches[0]}"`,
        details: "This pattern is commonly used in prompt injection attacks",
      })
    }
  }

  return threats
}

/**
 * Detect hidden characters (zero-width, excessive whitespace)
 */
function detectHiddenCharacters(content: string): SecurityThreat[] {
  const threats: SecurityThreat[] = []

  // Zero-width characters
  const zeroWidthChars = /[\u200B-\u200D\uFEFF]/g
  const zeroWidthMatches = content.match(zeroWidthChars)
  if (zeroWidthMatches) {
    threats.push({
      type: "hidden_characters",
      severity: "high",
      message: `Hidden zero-width characters detected (${zeroWidthMatches.length} instances)`,
      details: "These invisible characters can hide malicious instructions",
    })
  }

  // Excessive whitespace (potential hidden text)
  const excessiveWhitespace = /\s{50,}/g
  const whitespaceMatches = content.match(excessiveWhitespace)
  if (whitespaceMatches) {
    threats.push({
      type: "hidden_characters",
      severity: "medium",
      message: "Excessive whitespace detected",
      details: "Long whitespace sequences can hide instructions off-screen",
    })
  }

  return threats
}

/**
 * Detect base64 encoded content (potential obfuscation)
 */
function detectBase64Content(content: string): SecurityThreat[] {
  const threats: SecurityThreat[] = []

  // Look for long base64-like strings (40+ chars)
  const base64Pattern = /[A-Za-z0-9+/]{40,}={0,2}/g
  const matches = content.match(base64Pattern)

  if (matches && matches.length > 0) {
    threats.push({
      type: "base64_content",
      severity: "medium",
      message: `Possible base64 encoded content detected (${matches.length} instances)`,
      details: "Base64 encoding can obfuscate malicious instructions",
    })
  }

  return threats
}

/**
 * Detect hardcoded secrets and API keys
 */
function detectSecrets(content: string): SecurityThreat[] {
  const threats: SecurityThreat[] = []

  const secretPatterns = [
    { name: "OpenAI API Key", pattern: /sk-[a-zA-Z0-9]{40,60}/, severity: "critical" as const },
    { name: "GitHub Token", pattern: /(ghp|gho|ghu|ghs|ghr)_[a-zA-Z0-9]{36}/, severity: "critical" as const },
    { name: "AWS Access Key", pattern: /(AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/, severity: "critical" as const },
    { name: "Generic Private Key", pattern: /-----BEGIN PRIVATE KEY-----/, severity: "critical" as const },
    { name: "Slack Token", pattern: /xox[baprs]-[a-zA-Z0-9-]+/, severity: "critical" as const },
    { name: "Stripe Secret Key", pattern: /sk_live_[0-9a-zA-Z]{24}/, severity: "critical" as const },
  ]

  for (const { name, pattern, severity } of secretPatterns) {
    if (pattern.test(content)) {
      threats.push({
        type: "suspicious_pattern",
        severity,
        message: `Potential secret detected: ${name}`,
        details: "Hardcoded secrets should not be committed to repositories",
      })
    }
  }

  return threats
}

/**
 * Detect external resource fetching
 */
function detectExternalResources(content: string): SecurityThreat[] {
  const threats: SecurityThreat[] = []

  // URLs
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi
  const urls = content.match(urlPattern)

  if (urls) {
    // Filter out common safe domains
    const safeDomains = [
      "github.com",
      "githubusercontent.com",
      "docs.anthropic.com",
      "python.org",
      "pypi.org",
    ]

    const suspiciousUrls = urls.filter(url => {
      return !safeDomains.some(domain => url.includes(domain))
    })

    if (suspiciousUrls.length > 0) {
      threats.push({
        type: "external_resource",
        severity: "medium",
        message: `External URLs detected (${suspiciousUrls.length})`,
        details: `URLs: ${suspiciousUrls.slice(0, 3).join(", ")}${suspiciousUrls.length > 3 ? "..." : ""}`,
      })
    }
  }

  // Fetch/download/curl/wget commands
  const fetchPatterns = [
    /\b(fetch|download|curl|wget)\s+/gi,
    /requests\.get\s*\(/gi,
    /urllib\.request/gi,
  ]

  for (const pattern of fetchPatterns) {
    if (pattern.test(content)) {
      threats.push({
        type: "external_resource",
        severity: "high",
        message: "Remote resource fetching detected",
        details: "Script attempts to fetch external resources at runtime",
      })
      break
    }
  }

  return threats
}

/**
 * Calculate overall risk score (0-100)
 */
function calculateRiskScore(threats: SecurityThreat[]): number {
  if (threats.length === 0) return 0

  const severityWeights = {
    critical: 60,
    high: 30,
    medium: 10,
    low: 5,
  }

  let score = 0
  for (const threat of threats) {
    score += severityWeights[threat.severity]
  }

  // Cap at 100
  return Math.min(score, 100)
}

/**
 * Format security scan result for logging
 */
export function formatSecurityReport(result: SecurityScanResult): string {
  if (result.safe && result.threats.length === 0) {
    return "✅ No security threats detected"
  }

  const lines: string[] = []
  lines.push(`🔒 Security Scan Result: ${result.safe ? "SAFE" : "UNSAFE"}`)
  lines.push(`   Risk Score: ${result.riskScore}/100`)
  lines.push("")

  if (result.threats.length > 0) {
    lines.push(`   Threats Found: ${result.threats.length}`)
    lines.push("")

    for (const threat of result.threats) {
      const icon = threat.severity === "critical" ? "🔴" : threat.severity === "high" ? "🟠" : threat.severity === "medium" ? "🟡" : "🔵"
      lines.push(`   ${icon} [${threat.severity.toUpperCase()}] ${threat.message}`)
      if (threat.details) {
        lines.push(`      ${threat.details}`)
      }
      if (threat.location) {
        lines.push(`      Location: ${threat.location}`)
      }
      lines.push("")
    }
  }

  return lines.join("\n")
}
