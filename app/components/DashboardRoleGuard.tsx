"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useSession } from "@/lib/auth-client"

const DASHBOARD_ROLES = ["admin", "student", "tutor"] as const
type DashboardRole = (typeof DASHBOARD_ROLES)[number]

function getRequiredRole(pathname: string): DashboardRole | null {
  const role = pathname.split("/")[2]
  return DASHBOARD_ROLES.includes(role as DashboardRole)
    ? (role as DashboardRole)
    : null
}

export function DashboardRoleGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const role = String(session?.user?.role || "").toLowerCase()
  const requiredRole = getRequiredRole(pathname)
  const authorized =
    Boolean(session) && (!requiredRole || role === requiredRole)

  useEffect(() => {
    if (isPending) return
    if (!session) {
      router.replace("/sign-in")
    } else if (requiredRole && role !== requiredRole) {
      router.replace("/unauthorized")
    }
  }, [isPending, requiredRole, role, router, session])

  if (isPending || !authorized) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">
        <Loader2 className="mr-2 size-4 animate-spin text-indigo-600" />
        Checking dashboard access...
      </div>
    )
  }

  return children
}
