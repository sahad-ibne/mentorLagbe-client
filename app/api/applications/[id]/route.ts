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

async function getTutorTuitionIds(email: string) {
  const db = await getDatabase()
  const tuitions = await db
    .collection("tution")
    .find({ tutorEmail: email.toLowerCase() }, { projection: { _id: 1 } })
    .toArray()
  return tuitions.map((tuition) => tuition._id.toString())
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }
    if (String(session.user.role || "").toLowerCase() !== "tutor") {
      return NextResponse.json(
        { error: "Only tutors can update application status." },
        { status: 403 }
      )
    }

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      )
    }

    const { status } = await request.json()
    if (status !== "accepted" && status !== "rejected") {
      return NextResponse.json(
        { error: "Status must be accepted or rejected." },
        { status: 400 }
      )
    }

    const email = String(session.user.email || "").trim()
    if (!email) {
      return NextResponse.json(
        { error: "Your account has no email address." },
        { status: 400 }
      )
    }

    const tuitionIds = await getTutorTuitionIds(email)
    const db = await getDatabase()
    const result = await db.collection("applications").updateOne(
      {
        _id: new ObjectId(id),
        tuitionId: { $in: tuitionIds },
        status: "pending",
      },
      {
        $set: { status, updatedAt: new Date() },
      }
    )

    if (result.matchedCount !== 1) {
      return NextResponse.json(
        { error: "Pending application not found for your tuition posts." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, status })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not update application status.",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }
    if (String(session.user.role || "").toLowerCase() !== "student") {
      return NextResponse.json(
        { error: "Only students can cancel applications." },
        { status: 403 }
      )
    }

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID." },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const applications = db.collection("applications")
    const filter = {
      _id: new ObjectId(id),
      studentId: String(session.user.id),
    }
    const application = await applications.findOne(filter)
    if (!application) {
      return NextResponse.json(
        { error: "Application not found." },
        { status: 404 }
      )
    }
    if (String(application.status || "pending").toLowerCase() !== "pending") {
      return NextResponse.json(
        { error: "Only pending applications can be canceled." },
        { status: 409 }
      )
    }

    const result = await applications.deleteOne({
      ...filter,
      status: application.status || "pending",
    })
    if (result.deletedCount !== 1) {
      return NextResponse.json(
        { error: "Application changed before it could be canceled." },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not cancel application.",
      },
      { status: 500 }
    )
  }
}
