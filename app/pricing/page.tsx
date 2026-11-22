import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ canceled?: string; error?: string }>
}) {
  const { canceled, error } = await searchParams

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
          <p className="mt-6 text-4xl font-bold text-slate-900">$0</p>
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
            More room to learn, teach, and grow.
          </p>
          <p className="mt-6 text-4xl font-bold text-slate-900">Flexible</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Unlimited student tuition bookmarks
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              Unlimited tutor tuition posts
            </li>
          </ul>
          <form action="/api/checkout_sessions" method="POST" className="mt-8">
            <Button variant="outline" className="w-full" type="submit">
              Upgrade to Pro
            </Button>
          </form>
        </section>
      </div>
    </main>
  )
}
