const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export interface TuitionRecord {
  _id?: string
  id?: string
  title: string
  subject: string
  classLevel: string
  mode: "online" | "offline" | "hybrid"
  location: string
  monthlyFee: number
  daysPerWeek: number
  bannerImage?: string
  description: string
  approvalStatus?: "pending" | "approved" | "rejected"
  status?: "active" | "closed"
  isActive?: boolean
  tutorName?: string
  tutorEmail?: string
}

export const getTutions = async (query = "") => {
  const res = await fetch(`${BASE_URL}/tutions?${query}`, {
    cache: "no-store",
  })
  return res.json()
}
export const updateTution = async (
  id: string,
  payload: Partial<TuitionRecord>
) => {
  const res = await fetch(`${BASE_URL}/tutions/${id}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export const deleteTution = async (id: string) => {
  const res = await fetch(`${BASE_URL}/tutions/${id}`, {
    method: "DELETE",
  })
  return res.json()
}
