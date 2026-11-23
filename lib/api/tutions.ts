const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

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
  createdAt?: string | Date
}

export interface PlatformStats {
  verifiedStudents: number
  verifiedTutors: number
  activeTuitions: number
}

export const getFeaturedTuitions = async (): Promise<TuitionRecord[]> => {
  const response = await fetch(`${BASE_URL}/tutions/featured`, {
    cache: "no-store",
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || "Could not load featured tuitions.")
  }
  if (!Array.isArray(data)) {
    throw new Error("The featured tuition service returned an unexpected response.")
  }

  return data
}

export const getPlatformStats = async (): Promise<PlatformStats> => {
  const response = await fetch(`${BASE_URL}/platform-stats`, {
    cache: "no-store",
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.message || "Could not load platform statistics.")
  }
  if (
    !data ||
    typeof data.verifiedStudents !== "number" ||
    typeof data.verifiedTutors !== "number" ||
    typeof data.activeTuitions !== "number"
  ) {
    throw new Error("The platform statistics service returned an unexpected response.")
  }

  return data
}

export const getTutions = async (query = "") => {
  const res = await fetch(`${BASE_URL}/tutions?${query}`, {
    cache: "no-store",
  })
  return res.json()
}

export const getMyTuitions = async (): Promise<TuitionRecord[]> => {
  const res = await fetch("/api/tuitions", { cache: "no-store" })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || "Could not load your tuitions.")
  }
  if (Array.isArray(data?.tutions)) return data.tutions
  if (Array.isArray(data?.tuitions)) return data.tuitions
  throw new Error("The tuition service returned an unexpected response.")
}
export const updateTution = async (
  id: string,
  payload: Partial<TuitionRecord>
) => {
  const res = await fetch(`/api/tuitions/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Could not update tuition.")
  }
  return data
}

export const deleteTution = async (id: string) => {
  const res = await fetch(`/api/tuitions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  })
  const data = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error(data?.error || data?.message || "Could not delete tuition.")
  }
  return data
}

export const getTutionById = async (
  id: string
): Promise<TuitionRecord | null> => {
  try {
    const res = await fetch(`${BASE_URL}/tutions/${id}`, {
      cache: "no-store",
    })

    if (res.ok) {
      const data = await res.json()
      if (data && typeof data === "object") {
        if ("tution" in data && data.tution) return data.tution
        if ("tuition" in data && data.tuition) return data.tuition
        if ("_id" in data || "id" in data) return data as TuitionRecord
      }
    }
  } catch {
    // Fallback below if direct endpoint fails
  }

  const all = await getTutions()
  const list: TuitionRecord[] = Array.isArray(all)
    ? all
    : Array.isArray(all?.tutions)
      ? all.tutions
      : []

  return list.find((item) => item._id === id || item.id === id) || null
}
