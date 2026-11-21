import React from "react"
import { getTutions } from "@/lib/api/tutions"
import {
  TuitionCard,
  type TuitionItem,
} from "../components/tuitions/tuition-card"
import { TuitionFilterBar } from "../components/tuitions/tuition-filter-bar"

export const dynamic = "force-dynamic"

const firstParam = (val: string | string[] | undefined) =>
  Array.isArray(val) ? val[0] || "" : val || ""

const isApprovedAndActive = (item: TuitionItem) => {
  const approved = (item.approvalStatus || "").toLowerCase() === "approved"
  const active =
    typeof item.isActive === "boolean"
      ? item.isActive
      : (item.status || "active").toLowerCase() === "active"
  return approved && active
}

const BrowseTutionsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const resolvedParams = await searchParams

  const q = firstParam(resolvedParams.q).trim()
  const subject = firstParam(resolvedParams.subject).trim()
  const classLevel = firstParam(resolvedParams.classLevel).trim()
  const mode = firstParam(resolvedParams.mode).trim()

  const apiParams = new URLSearchParams()
  if (subject) apiParams.set("subject", subject)
  if (classLevel) apiParams.set("classLevel", classLevel)
  if (mode && mode !== "all") apiParams.set("mode", mode)

  const rawData: unknown = await getTutions(apiParams.toString())

  const list: TuitionItem[] = Array.isArray(rawData)
    ? (rawData as TuitionItem[])
    : rawData &&
        typeof rawData === "object" &&
        "tutions" in rawData &&
        Array.isArray((rawData as { tutions?: unknown }).tutions)
      ? (rawData as { tutions: TuitionItem[] }).tutions
      : []

  const qLower = q.toLowerCase()
  const approvedActiveTuitions = list.filter((item) => {
    if (!isApprovedAndActive(item)) return false
    if (!qLower) return true

    return (
      item.title?.toLowerCase().includes(qLower) ||
      item.location?.toLowerCase().includes(qLower) ||
      item.subject?.toLowerCase().includes(qLower) ||
      item.tutorName?.toLowerCase().includes(qLower)
    )
  })

  return (
    <section className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Browse Tuitions
        </h1>
        <p className="text-sm text-slate-500">
          Explore admin-approved active tuition listings and filter by subject,
          class level, or mode.
        </p>
      </div>

      <TuitionFilterBar
        initialSearch={q}
        initialSubject={subject}
        initialClassLevel={classLevel}
        initialMode={mode || "all"}
      />

      <div className="flex items-center justify-between text-xs font-medium text-slate-500 sm:text-sm">
        <span>
          Showing{" "}
          <strong className="text-slate-900">
            {approvedActiveTuitions.length}
          </strong>{" "}
          approved active{" "}
          {approvedActiveTuitions.length === 1 ? "tuition" : "tuitions"}
        </span>
      </div>

      {approvedActiveTuitions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-base font-bold text-slate-900">
            No matching tuitions found
          </h2>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Try clearing or changing your search keyword and filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {approvedActiveTuitions.map((tuition, idx) => (
            <TuitionCard
              key={tuition._id || tuition.id || `${tuition.title}-${idx}`}
              tuition={tuition}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default BrowseTutionsPage
