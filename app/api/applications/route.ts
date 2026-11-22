import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { auth } from "@/lib/auth"

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
  return auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  })
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

      const tutorTuitions = await db
        .collection("tution")
        .find({ tutorEmail: email }, { projection: { _id: 1 } })
        .toArray()
      const tuitionIds = tutorTuitions.map((tuition) =>
        tuition._id.toString()
      )
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

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid application details." }, { status: 400 })
    }

    const tuitionId = String(body.tuitionId || "").trim()
    const phone = String(body.phone || "").trim()
    const preferredSchedule = String(body.preferredSchedule || "").trim()
    const learningNote = String(body.learningNote || "").trim()

    if (
      !ObjectId.isValid(tuitionId) ||
      !phone ||
      phone.length > 40 ||
      !preferredSchedule ||
      preferredSchedule.length > 200 ||
      !learningNote ||
      learningNote.length > 2000
    ) {
      return NextResponse.json(
        {
          error:
            "Provide a valid tuition, phone number, preferred schedule, and learning note.",
        },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const tuition = await db.collection("tution").findOne({
      _id: new ObjectId(tuitionId),
      approvalStatus: "approved",
      isActive: true,
    })
    if (!tuition) {
      return NextResponse.json(
        { error: "This tuition is not available for applications." },
        { status: 404 }
      )
    }

    const studentEmail = String(session.user.email || "").trim().toLowerCase()
    const tutorEmail = String(tuition.tutorEmail || "").trim().toLowerCase()
    if (!studentEmail || !tutorEmail) {
      return NextResponse.json(
        { error: "Student or tutor account email is missing." },
        { status: 400 }
      )
    }
    if (studentEmail === tutorEmail) {
      return NextResponse.json(
        { error: "You cannot apply to your own tuition." },
        { status: 403 }
      )
    }

    const monthlyFee = Number(tuition.monthlyFee)
    if (!Number.isFinite(monthlyFee) || monthlyFee < 0) {
      return NextResponse.json(
        { error: "The tuition has an invalid monthly fee." },
        { status: 409 }
      )
    }

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
      tuitionTitle: String(tuition.title || ""),
      tutorName: String(tuition.tutorName || ""),
      tutorEmail,
      monthlyFee,
      studentId,
      studentName: String(session.user.name || "").trim(),
      studentEmail,
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
