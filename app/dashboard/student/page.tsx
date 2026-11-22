"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { StatCard } from "@/app/components/overview/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/lib/auth-client"
import {
  getStudentApplications,
  type StudentApplication,
} from "@/lib/api/applications"
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Clock,
  Crown,
  FileText,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react"

const StatusPill = ({ status }: { status?: string }) => {
  const normalized = (status || "pending").toLowerCase()

  if (normalized === "approved") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
        Accepted
      </span>
    )
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200/80">
        Rejected
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80">
      Pending
    </span>
  )
}

const StudentOverviewPage = () => {
  const { data: session } = useSession()
  const user = session?.user as
    | {
        name?: string | null
        email?: string | null
        plan?: string | null
      }
    | undefined

  const studentEmail = user?.email || ""

  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadApplications = async () => {
      setLoading(true)
      try {
        const list = await getStudentApplications()
        if (active) {
          setApplications(list)
        }
      } catch {
        if (active) {
          setApplications([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadApplications()
    return () => {
      active = false
    }
  }, [studentEmail])

  const stats = useMemo(() => {
    const totalApplied = applications.length
    const approvedCount = applications.filter(
      (item) => (item.status || "").toLowerCase() === "approved"
    ).length
    const pendingCount = applications.filter(
      (item) => (item.status || "pending").toLowerCase() === "pending"
    ).length

    const rawPlan = (user?.plan || "").toLowerCase()
    const currentPlan = rawPlan === "pro" ? "Pro" : "Free"

    return {
      totalApplied,
      approvedCount,
      pendingCount,
      currentPlan,
    }
  }, [applications, user?.plan])

  const recentApps = applications.slice(0, 4)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-7">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-indigo-600 to-slate-900 p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur-xs">
            <Sparkles className="size-3.5" />
            Student Dashboard
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="max-w-xl text-xs leading-5 text-indigo-100/90 sm:text-sm">
            Monitor your tuition applications, track tutor responses, and find
            the right mentor for your studies.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/browse-tutions">
            <Button className="gap-1.5 rounded-xl bg-white text-xs font-semibold text-indigo-700 hover:bg-indigo-50 sm:text-sm">
              <Search className="size-4" />
              Browse Tuitions
            </Button>
          </Link>
          <Link href="/dashboard/student/my-application">
            <Button
              variant="outline"
              className="gap-1.5 rounded-xl border-white/25 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 hover:text-white sm:text-sm"
            >
              My Applications
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Reusable Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white"
            >
              <Loader2 className="size-5 animate-spin text-indigo-600" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Applied Tuitions"
            value={stats.totalApplied}
            subtitle="All submitted requests"
            badgeText="Active Log"
            icon={BookOpenCheck}
            accent="indigo"
          />

          <StatCard
            title="Accepted Applications"
            value={stats.approvedCount}
            subtitle="Approved by tutors"
            badgeText="Confirmed"
            icon={CheckCircle2}
            accent="emerald"
          />

          <StatCard
            title="Pending Applications"
            value={stats.pendingCount}
            subtitle="Awaiting tutor review"
            badgeText="In Review"
            icon={Clock}
            accent="amber"
          />

          <StatCard
            title="Current Plan"
            value={stats.currentPlan}
            subtitle={
              stats.currentPlan === "Pro"
                ? "Priority tutor matching enabled"
                : "Standard student access"
            }
            badgeText={stats.currentPlan === "Pro" ? "Pro Member" : "Free Tier"}
            icon={Crown}
            accent="violet"
          />
        </div>
      )}

      {/* Recent Applications & Quick Guidance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-2xs lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Recent Applications
              </CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">
                Your latest tuition requests at a glance
              </p>
            </div>
            <Link
              href="/dashboard/student/my-application"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>

          <CardContent>
            {recentApps.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                <FileText className="mx-auto size-6 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  No recent applications yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Browse approved tuitions and apply to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentApps.map((app, idx) => (
                  <div
                    key={app._id || app.id || idx}
                    className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {app.tuitionTitle || app.title || "Tuition Post"}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {app.tutorName || "MentorLagbe Tutor"} • ৳
                        {Number(app.monthlyFee || 0).toLocaleString()}/mo
                      </p>
                    </div>
                    <StatusPill status={app.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Membership & Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">
                  Plan Status
                </span>
                <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {stats.currentPlan}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">
                {stats.currentPlan === "Pro"
                  ? "You are on the Pro plan with enhanced profile visibility and priority application support."
                  : "Upgrade anytime from Pricing to unlock Pro benefits and priority matching."}
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/pricing" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
                >
                  Explore Free & Pro Plans
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
              <Link href="/dashboard/student/my-application" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
                >
                  Manage Pending Requests
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StudentOverviewPage
