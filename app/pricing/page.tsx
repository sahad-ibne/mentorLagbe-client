import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string }>
}) {
  const { canceled } = await searchParams

  if (canceled) {
    console.log(
      "Order canceled -- continue to shop around and check out when you're ready."
    )
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold text-indigo-600">Plans</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Choose the plan that fits you
        </h1>
        <p className="mt-4 text-sm text-slate-600 sm:text-base">
          Start free, then upgrade when you need more tuition listings.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900">Free</h2>
          <p className="mt-2 text-sm text-slate-500">
            For tutors getting started.
          </p>
          <p className="mt-6 text-4xl font-bold text-slate-900">$0</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Up to 2 tuition posts
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Browse and manage applications
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
            For tutors with more active classes.
          </p>
          <p className="mt-6 text-4xl font-bold text-slate-900">Flexible</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Unlimited tuition posts
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Priority listing visibility
            </li>
          </ul>
          <Link href="/sign-up" className="mt-8 block">
            <form action="/api/checkout_sessions" method="POST">
              <section>
                <Button
                  variant="outline"
                  className="w-full"
                  type="submit"
                  role="link"
                >
                  Upgrade to Pro
                </Button>
              </section>
            </form>
          </Link>
        </section>
      </div>
    </main>
  )
}
