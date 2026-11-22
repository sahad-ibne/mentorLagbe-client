"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { CheckCircle2, Loader2 } from "lucide-react"

export function UpgradeSuccess({ sessionId }: { sessionId: string }) {
  const router = useRouter()
  const { refetch } = useSession()
  const [message, setMessage] = useState("Verifying your Stripe payment...")
  const [error, setError] = useState("")

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

        await refetch?.()
        if (active) {
          setMessage("Payment confirmed. Your account is now on the Pro plan.")
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
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      {error ? (
        <>
          <p
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
          >
            {error}
          </p>
          <p className="mt-3 text-sm text-slate-500">
            If the payment completed, plan activation may take a moment. Please
            refresh your session or try again.
          </p>
        </>
      ) : (
        <>
          {message.startsWith("Payment confirmed") ? (
            <CheckCircle2 className="size-12 text-emerald-600" />
          ) : (
            <Loader2 className="size-10 animate-spin text-indigo-600" />
          )}
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {message.startsWith("Payment confirmed")
              ? "Welcome to Pro"
              : "Confirming your upgrade"}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
        </>
      )}

      <Link href="/dashboard/tutor" className="mt-6">
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
          Go to tutor dashboard
        </Button>
      </Link>
    </main>
  )
}
