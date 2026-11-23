"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import {
  getTutorApplications,
  updateApplicationStatus,
  type StudentApplication,
} from "@/lib/api/applications"
import {
  BadgeCheck,
  Check,
  Clock,
  FileText,
  Loader2,
  Search,
  Users,
  X,
} from "lucide-react"

type ApplicationFilter = "all" | "pending" | "accepted" | "rejected"

const formatDate = (date?: string) => {
  if (!date) return "—"
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return "—"
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const getApplicationStatus = (application: StudentApplication) =>
  (application.status || "pending").toLowerCase()

const getTuitionTitle = (application: StudentApplication) =>
  application.tuitionTitle ||
  application.tutionTitle ||
  application.title ||
  "Tuition Post"

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "accepted"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : status === "rejected"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-amber-50 text-amber-700 ring-amber-200"

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${styles}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {status}
    </span>
  )
}

function ApplicationActions({
  application,
  updating,
  onChangeStatus,
}: {
  application: StudentApplication
  updating: boolean
  onChangeStatus: (
    application: StudentApplication,
    status: "accepted" | "rejected"
  ) => void
}) {
  if (getApplicationStatus(application) !== "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Clock className="size-3.5" />
        Reviewed
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        size="sm"
        disabled={updating}
        onClick={() => onChangeStatus(application, "accepted")}
        className="h-8 gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs text-white shadow-xs hover:bg-emerald-700"
      >
        {updating ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Check className="size-3.5" />
        )}
        Accept
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={updating}
        onClick={() => onChangeStatus(application, "rejected")}
        className="h-8 gap-1.5 rounded-lg border-slate-200 px-3 text-xs text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
      >
        <X className="size-3.5" />
        Decline
      </Button>
    </div>
  )
}

