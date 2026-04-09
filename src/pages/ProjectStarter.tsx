const starterAreas = [
  "Define domain models in src/types",
  "Create API modules in src/api",
  "Add data helpers in src/dataHelper",
  "Build pages and shared components",
  "Wire state in src/store and src/hooks",
];

export default function ProjectStarterPage() {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16">
        <p className="mb-3 inline-flex w-fit rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
          Project Starter
        </p>

        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Source cleaned for a new project
        </h1>

        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
          The current app shell is reset to a safe starter state. Existing
          folders are preserved so you can rebuild features with the same
          structure.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-lg font-semibold">Suggested next setup</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-700 sm:text-base">
            {starterAreas.map((area) => (
              <li key={area} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className="mt-1 inline-block h-2 w-2 rounded-full bg-sky-600"
                />
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
