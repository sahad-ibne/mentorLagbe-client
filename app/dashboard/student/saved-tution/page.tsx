"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { BookmarkTuitionButton } from "@/app/components/tuitions/bookmark-tuition-button"
import type { TuitionItem } from "@/app/components/tuitions/tuition-card"

interface SavedTuitionsResponse {
  count: number
  limit: number | null
  plan: "free" | "pro"
  tuitions: TuitionItem[]
  unavailableIds: string[]
}

export default function SavedTuitionsPage() {
  const { data: session, isPending: checkingSession } = useSession()
  const role = String(session?.user?.role || "").toLowerCase()
  const [data, setData] = useState<SavedTuitionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadBookmarks = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/bookmarks", { cache: "no-store" })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || "Could not load saved tuitions.")
      }
      setData(result)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load saved tuitions."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (role !== "student") return
    const timer = setTimeout(() => void loadBookmarks(), 0)
    return () => clearTimeout(timer)
  }, [loadBookmarks, role])

  if (checkingSession || (role === "student" && loading)) {
    return (
      <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin text-indigo-600" />
        Loading saved tuitions...
      </div>
    )
  }

  if (role !== "student") {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <p className="font-semibold text-slate-900">Student account required</p>
        <p className="mt-1 text-sm text-slate-500">
          Sign in with a student account to manage saved tuitions.
        </p>
        <Link href="/sign-in" className="mt-4 inline-block">
          <Button>Sign in</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Saved Tuitions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {data?.plan === "pro"
              ? `${data.count} saved tuitions · Pro has unlimited bookmarks.`
              : `${data?.count || 0} of 5 free bookmarks used.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {data?.plan !== "pro" && (
            <Link href="/pricing">
              <Button variant="outline" className="rounded-xl">
                Upgrade for Unlimited
              </Button>
            </Link>
          )}
          <Link href="/browse-tutions">
            <Button className="gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
              Browse Tuitions
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
          <Button variant="link" onClick={() => void loadBookmarks()}>
            Try again
          </Button>
        </div>
      )}

      {!error &&
      data?.tuitions.length === 0 &&
      data.unavailableIds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Bookmark className="mx-auto size-8 text-indigo-500" />
          <p className="mt-3 font-semibold text-slate-900">
            No saved tuitions yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Save an approved tuition to keep it handy.
          </p>
        </div>
      ) : !error && data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.tuitions.map((tuition) => {
            const tuitionId = tuition._id || tuition.id || ""
            return (
              <article
                key={tuitionId}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {tuition.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {tuition.subject} · {tuition.classLevel} · ৳
                    {Number(tuition.monthlyFee || 0).toLocaleString()}/mo
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    {tuition.location}
                  </p>
                </div>
                <div className="mt-auto grid gap-2">
                  <Link href={`/browse-tutions/${tuitionId}`}>
                    <Button variant="outline" className="w-full rounded-xl">
                      View Details
                    </Button>
                  </Link>
                  <BookmarkTuitionButton
                    tuitionId={tuitionId}
                    initialBookmarked
                    initialBookmarkCount={data?.count}
                    initialPlan={data?.plan}
                    onBookmarkChange={(saved) => {
                      if (!saved) {
                        setData((current) =>
                          current
                            ? {
                                ...current,
                                count: Math.max(0, current.count - 1),
                                tuitions: current.tuitions.filter(
                                  (item) =>
                                    (item._id || item.id) !== tuitionId
                                ),
                              }
                            : current
                        )
                      }
                    }}
                  />
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      {!error && data?.unavailableIds.length ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-700">
            No longer available
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.unavailableIds.map((tuitionId) => (
              <article
                key={tuitionId}
                className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4"
              >
                <p className="text-sm text-slate-600">
                  This tuition is no longer approved or active.
                </p>
                <BookmarkTuitionButton
                  tuitionId={tuitionId}
                  initialBookmarked
                  initialBookmarkCount={data.count}
                  initialPlan={data.plan}
                  onBookmarkChange={(saved) => {
                    if (!saved) {
                      setData((current) =>
                        current
                          ? {
                              ...current,
                              count: Math.max(0, current.count - 1),
                              unavailableIds: current.unavailableIds.filter(
                                (id) => id !== tuitionId
                              ),
                            }
                          : current
                      )
                    }
                  }}
                />
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
