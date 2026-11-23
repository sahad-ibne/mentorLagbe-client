"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useSession } from "@/lib/auth-client"

interface TuitionReview {
  id: string
  rating: number
  feedback: string
  studentName: string
  createdAt: string
}

interface ReviewData {
  reviews: TuitionReview[]
  averageRating: number
  totalReviews: number
  canReview: boolean
  currentReview: { rating: number; feedback: string } | null
}

async function fetchReviews(tuitionId: string): Promise<ReviewData> {
  const response = await fetch(
    `/api/tuitions/${encodeURIComponent(tuitionId)}/reviews`,
    { cache: "no-store" }
  )
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error || "Could not load tuition reviews.")
  }
  return data as ReviewData
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          aria-hidden="true"
          className={`size-4 ${
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-300"
          }`}
        />
      ))}
    </span>
  )
}

function formatReviewDate(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
}

export function TuitionReviews({ tuitionId }: { tuitionId: string }) {
  const { data: session, isPending: sessionPending } = useSession()
  const [data, setData] = useState<ReviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadReviews = useCallback(async () => {
    const result = await fetchReviews(tuitionId)
    setData(result)
    setRating(result.currentReview?.rating || 0)
    setFeedback(result.currentReview?.feedback || "")
  }, [tuitionId])

  useEffect(() => {
    let active = true
    fetchReviews(tuitionId)
      .then((result) => {
        if (!active) return
        setData(result)
        setRating(result.currentReview?.rating || 0)
        setFeedback(result.currentReview?.feedback || "")
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : "Could not load reviews."
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [tuitionId])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (rating < 1 || rating > 5 || !feedback.trim()) {
      setError("Choose a star rating and write your feedback.")
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(
        `/api/tuitions/${encodeURIComponent(tuitionId)}/reviews`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ rating, feedback: feedback.trim() }),
        }
      )
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || "Could not submit your review.")
      }

      await loadReviews()
      setSuccess("Your review has been saved.")
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not submit your review."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Student Reviews</h2>
          <p className="mt-1 text-sm text-slate-500">
            Feedback from students who have taken this tuition.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {data && data.totalReviews > 0 ? (
            <>
              <StarRating rating={Math.round(data.averageRating)} />
              <span className="text-sm font-semibold text-slate-900">
                {data.averageRating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">
                ({data.totalReviews})
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-500">No ratings yet</span>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading reviews...</p>
      ) : (
        <>
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
            >
              {error}
            </p>
          )}
          {data?.reviews.length ? (
            <div className="divide-y divide-slate-100">
              {data.reviews.map((review) => (
                <article key={review.id} className="space-y-2 py-4 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {review.studentName || "Student"}
                      </p>
                      <StarRating rating={review.rating} />
                    </div>
                    <time className="text-xs text-slate-500">
                      {formatReviewDate(review.createdAt)}
                    </time>
                  </div>
                  <p className="text-sm leading-6 whitespace-pre-line text-slate-600">
                    {review.feedback}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              Be the first student to review this tuition.
            </p>
          )}
        </>
      )}

      {!loading && data?.canReview && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 border-t border-slate-100 pt-4"
        >
          <h3 className="text-sm font-semibold text-slate-900">
            {data.currentReview ? "Update your review" : "Rate this tuition"}
          </h3>
          <div
            role="radiogroup"
            aria-label="Your rating"
            className="flex items-center gap-1"
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                role="radio"
                aria-checked={rating === star}
                aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
                onClick={() => setRating(star)}
                className="rounded p-1 transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-indigo-600"
              >
                <Star
                  aria-hidden="true"
                  className={`size-6 ${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="Share your experience with this tuition..."
            maxLength={2000}
            rows={4}
            required
            aria-label="Review feedback"
            className="resize-y rounded-xl border-slate-200"
          />
          {success && (
            <p role="status" className="text-sm text-emerald-700">
              {success}
            </p>
          )}
          <Button
            type="submit"
            disabled={submitting || rating < 1 || !feedback.trim()}
            className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {submitting
              ? "Saving..."
              : data.currentReview
                ? "Update Review"
                : "Submit Review"}
          </Button>
        </form>
      )}

      {!loading && data && !data.canReview && (
        <p className="border-t border-slate-100 pt-4 text-sm text-slate-500">
          {sessionPending ? (
            "Checking review eligibility..."
          ) : !session ? (
            <>
              <Link
                href="/sign-in"
                className="font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Sign in
              </Link>{" "}
              with a student account to review after your application is
              accepted.
            </>
          ) : (
            "Only students with an accepted application can review this tuition."
          )}
        </p>
      )}
    </section>
  )
}
