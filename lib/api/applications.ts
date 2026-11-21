const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"

export interface StudentApplication {
  _id?: string
  id?: string
  tuitionId?: string
  tutionId?: string
  title?: string
  tuitionTitle?: string
  tutionTitle?: string
  tutorName?: string
  tutorEmail?: string
  monthlyFee?: number | null
  status: "pending" | "accepted" | "rejected" | string
  createdAt?: string
  appliedAt?: string
  studentEmail?: string
}

export const getStudentApplications = async (
  email?: string
): Promise<StudentApplication[]> => {
  const query = email ? `?email=${encodeURIComponent(email)}` : ""
  const res = await fetch(`${BASE_URL}/applications${query}`, {
    cache: "no-store",
  })
  if (!res.ok) return []

  const data = await res.json()
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.applications)) return data.applications
  return []
}

export const cancelApplication = async (id: string) => {
  const res = await fetch(`${BASE_URL}/applications/${id}`, {
    method: "DELETE",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || "Failed to cancel application")
  }
  return data
}
