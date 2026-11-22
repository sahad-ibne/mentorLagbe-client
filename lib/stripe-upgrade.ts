import "server-only"

import { ObjectId } from "mongodb"
import { db } from "@/lib/auth"

export async function activateTutorPro({
  userId,
  email,
  checkoutSessionId,
  customerId,
}: {
  userId: string
  email: string
  checkoutSessionId: string
  customerId: string | null
}) {
  const identityFilter = ObjectId.isValid(userId)
    ? { _id: new ObjectId(userId), email }
    : { id: userId, email }

  const result = await db.collection("user").updateOne(identityFilter, {
    $set: {
      plan: "pro",
      stripeCheckoutSessionId: checkoutSessionId,
      ...(customerId ? { stripeCustomerId: customerId } : {}),
      planUpdatedAt: new Date(),
    },
  })

  if (result.matchedCount !== 1) {
    throw new Error("Could not find the tutor account for this payment.")
  }
}
