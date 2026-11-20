const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export interface TuitionInput {
  title: string
  subject: string
  classLevel: string
  mode: "online" | "offline" | "hybrid"
  location: string
  monthlyFee: number
  daysPerWeek: number
  bannerImage: string
  description: string
  approvalStatus?: "pending" | "approved" | "rejected"
  tutorName?: string
  tutorEmail?: string
  tutorPlan?: "free" | "pro"
}

export const createTution = async (data: TuitionInput) => {
  const res = await fetch(`${BASE_URL}/tutions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })
  return res.json()
}
