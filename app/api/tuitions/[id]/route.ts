import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

type Tuition = {
  _id?: string
  id?: string
  tutorEmail?: string
}

async function getSession(request: NextRequest) {
  return auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  })
}

function extractTuitions(data: unknown): Tuition[] {
  if (Array.isArray(data)) return data as Tuition[]
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>
    if (Array.isArray(record.tutions)) return record.tutions as Tuition[]
    if (Array.isArray(record.tuitions)) return record.tuitions as Tuition[]
  }
  throw new Error("The tuition service returned an unexpected response.")
}

async function getOwnedTuition(token: string, id: string): Promise<Tuition | null> {
  const response = await fetch(
    `${API_BASE}/tutions/mine`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    }
  )
  if (!response.ok) {
    throw new Error("Could not verify tuition ownership.")
  }

  const tuitions = extractTuitions(await response.json())
  return (
    tuitions.find(
      (tuition) =>
        tuition._id === id || tuition.id === id
    ) || null
  )
}

async function authorizeOwner(request: NextRequest, id: string) {
  const session = await getSession(request)
  if (!session) {
    return {
      error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }),
    }
  }
  if (String(session.user.role || "").toLowerCase() !== "tutor") {
    return {
      error: NextResponse.json(
        { error: "Only tutors can manage tuition posts." },
        { status: 403 }
      ),
    }
  }

  const email = String(session.user.email || "").trim()
  if (!email) {
    return {
      error: NextResponse.json(
        { error: "Your account has no email address." },
        { status: 400 }
      ),
    }
  }

  const tuition = await getOwnedTuition(session.session.token, id)
  if (!tuition) {
    return {
      error: NextResponse.json(
        { error: "Tuition not found for this tutor." },
        { status: 404 }
      ),
    }
  }

  return { email, token: session.session.token }
}

async function forwardMutation(
  method: "PATCH" | "DELETE",
  id: string,
  token: string,
  body?: Record<string, unknown>
) {
  const headers = new Headers({ authorization: `Bearer ${token}` })
  if (body) headers.set("content-type", "application/json")
  const response = await fetch(`${API_BASE}/tutions/${encodeURIComponent(id)}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    return NextResponse.json(
      { error: result?.message || result?.error || "Tuition update failed." },
      { status: response.status }
    )
  }
  if (result?.success === false || result?.error) {
    return NextResponse.json(
      { error: result.error || result.message || "Tuition update failed." },
      { status: 502 }
    )
  }

  return NextResponse.json(result ?? { success: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authorized = await authorizeOwner(request, id)
    if ("error" in authorized) return authorized.error

    const body = await request.json()
    const allowedFields = [
      "title",
      "subject",
      "classLevel",
      "mode",
      "location",
      "monthlyFee",
      "daysPerWeek",
      "description",
      "status",
      "isActive",
    ]
    const update = Object.fromEntries(
      Object.entries(body).filter(([key]) => allowedFields.includes(key))
    )
    if (Object.keys(update).length === 0) {
      return NextResponse.json(
        { error: "No editable tuition fields were provided." },
        { status: 400 }
      )
    }

    return await forwardMutation("PATCH", id, authorized.token, update)
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const authorized = await authorizeOwner(request, id)
    if ("error" in authorized) return authorized.error
    return await forwardMutation("DELETE", id, authorized.token)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not delete tuition.",
      },
      { status: 502 }
    )
  }
}
