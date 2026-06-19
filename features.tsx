const FEATURES = [
  {
    icon: 'ti-clipboard-list',
    title: 'AI emergency plan',
    body: 'Answer a few questions and get a calm, prioritized, hour-by-hour plan built around your exact weak areas and the time you have left.',
  },
  {
    icon: 'ti-pencil',
    title: 'Practice drills',
    body: 'Fresh SAT-style questions for any topic, with instant feedback and clear explanations so you actually learn from every miss.',
  },
  {
    icon: 'ti-math-function',
    title: 'Formula & rules sheet',
    body: 'Every must-know math formula and grammar rule in one searchable place — beautifully typeset and ready for last-minute review.',
  },
  {
    icon: 'ti-cards',
    title: 'Rapid flashcards',
    body: 'Flip through high-yield concepts and vocab. Mark what you know, loop the rest, and build confidence fast.',
  },
  {
    icon: 'ti-clock-play',
    title: 'Focus timer',
    body: 'A built-in pomodoro keeps you in deep work with structured breaks, so cramming never tips into burnout.',
  },
  {
    icon: 'ti-chart-arcs',
    title: 'Progress tracking',
    body: 'See accuracy by section, topics completed, and focus time at a glance — proof that you are getting more ready by the minute.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex max-w-2xl flex-col gap-4">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            Everything in one place
          </span>
          <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            A full prep toolkit, opened the moment you need it most
          </h2>
          <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
            No dashboards to configure, no courses to buy. Just the focused tools that move your
            score tonight — and a coach that keeps you calm while you use them.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-lg hover:shadow-foreground/5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <span className={`${f.icon} ti text-2xl`} aria-hidden="true" />
              </span>
              <h3 className="text-lg font-bold tracking-tight">{f.title}</h3>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
