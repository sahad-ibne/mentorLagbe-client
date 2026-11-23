"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { ArrowRight, CheckCircle2, Home, Loader2, ShieldCheck } from "lucide-react"

export function UpgradeSuccess({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const { refetch } = useSession()
  const [error, setError] = useState("")
  const [confirmed, setConfirmed] = useState(false)
  const [account, setAccount] = useState<{
    name: string
    email: string
    role: "student" | "tutor"
  } | null>(null)

  useEffect(() => {
    let active = true

    const confirmUpgrade = async () => {
      try {
        const response = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId }),
        })
        const result = await response.json().catch(() => null)

        if (!response.ok) {
          throw new Error(
            result?.error || "Your payment could not be verified yet."
          )
        }

        if (
          (result?.role !== "student" && result?.role !== "tutor") ||
          typeof result?.user?.email !== "string"
        ) {
          throw new Error("Your payment was confirmed, but account details are unavailable.")
        }

        await refetch?.()
        if (active) {
          setAccount({
            name:
              typeof result.user.name === "string" ? result.user.name : "",
            email: result.user.email,
            role: result.role,
          })
          setConfirmed(true)
          router.refresh()
        }
      } catch (verificationError) {
        if (active) {
          setError(
            verificationError instanceof Error
              ? verificationError.message
              : "Could not verify your payment."
          )
        }
      }
    }

    void confirmUpgrade()
    return () => {
      active = false
    }
  }, [refetch, router, sessionId])

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(99,102,241,0.12),transparent_38%),radial-gradient(ellipse_at_90%_70%,rgba(129,140,248,0.12),transparent_36%)]" />
      {error ? (
        <section className="relative w-full max-w-lg rounded-3xl border border-amber-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
            We couldn&apos;t verify your upgrade yet
          </h1>
          <p role="alert" className="mt-3 text-sm leading-6 text-amber-800">
            {error}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            If you completed payment, it may take a moment for your Pro access
            to appear.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={`/upgrade/success?session_id=${encodeURIComponent(sessionId)}`}>
              <Button className="w-full gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto">
                Try again
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full gap-2 rounded-xl sm:w-auto">
                <Home className="size-4" />
                Go to home
              </Button>
            </Link>
          </div>
        </section>
      ) : (
        <section className="relative w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-900/5 sm:p-10">
          {confirmed && account ? (
            <>
              <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="mt-5 text-xs font-bold tracking-[0.18em] text-emerald-700 uppercase">
                Payment confirmed
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Welcome to Pro{account.name ? `, ${account.name}` : ""}
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your upgrade is complete. Pro benefits are now active on your
                account.
              </p>

              <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Account
                  </p>
                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {account.name || "MentorLagbe member"}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {account.email}
                  </p>
                </div>
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
                  <p className="text-xs font-medium text-indigo-700">
                    Membership
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Pro · {account.role === "tutor" ? "Tutor" : "Student"}
                  </p>
                  <p className="text-xs text-slate-600">
                    {account.role === "tutor"
                      ? "Unlimited tuition posts"
                      : "Unlimited tuition bookmarks"}
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                <Link href={`/dashboard/${account.role}`}>
                  <Button className="w-full gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 sm:w-auto">
                    Go to dashboard
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full gap-2 rounded-xl sm:w-auto">
                    <Home className="size-4" />
                    Go to home
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <Loader2 className="size-7 animate-spin" />
              </div>
              <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">
                Confirming your upgrade
              </h1>
              <p role="status" className="mt-2 text-sm leading-6 text-slate-600">
                We&apos;re securely confirming your Stripe payment. This should
                only take a moment.
              </p>
            </>
          )}
        </section>
      )}
    </main>
  )
}
