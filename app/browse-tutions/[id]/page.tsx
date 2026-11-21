import Image from "next/image"
import { notFound } from "next/navigation"
import { getTutions, type TuitionRecord } from "@/lib/api/tutions"

const DEFAULT_BANNER =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80"

export default async function TuitionDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const rawData: unknown = await getTutions()
  const tuitions: TuitionRecord[] = Array.isArray(rawData)
    ? (rawData as TuitionRecord[])
    : rawData &&
        typeof rawData === "object" &&
        "tutions" in rawData &&
        Array.isArray((rawData as { tutions?: unknown }).tutions)
      ? ((rawData as { tutions: TuitionRecord[] }).tutions)
      : []

  const tuition = tuitions.find((item) => (item._id || item.id) === id)
  if (!tuition) notFound()

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="relative h-56 w-full sm:h-72">
          <Image
            src={tuition.bannerImage?.trim() || DEFAULT_BANNER}
            alt={tuition.title}
            fill
            sizes="(max-width: 768px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          <p className="text-sm font-semibold text-indigo-600">
            {tuition.subject} · {tuition.classLevel}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            {tuition.title}
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            {tuition.description}
          </p>
          <dl className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">Monthly fee</dt>
              <dd className="mt-1 font-bold text-slate-900">
                ৳{Number(tuition.monthlyFee || 0).toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Schedule</dt>
              <dd className="mt-1 font-bold text-slate-900">
                {tuition.daysPerWeek} days/week
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Location</dt>
              <dd className="mt-1 font-bold text-slate-900">
                {tuition.location}
              </dd>
            </div>
          </dl>
        </div>
      </article>
    </main>
  )
}