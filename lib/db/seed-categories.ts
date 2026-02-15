import { db } from "@/lib/db/client"
import { categories } from "./schema"
import { CATEGORIES, toDatabaseCategory } from "@/lib/categories"

async function seed() {
  console.log("Seeding categories...")

  for (const category of CATEGORIES) {
    const dbCategory = toDatabaseCategory(category)
    await db
      .insert(categories)
      .values(dbCategory)
      .onConflictDoUpdate({
        target: categories.id,
        set: {
          name: dbCategory.name,
          slug: dbCategory.slug,
          description: dbCategory.description,
          color: dbCategory.color,
          order: dbCategory.order,
        },
      })
    console.log(`  ✓ ${category.name}`)
  }

  console.log("Done! Seeded", CATEGORIES.length, "categories")
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
