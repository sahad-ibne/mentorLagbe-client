import React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

import { DashboardSidebar } from "../components/DashboardSidebar"
import { DashboardRoleGuard } from "../components/DashboardRoleGuard"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <DashboardRoleGuard>
      <SidebarProvider defaultOpen className="min-h-svh bg-[#f8f9fc]">
        <DashboardSidebar />
        <main className="min-h-svh min-w-0 flex-1 bg-[#f8f9fc]">
          <SidebarTrigger className="m-4 flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm md:hidden" />
          {children}
        </main>
      </SidebarProvider>
    </DashboardRoleGuard>
  )
}

export default DashboardLayout
