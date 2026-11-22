"use client"

import { useEffect, useState } from "react"
import { authClient, useSession } from "@/lib/auth-client"
import { updateUserRole } from "@/lib/actions/users"
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
import { ChevronLeft, ChevronRight, Loader2, Users } from "lucide-react"

type UserRole = "student" | "tutor" | "admin"

type AdminUser = {
  id: string
  name: string
  email: string
  role?: string
  createdAt: Date | string
}

const PAGE_SIZE = 20

function formatDate(value: Date | string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [selectedRoles, setSelectedRoles] = useState<Record<string, UserRole>>(
    {}
  )
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let active = true

    authClient.admin
      .listUsers({
        query: { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
      })
      .then(({ data, error }) => {
        if (error) throw new Error(error.message)
        if (!data) throw new Error("Could not load users.")
        if (!active) return

        setUsers(data.users as AdminUser[])
        setTotal(data.total)
        setErrorMessage("")
        setSelectedRoles(
          Object.fromEntries(
            data.users.map((user) => [
              user.id,
              (user.role || "student") as UserRole,
            ])
          )
        )
      })
      .catch((error: unknown) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : "Could not load users."
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page])

  const saveRole = async (user: AdminUser) => {
    const role = selectedRoles[user.id]
    if (!role || role === user.role) return

    setUpdatingId(user.id)
    setErrorMessage("")
    try {
      await updateUserRole(user.id, role)

      setUsers((current) =>
        current.map((item) =>
          item.id === user.id ? { ...item, role } : item
        )
      )
      toast.add({
        type: "success",
        title: "Role updated",
        description: `${user.name || user.email} is now a ${role}.`,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update user role."
      setErrorMessage(message)
      toast.add({
        type: "error",
        title: "Role update failed",
        description: message,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-5 sm:p-7">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          User Management
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          View registered users and assign student, tutor, or admin roles.
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
          Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Users className="mx-auto size-6 text-slate-400" />
          <p className="mt-2 text-sm font-semibold text-slate-900">
            No users found
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const role = selectedRoles[user.id] || "student"
                  const isSelf = session?.user?.id === user.id
                  const isUpdating = updatingId === user.id

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="min-w-52">
                        <p className="font-semibold text-slate-900">
                          {user.name || "Unnamed user"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-slate-600">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell>
                        <select
                          aria-label={`Role for ${user.name || user.email}`}
                          value={role}
                          onChange={(event) =>
                            setSelectedRoles((current) => ({
                              ...current,
                              [user.id]: event.target.value as UserRole,
                            }))
                          }
                          className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm capitalize text-slate-700 outline-none focus:border-indigo-400"
                        >
                          <option value="student">Student</option>
                          <option value="tutor">Tutor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            isUpdating ||
                            role === user.role ||
                            (isSelf && role !== "admin")
                          }
                          onClick={() => void saveRole(user)}
                          className="min-w-20 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                        >
                          {isUpdating ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>
              Page {page + 1} of {pageCount} · {total} users
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => {
                  setLoading(true)
                  setPage((current) => Math.max(0, current - 1))
                }}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page + 1 >= pageCount}
                onClick={() => {
                  setLoading(true)
                  setPage((current) => Math.min(pageCount - 1, current + 1))
                }}
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
