import { NextResponse } from "next/server"
import { z } from "zod"
import { approveSkill, getSkillById } from "@/lib/db/queries"
import { requireAdmin } from "@/lib/auth"

type RouteParams = { params: Promise<{ id: string }> }

const patchActionSchema = z.object({
  action: z.enum(["approve"]),
})

async function ensureAdmin() {
  try {
    await requireAdmin()
  } catch {
    throw new Error("Unauthorized")
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await ensureAdmin()
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 })
    }

    const decodedId = decodeURIComponent(id)
    if (!decodedId || decodedId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 })
    }

    const skill = await getSkillById(decodedId)

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    return NextResponse.json({ skill })
  } catch (error) {
    console.error("Failed to get skill:", error)
    return NextResponse.json(
      {
        error: "Failed to get skill",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    await ensureAdmin()
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unauthorized" },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 })
    }

    const decodedId = decodeURIComponent(id)
    if (!decodedId || decodedId.trim().length === 0) {
      return NextResponse.json({ error: "Invalid skill ID" }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const validation = patchActionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { action } = validation.data

    // Check if skill exists before performing action
    const existingSkill = await getSkillById(decodedId)
    if (!existingSkill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Perform action
    switch (action) {
      case "approve":
        if (existingSkill.status === "approved") {
          return NextResponse.json(
            { error: "Skill is already approved" },
            { status: 400 }
          )
        }
        await approveSkill(decodedId)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Fetch updated skill
    const updatedSkill = await getSkillById(decodedId)
    if (!updatedSkill) {
      return NextResponse.json({ error: "Failed to fetch updated skill" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      skill: updatedSkill,
      message: `Skill ${action}d successfully`,
    })
  } catch (error) {
    console.error("Failed to update skill:", error)
    return NextResponse.json(
      {
        error: "Failed to update skill",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
