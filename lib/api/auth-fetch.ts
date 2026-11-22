import { authClient } from "@/lib/auth-client"

export async function authFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const { data, error } = await authClient.getSession({
    query: { disableCookieCache: true },
  })
  const token = data?.session?.token

  if (error || !token) {
    throw new Error("Your session has expired. Please sign in again.")
  }

  const headers = new Headers(init.headers)
  headers.set("Authorization", `Bearer ${token}`)

  return fetch(input, { ...init, headers })
}
