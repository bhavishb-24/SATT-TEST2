'use client'

import { useState, useTransition } from 'react'
import { createInviteCodes, deleteInviteCode, type InviteCode } from '@/app/auth/actions'
import { cn } from '@/lib/utils'

export default function AdminInvitePanel({ initialCodes, adminKey }: { initialCodes: InviteCode[]; adminKey: string }) {
  const [codes, setCodes]       = useState<InviteCode[]>(initialCodes)
  const [count, setCount]       = useState(1)
  const [note, setNote]         = useState('')
  const [copied, setCopied]     = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError]       = useState<string | null>(null)

  function handleCreate() {
    setError(null)
    startTransition(async () => {
      try {
        const newCodes = await createInviteCodes(count, note, adminKey)
        setCodes(prev => [...newCodes, ...prev])
        setNote('')
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to create codes.')
      }
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteInviteCode(id, adminKey)
      setCodes(prev => prev.filter(c => c.id !== id))
    })
  }

  async function copyCode(code: string) {
    try {
      await navigator.clipboard.writeText(code)
    } catch {
      // Fallback for blocked Clipboard API (e.g. cross-origin iframes)
      const el = document.createElement('textarea')
      el.value = code
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const unused = codes.filter(c => !c.used)
  const used   = codes.filter(c => c.used)

  return (
    <div className="flex flex-col gap-6">

        {/* Generate codes */}
        <section className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Generate invite codes
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-foreground">Count</label>
              <input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-24 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label className="text-xs font-medium text-foreground">
                Note <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. for school outreach"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={isPending}
              className={cn(
                'flex min-h-[42px] items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity',
                isPending ? 'cursor-not-allowed opacity-60' : 'hover:opacity-90',
              )}
            >
              <span className="ti ti-plus" aria-hidden="true" />
              {isPending ? 'Generating...' : `Generate ${count > 1 ? `${count} codes` : 'code'}`}
            </button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-destructive">{error}</p>
          )}
        </section>

        {/* Unused codes */}
        <section className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Unused
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
              {unused.length}
            </span>
          </h2>
          {unused.length === 0 ? (
            <p className="text-sm text-muted-foreground">No unused codes. Generate some above.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {unused.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-mono text-sm font-semibold tracking-widest text-foreground">
                      {c.code}
                    </span>
                    {c.note && (
                      <span className="truncate text-xs text-muted-foreground">{c.note}</span>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => copyCode(c.code)}
                      title="Copy code"
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <span className={cn('ti text-sm', copied === c.code ? 'ti-check text-primary' : 'ti-copy')} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Delete code"
                      disabled={isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <span className="ti ti-trash text-sm" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Used codes */}
        {used.length > 0 && (
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Used
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">
                {used.length}
              </span>
            </h2>
            <div className="flex flex-col gap-2">
              {used.map(c => (
                <div
                  key={c.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-4 py-3 opacity-60"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="font-mono text-sm font-semibold tracking-widest text-foreground line-through">
                      {c.code}
                    </span>
                    {c.note && (
                      <span className="truncate text-xs text-muted-foreground">{c.note}</span>
                    )}
                    {c.used_at && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        Used {new Date(c.used_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={isPending}
                    title="Delete code"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <span className="ti ti-trash text-sm" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

    </div>
  )
}
