import { NextResponse } from "next/server"
import { z } from "zod"
import { requireAdmin } from "@/lib/auth"
import { getSkillById, linkSkillToCategories, getSkillCategories } from "@/lib/db/queries"
import { getCategoryBySlug, type CategoryDefinition } from "@/lib/categories"

type RouteParams = { params: Promise<{ id: string }> }

const patchCategoriesSchema = z.object({
  categories: z.array(z.string()).max(20, "Maximum 20 categories allowed"),
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

    const [skill, categories] = await Promise.all([
      getSkillById(decodedId),
      getSkillCategories(decodedId),
    ])

    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    return NextResponse.json({
      skill: { id: skill.id, name: skill.name, owner: skill.owner },
      categories: categories.map((category) => category.slug),
    })
  } catch (error) {
    console.error("Failed to get skill categories:", error)
    return NextResponse.json(
      {
        error: "Failed to get skill categories",
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

    // Check if skill exists
    const skill = await getSkillById(decodedId)
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}))
    const validation = patchCategoriesSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: validation.error.flatten(),
        },
        { status: 400 }
      )
    }

    const { categories: slugs } = validation.data

    // Validate all category slugs exist
    const validCategories: CategoryDefinition[] = []
    const invalidSlugs: string[] = []

    for (const slug of slugs) {
      if (typeof slug !== "string" || slug.trim().length === 0) {
        invalidSlugs.push(slug)
        continue
      }
      const cat = getCategoryBySlug(slug.trim())
      if (cat) {
        validCategories.push(cat)
      } else {
        invalidSlugs.push(slug)
      }
    }

    if (invalidSlugs.length > 0) {
      return NextResponse.json(
        {
          error: "One or more categories are invalid",
          invalidSlugs,
        },
        { status: 400 }
      )
    }

    // Update categories
    const categoryIds = validCategories.map((c) => c.id)
    await linkSkillToCategories(skill.id, categoryIds)

    return NextResponse.json({
      success: true,
      categories: slugs,
      message: "Categories updated successfully",
    })
  } catch (error) {
    console.error("Failed to update skill categories:", error)
    return NextResponse.json(
      {
        error: "Failed to update skill categories",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
