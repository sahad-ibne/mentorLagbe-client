import React from "react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Mail,
  MapPin,
  UserCheck,
  Wallet,
} from "lucide-react"
import { getTutionById } from "@/lib/api/tutions"
import { ApplyTuitionButton } from "@/app/components/tuitions/apply-tuition-button"

export const dynamic = "force-dynamic"

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"

const TutionDetailesPage = async ({
  params,
}: {
  params: Promise<{ id: string }>
}) => {
  const { id } = await params
  const tuition = await getTutionById(id)

  if (!tuition) {
    notFound()
  }

  const tutorInitial = (tuition.tutorName || "T").charAt(0).toUpperCase()
  const isActive =
    typeof tuition.isActive === "boolean"
      ? tuition.isActive
      : (tuition.status || "active").toLowerCase() !== "closed"

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <Link
          href="/browse-tutions"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-indigo-600"
        >
          <ArrowLeft className="size-4" />
          Back to Browse Tuitions
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="overflow-hidden rounded-2xl border-slate-200 bg-white shadow-xs">
            <div className="relative h-56 w-full bg-slate-100 sm:h-72">
              <Image
                src={tuition.bannerImage?.trim() || DEFAULT_BANNER}
                alt={tuition.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover"
              />
              <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-indigo-700 capitalize shadow-xs backdrop-blur-xs">
                  {tuition.mode}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold shadow-xs ${
                    isActive
                      ? "bg-emerald-500/95 text-white"
                      : "bg-slate-700/90 text-white"
                  }`}
                >
                  {isActive ? "Active" : "Closed"}
                </span>
              </div>
            </div>

            <CardHeader className="space-y-3 pb-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-indigo-700">
                  <BookOpen className="size-3.5" />
                  {tuition.subject}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700">
                  <GraduationCap className="size-3.5" />
                  {tuition.classLevel}
                </span>
              </div>

              <CardTitle className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {tuition.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-3">
                <div className="flex items-start gap-2.5">
                  <div className="rounded-xl bg-indigo-100/70 p-2 text-indigo-600">
                    <Wallet className="size-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      Monthly Fee
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      ৳{Number(tuition.monthlyFee || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="rounded-xl bg-indigo-100/70 p-2 text-indigo-600">
                    <CalendarDays className="size-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-medium text-slate-500">
                      Schedule
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {tuition.daysPerWeek} days / week
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="rounded-xl bg-indigo-100/70 p-2 text-indigo-600">
                    <MapPin className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-slate-500">
                      Location
                    </p>
                    <p className="truncate text-sm font-bold text-slate-900">
                      {tuition.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Tuition Overview & Requirements
                </h2>
                <p className="text-sm leading-6 whitespace-pre-line text-slate-600">
                  {tuition.description ||
                    "No additional description provided for this tuition post."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-2xl border-slate-200 bg-white shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Tutor Information
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-base font-bold text-white">
                  {tutorInitial}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-sm font-bold text-slate-900">
                      {tuition.tutorName || "MentorLagbe Tutor"}
                    </h3>
                    <BadgeCheck className="size-4 shrink-0 text-indigo-600" />
                  </div>
                  <p className="text-xs text-slate-500">
                    Verified Subject Instructor
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs text-slate-600">
                {tuition.tutorEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="size-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{tuition.tutorEmail}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="size-3.5 shrink-0 text-slate-400" />
                  <span>
                    Teaches <strong>{tuition.subject}</strong> (
                    {tuition.classLevel})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="size-3.5 shrink-0 text-slate-400" />
                  <span className="capitalize">
                    Mode: <strong>{tuition.mode}</strong>
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <ApplyTuitionButton tuitionTitle={tuition.title} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default TutionDetailesPage