function ApplicationCard({
  application,
  updating,
  onChangeStatus,
}: {
  application: StudentApplication
  updating: boolean
  onChangeStatus: (
    application: StudentApplication,
    status: "accepted" | "rejected"
  ) => void
}) {
  const status = getApplicationStatus(application)

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-slate-900">
            {application.studentName || "Student"}
          </h2>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {application.studentEmail}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mt-4 space-y-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            Tuition
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">
            {getTuitionTitle(application)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-slate-400 uppercase">
            Preferred schedule
          </p>
          <p className="mt-0.5 text-sm text-slate-700">
            {application.preferredSchedule || "Schedule not provided"}
          </p>
        </div>
        {application.learningNote && (
          <p className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
            {application.learningNote}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-xs text-slate-500">
            Applied {formatDate(application.createdAt || application.appliedAt)}
          </span>
          <ApplicationActions
            application={application}
            updating={updating}
            onChangeStatus={onChangeStatus}
          />
        </div>
      </div>
    </article>
  )
}

export default function TutorApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<ApplicationFilter>("all")

  useEffect(() => {
    let active = true
    const loadApplications = async () => {
      try {
        const result = await getTutorApplications()
        if (active) {
          setApplications(result)
          setErrorMessage("")
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load applicant requests."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadApplications()
    return () => {
      active = false
    }
  }, [])

  const counts = useMemo(
    () => ({
      total: applications.length,
      pending: applications.filter(
        (application) => getApplicationStatus(application) === "pending"
      ).length,
      accepted: applications.filter(
        (application) => getApplicationStatus(application) === "accepted"
      ).length,
      rejected: applications.filter(
        (application) => getApplicationStatus(application) === "rejected"
      ).length,
    }),
    [applications]
  )

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase()
    return applications.filter((application) => {
      if (filter !== "all" && getApplicationStatus(application) !== filter) {
        return false
      }
      if (!query) return true

      return [
        application.studentName,
        application.studentEmail,
        application.phone,
        getTuitionTitle(application),
        application.preferredSchedule,
        application.learningNote,
      ].some((value) => value?.toLowerCase().includes(query))
    })
  }, [applications, filter, search])

  const handleStatusChange = async (
    application: StudentApplication,
    status: "accepted" | "rejected"
  ) => {
    const id = application._id || application.id
    if (!id) {
      setErrorMessage("This application has no ID and cannot be updated.")
      return
    }

    setUpdatingId(id)
    setErrorMessage("")
    try {
      await updateApplicationStatus(id, status)
      setApplications((current) =>
        current.map((item) =>
          (item._id || item.id) === id ? { ...item, status } : item
        )
      )
      toast.add({
        type: "success",
        title: `Application ${status}`,
        description: `The student's application was ${status}.`,
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not update application status."
      setErrorMessage(message)
      toast.add({
        type: "error",
        title: "Status update failed",
        description: message,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filters: { value: ApplicationFilter; label: string; count: number }[] = [
    { value: "all", label: "All applicants", count: counts.total },
    { value: "pending", label: "Needs review", count: counts.pending },
    { value: "accepted", label: "Accepted", count: counts.accepted },
    { value: "rejected", label: "Declined", count: counts.rejected },
  ]

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-4 sm:p-7">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            <Users className="size-3.5" />
            Tutor workspace
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Applicants
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Review student requests and manage your tuition applications.
          </p>
        </div>
        {!loading && (
          <p className="text-sm text-slate-500">
            {counts.pending > 0 ? (
              <>
                <span className="font-semibold text-amber-700">
                  {counts.pending} waiting
                </span>{" "}
                for your review
              </>
            ) : (
              "You’re all caught up"
            )}
          </p>
        )}
      </header>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {errorMessage}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 shadow-xs">
          <Loader2 className="mr-2 size-4 animate-spin text-indigo-600" />
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <FileText className="size-5" />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900">
            No applications yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Student applications for your tuition posts will appear here. You
            can review each request and respond when it arrives.
          </p>
        </div>
      ) : (
        <>
          <section
            aria-label="Application overview"
            className="grid grid-cols-2 gap-3 lg:grid-cols-4"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Total requests
                </span>
                <span className="flex size-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <FileText className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                {counts.total}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Across all your posts
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/60 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-amber-800">
                  Needs review
                </span>
                <span className="flex size-8 items-center justify-center rounded-xl bg-white text-amber-600">
                  <Clock className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-amber-950">
                {counts.pending}
              </p>
              <p className="mt-0.5 text-xs text-amber-800/70">
                Awaiting your response
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-800">
                  Accepted
                </span>
                <span className="flex size-8 items-center justify-center rounded-xl bg-white text-emerald-600">
                  <BadgeCheck className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-950">
                {counts.accepted}
              </p>
              <p className="mt-0.5 text-xs text-emerald-800/70">
                Students you’ve accepted
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Declined
                </span>
                <span className="flex size-8 items-center justify-center rounded-xl bg-white text-slate-500">
                  <X className="size-4" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
                {counts.rejected}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Requests you declined
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Application inbox
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Search requests or filter them by status.
                  </p>
                </div>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search students or tuitions"
                    aria-label="Search applications"
                    className="h-10 rounded-xl border-slate-200 pl-9 text-sm focus-visible:ring-indigo-600"
                  />
                </div>
              </div>

              <div
                role="group"
                aria-label="Filter applications by status"
                className="flex gap-2 overflow-x-auto pb-0.5"
              >
                {filters.map((item) => {
                  const selected = filter === item.value
                  return (
                    <button
                      key={item.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setFilter(item.value)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        selected
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {item.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                          selected
                            ? "bg-white/20 text-white"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {filteredApplications.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm font-semibold text-slate-800">
                  No matching applications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try another search term or status filter.
                </p>
                {(search || filter !== "all") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearch("")
                      setFilter("all")
                    }}
                    className="mt-4 rounded-lg"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-3 p-3 sm:p-4 md:grid-cols-2">
                  {filteredApplications.map((application, index) => {
                    const id = application._id || application.id || `${index}`
                    return (
                      <ApplicationCard
                        key={id}
                        application={application}
                        updating={updatingId === id}
                        onChangeStatus={handleStatusChange}
                      />
                    )
                  })}
                </div>

                <footer className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:px-5">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredApplications.length}
                  </span>{" "}
                  of {applications.length} applications
                </footer>
              </>
            )}
          </section>
        </>
      )}
    </main>
  )
}
