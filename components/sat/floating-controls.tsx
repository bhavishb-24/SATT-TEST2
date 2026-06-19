'use client'

interface Props {
  voiceSupported: boolean
  voiceEnabled: boolean
  listening: boolean
  onToggleVoice: () => void
  onPanic: () => void
}

export function FloatingControls({
  voiceSupported,
  voiceEnabled,
  listening,
  onToggleVoice,
  onPanic,
}: Props) {
  return (
    <>
      {/* Voice toggle — top right */}
      <div className="fixed right-4 top-3 z-40 flex flex-col items-end gap-1">
        {voiceSupported ? (
          <button
            type="button"
            onClick={onToggleVoice}
            aria-pressed={voiceEnabled}
            aria-label="Toggle voice coach"
            className={`flex h-11 w-11 items-center justify-center rounded-full border shadow-sm transition-colors ${
              voiceEnabled
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-foreground'
            }`}
          >
            <span
              className={`ti ${voiceEnabled ? 'ti-microphone' : 'ti-microphone-off'} text-lg`}
              aria-hidden="true"
            />
          </button>
        ) : (
          <span className="rounded-full border border-border bg-card px-3 py-1 text-[10px] text-muted-foreground">
            Voice works in Chrome and Safari
          </span>
        )}
        {voiceEnabled && listening && (
          <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            Listening...
          </span>
        )}
      </div>

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
