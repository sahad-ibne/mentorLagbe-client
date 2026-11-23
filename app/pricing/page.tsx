import Link from "next/link"
import { ArrowRight, Check, RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProPlanPrices } from "@/lib/stripe"

const formatPrice = (amount: number, currency: string) => {
  const currencyCode = currency.toUpperCase()
  const fractionDigits = new Intl.NumberFormat("en", {
    style: "currency",
    currency: currencyCode,
  }).resolvedOptions().maximumFractionDigits ?? 2

  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: fractionDigits,
  }).format(amount / 10 ** fractionDigits)
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; error?: string }>
}) {
  const { canceled, error } = await searchParams
  let proPrices: Awaited<ReturnType<typeof getProPlanPrices>> | null = null
  let pricingUnavailable = false

  try {
    proPrices = await getProPlanPrices()
  } catch (pricingError) {
    console.error("Could not load Pro plan pricing.", pricingError)
    pricingUnavailable = true
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-indigo-600">Plans</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Choose the plan that fits you
        </h1>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Start free, then upgrade for unlimited student bookmarks or tutor
          tuition posts.
        </p>
      </div>

      {canceled && (
        <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          Checkout was canceled. You can upgrade to Pro whenever you&apos;re
          ready.
        </p>
      )}
      {error === "unsupported-role" && (
        <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-center text-sm text-rose-700">
          Pro plans are available to student and tutor accounts.
        </p>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Free</h2>
          <p className="mt-2 text-sm text-slate-500">
            Core features for students and tutors.
          </p>
          <p className="mt-6 text-4xl font-bold text-slate-900">Free</p>
          <p className="mt-1 text-sm text-slate-500">No payment required</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Save up to 5 tuitions as a student
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Up to 2 tuition posts as a tutor
            </li>
          </ul>
          <Link href="/sign-up" className="mt-8 block">
            <Button className="w-full bg-indigo-600 text-white hover:bg-indigo-700">
              Get started
            </Button>
          </Link>
        </section>

        <section className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Pro</h2>
          <p className="mt-2 text-sm text-slate-500">
            Pick the Pro benefits for your account.
          </p>
          {pricingUnavailable || !proPrices ? (
            <div
              role="alert"
              className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
            >
              Current Pro pricing is temporarily unavailable. Please reload
              this page before continuing to checkout.
              <Link
                href="/pricing"
                className="mt-2 inline-flex items-center gap-1 font-semibold underline"
              >
                <RotateCw className="size-3.5" />
                Reload pricing
              </Link>
            </div>
          ) : (
            <>
              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-indigo-100 bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      Student Pro
                    </p>
                    <p className="text-xl font-bold text-slate-950">
                      {formatPrice(
                        proPrices.student.amount,
                        proPrices.student.currency
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Unlimited tuition bookmarks
                  </p>
                </div>
                <div className="rounded-xl border border-indigo-100 bg-white p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-semibold text-slate-900">Tutor Pro</p>
                    <p className="text-xl font-bold text-slate-950">
                      {formatPrice(
                        proPrices.tutor.amount,
                        proPrices.tutor.currency
                      )}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Unlimited tuition posts
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                One-time payment, not a subscription. Your account role sets
                the price; Stripe will show the final total before you pay.
              </p>
              <form action="/api/checkout_sessions" method="POST" className="mt-6">
                <Button
                  className="w-full gap-2 bg-indigo-600 text-white hover:bg-indigo-700"
                  type="submit"
                >
                  Continue to secure checkout
                  <ArrowRight className="size-4" />
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  )
}
