import Link from "next/link"
import { ShieldX } from "lucide-react"
import { Button } from "@/components/ui/button"

const UnauthorizedPage = () => {
  return (
    <main className="flex min-h-[65vh] items-center justify-center px-4 py-16">
      <section className="max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldX className="size-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
          You don&apos;t have access to this dashboard
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Sign in with an account that has the required role, or return to the
          home page.
        </p>
        <Link href="/" className="mt-6 inline-flex">
          <Button className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
            Back to home
          </Button>
        </Link>
      </section>
    </main>
  )
}

export default UnauthorizedPage
