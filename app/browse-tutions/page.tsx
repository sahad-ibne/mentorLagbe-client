import React from "react"
import { getPaginatedTuitions } from "@/lib/api/tutions"
import { TuitionCard, type TuitionItem } from "../components/tuitions/tuition-card"
import { TuitionFilterBar } from "../components/tuitions/tuition-filter-bar"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export const dynamic = "force-dynamic"

const firstParam = (val: string | string[] | undefined) =>
  Array.isArray(val) ? val[0] || "" : val || ""

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
  const requestedPage = Number(firstParam(resolvedParams.page) || "1")
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1

  const paginated = await getPaginatedTuitions({
    page,
    pageSize: 9,
    q,
    subject,
    classLevel,
    mode: mode && mode !== "all" ? mode : "",
  })
  const approvedActiveTuitions = paginated.tutions as TuitionItem[]

  const buildPageUrl = (targetPage: number) => {
    const params = new URLSearchParams()
    if (q) params.set("q", q)
    if (subject) params.set("subject", subject)
    if (classLevel) params.set("classLevel", classLevel)
    if (mode && mode !== "all") params.set("mode", mode)
    if (targetPage > 1) params.set("page", String(targetPage))
    const query = params.toString()
    return query ? `/browse-tutions?${query}` : "/browse-tutions"
  }

  const pageNumbers = Array.from(
    { length: paginated.totalPages },
    (_, index) => index + 1
  ).filter(
    (number) =>
      number === 1 ||
      number === paginated.totalPages ||
      Math.abs(number - paginated.page) <= 1
  )

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
            {paginated.total === 0
              ? 0
              : (paginated.page - 1) * paginated.pageSize + 1}
            -
            {Math.min(paginated.page * paginated.pageSize, paginated.total)}
          </strong>{" "}
          of <strong className="text-slate-900">{paginated.total}</strong>{" "}
          approved active {paginated.total === 1 ? "tuition" : "tuitions"}
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
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {approvedActiveTuitions.map((tuition, idx) => (
              <TuitionCard
                key={tuition._id || tuition.id || `${tuition.title}-${idx}`}
                tuition={tuition}
              />
            ))}
          </div>

          {paginated.totalPages > 1 && (
            <Pagination className="pt-2">
              <PaginationContent>
                <PaginationItem>
                  {paginated.page === 1 ? (
                    <PaginationPrevious
                      aria-disabled="true"
                      tabIndex={-1}
                      className="pointer-events-none opacity-50"
                      href="#"
                    />
                  ) : (
                    <PaginationPrevious href={buildPageUrl(paginated.page - 1)} />
                  )}
                </PaginationItem>

                {pageNumbers.map((number, index) => (
                  <React.Fragment key={number}>
                    {index > 0 && number - pageNumbers[index - 1] > 1 && (
                      <PaginationItem>
                        <span className="px-2 text-slate-400">...</span>
                      </PaginationItem>
                    )}
                    <PaginationItem>
                      <PaginationLink
                        href={buildPageUrl(number)}
                        isActive={number === paginated.page}
                        aria-label={`Go to page ${number}`}
                      >
                        {number}
                      </PaginationLink>
                    </PaginationItem>
                  </React.Fragment>
                ))}

                <PaginationItem>
                  {paginated.page === paginated.totalPages ? (
                    <PaginationNext
                      aria-disabled="true"
                      tabIndex={-1}
                      className="pointer-events-none opacity-50"
                      href="#"
                    />
                  ) : (
                    <PaginationNext href={buildPageUrl(paginated.page + 1)} />
                  )}
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </section>
  )
}

export default BrowseTutionsPage
