import { NextResponse } from "next/server"
import { getOwnerInfo } from "@/lib/db/queries"

export async function GET(
  { params }: { params: Promise<{ owner: string }> }
) {
  const { owner } = await params
  const ownerInfo = await getOwnerInfo(owner)

  if (!ownerInfo) {
    return NextResponse.json(
      { error: "Owner not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(ownerInfo)
}
