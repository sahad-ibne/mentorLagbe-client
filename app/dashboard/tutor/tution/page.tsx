"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  Check,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Power,
  Trash2,
  Wallet,
  X,
} from "lucide-react"
import { useSession } from "@/lib/auth-client"
import {
  deleteTution,
  getMyTuitions,
  updateTution,
  type TuitionRecord,
} from "@/lib/api/tutions"
import { toast } from "@/components/ui/toast"

type TuitionMode = "online" | "offline" | "hybrid"

interface EditFormState {
  title: string
  subject: string
  classLevel: string
  mode: TuitionMode
  location: string
  monthlyFee: string
  daysPerWeek: string
  description: string
}

const getTuitionId = (item: TuitionRecord) => item._id || item.id || ""

const getIsActive = (item: TuitionRecord) => {
  if (typeof item.isActive === "boolean") return item.isActive
  if (item.status) return item.status.toLowerCase() === "active"
  return true
}

const getApprovalStatus = (
  item: TuitionRecord
): "pending" | "approved" | "rejected" => {
  const raw = (item.approvalStatus || "pending").toLowerCase()
  if (raw === "approved" || raw === "rejected") return raw
  return "pending"
}

export default function ManageTuitionPage() {
  const { data: session, isPending: sessionPending } = useSession()
  const user = session?.user as
    { name?: string | null; email?: string | null } | undefined

  const [tuitions, setTuitions] = useState<TuitionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditFormState | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TuitionRecord | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState<string>("")

  useEffect(() => {
    if (sessionPending || !user?.email) return

    let active = true
    const fetchTuitions = async () => {
      try {
        const list = await getMyTuitions()
        if (active) {
          setTuitions(list)
          setErrorMsg("")
        }
      } catch {
        if (active) setErrorMsg("Could not load your tuitions right now.")
      } finally {
        if (active) setLoading(false)
      }
    }

    void fetchTuitions()
    return () => {
      active = false
    }
  }, [sessionPending, user?.email])

  const startEditing = (item: TuitionRecord) => {
    const id = getTuitionId(item)
    if (!id) {
      setErrorMsg("This tuition cannot be edited because it has no ID.")
      return
    }
    setErrorMsg("")
    setFeedback("")
    setEditingId(id)
    setEditForm({
      title: item.title || "",
      subject: item.subject || "",
      classLevel: item.classLevel || "",
      mode: (item.mode || "offline") as TuitionMode,
      location: item.location || "",
      monthlyFee: String(item.monthlyFee ?? ""),
      daysPerWeek: String(item.daysPerWeek ?? ""),
      description: item.description || "",
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleSaveEdit = async (id: string) => {
    if (!editForm) return
    setErrorMsg("")
    setFeedback("")

    const fee = Number(editForm.monthlyFee)
    const days = Number(editForm.daysPerWeek)

    if (editForm.title.trim().length < 4) {
      setErrorMsg("Title must be at least 4 characters.")
      return
    }
    if (!Number.isFinite(fee) || fee <= 0) {
      setErrorMsg("Monthly fee must be greater than 0.")
      return
    }
    if (!Number.isInteger(days) || days < 1 || days > 7) {
      setErrorMsg("Days per week must be between 1 and 7.")
      return
    }

    setSavingId(id)
    try {
      const updatedFields = {
        title: editForm.title.trim(),
        subject: editForm.subject.trim(),
        classLevel: editForm.classLevel.trim(),
        mode: editForm.mode,
        location: editForm.location.trim(),
        monthlyFee: fee,
        daysPerWeek: days,
        description: editForm.description.trim(),
      }

      const res = await updateTution(id, updatedFields)
      if (res?.error || res?.success === false) {
        throw new Error(res?.error || res?.message || "Update failed.")
      }

      setTuitions((prev) =>
        prev.map((item) =>
          getTuitionId(item) === id ? { ...item, ...updatedFields } : item
        )
      )
      setEditingId(null)
      setEditForm(null)
      setFeedback("Tuition updated successfully.")
      toast.add({
        type: "success",
        title: "Tuition updated",
        description: "Your tuition changes have been saved.",
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update tuition."
      setErrorMsg(message)
      toast.add({
        type: "error",
        title: "Update failed",
        description: message,
      })
    } finally {
      setSavingId(null)
    }
  }

  const handleToggleStatus = async (item: TuitionRecord) => {
    const id = getTuitionId(item)
    if (!id) {
      setErrorMsg("This tuition cannot be updated because it has no ID.")
      return
    }
    const nextActive = !getIsActive(item)
    const nextStatus = nextActive ? "active" : "closed"

    setErrorMsg("")
    setFeedback("")
    setTogglingId(id)
    try {
      const res = await updateTution(id, {
        isActive: nextActive,
        status: nextStatus,
      })
      if (res?.error || res?.success === false) {
        throw new Error(res?.error || res?.message || "Status update failed.")
      }

      setTuitions((prev) =>
        prev.map((t) =>
          getTuitionId(t) === id
            ? { ...t, isActive: nextActive, status: nextStatus }
            : t
        )
      )
      setFeedback(`Tuition marked as ${nextStatus}.`)
      toast.add({
        type: "success",
        title: "Status updated",
        description: `Tuition marked as ${nextStatus}.`,
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not toggle status."
      setErrorMsg(message)
      toast.add({
        type: "error",
        title: "Status update failed",
        description: message,
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!id) {
      setErrorMsg("This tuition cannot be deleted because it has no ID.")
      return
    }
    setErrorMsg("")
    setFeedback("")
    setDeletingId(id)
    try {
      const res = await deleteTution(id)
      if (res?.error || res?.success === false) {
        throw new Error(res?.error || res?.message || "Delete failed.")
      }

      setTuitions((prev) => prev.filter((t) => getTuitionId(t) !== id))
      setFeedback("Tuition post deleted.")
      setDeleteTarget(null)
      toast.add({
        type: "success",
        title: "Tuition deleted",
        description: "The tuition post was deleted successfully.",
      })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not delete tuition."
      setErrorMsg(message)
      toast.add({
        type: "error",
        title: "Delete failed",
        description: message,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getApprovalBadge = (status: "pending" | "approved" | "rejected") => {
    if (status === "approved") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    }
    if (status === "rejected") {
      return "bg-rose-50 text-rose-700 border-rose-200"
    }
    return "bg-amber-50 text-amber-800 border-amber-200"
  }

  const targetId = deleteTarget ? getTuitionId(deleteTarget) : ""

  return (
    <div className="mx-auto mt-2 max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-xs">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            Manage Tuitions
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            View approval status, edit details, toggle Active/Closed, or delete
            your tuition posts.
          </p>
        </div>

        <Link href="/dashboard/tutor/tution/new">
          <Button className="gap-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus className="size-4" />
            Post Tuition
          </Button>
        </Link>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          {feedback}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {errorMsg}
        </div>
      )}

      {sessionPending || (user?.email && loading) ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : !user?.email ? (
        <Card className="rounded-2xl border-slate-200 bg-white text-center shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              Sign in to manage tuitions
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 sm:text-sm">
              Your tuition posts are only available to your signed-in account.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : tuitions.length === 0 ? (
        <Card className="rounded-2xl border-slate-200 bg-white text-center shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-bold text-slate-900">
              No tuitions created yet
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 sm:text-sm">
              Create your first tuition post to start receiving student
              applications.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <Link href="/dashboard/tutor/tution/new">
              <Button className="gap-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                <Plus className="size-4" />
                Post a Tuition
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tuitions.map((item, idx) => {
            const recordId = getTuitionId(item)
            const id = recordId || `missing-id-${idx}`
            const approval = getApprovalStatus(item)
            const active = getIsActive(item)
            const isEditing =
              Boolean(recordId) && editingId === id && editForm !== null

            return (
              <Card
                key={id}
                className="rounded-2xl border-slate-200 bg-white shadow-xs"
              >
                <CardContent className="p-5">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <h2 className="text-sm font-bold text-slate-900">
                          Edit Tuition Details
                        </h2>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={cancelEditing}
                          className="h-8 gap-1 text-slate-500"
                        >
                          <X className="size-4" />
                          Cancel
                        </Button>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">
                          Title
                        </Label>
                        <Input
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm({ ...editForm, title: e.target.value })
                          }
                          className="h-9 rounded-xl border-slate-200"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700">
                            Subject
                          </Label>
                          <Input
                            value={editForm.subject}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                subject: e.target.value,
                              })
                            }
                            className="h-9 rounded-xl border-slate-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700">
                            Class Level
                          </Label>
                          <Input
                            value={editForm.classLevel}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                classLevel: e.target.value,
                              })
                            }
                            className="h-9 rounded-xl border-slate-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700">
                            Mode
                          </Label>
                          <Select
                            value={editForm.mode}
                            onValueChange={(val) =>
                              setEditForm({
                                ...editForm,
                                mode: val as TuitionMode,
                              })
                            }
                          >
                            <SelectTrigger className="h-9 w-full rounded-xl border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="offline">Offline</SelectItem>
                              <SelectItem value="online">Online</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700">
                            Location
                          </Label>
                          <Input
                            value={editForm.location}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                location: e.target.value,
                              })
                            }
                            className="h-9 rounded-xl border-slate-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700">
                            Monthly Fee (BDT)
                          </Label>
                          <Input
                            type="number"
                            value={editForm.monthlyFee}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                monthlyFee: e.target.value,
                              })
                            }
                            className="h-9 rounded-xl border-slate-200"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-slate-700">
                            Days / Week
                          </Label>
                          <Input
                            type="number"
                            min={1}
                            max={7}
                            value={editForm.daysPerWeek}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                daysPerWeek: e.target.value,
                              })
                            }
                            className="h-9 rounded-xl border-slate-200"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-slate-700">
                          Description
                        </Label>
                        <Textarea
                          rows={3}
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className="rounded-xl border-slate-200"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={cancelEditing}
                          disabled={savingId === id}
                          className="rounded-xl"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={savingId === id}
                          onClick={() => handleSaveEdit(id)}
                          className="gap-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          {savingId === id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Check className="size-3.5" />
                          )}
                          {savingId === id ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="min-w-0 flex-1 space-y-2.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">
                            {item.title}
                          </h2>
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${getApprovalBadge(
                              approval
                            )}`}
                          >
                            {approval}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              active
                                ? "bg-indigo-50 text-indigo-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {active ? "Active" : "Closed"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <BookOpen className="size-3.5 text-indigo-600" />
                            {item.subject} · {item.classLevel}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3.5 text-slate-400" />
                            {item.location} ({item.mode})
                          </span>
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                            <Wallet className="size-3.5 text-indigo-600" />৳
                            {Number(item.monthlyFee || 0).toLocaleString()}/mo
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="size-3.5 text-slate-400" />
                            {item.daysPerWeek} days/week
                          </span>
                        </div>

                        {item.description && (
                          <p className="line-clamp-2 text-xs leading-5 text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* CRUD Action Buttons */}
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!recordId || togglingId === id}
                          onClick={() => handleToggleStatus(item)}
                          className="gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          {togglingId === id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Power className="size-3.5 text-indigo-600" />
                          )}
                          {active ? "Close" : "Activate"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!recordId}
                          onClick={() => startEditing(item)}
                          className="gap-1.5 rounded-xl border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600"
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!recordId || deletingId === id}
                          onClick={() => setDeleteTarget(item)}
                          className="gap-1.5 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          {deletingId === id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                          {deletingId === id ? "Deleting..." : "Delete"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deletingId) {
            setDeleteTarget(null)
          }
        }}
      >
        <DialogContent className="rounded-2xl border-slate-200 bg-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Delete tuition post?
            </DialogTitle>
            <DialogDescription className="text-xs leading-5 text-slate-500 sm:text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-800">
                &ldquo;{deleteTarget?.title}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(deletingId)}
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border-slate-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!targetId || deletingId === targetId}
              onClick={() => handleDelete(targetId)}
              className="gap-1.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              {deletingId === targetId ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              {deletingId === targetId ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
