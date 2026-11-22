import { createAuthClient } from "better-auth/react"
import { adminClient } from "better-auth/client/plugins"
import { authRoles } from "./auth-roles"

const profileFieldsClient = {
  id: "profile-fields",
  $InferServerPlugin: {
    schema: {
      user: {
        fields: {
          phone: { type: "string", required: false, input: true },
          bio: { type: "string", required: false, input: true },
        },
      },
    },
  },
} as const

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [adminClient({ roles: authRoles }), profileFieldsClient],
})

export const { signIn, signUp, signOut, useSession } = authClient
