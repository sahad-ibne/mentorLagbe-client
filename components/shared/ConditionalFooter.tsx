"use client"

import { usePathname } from "next/navigation"
import FooterPage from "@/components/shared/Footer"

export default function ConditionalFooter() {
  const pathname = usePathname()

  if (pathname.startsWith("/dashboard")) return null
  return <FooterPage />
}
