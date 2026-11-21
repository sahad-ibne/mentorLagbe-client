export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold text-indigo-600">How it works</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Learn better with the right mentor
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          MentorLagbe helps students discover tuition opportunities and helps
          tutors share classes, study materials, and updates with learners.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {[
            ["Browse", "Search approved tuition listings by subject and mode."],
            ["Connect", "Choose a tutor and apply to a matching class."],
            ["Learn", "Use your mentor resources and track progress."],
          ].map(([title, description], index) => (
            <section
              key={title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {index + 1}
              </span>
              <h2 className="mt-4 font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
