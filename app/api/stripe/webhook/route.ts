import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { stripe } from "@/lib/stripe"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

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
    const internalApiSecret = process.env.INTERNAL_API_SECRET
    const isProCheckout =
      ["student", "tutor"].includes(checkoutSession.metadata?.userRole || "") &&
      checkoutSession.metadata?.plan === "pro"

    if (
      checkoutSession.payment_status === "paid" &&
      isProCheckout
    ) {
      if (!userId || !email || !internalApiSecret) {
        return NextResponse.json(
          {
            error:
              "Paid Pro checkout is missing required tutor metadata or verification configuration.",
          },
          { status: 500 }
        )
      }

      try {
        const response = await fetch(`${API_BASE}/payments/checkout-verify`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-internal-api-secret": internalApiSecret,
          },
          body: JSON.stringify({
            sessionId: checkoutSession.id,
            userId,
            email,
          }),
          cache: "no-store",
        })
        const result = await response.json().catch(() => null)
        if (!response.ok || result?.success !== true) {
          throw new Error(
            result?.message || result?.error || "Backend payment verification failed."
          )
        }
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
