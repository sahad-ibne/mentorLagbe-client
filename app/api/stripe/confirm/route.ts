import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

export async function POST(request: NextRequest) {
  try {
    const userSession = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    })
    if (!userSession) {
      return NextResponse.json({ error: "Sign in to confirm your payment." }, { status: 401 })
    }
    const role = String(userSession.user.role || "").toLowerCase()
    if (role !== "tutor" && role !== "student") {
      return NextResponse.json(
        { error: "Only student and tutor accounts can upgrade to Pro." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const sessionId = body?.sessionId
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid checkout session." }, { status: 400 })
    }

    const internalApiSecret = process.env.INTERNAL_API_SECRET
    if (!internalApiSecret) {
      return NextResponse.json(
        { error: "The backend API is not configured on the server." },
        { status: 503 }
      )
    }

    const response = await fetch(`${API_BASE}/payments/checkout-verify`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-internal-api-secret": internalApiSecret,
      },
      body: JSON.stringify({
        sessionId,
        userId: userSession.user.id,
        email: userSession.user.email,
      }),
      cache: "no-store",
    })
    const result = await response.json().catch(() => null)

    if (!response.ok || result?.success !== true) {
      return NextResponse.json(
        {
          error:
            result?.message || result?.error || "Could not verify your payment.",
        },
        { status: response.ok ? 502 : response.status }
      )
    }

    return NextResponse.json({
      success: true,
      plan: result.plan || "pro",
      role: result.role || role,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not confirm your Pro payment.",
      },
      { status: 500 }
    )
  }
}
