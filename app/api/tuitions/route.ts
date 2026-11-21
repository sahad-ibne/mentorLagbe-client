import { NextRequest, NextResponse } from "next/server"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

type Tuition = {
  _id?: string
  id?: string
  title?: string
  subject?: string
  classLevel?: string
  mode?: string
  location?: string
  monthlyFee?: number
  daysPerWeek?: number
  bannerImage?: string
  description?: string
  approvalStatus?: string
  tutorName?: string
  tutorEmail?: string
  tutorPlan?: string
}

async function getSession(request: NextRequest) {
  const authBaseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000"
  const response = await fetch(`${authBaseUrl}/api/auth/get-session`, {
    headers: { cookie: request.headers.get("cookie") || "" },
    cache: "no-store",
  })

  if (!response.ok) return null
  const session = await response.json().catch(() => null)
  return session?.user ? session : null
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

async function getTutorTuitions(email: string) {
  const response = await fetch(
    `${API_BASE}/tutions?tutorEmail=${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )

  if (!response.ok) {
    throw new Error("Could not load your tuition posts.")
  }

  const tuitions = extractTuitions(await response.json())
  return tuitions.filter(
    (tuition) => tuition.tutorEmail?.toLowerCase() === email.toLowerCase()
  )
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Sign in to view your tuitions." }, { status: 401 })
    }
    if (String(session.user.role || "").toLowerCase() !== "tutor") {
      return NextResponse.json({ error: "Only tutors can view tutor posts." }, { status: 403 })
    }

    const email = String(session.user.email || "")
    if (!email) {
      return NextResponse.json({ error: "Your account has no email address." }, { status: 400 })
    }

    return NextResponse.json({ tutions: await getTutorTuitions(email) })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load your tuitions.",
      },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Sign in to post a tuition." }, { status: 401 })
    }
    if (String(session.user.role || "").toLowerCase() !== "tutor") {
      return NextResponse.json({ error: "Only tutors can post tuitions." }, { status: 403 })
    }

    const tutorEmail = String(session.user.email || "").trim().toLowerCase()
    if (!tutorEmail) {
      return NextResponse.json({ error: "Your account has no email address." }, { status: 400 })
    }

    const body = await request.json()
    const monthlyFee = Number(body.monthlyFee)
    const daysPerWeek = Number(body.daysPerWeek)
    const mode = String(body.mode || "")

    if (
      typeof body.title !== "string" ||
      body.title.trim().length < 5 ||
      typeof body.subject !== "string" ||
      !body.subject.trim() ||
      typeof body.classLevel !== "string" ||
      !body.classLevel.trim() ||
      typeof body.location !== "string" ||
      !body.location.trim() ||
      !Number.isFinite(monthlyFee) ||
      monthlyFee <= 0 ||
      !Number.isInteger(daysPerWeek) ||
      daysPerWeek < 1 ||
      daysPerWeek > 7 ||
      !["online", "offline", "hybrid"].includes(mode) ||
      typeof body.description !== "string" ||
      body.description.trim().length < 15
    ) {
      return NextResponse.json(
        { error: "Please provide valid tuition details." },
        { status: 400 }
      )
    }

    const plan = String(session.user.plan || "free").toLowerCase()
    const existing = await getTutorTuitions(tutorEmail)
    if (plan !== "pro" && existing.length >= 2) {
      return NextResponse.json(
        {
          error:
            "Free Plan allows up to 2 tuition posts. Upgrade to Pro for unlimited posts.",
        },
        { status: 409 }
      )
    }

    const tuition: Tuition = {
      title: body.title.trim(),
      subject: body.subject.trim(),
      classLevel: body.classLevel.trim(),
      mode,
      location: body.location.trim(),
      monthlyFee,
      daysPerWeek,
      bannerImage:
        typeof body.bannerImage === "string" ? body.bannerImage.trim() : "",
      description: body.description.trim(),
      approvalStatus: "pending",
      tutorName: String(session.user.name || ""),
      tutorEmail,
      tutorPlan: plan === "pro" ? "pro" : "free",
    }

    const response = await fetch(`${API_BASE}/tutions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(tuition),
    })
    const result = await response.json().catch(() => null)

    if (!response.ok) {
      return NextResponse.json(
        { error: result?.message || result?.error || "Could not post tuition." },
        { status: response.status }
      )
    }
    if (result?.success === false || result?.error) {
      return NextResponse.json(
        { error: result.error || result.message || "Could not post tuition." },
        { status: 502 }
      )
    }

    return NextResponse.json(result ?? { success: true }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not post tuition.",
      },
      { status: 502 }
    )
  }
}
