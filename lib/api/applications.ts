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
  studentName?: string
  phone?: string
  preferredSchedule?: string
  learningNote?: string
  monthlyFee?: number | null
  status: "pending" | "accepted" | "rejected" | string
  createdAt?: string
  appliedAt?: string
  studentEmail?: string
}

export const getStudentApplications = async (): Promise<
  StudentApplication[]
> => {
  const res = await fetch("/api/applications", { cache: "no-store" })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || "Could not load your applications.")
  }
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.applications)) return data.applications
  throw new Error("The application service returned an unexpected response.")
}

export const getTutorApplications = async (): Promise<StudentApplication[]> => {
  const res = await fetch("/api/applications", { cache: "no-store" })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || "Could not load applicant requests.")
  }
  if (Array.isArray(data?.applications)) return data.applications
  throw new Error("The application service returned an unexpected response.")
}

export const updateApplicationStatus = async (
  id: string,
  status: "accepted" | "rejected"
) => {
  const res = await fetch(`/api/applications/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || "Could not update application status.")
  }
  return data
}

export const cancelApplication = async (id: string) => {
  const res = await fetch(`/api/applications/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data?.message || "Failed to cancel application")
  }
  return data
}
