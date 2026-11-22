import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/server/admin-authorization"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

function extractPayments(data: unknown) {
  if (Array.isArray(data)) return data
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.payments)) return record.payments
    if (Array.isArray(record.transactions)) return record.transactions
  }
  throw new Error("The payment service returned an unexpected response.")
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireAdmin(request)
    if (access.error) return access.error

    const internalApiSecret = process.env.INTERNAL_API_SECRET
    if (!internalApiSecret) {
      return NextResponse.json(
        { error: "The backend API is not configured on the server." },
        { status: 503 }
      )
    }

    const response = await fetch(`${API_BASE}/payments`, {
      headers: { "x-internal-api-secret": internalApiSecret },
      cache: "no-store",
    })
    const data = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || data?.error || "Could not load payments." },
        { status: response.status }
      )
    }

    return NextResponse.json({ payments: extractPayments(data) })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load payments.",
      },
      { status: 502 }
    )
  }
}
