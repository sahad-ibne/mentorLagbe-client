import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/admin-authorization"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

function extractTuitions(data: unknown) {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.tutions)) return record.tutions
    if (Array.isArray(record.tuitions)) return record.tuitions
  }
  throw new Error("The tuition service returned an unexpected response.")
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireAdmin(request)
    if (access.error) return access.error

    const response = await fetch(`${API_BASE}/tutions`, { cache: "no-store" })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || "Could not load tuitions." },
        { status: response.status }
      )
    }

    return NextResponse.json({ tuitions: extractTuitions(data) })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load tuitions.",
      },
      { status: 502 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const access = await requireAdmin(request)
    if (access.error) return access.error

    const body = await request.json()
    const id = typeof body.id === "string" ? body.id.trim() : ""
    const approvalStatus = body.approvalStatus

    if (!id || !["approved", "rejected"].includes(approvalStatus)) {
      return NextResponse.json(
        { error: "Provide a tuition ID and an approved or rejected status." },
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

    const response = await fetch(
      `${API_BASE}/tutions/${encodeURIComponent(id)}/approval`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          "x-internal-api-secret": internalApiSecret,
        },
        body: JSON.stringify({
          approvalStatus,
          isActive: approvalStatus === "approved",
        }),
        cache: "no-store",
      }
    )
    const result = await response.json().catch(() => null)

    if (!response.ok || result?.success === false || result?.error) {
      return NextResponse.json(
        { error: result?.message || result?.error || "Could not update tuition." },
        { status: response.ok ? 502 : response.status }
      )
    }

    return NextResponse.json(result ?? { success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not update tuition.",
      },
      { status: 502 }
    )
  }
}
