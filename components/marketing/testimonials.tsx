import { Glass } from '@/components/ui/liquid-glass'

const QUOTES = [
  {
    quote:
      'I opened it at 11 PM completely spiraling. Twenty minutes later I had an actual plan and stopped crying. Walked in the next morning calm.',
    name: 'Maya R.',
    detail: 'Junior, first SAT',
  },
  {
    quote:
      'The panic button is unreal. It talked me through breathing and reminded me what I already knew. I have never seen a study app do that.',
    name: 'Devon T.',
    detail: 'Senior, retake',
  },
  {
    quote:
      'It told me to stop grinding and go to sleep at a specific time. That one piece of advice probably helped more than another hour of cramming.',
    name: 'Priya K.',
    detail: 'Junior',
  },
]

export function Testimonials() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-6xl px-5 py-20 lg:px-8 lg:py-28">
        <div className="flex max-w-2xl flex-col gap-4">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">
            From the night before
          </span>
          <h2 className="text-balance font-serif text-4xl font-normal tracking-tight sm:text-5xl">
            Calm beats cramming
          </h2>
        </div>

        <ul className="mt-12 grid gap-5 md:grid-cols-3">
          {QUOTES.map((q) => (
            <Glass
              key={q.name}
              as="li"
              className="flex flex-col gap-4 rounded-2xl p-6 lg:p-7 transition-transform hover:-translate-y-1"
            >
              <span className="ti ti-quote text-3xl text-primary/30" aria-hidden="true" />
              <p className="flex-1 text-pretty leading-relaxed text-foreground">{q.quote}</p>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{q.name}</span>
                <span className="text-sm text-muted-foreground">{q.detail}</span>
              </div>
            </Glass>
          ))}
        </ul>
      </div>
    </section>
  )
}
