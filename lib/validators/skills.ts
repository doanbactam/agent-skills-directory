import { z } from "zod"

export const skillSubmissionSchema = z.object({
  repoUrl: z.string().url().refine((url) => {
    try {
      const parsed = new URL(url)
      return parsed.hostname === "github.com"
    } catch {
      return false
    }
  }, "Must be a valid GitHub URL"),
  skillPath: z.string().optional(),
  submittedBy: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
})

export type SkillSubmission = z.infer<typeof skillSubmissionSchema>

export const skillUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  status: z.enum(["pending", "approved"]).optional(),
  isVerifiedOrg: z.boolean().optional(),
})

export type SkillUpdate = z.infer<typeof skillUpdateSchema>

export const cacheInvalidationSchema = z.object({
  action: z.literal("invalidate"),
  pattern: z.string().max(200, "Pattern too long").optional(),
})

export type CacheInvalidation = z.infer<typeof cacheInvalidationSchema>

export const skillReportSchema = z.object({
  skillId: z.string().min(1, "Skill ID is required").max(100, "Skill ID too long"),
  reason: z.enum(
    ["spam", "malicious", "copyright", "inappropriate", "broken", "other"],
    { required_error: "Valid reason is required", invalid_type_error: "Invalid reason" }
  ),
  description: z.string().max(1000, "Description too long").optional(),
  reporterEmail: z.string().email("Invalid email address").max(255, "Email too long").optional().or(z.literal("")),
})

export type SkillReportInput = z.infer<typeof skillReportSchema>

// Route parameter validation
export const skillRouteParamsSchema = z.object({
  owner: z
    .string()
    .min(1, "Owner is required")
    .max(100, "Owner name too long")
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/, "Invalid owner format"),
  name: z
    .string()
    .min(1, "Skill name is required")
    .max(200, "Skill name too long")
    .regex(/^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/, "Invalid skill name format"),
})

export type SkillRouteParams = z.infer<typeof skillRouteParamsSchema>

// Safe JSON parse for allowedTools
export function safeParseAllowedTools(value: string | null | undefined): string[] {
  if (!value) return []
  
  try {
    const parsed = JSON.parse(value)
    // Validate it's an array of strings
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string")
    }
    // If it's a single string, wrap it in an array
    if (typeof parsed === "string") {
      return [parsed]
    }
    return []
  } catch {
    // If parsing fails, return empty array
    return []
  }
}
