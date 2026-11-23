import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Check,
  GraduationCap,
  Laptop,
  Lightbulb,
  Search,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TuitionCard } from "@/app/components/tuitions/tuition-card"
import {
  getFeaturedTuitions,
  getPlatformStats,
  type PlatformStats,
  type TuitionRecord,
} from "@/lib/api/tutions"

export const dynamic = "force-dynamic"

const subjects = [
  {
    name: "Mathematics",
    category: "Math",
    detail: "Build confidence with every problem.",
    icon: Lightbulb,
    tone: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  {
    name: "Physics",
    category: "Physics",
    detail: "Make the ideas behind the formulas click.",
    icon: Sparkles,
    tone: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  {
    name: "Programming",
    category: "Programming",
    detail: "Learn by building real projects.",
    icon: Laptop,
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  {
    name: "IELTS",
    category: "IELTS",
    detail: "Get focused support for your next step.",
    icon: BookOpen,
    tone: "bg-sky-50 text-sky-700 ring-sky-200",
  },
]

const workflow = [
  {
    number: "01",
    title: "Explore approved tuitions",
    description:
      "Compare subjects, schedules, learning modes, and monthly fees in one place.",
    audience: "For students",
    icon: Search,
  },
  {
    number: "02",
    title: "Apply with confidence",
    description:
      "Share your goals and preferred schedule, then follow your application status.",
    audience: "For students",
    icon: ArrowUpRight,
  },
  {
    number: "03",
    title: "Post your tuition",
    description:
      "Tutors add the details of a batch and submit it for a quick admin review.",
    audience: "For tutors",
    icon: GraduationCap,
  },
  {
    number: "04",
    title: "Meet your next learner",
    description:
      "Review applications from your dashboard and respond to students directly.",
    audience: "For tutors",
    icon: Users,
  },
]

const getErrorMessage = (reason: unknown, fallback: string) =>
  reason instanceof Error ? reason.message : fallback

const formatCount = (value: number) => value.toLocaleString("en-US")

export default async function HomePage() {
  const [featuredResult, statsResult] = await Promise.allSettled([
    getFeaturedTuitions(),
    getPlatformStats(),
  ])

  const featuredTuitions: TuitionRecord[] =
    featuredResult.status === "fulfilled"
      ? featuredResult.value
          .filter(
            (tuition) =>
              (tuition.approvalStatus || "").toLowerCase() === "approved" &&
              tuition.isActive === true
          )
          .slice(0, 6)
      : []
  const stats: PlatformStats | null =
    statsResult.status === "fulfilled" ? statsResult.value : null
  const featuredError =
    featuredResult.status === "rejected"
      ? getErrorMessage(
          featuredResult.reason,
          "Featured tuitions could not be loaded."
        )
      : ""
  const statsError =
    statsResult.status === "rejected"
      ? getErrorMessage(
          statsResult.reason,
          "Platform statistics could not be loaded."
        )
      : ""

  const statCards = [
    {
      label: "Verified students",
      value: stats ? formatCount(stats.verifiedStudents) : "—",
      icon: Users,
      color: "text-indigo-600",
    },
    {
      label: "Verified tutors",
      value: stats ? formatCount(stats.verifiedTutors) : "—",
      icon: GraduationCap,
      color: "text-emerald-600",
    },
    {
      label: "Active tuitions",
      value: stats ? formatCount(stats.activeTuitions) : "—",
      icon: BadgeCheck,
      color: "text-amber-600",
    },
  ]

  return (
    <main className="overflow-hidden bg-white">
      <section className="relative isolate bg-[#f7f8ff]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_0%,rgba(99,102,241,0.12),transparent_38%),radial-gradient(ellipse_at_90%_70%,rgba(129,140,248,0.12),transparent_36%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16 lg:px-8 lg:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm">
              <Sparkles className="size-3.5" />A better way to learn and teach
            </div>
            <h1 className="mt-6 text-4xl leading-[1.08] font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-[3.7rem]">
              Find your ideal tutor or{" "}
              <span className="text-indigo-600">mentorship batch.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Explore trusted tuition opportunities, meet the right learners,
              and make your next learning goal feel closer.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/browse-tutions">
                <Button className="h-12 w-full gap-2 rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 sm:w-auto">
                  Browse tuitions
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-full border-slate-300 bg-white/70 px-6 text-sm font-semibold text-slate-700 hover:border-indigo-200 hover:bg-white hover:text-indigo-700 sm:w-auto"
                >
                  I&apos;m a tutor
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <Check className="size-3" />
                </span>
                Admin-reviewed listings
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                  <Check className="size-3" />
                </span>
                Simple application tracking
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -top-5 -right-4 size-28 rounded-full bg-amber-200/50 blur-3xl" />
            <div className="absolute -bottom-5 -left-5 size-32 rounded-full bg-indigo-300/50 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-slate-200 p-2.5 shadow-2xl shadow-indigo-950/15">
              <div className="relative h-[360px] overflow-hidden rounded-[1.55rem] sm:h-[440px]">
                <Image
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=88"
                  alt="Students learning together in a bright study space"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/5 to-transparent" />
                <div className="absolute top-5 left-5 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Your next step starts here
                </div>
                <div className="absolute right-5 bottom-5 left-5 rounded-2xl border border-white/30 bg-white/90 p-4 shadow-xl backdrop-blur-md sm:p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Learn with direction
                      </p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">
                        The right match makes a difference.
                      </p>
                    </div>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <GraduationCap className="size-5" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-xs font-medium text-slate-600">
                      Students and tutors, together
                    </span>
                    <Link
                      href="#how-it-works"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                    >
                      See how it works <ArrowDown className="size-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.18em] text-indigo-600 uppercase">
              Fresh opportunities
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Find a tuition that fits.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              The latest active listings, reviewed before they reach students.
            </p>
          </div>
          <Link
            href="/browse-tutions"
            className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 transition hover:text-indigo-900"
          >
            View all tuitions <ArrowUpRight className="size-4" />
          </Link>
        </div>

        {featuredError ? (
          <div
            role="status"
            className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900"
          >
            Featured tuitions are temporarily unavailable.{" "}
            <Link href="/browse-tutions" className="font-semibold underline">
              Browse all listings
            </Link>
            <span className="sr-only"> {featuredError}</span>
          </div>
        ) : featuredTuitions.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
            <p className="font-semibold text-slate-900">
              No featured tuitions just yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Check back soon or browse all current listings.
            </p>
            <Link href="/browse-tutions" className="mt-4 inline-block">
              <Button variant="outline" className="rounded-full">
                Browse tuitions
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid auto-rows-fr grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTuitions.map((tuition, index) => (
              <TuitionCard
                key={tuition._id || tuition.id || `${tuition.title}-${index}`}
                tuition={tuition}
              />
            ))}
          </div>
        )}
      </section>

      <section
        id="how-it-works"
        className="border-y border-slate-100 bg-slate-50/80"
      >
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-indigo-600 uppercase">
              Simple by design
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              How MentorLagbe works
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-600 sm:text-base">
              A clear path for students looking for support and tutors ready to
              share what they know.
            </p>
            <Link href="/about" className="mt-6 inline-flex">
              <Button
                variant="outline"
                className="gap-2 rounded-full border-slate-300 bg-white"
              >
                Learn more <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {workflow.map((step) => {
              const Icon = step.icon
              return (
                <article
                  key={step.number}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest text-indigo-600">
                      {step.number}
                    </span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-400">
                    {step.audience}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-5 text-slate-600">
                    {step.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col justify-center py-4 lg:min-h-[260px]">
            <div className="max-w-xl text-left">
              <p className="text-xs font-bold tracking-[0.18em] text-indigo-600 uppercase">
                Find your focus
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Great learning starts with the right subject.
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
                Explore popular categories and find a tutor who fits your goals.
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-[620px]">
            {subjects.map((subject) => {
              const Icon = subject.icon
              return (
                <Link
                  key={subject.category}
                  href={`/browse-tutions?subject=${encodeURIComponent(subject.category)}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex size-10 shrink-0 items-center justify-center rounded-xl ring-1 ${subject.tone}`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-slate-900">
                        {subject.name}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {subject.detail}
                      </p>
                    </div>
                    <ArrowUpRight className="size-4 text-slate-300 transition group-hover:text-indigo-600" />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="mt-12 grid gap-3 rounded-3xl border border-indigo-100 bg-indigo-50/60 p-4 sm:grid-cols-3 sm:p-5">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-center gap-4 rounded-2xl bg-white/80 px-5 py-4"
              >
                <div
                  className={`flex size-11 items-center justify-center rounded-xl bg-slate-50 ${stat.color}`}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    {stat.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
        {statsError && (
          <p role="status" className="mt-3 text-center text-xs text-slate-500">
            Live community statistics are temporarily unavailable.
            <span className="sr-only"> {statsError}</span>
          </p>
        )}
      </section>

      <section className="bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.18em] text-indigo-300 uppercase">
                Plans that grow with you
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Start free. Go further with Pro.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Choose the extra room you need—as a student saving opportunities
                or a tutor sharing more batches.
              </p>
            </div>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-white"
            >
              Compare plan details <ArrowUpRight className="size-4" />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Free</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Everything you need to get started.
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
                  $0
                </span>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <p className="flex items-center gap-2 text-sm text-slate-200">
                  <Check className="size-4 text-emerald-400" />
                  Students: 5 bookmarks
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-200">
                  <Check className="size-4 text-emerald-400" />
                  Tutors: 2 tuition posts
                </p>
              </div>
              <Link href="/sign-up" className="mt-7 inline-flex">
                <Button
                  variant="outline"
                  className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
                >
                  Get started
                </Button>
              </Link>
            </article>

            <article className="relative overflow-hidden rounded-3xl border border-indigo-400/40 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 shadow-xl shadow-indigo-950/20 sm:p-8">
              <div className="absolute -top-16 -right-10 size-48 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Pro</p>
                  <p className="mt-1 text-sm text-indigo-100">
                    More space for your next big step.
                  </p>
                </div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  Flexible
                </span>
              </div>
              <div className="relative mt-6 grid gap-3 sm:grid-cols-2">
                <p className="flex items-center gap-2 text-sm text-white">
                  <Check className="size-4 text-emerald-200" />
                  Students: unlimited bookmarks
                </p>
                <p className="flex items-center gap-2 text-sm text-white">
                  <Check className="size-4 text-emerald-200" />
                  Tutors: unlimited posts
                </p>
              </div>
              <Link href="/pricing" className="relative mt-7 inline-flex">
                <Button className="gap-2 rounded-full bg-white text-indigo-700 hover:bg-indigo-50">
                  Explore Pro
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Wallet className="size-5" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
          Ready to make learning happen?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">
          Start browsing opportunities or create your account and take the next
          step with MentorLagbe.
        </p>
        <Link href="/browse-tutions" className="mt-6 inline-flex">
          <Button className="h-11 gap-2 rounded-full bg-indigo-600 px-6 text-white hover:bg-indigo-700">
            Explore tuitions <ArrowRight className="size-4" />
          </Button>
        </Link>
      </section>
    </main>
  )
}
