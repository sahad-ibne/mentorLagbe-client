import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const mongoUri = process.env.BETTER_AUTH_DB_URI

let mongoClient: MongoClient | null = null

async function getDatabase() {
  if (!mongoUri) {
    throw new Error("BETTER_AUTH_DB_URI is not configured.")
  }
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri)
  }
  await mongoClient.connect()
  return mongoClient.db("mentorLagbe")
}

async function getSession(request: NextRequest) {
  const baseUrl =
    process.env.BETTER_AUTH_URL || "http://localhost:3000"
  const cookie = request.headers.get("cookie") || ""

  const response = await fetch(`${baseUrl}/api/auth/get-session`, {
    headers: { cookie },
    cache: "no-store",
  })

  if (!response.ok) return null
  const session = await response.json().catch(() => null)
  return session?.user ? session : null
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const role = String(session.user.role || "").toLowerCase()
    if (role !== "student") {
      return NextResponse.json({ error: "Only students can apply." }, { status: 403 })
    }

    const tuitionId = request.nextUrl.searchParams.get("tuitionId")
    if (!tuitionId) {
      return NextResponse.json({ error: "Tuition ID is required." }, { status: 400 })
    }

    const db = await getDatabase()
    const existing = await db.collection("applications").findOne({
      tuitionId,
      studentId: String(session.user.id),
    })

    return NextResponse.json({ applied: Boolean(existing) })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not check application status.",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const role = String(session.user.role || "").toLowerCase()
    if (role !== "student") {
      return NextResponse.json({ error: "Only students can apply." }, { status: 403 })
    }

    const body = await request.json()
    const tuitionId = String(body.tuitionId || "").trim()
    const phone = String(body.phone || "").trim()
    const preferredSchedule = String(body.preferredSchedule || "").trim()
    const learningNote = String(body.learningNote || "").trim()

    if (!tuitionId || !phone || !preferredSchedule || !learningNote) {
      return NextResponse.json(
        { error: "Tuition, phone, preferred schedule, and learning note are required." },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const applications = db.collection("applications")
    await applications.createIndex(
      { tuitionId: 1, studentId: 1 },
      { unique: true }
    )

    const studentId = String(session.user.id)
    const existing = await applications.findOne({ tuitionId, studentId })
    if (existing) {
      return NextResponse.json(
        { error: "You have already applied for this tuition." },
        { status: 409 }
      )
    }

    await applications.insertOne({
      tuitionId,
      tuitionTitle: String(body.tuitionTitle || "").trim(),
      tutorEmail: String(body.tutorEmail || "").trim(),
      studentId,
      studentName: String(session.user.name || "").trim(),
      studentEmail: String(session.user.email || "").trim(),
      phone,
      preferredSchedule,
      learningNote,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json(
      { success: true, status: "pending" },
      { status: 201 }
    )
  } catch (error) {
    const isDuplicate =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000

    return NextResponse.json(
      {
        error: isDuplicate
          ? "You have already applied for this tuition."
          : error instanceof Error
            ? error.message
            : "Could not submit application.",
      },
      { status: isDuplicate ? 409 : 500 }
    )
  }
}
