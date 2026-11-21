"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useSession } from "@/lib/auth-client"
import { getTutions, type TuitionRecord } from "@/lib/api/tutions"
import {
  cancelApplication,
  getStudentApplications,
  type StudentApplication,
} from "@/lib/api/applications"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Mail,
  Trash2,
  XCircle,
} from "lucide-react"

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "—"
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const StatusBadge = ({ status }: { status?: string }) => {
  const normalized = (status || "pending").toLowerCase()

  if (normalized === "accepted") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
        <CheckCircle2 className="size-3.5" />
        Accepted
      </span>
    )
  }

  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-200/80">
        <XCircle className="size-3.5" />
        Rejected
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200/80">
      <Clock className="size-3.5" />
      Pending
    </span>
  )
}

const MyApplicationPage = () => {
  const { data: session } = useSession()
  const studentEmail = session?.user?.email || ""

  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelingId, setCancelingId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<StudentApplication | null>(
    null
  )
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    let active = true

    const loadData = async () => {
      setLoading(true)
      setErrorMsg("")
      try {
        const list = await getStudentApplications()
        const needsFeeLookup = list.some(
          (application) =>
            typeof application.monthlyFee !== "number" ||
            !Number.isFinite(application.monthlyFee) ||
            application.monthlyFee <= 0
        )
        let tuitionList: TuitionRecord[] = []
        if (needsFeeLookup) {
          try {
            const rawTuitions: unknown = await getTutions()
            tuitionList = Array.isArray(rawTuitions)
              ? rawTuitions
              : rawTuitions &&
                  typeof rawTuitions === "object" &&
                  "tutions" in rawTuitions &&
                  Array.isArray(rawTuitions.tutions)
                ? rawTuitions.tutions
                : []
          } catch {
            tuitionList = []
          }
        }
        const hydratedList = await Promise.all(
          list.map(async (application) => {
            if (
              typeof application.monthlyFee === "number" &&
              Number.isFinite(application.monthlyFee) &&
              application.monthlyFee > 0
            ) {
              return application
            }

            const tuitionId = application.tuitionId || application.tutionId
            const applicationTitle =
              application.tuitionTitle ||
              application.tutionTitle ||
              application.title
            const tuition = tuitionList.find((item) => {
              const matchesId =
                tuitionId && (item._id === tuitionId || item.id === tuitionId)
              const matchesTitle =
                applicationTitle &&
                item.title === applicationTitle &&
                (!application.tutorEmail ||
                  item.tutorEmail === application.tutorEmail)
              return Boolean(matchesId || matchesTitle)
            })

            return tuition
              ? { ...application, monthlyFee: tuition.monthlyFee }
              : { ...application, monthlyFee: undefined }
          })
        )
        if (active) {
          setApplications(hydratedList)
        }
      } catch {
        if (active) {
          setErrorMsg("Could not load your applications.")
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [studentEmail])

  const stats = useMemo(() => {
    const total = applications.length
    const pending = applications.filter(
      (a) => (a.status || "pending").toLowerCase() === "pending"
    ).length
    const accepted = applications.filter(
      (a) => (a.status || "").toLowerCase() === "accepted"
    ).length
    const rejected = applications.filter(
      (a) => (a.status || "").toLowerCase() === "rejected"
    ).length
    return { total, pending, accepted, rejected }
  }, [applications])

  const handleCancel = async () => {
    if (!cancelTarget) return
    const app = cancelTarget
    const id = app._id || app.id
    if (!id) return

    if ((app.status || "pending").toLowerCase() !== "pending") {
      setErrorMsg("Only pending applications can be canceled.")
      return
    }

    setCancelingId(id)
    setErrorMsg("")

    try {
      await cancelApplication(id)
      setApplications((prev) =>
        prev.filter((item) => (item._id || item.id) !== id)
      )
      setCancelTarget(null)
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to cancel application."
      )
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            My Applications
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Track your tuition applications, monthly fees, and cancel pending
            requests.
          </p>
        </div>

        <Link href="/browse-tutions">
          <Button className="gap-1.5 rounded-xl bg-indigo-600 text-white shadow-xs hover:bg-indigo-700">
            Browse More Tuitions
            <ArrowUpRight className="size-4" />
          </Button>
        </Link>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <p className="text-xs font-medium text-slate-500">Total Applied</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/40 p-4 shadow-2xs">
          <p className="text-xs font-medium text-amber-700">Pending</p>
          <p className="mt-1.5 text-2xl font-bold text-amber-800">
            {stats.pending}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/40 p-4 shadow-2xs">
          <p className="text-xs font-medium text-emerald-700">Accepted</p>
          <p className="mt-1.5 text-2xl font-bold text-emerald-800">
            {stats.accepted}
          </p>
        </div>

        <div className="rounded-2xl border border-rose-200/70 bg-rose-50/40 p-4 shadow-2xs">
          <p className="text-xs font-medium text-rose-700">Rejected</p>
          <p className="mt-1.5 text-2xl font-bold text-rose-800">
            {stats.rejected}
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 text-sm text-slate-500 shadow-2xs">
          <Loader2 className="mr-2 size-4 animate-spin text-indigo-600" />
          Loading your applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex size-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText className="size-5" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900">
            No applications yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Explore active tuitions and click Apply to submit your first
            request.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <Table>
            <TableHeader className="border-b border-slate-200 bg-slate-50/90">
              <TableRow className="hover:bg-transparent">
                <TableHead className="py-3.5 pl-5 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Tuition Title
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Tutor Details
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Monthly Fee
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Applied Date
                </TableHead>
                <TableHead className="py-3.5 text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Status
                </TableHead>
                <TableHead className="py-3.5 pr-5 text-right text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-100">
              {applications.map((app, index) => {
                const id = app._id || app.id || `${index}`
                const isPending =
                  (app.status || "pending").toLowerCase() === "pending"
                const isDeleting = cancelingId === id
                const tutorInitial = (app.tutorName || "T")
                  .charAt(0)
                  .toUpperCase()
                const feeAmount =
                  typeof app.monthlyFee === "number" &&
                  Number.isFinite(app.monthlyFee)
                    ? app.monthlyFee
                    : null

                return (
                  <TableRow
                    key={id}
                    className="transition-colors hover:bg-slate-50/70"
                  >
                    <TableCell className="py-4 pl-5 align-middle">
                      <div className="max-w-xs font-semibold text-slate-900">
                        {app.tuitionTitle ||
                          app.tutionTitle ||
                          app.title ||
                          "Tuition Post"}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200/70">
                          {tutorInitial}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-800">
                            {app.tutorName || "MentorLagbe Tutor"}
                          </div>
                          {app.tutorEmail && (
                            <div className="flex items-center gap-1 truncate text-xs text-slate-500">
                              <Mail className="size-3 shrink-0 text-slate-400" />
                              <span className="truncate">{app.tutorEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-middle">
                      <span className="inline-flex items-center rounded-lg bg-indigo-50/80 px-2.5 py-1 text-sm font-bold text-indigo-700">
                        {feeAmount === null
                          ? "Not listed"
                          : `৳${feeAmount.toLocaleString()}`}
                      </span>
                      {feeAmount !== null && (
                        <span className="ml-1 text-xs text-slate-400">/mo</span>
                      )}
                    </TableCell>

                    <TableCell className="py-4 align-middle">
                      <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                        <Calendar className="size-3.5 text-slate-400" />
                        {formatDate(app.createdAt || app.appliedAt)}
                      </div>
                    </TableCell>

                    <TableCell className="py-4 align-middle">
                      <StatusBadge status={app.status} />
                    </TableCell>

                    <TableCell className="py-4 pr-5 text-right align-middle">
                      {isPending ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isDeleting}
                          onClick={() => setCancelTarget(app)}
                          className="gap-1.5 rounded-xl border-rose-200 bg-white text-xs font-semibold text-rose-600 shadow-2xs hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          Cancel
                        </Button>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Locked
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open && !cancelingId) setCancelTarget(null)
        }}
      >
        <AlertDialogContent className="rounded-2xl border-slate-200 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this application?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your application for{" "}
              <span className="font-semibold text-slate-800">
                {cancelTarget?.tuitionTitle ||
                  cancelTarget?.tutionTitle ||
                  cancelTarget?.title ||
                  "this tuition"}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={Boolean(cancelingId)}>
              Keep Application
            </AlertDialogCancel>
            <Button
              onClick={handleCancel}
              type="button"
              disabled={Boolean(cancelingId)}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {cancelingId ? "Canceling..." : "Cancel Application"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default MyApplicationPage
