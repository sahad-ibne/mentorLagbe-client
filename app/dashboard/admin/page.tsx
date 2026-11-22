"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { StatCard } from "@/app/components/overview/stat-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"
import {
  getAdminPayments,
  getAdminTuitions,
  type AdminPayment,
  type AdminTuition,
} from "@/lib/api/admin"
import {
  ArrowRight,
  CircleDollarSign,
  Clock3,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react"

function getPaymentAmount(payment: AdminPayment) {
  const amount = Number(payment.amount ?? payment.amountTotal ?? 0)
  return payment.amountTotal !== undefined ? amount / 100 : amount
}

function formatRevenue(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency.toUpperCase()} ${amount.toLocaleString()}`
  }
}

export default function AdminDashboardPage() {
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalTutors, setTotalTutors] = useState(0)
  const [tuitions, setTuitions] = useState<AdminTuition[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let active = true

    const loadOverview = async () => {
      setLoading(true)
      setErrorMessage("")

      try {
        const [usersResult, tutorsResult, allTuitions, allPayments] =
          await Promise.all([
            authClient.admin.listUsers({ query: { limit: 1 } }),
            authClient.admin.listUsers({
              query: {
                limit: 1,
                filterField: "role",
                filterValue: "tutor",
                filterOperator: "eq",
              },
            }),
            getAdminTuitions(),
            getAdminPayments(),
          ])

        if (usersResult.error) throw new Error(usersResult.error.message)
        if (tutorsResult.error) throw new Error(tutorsResult.error.message)
        if (!usersResult.data || !tutorsResult.data) {
          throw new Error("Could not load user statistics.")
        }

        if (active) {
          setTotalUsers(usersResult.data.total)
          setTotalTutors(tutorsResult.data.total)
          setTuitions(allTuitions)
          setPayments(allPayments)
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load admin statistics."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadOverview()
    return () => {
      active = false
    }
  }, [])

  const pendingTuitions = tuitions.filter(
    (tuition) => (tuition.approvalStatus || "pending").toLowerCase() === "pending"
  ).length
  const approvedTuitions = tuitions.filter(
    (tuition) => (tuition.approvalStatus || "").toLowerCase() === "approved"
  ).length
  const revenue = payments.reduce(
    (total, payment) => total + getPaymentAmount(payment),
    0
  )
  const currency = payments.find((payment) => payment.currency)?.currency || "USD"

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-600 via-indigo-600 to-slate-900 p-6 text-white shadow-sm sm:flex-row sm:items-center">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-indigo-100">
            <ShieldCheck className="size-3.5" />
            Admin Dashboard
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Platform overview
          </h1>
          <p className="max-w-xl text-xs leading-5 text-indigo-100/90 sm:text-sm">
            Manage members, review tutor listings, and monitor Stripe payments.
          </p>
        </div>
        <Link href="/dashboard/admin/tuitions">
          <Button className="gap-1.5 rounded-xl bg-white text-xs font-semibold text-indigo-700 hover:bg-indigo-50 sm:text-sm">
            Review Tuitions
            <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {errorMessage}
        </p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex h-32 items-center justify-center rounded-2xl border border-slate-200 bg-white"
            >
              <Loader2 className="size-5 animate-spin text-indigo-600" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Users"
            value={totalUsers}
            subtitle="Registered platform accounts"
            badgeText="Members"
            icon={Users}
            accent="indigo"
          />
          <StatCard
            title="Total Tutors"
            value={totalTutors}
            subtitle="Accounts with tutor role"
            badgeText="Tutors"
            icon={GraduationCap}
            accent="violet"
          />
          <StatCard
            title="Pending vs Approved Tuitions"
            value={`${pendingTuitions} / ${approvedTuitions}`}
            subtitle="Pending / approved listings"
            badgeText="Review"
            icon={Clock3}
            accent="amber"
          />
          <StatCard
            title="Total Stripe Revenue"
            value={formatRevenue(revenue, currency)}
            subtitle={`${payments.length} recorded payments`}
            badgeText="Revenue"
            icon={CircleDollarSign}
            accent="emerald"
          />
        </div>
      )}

      <Card className="rounded-2xl border-slate-200 bg-white shadow-2xs">
        <CardHeader>
          <CardTitle className="text-base font-bold text-slate-900">
            Admin tools
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            {
              title: "Manage users",
              description: "Review accounts and assign student, tutor, or admin roles.",
              href: "/dashboard/admin/users",
            },
            {
              title: "Approve tuitions",
              description: "Approve or reject new tutor listings.",
              href: "/dashboard/admin/tuitions",
            },
            {
              title: "View transactions",
              description: "Check subscription plans and payment records.",
              href: "/dashboard/admin/transactions",
            },
          ].map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="rounded-xl border border-slate-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40"
            >
              <p className="text-sm font-semibold text-slate-900">
                {tool.title}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {tool.description}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                Open <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
