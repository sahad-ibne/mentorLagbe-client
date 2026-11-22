export const updateUserRole = async (
  userId: string,
  role: "tutor" | "student" | "admin"
) => {
  const response = await fetch("/api/admin/users/role", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, role }),
  })
  const result = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(result?.error || "Could not update user role.")
  }
  return result
}
