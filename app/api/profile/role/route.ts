import { NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import { auth } from "@/lib/auth"

const mongoUri = process.env.BETTER_AUTH_DB_URI
let mongoClient: MongoClient | null = null

async function getUsersCollection() {
  if (!mongoUri) {
    throw new Error("BETTER_AUTH_DB_URI is not configured.")
  }
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri)
  }
  await mongoClient.connect()
  return mongoClient.db("mentorLagbe").collection("user")
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
      query: { disableCookieCache: true },
    })

    if (!session) {
      return NextResponse.json({ error: "Sign in to choose your role." }, { status: 401 })
    }

    if (session.user.role === "admin") {
      return NextResponse.json(
        { error: "Admin roles cannot be changed here." },
        { status: 403 }
      )
    }

    const body = await request.json()
    const role = body?.role
    if (role !== "student" && role !== "tutor") {
      return NextResponse.json(
        { error: "Role must be student or tutor." },
        { status: 400 }
      )
    }

    if (!ObjectId.isValid(session.user.id)) {
      return NextResponse.json(
        { error: "Your account has an invalid user ID." },
        { status: 400 }
      )
    }

    const users = await getUsersCollection()
    const result = await users.updateOne(
      { _id: new ObjectId(session.user.id) },
      { $set: { role, updatedAt: new Date() } }
    )

    if (result.matchedCount !== 1) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, role })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not set your account role.",
      },
      { status: 500 }
    )
  }
}
