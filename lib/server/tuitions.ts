import "server-only"
import { MongoClient, ObjectId, type Document } from "mongodb"
import type { TuitionRecord } from "@/lib/api/tutions"

const mongoUri = process.env.BETTER_AUTH_DB_URI

let mongoClient: MongoClient | null = null

async function getTuitionDatabase() {
  if (!mongoUri) {
    throw new Error("BETTER_AUTH_DB_URI is not configured.")
  }
  if (!mongoClient) {
    mongoClient = new MongoClient(mongoUri)
  }
  await mongoClient.connect()
  return mongoClient.db("mentorLagbe")
}

export interface PaginatedTuitions {
  tutions: TuitionRecord[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const escapeMongoRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const getPaginatedTuitions = async ({
  page = 1,
  pageSize = 9,
  q = "",
  subject = "",
  classLevel = "",
  mode = "",
}: {
  page?: number
  pageSize?: number
  q?: string
  subject?: string
  classLevel?: string
  mode?: string
}): Promise<PaginatedTuitions> => {
  const db = await getTuitionDatabase()
  const tutions = db.collection("tution")
  const safePage = Number.isInteger(page) && page > 0 ? page : 1
  const safePageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? Math.min(pageSize, 50)
      : 9

  const filter: Document = {
    approvalStatus: "approved",
    isActive: true,
  }

  if (subject) {
    filter.subject = { $regex: escapeMongoRegex(subject), $options: "i" }
  }
  if (classLevel) {
    filter.classLevel = {
      $regex: escapeMongoRegex(classLevel),
      $options: "i",
    }
  }
  if (mode) {
    filter.mode = mode
  }
  if (q) {
    const search = escapeMongoRegex(q)
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { tutorName: { $regex: search, $options: "i" } },
    ]
  }

  const total = await tutions.countDocuments(filter)
  const totalPages = Math.max(1, Math.ceil(total / safePageSize))
  const currentPage = Math.min(safePage, totalPages)

  const records = await tutions
    .find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip((currentPage - 1) * safePageSize)
    .limit(safePageSize)
    .toArray()

  return {
    tutions: records.map((record) => {
      const { _id, ...rest } = record
      return {
        ...rest,
        _id: _id instanceof ObjectId ? _id.toString() : String(_id || ""),
      } as TuitionRecord
    }),
    page: currentPage,
    pageSize: safePageSize,
    total,
    totalPages,
  }
}
