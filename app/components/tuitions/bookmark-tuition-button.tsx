"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bookmark, Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

interface BookmarkTuitionButtonProps {
  tuitionId: string
  initialBookmarked?: boolean
  initialBookmarkCount?: number
  initialPlan?: "free" | "pro"
  onBookmarkChange?: (bookmarked: boolean) => void
}

export function BookmarkTuitionButton({
  tuitionId,
  initialBookmarked,
  initialBookmarkCount,
  initialPlan,
  onBookmarkChange,
}: BookmarkTuitionButtonProps) {
  const { data: session, isPending: checkingSession } = useSession()
  const user = session?.user as
    | { role?: string; plan?: string }
    | undefined
  const role = String(user?.role || "").toLowerCase()
  const [bookmarked, setBookmarked] = useState(initialBookmarked || false)
  const [loading, setLoading] = useState(false)
  const [statusLoaded, setStatusLoaded] = useState(
    initialBookmarked !== undefined
  )
  const [bookmarkCount, setBookmarkCount] = useState<number | null>(
    initialBookmarkCount ?? null
  )
  const [plan, setPlan] = useState<"free" | "pro">(initialPlan || "free")

  useEffect(() => {
    if (role !== "student" || initialBookmarked !== undefined) {
      return
    }

    let active = true
    fetch(`/api/bookmarks?tuitionId=${encodeURIComponent(tuitionId)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const result = await response.json().catch(() => null)
        if (!response.ok) {
          throw new Error(result?.error || "Could not check your bookmarks.")
        }
        if (active) {
          setBookmarked(Boolean(result?.bookmarked))
          setBookmarkCount(Number(result?.count) || 0)
          setPlan(result?.plan === "pro" ? "pro" : "free")
        }
      })
      .catch((error) => {
        if (active) {
          toast.add({
            type: "error",
            title: "Bookmark status unavailable",
            description:
              error instanceof Error ? error.message : "Please try again.",
          })
        }
      })
      .finally(() => {
        if (active) setStatusLoaded(true)
      })

    return () => {
      active = false
    }
  }, [initialBookmarked, role, tuitionId])

  const checking =
    role === "student" && initialBookmarked === undefined && !statusLoaded
  const displayCount = initialBookmarkCount ?? bookmarkCount
  const displayPlan = initialPlan || plan

  const toggleBookmark = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/bookmarks", {
        method: bookmarked ? "DELETE" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tuitionId }),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(result?.error || "Could not update your bookmark.")
      }

      const nextState = !bookmarked
      setBookmarked(nextState)
      setBookmarkCount((current) =>
        current === null ? null : Math.max(0, current + (nextState ? 1 : -1))
      )
      onBookmarkChange?.(nextState)
      toast.add({
        type: "success",
        title: nextState ? "Tuition saved" : "Bookmark removed",
        description: nextState
          ? "You can find it in Saved Tuitions."
          : "This tuition was removed from Saved Tuitions.",
      })
    } catch (error) {
      toast.add({
        type: "error",
        title: "Bookmark update failed",
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <Button disabled className="h-11 w-full rounded-xl">
        Checking access...
      </Button>
    )
  }

  if (!session?.user) {
    return (
      <Link href="/sign-in" className="block">
        <Button variant="outline" className="h-11 w-full rounded-xl">
          Sign in to save tuition
        </Button>
      </Link>
    )
  }

  if (role !== "student") {
    return (
      <Button disabled variant="outline" className="h-11 w-full rounded-xl">
        Students only
      </Button>
    )
  }

  return (
    <div className="space-y-1.5">
      <Button
        type="button"
        variant={bookmarked ? "outline" : "secondary"}
        disabled={loading || checking}
        onClick={toggleBookmark}
        className="h-11 w-full gap-2 rounded-xl"
      >
        {loading || checking ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Bookmark className="size-4" />
        )}
        {bookmarked ? "Remove Bookmark" : "Save Tuition"}
      </Button>
      {displayPlan === "pro" ? (
        <p className="text-center text-xs text-slate-500">
          Pro plan: unlimited bookmarks
        </p>
      ) : (
        <p className="text-center text-xs text-slate-500">
          {displayCount === null ? "Free plan: up to 5 bookmarks" : `${displayCount}/5 free bookmarks used`}
          {" · "}
          <Link href="/pricing" className="font-medium text-indigo-600 hover:underline">
            Upgrade
          </Link>
        </p>
      )}
    </div>
  )
}
