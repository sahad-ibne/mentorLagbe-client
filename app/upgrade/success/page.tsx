import { UpgradeSuccess } from "@/app/components/upgrade-success"

export default async function UpgradeSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id: sessionId } = await searchParams

  if (!sessionId) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Missing checkout session
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We could not verify a payment without a checkout session.
        </p>
      </main>
    )
  }

  return <UpgradeSuccess sessionId={sessionId} />
}
