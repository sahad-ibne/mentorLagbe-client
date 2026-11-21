import { NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"

const mongoUri = process.env.BETTER_AUTH_DB_URI
const TUITION_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

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

async function getTutorTuitionIds(email: string) {
  const response = await fetch(
    `${TUITION_API_BASE}/tutions?tutorEmail=${encodeURIComponent(email)}`,
    { cache: "no-store" }
  )
  if (!response.ok) {
    throw new Error("Could not verify the tutor's tuition posts.")
  }

  const data = await response.json()
  const tuitions = Array.isArray(data)
    ? data
    : Array.isArray(data?.tutions)
      ? data.tutions
      : Array.isArray(data?.tuitions)
        ? data.tuitions
        : null
  if (!tuitions) {
    throw new Error("The tuition service returned an unexpected response.")
  }

  return tuitions
    .filter(
      (tuition: { tutorEmail?: string }) =>
        tuition.tutorEmail?.toLowerCase() === email.toLowerCase()
    )
    .map((tuition: { _id?: string; id?: string }) =>
      String(tuition._id || tuition.id || "")
    )
    .filter(Boolean)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const role = String(session.user.role || "").toLowerCase()
    const tuitionId = request.nextUrl.searchParams.get("tuitionId")
    const db = await getDatabase()

    if (role === "student" && !tuitionId) {
      const studentId = String(session.user.id)
      const applications = await db
        .collection("applications")
        .find({ studentId })
        .sort({ createdAt: -1 })
        .toArray()

      return NextResponse.json({
        applications: applications.map((application) => ({
          ...application,
          _id: application._id.toString(),
        })),
      })
    }

    if (role === "tutor" && !tuitionId) {
      const email = String(session.user.email || "").trim()
      if (!email) {
        return NextResponse.json(
          { error: "Your account has no email address." },
          { status: 400 }
        )
      }

      const tuitionIds = await getTutorTuitionIds(email)
      if (tuitionIds.length === 0) {
        return NextResponse.json({ applications: [] })
      }

      const applications = await db
        .collection("applications")
        .find({ tuitionId: { $in: tuitionIds } })
        .sort({ createdAt: -1 })
        .toArray()
      return NextResponse.json({
        applications: applications.map((application) => ({
          ...application,
          _id: application._id.toString(),
        })),
      })
    }

    if (role !== "student" || !tuitionId) {
      return NextResponse.json(
        { error: "Only students can check application status." },
        { status: 403 }
      )
    }

    const studentId = String(session.user.id)
    const existing = await db.collection("applications").findOne({
      tuitionId,
      studentId,
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
    const monthlyFee = Number(body.monthlyFee)

    if (
      !tuitionId ||
      !phone ||
      !preferredSchedule ||
      !learningNote ||
      !Number.isFinite(monthlyFee) ||
      monthlyFee < 0
    ) {
      return NextResponse.json(
        {
          error:
            "Tuition, fee, phone, preferred schedule, and learning note are required.",
        },
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
      monthlyFee,
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
