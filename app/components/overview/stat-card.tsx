import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  badgeText?: string
  accent?: "indigo" | "emerald" | "amber" | "violet"
}

const ACCENT_STYLES = {
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200/70",
    badge: "bg-indigo-50 text-indigo-700",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/70",
    badge: "bg-emerald-50 text-emerald-700",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 ring-1 ring-amber-200/70",
    badge: "bg-amber-50 text-amber-700",
  },
  violet: {
    iconBg: "bg-violet-50 text-violet-600 ring-1 ring-violet-200/70",
    badge: "bg-violet-50 text-violet-700",
  },
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badgeText,
  accent = "indigo",
}: StatCardProps) {
  const styles = ACCENT_STYLES[accent]

  return (
    <Card className="rounded-2xl border-slate-200/90 bg-white shadow-2xs transition hover:border-indigo-200 hover:shadow-xs">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
              {title}
            </p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {value}
            </p>
          </div>

          <div className={`rounded-xl p-2.5 ${styles.iconBg}`}>
            <Icon className="size-5" />
          </div>
        </div>

        {(subtitle || badgeText) && (
          <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            {subtitle && (
              <span className="truncate text-xs text-slate-500">
                {subtitle}
              </span>
            )}
            {badgeText && (
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${styles.badge}`}
              >
                {badgeText}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
