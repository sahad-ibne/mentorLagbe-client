"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { StatCard } from "@/app/components/overview/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "@/lib/auth-client"
import { authFetch } from "@/lib/api/auth-fetch"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Crown,
  Loader2,
  MapPin,
  PlusCircle,
  Sparkles,
  Users,
} from "lucide-react"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000"

interface TutorTuition {
  _id?: string
  id?: string
  title?: string
  subject?: string
  classLevel?: string
  mode?: string
  location?: string
  monthlyFee?: number
  approvalStatus?: string
  status?: string
  tutorEmail?: string
  email?: string
}

const ApprovalBadge = ({ status }: { status?: string }) => {
  const normalized = (status || "pending").toLowerCase()

  if (normalized === "approved") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
        Approved
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

export default function TutorDashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as
    | {
        name?: string | null
        plan?: string | null
      }
    | undefined

  const isPro = (user?.plan || "free").toLowerCase() === "pro"

  const [tuitions, setTuitions] = useState<TutorTuition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const loadTutorTuitions = async () => {
      setLoading(true)
      try {
        const res = await authFetch(`${API_BASE}/tutions/mine`, {
          cache: "no-store",
        })
        if (!res.ok) {
          throw new Error("Failed to load tuitions")
        }

        const data = await res.json()
        const mine: TutorTuition[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.tutions)
            ? data.tutions
            : []

        if (active) {
          setTuitions(mine)
        }
      } catch {
        if (active) {
          setTuitions([])
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadTutorTuitions()
    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const totalPosted = tuitions.length
    const approvedCount = tuitions.filter(
      (t) => (t.approvalStatus || "").toLowerCase() === "approved"
    ).length
    const pendingCount = tuitions.filter(
      (t) => (t.approvalStatus || "pending").toLowerCase() === "pending"
    ).length
    const currentPlan = isPro ? "Pro" : "Free"

    return {
      totalPosted,
      approvedCount,
      pendingCount,
      currentPlan,
    }
  }, [tuitions, isPro])

  const recentTuitions = tuitions.slice(0, 4)

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-7">
      {/* Welcome Banner */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-indigo-600 to-slate-900 p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-indigo-100 backdrop-blur-xs">
            <Sparkles className="size-3.5" />
            Tutor Dashboard
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </h1>
          <p className="max-w-xl text-xs leading-5 text-indigo-100/90 sm:text-sm">
            Manage your tuition listings, track approval status, and review
            student applications from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/dashboard/tutor/tution/new">
            <Button className="gap-1.5 rounded-xl bg-white text-xs font-semibold text-indigo-700 hover:bg-indigo-50 sm:text-sm">
              <PlusCircle className="size-4" />
              Post Tuition
            </Button>
          </Link>
          <Link href="/dashboard/tutor/applications">
            <Button
              variant="outline"
              className="gap-1.5 rounded-xl border-white/25 bg-white/10 text-xs font-semibold text-white hover:bg-white/20 hover:text-white sm:text-sm"
            >
              <Users className="size-4" />
              Applicants
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
            title="Posted Tuitions"
            value={stats.totalPosted}
            subtitle={isPro ? "Unlimited quota active" : "Free limit: up to 2"}
            badgeText="Listings"
            icon={BookOpen}
            accent="indigo"
          />

          <StatCard
            title="Approved Tuitions"
            value={stats.approvedCount}
            subtitle="Live for students"
            badgeText="Active"
            icon={CheckCircle2}
            accent="emerald"
          />

          <StatCard
            title="Pending Review"
            value={stats.pendingCount}
            subtitle="Awaiting admin approval"
            badgeText="Pending"
            icon={Clock}
            accent="amber"
          />

          <StatCard
            title="Current Plan"
            value={stats.currentPlan}
            subtitle={
              isPro
                ? "Unlimited tuition posts unlocked"
                : `${Math.min(stats.totalPosted, 2)} / 2 free posts used`
            }
            badgeText={isPro ? "Pro Member" : "Free Tier"}
            icon={Crown}
            accent="violet"
          />
        </div>
      )}

      {/* Recent Tuitions & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl border-slate-200 bg-white shadow-2xs lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Recent Tuition Posts
              </CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">
                Your latest listings and approval status
              </p>
            </div>
            <Link
              href="/dashboard/tutor/tution"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              My Tuitions
              <ArrowRight className="size-3.5" />
            </Link>
          </CardHeader>

          <CardContent>
            {recentTuitions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center">
                <BookOpen className="mx-auto size-6 text-slate-400" />
                <p className="mt-2 text-sm font-semibold text-slate-800">
                  No tuition posts yet
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Create your first tuition listing to start receiving student
                  applications.
                </p>
                <Link
                  href="/dashboard/tutor/tution/new"
                  className="mt-4 inline-block"
                >
                  <Button
                    size="sm"
                    className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Post a Tuition
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTuitions.map((item, idx) => (
                  <div
                    key={item._id || item.id || idx}
                    className="flex items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {item.title || "Untitled Tuition"}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span>{item.subject || "General"}</span>
                        {item.classLevel && <span>• {item.classLevel}</span>}
                        {item.location && (
                          <span className="inline-flex items-center gap-0.5">
                            • <MapPin className="size-3" /> {item.location}
                          </span>
                        )}
                        <span>
                          • ৳{Number(item.monthlyFee || 0).toLocaleString()}/mo
                        </span>
                      </div>
                    </div>
                    <ApprovalBadge status={item.approvalStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-200 bg-white shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              Tutor Shortcuts & Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-900">
                  Subscription Plan
                </span>
                <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                  {stats.currentPlan}
                </span>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-600">
                {isPro
                  ? "You have Pro access with unlimited tuition posts."
                  : "Free plan lets you post up to 2 tuitions. Upgrade anytime for unlimited listings."}
              </p>
            </div>

            <div className="space-y-2">
              <Link href="/dashboard/tutor/tution/new" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
                >
                  Create New Tuition Post
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
              <Link href="/dashboard/tutor/applications" className="block">
                <Button
                  variant="outline"
                  className="w-full justify-between rounded-xl border-slate-200 text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700"
                >
                  Review Student Applications
                  <ArrowRight className="size-3.5" />
                </Button>
              </Link>
              {!isPro && (
                <Link href="/pricing" className="block">
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-xl border-indigo-200 bg-indigo-50/40 text-xs font-semibold text-indigo-700 hover:bg-indigo-50"
                  >
                    Upgrade to Pro Plan
                    <ArrowRight className="size-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
