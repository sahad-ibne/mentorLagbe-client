import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { authRoles } from "./auth-roles"

const client = new MongoClient(process.env.BETTER_AUTH_DB_URI as string)
const db = client.db("mentorLagbe")

export const auth = betterAuth({
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role === "tutor" ? "tutor" : "student",
          },
        }),
      },
      update: {
        before: async (user, context) => {
          if (
            context?.path.endsWith("/admin/set-role") ||
            !("role" in user)
          ) {
            return
          }

          const currentRole = context?.context.session?.user?.role
          if (typeof currentRole !== "string") return false

          return { data: { ...user, role: currentRole } }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      plan: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
      bio: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [admin({ defaultRole: "student", roles: authRoles })],

  database: mongodbAdapter(db, {
    client,
  }),
})
