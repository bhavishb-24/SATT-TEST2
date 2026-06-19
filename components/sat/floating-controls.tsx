'use client'

interface Props {
  onPanic: () => void
}

export function FloatingControls({ onPanic }: Props) {
  return (
    <>
      {/* Panic button — bottom right */}
      <button
        type="button"
        onClick={onPanic}
        className="fixed bottom-5 right-4 z-40 flex min-h-[48px] items-center gap-2 rounded-full bg-red-600 px-5 text-sm font-bold text-white shadow-lg shadow-red-600/30 transition-transform active:scale-95"
      >
        <span className="ti ti-alert-triangle text-lg" aria-hidden="true" />
        I’m spiraling
      </button>
    </>
  )
}
