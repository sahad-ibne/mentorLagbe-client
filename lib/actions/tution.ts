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
  const res = await fetch("/api/tuitions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(data),
  })
  const result = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(result?.error || result?.message || "Failed to post tuition.")
  }
  return result
}
