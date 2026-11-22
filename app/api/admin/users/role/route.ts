import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/server/admin-authorization"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

type UserRole = "student" | "tutor" | "admin"

function isUserRole(role: unknown): role is UserRole {
  return role === "student" || role === "tutor" || role === "admin"
}

function isAuthRole(role: unknown): role is UserRole | "user" {
  return isUserRole(role) || role === "user"
}

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireAdmin(request)
    if (access.error) return access.error

    const body = await request.json()
    const userId = typeof body.userId === "string" ? body.userId.trim() : ""
    const role = body.role

    if (!userId || !isUserRole(role)) {
      return NextResponse.json(
        { error: "Provide a user ID and a valid role." },
        { status: 400 }
      )
    }

    if (userId === access.session.user.id && role !== "admin") {
      return NextResponse.json(
        { error: "You cannot remove your own admin role." },
        { status: 400 }
      )
    }

    const internalApiSecret = process.env.INTERNAL_API_SECRET
    if (!internalApiSecret) {
      return NextResponse.json(
        { error: "The backend API is not configured on the server." },
        { status: 503 }
      )
    }

    const targetUser = await auth.api.getUser({
      query: { id: userId },
      headers: request.headers,
    })
    const previousRole = isAuthRole(targetUser.role)
      ? targetUser.role
      : "student"

    await auth.api.setRole({
      body: { userId, role },
      headers: request.headers,
    })

    try {
      const response = await fetch(
        `${API_BASE}/users/${encodeURIComponent(userId)}/role`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
            "x-internal-api-secret": internalApiSecret,
          },
          body: JSON.stringify({ role }),
          cache: "no-store",
        }
      )
      const result = await response.json().catch(() => null)

      if (
        !response.ok ||
        result?.success === false ||
        result?.error ||
        result?.matchedCount === 0
      ) {
        throw new Error(
          result?.message || result?.error || "Could not update backend user role."
        )
      }

      return NextResponse.json({ success: true, role })
    } catch (error) {
      try {
        await auth.api.setRole({
          body: { userId, role: previousRole },
          headers: request.headers,
        })
      } catch (rollbackError) {
        const rollbackMessage =
          rollbackError instanceof Error
            ? rollbackError.message
            : "Unknown rollback error."
        return NextResponse.json(
          {
            error: `Backend role update failed, and the BetterAuth role could not be restored: ${rollbackMessage}`,
          },
          { status: 502 }
        )
      }

      throw error
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update user role.",
      },
      { status: 502 }
    )
  }
}
