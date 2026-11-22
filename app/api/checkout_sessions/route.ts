import { auth } from "@/lib/auth"
import { stripe } from "@/lib/stripe"
import { NextRequest, NextResponse } from "next/server"

const PRO_PRICE_ID =
  process.env.STRIPE_PRO_PRICE_ID || "price_1UeV9Z9pnCvIG9dFoAJZUfQ7"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    })

    if (!session) {
      return NextResponse.redirect(
        new URL("/sign-in?next=%2Fpricing", request.url),
        303
      )
    }

    if (String(session.user.role || "").toLowerCase() !== "tutor") {
      return NextResponse.redirect(
        new URL("/pricing?error=tutors-only", request.url),
        303
      )
    }

    if (String(session.user.plan || "free").toLowerCase() === "pro") {
      return NextResponse.redirect(
        new URL("/dashboard/tutor?upgrade=already-pro", request.url),
        303
      )
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.BETTER_AUTH_URL ||
      request.nextUrl.origin

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: PRO_PRICE_ID, quantity: 1 }],
      customer_email: session.user.email,
      client_reference_id: session.user.id,
      metadata: {
        userId: session.user.id,
        userEmail: session.user.email,
        userRole: "tutor",
        plan: "pro",
      },
      success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?canceled=1`,
    })

    if (!checkoutSession.url) {
      throw new Error("Stripe did not return a checkout URL.")
    }

    return NextResponse.redirect(checkoutSession.url, 303)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start checkout."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
