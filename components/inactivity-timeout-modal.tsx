'use client'

interface InactivityTimeoutModalProps {
  isOpen: boolean
  onDismiss: () => void
  onLogout: () => void
}

export function InactivityTimeoutModal({
  isOpen,
  onDismiss,
  onLogout,
}: InactivityTimeoutModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <i className="ti ti-alert-triangle text-amber-600" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Session inactive</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              You&apos;ve been inactive for 5 minutes. Stay logged in or you&apos;ll be signed out
              for security.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Sign out
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Stay logged in
          </button>
        </div>
      </div>
    </div>
  )
}
