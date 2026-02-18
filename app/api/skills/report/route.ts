import { NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { z } from "zod"

import { db, skillReports } from "@/lib/db"
import { reportRateLimit, getClientIdentifier } from "@/lib/rate-limit"
import { skillReportSchema } from "@/lib/validators/skills"

export async function POST(request: Request) {
  try {
    // Rate limit: 5 reports per hour per IP
    const identifier = getClientIdentifier(request)
    const { success, remaining } = await reportRateLimit.limit(identifier)
    
    if (!success) {
      return NextResponse.json(
        { error: "Too many reports. Please try again later." },
        { 
          status: 429,
          headers: { "X-RateLimit-Remaining": remaining.toString() }
        }
      )
    }

    const body = await request.json()

    const validation = skillReportSchema.safeParse(body)

    if (!validation.success) {
        const flattened = validation.error.flatten();
        const fieldErrors = Object.entries(flattened.fieldErrors)
          .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(", ")}`)
          .join("; ");
        const errorMessage = fieldErrors || "Validation failed";

        return NextResponse.json(
            { error: `Validation failed: ${errorMessage}` },
            { status: 400 }
        )
    }

    const { skillId, reason, description, reporterEmail } = validation.data

    await db.insert(skillReports).values({
      id: nanoid(),
      skillId,
      reason,
      description: description || null,
      reporterEmail: reporterEmail || null,
      status: "pending",
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to submit report:", error)
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    )
  }
}
