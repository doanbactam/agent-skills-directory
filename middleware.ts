import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"])
const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth()

    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", req.url))
    }

    const role = (sessionClaims?.metadata as { role?: string })?.role
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
