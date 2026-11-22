import {
  Bookmark,
  BookOpen,
  FileText,
  LayoutDashboard,
  Plus,
  Settings,
  Users,
  Wallet,
  UserRoundCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export type DashboardRole = "admin" | "student" | "tutor"

export type DashboardMenuItem = {
  id: string
  name: string
  href: string
  icon: LucideIcon
}

const roleNavigation: Record<DashboardRole, DashboardMenuItem[]> = {
  admin: [
    {
      id: "overview",
      name: "Overview",
      href: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      id: "users",
      name: "Users",
      href: "/dashboard/admin/users",
      icon: Users,
    },
    {
      id: "tuitions",
      name: "Tuitions",
      href: "/dashboard/admin/tuitions",
      icon: BookOpen,
    },
    {
      id: "transactions",
      name: "Transactions",
      href: "/dashboard/admin/transactions",
      icon: Wallet,
    },
  ],
  student: [
    {
      id: "overview",
      name: "Overview",
      href: "/dashboard/student",
      icon: LayoutDashboard,
    },
    {
      id: "applications",
      name: "My Applications",
      href: "/dashboard/student/my-application",
      icon: FileText,
    },
    {
      id: "saved-tuitions",
      name: "Saved Tuitions",
      href: "/dashboard/student/saved-tution",
      icon: Bookmark,
    },
  ],
  tutor: [
    {
      id: "overview",
      name: "Overview",
      href: "/dashboard/tutor",
      icon: LayoutDashboard,
    },
    {
      id: "post-tuition",
      name: "Post Tuition",
      href: "/dashboard/tutor/tution/new",
      icon: Plus,
    },
    {
      id: "my-tuitions",
      name: "My Tuitions",
      href: "/dashboard/tutor/tution",
      icon: BookOpen,
    },
    {
      id: "applicants",
      name: "Applicants",
      href: "/dashboard/tutor/applications",
      icon: UserRoundCheck,
    },
  ],
}

export function getDashboardNavigation(role: DashboardRole) {
  return roleNavigation[role]
}

export function normalizeDashboardRole(role: unknown): DashboardRole {
  if (typeof role === "string") {
    const normalizedRole = role.toLowerCase()
    if (normalizedRole === "admin" || normalizedRole === "tutor") {
      return normalizedRole
    }
  }
  return "student"
}

export function getRoleLabel(role: DashboardRole) {
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export const profileMenuItem: DashboardMenuItem = {
  id: "profile",
  name: "Update Profile",
  href: "/dashboard/profile",
  icon: Settings,
}
