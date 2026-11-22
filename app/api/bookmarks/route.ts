import { auth } from "@/lib/auth"
import { MongoClient, ObjectId, type Document } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

const mongoUri = process.env.BETTER_AUTH_DB_URI
let mongoClient: MongoClient | null = null
type UserDocument = Document & {
  role?: string
  plan?: string
  bookmarkedTuitions?: string[]
}

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

async function getStudent(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  })

  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized." }, { status: 401 }) }
  }
  if (String(session.user.role || "").toLowerCase() !== "student") {
    return {
      error: NextResponse.json(
        { error: "Only students can manage tuition bookmarks." },
        { status: 403 }
      ),
    }
  }
  if (!ObjectId.isValid(session.user.id)) {
    return {
      error: NextResponse.json(
        { error: "Your account has an invalid user ID." },
        { status: 400 }
      ),
    }
  }

  return { userId: new ObjectId(session.user.id) }
}

function getBookmarkIds(user: { bookmarkedTuitions?: unknown } | null) {
  return Array.isArray(user?.bookmarkedTuitions)
    ? user.bookmarkedTuitions.filter(
        (id): id is string => typeof id === "string"
      )
    : []
}

export async function GET(request: NextRequest) {
  try {
    const student = await getStudent(request)
    if ("error" in student) return student.error

    const db = await getDatabase()
    const user = await db.collection<UserDocument>("user").findOne(
      { _id: student.userId, role: "student" },
      { projection: { plan: 1, bookmarkedTuitions: 1 } }
    )
    if (!user) {
      return NextResponse.json({ error: "Student account not found." }, { status: 404 })
    }

    const ids = getBookmarkIds(user)
    const requestedId = request.nextUrl.searchParams.get("tuitionId")
    const baseResponse = {
      count: ids.length,
      limit: String(user.plan || "free").toLowerCase() === "pro" ? null : 5,
      plan: String(user.plan || "free").toLowerCase() === "pro" ? "pro" : "free",
    }

    if (requestedId) {
      return NextResponse.json({
        ...baseResponse,
        bookmarked: ids.includes(requestedId),
      })
    }

    const tuitionIds = ids.filter(ObjectId.isValid).map((id) => new ObjectId(id))
    const tuitions = tuitionIds.length
      ? await db
          .collection("tution")
          .find(
            {
              _id: { $in: tuitionIds },
              approvalStatus: "approved",
              isActive: true,
            },
            {
              projection: {
                title: 1,
                subject: 1,
                classLevel: 1,
                mode: 1,
                location: 1,
                monthlyFee: 1,
                daysPerWeek: 1,
                bannerImage: 1,
                description: 1,
                tutorName: 1,
                tutorEmail: 1,
                approvalStatus: 1,
                isActive: 1,
              },
            }
          )
          .toArray()
      : []
    const availableIds = new Set(tuitions.map((tuition) => tuition._id.toString()))

    return NextResponse.json({
      ...baseResponse,
      unavailableIds: ids.filter((id) => !availableIds.has(id)),
      tuitions: tuitions.map((tuition) => ({
        ...tuition,
        _id: tuition._id.toString(),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load bookmarks.",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const student = await getStudent(request)
    if ("error" in student) return student.error

    const body = await request.json().catch(() => null)
    const tuitionId =
      body && typeof body === "object" && !Array.isArray(body)
        ? String(body.tuitionId || "").trim()
        : ""
    if (!ObjectId.isValid(tuitionId)) {
      return NextResponse.json({ error: "Invalid tuition ID." }, { status: 400 })
    }

    const db = await getDatabase()
    const tuition = await db.collection("tution").findOne({
      _id: new ObjectId(tuitionId),
      approvalStatus: "approved",
      isActive: true,
    })
    if (!tuition) {
      return NextResponse.json(
        { error: "Only approved, active tuitions can be bookmarked." },
        { status: 404 }
      )
    }

    const users = db.collection<UserDocument>("user")
    const userFilter = { _id: student.userId, role: "student" }
    const existing = await users.findOne(
      { ...userFilter, bookmarkedTuitions: tuitionId },
      { projection: { bookmarkedTuitions: 1 } }
    )
    if (existing) {
      return NextResponse.json({ success: true, bookmarked: true })
    }

    const result = await users.updateOne(
      {
        ...userFilter,
        $expr: {
          $or: [
            {
              $eq: [
                { $toLower: { $ifNull: ["$plan", "free"] } },
                "pro",
              ],
            },
            {
              $lt: [
                {
                  $size: {
                    $cond: [
                      { $isArray: "$bookmarkedTuitions" },
                      "$bookmarkedTuitions",
                      [],
                    ],
                  },
                },
                5,
              ],
            },
          ],
        },
      },
      {
        $addToSet: { bookmarkedTuitions: tuitionId },
        $set: { updatedAt: new Date() },
      }
    )

    if (result.matchedCount !== 1) {
      const currentUser = await users.findOne(userFilter, {
        projection: { bookmarkedTuitions: 1 },
      })
      if (!currentUser) {
        return NextResponse.json(
          { error: "Student account not found." },
          { status: 404 }
        )
      }
      const currentIds = getBookmarkIds(currentUser)
      if (currentIds.includes(tuitionId)) {
        return NextResponse.json({ success: true, bookmarked: true })
      }
      return NextResponse.json(
        { error: "Free students can save up to 5 tuitions. Upgrade to Pro for unlimited bookmarks." },
        { status: 409 }
      )
    }

    return NextResponse.json({ success: true, bookmarked: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not bookmark tuition.",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const student = await getStudent(request)
    if ("error" in student) return student.error

    const body = await request.json().catch(() => null)
    const tuitionId =
      body && typeof body === "object" && !Array.isArray(body)
        ? String(body.tuitionId || "").trim()
        : ""
    if (!ObjectId.isValid(tuitionId)) {
      return NextResponse.json({ error: "Invalid tuition ID." }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection<UserDocument>("user").updateOne(
      { _id: student.userId, role: "student" },
      [
        {
          $set: {
            bookmarkedTuitions: {
              $filter: {
                input: {
                  $cond: [
                    { $isArray: "$bookmarkedTuitions" },
                    "$bookmarkedTuitions",
                    [],
                  ],
                },
                as: "tuitionId",
                cond: { $ne: ["$$tuitionId", tuitionId] },
              },
            },
            updatedAt: new Date(),
          },
        },
      ]
    )
    if (result.matchedCount !== 1) {
      return NextResponse.json({ error: "Student account not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, bookmarked: false })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not remove bookmark.",
      },
      { status: 500 }
    )
  }
}
