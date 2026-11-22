"use client"

import { useEffect, useState } from "react"
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
  getAdminTuitions,
  updateAdminTuition,
  type AdminTuition,
} from "@/lib/api/admin"
import { Check, Clock3, Loader2, X } from "lucide-react"

function ApprovalBadge({ status }: { status?: string }) {
  const value = (status || "pending").toLowerCase()
  const style =
    value === "approved"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : value === "rejected"
        ? "bg-rose-50 text-rose-700 ring-rose-200"
        : "bg-amber-50 text-amber-700 ring-amber-200"

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${style}`}
    >
      {value}
    </span>
  )
}

export default function AdminTuitionsPage() {
  const [tuitions, setTuitions] = useState<AdminTuition[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let active = true

    getAdminTuitions()
      .then((result) => {
        if (!active) return
        setTuitions(result)
        setErrorMessage("")
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load tuitions."
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const changeApproval = async (
    tuition: AdminTuition,
    approvalStatus: "approved" | "rejected"
  ) => {
    const id = tuition._id || tuition.id
    if (!id) {
      setErrorMessage("This tuition has no ID and cannot be updated.")
      return
    }

    setUpdatingId(id)
    setErrorMessage("")
    try {
      await updateAdminTuition(id, approvalStatus)
      setTuitions((current) =>
        current.map((item) =>
          (item._id || item.id) === id
            ? {
                ...item,
                approvalStatus,
              }
            : item
        )
      )
      toast.add({
        type: "success",
        title: `Tuition ${approvalStatus}`,
        description: `The listing was ${approvalStatus}.`,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update tuition."
      setErrorMessage(message)
      toast.add({
        type: "error",
        title: "Approval update failed",
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
          Tuition Approval
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review tutor listings. Only approved, active tuitions are shown to
          students.
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
          Loading tuition posts...
        </div>
      ) : tuitions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm font-semibold text-slate-900">
            No tuition posts found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            New tutor listings will appear here for review.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Tuition</TableHead>
                <TableHead>Tutor</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Review</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tuitions.map((tuition, index) => {
                const id = tuition._id || tuition.id || `${index}`
                const isUpdating = updatingId === id
                return (
                  <TableRow key={id}>
                    <TableCell className="min-w-48">
                      <p className="font-semibold text-slate-900">
                        {tuition.title || "Untitled tuition"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tuition.subject || "General"}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-44">
                      <p className="text-sm font-medium text-slate-800">
                        {tuition.tutorName || "Tutor"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {tuition.tutorEmail || "No email"}
                      </p>
                    </TableCell>
                    <TableCell className="min-w-44 text-sm text-slate-600">
                      <p>
                        {tuition.classLevel || "—"} · {tuition.mode || "—"}
                      </p>
                      <p>
                        {tuition.location || "—"} · ৳
                        {Number(tuition.monthlyFee || 0).toLocaleString()}/mo
                      </p>
                    </TableCell>
                    <TableCell>
                      <ApprovalBadge status={tuition.approvalStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            isUpdating ||
                            (tuition.approvalStatus || "").toLowerCase() ===
                              "approved"
                          }
                          onClick={() =>
                            void changeApproval(tuition, "approved")
                          }
                          className="gap-1 bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          {isUpdating ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={
                            isUpdating ||
                            (tuition.approvalStatus || "").toLowerCase() ===
                              "rejected"
                          }
                          onClick={() =>
                            void changeApproval(tuition, "rejected")
                          }
                          className="gap-1 border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          {isUpdating ? (
                            <Clock3 className="size-3.5" />
                          ) : (
                            <X className="size-3.5" />
                          )}
                          Reject
                        </Button>
                      </div>
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
