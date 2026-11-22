"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import {
  getTutorApplications,
  updateApplicationStatus,
  type StudentApplication,
} from "@/lib/api/applications"
import { Check, Clock, Loader2, X } from "lucide-react"

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

export default function TutorApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

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

  const handleStatusChange = async (
    application: StudentApplication,
    status: "approved" | "rejected"
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

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-5 sm:p-7">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Applicants
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review applications for your tuition posts and update their status.
        </p>
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
        <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white py-14 text-sm text-slate-500">
          <Loader2 className="mr-2 size-4 animate-spin text-indigo-600" />
          Loading applications...
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-900">
            No applications yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Applications for your tuition posts will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Tuition</TableHead>
                <TableHead>Schedule & Note</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application, index) => {
                const id = application._id || application.id || `${index}`
                const pending =
                  (application.status || "pending").toLowerCase() === "pending"
                const updating = updatingId === id

                return (
                  <TableRow key={id}>
                    <TableCell className="min-w-44">
                      <p className="font-semibold text-slate-900">
                        {application.studentName || "Student"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {application.studentEmail}
                      </p>
                      <p className="text-xs text-slate-500">
                        {application.phone}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-40 font-medium text-slate-800">
                      {application.tuitionTitle ||
                        application.tutionTitle ||
                        application.title ||
                        "Tuition Post"}
                    </TableCell>
                    <TableCell className="max-w-sm min-w-56 whitespace-normal">
                      <p className="text-sm text-slate-800">
                        {application.preferredSchedule ||
                          "Schedule not provided"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {application.learningNote || "No learning note"}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap text-slate-600">
                      {formatDate(
                        application.createdAt || application.appliedAt
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 capitalize">
                        {application.status || "pending"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {pending ? (
                        <div className="inline-flex gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={updating}
                            onClick={() =>
                              handleStatusChange(application, "approved")
                            }
                            className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
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
                            onClick={() =>
                              handleStatusChange(application, "rejected")
                            }
                            className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <X className="size-3.5" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="size-3.5" />
                          Reviewed
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
    </main>
  )
}
