"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BookOpen,
  CalendarDays,
  Crown,
  FileText,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Sparkles,
  Wallet,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import Image from "next/image"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
const FREE_PLAN_LIMIT = 2
const DEFAULT_BANNER_URL =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"

type TuitionMode = "online" | "offline" | "hybrid"

interface FormState {
  title: string
  subject: string
  classLevel: string
  mode: TuitionMode
  location: string
  monthlyFee: string
  daysPerWeek: string
  bannerImage: string
  description: string
}

const initialForm: FormState = {
  title: "",
  subject: "",
  classLevel: "",
  mode: "offline",
  location: "",
  monthlyFee: "",
  daysPerWeek: "",
  bannerImage: "",
  description: "",
}

export default function PostTuitionPage() {
  const router = useRouter()
  const { data: session } = useSession()

  const user = session?.user as
    | {
        name?: string | null
        email?: string | null
        plan?: string | null
      }
    | undefined

  const isPro = (user?.plan || "free").toLowerCase() === "pro"

  const [form, setForm] = useState<FormState>(initialForm)
  const [existingPostCount, setExistingPostCount] = useState<number>(0)
  const [checkingLimit, setCheckingLimit] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [statusMessage, setStatusMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    if (!user?.email) {
      setCheckingLimit(false)
      return
    }

    let active = true
    const loadPostCount = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/tuitions?tutorEmail=${encodeURIComponent(user.email!)}`
        )
        if (!res.ok) return
        const data = await res.json()
        const list = Array.isArray(data) ? data : data.tuitions || []
        if (active) {
          setExistingPostCount(list.length)
        }
      } catch {
      } finally {
        if (active) setCheckingLimit(false)
      }
    }

    loadPostCount()
    return () => {
      active = false
    }
  }, [user?.email])

  const hasReachedFreeLimit = !isPro && existingPostCount >= FREE_PLAN_LIMIT

  const handleFieldChange = (
    field: keyof FormState,
    value: string | TuitionMode
  ) => {
    setErrorMessage("")
    setStatusMessage("")
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): string | null => {
    if (hasReachedFreeLimit) {
      return "Free Plan allows up to 2 tuition posts. Upgrade to Pro for unlimited posts."
    }
    if (!form.title.trim() || form.title.trim().length < 5) {
      return "Please enter a clear tuition title (at least 5 characters)."
    }
    if (!form.subject.trim()) {
      return "Please specify the subject."
    }
    if (!form.classLevel.trim()) {
      return "Please specify the class level."
    }
    if (!form.location.trim()) {
      return "Please enter the location or teaching area."
    }

    const fee = Number(form.monthlyFee)
    if (!form.monthlyFee || Number.isNaN(fee) || fee <= 0) {
      return "Please enter a valid monthly fee greater than 0."
    }

    const days = Number(form.daysPerWeek)
    if (!form.daysPerWeek || Number.isNaN(days) || days < 1 || days > 7) {
      return "Days per week must be between 1 and 7."
    }

    if (form.bannerImage.trim()) {
      try {
        new URL(form.bannerImage.trim())
      } catch {
        return "Please enter a valid image URL (starting with http:// or https://)."
      }
    }

    if (!form.description.trim() || form.description.trim().length < 15) {
      return "Please write a helpful description (at least 15 characters)."
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")
    setStatusMessage("")
    console.log("data", form)

    const validationError = validateForm()
    if (validationError) {
      setErrorMessage(validationError)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        title: form.title.trim(),
        subject: form.subject.trim(),
        classLevel: form.classLevel.trim(),
        mode: form.mode,
        location: form.location.trim(),
        monthlyFee: Number(form.monthlyFee),
        daysPerWeek: Number(form.daysPerWeek),
        bannerImage: form.bannerImage.trim() || DEFAULT_BANNER_URL,
        description: form.description.trim(),
        approvalStatus: "pending",
        tutorName: user?.name || "",
        tutorEmail: user?.email || "",
        tutorPlan: isPro ? "pro" : "free",
      }

      const res = await fetch(`${API_BASE}/api/tuitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData?.message || "Could not submit tuition post.")
      }

      setStatusMessage("Tuition submitted for approval (status: pending).")
      setForm(initialForm)
      setExistingPostCount((prev) => prev + 1)
      router.refresh()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Try again."
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  const previewUrl = form.bannerImage.trim()

  return (
    <div className="mx-auto mt-3 max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            {isPro ? (
              <Crown className="size-5" />
            ) : (
              <Sparkles className="size-5" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Post a Tuition
              </h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  isPro
                    ? "bg-amber-100 text-amber-800"
                    : "bg-indigo-50 text-indigo-700"
                }`}
              >
                {isPro ? "PRO PLAN · UNLIMITED" : "FREE PLAN · MAX 2 POSTS"}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {checkingLimit
                ? "Checking your posting quota..."
                : isPro
                  ? "You can publish unlimited tuition posts. New posts start as pending approval."
                  : `Posts used: ${existingPostCount} / ${FREE_PLAN_LIMIT} · New posts start as pending approval.`}
            </p>
          </div>
        </div>
      </div>

      {hasReachedFreeLimit && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
          You have reached the Free Plan limit of{" "}
          <strong>2 tuition posts</strong>. Upgrade to Pro to create unlimited
          posts.
        </div>
      )}

      {errorMessage && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMessage}
        </div>
      )}

      {statusMessage && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {statusMessage}
        </div>
      )}

      <Card className="rounded-2xl border-slate-200 bg-white shadow-xs">
        <CardHeader className="space-y-1.5 border-b border-slate-100 pb-5">
          <CardTitle className="text-base font-bold text-slate-900 sm:text-lg">
            Tuition Details
          </CardTitle>
          <CardDescription className="text-xs text-slate-500 sm:text-sm">
            Fill out the details below. All new tuition posts are saved with{" "}
            <span className="font-semibold text-slate-700">
              approvalStatus: &ldquo;pending&rdquo;
            </span>
            .
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-sm font-medium text-slate-700"
              >
                Tuition Title
              </Label>
              <Input
                id="title"
                placeholder="e.g., Physics & Higher Math Tutor for HSC Batch"
                value={form.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                disabled={submitting || hasReachedFreeLimit}
                className="h-10 rounded-xl border-slate-200 focus-visible:ring-indigo-600"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="subject"
                  className="text-sm font-medium text-slate-700"
                >
                  Subject
                </Label>
                <div className="relative">
                  <BookOpen className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="subject"
                    placeholder="e.g., Mathematics, Physics, English"
                    value={form.subject}
                    onChange={(e) =>
                      handleFieldChange("subject", e.target.value)
                    }
                    disabled={submitting || hasReachedFreeLimit}
                    className="h-10 rounded-xl border-slate-200 pl-9 focus-visible:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="classLevel"
                  className="text-sm font-medium text-slate-700"
                >
                  Class Level
                </Label>
                <Input
                  id="classLevel"
                  placeholder="e.g., Class 8, SSC, HSC, O/A Level"
                  value={form.classLevel}
                  onChange={(e) =>
                    handleFieldChange("classLevel", e.target.value)
                  }
                  disabled={submitting || hasReachedFreeLimit}
                  className="h-10 rounded-xl border-slate-200 focus-visible:ring-indigo-600"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="mode"
                  className="text-sm font-medium text-slate-700"
                >
                  Teaching Mode
                </Label>
                <Select
                  value={form.mode}
                  onValueChange={(val) =>
                    handleFieldChange("mode", val as TuitionMode)
                  }
                  disabled={submitting || hasReachedFreeLimit}
                >
                  <SelectTrigger
                    id="mode"
                    className="h-10 w-full rounded-xl border-slate-200 focus:ring-indigo-600"
                  >
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="offline">
                      Offline (Home / In-person)
                    </SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-slate-700"
                >
                  Location
                </Label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="location"
                    placeholder="e.g., Nasirabad, Chattogram or Online"
                    value={form.location}
                    onChange={(e) =>
                      handleFieldChange("location", e.target.value)
                    }
                    disabled={submitting || hasReachedFreeLimit}
                    className="h-10 rounded-xl border-slate-200 pl-9 focus-visible:ring-indigo-600"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="monthlyFee"
                  className="text-sm font-medium text-slate-700"
                >
                  Monthly Fee (BDT)
                </Label>
                <div className="relative">
                  <Wallet className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="monthlyFee"
                    type="number"
                    min={1}
                    placeholder="e.g., 6000"
                    value={form.monthlyFee}
                    onChange={(e) =>
                      handleFieldChange("monthlyFee", e.target.value)
                    }
                    disabled={submitting || hasReachedFreeLimit}
                    className="h-10 rounded-xl border-slate-200 pl-9 focus-visible:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="daysPerWeek"
                  className="text-sm font-medium text-slate-700"
                >
                  Days / Week
                </Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="daysPerWeek"
                    type="number"
                    min={1}
                    max={7}
                    placeholder="e.g., 3 or 4"
                    value={form.daysPerWeek}
                    onChange={(e) =>
                      handleFieldChange("daysPerWeek", e.target.value)
                    }
                    disabled={submitting || hasReachedFreeLimit}
                    className="h-10 rounded-xl border-slate-200 pl-9 focus-visible:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="bannerImage"
                className="text-sm font-medium text-slate-700"
              >
                Banner Image URL (Optional)
              </Label>
              <div className="relative">
                <ImageIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="bannerImage"
                  type="url"
                  placeholder="https://example.com/banner.jpg (leave blank for default)"
                  value={form.bannerImage}
                  onChange={(e) =>
                    handleFieldChange("bannerImage", e.target.value)
                  }
                  disabled={submitting || hasReachedFreeLimit}
                  className="h-10 rounded-xl border-slate-200 pl-9 focus-visible:ring-indigo-600"
                />
              </div>
              {previewUrl && (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <Image
                    src={previewUrl}
                    alt="Tuition banner preview"
                    className="h-44 w-full object-cover"
                    width={120}
                    height={80}
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
              >
                <FileText className="size-4 text-slate-400" />
                Description
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Share your teaching approach, syllabus coverage, schedule flexibility, and expectations..."
                value={form.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                disabled={submitting || hasReachedFreeLimit}
                className="rounded-xl border-slate-200 focus-visible:ring-indigo-600"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm(initialForm)
                  setErrorMessage("")
                  setStatusMessage("")
                }}
                disabled={submitting}
                className="rounded-xl border-slate-200 text-slate-700"
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={submitting || hasReachedFreeLimit}
                className="gap-2 rounded-xl bg-indigo-600 px-5 text-white hover:bg-indigo-700"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {submitting ? "Submitting..." : "Submit Tuition Post"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
