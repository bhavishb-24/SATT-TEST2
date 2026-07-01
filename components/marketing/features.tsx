import { FadeInOnScroll } from '@/components/marketing/fade-in-on-scroll'

const FEATURES = [
  {
    icon: 'ti-clipboard-heart',
    title: 'Personalized study plan',
    body: 'Tell us your SAT date (up to 12 months away) and your stress level. Your AI coach instantly builds a prioritized, day-by-day plan targeting your exact weak spots.',
  },
  {
    icon: 'ti-pencil',
    title: 'Practice drills',
    body: 'Fresh SAT-style questions for any topic, with instant feedback and clear explanations. Every practice session is calibrated to where you are right now.',
  },
  {
    icon: 'ti-math-function',
    title: 'Formula & rules sheet',
    body: 'Every must-know math formula and grammar rule in one searchable place, beautifully typeset so you can review the night before without hunting through notes.',
  },
  {
    icon: 'ti-cards',
    title: 'Rapid flashcards',
    body: 'Flip through high-yield concepts and vocab. Mark what you know, loop the rest, and build confidence fast, whether you have two weeks or two hours.',
  },
  {
    icon: 'ti-clock-play',
    title: 'Built-in focus timer',
    body: "A pomodoro timer keeps you in deep work with structured breaks, so studying never tips into burnout. Crucial when you're already stressed.",
  },
  {
    icon: 'ti-chart-arcs',
    title: 'Progress tracking',
    body: 'Watch your accuracy climb by section, see topics completed, and track focus time. Proof that every session is making you more ready for test day.',
  },
]

export function Features() {
  return (
    <section id="features">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <FadeInOnScroll>
          <div className="flex flex-col items-center gap-5 text-center">
            <h2 className="text-balance font-serif text-4xl font-normal tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
              A full prep toolkit from signup to test day
            </h2>
            <p className="max-w-2xl text-pretty text-lg leading-relaxed text-slate-700">
              Whether you join a year out or the night before, every tool you need is right here.
              No dashboards to configure, no courses to buy, and no time spent figuring out where
              to start.
            </p>
          </div>
        </FadeInOnScroll>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li
              key={f.title}
              className="flex flex-col gap-4 rounded-2xl p-6 transition-transform hover:-translate-y-1 lg:p-7"
              style={{
                background: 'rgba(255,255,255,0.45)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
                border: '1px solid rgba(255,255,255,0.6)',
              }}
            >
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.7)',
                }}
              >
                <span className={`ti ${f.icon} text-xl text-slate-500`} aria-hidden="true" />
              </span>
              <h3 className="font-serif text-xl font-normal tracking-tight text-slate-800">
                {f.title}
              </h3>
              <p className="text-pretty text-sm leading-relaxed text-slate-600">
                {f.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
