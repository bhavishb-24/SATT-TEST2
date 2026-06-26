export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md rounded-3xl bg-card p-10 text-center shadow-sm">
        <div className="mb-4 flex justify-center text-4xl text-destructive">
          <i className="ti ti-alert-circle" />
        </div>
        <h1 className="font-serif text-2xl font-semibold text-foreground">
          Authentication Error
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong during sign-in. The link may have expired or already been used.
        </p>
        <a
          href="/auth/login"
          className="mt-6 inline-block rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Back to Sign In
        </a>
      </div>
    </div>
  )
}
