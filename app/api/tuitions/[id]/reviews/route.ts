import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { auth } from "@/lib/auth"

const mongoUri = process.env.BETTER_AUTH_DB_URI
let mongoClient: MongoClient | null = null

export const dynamic = "force-dynamic"

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

type ReviewRecord = {
  _id: ObjectId
  rating: number
  feedback: string
  createdAt: Date
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tuition ID." }, { status: 400 })
    }

    const db = await getDatabase()
    const tuitionId = new ObjectId(id)
    const tuition = await db.collection("tution").findOne({ _id: tuitionId })
    if (!tuition) {
      return NextResponse.json({ error: "Tuition not found." }, { status: 404 })
    }

    const session = await getSession(request)
    const studentId =
      session && String(session.user.role || "").toLowerCase() === "student"
        ? String(session.user.id)
        : ""
    const canReview = studentId
      ? Boolean(
          await db.collection("applications").findOne({
            tuitionId: id,
            studentId,
            status: "accepted",
          })
        )
      : false

    const reviewsCollection = db.collection<ReviewRecord>("tuitionReviews")
    const [reviews, summary, currentReview] = await Promise.all([
      reviewsCollection
        .find(
          { tuitionId: id },
          {
            projection: {
              rating: 1,
              feedback: 1,
              createdAt: 1,
            },
          }
        )
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray(),
      reviewsCollection
        .aggregate<{ averageRating: number; totalReviews: number }>([
          { $match: { tuitionId: id } },
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" },
              totalReviews: { $sum: 1 },
            },
          },
        ])
        .next(),
      canReview
        ? reviewsCollection.findOne({ tuitionId: id, studentId })
        : null,
    ])

    return NextResponse.json({
      reviews: reviews.map((review) => ({
        id: review._id.toString(),
        rating: review.rating,
        feedback: review.feedback,
        studentName: "Verified student",
        createdAt: review.createdAt,
      })),
      averageRating: summary?.averageRating || 0,
      totalReviews: summary?.totalReviews || 0,
      canReview,
      currentReview: currentReview
        ? {
            rating: currentReview.rating,
            feedback: currentReview.feedback,
          }
        : null,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not load reviews.",
      },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession(request)
    if (!session) {
      return NextResponse.json({ error: "Sign in to submit a review." }, { status: 401 })
    }
    if (String(session.user.role || "").toLowerCase() !== "student") {
      return NextResponse.json(
        { error: "Only students can submit reviews." },
        { status: 403 }
      )
    }

    const { id } = await params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid tuition ID." }, { status: 400 })
    }

    const body = await request.json().catch(() => null)
    const rating = body?.rating
    const feedback =
      typeof body?.feedback === "string" ? body.feedback.trim() : ""
    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5 ||
      !feedback ||
      feedback.length > 2000
    ) {
      return NextResponse.json(
        { error: "Provide a 1–5 star rating and feedback of up to 2,000 characters." },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const tuitionId = new ObjectId(id)
    const tuition = await db.collection("tution").findOne({ _id: tuitionId })
    if (!tuition) {
      return NextResponse.json({ error: "Tuition not found." }, { status: 404 })
    }

    const studentId = String(session.user.id)
    const application = await db.collection("applications").findOne({
      tuitionId: id,
      studentId,
      status: "accepted",
    })
    if (!application) {
      return NextResponse.json(
        { error: "An accepted application is required to review this tuition." },
        { status: 403 }
      )
    }

    const reviews = db.collection("tuitionReviews")
    await reviews.createIndex({ tuitionId: 1, studentId: 1 }, { unique: true })
    const now = new Date()
    await reviews.updateOne(
      { tuitionId: id, studentId },
      {
        $set: {
          rating,
          feedback,
          updatedAt: now,
        },
        $setOnInsert: {
          tuitionId: id,
          studentId,
          createdAt: now,
        },
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not submit review.",
      },
      { status: 500 }
    )
  }
}
