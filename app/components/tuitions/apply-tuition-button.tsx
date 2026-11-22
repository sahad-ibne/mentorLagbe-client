"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { Send } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/toast"

interface ApplyTuitionButtonProps {
  tuitionId: string
  tuitionTitle?: string
  tutorEmail?: string
  monthlyFee: number
}

export function ApplyTuitionButton({
  tuitionId,
  tuitionTitle,
  tutorEmail,
  monthlyFee,
}: ApplyTuitionButtonProps) {
  const { data: session, isPending } = useSession()
  const user = session?.user as
    { id?: string; name?: string; email?: string; role?: string } | undefined
  const role = (user?.role || "").toLowerCase()

  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState("")
  const [preferredSchedule, setPreferredSchedule] = useState("")
  const [learningNote, setLearningNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const [checkingApplication, setCheckingApplication] = useState(false)

  useEffect(() => {
    if (role !== "student" || !tuitionId) return

    let active = true
    const checkApplication = async () => {
      setCheckingApplication(true)
      try {
        const res = await fetch(
          `/api/applications?tuitionId=${encodeURIComponent(tuitionId)}`
        )
        if (res.ok) {
          const data = await res.json()
          if (active) setAlreadyApplied(Boolean(data?.applied))
        }
      } finally {
        if (active) setCheckingApplication(false)
      }
    }

    checkApplication()
    return () => {
      active = false
    }
  }, [role, tuitionId])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (role !== "student") return
    if (!phone.trim() || !preferredSchedule.trim() || !learningNote.trim()) {
      toast.add({
        type: "error",
        title: "Application incomplete",
        description:
          "Phone, preferred schedule, and learning note are required.",
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          tuitionId,
          tuitionTitle,
          tutorEmail,
          monthlyFee,
          phone: phone.trim(),
          preferredSchedule: preferredSchedule.trim(),
          learningNote: learningNote.trim(),
        }),
      })
      const data = await res.json().catch(() => null)

      if (!res.ok) {
        throw new Error(data?.error || "Could not submit your application.")
      }

      setAlreadyApplied(true)
      setOpen(false)
      setPhone("")
      setPreferredSchedule("")
      setLearningNote("")
      toast.add({
        type: "success",
        title: "Application submitted",
        description: "Your application is pending tutor review.",
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not submit your application."
      toast.add({
        type: "error",
        title: "Application failed",
        description: message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (isPending) {
    return (
      <Button disabled className="h-11 w-full rounded-xl">
        Checking access...
      </Button>
    )
  }

  if (!user) {
    return (
      <div className="space-y-2">
        <Link href="/sign-in" className="block">
          <Button className="h-11 w-full rounded-xl">Sign in to apply</Button>
        </Link>
        <p className="text-center text-xs text-slate-500">
          Only signed-in students can apply.
        </p>
      </div>
    )
  }

  if (role !== "student") {
    return (
      <div className="space-y-2">
        <Button disabled className="h-11 w-full rounded-xl">
          Apply for Tuition
        </Button>
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs font-medium text-amber-700">
          Only student accounts can apply for tuitions.
        </p>
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <Button
          type="button"
          onClick={() => setOpen(true)}
          disabled={alreadyApplied || checkingApplication}
          className="h-11 w-full gap-2 rounded-xl bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Send className="size-4" />
          {checkingApplication
            ? "Checking..."
            : alreadyApplied
              ? "Already Applied"
              : "Apply for Tuition"}
        </Button>

        <DialogContent className="rounded-2xl border-slate-200 bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-slate-900">
              Apply for {tuitionTitle || "this tuition"}
            </DialogTitle>
            <DialogDescription>
              Submit your contact and learning preferences.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="application-phone">Phone</Label>
              <Input
                id="application-phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="application-schedule">Preferred Schedule</Label>
              <Input
                id="application-schedule"
                value={preferredSchedule}
                onChange={(event) => setPreferredSchedule(event.target.value)}
                placeholder="Example: Sat-Sun, 7 PM"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="application-note">Learning Note</Label>
              <Textarea
                id="application-note"
                value={learningNote}
                onChange={(event) => setLearningNote(event.target.value)}
                placeholder="Share your learning goals or questions"
                className="min-h-24"
                required
              />
            </div>

            <DialogFooter className="gap-2 sm:justify-end">
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white hover:bg-indigo-700"
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {alreadyApplied && (
        <p className="text-center text-xs font-medium text-emerald-700">
          You have already applied for this tuition.
        </p>
      )}
    </>
  )
}
