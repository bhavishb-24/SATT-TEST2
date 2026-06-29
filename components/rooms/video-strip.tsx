'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { RoomParticipant } from '@/lib/room-types'

interface Props {
  participants: RoomParticipant[]
  muted: boolean
  camOff: boolean
  /** Called when the user wants to toggle visibility of the strip */
  onToggle: () => void
  visible: boolean
}

/** Renders the local webcam stream into a <video> element. */
function LocalVideo({ muted: audioMuted, camOff }: { muted: boolean; camOff: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const startCamera = useCallback(async () => {
    if (camOff) return
    setLoading(true)
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: 'user' },
        audio: false, // audio handled by WebRTC in a real backend — muted flag controls it
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Camera unavailable'
      setError(msg.includes('Permission') || msg.includes('NotAllowed')
        ? 'Camera permission denied'
        : 'Camera unavailable')
    } finally {
      setLoading(false)
    }
  }, [camOff])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }, [])

  useEffect(() => {
    if (!camOff) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [camOff, startCamera, stopCamera])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl bg-muted">
      {/* Video element — hidden when cam is off or there's an error */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          'h-full w-full object-cover',
          (camOff || error) ? 'hidden' : 'block',
        )}
      />

      {/* Cam off / loading / error overlay */}
      {(camOff || error || loading) && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1">
          {loading && !camOff && (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          )}
          {!loading && (
            <>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground">
                Y
              </div>
              {error && (
                <p className="mt-1 max-w-[100px] text-center text-[9px] text-muted-foreground">{error}</p>
              )}
            </>
          )}
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
        <span className="rounded-lg bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          You {audioMuted ? '(muted)' : ''}
        </span>
        {camOff && (
          <span className="rounded-lg bg-black/50 px-1.5 py-0.5 text-[10px] text-white/70 backdrop-blur-sm">
            Cam off
          </span>
        )}
      </div>
    </div>
  )
}

/** Placeholder tile for a remote participant (no stream without a real backend). */
function RemoteTile({ participant }: { participant: RoomParticipant }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-muted">
      <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white', participant.color)}>
        {participant.initial}
      </div>
      <div className="absolute bottom-1 left-1 right-1 flex items-center justify-between">
        <span className="rounded-lg bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm truncate">
          {participant.name}
          {participant.speaking && (
            <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 align-middle" />
          )}
        </span>
      </div>
    </div>
  )
}

export function VideoStrip({ participants, muted, camOff, onToggle, visible }: Props) {
  const others = participants.filter((p) => p.id !== 'ai' && p.id !== 'me')

  return (
    <div
      className={cn(
        'shrink-0 border-b border-border bg-card/80 transition-all duration-300 overflow-hidden',
        visible ? 'h-36' : 'h-0',
      )}
      aria-hidden={!visible}
    >
      <div className="flex h-full items-center gap-2 overflow-x-auto px-4 py-2">

        {/* Local tile */}
        <div className="h-full w-44 shrink-0">
          <LocalVideo muted={muted} camOff={camOff} />
        </div>

        {/* Remote participant tiles */}
        {others.map((p) => (
          <div key={p.id} className="h-full w-44 shrink-0">
            <RemoteTile participant={p} />
          </div>
        ))}

        {/* Empty state when alone */}
        {others.length === 0 && (
          <div className="flex h-full flex-1 items-center justify-center">
            <p className="text-xs text-muted-foreground">
              No one else is here yet. Share the room code to invite friends.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
