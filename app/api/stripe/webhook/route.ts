import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"
import { activateTutorPro } from "@/lib/stripe-upgrade"

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook signature configuration is missing." },
      { status: 400 }
    )
  }

  let event: Stripe.Event
  try {
    const payload = await request.text()
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Invalid Stripe webhook: ${error.message}`
            : "Invalid Stripe webhook signature.",
      },
      { status: 400 }
    )
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const checkoutSession = event.data.object as Stripe.Checkout.Session
    const userId = checkoutSession.metadata?.userId
    const email = checkoutSession.metadata?.userEmail

    if (
      checkoutSession.payment_status === "paid" &&
      checkoutSession.mode === "payment" &&
      checkoutSession.metadata?.userRole === "tutor" &&
      checkoutSession.metadata?.plan === "pro" &&
      userId &&
      email
    ) {
      try {
        await activateTutorPro({
          userId,
          email,
          checkoutSessionId: checkoutSession.id,
          customerId:
            typeof checkoutSession.customer === "string"
              ? checkoutSession.customer
              : checkoutSession.customer?.id || null,
        })
      } catch (error) {
        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Could not activate the Pro plan.",
          },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
