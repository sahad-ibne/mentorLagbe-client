"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { GraduationCap, LogOut } from "lucide-react"
import { signOut, useSession } from "@/lib/auth-client"
import {
  getDashboardNavigation,
  getRoleLabel,
  normalizeDashboardRole,
  profileMenuItem,
  type DashboardMenuItem,
} from "./dashboard-config"

function NavigationItems({
  items,
  activeItem,
  onNavigate,
}: {
  items: DashboardMenuItem[]
  activeItem: string
  onNavigate: (id: string) => void
}) {
  return (
    <SidebarMenu>
      {items.map((item) => {
        const Icon = item.icon
        return (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton
              render={<Link href={item.href} />}
              isActive={activeItem === item.id}
              onClick={() => onNavigate(item.id)}
              className="h-10 rounded-xl px-3 text-[13px] font-medium text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700 data-[active=true]:bg-indigo-50 data-[active=true]:text-indigo-700"
            >
              <Icon className="size-[17px]" />
              <span>{item.name}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

export function DashboardSidebar() {
  const { data: session, isPending, refetch } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const user = session?.user as
    | {
        name?: string | null
        email?: string | null
        role?: string | null
        plan?: string | null
        image?: string | null
      }
    | undefined
  const routeRole = pathname.split("/")[2]
  const role = isPending
    ? normalizeDashboardRole(routeRole)
    : normalizeDashboardRole(user?.role)
  const menuItems = getDashboardNavigation(role)
  const [activeItem, setActiveItem] = useState("overview")

  useEffect(() => {
    const updateActiveItem = () => {
      const currentHash = window.location.hash.slice(1)
      const currentItem = menuItems.find((item) => item.href === pathname)
      setActiveItem(currentItem?.id || currentHash || "overview")
    }
    updateActiveItem()
    window.addEventListener("hashchange", updateActiveItem)
    return () => window.removeEventListener("hashchange", updateActiveItem)
  }, [menuItems, pathname])

  const onNavigate = (id: string) => setActiveItem(id)
  const initials = user?.name?.trim().charAt(0).toUpperCase() || "U"

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: async () => {
          await refetch?.()
          router.push("/sign-in")
          router.refresh()
        },
      },
    })
  }

  return (
    <Sidebar
      className="top-0! h-svh border-r border-slate-200 bg-white"
      collapsible="offcanvas"
    >
      <SidebarHeader className="gap-0 border-b border-slate-100 p-0">
        <Link
          href="/"
          className="flex h-[4.25rem] items-center gap-2.5 px-5"
          aria-label="MentorLagbe home"
        >
          <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-900/15">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-slate-900">
            Mentor<span className="text-indigo-600">Lagbe</span>
          </span>
        </Link>
        <div className="flex items-center gap-3 border-t border-slate-100 px-5 py-4">
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
            {user?.image ? (
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-cover bg-center"
                style={{
                  backgroundImage: `url("${user.image.replaceAll('"', "%22")}")`,
                }}
              />
            ) : (
              initials
            )}
            <span className="absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-slate-800">
              {user?.name || "Welcome"}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user?.email || "Your learning space"}
            </p>
            <span className="mt-1 inline-flex rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-indigo-700">
              {getRoleLabel(role)}
              {user?.plan?.toLowerCase() === "pro" ? " · PRO" : ""}
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-3 py-4">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400">
            MAIN MENU
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationItems
              items={menuItems}
              activeItem={activeItem}
              onNavigate={onNavigate}
            />
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-5 p-0">
          <SidebarGroupLabel className="h-7 px-2 text-[10px] font-semibold tracking-[0.14em] text-slate-400">
            PREFERENCES
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <NavigationItems
              items={[profileMenuItem]}
              activeItem={activeItem}
              onNavigate={onNavigate}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleSignOut}
          className="h-10 w-full justify-start gap-3 rounded-xl px-3 text-[13px] font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700"
        >
          <LogOut className="size-[17px]" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
