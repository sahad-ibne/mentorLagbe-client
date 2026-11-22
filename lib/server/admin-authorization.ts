import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function requireAdmin(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return {
      session: null,
      error: NextResponse.json({ error: "Sign in to continue." }, { status: 401 }),
    }
  }

  if (String(session.user.role || "").toLowerCase() !== "admin") {
    return {
      session: null,
      error: NextResponse.json({ error: "Admin access is required." }, { status: 403 }),
    }
  }

  return { session, error: null }
}
