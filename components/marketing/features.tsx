import { FadeInOnScroll } from '@/components/marketing/fade-in-on-scroll'

const FEATURES = [
  {
    icon: 'ti-clipboard-heart',
    title: 'Personalized study plan',
    body: 'Tell us your SAT date (up to 12 months away) and your stress level — your AI coach instantly builds a prioritized, day-by-day plan targeting your exact weak spots.',
  },
  {
    icon: 'ti-pencil',
    title: 'Practice drills',
    body: 'Fresh SAT-style questions for any topic, with instant feedback and clear explanations. Every practice session is calibrated to where you are right now.',
  },
  {
    icon: 'ti-math-function',
    title: 'Formula & rules sheet',
    body: 'Every must-know math formula and grammar rule in one searchable place — beautifully typeset so you can review the night before without hunting through notes.',
  },
  {
    icon: 'ti-cards',
    title: 'Rapid flashcards',
    body: 'Flip through high-yield concepts and vocab. Mark what you know, loop the rest, and build confidence fast — whether you have two weeks or two hours.',
  },
  {
    icon: 'ti-clock-play',
    title: 'Built-in focus timer',
    body: 'A pomodoro timer keeps you in deep work with structured breaks, so studying never tips into burnout — crucial when you\'re already stressed.',
  },
  {
    icon: 'ti-chart-arcs',
    title: 'Progress tracking',
    body: 'Watch your accuracy climb by section, see topics completed, and track focus time. Proof that every session is making you more ready for test day.',
  },
]

export function Features() {
  return (
    <section id="features" className="border-t border-border bg-card/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <FadeInOnScroll>
          <div className="flex max-w-2xl flex-col gap-4">
            <span className="text-sm font-bold uppercase tracking-wider text-primary">
              Everything in one place
            </span>
            <h2 className="text-balance font-serif text-4xl font-normal tracking-tight sm:text-5xl">
              A full prep toolkit from signup to test day
            </h2>
            <p className="text-pretty text-lg leading-relaxed text-muted-foreground">
              Whether you join a year out or the night before, every tool you need is right here —
              no dashboards to configure, no courses to buy, and no stress trying to figure out
              where to start.
            </p>
          </div>
        </FadeInOnScroll>

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
