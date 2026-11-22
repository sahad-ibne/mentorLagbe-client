export interface AdminTuition {
  _id?: string
  id?: string
  title?: string
  subject?: string
  classLevel?: string
  mode?: string
  location?: string
  monthlyFee?: number
  approvalStatus?: string
  tutorName?: string
  tutorEmail?: string
}

export interface AdminPayment {
  _id?: string
  id?: string
  userName?: string
  name?: string
  email?: string
  role?: string
  planName?: string
  plan?: string
  amount?: number | string
  amountTotal?: number | string
  currency?: string
  transactionId?: string
  sessionId?: string
  paymentIntentId?: string
  paymentDate?: string | number | Date
  createdAt?: string | number | Date
  date?: string | number | Date
}

async function getAdminData<T>(path: string, key: string): Promise<T[]> {
  const response = await fetch(path, { cache: "no-store" })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || `Could not load ${key}.`)
  }
  if (!Array.isArray(data?.[key])) {
    throw new Error(`The admin service returned an unexpected ${key} response.`)
  }

  return data[key] as T[]
}

export const getAdminTuitions = () =>
  getAdminData<AdminTuition>("/api/admin/tuitions", "tuitions")

export const getAdminPayments = () =>
  getAdminData<AdminPayment>("/api/admin/transactions", "payments")

export async function updateAdminTuition(
  id: string,
  approvalStatus: "approved" | "rejected"
) {
  const response = await fetch("/api/admin/tuitions", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id, approvalStatus }),
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.error || "Could not update tuition.")
  }
}
