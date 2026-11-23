import "server-only"

import Stripe from "stripe"

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

export const TUTOR_PRO_PRICE_ID =
  process.env.STRIPE_PRO_PRICE_ID || "price_1UeV9Z9pnCvIG9dFoAJZUfQ7"
export const STUDENT_PRO_PRICE_ID =
  process.env.STRIPE_STUDENT_PRO_PRICE_ID || "price_1UebKQ9pnCvIG9dFKZlN01S5"

export async function getProPlanPrices() {
  const [studentPrice, tutorPrice] = await Promise.all([
    stripe.prices.retrieve(STUDENT_PRO_PRICE_ID),
    stripe.prices.retrieve(TUTOR_PRO_PRICE_ID),
  ])

  const getOneTimePrice = (
    price: Awaited<ReturnType<typeof stripe.prices.retrieve>>
  ) => {
    if (price.unit_amount === null || price.recurring) {
      throw new Error("Pro plans must use one-time Stripe prices.")
    }

    return {
      amount: price.unit_amount,
      currency: price.currency,
    }
  }

  return {
    student: getOneTimePrice(studentPrice),
    tutor: getOneTimePrice(tutorPrice),
  }
}
