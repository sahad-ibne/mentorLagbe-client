import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { activateTutorPro } from "@/lib/stripe-upgrade"

const PRO_PRICE_ID =
  process.env.STRIPE_PRO_PRICE_ID || "price_1UeV9Z9pnCvIG9dFoAJZUfQ7"

export async function POST(request: NextRequest) {
  try {
    const userSession = await auth.api.getSession({
      headers: request.headers,
    })
    if (!userSession) {
      return NextResponse.json({ error: "Sign in to confirm your payment." }, { status: 401 })
    }
    if (String(userSession.user.role || "").toLowerCase() !== "tutor") {
      return NextResponse.json({ error: "Only tutors can upgrade to Pro." }, { status: 403 })
    }

    const { sessionId } = await request.json()
    if (typeof sessionId !== "string" || !sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Invalid checkout session." }, { status: 400 })
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    })
    const lineItems = checkoutSession.line_items?.data || []
    const purchasedProPlan = lineItems.some(
      (item) => item.price?.id === PRO_PRICE_ID
    )

    if (
      checkoutSession.payment_status !== "paid" ||
      checkoutSession.mode !== "payment" ||
      checkoutSession.metadata?.userRole !== "tutor" ||
      checkoutSession.metadata?.plan !== "pro" ||
      checkoutSession.metadata?.userId !== userSession.user.id ||
      checkoutSession.metadata?.userEmail?.toLowerCase() !==
        userSession.user.email?.toLowerCase() ||
      !purchasedProPlan
    ) {
      return NextResponse.json(
        { error: "A completed Pro payment for this tutor could not be verified." },
        { status: 403 }
      )
    }

    await activateTutorPro({
      userId: userSession.user.id,
      email: userSession.user.email,
      checkoutSessionId: checkoutSession.id,
      customerId:
        typeof checkoutSession.customer === "string"
          ? checkoutSession.customer
          : checkoutSession.customer?.id || null,
    })

    return NextResponse.json({ success: true, plan: "pro" })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not confirm your Pro payment.",
      },
      { status: 500 }
    )
  }
}
